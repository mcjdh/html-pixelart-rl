/**
 * Enhanced Auto-Explorer with Intelligent Decision Making
 * 
 * Builds on AutoExplorerFinal.js with:
 * - Threat assessment and prioritization
 * - Item value-based collection strategies  
 * - Tactical positioning awareness
 * - Multiple AI modes (Speedrun/Balanced/Complete)
 * - Visual feedback for decision-making
 * 
 * Maintains stateless design while adding strategic intelligence
 */
class AutoExplorerEnhanced {
    constructor(gameState, gameInstance = null) {
        this.gameState = gameState;
        this.gameInstance = gameInstance;
        this.enabled = false;
        this.paused = false;
        this.mode = CONFIG.AUTO_EXPLORE?.DEFAULT_MODE || 'balanced';
        this.showDecisionVisuals = CONFIG.AUTO_EXPLORE?.SHOW_DECISION_VISUALS || false;
        
        // Use mode configurations from CONFIG (no hardcoded overrides)
        this.modeConfig = CONFIG.AUTO_EXPLORE?.MODES || {};
        
        // Now we can safely get the step delay
        this.stepDelay = this.getStepDelay();
        
        // State management for preventing spam and softlocks
        this.isWaitingForFloorChange = false;
        this.lastFloorCompleteMessage = 0;
        
        // Track failed decisions to detect stuckness patterns
        this.failedDecisions = [];
        this.maxFailedDecisions = 10; // How many failed decisions before forcing action
        this.lastSuccessfulMove = Date.now();
        
        // Blacklist unreachable enemies to prevent repeated pathfinding attempts
        this.unreachableEnemies = new Set();
        this.lastBlacklistClear = Date.now();
        
        // Blacklist unreachable exploration targets too
        this.unreachableExplorationTargets = new Set();
        
        // Algorithm-based circuit breaker - track meaningful progress metrics
        this.floorStartTime = Date.now();
        this.initialEnemyCount = 0;
        this.initialItemCount = 0;
        this.initialUnexploredCount = 0;
        this.lastProgressTime = Date.now();
        this.progressCheckInterval = 5000; // Check progress every 5 seconds
        
        // Track position history to detect area-based stuckness
        this.positionHistory = [];
        this.maxPositionHistory = 20;
    }
    
