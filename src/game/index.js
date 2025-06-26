/**
 * Game Module Loader
 * 
 * This file loads all game modules in the correct order and provides a single
 * entry point for the modular game system while maintaining the vanilla JS
 * global namespace pattern.
 * 
 * Loading Order:
 * 1. ResourceManager - Memory management utilities
 * 2. InputManager - Input handling and touch support  
 * 3. GameLoop - Rendering and update loops
 * 4. PlayerController - Player movement and actions
 * 5. GameCore - Main Game class that ties everything together
 * 
 * Note: CombatManager, StateManager, DebugManager will be added in future iterations
 */

// Module loading is handled by script tags in index.html
// This file serves as documentation and can contain initialization logic

/**
 * Initialize the modular game system
 * Called after all modules are loaded
 */
function initializeModularGame() {
    // Verify all required modules are loaded
    const requiredModules = [
        'ModalManager',
        'ResourceManager',
        'ResourceManagerMixin', 
        'InputManager',
        'InputManagerMixin',
        'GameLoop',
        'GameLoopMixin',
        'PlayerController', 
        'PlayerControllerMixin',
        'CombatManager',
        'CombatManagerMixin',
        'Game'
    ];
    
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
        console.error('Missing required modules:', missingModules);
        alert('Game initialization failed: Missing required modules. Please refresh the page.');
        return false;
    }
    
    console.log('✅ All game modules loaded successfully');
    console.log('📦 Modular game system initialized');
    
    return true;
}

/**
 * Global initialization function called from index.html
 */
window.initializeGame = function() {
    if (!initializeModularGame()) {
        return;
    }
    
    try {
        // Create global game instance (maintains existing API)
        window.game = new Game();
        
        // Initialize the game
        window.game.init();
        
        console.log('🎮 Game instance created and initialized');
        
    } catch (error) {
        console.error('Game initialization failed:', error);
        alert('Failed to start game. Please refresh the page.');
    }
};

// Export for debugging
window.gameModules = {
    version: '2.0.0-modular',
    modules: [
        'ModalManager',
        'ResourceManager',
        'InputManager', 
        'GameLoop',
        'PlayerController',
        'CombatManager',
        'GameCore'
    ],
    status: 'loaded'
};