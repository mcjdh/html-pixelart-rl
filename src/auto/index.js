/**
 * Auto System Module Index
 * 
 * Loads and initializes all auto-completion components in the correct order.
 * This is the main entry point for the unified auto-completion system.
 */

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
    
    // Verify required dependencies are available
    let lastMissingDep = '';
    const checkDependencies = () => {
        // Check CONFIG first
        if (!window.CONFIG) {
            if (lastMissingDep !== 'CONFIG') {
                console.warn('AutoSystem: Waiting for CONFIG to load...');
                lastMissingDep = 'CONFIG';
            }
            return false;
        }
        
        // Check if Game class is available (it might not be instantiated yet)
        if (!window.Game) {
            if (lastMissingDep !== 'Game') {
                console.warn('AutoSystem: Waiting for Game class to load...');
                lastMissingDep = 'Game';
            }
            return false;
        }
        
        // Check if game instance exists and is initialized
        if (!window.game) {
            if (lastMissingDep !== 'game') {
                console.warn('AutoSystem: Waiting for game instance to be created...');
                lastMissingDep = 'game';
            }
            return false;
        }
        
        return true;
    };
    
    // Track initialization attempts to avoid spam
    let initAttempts = 0;
    const maxAttempts = 20;
    
    // Initialize auto system when dependencies are ready
    const initializeAutoSystem = () => {
        initAttempts++;
        
        if (!checkDependencies()) {
            if (initAttempts < maxAttempts) {
                // Retry with exponential backoff
                const retryTime = Math.min(100 * Math.pow(1.2, initAttempts), 2000);
                setTimeout(initializeAutoSystem, retryTime);
            } else {
                console.warn('AutoSystem: Gave up after', maxAttempts, 'attempts. Use window.initAutoSystem() to try again.');
            }
            return;
        }
        
        try {
            // Verify game state and instance are available
            if (!window.game || !window.game.gameState) {
                console.warn('AutoSystem: Game not fully initialized, retrying...');
                setTimeout(initializeAutoSystem, 1000);
                return;
            }
            
            // Initialize the unified auto system
            window.autoSystemInstance = new AutoSystem(window.game.gameState, window.game);
            
            // Set the autoSystem reference in the game instance for integration
            window.game.autoSystem = window.autoSystemInstance;
            
            console.log('🤖 Auto System initialized successfully!');
            console.log('Type autoSystem.help() for available commands.');
            
            // Show quick start guide
            setTimeout(() => {
                console.log(`
🚀 QUICK START GUIDE:
• autoSystem.startSpeedRun()    - Full campaign speedrun
• autoSystem.startFloor()       - Single floor automation  
• autoSystem.stop()             - Stop all automation
• autoSystem.help()             - Full command list
                `);
            }, 1000);
            
        } catch (error) {
            console.error('AutoSystem: Initialization failed:', error);
        }
    };
    
    // Auto system will be initialized manually from the main script
    // after the game instance is created
    
    // Provide manual initialization function for debugging
    window.initAutoSystem = initializeAutoSystem;
    
} else {
    console.log('AutoSystem: Not in browser environment, skipping initialization');
}

// Export information about the auto system
const AUTO_SYSTEM_INFO = {
    version: '1.0.0',
    components: [
        'AutoExplorerFinal - Original production AI',
        'AutoExplorerEnhanced - Advanced tactical AI', 
        'AutoGameRunner - Full campaign automation',
        'AutoExplorerManager - AI switching interface',
        'AutoSystem - Unified control interface'
    ],
    features: [
        'Full 12-floor campaign automation',
        'Multiple AI strategies (speedrun/balanced/complete/adaptive)',
        'Performance tracking and statistics',
        'AI switching based on floor difficulty',
        'Death recovery and retry logic',
        'Console interface for easy control'
    ],
    modes: {
        speedrun: 'Fast completion with minimal collection',
        balanced: 'Standard exploration with moderate collection',
        complete: 'Thorough exploration with maximum collection',
        adaptive: 'Smart strategy switching based on floor type'
    }
};

if (typeof window !== 'undefined') {
    window.AUTO_SYSTEM_INFO = AUTO_SYSTEM_INFO;
}