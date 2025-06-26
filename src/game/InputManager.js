/**
 * InputManager - Handles all input events including keyboard, touch, and mobile controls
 * Manages event listeners, input throttling, and touch gestures
 */
window.InputManager = {
    /**
     * Initialize input-related properties on game instance
     */
    initInputProperties(gameInstance) {
        gameInstance.inputEnabled = true;
        gameInstance.lastInputTime = 0;
        gameInstance.inputThrottle = CONFIG.GAME.INPUT_THROTTLE;
    },

    /**
     * Set up all event listeners for input handling
     */
    setupEventListeners(gameInstance) {
        gameInstance.addEventListenerTracked(document, 'keydown', (e) => this.handleInput(gameInstance, e));
        
        // Prevent arrow key scrolling
        gameInstance.addEventListenerTracked(window, 'keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // Add touch support to UI buttons
        this.setupTouchSupport(gameInstance);
    },

    /**
     * Set up touch support for UI buttons and canvas
     */
    setupTouchSupport(gameInstance) {
        // Find all clickable buttons and add touch support
        const buttons = document.querySelectorAll('.compact-button');
        
        buttons.forEach(button => {
            // Add touch event handlers
            gameInstance.addEventListenerTracked(button, 'touchstart', (e) => {
                e.preventDefault();
                button.style.backgroundColor = '#555555';
            });
            
            gameInstance.addEventListenerTracked(button, 'touchend', (e) => {
                e.preventDefault();
                button.style.backgroundColor = '';
                
                // Trigger the click event
                if (button.onclick) {
                    button.onclick();
                }
            });
            
            gameInstance.addEventListenerTracked(button, 'touchcancel', (e) => {
                e.preventDefault();
                button.style.backgroundColor = '';
            });
            
            // Enhanced hover effects for mouse users
            gameInstance.addEventListenerTracked(button, 'mousedown', () => {
                button.style.backgroundColor = '#555555';
            });
            
            gameInstance.addEventListenerTracked(button, 'mouseup', () => {
                button.style.backgroundColor = '';
            });
            
            gameInstance.addEventListenerTracked(button, 'mouseleave', () => {
                button.style.backgroundColor = '';
            });
        });
        
        // Add touch support to canvas for mobile gameplay
        this.setupCanvasTouchControls(gameInstance);
    },

    /**
     * Set up canvas touch controls for mobile gameplay
     */
    setupCanvasTouchControls(gameInstance) {
        let touchStartX, touchStartY, touchStartTime;
        const canvas = gameInstance.canvas;
        
        gameInstance.addEventListenerTracked(canvas, 'touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        });
        
        gameInstance.addEventListenerTracked(canvas, 'touchend', (e) => {
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
                gameInstance.movePlayer(dx, dy);
            }
            
            // Reset touch coordinates
            touchStartX = touchStartY = touchStartTime = null;
        });
        
        gameInstance.addEventListenerTracked(canvas, 'touchcancel', (e) => {
            e.preventDefault();
            touchStartX = touchStartY = touchStartTime = null;
        });
    },

    /**
     * Set up visibility change handling for auto-explore pausing
     */
    setupVisibilityHandling(gameInstance) {
        // Pause auto-explore when tab becomes inactive (QoL improvement)
        gameInstance.addEventListenerTracked(document, 'visibilitychange', () => {
            if (document.hidden && gameInstance.autoSystem && gameInstance.autoSystem.getSystemStatus().explorerManager.enabled) {
                gameInstance.autoSystem.pauseAutomation();
                gameInstance.gameState.addMessage('Auto-explore paused (tab inactive)', 'level-msg');
            }
        });
    },

    /**
     * Handle keyboard input events
     */
    handleInput(gameInstance, e) {
        // Check if menu is active first
        if (gameInstance.menuSystem && gameInstance.menuSystem.isMenuVisible()) {
            return; // Let menu handle input
        }
        
        // Check if modal is open and handle modal input
        if (gameInstance.modal.isShowing()) {
            if (e.key === 'Escape') {
                gameInstance.modal.hide();
            }
            return;
        }
        
        if (!gameInstance.inputEnabled || gameInstance.gameOver || gameInstance.gameVictory) return;
        if (!gameInstance.gameState.player || gameInstance.gameState.player.energy <= 0) return;
        
        // Enhanced input throttling to prevent accidental double-inputs
        const now = Date.now();
        if (now - gameInstance.lastInputTime < gameInstance.inputThrottle) return;
        gameInstance.lastInputTime = now;
        
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
                gameInstance.toggleAutoExplore();
                return;
            case 'Escape':
                if (gameInstance.autoSystem && gameInstance.autoSystem.getSystemStatus().explorerManager.enabled) {
                    gameInstance.autoSystem.stopAllAutomation();
                }
                return;
            case 'h':
            case 'H':
            case '?':
                gameInstance.showHelpModal();
                return;
            case 'i':
            case 'I':
                // Quick info panel toggle (show player stats briefly)
                gameInstance.showQuickInfo();
                return;
            case 'p':
            case 'P':
                // Pause/unpause auto-explore
                if (gameInstance.autoSystem && gameInstance.autoSystem.getSystemStatus().explorerManager.enabled) {
                    gameInstance.autoSystem.pauseAutomation();
                }
                return;
            // Debug keys
            case 'd':
            case 'D':
                if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
                    gameInstance.debug = !gameInstance.debug;
                    gameInstance.gameState.addMessage(`Debug mode: ${gameInstance.debug ? 'ON' : 'OFF'}`, 'level-msg');
                }
                return;
            case 'g':
            case 'G':
                if (gameInstance.debug) {
                    // Give gold
                    gameInstance.gameState.player.gold += CONFIG.DEBUG.GOLD_AMOUNT;
                    gameInstance.gameState.addMessage(`Debug: +${CONFIG.DEBUG.GOLD_AMOUNT} gold`, 'heal-msg');
                }
                return;
            case 'l':
            case 'L':
                if (gameInstance.debug) {
                    // Level up
                    gameInstance.gameState.player.levelUp();
                    gameInstance.gameState.addMessage('Debug: Level up!', 'level-msg');
                }
                return;
            case 'r':
            case 'R':
                if (gameInstance.debug) {
                    // Reveal map
                    for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
                        for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                            gameInstance.gameState.fogOfWar[y][x] = false;
                            gameInstance.gameState.explored[y][x] = true;
                        }
                    }
                    gameInstance.gameState.addMessage('Debug: Map revealed', 'level-msg');
                }
                return;
            default:
                return;
        }
        
        e.preventDefault();
        gameInstance.movePlayer(dx, dy);
    },

    /**
     * Show quick player info
     */
    showQuickInfo(gameInstance) {
        const player = gameInstance.gameState.player;
        if (!player) return;
        
        // Show a brief overlay with current player stats
        const infoText = `📊 QUICK INFO\n\n` +
            `Level ${player.level} • HP: ${player.hp}/${player.maxHp} • Energy: ${player.energy}/${player.maxEnergy}\n` +
            `Attack: ${player.attack} • Defense: ${player.defense} • Gold: ${player.gold}\n` +
            `Floor: ${gameInstance.gameState.floor} • Enemies: ${gameInstance.gameState.enemies.length} • Items: ${gameInstance.gameState.items.length}`;
        
        gameInstance.gameState.addMessage(infoText, 'level-msg');
    }
};

/**
 * Mixin to add input management methods to Game class
 */
window.InputManagerMixin = {
    setupEventListeners() {
        return window.InputManager.setupEventListeners(this);
    },

    setupTouchSupport() {
        return window.InputManager.setupTouchSupport(this);
    },

    setupCanvasTouchControls() {
        return window.InputManager.setupCanvasTouchControls(this);
    },

    setupVisibilityHandling() {
        return window.InputManager.setupVisibilityHandling(this);
    },

    handleInput(e) {
        return window.InputManager.handleInput(this, e);
    },

    showQuickInfo() {
        return window.InputManager.showQuickInfo(this);
    }
};