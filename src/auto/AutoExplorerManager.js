/**
 * Auto-Explorer Manager
 * 
 * Provides a unified interface for switching between different auto-exploration AI implementations.
 * Supports original AutoExplorerFinal and new AutoExplorerEnhanced.
 */
class AutoExplorerManager {
    constructor(gameState, gameInstance = null) {
        this.gameState = gameState;
        this.gameInstance = gameInstance;
        this.currentExplorer = null;
        this.explorerType = CONFIG.AUTO_EXPLORE?.ENABLED ? 'optimized' : 'original';
        
        this.initializeExplorer();
    }
    
    initializeExplorer() {
        const type = this.explorerType;
        
        if (type === 'optimized' && window.AutoExplorerOptimized) {
            this.currentExplorer = new AutoExplorerOptimized(this.gameState, this.gameInstance);
            console.log('Auto-Explorer Manager: Using Optimized AI');
        } else if (type === 'enhanced' && window.AutoExplorerEnhanced) {
            this.currentExplorer = new AutoExplorerEnhanced(this.gameState, this.gameInstance);
            console.log('Auto-Explorer Manager: Using Enhanced AI');
        } else if (window.AutoExplorerFinal) {
            this.currentExplorer = new AutoExplorerFinal(this.gameState, this.gameInstance);
            console.log('Auto-Explorer Manager: Using Original AI');
            this.explorerType = 'original';
        } else {
            console.error('Auto-Explorer Manager: No auto-explorer implementation found');
            return;
        }
    }
    
    // Unified interface methods - delegate to current explorer
    toggle() {
        return this.currentExplorer?.toggle() || false;
    }
    
    disable() {
        this.currentExplorer?.disable();
    }
    
    pause() {
        if (this.currentExplorer && typeof this.currentExplorer.pause === 'function') {
            return this.currentExplorer.pause();
        }
        return false;
    }
    
    onFloorChange() {
        this.currentExplorer?.onFloorChange();
    }
    
    // Enhanced AI specific methods
    setMode(mode) {
        if (this.explorerType === 'enhanced' && this.currentExplorer?.setMode) {
            this.currentExplorer.setMode(mode);
            return true;
        }
        return false;
    }
    
    toggleDecisionVisuals() {
        if (this.explorerType === 'enhanced' && this.currentExplorer?.toggleDecisionVisuals) {
            return this.currentExplorer.toggleDecisionVisuals();
        }
        return false;
    }
    
    // Switch between AI implementations
    switchToEnhanced() {
        if (window.AutoExplorerEnhanced && this.explorerType !== 'enhanced') {
            const wasEnabled = this.currentExplorer?.enabled;
            this.currentExplorer?.disable();
            
            this.explorerType = 'enhanced';
            this.currentExplorer = new AutoExplorerEnhanced(this.gameState, this.gameInstance);
            
            if (wasEnabled) {
                this.currentExplorer.toggle();
            }
            
            console.log('Auto-Explorer Manager: Switched to Enhanced AI');
            return true;
        }
        return false;
    }
    
    switchToOriginal() {
        if (window.AutoExplorerFinal && this.explorerType !== 'original') {
            const wasEnabled = this.currentExplorer?.enabled;
            this.currentExplorer?.disable();
            
            this.explorerType = 'original';
            this.currentExplorer = new AutoExplorerFinal(this.gameState, this.gameInstance);
            
            if (wasEnabled) {
                this.currentExplorer.toggle();
            }
            
            console.log('Auto-Explorer Manager: Switched to Original AI');
            return true;
        }
        return false;
    }
    
    switchToOptimized() {
        if (window.AutoExplorerOptimized && this.explorerType !== 'optimized') {
            const wasEnabled = this.currentExplorer?.enabled;
            const currentMode = this.currentExplorer?.mode;
            this.currentExplorer?.disable();
            
            this.explorerType = 'optimized';
            this.currentExplorer = new AutoExplorerOptimized(this.gameState, this.gameInstance);
            
            // Restore mode if it had one
            if (currentMode && this.currentExplorer.setMode) {
                this.currentExplorer.setMode(currentMode);
            }
            
            if (wasEnabled) {
                this.currentExplorer.toggle();
            }
            
            console.log('Auto-Explorer Manager: Switched to Optimized AI');
            return true;
        }
        return false;
    }
    
    // Status and information methods
    getCurrentType() {
        return this.explorerType;
    }
    
    isEnabled() {
        return this.currentExplorer?.enabled || false;
    }
    
    getCurrentMode() {
        if (this.explorerType === 'enhanced' && this.currentExplorer?.mode) {
            return this.currentExplorer.mode;
        }
        return 'standard';
    }
    
    getAvailableModes() {
        if (this.explorerType === 'enhanced') {
            return ['speedrun', 'balanced', 'complete'];
        }
        return ['standard'];
    }
    
    // Console commands for debugging and testing
    static registerConsoleCommands() {
        if (typeof window !== 'undefined') {
            window.autoExplorerCommands = {
                help: () => {
                    console.log(`
Auto-Explorer Console Commands:
- autoExplorerCommands.switchToEnhanced() - Switch to enhanced AI
- autoExplorerCommands.switchToOriginal() - Switch to original AI  
- autoExplorerCommands.setMode(mode) - Set mode: speedrun/balanced/complete
- autoExplorerCommands.toggleVisuals() - Toggle decision visualization
- autoExplorerCommands.status() - Show current status
- autoExplorerCommands.help() - Show this help
                    `);
                },
                
                switchToEnhanced: () => {
                    if (window.game?.autoExplorer?.switchToEnhanced) {
                        return window.game.autoExplorer.switchToEnhanced();
                    }
                    console.error('Game or auto-explorer not available');
                    return false;
                },
                
                switchToOriginal: () => {
                    if (window.game?.autoExplorer?.switchToOriginal) {
                        return window.game.autoExplorer.switchToOriginal();
                    }
                    console.error('Game or auto-explorer not available');
                    return false;
                },
                
                setMode: (mode) => {
                    if (window.game?.autoExplorer?.setMode) {
                        return window.game.autoExplorer.setMode(mode);
                    }
                    console.error('Enhanced mode not available');
                    return false;
                },
                
                toggleVisuals: () => {
                    if (window.game?.autoExplorer?.toggleDecisionVisuals) {
                        return window.game.autoExplorer.toggleDecisionVisuals();
                    }
                    console.error('Enhanced mode not available');
                    return false;
                },
                
                status: () => {
                    const explorer = window.game?.autoExplorer;
                    if (explorer) {
                        console.log(`
Auto-Explorer Status:
- Type: ${explorer.getCurrentType()}
- Enabled: ${explorer.isEnabled()}
- Mode: ${explorer.getCurrentMode()}
- Available modes: [${explorer.getAvailableModes().join(', ')}]
                        `);
                    } else {
                        console.error('Auto-explorer not available');
                    }
                }
            };
            
            console.log('Auto-Explorer console commands registered. Type autoExplorerCommands.help() for usage.');
        }
    }
}

// Register console commands when script loads
AutoExplorerManager.registerConsoleCommands();

window.AutoExplorerManager = AutoExplorerManager;