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

    // Placeholder methods for systems not yet modularized

    handleGameOver() {
        // Will be implemented in StateManager
        console.warn('handleGameOver not yet implemented in modular system');
    }

    handleVictory(victoryData) {
        // Will be implemented in StateManager
        console.warn('handleVictory not yet implemented in modular system');
    }

    calculateFinalScore() {
        // Will be implemented in StateManager
        console.warn('calculateFinalScore not yet implemented in modular system');
        return 0;
    }

    setupDebugCommands() {
        // Will be implemented in DebugManager
        console.warn('setupDebugCommands not yet implemented in modular system');
    }

    showLoreInConsole() {
        // Will be implemented in StateManager
        console.warn('showLoreInConsole not yet implemented in modular system');
    }

    showHelpModal() {
        // Will be implemented in StateManager  
        console.warn('showHelpModal not yet implemented in modular system');
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