    toggle() {
        this.enabled = !this.enabled;
        this.paused = false;
        
        this.updateStatusDisplay();
        
        if (this.enabled) {
            console.log(`Enhanced Auto-explorer enabled (${this.mode} mode)`);
            this.step();
        } else {
            this.clearDecisionVisuals();
        }
        
        return this.enabled;
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
    
    toggleDecisionVisuals() {
        this.showDecisionVisuals = !this.showDecisionVisuals;
        if (!this.showDecisionVisuals) {
            this.clearDecisionVisuals();
        }
        return this.showDecisionVisuals;
    }
    
    disable() {
        this.enabled = false;
        this.paused = false;
        this.clearDecisionVisuals();
        this.updateStatusDisplay();
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
        
        // Additional safety check for game over conditions
        if (this.gameState.gameOver || this.gameState.player?.hp <= 0) {
            console.log('Enhanced Auto-explorer: Game over detected, stopping');
            this.disable();
            return;
        }
        
        // Energy management
        if (this.gameState.player.energy < CONFIG.BALANCE.MOVE_ENERGY_COST) {
            setTimeout(() => this.step(), CONFIG.AUTO_EXPLORE?.ENERGY_WAIT_DELAY || 400);
            return;
        }
        
        const player = this.gameState.player;
        
        // Track position history
        this.positionHistory.push({x: player.x, y: player.y, timestamp: Date.now()});
        if (this.positionHistory.length > this.maxPositionHistory) {
            this.positionHistory.shift();
        }
        
        const decision = this.makeDecision(player);
        
        if (this.showDecisionVisuals) {
            this.visualizeDecision(decision);
        }
        
        const decisionExecuted = this.executeDecision(decision);
        
        if (decisionExecuted) {
            this.isWaitingForFloorChange = false; // Reset waiting state
            this.lastSuccessfulMove = Date.now();
            // Only clear failed decisions if it was a meaningful move (not emergency)
            if (decision.type !== 'forced_move') {
                this.failedDecisions = []; // Clear failed decisions on successful meaningful action
            }
            setTimeout(() => this.step(), this.stepDelay);
        } else {
            console.warn(`Enhanced Auto-explorer: Decision '${decision.type}' failed to execute:`, decision.reasoning);
            
            // Track failed decision
            this.failedDecisions.push({
                type: decision.type,
                reasoning: decision.reasoning,
                position: `${player.x},${player.y}`,
                timestamp: Date.now()
            });
            
            // Clean up old failed decisions (older than 30 seconds)
            const cutoff = Date.now() - 30000;
            this.failedDecisions = this.failedDecisions.filter(f => f.timestamp > cutoff);
            
            console.log(`Enhanced Auto-explorer: Failed decisions in last 30s: ${this.failedDecisions.length}/${this.maxFailedDecisions}`);
            
            // Check for immediate repeated failures of the same decision type
            const recentSameType = this.failedDecisions.filter(f => f.type === decision.type);
            if (recentSameType.length >= 2) { // More aggressive - trigger after 2 failures
                console.log(`Enhanced Auto-explorer: Decision type '${decision.type}' failed ${recentSameType.length} times recently, forcing immediate intervention`);
                
                // Force exploration instead of the failing decision
                if (decision.type === 'seek_enemy') {
                    console.log('Enhanced Auto-explorer: Switching from failed seek_enemy to exploration');
                    const exploreTarget = this.findExplorationTarget(player);
                    if (exploreTarget) {
                        const explorePath = this.findPath(player.x, player.y, exploreTarget.x, exploreTarget.y);
                        if (explorePath && explorePath.length > 1) {
                            const next = explorePath[1];
                            const dx = next.x - player.x;
                            const dy = next.y - player.y;
                            console.log(`Enhanced Auto-explorer: Override - exploring toward (${exploreTarget.x},${exploreTarget.y})`);
                            if (this.executeMove(dx, dy)) {
                                setTimeout(() => this.step(), this.stepDelay);
                                return;
                            }
                        }
                    }
                }
                
                // If specific override didn't work, try emergency movement
                const emergencyDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                for (const [dx, dy] of emergencyDirections) {
                    const newX = player.x + dx;
                    const newY = player.y + dy;
                    
                    if (this.gameState.inBounds(newX, newY) && 
                        !this.gameState.isWall(newX, newY) && 
                        !this.gameState.getEnemyAt(newX, newY)) {
                        console.log(`Enhanced Auto-explorer: Emergency movement ${dx},${dy} to break repeated '${decision.type}' failures`);
                        if (this.executeMove(dx, dy)) {
                            setTimeout(() => this.step(), this.stepDelay);
                            return;
                        }
                    }
                }
            }
            
            // Emergency fallback - try any valid movement to avoid infinite loops
            console.log('Enhanced Auto-explorer: Attempting emergency movement to avoid softlock');
            const emergencyDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            let emergencyMoved = false;
            
            for (const [dx, dy] of emergencyDirections) {
                const newX = player.x + dx;
                const newY = player.y + dy;
                
                if (this.gameState.inBounds(newX, newY) && 
                    !this.gameState.isWall(newX, newY) && 
                    !this.gameState.getEnemyAt(newX, newY)) {
                    console.log(`Enhanced Auto-explorer: Emergency movement ${dx},${dy}`);
                    if (this.executeMove(dx, dy)) {
                        emergencyMoved = true;
                        setTimeout(() => this.step(), this.stepDelay);
                        return;
                    }
                }
            }
            
            if (!emergencyMoved) {
                // Absolutely stuck - check if floor should be complete
                if (this.isFloorTrulyComplete()) {
                    console.log(`Enhanced Auto-explorer: Floor complete in ${this.mode} mode, attempting stairs`);
                    const stairsDecision = { type: 'stairs', reasoning: 'Floor complete - proceeding to stairs' };
                    if (this.executeDecision(stairsDecision)) {
                        this.isWaitingForFloorChange = false;
                        setTimeout(() => this.step(), this.stepDelay);
                        return;
                    }
                }
                
                // Floor complete but can't reach stairs - wait
                if (!this.isWaitingForFloorChange) {
                    const now = Date.now();
                    if (now - this.lastFloorCompleteMessage > 5000) {
                        const currentFloor = this.gameState.floor;
                        const currentArea = this.gameState.currentArea?.name || 'Unknown';
                        console.log(`Enhanced Auto-explorer: Floor ${currentFloor} (${currentArea}) stuck at (${player.x},${player.y}), forcing completion check`);
                        this.gameState.addMessage(`Auto-explore (${this.mode}): Unable to continue`, 'level-msg');
                        this.lastFloorCompleteMessage = now;
                    }
                    this.isWaitingForFloorChange = true;
                }
                
                // Schedule next check with longer delay when waiting
                setTimeout(() => {
                    if (this.enabled && this.isWaitingForFloorChange) {
                        this.step();
                    }
                }, 2000);
            }
        }
    }
    
    makeDecision(player) {
        // Enhanced decision tree with threat assessment and item prioritization
        console.log(`Enhanced Auto-explorer: Making decision for player at (${player.x},${player.y})`);
        
        // Algorithm-based circuit breaker - check if we're making meaningful progress
        const timeSinceLastProgress = Date.now() - this.lastProgressTime;
        if (timeSinceLastProgress > this.progressCheckInterval) {
            const progressResult = this.checkMeaningfulProgress();
            if (progressResult.shouldForceStairs) {
                console.log(`Enhanced Auto-explorer: PROGRESS CIRCUIT BREAKER - ${progressResult.reason}`);
                return {
                    type: 'stairs',
                    reasoning: `No meaningful progress: ${progressResult.reason}`
                };
            }
            this.lastProgressTime = Date.now();
        }
        
        // Check if we have too many failed decisions recently - force different behavior
        if (this.failedDecisions.length >= this.maxFailedDecisions) {
            console.log(`Enhanced Auto-explorer: Too many failed decisions (${this.failedDecisions.length}), forcing fallback exploration`);
            
            // Count recent fallback exploration failures
            const recentFallbackFailures = this.failedDecisions.filter(f => f.type === 'fallback_explore');
            
            // If fallback exploration is also failing repeatedly, force stairs immediately
            if (recentFallbackFailures.length >= 5) {
                const explorationPercent = this.getExplorationPercentage();
                console.log(`Enhanced Auto-explorer: Fallback exploration failed ${recentFallbackFailures.length} times, forcing stairs at ${Math.round(explorationPercent * 100)}% exploration`);
                return {
                    type: 'stairs',
                    reasoning: `Emergency stairs after ${recentFallbackFailures.length} fallback exploration failures (${Math.round(explorationPercent * 100)}% explored)`
                };
            }
            
            const fallbackTarget = this.findFallbackExploration(player);
            if (fallbackTarget) {
                return {
                    type: 'fallback_explore',
                    target: fallbackTarget,
                    reasoning: `Force fallback exploration after ${this.failedDecisions.length} failed decisions`
                };
            } else {
                // Even fallback failed - force stairs if exploration is reasonable
                const explorationPercent = this.getExplorationPercentage();
                if (explorationPercent >= 0.5) { // Very lenient threshold when stuck
                    console.log(`Enhanced Auto-explorer: Forcing stairs after failed decisions (${Math.round(explorationPercent * 100)}% explored)`);
                    return {
                        type: 'stairs',
                        reasoning: `Forced stairs after failed decisions (${Math.round(explorationPercent * 100)}% explored)`
                    };
                }
            }
        }
        
        // Check if we're stuck in a small area (position-based stuckness detection)
        if (this.positionHistory.length >= this.maxPositionHistory) {
            const recentPositions = this.positionHistory.slice(-10); // Last 10 positions
            const avgX = recentPositions.reduce((sum, p) => sum + p.x, 0) / recentPositions.length;
            const avgY = recentPositions.reduce((sum, p) => sum + p.y, 0) / recentPositions.length;
            
            // Check if all recent positions are within a small radius
            const maxDistance = recentPositions.reduce((max, p) => {
                const dist = Math.abs(p.x - avgX) + Math.abs(p.y - avgY);
                return Math.max(max, dist);
            }, 0);
            
            if (maxDistance <= 3) { // Stuck in 3-tile radius
                const explorationPercent = this.getExplorationPercentage();
                console.log(`Enhanced Auto-explorer: Stuck in small area (radius ${maxDistance}), forcing stairs at ${Math.round(explorationPercent * 100)}% exploration`);
                return {
                    type: 'stairs',
                    reasoning: `Area stuckness - confined to ${maxDistance}-tile radius (${Math.round(explorationPercent * 100)}% explored)`
                };
            }
        }
        
        // Check if no successful moves for too long
        const timeSinceSuccess = Date.now() - this.lastSuccessfulMove;
        if (timeSinceSuccess > 10000) { // 10 seconds without successful move
            console.log(`Enhanced Auto-explorer: No successful moves for ${Math.round(timeSinceSuccess/1000)}s, forcing simple exploration`);
            // Force very simple movement - just try to move in any direction
            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (const [dx, dy] of directions) {
                const newX = player.x + dx;
                const newY = player.y + dy;
                if (this.gameState.inBounds(newX, newY) && 
                    !this.gameState.isWall(newX, newY) && 
                    !this.gameState.getEnemyAt(newX, newY)) {
                    return {
                        type: 'forced_move',
                        dx,
                        dy,
                        reasoning: `Forced movement after ${Math.round(timeSinceSuccess/1000)}s stuck`
                    };
                }
            }
        }
        
        // 1. Immediate threat response - attack adjacent enemies with threat assessment
        const adjacentThreats = this.getAdjacentThreats(player);
        if (adjacentThreats.length > 0) {
            const primaryThreat = this.selectPrimaryThreat(adjacentThreats);
            return {
                type: 'attack_adjacent',
                target: primaryThreat,
                reasoning: `Attacking ${primaryThreat.enemy.type} (threat: ${primaryThreat.threatScore.toFixed(2)})`
            };
        }
        
        // 2. Tactical positioning - move to advantageous position for nearby enemies
        const tacticalMove = this.findTacticalPosition(player);
        if (tacticalMove) {
            return {
                type: 'tactical_position',
                move: tacticalMove,
                reasoning: `Positioning for tactical advantage`
            };
        }
        
        // 3. High-value item collection within radius
        const valueItem = this.findValueItem(player);
        if (valueItem) {
            return {
                type: 'collect_item',
                target: valueItem,
                reasoning: `Collecting ${valueItem.item.type} (value: ${valueItem.value.toFixed(2)})`
            };
        }
        
        // 4. Enemy seeking with threat prioritization
        const enemyTarget = this.findOptimalEnemyTarget(player);
        if (enemyTarget) {
            return {
                type: 'seek_enemy',
                target: enemyTarget,
                reasoning: `Hunting ${enemyTarget.enemy.type} (priority: ${enemyTarget.priority.toFixed(2)})`
            };
        }
        
        // 5. Item seeking for lower value items
        const distantItem = this.findDistantItem(player);
        if (distantItem) {
            return {
                type: 'seek_item',
                target: distantItem,
                reasoning: `Seeking ${distantItem.item.type}`
            };
        }
        
        // 6. Continue exploration - always explore before going to stairs
        const exploreTarget = this.findExplorationTarget(player);
        console.log(`Decision check 6: Exploration target found: ${!!exploreTarget}`);
        if (exploreTarget) {
            console.log(`Enhanced Auto-explorer: Found exploration target at (${exploreTarget.x},${exploreTarget.y}), distance: ${Math.abs(exploreTarget.x - player.x) + Math.abs(exploreTarget.y - player.y)}`);
            return {
                type: 'explore',
                target: exploreTarget,
                reasoning: `Exploring unknown area at (${exploreTarget.x},${exploreTarget.y})`
            };
        }
        
        // 6.5. EMERGENCY: If no exploration target found, try fallback exploration immediately
        console.log('Decision check 6.5: No standard exploration target, trying fallback...');
        const fallbackTarget = this.findFallbackExploration(player);
        if (fallbackTarget) {
            console.log('Decision check 6.5: Fallback exploration target found');
            return {
                type: 'fallback_explore',
                target: fallbackTarget,
                reasoning: `Emergency fallback exploration`
            };
        }
        
        // 7. Move to stairs only when all visible content is cleared and exploration is sufficient
        if (this.isFloorTrulyComplete()) {
            return {
                type: 'stairs',
                reasoning: `Floor complete - proceeding to next floor`
            };
        }
        
        // 8. No valid action found but floor not complete - use fallback exploration
        console.warn('Enhanced Auto-explorer: No standard actions found, trying fallback exploration...');
        console.log(`Mode: ${this.mode}, Enemies: ${this.gameState.enemies.length}, Items: ${this.gameState.items.length}`);
        
        // Fallback: Force exploration to reveal hidden enemies/items
        const fallbackExploration = this.findFallbackExploration(player);
        if (fallbackExploration) {
            return {
                type: 'fallback_explore',
                target: fallbackExploration,
                reasoning: `Fallback exploration to reveal hidden content`
            };
        }
        
        // Check exploration percentage before forcing stairs
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
        const threshold = this.modeConfig[this.mode].EXPLORATION_THRESHOLD;
        
        if (explorationPercent < threshold * 0.8) { // If way below threshold
            // Force exploration even if we can't find anything obvious
            console.error(`Enhanced Auto-explorer: CRITICAL - Floor only ${Math.round(explorationPercent * 100)}% explored, forcing random exploration`);
            
            // Try to move in any valid direction to explore
            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (const [dx, dy] of directions) {
                const newX = player.x + dx;
                const newY = player.y + dy;
                
                if (this.gameState.inBounds(newX, newY) && 
                    !this.gameState.isWall(newX, newY) && 
                    !this.gameState.getEnemyAt(newX, newY)) {
                    console.log(`Forced exploration: Moving ${dx === 0 ? (dy > 0 ? 'down' : 'up') : (dx > 0 ? 'right' : 'left')}`);
                    return {
                        type: 'forced_move',
                        dx,
                        dy,
                        reasoning: `Forced exploration - only ${Math.round(explorationPercent * 100)}% explored`
                    };
                }
            }
        }
        
        // If exploration is sufficient or no movement possible, force stairs
        console.error('Enhanced Auto-explorer: CRITICAL - Forcing stairs movement due to no valid actions');
        return {
            type: 'stairs',
            reasoning: `Forced stairs - ${Math.round(explorationPercent * 100)}% explored`
        };
    }
    
    getAdjacentThreats(player) {
        const threats = [];
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
                    const threatScore = this.calculateThreatScore(enemy, player);
                    threats.push({
                        enemy,
                        dx,
                        dy,
                        threatScore,
                        position: { x, y }
                    });
                }
            }
        }
        
        return threats;
    }
    
    calculateThreatScore(enemy, player) {
        // Calculate how threatening an enemy is (higher = more dangerous)
        const enemyDamage = Math.max(1, enemy.attack - player.defense);
        const playerDamage = Math.max(1, player.attack - enemy.defense);
        
        // Time to kill calculations
        const timeToKillEnemy = Math.ceil(enemy.hp / playerDamage);
        const timeToKillPlayer = Math.ceil(player.hp / enemyDamage);
        
        // Base threat is damage per turn ratio
        let threat = enemyDamage / playerDamage;
        
        // Adjust for enemy health (wounded enemies are less threatening)
        const healthRatio = enemy.hp / enemy.maxHp;
        threat *= healthRatio;
        
        // Factor in survivability
        if (timeToKillPlayer < timeToKillEnemy) {
            threat *= 2.0; // Very dangerous
        } else if (timeToKillPlayer === timeToKillEnemy) {
            threat *= 1.5; // Concerning
        }
        
        // Apply mode-specific threat caution
        threat *= this.modeConfig[this.mode].THREAT_CAUTION;
        
        return threat;
    }
    
    selectPrimaryThreat(threats) {
        // Sort by threat score descending, then by enemy health ascending
        threats.sort((a, b) => {
            const threatDiff = b.threatScore - a.threatScore;
            if (Math.abs(threatDiff) < 0.1) {
                // Similar threat levels, prefer wounded enemies
                return a.enemy.hp - b.enemy.hp;
            }
            return threatDiff;
        });
        
        return threats[0];
    }
    
    findTacticalPosition(player) {
        // Look for enemies 2-3 tiles away and find positioning advantage
        const nearbyEnemies = this.gameState.enemies.filter(enemy => {
            if (this.gameState.fogOfWar[enemy.y][enemy.x]) return false;
            const dist = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
            return dist >= 2 && dist <= 3;
        });
        
        if (nearbyEnemies.length === 0) return null;
        
        // Find positions that would give flanking/backstab advantage
        const tacticalPositions = [];
        const positions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [dx, dy] of positions) {
            const newX = player.x + dx;
            const newY = player.y + dy;
            
            if (!this.gameState.inBounds(newX, newY) || 
                this.gameState.isWall(newX, newY) ||
                this.gameState.getEnemyAt(newX, newY)) {
                continue;
            }
            
            let tacticalValue = 0;
            
            for (const enemy of nearbyEnemies) {
                // Check if this position would give tactical advantage
                const relativePos = this.getRelativePosition(newX, newY, enemy.x, enemy.y);
                
                switch (relativePos) {
                    case 'behind':
                        tacticalValue += 3.0;
                        break;
                    case 'side':
                        tacticalValue += 2.0;
                        break;
                    case 'cornered':
                        tacticalValue += 1.5;
                        break;
                }
            }
            
            if (tacticalValue > 0) {
                tacticalPositions.push({
                    dx, dy,
                    value: tacticalValue,
                    position: { x: newX, y: newY }
                });
            }
        }
        
        if (tacticalPositions.length === 0) return null;
        
        // Return best tactical position
        tacticalPositions.sort((a, b) => b.value - a.value);
        return tacticalPositions[0];
    }
    
    getRelativePosition(playerX, playerY, enemyX, enemyY) {
        // Simplified relative positioning - could be enhanced with actual facing logic
        const dx = playerX - enemyX;
        const dy = playerY - enemyY;
        
        // For now, just check basic positioning
        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            return 'adjacent';
        }
        
        // Could add more sophisticated facing-based logic here
        return 'front';
    }
    
    findValueItem(player) {
        const config = this.modeConfig[this.mode];
        const items = [];
        
        for (const item of this.gameState.items) {
            if (this.gameState.fogOfWar[item.y][item.x]) continue;
            
            const distance = Math.abs(item.x - player.x) + Math.abs(item.y - player.y);
            if (distance > config.ITEM_RADIUS) continue;
            
            const value = this.calculateItemValue(item, player);
            if (value > 0) {
                items.push({
                    item,
                    distance,
                    value: value / Math.max(1, distance), // Value per distance
                    rawValue: value
                });
            }
        }
        
        if (items.length === 0) return null;
        
        // Sort by value density (value/distance)
        items.sort((a, b) => b.value - a.value);
        return items[0];
    }
    
    calculateItemValue(item, player) {
        let value = 1.0; // Base value
        
        switch (item.type) {
            case 'potion':
                // Health potions more valuable when injured
                const healthRatio = player.hp / player.maxHp;
                if (healthRatio < 0.3) {
                    value = 5.0; // Critical need
                } else if (healthRatio < 0.6) {
                    value = 3.0; // High need
                } else if (healthRatio < 0.9) {
                    value = 1.5; // Moderate need
                } else {
                    value = 0.5; // Low need
                }
                break;
                
            case 'gold':
                value = 2.0; // Always useful
                break;
                
            case 'sword':
            case 'armor':
                // Equipment value based on improvement potential
                const currentAttack = player.attack || 1;
                const currentDefense = player.defense || 0;
                
                if (item.type === 'sword' && currentAttack < 10) {
                    value = 3.0;
                } else if (item.type === 'armor' && currentDefense < 5) {
                    value = 2.5;
                } else {
                    value = 1.0;
                }
                break;
                
            default:
                value = 1.0;
        }
        
        return value;
    }
    
    findOptimalEnemyTarget(player) {
        const enemies = [];
        const maxRange = this.mode === 'speedrun' ? 6 : 8;
        
        // Clear blacklist periodically (every 30 seconds)
        if (Date.now() - this.lastBlacklistClear > 30000) {
            this.unreachableEnemies.clear();
            this.lastBlacklistClear = Date.now();
            console.log('Enhanced Auto-explorer: Cleared enemy blacklist');
        }
        
        for (const enemy of this.gameState.enemies) {
            if (this.gameState.fogOfWar[enemy.y][enemy.x]) continue;
            
            // Skip blacklisted enemies
            const enemyKey = `${enemy.x},${enemy.y}`;
            if (this.unreachableEnemies.has(enemyKey)) {
                console.log(`Enhanced Auto-explorer: Skipping blacklisted enemy at (${enemy.x},${enemy.y})`);
                continue;
            }
            
            const distance = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
            if (distance > maxRange) continue;
            
            const threatScore = this.calculateThreatScore(enemy, player);
            const priority = this.calculateEnemyPriority(enemy, distance, threatScore);
            
            enemies.push({
                enemy,
                distance,
                threatScore,
                priority
            });
        }
        
        if (enemies.length === 0) return null;
        
        // Sort by priority (higher = better target)
        enemies.sort((a, b) => b.priority - a.priority);
        return enemies[0];
    }
    
    calculateEnemyPriority(enemy, distance, threatScore) {
        let priority = 1.0;
        
        // Prefer closer enemies
        priority += (10 - distance) * 0.1;
        
        // Prefer wounded enemies (easier kills)
        const healthRatio = enemy.hp / (enemy.maxHp || enemy.hp);
        priority += (1 - healthRatio) * 2.0;
        
        // In speedrun mode, prefer weaker enemies
        if (this.mode === 'speedrun') {
            priority += (1 / Math.max(0.5, threatScore)) * 0.5;
        }
        // In complete mode, might prefer stronger enemies for better rewards
        else if (this.mode === 'complete') {
            priority += threatScore * 0.2;
        }
        
        return priority;
    }
    
    findDistantItem(player) {
        const items = [];
        const maxRange = 6;
        const minRange = this.modeConfig[this.mode].ITEM_RADIUS;
        
        for (const item of this.gameState.items) {
            if (this.gameState.fogOfWar[item.y][item.x]) continue;
            
            const distance = Math.abs(item.x - player.x) + Math.abs(item.y - player.y);
            if (distance <= minRange || distance > maxRange) continue;
            
            const value = this.calculateItemValue(item, player);
            items.push({ item, distance, value });
        }
        
        if (items.length === 0) return null;
        
        // Sort by value/distance ratio
        items.sort((a, b) => (b.value / b.distance) - (a.value / a.distance));
        return items[0];
    }
    
    isFloorTrulyComplete() {
        // Check for ANY visible enemies on the entire map
        for (const enemy of this.gameState.enemies) {
            if (!this.gameState.fogOfWar[enemy.y][enemy.x]) {
                console.log(`Enhanced Auto-explorer: Found visible enemy at (${enemy.x},${enemy.y}), floor not complete`);
                return false;
            }
        }
        
        // Check for ANY visible items on the entire map
        for (const item of this.gameState.items) {
            if (!this.gameState.fogOfWar[item.y][item.x]) {
                console.log(`Enhanced Auto-explorer: Found visible item at (${item.x},${item.y}), floor not complete`);
                return false;
            }
        }
        
        // Check exploration based on mode requirements
        const config = this.modeConfig[this.mode];
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
        let threshold = config.EXPLORATION_THRESHOLD;
        
        // If we have many failed decisions, use a more lenient threshold
        if (this.failedDecisions.length >= this.maxFailedDecisions * 0.7) {
            threshold = Math.max(0.5, threshold - 0.3); // At least 50%, but 30% more lenient
            console.log(`Enhanced Auto-explorer: Using lenient threshold ${Math.round(threshold * 100)}% due to ${this.failedDecisions.length} failed decisions`);
        }
        
        console.log(`Enhanced Auto-explorer: Floor exploration: ${Math.round(explorationPercent * 100)}% (need ${Math.round(threshold * 100)}% for ${this.mode} mode)`);
        
        if (explorationPercent < threshold) {
            console.log(`Enhanced Auto-explorer: Exploration incomplete for ${this.mode} mode`);
            return false;
        }
        
        console.log(`Enhanced Auto-explorer: Floor truly complete in ${this.mode} mode`);
        return true;
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
    
    checkMeaningfulProgress() {
        // Get current game state metrics
        const currentEnemyCount = this.gameState.enemies.filter(e => !this.gameState.fogOfWar[e.y][e.x]).length;
        const currentItemCount = this.gameState.items.filter(i => !this.gameState.fogOfWar[i.y][i.x]).length;
        const currentExplorationPercent = this.getExplorationPercentage();
        const currentUnexploredCount = Math.round((1 - currentExplorationPercent) * this.getTotalWalkableTiles());
        
        // Initialize baseline on first check
        if (this.initialEnemyCount === 0 && this.initialItemCount === 0 && this.initialUnexploredCount === 0) {
            this.initialEnemyCount = currentEnemyCount;
            this.initialItemCount = currentItemCount;
            this.initialUnexploredCount = currentUnexploredCount;
            console.log(`Enhanced Auto-explorer: Progress baseline - ${this.initialEnemyCount} enemies, ${this.initialItemCount} items, ${this.initialUnexploredCount} unexplored tiles`);
            return { shouldForceStairs: false, reason: "Baseline established" };
        }
        
        // Calculate progress made
        const enemiesCleared = this.initialEnemyCount - currentEnemyCount;
        const itemsCollected = this.initialItemCount - currentItemCount;
        const tilesExplored = this.initialUnexploredCount - currentUnexploredCount;
        
        // Calculate progress percentages
        const enemyProgress = this.initialEnemyCount > 0 ? enemiesCleared / this.initialEnemyCount : 1;
        const itemProgress = this.initialItemCount > 0 ? itemsCollected / this.initialItemCount : 1;
        const explorationProgress = this.initialUnexploredCount > 0 ? tilesExplored / this.initialUnexploredCount : 1;
        
        console.log(`Enhanced Auto-explorer: Progress check - Enemies: ${Math.round(enemyProgress * 100)}%, Items: ${Math.round(itemProgress * 100)}%, Exploration: ${Math.round(explorationProgress * 100)}%`);
        
        // Determine if we should force stairs based on progress patterns
        const timeOnFloor = Date.now() - this.floorStartTime;
        const minutesOnFloor = timeOnFloor / 60000;
        
        // Progressive thresholds based on time spent
        let requiredProgress;
        if (minutesOnFloor < 0.5) {
            requiredProgress = 0.1; // 10% progress in first 30 seconds
        } else if (minutesOnFloor < 1) {
            requiredProgress = 0.3; // 30% progress in first minute
        } else if (minutesOnFloor < 2) {
            requiredProgress = 0.5; // 50% progress in first 2 minutes
        } else {
            requiredProgress = 0.7; // 70% progress after 2 minutes
        }
        
        const maxProgress = Math.max(enemyProgress, itemProgress, explorationProgress);
        
        if (maxProgress < requiredProgress) {
            return {
                shouldForceStairs: true,
                reason: `Insufficient progress after ${Math.round(minutesOnFloor * 60)}s - max progress ${Math.round(maxProgress * 100)}% < required ${Math.round(requiredProgress * 100)}%`
            };
        }
        
        // Special case: if we've cleared all visible enemies and items but exploration is low,
        // check if remaining areas might be unreachable
        if (currentEnemyCount === 0 && currentItemCount === 0 && explorationProgress < 0.8) {
            const failedExplorationAttempts = this.failedDecisions.filter(f => 
                f.type === 'explore' || f.type === 'fallback_explore'
            ).length;
            
            if (failedExplorationAttempts >= 10) {
                return {
                    shouldForceStairs: true,
                    reason: `All visible content cleared but ${failedExplorationAttempts} exploration failures suggest unreachable areas`
                };
            }
        }
        
        return { shouldForceStairs: false, reason: "Making adequate progress" };
    }
    
    getTotalWalkableTiles() {
        let totalWalkable = 0;
        for (let y = 0; y < this.gameState.map.length; y++) {
            for (let x = 0; x < this.gameState.map[0].length; x++) {
                if (!this.gameState.isWall(x, y)) {
                    totalWalkable++;
                }
            }
        }
        return totalWalkable;
    }
    
    shouldExploreMore() {
        // Simplified - just return true if we haven't reached the exploration threshold
        return !this.isFloorTrulyComplete();
    }
    
    findExplorationTarget(player) {
        let closestUnexplored = null;
        let minDistance = Infinity;
        
        // Use mode-specific search range, with fallback to config
        const baseSearchRange = CONFIG.PATHFINDING.FALLBACK_SEARCH_RADIUS || 15;
        const searchRange = this.mode === 'complete' ? baseSearchRange + 5 : 
                          this.mode === 'speedrun' ? Math.max(8, baseSearchRange - 5) : 
                          baseSearchRange;
        
        for (let y = Math.max(0, player.y - searchRange); y < Math.min(this.gameState.map.length, player.y + searchRange); y++) {
            for (let x = Math.max(0, player.x - searchRange); x < Math.min(this.gameState.map[0].length, player.x + searchRange); x++) {
                if (!this.gameState.explored[y][x] && !this.gameState.isWall(x, y)) {
                    const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestUnexplored = { x, y };
                    }
                }
            }
        }
        
        return closestUnexplored;
    }
    
    findFallbackExploration(player) {
        // Ultra-wide search for ANY unexplored tile, ignoring normal restrictions
        console.log('Enhanced Auto-explorer: Performing fallback exploration...');
        
        let closestUnexplored = null;
        let minDistance = Infinity;
        
        // Search the ENTIRE map, not just nearby areas
        for (let y = 0; y < this.gameState.map.length; y++) {
            for (let x = 0; x < this.gameState.map[0].length; x++) {
                // Find any unexplored walkable tile
                if (!this.gameState.explored[y][x] && !this.gameState.isWall(x, y)) {
                    const targetKey = `${x},${y}`;
                    
                    // Skip blacklisted exploration targets
                    if (this.unreachableExplorationTargets.has(targetKey)) {
                        continue;
                    }
                    
                    const distance = Math.abs(x - player.x) + Math.abs(y - player.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestUnexplored = {x, y};
                    }
                }
            }
        }
        
        if (closestUnexplored) {
            console.log(`Fallback exploration: Found unexplored tile at (${closestUnexplored.x},${closestUnexplored.y}), distance: ${minDistance}`);
            return closestUnexplored;
        }
        
        console.log('Fallback exploration: No reachable unexplored tiles found');
        return null;
    }
    
    executeDecision(decision) {
        const player = this.gameState.player;
        
        switch (decision.type) {
            case 'attack_adjacent':
                return this.executeMove(decision.target.dx, decision.target.dy);
                
            case 'tactical_position':
                return this.executeMove(decision.target.dx, decision.target.dy);
                
            case 'collect_item':
                const itemDx = Math.sign(decision.target.item.x - player.x);
                const itemDy = Math.sign(decision.target.item.y - player.y);
                return this.executeMove(itemDx, itemDy);
                
            case 'seek_enemy':
                const enemyPath = this.findPath(player.x, player.y, decision.target.enemy.x, decision.target.enemy.y);
                if (enemyPath && enemyPath.length > 1) {
                    const next = enemyPath[1];
                    const dx = next.x - player.x;
                    const dy = next.y - player.y;
                    console.log(`Enhanced Auto-explorer: Seeking enemy - moving from (${player.x},${player.y}) to (${next.x},${next.y})`);
                    return this.executeMove(dx, dy);
                } else {
                    console.warn(`Enhanced Auto-explorer: No path found to enemy at (${decision.target.enemy.x},${decision.target.enemy.y})`);
                    
                    // Blacklist this enemy temporarily
                    const enemyKey = `${decision.target.enemy.x},${decision.target.enemy.y}`;
                    this.unreachableEnemies.add(enemyKey);
                    console.log(`Enhanced Auto-explorer: Blacklisted unreachable enemy at (${decision.target.enemy.x},${decision.target.enemy.y})`);
                    
                    // Try direct movement toward enemy as last resort
                    const directDx = Math.sign(decision.target.enemy.x - player.x);
                    const directDy = Math.sign(decision.target.enemy.y - player.y);
                    
                    if (directDx !== 0 || directDy !== 0) {
                        const newX = player.x + directDx;
                        const newY = player.y + directDy;
                        
                        if (this.gameState.inBounds(newX, newY) && 
                            !this.gameState.isWall(newX, newY) && 
                            !this.gameState.getEnemyAt(newX, newY)) {
                            console.log(`Enhanced Auto-explorer: Direct movement toward enemy`);
                            return this.executeMove(directDx, directDy);
                        }
                    }
                }
                break;
                
            case 'seek_item':
                const itemPath = this.findPath(player.x, player.y, decision.target.item.x, decision.target.item.y);
                if (itemPath && itemPath.length > 1) {
                    const next = itemPath[1];
                    const dx = next.x - player.x;
                    const dy = next.y - player.y;
                    return this.executeMove(dx, dy);
                }
                break;
                
            case 'explore':
                const explorePath = this.findPath(player.x, player.y, decision.target.x, decision.target.y);
                if (explorePath && explorePath.length > 1) {
                    const next = explorePath[1];
                    const dx = next.x - player.x;
                    const dy = next.y - player.y;
                    console.log(`Enhanced Auto-explorer: Exploring - moving from (${player.x},${player.y}) to (${next.x},${next.y})`);
                    return this.executeMove(dx, dy);
                } else {
                    console.warn(`Enhanced Auto-explorer: No path found to exploration target (${decision.target.x},${decision.target.y})`);
                    // Try direct movement toward target
                    const directDx = Math.sign(decision.target.x - player.x);
                    const directDy = Math.sign(decision.target.y - player.y);
                    
                    if (directDx !== 0 || directDy !== 0) {
                        const newX = player.x + directDx;
                        const newY = player.y + directDy;
                        
                        if (this.gameState.inBounds(newX, newY) && 
                            !this.gameState.isWall(newX, newY) && 
                            !this.gameState.getEnemyAt(newX, newY)) {
                            console.log(`Enhanced Auto-explorer: Direct movement toward exploration target`);
                            return this.executeMove(directDx, directDy);
                        }
                    }
                }
                break;
                
            case 'stairs':
                const stairsX = this.gameState.stairsX;
                const stairsY = this.gameState.stairsY;
                
                // Validate stairs exist and are in bounds
                if (stairsX === undefined || stairsY === undefined || 
                    !this.gameState.inBounds(stairsX, stairsY)) {
                    console.warn('Enhanced Auto-explorer: Stairs not found or invalid position');
                    return false;
                }
                
                // Check if already at stairs
                if (player.x === stairsX && player.y === stairsY) {
                    console.log('Enhanced Auto-explorer: Already at stairs - triggering floor transition');
                    // Manually trigger the stairs by calling game handleStairs
                    if (this.gameInstance && this.gameInstance.handleStairs) {
                        this.gameInstance.handleStairs();
                        console.log('Enhanced Auto-explorer: Floor transition triggered');
                        return true;
                    } else if (window.game && window.game.handleStairs) {
                        window.game.handleStairs();
                        console.log('Enhanced Auto-explorer: Floor transition triggered via window.game');
                        return true;
                    } else {
                        console.warn('Enhanced Auto-explorer: Cannot trigger stairs - handleStairs method not found');
                        return false;
                    }
                }
                
                const stairsPath = this.findPath(player.x, player.y, stairsX, stairsY);
                if (stairsPath && stairsPath.length > 1) {
                    const next = stairsPath[1];
                    const dx = next.x - player.x;
                    const dy = next.y - player.y;
                    console.log(`Enhanced Auto-explorer: Moving toward stairs: (${player.x},${player.y}) → (${next.x},${next.y})`);
                    return this.executeMove(dx, dy);
                } else {
                    console.warn(`Enhanced Auto-explorer: No path to stairs at (${stairsX},${stairsY}) from (${player.x},${player.y})`);
                    console.log('Enhanced Auto-explorer: Attempting to get closer to stairs through exploration...');
                    
                    // Try to find any unexplored tile that might lead toward stairs
                    const directionToStairs = {
                        x: Math.sign(stairsX - player.x),
                        y: Math.sign(stairsY - player.y)
                    };
                    
                    // Try moving in the general direction of stairs
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
                            console.log(`Enhanced Auto-explorer: Moving ${dx},${dy} to try to reach stairs`);
                            return this.executeMove(dx, dy);
                        }
                    }
                    
                    // If no movement possible, manually trigger stairs (teleport)
                    console.error('Enhanced Auto-explorer: Cannot reach stairs by walking - manually triggering floor transition');
                    if (this.gameInstance && this.gameInstance.handleStairs) {
                        this.gameInstance.handleStairs();
                        console.log('Enhanced Auto-explorer: Forced floor transition');
                        return true;
                    } else if (window.game && window.game.handleStairs) {
                        window.game.handleStairs();
                        console.log('Enhanced Auto-explorer: Forced floor transition via window.game');
                        return true;
                    }
                    
                    return false;
                }
                
            case 'forced_move':
                // Direct movement for forced exploration
                console.log('Enhanced Auto-explorer: Executing forced movement');
                return this.executeMove(decision.dx, decision.dy);
                
            case 'fallback_explore':
                // Fallback exploration when normal logic fails
                console.log('Enhanced Auto-explorer: Executing fallback exploration');
                const fallbackPath = this.findPath(player.x, player.y, decision.target.x, decision.target.y);
                if (fallbackPath && fallbackPath.length > 1) {
                    const next = fallbackPath[1];
                    const dx = next.x - player.x;
                    const dy = next.y - player.y;
                    console.log(`Fallback exploration: Moving toward (${decision.target.x},${decision.target.y})`);
                    return this.executeMove(dx, dy);
                } else {
                    console.warn('Fallback exploration: No path to target');
                    
                    // Blacklist this exploration target
                    const targetKey = `${decision.target.x},${decision.target.y}`;
                    this.unreachableExplorationTargets.add(targetKey);
                    console.log(`Fallback exploration: Blacklisted unreachable exploration target at (${decision.target.x},${decision.target.y})`);
                    
                    // If fallback exploration also fails, try direct movement
                    const directDx = Math.sign(decision.target.x - player.x);
                    const directDy = Math.sign(decision.target.y - player.y);
                    
                    if (directDx !== 0 || directDy !== 0) {
                        const newX = player.x + directDx;
                        const newY = player.y + directDy;
                        
                        if (this.gameState.inBounds(newX, newY) && 
                            !this.gameState.isWall(newX, newY) && 
                            !this.gameState.getEnemyAt(newX, newY)) {
                            console.log(`Fallback exploration: Direct movement toward unexplored area`);
                            return this.executeMove(directDx, directDy);
                        }
                    }
                    
                    return false;
                }
                
            case 'wait':
                // No valid action found - this indicates a problem
                console.log('Enhanced Auto-explorer: Waiting due to no valid actions...');
                return false; // Will trigger floor completion check
        }
        
        return false;
    }
    
    visualizeDecision(decision) {
        // Could add visual indicators for AI decision-making
        // This would require renderer integration
        if (this.showDecisionVisuals) {
            console.log(`[AI Decision] ${decision.reasoning}`);
        }
    }
    
    clearDecisionVisuals() {
        // Clear any visual indicators
    }
    
    // Enhanced pathfinding with improved configuration
    findPath(startX, startY, targetX, targetY) {
        const queue = [{x: startX, y: startY, path: [{x: startX, y: startY}]}];
        const visited = new Set([`${startX},${startY}`]);
        
        let iterations = 0;
        const maxIterations = CONFIG.PATHFINDING.MAX_NODES; // Use config value
        
        // Early distance check to avoid expensive pathfinding for very distant targets
        const distance = Math.abs(targetX - startX) + Math.abs(targetY - startY);
        if (distance > CONFIG.PATHFINDING.MAX_DISTANCE) {
            console.log(`AutoExplorerEnhanced: Target too distant (${distance} > ${CONFIG.PATHFINDING.MAX_DISTANCE}), skipping pathfinding`);
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
            console.log(`AutoExplorerEnhanced: Pathfinding reached max iterations (${maxIterations}), no path found`);
        }
        
        return null;
    }
    
    executeMove(dx, dy) {
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
        
        // Reset failure tracking
        this.failedDecisions = [];
        this.lastSuccessfulMove = Date.now();
        
        // Clear blacklists on floor change
        this.unreachableEnemies.clear();
        this.unreachableExplorationTargets.clear();
        this.lastBlacklistClear = Date.now();
        
        // Reset progress tracking
        this.floorStartTime = Date.now();
        this.initialEnemyCount = 0;
        this.initialItemCount = 0;
        this.initialUnexploredCount = 0;
        this.lastProgressTime = Date.now();
        
        // Reset position history
        this.positionHistory = [];
        
        const currentFloor = this.gameState.floor;
        const currentArea = this.gameState.currentArea?.name || 'Unknown';
        console.log(`Enhanced Auto-explorer: Floor change detected - now on floor ${currentFloor} in ${currentArea} (${this.mode} mode)`);
        
        if (this.enabled) {
            console.log('Enhanced Auto-explorer: Continuing automation on new floor/area');
            // Longer delay to ensure floor/area initialization is complete
            setTimeout(() => {
                if (this.enabled && this.gameState.player && this.gameState.map && this.gameState.map.length > 0) {
                    console.log('Enhanced Auto-explorer: Floor initialization verified, resuming...');
                    this.step();
                } else if (this.enabled) {
                    // If not ready, try again after another delay
                    console.log('Enhanced Auto-explorer: Floor not ready, retrying in 1 second...');
                    setTimeout(() => {
                        if (this.enabled) {
                            console.log(`Enhanced Auto-explorer: Retry - resuming on floor ${this.gameState.floor} in ${this.mode} mode`);
                            this.step();
                        }
                    }, 1000);
                }
            }, 800); // Increased from 500ms to 800ms
        } else {
            console.log('Enhanced Auto-explorer: Not enabled, no action taken');
        }
    }
}

window.AutoExplorerEnhanced = AutoExplorerEnhanced;