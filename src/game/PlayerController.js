/**
 * PlayerController - Handles player movement, actions, and interactions
 * Manages movement validation, item pickup, stairs, auto-exploration toggle
 */
window.PlayerController = {
    /**
     * Move player in given direction
     */
    movePlayer(gameInstance, dx, dy) {
        const player = gameInstance.gameState.player;
        
        // Input validation
        if (!player || gameInstance.gameOver || !gameInstance.inputEnabled) {
            return;
        }
        
        // Validate movement direction
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) {
            return;
        }
        
        // Handle confusion status
        if (CONFIG.FEATURES.STATUS_EFFECTS && player.hasStatusEffect('confused')) {
            if (Math.random() < 0.5) {
                // Randomly change direction
                const directions = [[0,1], [0,-1], [1,0], [-1,0]];
                const randomDir = directions[Math.floor(Math.random() * directions.length)];
                dx = randomDir[0];
                dy = randomDir[1];
                gameInstance.gameState.addMessage('You stumble in confusion!', 'damage-msg');
            }
        }
        
        const newX = player.x + dx;
        const newY = player.y + dy;
        
        // Check bounds
        if (!gameInstance.gameState.inBounds(newX, newY)) return;
        
        // Check walls
        if (gameInstance.gameState.isWall(newX, newY)) return;
        
        // Check for enemy
        const enemy = gameInstance.gameState.getEnemyAt(newX, newY);
        if (enemy) {
            gameInstance.handleCombat(enemy);
            return;
        }
        
        // Move player
        if (player.useEnergy(CONFIG.BALANCE.MOVE_ENERGY_COST)) {
            // Update facing direction based on movement
            if (dx > 0) player.facing = 'right';
            else if (dx < 0) player.facing = 'left';
            else if (dy > 0) player.facing = 'down';
            else if (dy < 0) player.facing = 'up';
            
            const oldX = player.x;
            const oldY = player.y;
            
            // Start smooth movement animation
            gameInstance.gameState.startEntityAnimation(player, oldX, oldY, newX, newY);
            
            player.moveTo(newX, newY);
            
            // Mark dirty regions for rendering optimization
            gameInstance.renderer.markTileDirty(oldX, oldY); // Old position
            gameInstance.renderer.markTileDirty(newX, newY); // New position
            
            // Emit player moved event
            gameInstance.events.emit('player.moved', {
                player: player,
                from: { x: oldX, y: oldY },
                to: { x: newX, y: newY },
                direction: { dx, dy }
            });
            
            // Check for item pickup with skill bonuses
            this.handleItemPickup(gameInstance, newX, newY);
            
            // Check for stairs
            if (newX === gameInstance.gameState.stairsX && newY === gameInstance.gameState.stairsY) {
                this.handleStairs(gameInstance);
            }
            
            // Check player health for warnings
            const healthPercent = player.hp / player.maxHp;
            if (healthPercent <= 0.25 && healthPercent > 0) {
                gameInstance.events.emit('player.low_health', {
                    player: player,
                    healthPercent: healthPercent
                });
            }
            
            // Process turn
            gameInstance.gameState.processTurn();
            gameInstance.processStatusEffects();
            
            // Process skill-based regeneration
            player.processSkillRegeneration();
            
            gameInstance.processEnemyTurns();
            
            // Reset consecutive kills counter if no combat this turn
            if (player.temporaryEffects.lastDamageTime < Date.now() - CONFIG.GAME.CONSECUTIVE_KILL_TIMEOUT) {
                player.temporaryEffects.consecutiveKills = 0;
            }
        } else {
            gameInstance.gameState.addMessage('Not enough energy to move!', 'damage-msg');
        }
    },

    /**
     * Handle item pickup at given position
     */
    handleItemPickup(gameInstance, x, y) {
        const player = gameInstance.gameState.player;
        const item = gameInstance.gameState.getItemAt(x, y);
        
        if (item) {
            const result = item.apply(player);
            
            // Apply skill bonuses to gold and item effects
            if (item.type === 'gold') {
                const bonusGold = player.getModifiedGoldGain(item.value) - item.value;
                if (bonusGold > 0) {
                    player.gold += bonusGold;
                    gameInstance.gameState.addMessage(
                        `${result.message} (+${bonusGold} skill bonus!)`, 
                        result.type
                    );
                } else {
                    gameInstance.gameState.addMessage(result.message, result.type);
                }
                
                // Track gold for fortune skill
                player.trackAction('goldCollected', item.value);
                gameInstance.gameState.stats.goldCollected += item.value;
            } else {
                gameInstance.gameState.addMessage(result.message, result.type);
                
                // Track item collection for fortune skill progression
                player.trackAction('itemsCollected');
            }
            
            // Check for secret item discovery with exploration skill
            if (player.skillEffects) {
                const secretResult = player.skillEffects.checkSecretDiscovery(item);
                if (secretResult.found) {
                    const bonusItem = new Item(x, y, 'gold', secretResult.bonus);
                    gameInstance.gameState.items.push(bonusItem);
                    gameInstance.gameState.addMessage(secretResult.message, 'heal-msg');
                    player.trackAction('secretsFound');
                }
            }
            
            // Emit item collected event
            gameInstance.events.emit('item.collected', {
                item: item,
                player: player,
                result: result
            });
            
            // Check for rare items
            if (item.rarity && (item.rarity === 'rare' || item.rarity === 'legendary')) {
                gameInstance.events.emit('item.rare_discovered', {
                    item: item,
                    player: player
                });
            }
            
            gameInstance.gameState.removeItem(item);
        }
    },

    /**
     * Handle stairs interaction
     */
    handleStairs(gameInstance) {
        // Don't allow stairs if game is won
        if (gameInstance.gameState.gameVictory) {
            gameInstance.gameState.addMessage('You have already conquered all areas!', 'level-msg');
            return;
        }
        
        const previousFloor = gameInstance.gameState.floor;
        
        // Notify auto-system of floor change
        if (gameInstance.autoSystem) {
            gameInstance.autoSystem.onFloorChange();
        }
        
        gameInstance.gameState.nextFloor();
        
        // Force immediate render after floor change
        gameInstance.render();
        
        // Emit floor completion and entrance events
        gameInstance.events.emit('floor.completed', {
            floor: previousFloor,
            player: gameInstance.gameState.player,
            stats: gameInstance.gameState.stats
        });
        
        gameInstance.events.emit('floor.entered', {
            floor: gameInstance.gameState.floor,
            player: gameInstance.gameState.player
        });
        
        if (gameInstance.gameState.settings.particlesEnabled) {
            gameInstance.particles.addExplosion(
                gameInstance.gameState.player.x, 
                gameInstance.gameState.player.y, 
                '#44a'
            );
        }
    },

    /**
     * Toggle auto-exploration
     */
    toggleAutoExplore(gameInstance) {
        if (gameInstance.autoSystem) {
            // Use enhanced AI with balanced mode as default
            const currentStatus = gameInstance.autoSystem.getSystemStatus();
            if (currentStatus.explorerManager.enabled) {
                // Stop if already running
                gameInstance.autoSystem.stopAllAutomation();
                gameInstance.gameState.addMessage('Auto-exploration stopped', 'level-msg');
            } else {
                // Start with enhanced AI in balanced mode
                gameInstance.autoSystem.startFloorExploration('enhanced', 'balanced');
                gameInstance.gameState.addMessage('Auto-exploration started (Enhanced AI, Balanced mode)', 'level-msg');
            }
        } else {
            console.warn('Auto system not available');
            gameInstance.gameState.addMessage('Auto-exploration not available', 'level-msg');
        }
    },

    /**
     * Helper method to check if movement is valid
     */
    canMoveTo(gameInstance, x, y) {
        return gameInstance.gameState.inBounds(x, y) && 
               !gameInstance.gameState.isWall(x, y) && 
               !gameInstance.gameState.getEnemyAt(x, y);
    }
};

/**
 * Mixin to add player controller methods to Game class
 */
window.PlayerControllerMixin = {
    movePlayer(dx, dy) {
        return window.PlayerController.movePlayer(this, dx, dy);
    },

    handleStairs() {
        return window.PlayerController.handleStairs(this);
    },

    toggleAutoExplore() {
        return window.PlayerController.toggleAutoExplore(this);
    },

    canMoveTo(x, y) {
        return window.PlayerController.canMoveTo(this, x, y);
    }
};