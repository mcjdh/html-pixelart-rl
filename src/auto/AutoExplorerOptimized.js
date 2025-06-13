/**
 * Optimized Auto-Explorer - Fixes indecisiveness and softlock issues
 * 
 * Key improvements:
 * - Anti-oscillation: Tracks recent positions to prevent back-and-forth movement
 * - Smart floor completion: More accurate detection of when to go to stairs
 * - Progressive urgency: Becomes more aggressive about stairs over time
 * - Better pathfinding fallbacks: Handles unreachable areas gracefully
 */
class AutoExplorerOptimized {
    constructor(gameState, gameInstance = null) {
        this.gameState = gameState;
        this.gameInstance = gameInstance;
        this.enabled = false;
        this.paused = false;
        this.mode = CONFIG.AUTO_EXPLORE?.DEFAULT_MODE || 'balanced';
        
        // Mode configurations
        this.modeConfig = CONFIG.AUTO_EXPLORE?.MODES || {};
        this.stepDelay = this.getStepDelay();
        
        // Anti-oscillation tracking
        this.recentPositions = [];
        this.maxRecentPositions = CONFIG.AUTO_EXPLORE?.MAX_RECENT_POSITIONS || 10;
        this.oscillationThreshold = CONFIG.AUTO_EXPLORE?.OSCILLATION_THRESHOLD || 3; // How many times we can revisit a position
        
        // Floor progress tracking
        this.floorStartTime = Date.now();
        this.lastProgressCheck = Date.now();
        this.stuckCounter = 0;
        this.maxStuckCounter = CONFIG.AUTO_EXPLORE?.MAX_STUCK_COUNTER || 20;
        
        // Exploration state
        this.explorationAttempts = 0;
        this.lastVisibleEnemyCount = 0;
        this.lastVisibleItemCount = 0;
        
        // Urgency system - increases over time to prevent getting stuck
        this.urgencyLevel = 0;
        this.maxUrgency = CONFIG.AUTO_EXPLORE?.MAX_URGENCY_LEVEL || 5;
    }
    
    toggle() {
        this.enabled = !this.enabled;
        this.paused = false;
        
        this.updateStatusDisplay();
        
        if (this.enabled) {
            if (CONFIG.DEBUG?.SHOW_AUTO_EXPLORER_LOGS) {
                console.log(`Optimized Auto-explorer enabled (${this.mode} mode)`);
            }
            this.step();
        }
        
        return this.enabled;
    }
    
    disable() {
        this.enabled = false;
        this.paused = false;
        this.updateStatusDisplay();
    }
    
    pause() {
        this.paused = !this.paused;
        this.updateStatusDisplay();
        
        if (!this.paused && this.enabled) {
            this.step();
        }
        
        return this.paused;
    }
    
    setMode(mode) {
        if (this.modeConfig[mode]) {
            this.mode = mode;
            this.stepDelay = this.getStepDelay();
            console.log(`Auto-explorer mode changed to: ${mode}`);
            this.updateStatusDisplay();
        }
    }
    
    getStepDelay() {
        return this.modeConfig[this.mode]?.STEP_DELAY || 180;
    }
    
    updateStatusDisplay() {
        const statusElement = document.getElementById('auto-explore-status');
        if (statusElement) {
            let status = 'OFF';
            if (this.enabled) {
                status = this.paused ? 'PAUSED' : `ON (${this.mode.toUpperCase()})`;
            }
            statusElement.textContent = status;
        }
    }
    
    step() {
        if (!this.enabled || this.paused || this.gameState.gameVictory) {
            return;
        }
        
        // Check game over conditions
        if (this.gameState.gameOver || this.gameState.player?.hp <= 0) {
            console.log('Optimized Auto-explorer: Game over detected, stopping');
            this.disable();
            return;
        }
        
        // Intelligent energy management with dynamic tick rates
        if (this.gameState.player.energy < CONFIG.BALANCE.MOVE_ENERGY_COST) {
            const energyWaitDelay = CONFIG.AUTO_EXPLORE?.ENERGY_WAIT_DELAY || 800;
            setTimeout(() => this.step(), energyWaitDelay);
            return;
        }
        
        // Check if we're running low on energy for smarter pacing
        const lowEnergy = this.gameState.player.energy <= (CONFIG.AUTO_EXPLORE?.MIN_ENERGY_THRESHOLD || 15);
        if (lowEnergy) {
            // Use slower conserving rate when energy is low
            this.stepDelay = Math.max(this.stepDelay, CONFIG.AUTO_EXPLORE?.ENERGY_CONSERVING_RATE || 200);
        } else {
            // Use normal mode-based rate when energy is good
            this.stepDelay = this.getStepDelay();
        }
        
        const player = this.gameState.player;
        
        // Update anti-oscillation tracking
        this.trackPosition(player.x, player.y);
        
        // Check progress every second
        if (Date.now() - this.lastProgressCheck > 1000) {
            this.checkProgress();
            this.lastProgressCheck = Date.now();
        }
        
        // Make decision based on current state
        const action = this.makeDecision(player);
        
        if (action.executed) {
            this.stuckCounter = 0;
            setTimeout(() => this.step(), this.stepDelay);
        } else {
            this.stuckCounter++;
            console.warn(`Auto-explorer: Action failed (${action.type}), stuck counter: ${this.stuckCounter}`);
            
            // If we're really stuck, increase urgency
            if (this.stuckCounter >= this.maxStuckCounter) {
                this.urgencyLevel = Math.min(this.urgencyLevel + 1, this.maxUrgency);
                this.stuckCounter = 0;
                console.log(`Auto-explorer: Increasing urgency to level ${this.urgencyLevel}`);
            }
            
            // Retry with delay
            setTimeout(() => this.step(), this.stepDelay * 2);
        }
    }
    
