class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.particles = new ParticleSystem(this.renderer);
        
        this.gameState = new GameState();
        this.combat = new CombatSystem(this.gameState);
        this.upgrades = new UpgradeSystem(this.gameState);
        this.modal = new ModalManager();
        
        // Initialize event system and narrative UI
        this.events = GameEvents; // Use global event bus
        this.narrativeUI = new NarrativeUI(this.events);
        this.cutsceneManager = new CutsceneManager(this.events, this.narrativeUI);
        this.campaignSystem = new CampaignSystem(this.events, this.gameState);
        this.menuSystem = new MenuSystem(this);
        
        // Expose cutscene manager for debugging
        window.cutsceneManager = this.cutsceneManager;
        
        this.autoExploreTarget = null;
        this.animationFrame = null;
        this.lastEnergyRegen = Date.now();
        
        this.inputEnabled = true;
        this.gameOver = false;
        this.lastInputTime = 0;
        this.inputThrottle = 50; // 50ms between inputs
        this.gameStartTime = Date.now();
        
        // Debug mode
        this.debug = CONFIG.FEATURES.DEBUG_MODE;
        this.debugInfo = {
            fps: 0,
            frameTime: 0,
            lastFrameTime: performance.now(),
            frameCount: 0
        };
        
        this.setupGameEventListeners();
        this.setupVisibilityHandling();
    }
    
    init() {
        // Show menu system first - game initialization happens when campaign starts
        this.startGameLoop();
        this.startEnergyRegeneration();
        
        // Don't initialize game state immediately - let menu system handle it
        // Menu will call initGameState() when campaign starts
    }
    
    initGameState() {
        // Called by menu system when starting campaign
        this.gameState.init();
        this.setupEventListeners();
        this.updateUI();
        
        this.gameState.addMessage('Welcome to The Cursed Depths!', 'level-msg');
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
    }
    
    setupVisibilityHandling() {
        // Pause auto-explore when tab becomes inactive (QoL improvement)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState.settings.autoExplore) {
                this.gameState.settings.autoExplore = false;
                this.gameState.addMessage('Auto-explore paused (tab inactive)', 'level-msg');
                if (document.getElementById('auto-explore-status')) {
                    document.getElementById('auto-explore-status').textContent = 'OFF';
                }
            }
        });
    }
    
    setupGameEventListeners() {
        // Listen for important game events to trigger narratives
        this.events.on('player.died', () => {
            this.narrativeUI.showDeathNarrative();
        });
        
        this.events.on('player.levelup', (eventData) => {
            this.events.emit('narrative.triggered', {
                narrative: `Experience transforms you! You feel the power of level ${eventData.data.newLevel} coursing through your being!`,
                importance: 'high'
            });
        });
        
        this.events.on('floor.completed', (eventData) => {
            this.narrativeUI.showFloorCompletionNarrative(eventData.data);
        });
        
        // Add keyboard shortcut for lore viewing
        document.addEventListener('keydown', (e) => {
            if (e.key === 'l' || e.key === 'L') {
                if (!this.modal.isShowing()) {
                    this.showLoreInConsole();
                }
            }
        });
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Prevent arrow key scrolling
        window.addEventListener('keydown', (e) => {
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
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.style.backgroundColor = '#555555';
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.style.backgroundColor = '';
                
                // Trigger the click event
                if (button.onclick) {
                    button.onclick();
                }
            });
            
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                button.style.backgroundColor = '';
            });
            
            // Enhanced hover effects for mouse users
            button.addEventListener('mousedown', () => {
                button.style.backgroundColor = '#555555';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.backgroundColor = '';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = '';
            });
        });
        
        // Add touch support to canvas for mobile gameplay
        this.setupCanvasTouchControls();
    }
    
    setupCanvasTouchControls() {
        let touchStartX, touchStartY;
        const canvas = this.canvas;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!touchStartX || !touchStartY) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            
            // Minimum swipe distance
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
                // Determine swipe direction
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
            touchStartX = touchStartY = null;
        });
        
        canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            touchStartX = touchStartY = null;
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
        
        if (!this.inputEnabled || this.gameOver) return;
        if (!this.gameState.player || this.gameState.player.energy <= 0) return;
        
        // Throttle input to prevent spam
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
                if (this.gameState.settings.autoExplore) {
                    this.toggleAutoExplore();
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
                if (this.gameState.settings.autoExplore) {
                    this.toggleAutoExplore();
                }
                return;
            // Debug keys
            case 'd':
            case 'D':
                if (CONFIG.FEATURES.DEBUG_MODE) {
                    this.debug = !this.debug;
                    this.gameState.addMessage(`Debug mode: ${this.debug ? 'ON' : 'OFF'}`, 'level-msg');
                }
                return;
            case 'g':
            case 'G':
                if (this.debug) {
                    // Give gold
                    this.gameState.player.gold += 100;
                    this.gameState.addMessage('Debug: +100 gold', 'heal-msg');
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
            
            player.moveTo(newX, newY);
            
            // Emit player moved event
            this.events.emit('player.moved', {
                player: player,
                from: { x: player.x - dx, y: player.y - dy },
                to: { x: newX, y: newY },
                direction: { dx, dy }
            });
            
            // Check for item pickup
            const item = this.gameState.getItemAt(newX, newY);
            if (item) {
                const result = item.apply(player);
                this.gameState.addMessage(result.message, result.type);
                
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
                
                if (item.type === 'gold') {
                    this.gameState.stats.goldCollected += item.value;
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
            this.processEnemyTurns();
            
            // Emit turn processed (for atmospheric events)
            this.events.emit('turn.processed', {
                player: player,
                floor: this.gameState.floor,
                turn: this.gameState.turn || 0
            });
        }
    }
    
    handleCombat(enemy) {
        if (!this.gameState.player.useEnergy(CONFIG.BALANCE.COMBAT_ENERGY_COST)) {
            return;
        }
        
        const result = this.combat.playerAttack(enemy);
        
        // Emit combat events
        this.events.emit('combat.attack', {
            attacker: this.gameState.player,
            target: enemy,
            damage: result.damage,
            critical: result.critical,
            killed: result.killed
        });
        
        if (result.killed) {
            // Emit enemy killed event
            this.events.emit('enemy.killed', {
                enemy: enemy,
                killer: this.gameState.player,
                floor: this.gameState.floor,
                combat: result
            });
            
            if (this.gameState.settings.particlesEnabled) {
                this.particles.addExplosion(enemy.x, enemy.y, '#a44');
            }
        }
        
        // Show floating combat text
        this.narrativeUI.showCombatNarrative(
            this.gameState.player, 
            enemy, 
            result.damage, 
            result.critical
        );
        
        if (this.gameState.player.hp <= 0) {
            this.handleGameOver();
        }
    }
    
    handleStairs() {
        const previousFloor = this.gameState.floor;
        this.gameState.nextFloor();
        
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
        
        setTimeout(() => {
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
        
        // Process poison damage
        if (player.hasStatusEffect('poison')) {
            const damage = player.takeDamage(1);
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
            enemy.moveTo(newX, newY);
        }
    }
    
    toggleAutoExplore() {
        this.gameState.settings.autoExplore = !this.gameState.settings.autoExplore;
        document.getElementById('auto-explore-status').textContent = 
            this.gameState.settings.autoExplore ? 'ON' : 'OFF';
        
        if (this.gameState.settings.autoExplore) {
            this.autoExploreStep();
        }
    }
    
    autoExploreStep() {
        if (!this.gameState.settings.autoExplore || 
            this.gameState.player.energy < CONFIG.BALANCE.MOVE_ENERGY_COST ||
            this.gameOver) {
            return;
        }
        
        const player = this.gameState.player;
        let target = this.findAutoExploreTarget(player);
        
        if (target) {
            // Use A* pathfinding for smart movement
            const path = this.findPath(player.x, player.y, target.x, target.y);
            if (path && path.length > 1) {
                const nextStep = path[1];
                const dx = nextStep.x - player.x;
                const dy = nextStep.y - player.y;
                this.movePlayer(dx, dy);
            } else {
                // Fallback to direct movement
                const dx = Math.sign(target.x - player.x);
                const dy = Math.sign(target.y - player.y);
                this.movePlayer(dx || 0, dy || 0);
            }
        }
        
        // Continue auto-exploring
        setTimeout(() => this.autoExploreStep(), CONFIG.GAME.AUTO_EXPLORE_DELAY);
    }
    
    findAutoExploreTarget(player) {
        // Check for nearby enemies first
        const nearbyEnemies = this.gameState.enemies.filter(enemy => {
            const dist = player.distanceTo(enemy);
            return dist <= 3 && !this.gameState.fogOfWar[enemy.y][enemy.x];
        });
        
        // If enemies nearby and player is low health, prioritize escape
        if (nearbyEnemies.length > 0 && player.hp < player.maxHp * 0.5) {
            // Find safe direction away from enemies
            const safeSpot = this.findSafeSpot(player, nearbyEnemies);
            if (safeSpot) return safeSpot;
        }
        
        // Priority 1: Visible items (but avoid if enemies are guarding)
        if (!this.cachedVisibleItems || this.lastVisibleItemsCheck !== this.gameState.turn) {
            this.cachedVisibleItems = this.gameState.items.filter(item => {
                if (this.gameState.fogOfWar[item.y][item.x]) return false;
                
                // Check if enemies are near the item
                const enemiesNearItem = this.gameState.enemies.filter(e => 
                    e.distanceTo(item) <= 2 && !this.gameState.fogOfWar[e.y][e.x]
                );
                
                // Only go for item if we're healthy or no enemies guard it
                return player.hp > player.maxHp * 0.7 || enemiesNearItem.length === 0;
            });
            this.lastVisibleItemsCheck = this.gameState.turn;
        }
        
        if (this.cachedVisibleItems.length > 0) {
            return this.cachedVisibleItems.reduce((closest, item) => {
                const dist = player.distanceTo(item);
                return dist < player.distanceTo(closest) ? item : closest;
            });
        }
        
        // Priority 2: Closest unexplored area (spiral search)
        const unexplored = this.findClosestUnexplored(player.x, player.y);
        if (unexplored) return unexplored;
        
        // Priority 3: Stairs (only if healthy enough)
        if (player.hp > player.maxHp * 0.3) {
            return { x: this.gameState.stairsX, y: this.gameState.stairsY };
        }
        
        // Priority 4: Find a safe corner to recover
        return this.findSafeCorner(player);
    }
    
    findSafeSpot(player, enemies) {
        // Find the average enemy position
        let enemyX = 0, enemyY = 0;
        for (const enemy of enemies) {
            enemyX += enemy.x;
            enemyY += enemy.y;
        }
        enemyX /= enemies.length;
        enemyY /= enemies.length;
        
        // Move in opposite direction
        const dx = Math.sign(player.x - enemyX);
        const dy = Math.sign(player.y - enemyY);
        
        // Try to find a valid spot in that direction
        for (let dist = 1; dist <= 3; dist++) {
            const targetX = player.x + dx * dist;
            const targetY = player.y + dy * dist;
            
            if (this.gameState.inBounds(targetX, targetY) && 
                !this.gameState.isWall(targetX, targetY)) {
                return { x: targetX, y: targetY };
            }
        }
        
        return null;
    }
    
    findSafeCorner(player) {
        // Find a corner position to recover in
        const corners = [
            { x: 1, y: 1 },
            { x: CONFIG.GRID_WIDTH - 2, y: 1 },
            { x: 1, y: CONFIG.GRID_HEIGHT - 2 },
            { x: CONFIG.GRID_WIDTH - 2, y: CONFIG.GRID_HEIGHT - 2 }
        ];
        
        return corners
            .filter(c => !this.gameState.isWall(c.x, c.y))
            .reduce((closest, corner) => {
                const dist = player.distanceTo(corner);
                return dist < player.distanceTo(closest) ? corner : closest;
            });
    }
    
    findClosestUnexplored(startX, startY) {
        const maxRadius = Math.max(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
        
        for (let radius = 1; radius <= maxRadius; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const x = startX + dx;
                        const y = startY + dy;
                        
                        if (this.gameState.inBounds(x, y) && 
                            !this.gameState.isWall(x, y) && 
                            this.gameState.fogOfWar[y][x]) {
                            return { x, y };
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    // Simple A* pathfinding with safety limits
    findPath(startX, startY, targetX, targetY) {
        const openSet = [{ x: startX, y: startY, g: 0, h: this.heuristic(startX, startY, targetX, targetY), f: 0, parent: null }];
        const closedSet = new Set();
        const maxNodes = 100; // Prevent infinite loops
        let nodesExpanded = 0;
        
        while (openSet.length > 0 && nodesExpanded < maxNodes) {
            nodesExpanded++;
            // Find lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            if (current.x === targetX && current.y === targetY) {
                // Reconstruct path
                const path = [];
                let node = current;
                while (node) {
                    path.unshift({ x: node.x, y: node.y });
                    node = node.parent;
                }
                return path;
            }
            
            closedSet.add(`${current.x},${current.y}`);
            
            // Check neighbors
            for (const [dx, dy] of [[-1,0], [1,0], [0,-1], [0,1]]) {
                const nx = current.x + dx;
                const ny = current.y + dy;
                
                if (!this.gameState.inBounds(nx, ny) || 
                    this.gameState.isWall(nx, ny) ||
                    closedSet.has(`${nx},${ny}`)) {
                    continue;
                }
                
                const g = current.g + 1;
                const h = this.heuristic(nx, ny, targetX, targetY);
                const f = g + h;
                
                const existing = openSet.find(n => n.x === nx && n.y === ny);
                if (!existing || g < existing.g) {
                    const neighbor = { x: nx, y: ny, g, h, f, parent: current };
                    if (existing) {
                        Object.assign(existing, neighbor);
                    } else {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        return null; // No path found
    }
    
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    
    startEnergyRegeneration() {
        setInterval(() => {
            const player = this.gameState.player;
            if (player && !this.gameOver && player.energy < player.maxEnergy) {
                player.restoreEnergy(CONFIG.GAME.ENERGY_REGEN_AMOUNT);
                this.updateUI();
            }
        }, CONFIG.GAME.ENERGY_REGEN_RATE);
    }
    
    render() {
        this.renderer.clear();
        
        // Only render if game state is initialized
        if (!this.gameState.map || !this.gameState.fogOfWar || !this.gameState.explored) {
            return;
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
        
        // Draw enemy vision ranges (only for nearby visible enemies to reduce lag)
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = '#f44';
        ctx.lineWidth = 1;
        for (const enemy of this.gameState.enemies) {
            // Only show vision for enemies that are visible and close to player (performance optimization)
            if (!this.gameState.fogOfWar[enemy.y][enemy.x] && 
                enemy.distanceTo(this.gameState.player) <= 5) {
                const centerX = enemy.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
                const centerY = enemy.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, enemy.viewRange * CONFIG.CELL_SIZE, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Draw pathfinding target
        if (this.autoExploreTarget && this.gameState.settings.autoExplore) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#0f0';
            ctx.fillRect(
                this.autoExploreTarget.x * CONFIG.CELL_SIZE,
                this.autoExploreTarget.y * CONFIG.CELL_SIZE,
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
        
        // Show coordinates on hover (would need mouse tracking)
        // Show grid lines
        if (this.debug) {
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= CONFIG.GRID_WIDTH; x++) {
                ctx.beginPath();
                ctx.moveTo(x * CONFIG.CELL_SIZE, 0);
                ctx.lineTo(x * CONFIG.CELL_SIZE, CONFIG.GRID_HEIGHT * CONFIG.CELL_SIZE);
                ctx.stroke();
            }
            for (let y = 0; y <= CONFIG.GRID_HEIGHT; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * CONFIG.CELL_SIZE);
                ctx.lineTo(CONFIG.GRID_WIDTH * CONFIG.CELL_SIZE, y * CONFIG.CELL_SIZE);
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
        
        // Upgrade costs
        const upgradeInfo = this.upgrades.getUpgradeInfo();
        document.getElementById('attack-cost').textContent = upgradeInfo.attack.cost;
        document.getElementById('defense-cost').textContent = upgradeInfo.defense.cost;
        document.getElementById('upgrade-attack').disabled = !upgradeInfo.attack.canAfford;
        document.getElementById('upgrade-defense').disabled = !upgradeInfo.defense.canAfford;
        
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
    
    updateExplorationProgress() {
        const explorationElement = document.getElementById('exploration-percent');
        const explorationBar = document.getElementById('exploration-bar');
        
        if (explorationElement && explorationBar && this.gameState.explored) {
            let exploredCount = 0;
            let totalWalkable = 0;
            
            for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
                for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                    if (!this.gameState.isWall(x, y)) {
                        totalWalkable++;
                        if (this.gameState.explored[y][x]) {
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
    upgradeAttack() {
        this.upgrades.purchaseAttackUpgrade();
        this.updateUI();
    }
    
    upgradeDefense() {
        this.upgrades.purchaseDefenseUpgrade();
        this.updateUI();
    }
    
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
        let helpText = `MOVEMENT:\n↑↓←→ or WASD - Move character\n\nCOMBAT:\nMove into enemies to attack\nEnemies attack when adjacent\nPositional bonuses apply!\n\nGAME CONTROLS:\nZ - Toggle Auto-Explore\nP - Pause Auto-Explore\nESC - Stop Auto-Explore\nL - View Collected Lore\nI - Quick Info Summary\nH or ? - Show this help\n\nCAMPAIGN:\nConquer 3 cursed floors\nEach floor has unique lore\nDefeat the final evil\nSave the kingdom!`;
        
        if (CONFIG.FEATURES.DEBUG_MODE) {
            helpText += `\n\nDEBUG COMMANDS:\nD - Toggle debug display\nG - Give 100 gold\nL - Level up\nR - Reveal entire map`;
        }
        
        if (CONFIG.FEATURES.DIRECTIONAL_COMBAT) {
            helpText += `\n\nCOMBAT TIPS:\nAttack from behind for +50% damage\nAttack from side for +25% damage\nFace enemies to block 25% damage`;
        }
        
        this.modal.show({
            title: 'PIXEL ROGUELIKE - HELP',
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
                narrative: "📜 No lore has been discovered yet. Explore to uncover the secrets of the depths!",
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
            narrative: "📜 Press L again to view your lore collection",
            importance: 'normal'
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