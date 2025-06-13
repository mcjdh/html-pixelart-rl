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
        this.isWaitingForFloorChange = false; // Track if we're waiting for floor progression
        this.lastFloorCompleteMessage = 0; // Timestamp of last completion message
    }
    
    toggle() {
        this.enabled = !this.enabled;
        
        const statusElement = document.getElementById('auto-explore-status');
        if (statusElement) {
            statusElement.textContent = this.enabled ? 'ON' : 'OFF';
        }
        
        if (this.enabled) {
            if (CONFIG.DEBUG?.SHOW_AUTO_EXPLORER_LOGS) {
                console.log('Auto-explorer enabled');
            }
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
        
        // Additional safety check for game over conditions
        if (this.gameState.gameOver || this.gameState.player?.hp <= 0) {
            console.log('Auto-explorer: Game over detected, stopping');
            this.disable();
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
            this.isWaitingForFloorChange = false; // Reset waiting state
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 2. Pick up nearby items (within 2 tiles)
        if (this.pickupNearby(player)) {
            this.isWaitingForFloorChange = false; // Reset waiting state
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 3. Seek and attack visible enemies (exploration behavior)
        if (this.seekAndAttackEnemy(player)) {
            this.isWaitingForFloorChange = false; // Reset waiting state
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 4. Look for items further away (within 6 tiles)
        if (this.seekItems(player)) {
            this.isWaitingForFloorChange = false; // Reset waiting state
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 5. Explore unexplored areas (continue exploration)
        if (this.exploreUnknown(player)) {
            this.isWaitingForFloorChange = false; // Reset waiting state
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // 6. Check if floor is TRULY complete before going to stairs
        if (!this.isFloorTrulyComplete()) {
            // Floor not complete but no obvious action - try a broader search
            console.log('Auto-explorer: No immediate action but floor not complete, expanding search...');
            if (this.expandedSearch(player)) {
                this.isWaitingForFloorChange = false;
                setTimeout(() => this.step(), this.stepDelay);
                return;
            }
        }
        
        // 7. Move toward stairs (only when truly complete)
        if (this.moveToStairs(player)) {
            this.isWaitingForFloorChange = false; // Reset waiting state
            setTimeout(() => this.step(), this.stepDelay);
            return;
        }
        
        // Absolutely nothing to do - check if floor is complete or if we should go to stairs
        if (this.isFloorTrulyComplete()) {
            // Floor is complete - try to go to stairs immediately
            console.log('Auto-explorer: Floor verified complete, moving to stairs');
            if (this.moveToStairs(player)) {
                this.isWaitingForFloorChange = false;
                setTimeout(() => this.step(), this.stepDelay);
                return;
            } else {
                // Can't reach stairs - wait for transition
                if (!this.isWaitingForFloorChange) {
                    const now = Date.now();
                    if (now - this.lastFloorCompleteMessage > 5000) {
                        const currentFloor = this.gameState.floor;
                        const currentArea = this.gameState.currentArea?.name || 'Unknown';
                        console.log(`Auto-explorer: Floor ${currentFloor} (${currentArea}) complete but cannot reach stairs`);
                        this.gameState.addMessage('Auto-explore: Floor complete, cannot reach stairs', 'level-msg');
                        this.lastFloorCompleteMessage = now;
                    }
                    this.isWaitingForFloorChange = true;
                }
                
                setTimeout(() => {
                    if (this.enabled && this.isWaitingForFloorChange) {
                        this.step();
                    }
                }, 2000);
            }
        } else {
            // Something is wrong - we couldn't find anything to do but floor isn't complete
            console.error('Auto-explorer: CRITICAL - No actions found but floor not complete! Possible pathfinding issue.');
            console.log(`Enemies: ${this.gameState.enemies.length}, Items: ${this.gameState.items.length}`);
            
            // Try again after a short delay
            setTimeout(() => this.step(), 1000);
        }
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
        
        if (CONFIG.DEBUG?.SHOW_AUTO_EXPLORER_LOGS) {
            console.log(`Seeking enemy at (${target.x},${target.y}), distance: ${enemies[0].distance}`);
        }
        
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
        
        if (CONFIG.DEBUG?.SHOW_AUTO_EXPLORER_LOGS) {
            console.log(`Seeking item at (${target.x},${target.y}), distance: ${items[0].distance}`);
        }
        
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
    
    isFloorTrulyComplete() {
        // Floor is complete when:
        // 1. No visible enemies remain, AND
        // 2. No visible items remain (anywhere on map), AND
        // 3. At least 85% of walkable area has been explored
        
        let visibleEnemyCount = 0;
        let visibleItemCount = 0;
        
        // Check for ANY visible enemies on the entire map
        for (const enemy of this.gameState.enemies) {
            if (!this.gameState.fogOfWar[enemy.y][enemy.x]) {
                visibleEnemyCount++;
                console.log(`Auto-explorer: Found visible enemy at (${enemy.x},${enemy.y}), floor not complete`);
            }
        }
        
        // Check for ANY visible items on the entire map
        for (const item of this.gameState.items) {
            if (!this.gameState.fogOfWar[item.y][item.x]) {
                visibleItemCount++;
                console.log(`Auto-explorer: Found visible item at (${item.x},${item.y}), floor not complete`);
            }
        }
        
        if (visibleEnemyCount > 0 || visibleItemCount > 0) {
            console.log(`Auto-explorer: Floor incomplete - ${visibleEnemyCount} enemies, ${visibleItemCount} items still visible`);
            return false;
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
        console.log(`Auto-explorer: Floor exploration: ${Math.round(explorationPercent * 100)}% (need 85%)`);
        
        // Require 85% exploration to ensure thoroughness
        if (explorationPercent < 0.85) {
            console.log(`Auto-explorer: Exploration incomplete (${Math.round(explorationPercent * 100)}% < 85%)`);
            return false;
        }
        
        console.log('Auto-explorer: Floor truly complete - all enemies defeated, all items collected, exploration sufficient');
        return true;
    }
    
    expandedSearch(player) {
        // When normal search fails, try a more exhaustive approach
        console.log('Auto-explorer: Performing expanded search...');
        
        // First, try to find ANY enemy on the map, even further away
        for (const enemy of this.gameState.enemies) {
            if (!this.gameState.fogOfWar[enemy.y][enemy.x]) {
                const distance = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
                console.log(`Expanded search: Found enemy at (${enemy.x},${enemy.y}), distance: ${distance}`);
                
                const path = this.findPath(player.x, player.y, enemy.x, enemy.y);
                if (path && path.length > 1) {
                    const next = path[1];
                    const dx = next.x - player.x;
                    const dy = next.y - player.y;
                    console.log('Expanded search: Moving toward distant enemy');
                    this.executeMove(dx, dy);
                    return true;
                }
            }
        }
        
        // Next, try to find ANY item on the map
        for (const item of this.gameState.items) {
            if (!this.gameState.fogOfWar[item.y][item.x]) {
                const distance = Math.abs(item.x - player.x) + Math.abs(item.y - player.y);
                console.log(`Expanded search: Found item at (${item.x},${item.y}), distance: ${distance}`);
                
                const path = this.findPath(player.x, player.y, item.x, item.y);
                if (path && path.length > 1) {
                    const next = path[1];
                    const dx = next.x - player.x;
                    const dy = next.y - player.y;
                    console.log('Expanded search: Moving toward distant item');
                    this.executeMove(dx, dy);
                    return true;
                }
            }
        }
        
        // Finally, try exploring with a much larger search range
        const expandedSearchRange = 20;
        let closestUnexplored = null;
        let minDistance = Infinity;
        
        for (let y = Math.max(0, player.y - expandedSearchRange); y < Math.min(this.gameState.map.length, player.y + expandedSearchRange); y++) {
            for (let x = Math.max(0, player.x - expandedSearchRange); x < Math.min(this.gameState.map[0].length, player.x + expandedSearchRange); x++) {
                if (!this.gameState.explored[y][x] && !this.gameState.isWall(x, y)) {
                    const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestUnexplored = {x, y};
                    }
                }
            }
        }
        
        if (closestUnexplored) {
            console.log(`Expanded search: Found unexplored area at (${closestUnexplored.x},${closestUnexplored.y})`);
            const path = this.findPath(player.x, player.y, closestUnexplored.x, closestUnexplored.y);
            if (path && path.length > 1) {
                const next = path[1];
                const dx = next.x - player.x;
                const dy = next.y - player.y;
                console.log('Expanded search: Moving toward distant unexplored area');
                this.executeMove(dx, dy);
                return true;
            }
        }
        
        console.log('Expanded search: No targets found anywhere on map');
        return false;
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
        
        if (CONFIG.DEBUG?.SHOW_AUTO_EXPLORER_LOGS) {
            console.log(`Exploring toward (${closestUnexplored.x},${closestUnexplored.y})`);
        }
        
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
        
        // Validate stairs exist and are in bounds
        if (stairsX === undefined || stairsY === undefined || 
            !this.gameState.inBounds(stairsX, stairsY)) {
            console.warn('Auto-explorer: Stairs not found or invalid position');
            return false;
        }
        
        // Check if already at stairs
        if (player.x === stairsX && player.y === stairsY) {
            console.log('Auto-explorer: Already at stairs - triggering floor transition');
            // Manually trigger the stairs by calling game handleStairs
            if (this.gameInstance && this.gameInstance.handleStairs) {
                this.gameInstance.handleStairs();
                console.log('Auto-explorer: Floor transition triggered');
                return true;
            } else if (window.game && window.game.handleStairs) {
                window.game.handleStairs();
                console.log('Auto-explorer: Floor transition triggered via window.game');
                return true;
            } else {
                console.warn('Auto-explorer: Cannot trigger stairs - handleStairs method not found');
                return false;
            }
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
        } else {
            console.warn(`Auto-explorer: No path to stairs at (${stairsX},${stairsY}) from (${player.x},${player.y})`);
            console.log('Auto-explorer: Attempting to get closer to stairs...');
            
            // Try to move in the general direction of stairs
            const directionToStairs = {
                x: Math.sign(stairsX - player.x),
                y: Math.sign(stairsY - player.y)
            };
            
            const directions = [
                [directionToStairs.x, directionToStairs.y], // Diagonal toward stairs
                [directionToStairs.x, 0], // Horizontal toward stairs
                [0, directionToStairs.y], // Vertical toward stairs
                [1, 0], [-1, 0], [0, 1], [0, -1] // All cardinal directions
            ];
            
            for (const [dx, dy] of directions) {
                if (dx === 0 && dy === 0) continue;
                
                const newX = player.x + dx;
                const newY = player.y + dy;
                
                if (this.gameState.inBounds(newX, newY) && 
                    !this.gameState.isWall(newX, newY) && 
                    !this.gameState.getEnemyAt(newX, newY)) {
                    console.log(`Auto-explorer: Moving ${dx},${dy} to try to reach stairs`);
                    this.executeMove(dx, dy);
                    return true;
                }
            }
            
            // If no movement possible, manually trigger stairs
            console.error('Auto-explorer: Cannot reach stairs by walking - manually triggering floor transition');
            if (this.gameInstance && this.gameInstance.handleStairs) {
                this.gameInstance.handleStairs();
                console.log('Auto-explorer: Forced floor transition');
                return true;
            } else if (window.game && window.game.handleStairs) {
                window.game.handleStairs();
                console.log('Auto-explorer: Forced floor transition via window.game');
                return true;
            }
            
            return false;
        }
    }
    
    // Enhanced BFS pathfinding with better configuration
    findPath(startX, startY, targetX, targetY) {
        const queue = [{x: startX, y: startY, path: [{x: startX, y: startY}]}];
        const visited = new Set([`${startX},${startY}`]);
        
        let iterations = 0;
        const maxIterations = CONFIG.PATHFINDING.MAX_NODES; // Use config value
        
        // Early distance check to avoid expensive pathfinding for very distant targets
        const distance = Math.abs(targetX - startX) + Math.abs(targetY - startY);
        if (distance > CONFIG.PATHFINDING.MAX_DISTANCE) {
            console.log(`AutoExplorerFinal: Target too distant (${distance} > ${CONFIG.PATHFINDING.MAX_DISTANCE}), skipping pathfinding`);
            return null;
        }
        
        while (queue.length > 0 && iterations < maxIterations) {
            iterations++;
            const current = queue.shift();
            
            if (current.x === targetX && current.y === targetY) {
                return current.path;
            }
            
            // Check 4 directions only (simpler and more reliable)
            for (const [dx, dy] of [[0,1], [0,-1], [1,0], [-1,0]]) {
                const x = current.x + dx;
                const y = current.y + dy;
                const key = `${x},${y}`;
                
                if (!visited.has(key) && 
                    this.gameState.inBounds(x, y) && 
                    !this.gameState.isWall(x, y) &&
                    !this.gameState.getEnemyAt(x, y)) { // Also avoid enemies in pathfinding
                    
                    visited.add(key);
                    queue.push({
                        x: x, 
                        y: y, 
                        path: [...current.path, {x: x, y: y}]
                    });
                }
            }
        }
        
        if (iterations >= maxIterations) {
            console.log(`AutoExplorerFinal: Pathfinding reached max iterations (${maxIterations}), no path found`);
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
        // Reset floor completion state
        this.isWaitingForFloorChange = false;
        this.lastFloorCompleteMessage = 0;
        
        const currentFloor = this.gameState.floor;
        const currentArea = this.gameState.currentArea?.name || 'Unknown';
        console.log(`Auto-explorer: Floor change detected - now on floor ${currentFloor} in ${currentArea}`);
        
        // If auto-explorer was enabled, continue on new floor
        if (this.enabled) {
            console.log('Auto-explorer: Continuing automation on new floor/area');
            // Longer delay to ensure floor/area initialization is complete
            setTimeout(() => {
                if (this.enabled && this.gameState.player && this.gameState.map && this.gameState.map.length > 0) {
                    console.log('Auto-explorer: Floor initialization verified, resuming...');
                    this.step();
                } else if (this.enabled) {
                    // If not ready, try again after another delay
                    console.log('Auto-explorer: Floor not ready, retrying in 1 second...');
                    setTimeout(() => {
                        if (this.enabled) {
                            console.log('Auto-explorer: Retry - resuming on floor', this.gameState.floor);
                            this.step();
                        }
                    }, 1000);
                }
            }, 800); // Increased from 500ms to 800ms
        } else {
            console.log('Auto-explorer: Not enabled, no action taken');
        }
    }
}

window.AutoExplorerFinal = AutoExplorerFinal;