/**
 * Main game controller that manages all game systems and the game loop
 * @class Game
 */
class Game {
    constructor() {
        try {
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error('Game canvas element not found');
            }
            
            this.renderer = new Renderer(this.canvas);
            this.particles = new ParticleSystem(this.renderer);
        
        this.gameState = new GameState(this.renderer);
        this.combat = new CombatSystem(this.gameState);
        // Upgrade system removed - now using passive skill progression
        this.modal = new ModalManager();
        
        // Initialize event system and narrative UI
        this.events = GameEvents; // Use global event bus
        this.narrativeUI = new NarrativeUI(this.events);
        this.cutsceneManager = new CutsceneManager(this.events, this.narrativeUI);
        this.campaignSystem = new CampaignSystem(this.events, this.gameState);
        this.menuSystem = new MenuSystem(this);
        
        // Expose cutscene manager for debugging
        window.cutsceneManager = this.cutsceneManager;
        
        this.animationFrame = null;
        this.lastEnergyRegen = Date.now();
        this.lastHpRegen = Date.now();
        this.lastCombatTime = Date.now();
        
        // Initialize unified auto-completion system
        this.autoSystem = null; // Will be initialized by the auto system loader
        
        // Track resources for cleanup
        this.eventListeners = [];
        this.timers = [];
        this.intervals = [];
        
        this.inputEnabled = true;
        this.gameOver = false;
        this.gameVictory = false;
        this.lastInputTime = 0;
        this.inputThrottle = CONFIG.GAME.INPUT_THROTTLE;
        this.gameStartTime = Date.now();
        
        // Debug mode
        this.debug = CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS;
        this.debugInfo = {
            fps: 0,
            frameTime: 0,
            lastFrameTime: performance.now(),
            frameCount: 0
        };
        
        this.setupGameEventListeners();
        this.setupVisibilityHandling();
        } catch (error) {
            console.error('Game constructor failed:', error);
            this.showErrorMessage('Failed to initialize game. Please refresh the page.');
            throw error;
        }
    }
    
    /**
     * Helper methods for tracked resource management
     */
    addEventListenerTracked(element, event, listener, options = {}) {
        element.addEventListener(event, listener, options);
        this.eventListeners.push({ element, event, listener, options });
    }
    
    addTimeoutTracked(callback, delay) {
        const timeoutId = setTimeout(callback, delay);
        this.timers.push(timeoutId);
        return timeoutId;
    }
    
    addIntervalTracked(callback, delay) {
        const intervalId = setInterval(callback, delay);
        this.intervals.push(intervalId);
        return intervalId;
    }
    
    /**
     * Clean up all tracked resources
     */
    destroy() {
        // Cancel animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, listener, options }) => {
            element.removeEventListener(event, listener, options);
        });
        this.eventListeners = [];
        
        // Clear all timers
        this.timers.forEach(clearTimeout);
        this.timers = [];
        
        // Clear all intervals
        this.intervals.forEach(clearInterval);
        this.intervals = [];
        
        // Clean up auto system
        if (this.autoSystem) {
            this.autoSystem.destroy();
        }
        
        // Clean up other systems
        if (this.particles) {
            this.particles.clear();
        }
        
        console.log('Game resources cleaned up');
    }
    
    /**
     * Initialize the game systems and start the game loop
     * Called when the page loads
     */
    init() {
        try {
            // Show menu system first - game initialization happens when campaign starts
            this.startGameLoop();
            this.startEnergyRegeneration();
            this.startHealthRegeneration();
            
            // Don't initialize game state immediately - let menu system handle it
            // Menu will call initGameState() when campaign starts
        } catch (error) {
            console.error('Game initialization failed:', error);
            this.showErrorMessage('Failed to start game. Please refresh the page.');
            throw error;
        }
    }
    
    /**
     * Initialize game state when starting a campaign
     * Called by menu system when user starts a new game
     */
    initGameState() {
        try {
            // Called by menu system when starting campaign
            this.gameState.init();
            
            // Ensure player's skill system is initialized
            if (this.gameState.player && !this.gameState.player.skillSystem) {
                setTimeout(() => {
                    this.gameState.player.initializeSkillComponents();
                    this.updateUI(); // Force UI update after skill system init
                }, 200);
            }
            
            this.setupEventListeners();
            this.setupDebugCommands();
            this.updateUI();
            
            this.gameState.addMessage('Welcome to Memory Cavern!', 'level-msg');
            this.gameState.addMessage('Use arrow keys or WASD to move.', '');
            
            // Emit game start event
            this.events.emit('game.started', {
                player: this.gameState.player,
                floor: this.gameState.floor
            });
            
            // Emit floor entered event
            this.events.emit('floor.entered', {
                floor: this.gameState.floor,
                player: this.gameState.player
            });
            
            // Force initial render after game state initialization
            this.render();
        } catch (error) {
            console.error('Game state initialization failed:', error);
            this.showErrorMessage('Failed to start campaign. Please try again or refresh the page.');
            throw error;
        }
    }
    
    setupVisibilityHandling() {
        // Pause auto-explore when tab becomes inactive (QoL improvement)
        this.addEventListenerTracked(document, 'visibilitychange', () => {
            if (document.hidden && this.autoSystem && this.autoSystem.getSystemStatus().explorerManager.enabled) {
                this.autoSystem.pauseAutomation();
                this.gameState.addMessage('Auto-explore paused (tab inactive)', 'level-msg');
            }
        });
    }
    
    setupGameEventListeners() {
        // Listen for player level up (this one is unique to Game class)
        this.events.on('player.levelup', (eventData) => {
            this.events.emit('narrative.triggered', {
                narrative: `Experience transforms you! You feel the power of level ${eventData.data.newLevel} coursing through your being!`,
                importance: 'high'
            });
        });
        
        // Listen for campaign victory
        this.events.on('campaign.victory', (eventData) => {
            this.handleVictory(eventData.data);
        });
        
        // Add keyboard shortcut for lore viewing
        this.addEventListenerTracked(document, 'keydown', (e) => {
            if (e.key === 'l' || e.key === 'L') {
                if (!this.modal.isShowing()) {
                    this.showLoreInConsole();
                }
            }
        });
    }
    
    setupEventListeners() {
        this.addEventListenerTracked(document, 'keydown', (e) => this.handleInput(e));
        
        // Prevent arrow key scrolling
        this.addEventListenerTracked(window, 'keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // Add touch support to UI buttons
        this.setupTouchSupport();
    }
    
    setupTouchSupport() {
        // Find all clickable buttons and add touch support
        const buttons = document.querySelectorAll('.compact-button');
        
        buttons.forEach(button => {
            // Add touch event handlers
            this.addEventListenerTracked(button, 'touchstart', (e) => {
                e.preventDefault();
                button.style.backgroundColor = '#555555';
            });
            
            this.addEventListenerTracked(button, 'touchend', (e) => {
                e.preventDefault();
                button.style.backgroundColor = '';
                
                // Trigger the click event
                if (button.onclick) {
                    button.onclick();
                }
            });
            
            this.addEventListenerTracked(button, 'touchcancel', (e) => {
                e.preventDefault();
                button.style.backgroundColor = '';
            });
            
            // Enhanced hover effects for mouse users
            this.addEventListenerTracked(button, 'mousedown', () => {
                button.style.backgroundColor = '#555555';
            });
            
            this.addEventListenerTracked(button, 'mouseup', () => {
                button.style.backgroundColor = '';
            });
            
            this.addEventListenerTracked(button, 'mouseleave', () => {
                button.style.backgroundColor = '';
            });
        });
        
        // Add touch support to canvas for mobile gameplay
        this.setupCanvasTouchControls();
    }
    
    setupCanvasTouchControls() {
        let touchStartX, touchStartY, touchStartTime;
        const canvas = this.canvas;
        
        this.addEventListenerTracked(canvas, 'touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        });
        
        this.addEventListenerTracked(canvas, 'touchend', (e) => {
            e.preventDefault();
            if (!touchStartX || !touchStartY) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;
            
            // Check if swipe was fast enough
            if (deltaTime > CONFIG.GAME.MAX_SWIPE_TIME) {
                touchStartX = touchStartY = null;
                return;
            }
            
            // Check if movement is large enough (ignoring small accidental touches)
            const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (totalDistance < CONFIG.GAME.TOUCH_DEADZONE) {
                touchStartX = touchStartY = null;
                return;
            }
            
            // Minimum swipe distance for intentional movement
            const minSwipeDistance = CONFIG.GAME.MIN_SWIPE_DISTANCE;
            
            if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
                // Determine swipe direction with better precision
                let dx = 0, dy = 0;
                
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    dx = deltaX > 0 ? 1 : -1;
                } else {
                    // Vertical swipe  
                    dy = deltaY > 0 ? 1 : -1;
                }
                
                // Move player
                this.movePlayer(dx, dy);
            }
            
            // Reset touch coordinates
            touchStartX = touchStartY = touchStartTime = null;
        });
        
        this.addEventListenerTracked(canvas, 'touchcancel', (e) => {
            e.preventDefault();
            touchStartX = touchStartY = touchStartTime = null;
        });
    }
    
    handleInput(e) {
        // Check if menu is active first
        if (this.menuSystem && this.menuSystem.isMenuVisible()) {
            return; // Let menu handle input
        }
        
        // Check if modal is open and handle modal input
        if (this.modal.isShowing()) {
            if (e.key === 'Escape') {
                this.modal.hide();
            }
            return;
        }
        
        if (!this.inputEnabled || this.gameOver || this.gameVictory) return;
        if (!this.gameState.player || this.gameState.player.energy <= 0) return;
        
        // Enhanced input throttling to prevent accidental double-inputs
        const now = Date.now();
        if (now - this.lastInputTime < this.inputThrottle) return;
        this.lastInputTime = now;
        
        let dx = 0, dy = 0;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                dy = -1;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                dy = 1;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                dx = -1;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                dx = 1;
                break;
            case 'z':
            case 'Z':
                this.toggleAutoExplore();
                return;
            case 'Escape':
                if (this.autoSystem && this.autoSystem.getSystemStatus().explorerManager.enabled) {
                    this.autoSystem.stopAllAutomation();
                }
                return;
            case 'h':
            case 'H':
            case '?':
                this.showHelpModal();
                return;
            case 'i':
            case 'I':
                // Quick info panel toggle (show player stats briefly)
                this.showQuickInfo();
                return;
            case 'p':
            case 'P':
                // Pause/unpause auto-explore
                if (this.autoSystem && this.autoSystem.getSystemStatus().explorerManager.enabled) {
                    this.autoSystem.pauseAutomation();
                }
                return;
            // Debug keys
            case 'd':
            case 'D':
                if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
                    this.debug = !this.debug;
                    this.gameState.addMessage(`Debug mode: ${this.debug ? 'ON' : 'OFF'}`, 'level-msg');
                }
                return;
            case 'g':
            case 'G':
                if (this.debug) {
                    // Give gold
                    this.gameState.player.gold += CONFIG.DEBUG.GOLD_AMOUNT;
                    this.gameState.addMessage(`Debug: +${CONFIG.DEBUG.GOLD_AMOUNT} gold`, 'heal-msg');
                }
                return;
            case 'l':
            case 'L':
                if (this.debug) {
                    // Level up
                    this.gameState.player.levelUp();
                    this.gameState.addMessage('Debug: Level up!', 'level-msg');
                }
                return;
            case 'r':
            case 'R':
                if (this.debug) {
                    // Reveal map
                    for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
                        for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                            this.gameState.fogOfWar[y][x] = false;
                            this.gameState.explored[y][x] = true;
                        }
                    }
                    this.gameState.addMessage('Debug: Map revealed', 'level-msg');
                }
                return;
            default:
                return;
        }
        
        e.preventDefault();
        this.movePlayer(dx, dy);
    }
    
    movePlayer(dx, dy) {
        const player = this.gameState.player;
        
        // Input validation
        if (!player || this.gameOver || !this.inputEnabled) {
            return;
        }
        
        // Validate movement direction
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) {
            return;
        }
        
        // Handle confusion status
        if (CONFIG.FEATURES.STATUS_EFFECTS && player.hasStatusEffect('confused')) {
            if (Math.random() < 0.5) {
                // Randomly change direction
                const directions = [[0,1], [0,-1], [1,0], [-1,0]];
                const randomDir = directions[Math.floor(Math.random() * directions.length)];
                dx = randomDir[0];
                dy = randomDir[1];
                this.gameState.addMessage('You stumble in confusion!', 'damage-msg');
            }
        }
        
        const newX = player.x + dx;
        const newY = player.y + dy;
        
        // Check bounds
        if (!this.gameState.inBounds(newX, newY)) return;
        
        // Check walls
        if (this.gameState.isWall(newX, newY)) return;
        
        // Check for enemy
        const enemy = this.gameState.getEnemyAt(newX, newY);
        if (enemy) {
            this.handleCombat(enemy);
            return;
        }
        
        // Move player
        if (player.useEnergy(CONFIG.BALANCE.MOVE_ENERGY_COST)) {
            // Update facing direction based on movement
            if (dx > 0) player.facing = 'right';
            else if (dx < 0) player.facing = 'left';
            else if (dy > 0) player.facing = 'down';
            else if (dy < 0) player.facing = 'up';
            
            const oldX = player.x;
            const oldY = player.y;
            
            player.moveTo(newX, newY);
            
            // Mark dirty regions for rendering optimization
            this.renderer.markTileDirty(oldX, oldY); // Old position
            this.renderer.markTileDirty(newX, newY); // New position
            
            // Emit player moved event
            this.events.emit('player.moved', {
                player: player,
                from: { x: oldX, y: oldY },
                to: { x: newX, y: newY },
                direction: { dx, dy }
            });
            
            // Check for item pickup with skill bonuses
            const item = this.gameState.getItemAt(newX, newY);
            if (item) {
                const result = item.apply(player);
                
                // Apply skill bonuses to gold and item effects
                if (item.type === 'gold') {
                    const bonusGold = player.getModifiedGoldGain(item.value) - item.value;
                    if (bonusGold > 0) {
                        player.gold += bonusGold;
                        this.gameState.addMessage(
                            `${result.message} (+${bonusGold} skill bonus!)`, 
                            result.type
                        );
                    } else {
                        this.gameState.addMessage(result.message, result.type);
                    }
                    
                    // Track gold for fortune skill
                    player.trackAction('goldCollected', item.value);
                    this.gameState.stats.goldCollected += item.value;
                } else {
                    this.gameState.addMessage(result.message, result.type);
                    
                    // Track item collection for fortune skill progression
                    player.trackAction('itemsCollected');
                }
                
                // Check for secret item discovery with exploration skill
                if (player.skillEffects) {
                    const secretResult = player.skillEffects.checkSecretDiscovery(item);
                    if (secretResult.found) {
                        const bonusItem = new Item(newX, newY, 'gold', secretResult.bonus);
                        this.gameState.items.push(bonusItem);
                        this.gameState.addMessage(secretResult.message, 'heal-msg');
                        player.trackAction('secretsFound');
                    }
                }
                
                // Emit item collected event
                this.events.emit('item.collected', {
                    item: item,
                    player: player,
                    result: result
                });
                
                // Check for rare items
                if (item.rarity && (item.rarity === 'rare' || item.rarity === 'legendary')) {
                    this.events.emit('item.rare_discovered', {
                        item: item,
                        player: player
                    });
                }
                
                this.gameState.removeItem(item);
            }
            
            // Check for stairs
            if (newX === this.gameState.stairsX && newY === this.gameState.stairsY) {
                this.handleStairs();
            }
            
            // Check player health for warnings
            const healthPercent = player.hp / player.maxHp;
            if (healthPercent <= 0.25 && healthPercent > 0) {
                this.events.emit('player.low_health', {
                    player: player,
                    healthPercent: healthPercent
                });
            }
            
            // Process turn
            this.gameState.processTurn();
            this.processStatusEffects();
            
            // Process skill-based regeneration
            player.processSkillRegeneration();
            
            this.processEnemyTurns();
            
            // Reset consecutive kills counter if no combat this turn
            if (player.temporaryEffects.lastDamageTime < Date.now() - 2000) {
                player.temporaryEffects.consecutiveKills = 0;
            }
            
            // Emit turn processed (for atmospheric events)
            this.events.emit('turn.processed', {
                player: player,
                floor: this.gameState.floor,
                turn: this.gameState.turn || 0
            });
        }
    }
    
    handleCombat(enemy) {
        const player = this.gameState.player;
        
        // Track combat time for healing delay
        this.lastCombatTime = Date.now();
        
        // Apply skill-based energy cost modifications
        const energyCost = player.getModifiedEnergyCost(CONFIG.BALANCE.COMBAT_ENERGY_COST);
        if (!player.useEnergy(energyCost)) {
            return;
        }
        
        const result = this.combat.playerAttack(enemy);
        
        // Check for counter-attack from Combat Reflexes milestone
        if (!result.killed && player.skillEffects) {
            const counterResult = player.skillEffects.attemptCounterAttack(enemy);
            if (counterResult && counterResult.killed) {
                result.killed = true;
            }
        }
        
        // Reset consecutive kills counter on enemy death
        if (result.killed) {
            player.temporaryEffects.consecutiveKills = 0;
        }
        
        // Emit combat events
        this.events.emit('combat.attack', {
            attacker: player,
            target: enemy,
            damage: result.damage,
            critical: result.critical,
            killed: result.killed
        });
        
        if (result.killed) {
            // Emit enemy killed event
            this.events.emit('enemy.killed', {
                enemy: enemy,
                killer: player,
                floor: this.gameState.floor,
                combat: result
            });
            
            if (this.gameState.settings.particlesEnabled) {
                this.particles.addExplosion(enemy.x, enemy.y, '#a44');
            }
        }
        
        // Show floating combat text
        this.narrativeUI.showCombatNarrative(
            player, 
            enemy, 
            result.damage, 
            result.critical
        );
        
        if (player.hp <= 0) {
            this.handleGameOver();
        }
    }
    
    handleStairs() {
        // Don't allow stairs if game is won
        if (this.gameState.gameVictory) {
            this.gameState.addMessage('You have already conquered all areas!', 'level-msg');
            return;
        }
        
        const previousFloor = this.gameState.floor;
        
        // Notify auto-system of floor change
        if (this.autoSystem) {
            this.autoSystem.onFloorChange();
        }
        
        this.gameState.nextFloor();
        
        // Force immediate render after floor change
        this.render();
        
        // Emit floor completion and entrance events
        this.events.emit('floor.completed', {
            floor: previousFloor,
            player: this.gameState.player,
            stats: this.gameState.stats
        });
        
        this.events.emit('floor.entered', {
            floor: this.gameState.floor,
            player: this.gameState.player
        });
        
        if (this.gameState.settings.particlesEnabled) {
            this.particles.addExplosion(
                this.gameState.player.x, 
                this.gameState.player.y, 
                '#44a'
            );
        }
    }
    
    handleGameOver() {
        this.gameOver = true;
        this.inputEnabled = false;
        
        // Emit player death event
        this.events.emit('player.died', {
            player: this.gameState.player,
            floor: this.gameState.floor,
            stats: this.gameState.stats,
            finalScore: this.calculateFinalScore()
        });
        
        this.addTimeoutTracked(() => {
            this.modal.show({
                title: 'GAME OVER',
                message: `You have fallen on floor ${this.gameState.floor}!\n\nYour final stats:\nLevel: ${this.gameState.player.level}\nGold: ${this.gameState.player.gold}\nEnemies Killed: ${this.gameState.stats.enemiesKilled}`,
                buttons: [
                    {
                        text: 'New Game',
                        primary: true,
                        callback: () => {
                            location.reload();
                        }
                    },
                    {
                        text: 'View Stats',
                        callback: () => {
                            this.showStatsModal();
                        }
                    }
                ]
            });
        }, 1000);
    }
    
    handleVictory(victoryData) {
        // Disable input and set game as completed
        this.inputEnabled = false;
        this.gameVictory = true;
        
        // Stop auto-system if active
        if (this.autoSystem) {
            this.autoSystem.stopAllAutomation();
        }
        
        // Calculate final score
        const finalScore = this.calculateFinalScore();
        
        // Create victory message with all stats
        const victoryMessage = `
🎉 CONGRATULATIONS! 🎉

You have conquered all areas and brought peace to the realm!

Final Statistics:
▪ Level: ${victoryData.player.level}
▪ Gold Collected: ${victoryData.stats.goldCollected}
▪ Enemies Defeated: ${victoryData.stats.enemiesKilled}
▪ Floors Completed: ${victoryData.stats.floorsCompleted}
▪ Final Score: ${finalScore}

Areas Conquered:
${victoryData.completedAreas.map(areaId => {
    const area = this.gameState.areaManager.areas.get(areaId);
    return area ? `▪ ${area.name}` : `▪ ${areaId}`;
}).join('\n')}

Thank you for playing!
        `.trim();
        
        // Show victory modal after a short delay
        this.addTimeoutTracked(() => {
            this.modal.show({
                title: '🏆 VICTORY! 🏆',
                message: victoryMessage,
                buttons: [
                    {
                        text: 'New Game',
                        primary: true,
                        callback: () => {
                            location.reload();
                        }
                    },
                    {
                        text: 'Continue Playing',
                        callback: () => {
                            // Allow continued exploration but game is already won
                            this.inputEnabled = true;
                            this.gameState.addMessage('Feel free to continue exploring the conquered realms!', 'level-msg');
                        }
                    }
                ]
            });
        }, 1500);
        
        // Emit narrative event for victory
        this.events.emit('narrative.triggered', {
            narrative: 'The darkness has been vanquished! You stand victorious, having conquered all the challenges that lay before you. The realm is at peace once more.',
            importance: 'high'
        });
        
        // Trigger victory particles if enabled
        if (this.gameState.settings.particlesEnabled) {
            // Multiple celebration explosions
            for (let i = 0; i < 5; i++) {
                this.addTimeoutTracked(() => {
                    const colors = ['#ffd700', '#ffcc00', '#ffaa00', '#ff8800', '#ffffff'];
                    this.particles.addExplosion(
                        this.gameState.player.x,
                        this.gameState.player.y,
                        colors[i % colors.length]
                    );
                }, i * 200);
            }
        }
    }
    
    processEnemyTurns() {
        for (const enemy of this.gameState.enemies) {
            // Update enemy status effects
            if (CONFIG.FEATURES.STATUS_EFFECTS) {
                enemy.updateStatusEffects();
                
                // Skip turn if stunned
                if (enemy.hasStatusEffect('stun')) {
                    continue;
                }
            }
            
            if (enemy.canSeeEntity(this.gameState.player, this.gameState.fogOfWar)) {
                this.processEnemyMove(enemy);
            }
        }
    }
    
    processStatusEffects() {
        if (!CONFIG.FEATURES.STATUS_EFFECTS) return;
        
        const player = this.gameState.player;
        
        // Process poison damage (REBALANCED - much weaker)
        if (player.hasStatusEffect('poison')) {
            // Poison now does minimal damage - only 2% max HP
            const poisonDamage = Math.max(1, Math.floor(player.maxHp * 0.02)); // 2% of max HP (was 5%)
            const damage = player.takeDamage(poisonDamage);
            this.gameState.addMessage(`Poison deals ${damage} damage!`, 'damage-msg');
            
            if (player.hp <= 0) {
                this.handleGameOver();
            }
        }
        
        // Process blessed bonus (visual indicator only for now)
        if (player.hasStatusEffect('blessed')) {
            // Could add healing or damage bonus here
        }
        
        // Update all status effect durations
        player.updateStatusEffects();
    }
    
    processEnemyMove(enemy) {
        const player = this.gameState.player;
        const dist = enemy.distanceTo(player);
        
        // Attack if adjacent
        if (dist <= 1.5) {
            this.combat.enemyAttack(enemy, player);
            
            if (player.hp <= 0) {
                this.handleGameOver();
            }
            return;
        }
        
        // Move towards player
        const move = enemy.getMoveTowards(player.x, player.y);
        const newX = enemy.x + move.dx;
        const newY = enemy.y + move.dy;
        
        // Check if move is valid
        if (!this.gameState.isWall(newX, newY) && 
            !this.gameState.isOccupied(newX, newY)) {
            const oldX = enemy.x;
            const oldY = enemy.y;
            
            enemy.moveTo(newX, newY);
            
            // Mark dirty regions for rendering optimization
            this.renderer.markTileDirty(oldX, oldY); // Old position
            this.renderer.markTileDirty(newX, newY); // New position
        }
    }
    
    toggleAutoExplore() {
        if (this.autoSystem) {
            // Use enhanced AI with balanced mode as default
            const currentStatus = this.autoSystem.getSystemStatus();
            if (currentStatus.explorerManager.enabled) {
                // Stop if already running
                this.autoSystem.stopAllAutomation();
                this.gameState.addMessage('Auto-exploration stopped', 'level-msg');
            } else {
                // Start with enhanced AI in balanced mode
                this.autoSystem.startFloorExploration('enhanced', 'balanced');
                this.gameState.addMessage('Auto-exploration started (Enhanced AI, Balanced mode)', 'level-msg');
            }
        } else {
            console.warn('Auto system not available');
            this.gameState.addMessage('Auto-exploration not available', 'level-msg');
        }
    }
    
    // Helper method to check if movement is valid
    canMoveTo(x, y) {
        return this.gameState.inBounds(x, y) && 
               !this.gameState.isWall(x, y) && 
               !this.gameState.getEnemyAt(x, y);
    }
    
    startEnergyRegeneration() {
        this.addIntervalTracked(() => {
            const player = this.gameState.player;
            if (player && !this.gameOver && player.energy < player.maxEnergy) {
                player.restoreEnergy(CONFIG.GAME.ENERGY_REGEN_AMOUNT);
                this.updateUI();
            }
        }, CONFIG.GAME.ENERGY_REGEN_RATE);
    }
    
    startHealthRegeneration() {
        if (!CONFIG.BALANCE.NATURAL_HEALING.ENABLED) return;
        
        this.addIntervalTracked(() => {
            const player = this.gameState.player;
            const now = Date.now();
            
            if (player && !this.gameOver && player.hp < player.maxHp) {
                // Check if enough time has passed since last combat
                const timeSinceCombat = now - this.lastCombatTime;
                const healingDelay = CONFIG.BALANCE.NATURAL_HEALING.COMBAT_DELAY;
                
                if (timeSinceCombat >= healingDelay) {
                    // Only heal up to the max percent (80% by default)
                    const maxHealHp = Math.floor(player.maxHp * CONFIG.BALANCE.NATURAL_HEALING.MAX_HEAL_PERCENT);
                    
                    if (player.hp < maxHealHp) {
                        const healAmount = CONFIG.BALANCE.NATURAL_HEALING.HP_REGEN_AMOUNT;
                        const healed = player.heal(healAmount);
                        
                        if (healed > 0) {
                            this.gameState.addMessage(`Natural healing restores ${healed} HP`, 'heal-msg');
                            this.updateUI();
                        }
                    }
                }
            }
        }, CONFIG.BALANCE.NATURAL_HEALING.HP_REGEN_RATE);
    }
    
    render() {
        this.renderer.clear();
        
        // Only render if game state is initialized
        if (!this.gameState.map || !this.gameState.fogOfWar || !this.gameState.explored) {
            return;
        }
        
        // Update camera to follow player
        if (this.gameState.player) {
            this.renderer.updateCamera(this.gameState.player.x, this.gameState.player.y);
        }
        
        this.renderer.renderMap(this.gameState.map, this.gameState.fogOfWar, this.gameState.explored);
        this.renderer.renderStairs(
            this.gameState.stairsX, 
            this.gameState.stairsY, 
            this.gameState.fogOfWar
        );
        this.renderer.renderItems(this.gameState.items, this.gameState.fogOfWar);
        this.renderer.renderEnemies(this.gameState.enemies, this.gameState.fogOfWar);
        
        if (this.gameState.player) {
            this.renderer.renderPlayer(this.gameState.player);
        }
        
        // Update particles
        if (this.gameState.settings.particlesEnabled) {
            this.particles.update();
        }
        
        // Debug rendering
        if (this.debug && this.gameState.enemies) {
            this.renderDebugInfo();
        }
    }
    
    renderDebugInfo() {
        const ctx = this.renderer.ctx;
        
        // Update FPS counter
        const now = performance.now();
        this.debugInfo.frameTime = now - this.debugInfo.lastFrameTime;
        this.debugInfo.lastFrameTime = now;
        this.debugInfo.frameCount++;
        
        if (this.debugInfo.frameCount % 30 === 0) {
            this.debugInfo.fps = Math.round(1000 / this.debugInfo.frameTime);
        }
        
        // Draw enemy vision ranges (configurable)
        if (CONFIG.DEBUG.SHOW_ENEMY_VISION) {
            ctx.globalAlpha = 0.08;
            ctx.strokeStyle = '#f44';
            ctx.lineWidth = 1;
            
            // Only show vision for up to 3 closest visible enemies to improve performance
            const visibleEnemies = this.gameState.enemies
                .filter(enemy => !this.gameState.fogOfWar[enemy.y][enemy.x] && 
                               enemy.distanceTo(this.gameState.player) <= 6)
                .sort((a, b) => a.distanceTo(this.gameState.player) - b.distanceTo(this.gameState.player))
                .slice(0, 3);
                
            for (const enemy of visibleEnemies) {
                const centerX = (enemy.x - this.renderer.cameraX) * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
                const centerY = (enemy.y - this.renderer.cameraY) * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, enemy.viewRange * CONFIG.CELL_SIZE, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Draw pathfinding target (configurable) - for auto-system
        if (CONFIG.DEBUG.SHOW_PATHFINDING && this.autoSystem && this.autoSystem.getSystemStatus().explorerManager.enabled) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#0f0';
            ctx.fillRect(
                (this.gameState.stairsX - this.renderer.cameraX) * CONFIG.CELL_SIZE,
                (this.gameState.stairsY - this.renderer.cameraY) * CONFIG.CELL_SIZE,
                CONFIG.CELL_SIZE,
                CONFIG.CELL_SIZE
            );
        }
        
        ctx.globalAlpha = 1;
        
        // Draw debug text
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(`FPS: ${this.debugInfo.fps}`, 5, 15);
        ctx.fillText(`Turn: ${this.gameState.turn || 0}`, 5, 25);
        ctx.fillText(`Enemies: ${this.gameState.enemies?.length || 0}`, 5, 35);
        ctx.fillText(`Items: ${this.gameState.items?.length || 0}`, 5, 45);
        if (this.gameState.player) {
            ctx.fillText(`Pos: ${this.gameState.player.x},${this.gameState.player.y}`, 5, 55);
            ctx.fillText(`Facing: ${this.gameState.player.facing}`, 5, 65);
        }
        
        // Show grid lines (configurable)
        if (CONFIG.DEBUG.SHOW_GRID_LINES) {
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            
            // Only draw grid lines for visible viewport
            const startX = this.renderer.cameraX;
            const endX = Math.min(this.renderer.cameraX + CONFIG.VIEWPORT_WIDTH, CONFIG.GRID_WIDTH);
            const startY = this.renderer.cameraY;
            const endY = Math.min(this.renderer.cameraY + CONFIG.VIEWPORT_HEIGHT, CONFIG.GRID_HEIGHT);
            
            for (let x = startX; x <= endX; x++) {
                ctx.beginPath();
                ctx.moveTo((x - this.renderer.cameraX) * CONFIG.CELL_SIZE, 0);
                ctx.lineTo((x - this.renderer.cameraX) * CONFIG.CELL_SIZE, CONFIG.VIEWPORT_HEIGHT * CONFIG.CELL_SIZE);
                ctx.stroke();
            }
            for (let y = startY; y <= endY; y++) {
                ctx.beginPath();
                ctx.moveTo(0, (y - this.renderer.cameraY) * CONFIG.CELL_SIZE);
                ctx.lineTo(CONFIG.VIEWPORT_WIDTH * CONFIG.CELL_SIZE, (y - this.renderer.cameraY) * CONFIG.CELL_SIZE);
                ctx.stroke();
            }
        }
    }
    
    updateUI() {
        const player = this.gameState.player;
        
        // Don't update UI if player doesn't exist yet
        if (!player) {
            return;
        }
        
        // Side panel stats
        document.getElementById('player-level').textContent = player.level;
        document.getElementById('player-hp').textContent = `${player.hp}/${player.maxHp}`;
        document.getElementById('player-exp').textContent = `${player.exp}/${player.expToNext}`;
        document.getElementById('player-energy').textContent = `${player.energy}/${player.maxEnergy}`;
        document.getElementById('floor-level').textContent = this.gameState.floor;
        document.getElementById('player-gold').textContent = player.gold;
        
        // Update progress bars
        const healthBar = document.getElementById('health-bar');
        const energyBar = document.getElementById('energy-bar');
        const expBar = document.getElementById('exp-bar');
        
        if (healthBar) {
            const healthPercent = (player.hp / player.maxHp) * 100;
            healthBar.style.width = `${healthPercent}%`;
            
            // Add warning class for low health
            if (healthPercent <= 25) {
                healthBar.classList.add('low');
            } else {
                healthBar.classList.remove('low');
            }
        }
        
        if (energyBar) {
            const energyPercent = (player.energy / player.maxEnergy) * 100;
            energyBar.style.width = `${energyPercent}%`;
            
            // Add warning class for low energy
            if (energyPercent <= 20) {
                energyBar.classList.add('low');
            } else {
                energyBar.classList.remove('low');
            }
        }
        
        if (expBar) {
            const expPercent = (player.exp / player.expToNext) * 100;
            expBar.style.width = `${expPercent}%`;
        }
        
        // Status bar (duplicate for classic feel)
        document.getElementById('status-hp').textContent = `${player.hp}/${player.maxHp}`;
        document.getElementById('status-exp').textContent = `${player.exp}/${player.expToNext}`;
        document.getElementById('status-energy').textContent = `${player.energy}/${player.maxEnergy}`;
        document.getElementById('status-floor').textContent = this.gameState.floor;
        document.getElementById('status-gold').textContent = player.gold;
        
        // Update game time
        this.updateGameTime();
        
        // Update exploration progress
        this.updateExplorationProgress();
        
        // Update skill progression
        this.updateSkillUI();
        
        // Update message log
        this.updateMessageLog();
    }
    
    updateGameTime() {
        const gameTimeElement = document.getElementById('game-time');
        if (gameTimeElement) {
            const elapsed = Date.now() - this.gameStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            gameTimeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateSkillUI() {
        const player = this.gameState.player;
        if (!player || !player.skills) return;
        
        // Delegate to the modular SkillUI system
        if (window.skillUI) {
            window.skillUI.updateSkillUI(player);
        }
    }
    
    updateExplorationProgress() {
        const explorationElement = document.getElementById('exploration-percent');
        const explorationBar = document.getElementById('dungeon-exploration-bar');
        
        if (explorationElement && explorationBar && this.gameState.explored && this.gameState.map) {
            let exploredCount = 0;
            let totalWalkable = 0;
            
            // Calculate current floor exploration
            for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
                for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                    // Only count tiles that exist and aren't walls
                    if (this.gameState.map[y] && !this.gameState.isWall(x, y)) {
                        totalWalkable++;
                        if (this.gameState.explored[y] && this.gameState.explored[y][x]) {
                            exploredCount++;
                        }
                    }
                }
            }
            
            const percent = totalWalkable > 0 ? Math.floor((exploredCount / totalWalkable) * 100) : 0;
            explorationElement.textContent = `${percent}%`;
            explorationBar.style.width = `${percent}%`;
        }
    }
    
    updateMessageLog() {
        // Update the new message console
        const log = document.getElementById('message-log');
        if (log) {
            log.innerHTML = this.gameState.messages.map(m => 
                `<div class="message ${m.className}">${m.text}</div>`
            ).join('');
            
            // Auto-scroll to bottom
            const messageConsole = document.getElementById('message-console');
            if (messageConsole) {
                messageConsole.scrollTop = messageConsole.scrollHeight;
            }
        }
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.render();
            this.updateUI();
            this.animationFrame = requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
    
    // Public methods for UI buttons
    
    saveGame() {
        try {
            this.gameState.saveGame();
            this.modal.show({
                title: 'GAME SAVED',
                message: 'Your progress has been saved successfully!',
                buttons: [
                    {
                        text: 'Continue',
                        primary: true,
                        callback: () => {
                            this.modal.hide();
                        }
                    }
                ]
            });
        } catch (error) {
            console.error('Save failed:', error);
            this.modal.show({
                title: 'SAVE FAILED',
                message: 'Could not save your progress. Please check your browser storage settings.',
                buttons: [
                    {
                        text: 'OK',
                        primary: true,
                        callback: () => {
                            this.modal.hide();
                        }
                    }
                ]
            });
        }
    }
    
    showStatsModal() {
        const stats = this.gameState.stats;
        const player = this.gameState.player;
        this.modal.show({
            title: 'FINAL STATISTICS',
            message: `Level: ${player.level}\nHP: ${player.hp}/${player.maxHp}\nAttack: ${player.attack}\nDefense: ${player.defense}\nGold: ${player.gold}\n\nFloors Completed: ${stats.floorsCompleted}\nEnemies Killed: ${stats.enemiesKilled}\nGold Collected: ${stats.goldCollected}\nDamage Dealt: ${stats.totalDamageDealt}\nDamage Taken: ${stats.totalDamageTaken}`,
            buttons: [
                {
                    text: 'New Game',
                    primary: true,
                    callback: () => {
                        location.reload();
                    }
                },
                {
                    text: 'Close',
                    callback: () => {
                        this.modal.hide();
                    }
                }
            ]
        });
    }
    
    showHelpModal() {
        let helpText = `MOVEMENT:\n↑↓←→ or WASD - Move character\n\nCOMBAT:\nMove into enemies to attack\nEnemies attack when adjacent\nPositional bonuses apply!\n\nGAME CONTROLS:\nZ - Toggle Auto-Explore\nP - Pause Auto-Explore\nESC - Stop Auto-Explore\nL - View Collected Lore\nI - Quick Info Summary\nH or ? - Show this help\n\nAUTO-EXPLORE:\nAuto-paths to stairs when\nall enemies are cleared!\n\nCAMPAIGN:\nConquer 3 cursed floors\nEach floor has unique lore\nDefeat the final evil\nSave the kingdom!`;
        
        if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
            helpText += `\n\nDEBUG COMMANDS:\nD - Toggle debug display\nG - Give 100 gold\nL - Level up\nR - Reveal entire map`;
        }
        
        if (CONFIG.FEATURES.DIRECTIONAL_COMBAT) {
            helpText += `\n\nCOMBAT TIPS:\nAttack from behind for +50% damage\nAttack from side for +25% damage\nFace enemies to block 25% damage`;
        }
        
        this.modal.show({
            title: 'MEMORY CAVERN - HELP',
            message: helpText,
            buttons: [
                {
                    text: 'Got it!',
                    primary: true,
                    callback: () => {
                        this.modal.hide();
                    }
                }
            ]
        });
    }
    
    showQuickInfo() {
        const player = this.gameState.player;
        if (!player) return;
        
        // Show a brief overlay with current player stats
        const infoText = `📊 QUICK INFO\n\n` +
            `Level ${player.level} • HP: ${player.hp}/${player.maxHp} • Energy: ${player.energy}/${player.maxEnergy}\n` +
            `Attack: ${player.attack} • Defense: ${player.defense} • Gold: ${player.gold}\n` +
            `Floor: ${this.gameState.floor} • Enemies: ${this.gameState.enemies.length} • Items: ${this.gameState.items.length}`;
        
        this.gameState.addMessage(infoText, 'level-msg');
    }
    
    showLoreInConsole() {
        // Get all collected lore from the event bus
        const allLore = this.events.getAllLore();
        
        if (allLore.length === 0) {
            this.events.emit('narrative.triggered', {
                narrative: "📜 No lore has been discovered yet. Explore to uncover the secrets of the cavern!",
                importance: 'normal'
            });
            return;
        }
        
        // Show lore summary in console
        this.events.emit('narrative.triggered', {
            narrative: `📜 LORE COLLECTION (${allLore.length} entries discovered)`,
            importance: 'important'
        });
        
        // Group lore by category
        const categories = {};
        allLore.forEach(entry => {
            if (!categories[entry.category]) {
                categories[entry.category] = [];
            }
            categories[entry.category].push(entry);
        });
        
        // Display each category
        Object.entries(categories).forEach(([category, entries]) => {
            this.events.emit('narrative.triggered', {
                narrative: `📚 ${category.toUpperCase()} (${entries.length})`,
                importance: 'story'
            });
            
            // Show first few entries from each category
            entries.slice(0, 3).forEach(entry => {
                const raritySymbol = {
                    common: '○',
                    uncommon: '◐', 
                    rare: '●',
                    legendary: '★'
                }[entry.rarity] || '○';
                
                this.events.emit('narrative.triggered', {
                    narrative: `  ${raritySymbol} ${entry.content}`,
                    importance: 'atmospheric'
                });
            });
            
            if (entries.length > 3) {
                this.events.emit('narrative.triggered', {
                    narrative: `  ... and ${entries.length - 3} more entries`,
                    importance: 'atmospheric'
                });
            }
        });
        
        this.events.emit('narrative.triggered', {
            narrative: "📜 === END OF LORE COLLECTION ===",
            importance: 'normal'
        });
        
        // After viewing lore post-victory, show options to continue
        if (this.gameOver && this.gameState.campaignProgress && this.gameState.campaignProgress.completed) {
            this.addTimeoutTracked(() => {
                this.modal.show({
                    title: '📜 Lore Viewed',
                    message: 'You have reviewed your collected lore.\n\nWhat would you like to do next?',
                    buttons: [
                        {
                            text: 'New Game',
                            primary: true,
                            callback: () => {
                                location.reload();
                            }
                        },
                        {
                            text: 'View Victory Screen',
                            callback: () => {
                                this.modal.hide();
                                // Re-trigger victory modal if we have the stats
                                if (this.lastVictoryStats) {
                                    this.cutsceneManager.showVictoryModal(
                                        this.lastVictoryStats.stats,
                                        this.lastVictoryStats.score,
                                        this.lastVictoryStats.minutes,
                                        this.lastVictoryStats.seconds
                                    );
                                }
                            }
                        }
                    ]
                });
            }, 1000);
        }
    }
    
    showLoreModal() {
        // Get all collected lore from the event bus
        const allLore = this.events.getAllLore();
        
        if (allLore.length === 0) {
            this.modal.show({
                title: '📜 Lore Collection',
                message: 'No lore has been discovered yet.\n\nExplore the cavern to uncover the secrets of this ancient place!',
                buttons: [
                    {
                        text: 'Back to Victory',
                        primary: true,
                        callback: () => {
                            this.modal.hide();
                            // Return to victory modal
                            if (this.lastVictoryStats) {
                                this.cutsceneManager.showVictoryModal(
                                    this.lastVictoryStats.stats,
                                    this.lastVictoryStats.score,
                                    this.lastVictoryStats.minutes,
                                    this.lastVictoryStats.seconds
                                );
                            }
                        }
                    }
                ]
            });
            return;
        }
        
        // Group lore by category
        const categories = {};
        allLore.forEach(entry => {
            if (!categories[entry.category]) {
                categories[entry.category] = [];
            }
            categories[entry.category].push(entry);
        });
        
        // Format lore for modal display
        let loreContent = `<div style="font-size: 10px; line-height: 1.4;">`;
        loreContent += `<div style="color: #d4af37; font-weight: bold; margin-bottom: 8px;">📜 COLLECTED LORE (${allLore.length} entries)</div>`;
        
        Object.entries(categories).forEach(([category, entries]) => {
            loreContent += `<div style="color: #aaaaff; font-weight: bold; margin: 8px 0 4px 0;">${category.toUpperCase()} (${entries.length})</div>`;
            
            entries.forEach(entry => {
                const rarityColor = {
                    common: '#c0c0c0',
                    uncommon: '#90ee90',
                    rare: '#4169e1',
                    legendary: '#ffd700'
                }[entry.rarity] || '#c0c0c0';
                
                const raritySymbol = {
                    common: '○',
                    uncommon: '◐', 
                    rare: '●',
                    legendary: '★'
                }[entry.rarity] || '○';
                
                loreContent += `<div style="margin: 4px 0; padding: 4px; border-left: 2px solid ${rarityColor}; font-size: 9px;">`;
                loreContent += `<span style="color: ${rarityColor};">${raritySymbol}</span> ${entry.content}`;
                loreContent += `</div>`;
            });
        });
        
        loreContent += `</div>`;
        
        this.modal.show({
            title: '📜 Lore Collection',
            message: loreContent,
            buttons: [
                {
                    text: 'Back to Victory',
                    primary: true,
                    callback: () => {
                        this.modal.hide();
                        // Return to victory modal
                        if (this.lastVictoryStats) {
                            this.cutsceneManager.showVictoryModal(
                                this.lastVictoryStats.stats,
                                this.lastVictoryStats.score,
                                this.lastVictoryStats.minutes,
                                this.lastVictoryStats.seconds
                            );
                        }
                    }
                },
                {
                    text: 'New Game',
                    callback: () => {
                        location.reload();
                    }
                }
            ]
        });
    }

    calculateFinalScore() {
        const player = this.gameState.player;
        const stats = this.gameState.stats;
        
        return (player.level * 100) + 
               (this.gameState.floor * 50) + 
               (stats.enemiesKilled * 10) + 
               (player.gold * 1) + 
               (stats.goldCollected * 0.5);
    }
    
    showErrorMessage(message) {
        // Fallback error handling if modal system fails
        try {
            if (this.modal) {
                this.modal.show({
                    title: 'ERROR',
                    message: message,
                    buttons: [
                        {
                            text: 'Refresh Page',
                            primary: true,
                            callback: () => {
                                location.reload();
                            }
                        },
                        {
                            text: 'Continue',
                            callback: () => {
                                this.modal.hide();
                            }
                        }
                    ]
                });
            } else {
                // Fallback to browser alert if modal system unavailable
                alert('ERROR: ' + message);
            }
        } catch (error) {
            console.error('Failed to show error message:', error);
            alert('CRITICAL ERROR: ' + message);
        }
    }
    
    setupDebugCommands() {
        if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
            window.debugCommands = {
                giveGold: (amount = 100) => {
                    if (this.gameState.player) {
                        this.gameState.player.gold += amount;
                        this.updateUI();
                        console.log(`Added ${amount} gold. Total: ${this.gameState.player.gold}`);
                    }
                },
                
                teleport: (x, y) => {
                    if (this.gameState.player && this.gameState.inBounds(x, y) && !this.gameState.isWall(x, y)) {
                        this.gameState.player.moveTo(x, y);
                        this.gameState.updateFogOfWar();
                        console.log(`Teleported to ${x}, ${y}`);
                    } else {
                        console.log('Invalid teleport coordinates');
                    }
                },
                
                nextFloor: () => {
                    if (this.gameState) {
                        this.gameState.completeFloor();
                        console.log('Advanced to next floor');
                    }
                },
                
                godMode: () => {
                    if (this.gameState.player) {
                        this.gameState.player.hp = 999;
                        this.gameState.player.maxHp = 999;
                        this.gameState.player.energy = 999;
                        this.gameState.player.maxEnergy = 999;
                        this.updateUI();
                        console.log('God mode activated');
                    }
                },
                
                levelUp: () => {
                    if (this.gameState.player) {
                        this.gameState.player.gainExp(this.gameState.player.expToNext);
                        this.updateUI();
                        console.log('Level up!');
                    }
                },
                
                revealMap: () => {
                    if (this.gameState.explored) {
                        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
                            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                                this.gameState.explored[y][x] = true;
                                this.gameState.fogOfWar[y][x] = false;
                            }
                        }
                        console.log('Map revealed');
                    }
                },
                
                toggleDebugRender: () => {
                    this.debug = !this.debug;
                    console.log(`Debug rendering: ${this.debug ? 'ON' : 'OFF'}`);
                },
                
                spawnEnemy: (type = 'goblin') => {
                    if (this.gameState.player) {
                        const x = this.gameState.player.x + 1;
                        const y = this.gameState.player.y;
                        if (this.gameState.inBounds(x, y) && !this.gameState.isWall(x, y)) {
                            const enemy = createEnemy(type, x, y, this.gameState.floor);
                            this.gameState.enemies.push(enemy);
                            console.log(`Spawned ${type} at ${x}, ${y}`);
                        }
                    }
                },
                
                giveSkillExp: (skillType, amount = 100) => {
                    if (this.gameState.player && this.gameState.player.skillSystem) {
                        const skill = this.gameState.player.skills[skillType];
                        const oldLevel = skill ? skill.level : 1;
                        const gained = this.gameState.player.skillSystem.gainSkillExp(skillType, amount);
                        const newLevel = skill ? skill.level : 1;
                        this.updateUI();
                        console.log(`Added ${amount} exp to ${skillType}. Level: ${oldLevel} -> ${newLevel} (Leveled up: ${gained})`);
                    } else {
                        console.log('Player skill system not available');
                    }
                },
                
                testSkillBalance: () => {
                    const player = this.gameState.player;
                    if (!player) return;
                    
                    console.log('=== SKILL BALANCE TEST ===');
                    console.log('Simulating typical floor activities...');
                    
                    // Simulate typical floor activities
                    player.trackAction('enemiesKilled', 1);     // Kill 5 enemies
                    player.trackAction('damageDealt', 15);      // Deal ~75 damage total
                    player.trackAction('damageTaken', 8);       // Take some damage
                    for(let i = 0; i < 50; i++) {               // Explore ~50 tiles
                        player.trackAction('tilesExplored', 1);
                    }
                    player.trackAction('itemsCollected', 1);    // Collect 3 items
                    player.trackAction('goldCollected', 25);    // Collect ~75 gold
                    
                    this.updateUI();
                    
                    Object.keys(player.skills).forEach(skillName => {
                        const skill = player.skills[skillName];
                        console.log(`${skillName}: Level ${skill.level}, EXP ${skill.exp}`);
                    });
                },
                
                testHealing: () => {
                    const player = this.gameState.player;
                    if (!player) return;
                    
                    console.log('=== HEALING BALANCE TEST ===');
                    console.log(`Current HP: ${player.hp}/${player.maxHp}`);
                    
                    // Damage player to 30% health
                    const targetHp = Math.floor(player.maxHp * 0.3);
                    player.hp = targetHp;
                    console.log(`Reduced to: ${player.hp}/${player.maxHp} (30%)`);
                    
                    // Apply poison for testing
                    if (CONFIG.FEATURES.STATUS_EFFECTS) {
                        player.applyStatusEffect('poison', 3);
                        console.log('Applied poison for 3 turns');
                    }
                    
                    this.updateUI();
                    console.log('Natural healing will start in 4 seconds after "combat"');
                    console.log('Poison will deal ~2% max HP per turn');
                },
                
                testBossBalance: () => {
                    const player = this.gameState.player;
                    if (!player) return;
                    
                    console.log('=== BOSS BALANCE TEST ===');
                    console.log(`Player Level ${player.level}: ${player.hp}/${player.maxHp} HP, ${player.attack} ATK`);
                    
                    // Test against each boss at appropriate level
                    const bosses = [
                        {name: 'Skeleton Lord', level: 3, type: 'skeletonLord'},
                        {name: 'Spore Mother', level: 6, type: 'sporeMother'},
                        {name: 'Stellar Architect', level: 9, type: 'stellarArchitect'}
                    ];
                    
                    bosses.forEach(boss => {
                        const enemy = new Enemy(10, 10, boss.type, boss.level);
                        const playerDmg = Math.max(1, player.attack - (enemy.defense || 0));
                        const bossDmg = Math.max(1, enemy.attack - player.defense);
                        const playerTurns = Math.ceil(enemy.hp / playerDmg);
                        const bossTurns = Math.ceil(player.hp / bossDmg);
                        
                        console.log(`${boss.name} (Floor ${boss.level}): ${enemy.hp} HP, ${enemy.attack} ATK`);
                        console.log(`  Player needs ${playerTurns} hits, Boss needs ${bossTurns} hits`);
                        console.log(`  Balance: ${bossTurns > playerTurns ? 'PLAYER FAVORED' : bossTurns < playerTurns ? 'BOSS FAVORED' : 'BALANCED'}`);
                    });
                },
                
                help: () => {
                    console.log(`Debug Commands:
giveGold(amount) - Add gold to player
teleport(x, y) - Move player to coordinates
nextFloor() - Complete current floor
godMode() - Max health and energy
levelUp() - Gain a level
revealMap() - Reveal entire map
toggleDebugRender() - Toggle debug overlays
spawnEnemy(type) - Spawn enemy near player
giveSkillExp(skillType, amount) - Add skill experience
testSkillBalance() - Simulate floor activities
testHealing() - Test healing and poison balance
testBossBalance() - Test boss difficulty vs player level
help() - Show this help`);
                }
            };
            
            console.log('Debug commands loaded! Type debugCommands.help() for list');
        }
    }
}

