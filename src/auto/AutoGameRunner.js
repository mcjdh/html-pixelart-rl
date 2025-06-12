/**
 * Auto Game Runner - Unified Auto-Completion System
 * 
 * Provides complete automation for running through the entire 12-floor campaign.
 * Integrates both original and enhanced AI systems with intelligent progression management.
 * 
 * Features:
 * - Full campaign automation (Caverns → Forest → Mushroom → Stellar Observatory)
 * - AI system switching based on floor difficulty
 * - Performance tracking and statistics
 * - Adaptive strategies for boss encounters
 * - Death recovery and retry logic
 * - Speed run optimization modes
 */
class AutoGameRunner {
    constructor(gameState, gameInstance) {
        this.gameState = gameState;
        this.gameInstance = gameInstance;
        this.isRunning = false;
        this.isPaused = false;
        this.autoMode = 'balanced'; // speedrun, balanced, complete, adaptive
        
        // Initialize AI systems
        this.originalAI = null;
        this.enhancedAI = null;
        this.currentAI = null;
        this.initializeAISystems();
        
        // Run tracking
        this.runStats = this.initializeRunStats();
        this.runHistory = [];
        this.maxRetries = 3;
        this.currentRetry = 0;
        
        // Floor progression tracking
        this.floorTargets = this.getFloorTargets();
        this.currentTarget = 1;
        
        // Performance optimization
        this.adaptiveSettings = {
            speedUpOnEasyFloors: true,
            switchAIOnBosses: true,
            optimizeForSurvival: true
        };
    }
    
    initializeAISystems() {
        try {
            if (window.AutoExplorerFinal) {
                this.originalAI = new AutoExplorerFinal(this.gameState, this.gameInstance);
                console.log('AutoGameRunner: Original AI initialized');
            }
            
            if (window.AutoExplorerEnhanced) {
                this.enhancedAI = new AutoExplorerEnhanced(this.gameState, this.gameInstance);
                console.log('AutoGameRunner: Enhanced AI initialized');
            }
            
            // Default to enhanced if available, otherwise original
            this.currentAI = this.enhancedAI || this.originalAI;
            
            if (!this.currentAI) {
                throw new Error('No AI systems available');
            }
        } catch (error) {
            console.error('AutoGameRunner: Failed to initialize AI systems:', error);
        }
    }
    
    initializeRunStats() {
        return {
            startTime: null,
            endTime: null,
            totalFloors: 0,
            totalEnemiesKilled: 0,
            totalItemsCollected: 0,
            totalGoldEarned: 0,
            totalDeaths: 0,
            totalRetries: 0,
            averageFloorTime: 0,
            floorsPerMinute: 0,
            completionRate: 0,
            aiSwitches: 0,
            bossesDefeated: 0,
            areasCompleted: 0,
            
            // Per-floor breakdown
            floorStats: {},
            
            // Performance metrics
            fastestFloor: { floor: 0, time: Infinity },
            slowestFloor: { floor: 0, time: 0 },
            mostEfficientFloor: { floor: 0, ratio: 0 }
        };
    }
    
    getFloorTargets() {
        return {
            // Ancient Caverns (1-3)
            3: { area: 'caverns', boss: 'Skeleton Lord', strategy: 'enhanced' },
            
            // Mystic Forest (4-6)  
            6: { area: 'forest', boss: null, strategy: 'balanced' },
            
            // Fungal Depths (7-9)
            9: { area: 'mushroom', boss: 'Spore Mother', strategy: 'enhanced' },
            
            // Stellar Observatory (10-12)
            12: { area: 'stellar', boss: 'Stellar Architect', strategy: 'enhanced' }
        };
    }
    
    // Main control methods
    async startFullRun() {
        if (this.isRunning) {
            console.log('AutoGameRunner: Run already in progress');
            return false;
        }
        
        console.log(`AutoGameRunner: Starting full campaign run (${this.autoMode} mode)`);
        this.isRunning = true;
        this.isPaused = false;
        this.runStats = this.initializeRunStats();
        this.runStats.startTime = Date.now();
        this.currentRetry = 0;
        
        try {
            await this.runCampaign();
        } catch (error) {
            console.error('AutoGameRunner: Campaign run failed:', error);
            this.handleRunFailure(error);
        }
        
        return true;
    }
    
