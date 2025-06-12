/**
 * Unified Auto System - Complete Game Automation Interface
 * 
 * This is the main entry point for all auto-completion functionality.
 * Provides a unified interface for manual floor exploration and full campaign automation.
 */
class AutoSystem {
    constructor(gameState, gameInstance) {
        this.gameState = gameState;
        this.gameInstance = gameInstance;
        
        // Initialize subsystems
        this.gameRunner = null;
        this.explorerManager = null;
        this.mode = 'manual'; // manual, auto-floor, auto-campaign
        
        this.initializeSubsystems();
        this.setupEventIntegration();
        this.registerConsoleInterface();
    }
    
    initializeSubsystems() {
        try {
            // Initialize game runner for full automation
            if (window.AutoGameRunner) {
                this.gameRunner = new AutoGameRunner(this.gameState, this.gameInstance);
                console.log('AutoSystem: Game runner initialized');
            }
            
            // Initialize explorer manager for floor-by-floor automation
            if (window.AutoExplorerManager) {
                this.explorerManager = new AutoExplorerManager(this.gameState, this.gameInstance);
                console.log('AutoSystem: Explorer manager initialized');
            }
            
            if (!this.gameRunner && !this.explorerManager) {
                console.warn('AutoSystem: No automation subsystems available');
            }
        } catch (error) {
            console.error('AutoSystem: Failed to initialize subsystems:', error);
        }
    }
    
    setupEventIntegration() {
        // Integrate with game events for tracking
        if (this.gameRunner) {
            // Hook into game events for statistics
            this.setupGameEventListeners();
        }
    }
    
    setupGameEventListeners() {
        // We would need to modify the main game to emit these events
        // For now, we'll poll for changes
        this.startEventPolling();
    }
    
    startEventPolling() {
        // Poll game state changes every 500ms for statistics
        this.pollInterval = setInterval(() => {
            if (this.gameRunner?.isRunning) {
                this.updateRunnerStats();
            }
        }, 500);
    }
    
    updateRunnerStats() {
        // Update runner with current game state
        // This is a simplified approach - ideally we'd have proper event integration
        const player = this.gameState.player;
        if (player) {
            // Track any changes that occurred since last poll
            // This would be more elegant with proper event emission from the game
        }
    }
    
    // Main interface methods
    
    /**
     * Start full campaign automation
     */
    async startCampaignRun(mode = 'balanced') {
        if (!this.gameRunner) {
            console.error('AutoSystem: Game runner not available');
            return false;
        }
        
        this.mode = 'auto-campaign';
        this.gameRunner.setAutoMode(mode);
        
        console.log(`AutoSystem: Starting full campaign run in ${mode} mode`);
        return await this.gameRunner.startFullRun();
    }
    
    /**
     * Start single floor automation
     */
    startFloorExploration(aiType = 'enhanced', mode = 'balanced') {
        if (!this.explorerManager) {
            console.error('AutoSystem: Explorer manager not available');
            return false;
        }
        
        this.mode = 'auto-floor';
        
        // Switch to desired AI type
        if (aiType === 'enhanced') {
            this.explorerManager.switchToEnhanced();
            if (this.explorerManager.setMode) {
                this.explorerManager.setMode(mode);
            }
        } else {
            this.explorerManager.switchToOriginal();
        }
        
        // Start exploration
        return this.explorerManager.toggle();
    }
    
    /**
     * Stop all automation
     */
    stopAllAutomation() {
        this.mode = 'manual';
        
        if (this.gameRunner?.isRunning) {
            this.gameRunner.stopRun();
        }
        
        if (this.explorerManager?.isEnabled()) {
            this.explorerManager.disable();
        }
        
        console.log('AutoSystem: All automation stopped');
    }
    
    /**
     * Pause current automation
     */
    pauseAutomation() {
        if (this.gameRunner?.isRunning) {
            this.gameRunner.pause();
        }
        
        if (this.explorerManager?.isEnabled()) {
            this.explorerManager.pause();
        }
        
        console.log('AutoSystem: Automation paused');
    }
    
    /**
     * Resume paused automation
     */
    resumeAutomation() {
        if (this.gameRunner?.isPaused) {
            this.gameRunner.resume();
        }
        
        if (this.explorerManager?.currentExplorer?.paused) {
            this.explorerManager.pause(); // Toggle pause state
        }
        
        console.log('AutoSystem: Automation resumed');
    }
    
    // Status and information methods
    
    isAutomationActive() {
        return this.explorerManager?.isEnabled() || this.gameRunner?.isRunning || this.mode !== 'manual';
    }
    
    getSystemStatus() {
        return {
            mode: this.mode,
            gameRunner: {
                available: !!this.gameRunner,
                running: this.gameRunner?.isRunning || false,
                paused: this.gameRunner?.isPaused || false,
                currentFloor: this.gameState.currentFloor || 1
            },
            explorerManager: {
                available: !!this.explorerManager,
                enabled: this.explorerManager?.isEnabled() || false,
                type: this.explorerManager?.getCurrentType() || 'none',
                mode: this.explorerManager?.getCurrentMode() || 'none'
            }
        };
    }
    