    trackPosition(x, y) {
        const posKey = `${x},${y}`;
        this.recentPositions.push(posKey);
        
        // Keep only recent positions
        if (this.recentPositions.length > this.maxRecentPositions) {
            this.recentPositions.shift();
        }
    }
    
    isOscillating() {
        if (this.recentPositions.length < this.maxRecentPositions) {
            return false;
        }
        
        // Count position frequencies
        const positionCounts = {};
        for (const pos of this.recentPositions) {
            positionCounts[pos] = (positionCounts[pos] || 0) + 1;
        }
        
        // Check if any position appears too often
        for (const count of Object.values(positionCounts)) {
            if (count >= this.oscillationThreshold) {
                return true;
            }
        }
        
        return false;
    }
    
    checkProgress() {
        const currentEnemyCount = this.gameState.enemies.filter(e => !this.gameState.fogOfWar[e.y][e.x]).length;
        const currentItemCount = this.gameState.items.filter(i => !this.gameState.fogOfWar[i.y][i.x]).length;
        
        // Check if we're making progress
        const enemyProgress = currentEnemyCount < this.lastVisibleEnemyCount;
        const itemProgress = currentItemCount < this.lastVisibleItemCount;
        
        if (!enemyProgress && !itemProgress) {
            this.explorationAttempts++;
            
            // If no progress for multiple attempts, increase urgency
            if (this.explorationAttempts > 5) {
                this.urgencyLevel = Math.min(this.urgencyLevel + 1, this.maxUrgency);
                this.explorationAttempts = 0;
                console.log(`Auto-explorer: No progress detected, urgency level: ${this.urgencyLevel}`);
            }
        } else {
            this.explorationAttempts = 0;
        }
        
        this.lastVisibleEnemyCount = currentEnemyCount;
        this.lastVisibleItemCount = currentItemCount;
    }
    
    makeDecision(player) {
        // 1. Attack adjacent enemies (always highest priority)
        const attackResult = this.tryAttackAdjacent(player);
        if (attackResult.executed) return attackResult;
        
        // 2. Check if we're oscillating and need to break the pattern
        if (this.isOscillating()) {
            console.log('Auto-explorer: Oscillation detected, forcing exploration');
            const exploreResult = this.tryExploreNew(player, true);
            if (exploreResult.executed) return exploreResult;
        }
        
        // 3. Collect nearby items (if not urgent)
        if (this.urgencyLevel < 3) {
            const itemResult = this.tryCollectItem(player);
            if (itemResult.executed) return itemResult;
        }
        
        // 4. Seek visible enemies (if not too urgent)
        if (this.urgencyLevel < 4) {
            const enemyResult = this.trySeekEnemy(player);
            if (enemyResult.executed) return enemyResult;
        }
        
        // 5. Check if floor is complete enough based on urgency
        if (this.shouldGoToStairs()) {
            const stairsResult = this.tryMoveToStairs(player);
            if (stairsResult.executed) return stairsResult;
        }
        
        // 6. Explore unknown areas
        const exploreResult = this.tryExploreNew(player, false);
        if (exploreResult.executed) return exploreResult;
        
        // 7. If nothing else works and urgency is high, force stairs
        if (this.urgencyLevel >= 3) {
            console.log('Auto-explorer: High urgency, forcing stairs movement');
            const stairsResult = this.tryMoveToStairs(player);
            if (stairsResult.executed) return stairsResult;
        }
        
        // 8. Emergency random movement to break out of stuck state
        return this.tryEmergencyMove(player);
    }
    