    async runCampaign() {
        this.currentTarget = 1;
        
        while (this.currentTarget <= 12 && this.isRunning) {
            if (this.isPaused) {
                await this.waitForUnpause();
                continue;
            }
            
            const currentFloor = this.gameState.currentFloor || 1;
            
            // Check if we're on target floor
            if (currentFloor === this.currentTarget) {
                await this.runCurrentFloor();
                this.currentTarget++;
            } else if (currentFloor > this.currentTarget) {
                // We've progressed further than expected
                this.currentTarget = currentFloor + 1;
            } else {
                // We need to catch up (might have died)
                await this.progressToTargetFloor();
            }
        }
        
        // Campaign complete
        this.completeRun();
    }
    
    async runCurrentFloor() {
        const floorStart = Date.now();
        const floor = this.gameState.currentFloor;
        
        console.log(`AutoGameRunner: Running floor ${floor}`);
        
        // Initialize floor stats
        this.runStats.floorStats[floor] = {
            startTime: floorStart,
            endTime: null,
            enemiesKilled: 0,
            itemsCollected: 0,
            goldEarned: 0,
            deaths: 0,
            aiUsed: this.getCurrentAIType(),
            strategy: this.determineFloorStrategy(floor)
        };
        
        // Set up AI for this floor
        this.configureAIForFloor(floor);
        
        // Enable auto-exploration
        if (!this.currentAI.enabled) {
            this.currentAI.toggle();
        }
        
        // Wait for floor completion or death
        await this.waitForFloorCompletion(floor);
        
        // Record floor completion
        this.runStats.floorStats[floor].endTime = Date.now();
        this.runStats.totalFloors++;
    }
    
    determineFloorStrategy(floor) {
        const target = this.floorTargets[floor];
        
        if (this.autoMode === 'adaptive') {
            // Boss floors need enhanced AI
            if (target?.boss) {
                return 'enhanced-complete';
            }
            // Early floors can use speedrun
            else if (floor <= 3) {
                return 'enhanced-speedrun';
            }
            // Mid-game balanced
            else {
                return 'enhanced-balanced';
            }
        } else {
            return `enhanced-${this.autoMode}`;
        }
    }
    
    configureAIForFloor(floor) {
        const strategy = this.determineFloorStrategy(floor);
        const [aiType, mode] = strategy.split('-');
        
        // Switch AI if needed
        if (aiType === 'enhanced' && this.currentAI !== this.enhancedAI) {
            this.switchToEnhancedAI();
        } else if (aiType === 'original' && this.currentAI !== this.originalAI) {
            this.switchToOriginalAI();
        }
        
        // Set AI mode if enhanced
        if (this.currentAI === this.enhancedAI && mode) {
            this.currentAI.setMode(mode);
            console.log(`AutoGameRunner: Floor ${floor} - Using ${aiType} AI in ${mode} mode`);
        }
    }
    
    async waitForFloorCompletion(floor) {
        return new Promise((resolve) => {
            const checkInterval = 500; // Check every 500ms
            const maxWaitTime = 300000; // 5 minutes max per floor
            let waitTime = 0;
            
            const checkCompletion = () => {
                if (!this.isRunning || this.isPaused) {
                    resolve();
                    return;
                }
                
                waitTime += checkInterval;
                
                // Check if floor changed (progressed)
                const currentFloor = this.gameState.currentFloor;
                if (currentFloor > floor) {
                    console.log(`AutoGameRunner: Floor ${floor} completed, now on floor ${currentFloor}`);
                    resolve();
                    return;
                }
                
                // Check if player died
                if (this.gameState.player.hp <= 0 || this.gameState.gameOver) {
                    console.log(`AutoGameRunner: Player died on floor ${floor}`);
                    this.handleDeath(floor);
                    resolve();
                    return;
                }
                
                // Check if game was won
                if (this.gameState.gameVictory) {
                    console.log('AutoGameRunner: Game victory achieved!');
                    resolve();
                    return;
                }
                
                // Timeout protection
                if (waitTime >= maxWaitTime) {
                    console.warn(`AutoGameRunner: Floor ${floor} timeout, forcing progression`);
                    resolve();
                    return;
                }
                
                // Continue waiting
                setTimeout(checkCompletion, checkInterval);
            };
            
            checkCompletion();
        });
    }
    
