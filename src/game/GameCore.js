/**
 * GameCore - Main Game class that coordinates all systems
 * Integrates all the modular mixins into a cohesive game experience
 */
class Game {
    constructor() {
        try {
            // Initialize DOM elements
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error('Game canvas element not found');
            }
            
            // Initialize core systems
            this.renderer = new Renderer(this.canvas);
            this.particles = new ParticleSystem(this.renderer);
            this.gameState = new GameState(this.renderer);
            this.combat = new CombatSystem(this.gameState);
            this.modal = new ModalManager();
            
            // Initialize event system and narrative UI
            this.events = GameEvents; // Use global event bus
            this.narrativeUI = new NarrativeUI(this.events);
            this.cutsceneManager = new CutsceneManager(this.events, this.narrativeUI);
            this.campaignSystem = new CampaignSystem(this.events, this.gameState);
            this.menuSystem = new MenuSystem(this);
            
            // Expose cutscene manager for debugging
            window.cutsceneManager = this.cutsceneManager;
            
            // Initialize game timing
            this.lastEnergyRegen = Date.now();
            this.lastHpRegen = Date.now();
            this.lastCombatTime = Date.now();
            this.gameStartTime = Date.now();
            
            // Initialize auto-completion system
            this.autoSystem = null; // Will be initialized by the auto system loader
            
            // Initialize game state flags
            this.gameOver = false;
            this.gameVictory = false;
            this.debug = CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS;
            
            // Initialize modular functionality
            window.ResourceManager.initResourceTracking(this);
            window.InputManager.initInputProperties(this);
            window.GameLoop.initGameLoopProperties(this);
            
            // Apply all mixins to this instance
            Object.assign(this, window.ResourceManagerMixin);
            Object.assign(this, window.InputManagerMixin);
            Object.assign(this, window.GameLoopMixin);
            Object.assign(this, window.PlayerControllerMixin);
            Object.assign(this, window.CombatManagerMixin);
            
            // Setup initial event listeners
            this.setupGameEventListeners();
            this.setupVisibilityHandling();
            
        } catch (error) {
            console.error('Game constructor failed:', error);
            this.showErrorMessage('Failed to initialize game. Please refresh the page.');
            throw error;
        }
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
            this.gameState.init();
            
