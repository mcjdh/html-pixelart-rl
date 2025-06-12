/**
 * Final ultra-simple auto-explorer - back to "just works" philosophy
 * 
 * Strategy:
 * 1. Attack adjacent enemies immediately
 * 2. Pick up nearby items within 2 tiles  
 * 3. Move toward stairs
 * 
 * NO stuck detection, NO commitment systems, NO oscillation prevention
 * Just does the obvious thing every time - simple and reliable
 */
class AutoExplorerFinal {
    constructor(gameState, gameInstance = null) {
        this.gameState = gameState;
        this.gameInstance = gameInstance;
        this.enabled = false;
        this.stepDelay = 180; // Slightly faster
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
        if (!this.enabled || this.gameState.gameVictory) {
            return;
        }
        
        // Auto-pause/resume for energy (simple)
        if (this.gameState.player.energy < CONFIG.BALANCE.MOVE_ENERGY_COST) {
            setTimeout(() => this.step(), 400);
            return;
        }
        
        const player = this.gameState.player;
        
        // 1. Attack adjacent enemies (including diagonals)
        if (this.attackAdjacent(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 2. Pick up nearby items (within 2 tiles)
        if (this.pickupNearby(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 3. Seek and attack visible enemies (exploration behavior)
        if (this.seekAndAttackEnemy(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 4. Look for items further away (within 6 tiles)
        if (this.seekItems(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 5. Check if floor is "complete enough" - if so, go to stairs
        if (this.isFloorCompleteEnough()) {
            if (this.moveToStairs(player)) {
                setTimeout(() => this.step(), this.stepDelay);
                return;
            }
        }
        
        // 6. Explore unexplored areas (only if floor not complete enough)
        if (this.exploreUnknown(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 7. Move toward stairs (fallback)
        if (this.moveToStairs(player)) {
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // Nothing to do - floor complete, but keep enabled for next floor
        console.log('Auto-explorer: Floor complete, waiting for next floor');
        this.gameState.addMessage('Auto-explore: Floor complete', 'level-msg');
    }
    
    attackAdjacent(player) {
        // Check all 8 surrounding positions for enemies
        const positions = [
            [0, 1], [0, -1], [1, 0], [-1, 0],    // Cardinals
            [1, 1], [1, -1], [-1, 1], [-1, -1]   // Diagonals
        ];
        
        for (const [dx, dy] of positions) {
            const x = player.x + dx;
            const y = player.y + dy;
            
            if (this.gameState.inBounds(x, y)) {
                const enemy = this.gameState.getEnemyAt(x, y);
                if (enemy && !this.gameState.fogOfWar[y][x]) {
                    console.log(`Attacking enemy at (${x},${y})`);
                    this.executeMove(dx, dy);
                    return true;
                }
            }
        }
        return false;
    }
    
    pickupNearby(player) {
        // Check expanding circles for items (current position, then 1 tile, then 2 tiles)
        const ranges = [
            [[0, 0]], // Current position
            [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]], // 1 tile away
            [[0, 2], [0, -2], [2, 0], [-2, 0]] // 2 tiles away (cardinals only)
        ];
        
        for (const range of ranges) {
            for (const [dx, dy] of range) {
                const x = player.x + dx;
                const y = player.y + dy;
                
                if (this.gameState.inBounds(x, y)) {
                    const item = this.gameState.getItemAt(x, y);
                    if (item && !this.gameState.fogOfWar[y][x] && !this.gameState.isWall(x, y)) {
                        console.log(`Moving to item at (${x},${y})`);
                        // Move one step toward item
                        const moveX = Math.sign(dx);
                        const moveY = Math.sign(dy);
                        this.executeMove(moveX, moveY);
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    seekAndAttackEnemy(player) {
        // Find all visible enemies within reasonable range
        const enemies = [];
        const maxRange = 8; // Look further for enemies
        
        for (const enemy of this.gameState.enemies) {
            if (!this.gameState.fogOfWar[enemy.y][enemy.x]) {
                const distance = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
                if (distance <= maxRange) {
                    enemies.push({enemy, distance});
                }
            }
        }
        
        if (enemies.length === 0) return false;
        
        // Sort by distance, attack closest
        enemies.sort((a, b) => a.distance - b.distance);
        const target = enemies[0].enemy;
        
        console.log(`Seeking enemy at (${target.x},${target.y}), distance: ${enemies[0].distance}`);
        
        // Move toward the closest enemy
        const path = this.findPath(player.x, player.y, target.x, target.y);
        if (path && path.length > 1) {
            const next = path[1];
            const dx = next.x - player.x;
            const dy = next.y - player.y;
            this.executeMove(dx, dy);
            return true;
        }
        
        return false;
    }
    
    seekItems(player) {
        // Look for items further away (within 6 tiles)
        const items = [];
        const maxRange = 6;
        
        for (const item of this.gameState.items) {
            if (!this.gameState.fogOfWar[item.y][item.x]) {
                const distance = Math.abs(item.x - player.x) + Math.abs(item.y - player.y);
                if (distance <= maxRange && distance > 2) { // Only items further than pickup range
                    items.push({item, distance});
                }
            }
        }
        
        if (items.length === 0) return false;
        
        // Sort by distance, go to closest
        items.sort((a, b) => a.distance - b.distance);
        const target = items[0].item;
        
        console.log(`Seeking item at (${target.x},${target.y}), distance: ${items[0].distance}`);
        
        // Move toward the closest item
        const path = this.findPath(player.x, player.y, target.x, target.y);
        if (path && path.length > 1) {
            const next = path[1];
            const dx = next.x - player.x;
            const dy = next.y - player.y;
            this.executeMove(dx, dy);
            return true;
        }
        
        return false;
    }
    
    isFloorCompleteEnough() {
        // Floor is "complete enough" if:
        // 1. No visible enemies remain, AND
        // 2. No visible items remain (within reasonable range), AND
        // 3. At least 60% of walkable area has been explored
        
        // Check for visible enemies
        for (const enemy of this.gameState.enemies) {
            if (!this.gameState.fogOfWar[enemy.y][enemy.x]) {
                return false; // Still have visible enemies
            }
        }
        
        // Check for visible items (within 8 tiles)
        for (const item of this.gameState.items) {
            if (!this.gameState.fogOfWar[item.y][item.x]) {
                const distance = Math.abs(item.x - this.gameState.player.x) + Math.abs(item.y - this.gameState.player.y);
                if (distance <= 8) {
                    return false; // Still have visible items nearby
                }
            }
        }
        
        // Check exploration percentage
        let exploredCount = 0;
        let totalWalkable = 0;
        
        for (let y = 0; y < this.gameState.map.length; y++) {
            for (let x = 0; x < this.gameState.map[0].length; x++) {
                if (!this.gameState.isWall(x, y)) {
                    totalWalkable++;
                    if (this.gameState.explored[y][x]) {
                        exploredCount++;
                    }
                }
            }
        }
        
        const explorationPercent = totalWalkable > 0 ? (exploredCount / totalWalkable) : 1;
        console.log(`Floor exploration: ${Math.round(explorationPercent * 100)}%`);
        
        return explorationPercent >= 0.6; // 60% exploration threshold
    }
    
    exploreUnknown(player) {
        // Find nearest unexplored area (smaller search range now)
        let closestUnexplored = null;
        let minDistance = Infinity;
        
        // Reduced search range to prevent endless wandering
        const searchRange = 10;
        for (let y = Math.max(0, player.y - searchRange); y < Math.min(this.gameState.map.length, player.y + searchRange); y++) {
            for (let x = Math.max(0, player.x - searchRange); x < Math.min(this.gameState.map[0].length, player.x + searchRange); x++) {
                // Check if it's an unexplored walkable tile
                if (!this.gameState.explored[y][x] && !this.gameState.isWall(x, y)) {
                    const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestUnexplored = {x, y};
                    }
                }
            }
        }
        
        if (!closestUnexplored) return false;
        
        console.log(`Exploring toward (${closestUnexplored.x},${closestUnexplored.y})`);
        
        // Move toward unexplored area
        const path = this.findPath(player.x, player.y, closestUnexplored.x, closestUnexplored.y);
        if (path && path.length > 1) {
            const next = path[1];
            const dx = next.x - player.x;
            const dy = next.y - player.y;
            this.executeMove(dx, dy);
            return true;
        }
        
        return false;
    }
    
    moveToStairs(player) {
        const stairsX = this.gameState.stairsX;
        const stairsY = this.gameState.stairsY;
        
        // Validate stairs
        if (!this.gameState.inBounds(stairsX, stairsY)) {
            return false;
        }
        
        // Simple pathfinding to stairs
        const path = this.findPath(player.x, player.y, stairsX, stairsY);
        if (path && path.length > 1) {
            const next = path[1];
            const dx = next.x - player.x;
            const dy = next.y - player.y;
            console.log(`Moving toward stairs: (${player.x},${player.y}) → (${next.x},${next.y})`);
            this.executeMove(dx, dy);
            return true;
        }
        
        return false;
    }
    
    // Ultra-simple BFS pathfinding
    findPath(startX, startY, targetX, targetY) {
        const queue = [{x: startX, y: startY, path: [{x: startX, y: startY}]}];
        const visited = new Set([`${startX},${startY}`]);
        
        let iterations = 0;
        const maxIterations = 500; // Keep it simple
        
        while (queue.length > 0 && iterations < maxIterations) {
            iterations++;
            const current = queue.shift();
            
            if (current.x === targetX && current.y === targetY) {
                return current.path;
            }
            
            // Check 4 directions only (simpler)
            for (const [dx, dy] of [[0,1], [0,-1], [1,0], [-1,0]]) {
                const x = current.x + dx;
                const y = current.y + dy;
                const key = `${x},${y}`;
                
                if (!visited.has(key) && 
                    this.gameState.inBounds(x, y) && 
                    !this.gameState.isWall(x, y)) {
                    
                    visited.add(key);
                    queue.push({
                        x: x, 
                        y: y, 
                        path: [...current.path, {x: x, y: y}]
                    });
                }
            }
        }
        
        return null;
    }
    
    executeMove(dx, dy) {
        // Simple validation
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            console.error(`Invalid move: (${dx},${dy})`);
            return false;
        }
        
        if (this.gameInstance && this.gameInstance.movePlayer) {
            this.gameInstance.movePlayer(dx, dy);
            return true;
        } else if (window.game && window.game.movePlayer) {
            window.game.movePlayer(dx, dy);
            return true;
        }
        
        return false;
    }
    
    onFloorChange() {
        // Nothing to reset - no state to track!
        console.log('Auto-explorer: New floor, continuing...');
        
        // If auto-explorer was enabled, continue on new floor
        if (this.enabled) {
            console.log('Auto-explorer: Resuming on new floor');
            // Small delay to let floor initialization complete
            setTimeout(() => {
                if (this.enabled) {
                    this.step();
                }
            }, 500);
        }
    }
}

window.AutoExplorerFinal = AutoExplorerFinal;