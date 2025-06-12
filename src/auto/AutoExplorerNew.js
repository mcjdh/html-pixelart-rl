/**
 * Complete rewrite of auto-exploration using a much simpler, more effective approach
 * 
 * Strategy:
 * 1. Always attack adjacent enemies immediately (including diagonals)
 * 2. Pick up nearby items aggressively (2-tile radius)  
 * 3. Hunt visible enemies within 3 tiles (no more walking past them!)
 * 4. Use simple breadth-first search to stairs (reliable pathfinding)
 * 5. No complex algorithms - just does the obvious thing every time
 */
class AutoExplorerNew {
    constructor(gameState, gameInstance = null) {
        this.gameState = gameState;
        this.gameInstance = gameInstance;
        this.enabled = false;
        this.stepDelay = 200; // Faster for more aggressive gameplay
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
        
        // 2. Pick up nearby items
        if (this.pickupAdjacentItem(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 3. Hunt nearby enemies (more aggressive combat)
        if (this.huntNearbyEnemy(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 4. Move toward stairs using simple BFS pathfinding
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
        // Check all adjacent positions for enemies (including diagonals for better coverage)
        const adjacentPositions = [
            // Direct adjacent (highest priority)
            {x: player.x + 1, y: player.y},
            {x: player.x - 1, y: player.y},
            {x: player.x, y: player.y + 1},
            {x: player.x, y: player.y - 1},
            // Diagonals (also adjacent)
            {x: player.x + 1, y: player.y + 1},
            {x: player.x + 1, y: player.y - 1},
            {x: player.x - 1, y: player.y + 1},
            {x: player.x - 1, y: player.y - 1}
        ];
        
        for (const pos of adjacentPositions) {
            if (this.gameState.inBounds(pos.x, pos.y)) {
                const enemy = this.gameState.getEnemyAt(pos.x, pos.y);
                if (enemy && !this.gameState.fogOfWar[pos.y][pos.x]) {
                    console.log(`Attacking enemy at (${pos.x},${pos.y})`);
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
        // Check current position first, then expanded area for items
        const itemPositions = [
            // Current position (highest priority)
            {x: player.x, y: player.y},
            // Direct adjacent
            {x: player.x + 1, y: player.y},
            {x: player.x - 1, y: player.y},
            {x: player.x, y: player.y + 1},
            {x: player.x, y: player.y - 1},
            // Diagonals
            {x: player.x + 1, y: player.y + 1},
            {x: player.x + 1, y: player.y - 1},
            {x: player.x - 1, y: player.y + 1},
            {x: player.x - 1, y: player.y - 1},
            // One step further for nearby items
            {x: player.x + 2, y: player.y},
            {x: player.x - 2, y: player.y},
            {x: player.x, y: player.y + 2},
            {x: player.x, y: player.y - 2}
        ];
        
        for (const pos of itemPositions) {
            if (this.gameState.inBounds(pos.x, pos.y)) {
                const item = this.gameState.getItemAt(pos.x, pos.y);
                if (item && !this.gameState.fogOfWar[pos.y][pos.x] && !this.gameState.isWall(pos.x, pos.y)) {
                    console.log(`Moving to pick up item at (${pos.x},${pos.y})`);
                    const dx = Math.sign(pos.x - player.x);
                    const dy = Math.sign(pos.y - player.y);
                    this.executeMove(dx, dy);
                    return true;
                }
            }
        }
        return false;
    }
    
    huntNearbyEnemy(player) {
        // Look for visible enemies within 3 tiles and move toward closest one
        const nearbyEnemies = [];
        
        for (const enemy of this.gameState.enemies) {
            if (!this.gameState.fogOfWar[enemy.y][enemy.x]) {
                const dist = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
                if (dist <= 3) {
                    nearbyEnemies.push({enemy, dist});
                }
            }
        }
        
        if (nearbyEnemies.length === 0) return false;
        
        // Sort by distance and target closest
        nearbyEnemies.sort((a, b) => a.dist - b.dist);
        const target = nearbyEnemies[0].enemy;
        
        console.log(`Hunting nearby enemy at (${target.x},${target.y}), distance: ${nearbyEnemies[0].dist}`);
        
        // Move toward the enemy
        const dx = Math.sign(target.x - player.x);
        const dy = Math.sign(target.y - player.y);
        
        const nextX = player.x + dx;
        const nextY = player.y + dy;
        
        if (this.gameState.inBounds(nextX, nextY) && !this.gameState.isWall(nextX, nextY)) {
            this.executeMove(dx, dy);
            return true;
        }
        
        // If direct movement blocked, use BFS to reach enemy
        const path = this.findPathBFS(player.x, player.y, target.x, target.y);
        if (path && path.length > 1) {
            const nextStep = path[1];
            const pathDx = nextStep.x - player.x;
            const pathDy = nextStep.y - player.y;
            this.executeMove(pathDx, pathDy);
            return true;
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