    getPerformanceStats() {
        if (!this.gameRunner) return null;
        
        return {
            currentRun: this.gameRunner.runStats,
            history: this.gameRunner.getRunHistory(),
            best: this.gameRunner.getBestRun(),
            averages: this.gameRunner.getAverageStats()
        };
    }
    
    // Preset automation strategies
    
    /**
     * Speed run mode - optimized for fastest completion
     */
    async startSpeedRun() {
        console.log('AutoSystem: Starting speed run...');
        return await this.startCampaignRun('speedrun');
    }
    
    /**
     * Complete run mode - thorough exploration and collection
     */
    async startCompleteRun() {
        console.log('AutoSystem: Starting complete run...');
        return await this.startCampaignRun('complete');
    }
    
    /**
     * Adaptive run mode - AI switches strategies based on floor difficulty
     */
    async startAdaptiveRun() {
        console.log('AutoSystem: Starting adaptive run...');
        return await this.startCampaignRun('adaptive');
    }
    
    /**
     * Testing mode - quick runs for debugging
     */
    async startTestRun() {
        console.log('AutoSystem: Starting test run...');
        if (this.gameRunner) {
            this.gameRunner.maxRetries = 1; // Fewer retries
            this.gameRunner.adaptiveSettings.speedUpOnEasyFloors = true;
        }
        return await this.startCampaignRun('speedrun');
    }
    
    // Event handlers for game integration
    
    onFloorChange() {
        // Enhanced floor change handling with better logging
        const currentFloor = this.gameState?.floor || 'Unknown';
        const currentArea = this.gameState?.currentArea?.name || 'Unknown';
        const wasAutoActive = this.isAutomationActive();
        
        console.log(`AutoSystem: Floor change notification - Floor ${currentFloor} in ${currentArea} (auto was active: ${wasAutoActive})`);
        
        // Notify subsystems about the floor change
        this.gameRunner?.onFloorChange();
        this.explorerManager?.onFloorChange();
        
        // Ensure auto-exploration continues if it was active before the transition
        if (wasAutoActive && this.mode !== 'manual') {
            console.log('AutoSystem: Ensuring automation continues after floor/area transition...');
            
            // Give extra time for area transitions to complete
            setTimeout(() => {
                const stillEnabled = this.explorerManager?.isEnabled();
                const explorerActive = this.explorerManager?.currentExplorer?.enabled;
                
                console.log(`AutoSystem: Post-transition check - manager enabled: ${stillEnabled}, explorer active: ${explorerActive}`);
                
                if (stillEnabled && !explorerActive) {
                    console.log('AutoSystem: Auto-explorer lost enable state during transition, re-toggling...');
                    this.explorerManager.toggle();
                } else if (!stillEnabled && this.mode === 'auto-floor') {
                    console.log('AutoSystem: Manager lost enable state during transition, restarting floor exploration...');
                    this.startFloorExploration();
                }
            }, 1200);
        }
    }
    
    onEnemyKilled() {
        this.gameRunner?.onEnemyKilled();
    }
    
    onItemCollected() {
        this.gameRunner?.onItemCollected();
    }
    
    onGoldEarned(amount) {
        this.gameRunner?.onGoldEarned(amount);
    }
    
    onPlayerDeath() {
        // Handle death in current automation mode
        if (this.mode === 'auto-floor') {
            // Single floor automation - just stop
            this.explorerManager?.disable();
            this.mode = 'manual';
        }
        // Campaign automation handles death internally
    }
    
    onGameVictory() {
        if (this.gameRunner?.isRunning) {
            console.log('AutoSystem: Game victory achieved during automated run!');
        }
    }
    