class ModalManager {
    constructor() {
        this.overlay = document.getElementById('modal-overlay');
        this.window = document.getElementById('modal-window');
        this.header = document.getElementById('modal-header');
        this.body = document.getElementById('modal-body');
        this.buttons = document.getElementById('modal-buttons');
        this.isVisible = false;
    }
    
    show(config) {
        this.header.textContent = config.title || '';
        // Handle line breaks in message
        if (config.message) {
            this.body.innerHTML = config.message.replace(/\n/g, '<br>');
        } else {
            this.body.textContent = '';
        }
        
        // Clear previous buttons
        this.buttons.innerHTML = '';
        
        // Add new buttons with enhanced interaction
        if (config.buttons) {
            config.buttons.forEach((buttonConfig, index) => {
                const button = document.createElement('button');
                button.className = `modal-button ${buttonConfig.primary ? 'primary' : ''}`;
                button.textContent = buttonConfig.text;
                
                // Enhanced click/tap handling
                const handleActivation = () => {
                    if (buttonConfig.callback) {
                        buttonConfig.callback();
                    }
                };
                
                button.addEventListener('click', handleActivation);
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    handleActivation();
                });
                
                // Keyboard navigation support
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleActivation();
                    }
                });
                
                // Focus first button or primary button
                if (index === 0 || buttonConfig.primary) {
                    setTimeout(() => button.focus(), 100);
                }
                
                this.buttons.appendChild(button);
            });
        }
        
        // Show modal
        this.overlay.style.display = 'flex';
        this.isVisible = true;
        
        // Focus first button for keyboard accessibility
        const firstButton = this.buttons.querySelector('.modal-button');
        if (firstButton) {
            firstButton.focus();
        }
    }
    
    hide() {
        this.overlay.style.display = 'none';
        this.isVisible = false;
    }
    
    isShowing() {
        return this.isVisible;
    }
}

// Make Game class available globally for auto system
window.Game = Game;