            // Initialize skill system if available
            if (this.gameState.player && typeof window.initializeSkills === 'function') {
                window.initializeSkills(this.gameState.player);
                
                // Brief delay for skill system initialization
                this.addTimeoutTracked(() => {
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

    /**
     * Set up game-specific event listeners
     */
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

    /**
     * Start energy regeneration system
     */
    startEnergyRegeneration() {
        this.addIntervalTracked(() => {
            const player = this.gameState.player;
            if (player && !this.gameOver && player.energy < player.maxEnergy) {
                player.restoreEnergy(CONFIG.GAME.ENERGY_REGEN_AMOUNT);
                this.updateUI();
            }
        }, CONFIG.GAME.ENERGY_REGEN_RATE);
    }

    /**
     * Start health regeneration system
     */
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
                            this.gameState.addMessage(`Natural healing restores ${Math.round(healed)} HP`, 'heal-msg');
                            this.updateUI();
                        }
                    }
                }
            }
        }, CONFIG.BALANCE.NATURAL_HEALING.HP_REGEN_RATE);
    }

    /**
     * Show error message to user
     */
    showErrorMessage(message) {
        try {
            if (this.modal && this.modal.show) {
                this.modal.show({
                    title: 'ERROR',
                    message: message,
                    buttons: [
                        {
                            text: 'OK',
                            primary: true,
                            callback: () => this.modal.hide()
                        }
                    ]
                });
            } else {
                alert('ERROR: ' + message);
            }
        } catch (e) {
            alert('CRITICAL ERROR: ' + message);
        }
    }

    // Game state management methods

    handleGameOver() {
        if (this.gameOver) return; // Prevent multiple triggers
        
        this.gameOver = true;
        const finalScore = this.calculateFinalScore();
        
        // Emit game over event
        this.events.emit('game.over', {
            player: this.gameState.player,
            floor: this.gameState.floor,
            score: finalScore
        });
        
        this.modal.show({
            title: 'GAME OVER',
            message: `Your adventure ends on floor ${this.gameState.floor}.\n\nFinal Score: ${finalScore}`,
            buttons: [
                {
                    text: 'New Game',
                    primary: true,
                    callback: () => {
                        this.modal.hide();
                        window.location.reload();
                    }
                },
                {
                    text: 'View Stats',
                    callback: () => {
                        this.showFinalStats();
                    }
                }
            ]
        });
    }

    handleVictory(victoryData) {
        if (this.gameVictory) return; // Prevent multiple triggers
        
        this.gameVictory = true;
        const finalScore = this.calculateFinalScore();
        
        // Emit victory event
        this.events.emit('game.victory', {
            player: this.gameState.player,
            victoryData: victoryData,
            score: finalScore
        });
        
        this.modal.show({
            title: 'VICTORY!',
            message: `Congratulations! You have completed the campaign!\n\nFinal Score: ${finalScore}\n\nYou have proven yourself a true hero of the realm.`,
            buttons: [
                {
                    text: 'New Game',
                    primary: true,
                    callback: () => {
                        this.modal.hide();
                        window.location.reload();
                    }
                },
                {
                    text: 'View Stats',
                    callback: () => {
                        this.showFinalStats();
                    }
                }
            ]
        });
    }

    calculateFinalScore() {
        if (!this.gameState || !this.gameState.player) return 0;
        
        const player = this.gameState.player;
        const gameTime = Date.now() - this.gameStartTime;
        const timeBonus = Math.max(0, 100000 - Math.floor(gameTime / 1000)); // Time bonus
        
        const score = 
            (this.gameState.floor * 1000) +           // 1000 per floor completed
            (player.gold) +                           // Gold collected
            (player.level * 500) +                    // 500 per level
            (player.enemiesKilled * 50) +             // 50 per enemy killed
            (player.hp > 0 ? player.hp * 10 : 0) +   // 10 per remaining HP
            timeBonus;                                // Time bonus
        
        return Math.max(0, score);
    }

    setupDebugCommands() {
        if (!CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) return;
        
        const commands = {
            help: () => {
                console.log('Available debug commands:');
                console.log('debugCommands.giveGold(amount) - Add gold');
                console.log('debugCommands.teleport(x, y) - Teleport player');
                console.log('debugCommands.godMode() - Toggle invincibility');
                console.log('debugCommands.revealMap() - Remove fog of war');
                console.log('debugCommands.spawnEnemy(type) - Spawn enemy');
                console.log('debugCommands.levelUp() - Gain a level');
                console.log('debugCommands.nextFloor() - Go to next floor');
                console.log('debugCommands.toggleDebugRender() - Toggle debug overlays');
            },
            
            giveGold: (amount = CONFIG.DEBUG.GOLD_AMOUNT) => {
                if (this.gameState && this.gameState.player) {
                    this.gameState.player.gold += amount;
                    this.updateUI();
                    console.log(`Added ${amount} gold`);
                }
            },
            
            teleport: (x, y) => {
                if (this.gameState && this.gameState.player && typeof x === 'number' && typeof y === 'number') {
                    this.gameState.player.x = x;
                    this.gameState.player.y = y;
                    this.gameState.updateFogOfWar();
                    this.render();
                    console.log(`Teleported to (${x}, ${y})`);
                }
            },
            
            godMode: () => {
                if (this.gameState && this.gameState.player) {
                    this.gameState.player.godMode = !this.gameState.player.godMode;
                    console.log('God mode:', this.gameState.player.godMode ? 'ON' : 'OFF');
                }
            },
            
            revealMap: () => {
                if (this.gameState) {
                    this.gameState.revealAllTiles();
                    this.render();
                    console.log('Map revealed');
                }
            },
            
            spawnEnemy: (type = 'goblin') => {
                if (this.gameState) {
                    const player = this.gameState.player;
                    const enemy = this.gameState.spawnEnemyNear(player.x, player.y, type);
                    if (enemy) {
                        this.render();
                        console.log(`Spawned ${type} at (${enemy.x}, ${enemy.y})`);
                    }
                }
            },
            
            levelUp: () => {
                if (this.gameState && this.gameState.player) {
                    this.gameState.player.gainExperience(this.gameState.player.expToNext);
                    this.updateUI();
                    console.log('Level up!');
                }
            },
            
            nextFloor: () => {
                if (this.gameState) {
                    this.gameState.goToNextFloor();
                    console.log(`Advanced to floor ${this.gameState.floor}`);
                }
            },
            
            toggleDebugRender: () => {
                CONFIG.DEBUG.SHOW_ENEMY_VISION = !CONFIG.DEBUG.SHOW_ENEMY_VISION;
                CONFIG.DEBUG.SHOW_PATHFINDING = !CONFIG.DEBUG.SHOW_PATHFINDING;
                this.render();
                console.log('Debug overlays:', CONFIG.DEBUG.SHOW_ENEMY_VISION ? 'ON' : 'OFF');
            }
        };
        
        window.debugCommands = commands;
        console.log('Debug commands loaded. Type debugCommands.help() for help.');
    }

    showLoreInConsole() {
        if (!this.gameState || !this.gameState.areaManager) return;
        
        const currentArea = this.gameState.areaManager.currentArea;
        if (!currentArea || !currentArea.lore) {
            this.gameState.addMessage('No lore available for this area.', 'system-msg');
            return;
        }
        
        this.gameState.addMessage('=== AREA LORE ===', 'lore-msg');
        this.gameState.addMessage(currentArea.name + ':', 'lore-msg');
        
        if (typeof currentArea.lore === 'string') {
            this.gameState.addMessage(currentArea.lore, 'lore-msg');
        } else if (Array.isArray(currentArea.lore)) {
            currentArea.lore.forEach(line => {
                this.gameState.addMessage(line, 'lore-msg');
            });
        }
        
        this.gameState.addMessage('================', 'lore-msg');
    }

    showHelpModal() {
        this.modal.show({
            title: 'HELP',
            message: `MOVEMENT:
Arrow Keys / WASD - Move player
Diagonal movement supported

COMBAT:
Move into enemies to attack
Energy system limits actions
Status effects may apply

EXPLORATION:
L - View area lore
Stairs advance to next floor
Collect gold and items

AUTO-EXPLORE:
Type in console:
autoSystem.startFloor() - AI explores current floor
autoSystem.startSpeedRun() - Complete campaign`,
            buttons: [
                {
                    text: 'Close',
                    primary: true,
                    callback: () => this.modal.hide()
                }
            ]
        });
    }

    showFinalStats() {
        if (!this.gameState || !this.gameState.player) return;
        
        const player = this.gameState.player;
        const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        
        const stats = `FINAL STATISTICS:

Floor Reached: ${this.gameState.floor}
Player Level: ${player.level}
Enemies Defeated: ${player.enemiesKilled || 0}
Gold Collected: ${player.gold}
Time Played: ${minutes}m ${seconds}s
Final Score: ${this.calculateFinalScore()}

HP: ${player.hp}/${player.maxHp}
Attack: ${player.attack}
Defense: ${player.defense}`;
        
        this.modal.show({
            title: 'FINAL STATISTICS',
            message: stats,
            buttons: [
                {
                    text: 'New Game',
                    primary: true,
                    callback: () => {
                        this.modal.hide();
                        window.location.reload();
                    }
                },
                {
                    text: 'Close',
                    callback: () => this.modal.hide()
                }
            ]
        });
    }

    // Public methods for UI buttons
    saveGame(silent = false) {
        try {
            this.gameState.saveGame();
            if (!silent) {
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
            }
        } catch (error) {
            console.error('Save failed:', error);
            if (!silent) {
                this.modal.show({
                    title: 'SAVE FAILED',
                    message: 'Could not save your progress. Please try again.',
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
    }

    loadGame() {
        if (this.gameState.loadGame()) {
            this.updateUI();
            this.render();
        } else {
            this.showErrorMessage('No save file found or save file is corrupted.');
        }
    }
}

// Make Game class globally available (maintaining vanilla JS pattern)
window.Game = Game;