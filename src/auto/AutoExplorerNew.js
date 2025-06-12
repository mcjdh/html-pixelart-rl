/**
 * Complete rewrite of auto-exploration using a much simpler, more effective approach
 * 
 * Strategy:
 * 1. Always attack adjacent enemies immediately
 * 2. Pick up adjacent items immediately  
 * 3. Use simple breadth-first search to stairs (reliable pathfinding)
 * 4. No complex target selection or stuck detection - just works
 */
class AutoExplorerNew {
    constructor(gameState, gameInstance = null) {
        this.gameState = gameState;
        this.gameInstance = gameInstance;
        this.enabled = false;
        this.stepDelay = 250; // Slightly slower for better visibility
    }
    
    toggle() {
        this.enabled = !this.enabled;
        
        const statusElement = document.getElementById('auto-explore-status');
        if (statusElement) {
            statusElement.textContent = this.enabled ? 'ON' : 'OFF';
        }
        
        if (this.enabled) {
            console.log('Auto-explorer enabled');
            this.step();
        } else {
            console.log('Auto-explorer disabled');
        }
        
        return this.enabled;
    }
    
    disable() {
        this.enabled = false;
        const statusElement = document.getElementById('auto-explore-status');
        if (statusElement) {
            statusElement.textContent = 'OFF';
        }
    }
    
    step() {
        if (!this.enabled || 
            this.gameState.player.energy < CONFIG.BALANCE.MOVE_ENERGY_COST ||
            this.gameState.gameVictory) {
            return;
        }
        
        const player = this.gameState.player;
        
        // 1. ALWAYS attack adjacent enemies first (highest priority)
        if (this.attackAdjacentEnemy(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 2. Pick up adjacent items
        if (this.pickupAdjacentItem(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 3. Move toward stairs using simple BFS pathfinding
        if (this.moveTowardStairs(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // If we can't do anything, disable
        console.log('Auto-explorer: No valid actions available');
        this.disable();
        this.gameState.addMessage('Auto-explore complete or blocked', 'level-msg');
    }
    
    attackAdjacentEnemy(player) {
        // Check all adjacent positions for enemies
        const adjacentPositions = [
            {x: player.x + 1, y: player.y},
            {x: player.x - 1, y: player.y},
            {x: player.x, y: player.y + 1},
            {x: player.x, y: player.y - 1}
        ];
        
        for (const pos of adjacentPositions) {
            if (this.gameState.inBounds(pos.x, pos.y)) {
                const enemy = this.gameState.getEnemyAt(pos.x, pos.y);
                if (enemy) {
                    console.log(`Attacking adjacent enemy at (${pos.x},${pos.y})`);
                    const dx = pos.x - player.x;
                    const dy = pos.y - player.y;
                    this.executeMove(dx, dy);
                    return true;
                }
            }
        }
        return false;
    }
    
    pickupAdjacentItem(player) {
        // Check all adjacent positions for items
        const adjacentPositions = [
            {x: player.x + 1, y: player.y},
            {x: player.x - 1, y: player.y},
            {x: player.x, y: player.y + 1},
            {x: player.x, y: player.y - 1},
            {x: player.x, y: player.y} // Current position
        ];
        
        for (const pos of adjacentPositions) {
            if (this.gameState.inBounds(pos.x, pos.y)) {
                const item = this.gameState.getItemAt(pos.x, pos.y);
                if (item && !this.gameState.fogOfWar[pos.y][pos.x]) {
                    console.log(`Picking up adjacent item at (${pos.x},${pos.y})`);
                    const dx = pos.x - player.x;
                    const dy = pos.y - player.y;
                    this.executeMove(dx, dy);
                    return true;
                }
            }
        }
        return false;
    }
    
    moveTowardStairs(player) {
        const stairsX = this.gameState.stairsX;
        const stairsY = this.gameState.stairsY;
        
        // Validate stairs position
        if (!this.gameState.inBounds(stairsX, stairsY)) {
            console.error('Invalid stairs position');
            return false;
        }
        
        // Use breadth-first search to find path to stairs
        const path = this.findPathBFS(player.x, player.y, stairsX, stairsY);
        
        if (path && path.length > 1) {
            const nextStep = path[1]; // Skip current position
            const dx = nextStep.x - player.x;
            const dy = nextStep.y - player.y;
            
            console.log(`Moving toward stairs: (${player.x},${player.y}) → (${nextStep.x},${nextStep.y})`);
            this.executeMove(dx, dy);
            return true;
        }
        
        console.log('No path to stairs found');
        return false;
    }
    
    // Simple, reliable breadth-first search pathfinding
    findPathBFS(startX, startY, targetX, targetY) {
        const queue = [{x: startX, y: startY, path: [{x: startX, y: startY}]}];
        const visited = new Set();
        visited.add(`${startX},${startY}`);
        
        const maxIterations = 1000; // Prevent infinite loops
        let iterations = 0;
        
        while (queue.length > 0 && iterations < maxIterations) {
            iterations++;
            const current = queue.shift();
            
            // Found target
            if (current.x === targetX && current.y === targetY) {
                return current.path;
            }
            
            // Check all 4 directions
            const directions = [[0,1], [0,-1], [1,0], [-1,0]];
            
            for (const [dx, dy] of directions) {
                const nextX = current.x + dx;
                const nextY = current.y + dy;
                const key = `${nextX},${nextY}`;
                
                if (visited.has(key)) continue;
                
                if (this.isValidPathPosition(nextX, nextY)) {
                    visited.add(key);
                    const newPath = [...current.path, {x: nextX, y: nextY}];
                    queue.push({x: nextX, y: nextY, path: newPath});
                }
            }
        }
        
        console.log(`BFS pathfinding failed after ${iterations} iterations`);
        return null;
    }
    
    isValidPathPosition(x, y) {
        // Check bounds
        if (!this.gameState.inBounds(x, y)) return false;
        
        // Check walls
        if (this.gameState.isWall(x, y)) return false;
        
        // Allow movement through enemy positions (we'll fight them when adjacent)
        // Allow movement through item positions (we'll collect them when adjacent)
        
        return true;
    }
    
    executeMove(dx, dy) {
        // Validate movement is only 1 tile
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            console.error(`Invalid move distance: (${dx},${dy})`);
            return false;
        }
        
        if (this.gameInstance && this.gameInstance.movePlayer) {
            this.gameInstance.movePlayer(dx, dy);
            return true;
        } else if (window.game && window.game.movePlayer) {
            window.game.movePlayer(dx, dy);
            return true;
        } else {
            console.error('No movePlayer method available');
            return false;
        }
    }
    
    onFloorChange() {
        console.log('Auto-explorer: Floor changed, continuing on new floor');
    }
}

window.AutoExplorerNew = AutoExplorerNew;