    tryAttackAdjacent(player) {
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
                    return { 
                        type: 'attack', 
                        executed: this.executeMove(dx, dy) 
                    };
                }
            }
        }
        
        return { type: 'attack', executed: false };
    }
    
    tryCollectItem(player) {
        // Look for items within reasonable range
        const maxRange = this.modeConfig[this.mode]?.ITEM_RADIUS || 3;
        let closestItem = null;
        let minDistance = Infinity;
        
        for (const item of this.gameState.items) {
            if (this.gameState.fogOfWar[item.y][item.x]) continue;
            
            const distance = Math.abs(item.x - player.x) + Math.abs(item.y - player.y);
            if (distance <= maxRange && distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        }
        
        if (closestItem) {
            const dx = Math.sign(closestItem.x - player.x);
            const dy = Math.sign(closestItem.y - player.y);
            console.log(`Moving toward item at (${closestItem.x},${closestItem.y})`);
            return { 
                type: 'collect_item', 
                executed: this.executeMove(dx, dy) 
            };
        }
        
        return { type: 'collect_item', executed: false };
    }
    
    trySeekEnemy(player) {
        // Find closest visible enemy
        let closestEnemy = null;
        let minDistance = Infinity;
        const maxRange = 8;
        
        for (const enemy of this.gameState.enemies) {
            if (this.gameState.fogOfWar[enemy.y][enemy.x]) continue;
            
            const distance = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
            if (distance <= maxRange && distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        }
        
        if (closestEnemy) {
            const path = this.findPath(player.x, player.y, closestEnemy.x, closestEnemy.y);
            if (path && path.length > 1) {
                const next = path[1];
                const dx = next.x - player.x;
                const dy = next.y - player.y;
                console.log(`Seeking enemy at (${closestEnemy.x},${closestEnemy.y})`);
                return { 
                    type: 'seek_enemy', 
                    executed: this.executeMove(dx, dy) 
                };
            }
        }
        
        return { type: 'seek_enemy', executed: false };
    }
    
    tryExploreNew(player, forceNewArea) {
        // Find unexplored areas, avoiding oscillation zones
        let target = null;
        let minDistance = Infinity;
        const searchRange = CONFIG.PATHFINDING?.FALLBACK_SEARCH_RADIUS || 15;
        
        for (let y = Math.max(0, player.y - searchRange); 
             y < Math.min(this.gameState.map.length, player.y + searchRange); y++) {
            for (let x = Math.max(0, player.x - searchRange); 
                 x < Math.min(this.gameState.map[0].length, player.x + searchRange); x++) {
                if (!this.gameState.explored[y][x] && !this.gameState.isWall(x, y)) {
                    const posKey = `${x},${y}`;
                    
                    // If forcing new area, avoid recent positions
                    if (forceNewArea && this.recentPositions.includes(posKey)) {
                        continue;
                    }
                    
                    const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        target = { x, y };
                    }
                }
            }
        }
        
        if (target) {
            const path = this.findPath(player.x, player.y, target.x, target.y);
            if (path && path.length > 1) {
                const next = path[1];
                const dx = next.x - player.x;
                const dy = next.y - player.y;
                console.log(`Exploring toward (${target.x},${target.y})`);
                return { 
                    type: 'explore', 
                    executed: this.executeMove(dx, dy) 
                };
            }
        }
        
        return { type: 'explore', executed: false };
    }
    
    tryMoveToStairs(player) {
        const stairsX = this.gameState.stairsX;
        const stairsY = this.gameState.stairsY;
        
        if (stairsX === undefined || stairsY === undefined) {
            return { type: 'stairs', executed: false };
        }
        
        // Check if already at stairs
        if (player.x === stairsX && player.y === stairsY) {
            console.log('At stairs - triggering floor transition');
            if (this.gameInstance?.handleStairs) {
                this.gameInstance.handleStairs();
                return { type: 'stairs', executed: true };
            } else if (window.game?.handleStairs) {
                window.game.handleStairs();
                return { type: 'stairs', executed: true };
            }
        }
        
        // Path to stairs
        const path = this.findPath(player.x, player.y, stairsX, stairsY);
        if (path && path.length > 1) {
            const next = path[1];
            const dx = next.x - player.x;
            const dy = next.y - player.y;
            console.log(`Moving toward stairs at (${stairsX},${stairsY})`);
            return { 
                type: 'stairs', 
                executed: this.executeMove(dx, dy) 
            };
        }
        
        // If can't path to stairs but urgency is very high, try direct movement
        if (this.urgencyLevel >= 4) {
            const dx = Math.sign(stairsX - player.x);
            const dy = Math.sign(stairsY - player.y);
            if (dx !== 0 || dy !== 0) {
                console.log('High urgency: Direct movement toward stairs');
                return { 
                    type: 'stairs', 
                    executed: this.executeMove(dx, dy) 
                };
            }
        }
        
        return { type: 'stairs', executed: false };
    }
    
    tryEmergencyMove(player) {
        console.log('Auto-explorer: Attempting emergency movement');
        
        // Try to move in any valid direction, preferring unexplored
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        // Shuffle directions to add randomness
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        for (const [dx, dy] of directions) {
            const newX = player.x + dx;
            const newY = player.y + dy;
            
            if (this.gameState.inBounds(newX, newY) && 
                !this.gameState.isWall(newX, newY) && 
                !this.gameState.getEnemyAt(newX, newY)) {
                console.log(`Emergency move: ${dx},${dy}`);
                return { 
                    type: 'emergency', 
                    executed: this.executeMove(dx, dy) 
                };
            }
        }
        
        return { type: 'emergency', executed: false };
    }
    
    shouldGoToStairs() {
        // Check visible enemies and items
        const visibleEnemies = this.gameState.enemies.filter(e => !this.gameState.fogOfWar[e.y][e.x]).length;
        const visibleItems = this.gameState.items.filter(i => !this.gameState.fogOfWar[i.y][i.x]).length;
        
        // Always go to stairs if no visible enemies or items
        if (visibleEnemies === 0 && visibleItems === 0) {
            return true;
        }
        
        // Check exploration percentage
        const explorationPercent = this.getExplorationPercentage();
        const threshold = this.modeConfig[this.mode]?.EXPLORATION_THRESHOLD || 0.8;
        
        // Adjust threshold based on urgency
        const adjustedThreshold = Math.max(0.5, threshold - (this.urgencyLevel * 0.1));
        
        // Check time on floor
        const timeOnFloor = (Date.now() - this.floorStartTime) / 1000; // seconds
        const maxTimeOnFloor = this.mode === 'speedrun' ? 120 : 180; // 2-3 minutes max
        
        if (timeOnFloor > maxTimeOnFloor) {
            console.log(`Auto-explorer: Time limit reached (${Math.round(timeOnFloor)}s), going to stairs`);
            return true;
        }
        
        if (explorationPercent >= adjustedThreshold) {
            console.log(`Auto-explorer: Exploration ${Math.round(explorationPercent * 100)}% >= ${Math.round(adjustedThreshold * 100)}% threshold`);
            return true;
        }
        
        return false;
    }
    
    getExplorationPercentage() {
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
        
        return totalWalkable > 0 ? (exploredCount / totalWalkable) : 1;
    }
    
    findPath(startX, startY, targetX, targetY) {
        const queue = [{x: startX, y: startY, path: [{x: startX, y: startY}]}];
        const visited = new Set([`${startX},${startY}`]);
        
        let iterations = 0;
        const maxIterations = CONFIG.PATHFINDING?.MAX_NODES || 500;
        
        // Early distance check
        const distance = Math.abs(targetX - startX) + Math.abs(targetY - startY);
        if (distance > (CONFIG.PATHFINDING?.MAX_DISTANCE || 30)) {
            return null;
        }
        
        while (queue.length > 0 && iterations < maxIterations) {
            iterations++;
            const current = queue.shift();
            
            if (current.x === targetX && current.y === targetY) {
                return current.path;
            }
            
            // Check 4 directions
            for (const [dx, dy] of [[0,1], [0,-1], [1,0], [-1,0]]) {
                const x = current.x + dx;
                const y = current.y + dy;
                const key = `${x},${y}`;
                
                if (!visited.has(key) && 
                    this.gameState.inBounds(x, y) && 
                    !this.gameState.isWall(x, y) &&
                    !this.gameState.getEnemyAt(x, y)) {
                    
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
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            console.error(`Invalid move: (${dx},${dy})`);
            return false;
        }
        
        if (this.gameInstance?.movePlayer) {
            this.gameInstance.movePlayer(dx, dy);
            return true;
        } else if (window.game?.movePlayer) {
            window.game.movePlayer(dx, dy);
            return true;
        }
        
        return false;
    }
    
    onFloorChange() {
        // Reset state for new floor
        this.recentPositions = [];
        this.floorStartTime = Date.now();
        this.lastProgressCheck = Date.now();
        this.stuckCounter = 0;
        this.explorationAttempts = 0;
        this.lastVisibleEnemyCount = 0;
        this.lastVisibleItemCount = 0;
        this.urgencyLevel = 0;
        
        const currentFloor = this.gameState.floor;
        const currentArea = this.gameState.currentArea?.name || 'Unknown';
        console.log(`Optimized Auto-explorer: Floor change - now on floor ${currentFloor} in ${currentArea}`);
        
        if (this.enabled) {
            console.log('Optimized Auto-explorer: Continuing on new floor');
            setTimeout(() => {
                if (this.enabled && this.gameState.player && this.gameState.map?.length > 0) {
                    this.step();
                }
            }, 800);
        }
    }
}

window.AutoExplorerOptimized = AutoExplorerOptimized;