    async progressToTargetFloor() {
        // If we're behind target, we need to progress
        const currentFloor = this.gameState.currentFloor || 1;
        
        if (currentFloor < this.currentTarget) {
            console.log(`AutoGameRunner: Progressing from floor ${currentFloor} to ${this.currentTarget}`);
            
            // Enable auto-exploration to catch up
            if (!this.currentAI.enabled) {
                this.currentAI.toggle();
            }
            
            // Wait a bit for progression
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    handleDeath(floor) {
        this.runStats.totalDeaths++;
        this.runStats.floorStats[floor].deaths++;
        
        console.log(`AutoGameRunner: Death on floor ${floor}, retry ${this.currentRetry + 1}/${this.maxRetries}`);
        
        if (this.currentRetry < this.maxRetries) {
            this.currentRetry++;
            // Reset to floor 1 after death
            this.currentTarget = 1;
        } else {
            console.log('AutoGameRunner: Max retries reached, ending run');
            this.stopRun();
        }
    }
    
    switchToEnhancedAI() {
        if (this.enhancedAI && this.currentAI !== this.enhancedAI) {
            this.currentAI?.disable();
            this.currentAI = this.enhancedAI;
            this.runStats.aiSwitches++;
        }
    }
    
    switchToOriginalAI() {
        if (this.originalAI && this.currentAI !== this.originalAI) {
            this.currentAI?.disable();
            this.currentAI = this.originalAI;
            this.runStats.aiSwitches++;
        }
    }
    
    getCurrentAIType() {
        if (this.currentAI === this.enhancedAI) {
            return 'enhanced';
        } else if (this.currentAI === this.originalAI) {
            return 'original';
        }
        return 'unknown';
    }
    
    async waitForUnpause() {
        while (this.isPaused && this.isRunning) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    completeRun() {
        this.runStats.endTime = Date.now();
        this.runStats.totalTime = this.runStats.endTime - this.runStats.startTime;
        this.calculateFinalStats();
        
        console.log('AutoGameRunner: Campaign completed!');
        this.printRunSummary();
        
        // Save to history
        this.runHistory.push(structuredClone(this.runStats));
        this.isRunning = false;
        
        // Disable AI
        this.currentAI?.disable();
    }
    
    calculateFinalStats() {
        const stats = this.runStats;
        
        if (stats.totalTime > 0) {
            stats.averageFloorTime = stats.totalTime / Math.max(1, stats.totalFloors);
            stats.floorsPerMinute = (stats.totalFloors / (stats.totalTime / 60000)).toFixed(2);
        }
        
        stats.completionRate = ((stats.totalFloors / 12) * 100).toFixed(1);
        
        // Find fastest/slowest floors
        for (const [floor, floorData] of Object.entries(stats.floorStats)) {
            if (floorData.endTime && floorData.startTime) {
                const floorTime = floorData.endTime - floorData.startTime;
                
                if (floorTime < stats.fastestFloor.time) {
                    stats.fastestFloor = { floor: parseInt(floor), time: floorTime };
                }
                
                if (floorTime > stats.slowestFloor.time) {
                    stats.slowestFloor = { floor: parseInt(floor), time: floorTime };
                }
            }
        }
    }
    
    printRunSummary() {
        const stats = this.runStats;
        const totalMinutes = (stats.totalTime / 60000).toFixed(1);
        
        console.log(`
=== AUTO GAME RUNNER - RUN SUMMARY ===
Mode: ${this.autoMode}
Total Time: ${totalMinutes} minutes
Floors Completed: ${stats.totalFloors}/12 (${stats.completionRate}%)
Floors Per Minute: ${stats.floorsPerMinute}
Average Floor Time: ${(stats.averageFloorTime / 1000).toFixed(1)}s

Deaths: ${stats.totalDeaths}
Retries: ${stats.currentRetry}
AI Switches: ${stats.aiSwitches}
Bosses Defeated: ${stats.bossesDefeated}

Fastest Floor: ${stats.fastestFloor.floor} (${(stats.fastestFloor.time / 1000).toFixed(1)}s)
Slowest Floor: ${stats.slowestFloor.floor} (${(stats.slowestFloor.time / 1000).toFixed(1)}s)

Total Enemies: ${stats.totalEnemiesKilled}
Total Items: ${stats.totalItemsCollected}  
Total Gold: ${stats.totalGoldEarned}
==========================================
        `);
    }
    
    // Control methods
    pause() {
        this.isPaused = true;
        this.currentAI?.pause?.();
        console.log('AutoGameRunner: Paused');
    }
    
    resume() {
        this.isPaused = false;
        console.log('AutoGameRunner: Resumed');
    }
    
    stopRun() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentAI?.disable();
        console.log('AutoGameRunner: Run stopped');
        
        if (this.runStats.startTime) {
            this.completeRun();
        }
    }
    
    // Mode switching
    setAutoMode(mode) {
        if (['speedrun', 'balanced', 'complete', 'adaptive'].includes(mode)) {
            this.autoMode = mode;
            console.log(`AutoGameRunner: Mode set to ${mode}`);
            return true;
        }
        return false;
    }
    
    // Statistics and reporting
    getRunHistory() {
        return this.runHistory;
    }
    
    getBestRun() {
        if (this.runHistory.length === 0) return null;
        
        return this.runHistory.reduce((best, run) => {
            if (run.totalFloors > best.totalFloors) return run;
            if (run.totalFloors === best.totalFloors && run.totalTime < best.totalTime) return run;
            return best;
        });
    }
    
    getAverageStats() {
        if (this.runHistory.length === 0) return null;
        
        const totals = this.runHistory.reduce((acc, run) => {
            acc.floors += run.totalFloors;
            acc.time += run.totalTime || 0;
            acc.deaths += run.totalDeaths;
            return acc;
        }, { floors: 0, time: 0, deaths: 0 });
        
        const count = this.runHistory.length;
        
        return {
            averageFloors: (totals.floors / count).toFixed(1),
            averageTime: (totals.time / count / 60000).toFixed(1) + ' minutes',
            averageDeaths: (totals.deaths / count).toFixed(1),
            totalRuns: count
        };
    }
    
    // Integration with game events
    onFloorChange() {
        // Update current target if we progressed
        const currentFloor = this.gameState.currentFloor;
        if (currentFloor > this.currentTarget) {
            this.currentTarget = currentFloor;
        }
        
        // Notify current AI
        this.currentAI?.onFloorChange();
    }
    
    onEnemyKilled() {
        this.runStats.totalEnemiesKilled++;
        const floor = this.gameState.currentFloor;
        if (this.runStats.floorStats[floor]) {
            this.runStats.floorStats[floor].enemiesKilled++;
        }
    }
    
    onItemCollected() {
        this.runStats.totalItemsCollected++;
        const floor = this.gameState.currentFloor;
        if (this.runStats.floorStats[floor]) {
            this.runStats.floorStats[floor].itemsCollected++;
        }
    }
    
    onGoldEarned(amount) {
        this.runStats.totalGoldEarned += amount;
        const floor = this.gameState.currentFloor;
        if (this.runStats.floorStats[floor]) {
            this.runStats.floorStats[floor].goldEarned += amount;
        }
    }
    
    onBossDefeated() {
        this.runStats.bossesDefeated++;
    }
    
    onAreaCompleted() {
        this.runStats.areasCompleted++;
    }
    
    handleRunFailure(error) {
        console.error('AutoGameRunner: Run failed:', error);
        this.runStats.endTime = Date.now();
        this.runStats.failed = true;
        this.runStats.failureReason = error.message;
        this.stopRun();
    }
}

window.AutoGameRunner = AutoGameRunner;