    // Console interface registration
    registerConsoleInterface() {
        if (typeof window !== 'undefined') {
            window.autoSystem = {
                // Campaign automation
                startSpeedRun: () => this.startSpeedRun(),
                startCompleteRun: () => this.startCompleteRun(),
                startAdaptiveRun: () => this.startAdaptiveRun(),
                startTestRun: () => this.startTestRun(),
                
                // Floor automation
                startFloor: (aiType = 'enhanced', mode = 'balanced') => 
                    this.startFloorExploration(aiType, mode),
                
                // Control
                stop: () => this.stopAllAutomation(),
                pause: () => this.pauseAutomation(),
                resume: () => this.resumeAutomation(),
                
                // Information
                status: () => {
                    const status = this.getSystemStatus();
                    console.log('=== AUTO SYSTEM STATUS ===');
                    console.log(`Mode: ${status.mode}`);
                    console.log(`Game Runner: ${status.gameRunner.available ? 'Available' : 'Not Available'}`);
                    if (status.gameRunner.available) {
                        console.log(`  Running: ${status.gameRunner.running}`);
                        console.log(`  Paused: ${status.gameRunner.paused}`);
                        console.log(`  Current Floor: ${status.gameRunner.currentFloor}`);
                    }
                    console.log(`Explorer Manager: ${status.explorerManager.available ? 'Available' : 'Not Available'}`);
                    if (status.explorerManager.available) {
                        console.log(`  Enabled: ${status.explorerManager.enabled}`);
                        console.log(`  Type: ${status.explorerManager.type}`);
                        console.log(`  Mode: ${status.explorerManager.mode}`);
                    }
                    
                    // Show current configuration
                    console.log(`\n=== CONFIGURATION ===`);
                    console.log(`Default Mode: ${CONFIG.AUTO_EXPLORE?.DEFAULT_MODE || 'Not Set'}`);
                    console.log(`Pathfinding Max Nodes: ${CONFIG.PATHFINDING?.MAX_NODES || 'Not Set'}`);
                    console.log(`Pathfinding Max Distance: ${CONFIG.PATHFINDING?.MAX_DISTANCE || 'Not Set'}`);
                    console.log(`Balanced Mode Exploration Threshold: ${CONFIG.AUTO_EXPLORE?.MODES?.balanced?.EXPLORATION_THRESHOLD * 100 || 'Not Set'}%`);
                    
                    return status;
                },
                
                // Test pathfinding
                testPathfinding: () => {
                    if (!this.explorerManager?.currentExplorer) {
                        console.error('No active explorer to test');
                        return false;
                    }
                    
                    const player = window.game?.gameState?.player;
                    const stairs = window.game?.gameState;
                    
                    if (!player || !stairs) {
                        console.error('Game state not available');
                        return false;
                    }
                    
                    console.log(`Testing pathfinding from player (${player.x},${player.y}) to stairs (${stairs.stairsX},${stairs.stairsY})`);
                    
                    const startTime = performance.now();
                    const path = this.explorerManager.currentExplorer.findPath(player.x, player.y, stairs.stairsX, stairs.stairsY);
                    const endTime = performance.now();
                    
                    if (path) {
                        console.log(`✅ Path found! Length: ${path.length} steps, Time: ${(endTime - startTime).toFixed(2)}ms`);
                        console.log('Path preview:', path.slice(0, 5).map(p => `(${p.x},${p.y})`).join(' -> ') + (path.length > 5 ? ' ...' : ''));
                        return true;
                    } else {
                        console.log(`❌ No path found. Time: ${(endTime - startTime).toFixed(2)}ms`);
                        return false;
                    }
                },
                
                stats: () => {
                    const stats = this.getPerformanceStats();
                    if (stats) {
                        console.log('=== PERFORMANCE STATS ===');
                        if (stats.best) {
                            console.log(`Best Run: ${stats.best.totalFloors}/12 floors in ${(stats.best.totalTime / 60000).toFixed(1)} minutes`);
                        }
                        if (stats.averages) {
                            console.log(`Average: ${stats.averages.averageFloors} floors, ${stats.averages.averageTime}, ${stats.averages.averageDeaths} deaths`);
                            console.log(`Total Runs: ${stats.averages.totalRuns}`);
                        }
                    } else {
                        console.log('No performance data available');
                    }
                    return stats;
                },
                
                help: () => {
                    console.log(`
=== AUTO SYSTEM CONSOLE COMMANDS ===

Campaign Automation:
  autoSystem.startSpeedRun()     - Fast completion (120ms timing)
  autoSystem.startCompleteRun()  - Thorough exploration (220ms timing)
  autoSystem.startAdaptiveRun()  - Smart strategy switching
  autoSystem.startTestRun()      - Quick test runs

Floor Automation:
  autoSystem.startFloor()                    - Enhanced AI, balanced mode
  autoSystem.startFloor('original')          - Original AI
  autoSystem.startFloor('enhanced', 'speedrun') - Enhanced AI, speedrun mode

Control:
  autoSystem.stop()    - Stop all automation
  autoSystem.pause()   - Pause current automation
  autoSystem.resume()  - Resume paused automation

Information:
  autoSystem.status()  - Show current status and configuration
  autoSystem.stats()   - Show performance statistics
  autoSystem.testPathfinding()  - Test pathfinding to stairs
  autoSystem.help()    - Show this help

Examples:
  autoSystem.startSpeedRun()  // Full 12-floor speedrun
  autoSystem.startFloor('enhanced', 'balanced')  // Enhanced AI, balanced mode
  autoSystem.testPathfinding()  // Test current pathfinding
  autoSystem.stop()  // Stop everything
                    `);
                }
            };
            
            console.log('AutoSystem: Console interface registered. Type autoSystem.help() for commands.');
        }
    }
    
    // Cleanup
    destroy() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
        
        this.stopAllAutomation();
        
        if (window.autoSystem) {
            delete window.autoSystem;
        }
    }
}

window.AutoSystem = AutoSystem;