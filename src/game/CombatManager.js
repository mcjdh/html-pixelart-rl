/**
 * CombatManager - Handles combat processing, enemy turns, and status effects
 * Manages player combat, enemy AI movement, and status effect processing
 */
window.CombatManager = {
    /**
     * Handle player combat with an enemy
     */
    handleCombat(gameInstance, enemy) {
        const player = gameInstance.gameState.player;
        
        // Track combat time for healing delay
        gameInstance.lastCombatTime = Date.now();
        
        // Apply skill-based energy cost modifications
        const energyCost = player.getModifiedEnergyCost(CONFIG.BALANCE.COMBAT_ENERGY_COST);
        if (!player.useEnergy(energyCost)) {
            return;
        }
        
        const result = gameInstance.combat.playerAttack(enemy);
        
        // Check for counter-attack from Combat Reflexes milestone
        if (!result.killed && player.skillEffects) {
            const counterResult = player.skillEffects.attemptCounterAttack(enemy);
            if (counterResult && counterResult.killed) {
                result.killed = true;
            }
        }
        
        // Reset consecutive kills counter on enemy death
        if (result.killed) {
            player.temporaryEffects.consecutiveKills = 0;
        }
        
        // Emit combat events
        gameInstance.events.emit('combat.attack', {
            attacker: player,
            target: enemy,
            damage: result.damage,
            critical: result.critical,
            killed: result.killed
        });
        
        if (result.killed) {
            // Emit enemy killed event
            gameInstance.events.emit('enemy.killed', {
                enemy: enemy,
                killer: player,
                floor: gameInstance.gameState.floor,
                combat: result
            });
            
            if (gameInstance.gameState.settings.particlesEnabled) {
                gameInstance.particles.addExplosion(enemy.x, enemy.y, '#a44');
            }
        }
        
        // Check for player death
        if (player.hp <= 0) {
            gameInstance.handleGameOver();
        }
    },

    /**
     * Process all enemy turns
     */
    processEnemyTurns(gameInstance) {
        for (const enemy of gameInstance.gameState.enemies) {
            // Update enemy status effects
            if (CONFIG.FEATURES.STATUS_EFFECTS) {
                enemy.updateStatusEffects();
                
                // Skip turn if stunned
                if (enemy.hasStatusEffect('stun')) {
                    continue;
                }
            }
            
            if (enemy.canSeeEntity(gameInstance.gameState.player, gameInstance.gameState.fogOfWar)) {
                this.processEnemyMove(gameInstance, enemy);
            }
        }
    },

    /**
     * Process status effects on player
     */
    processStatusEffects(gameInstance) {
        if (!CONFIG.FEATURES.STATUS_EFFECTS) return;
        
        const player = gameInstance.gameState.player;
        
        // Process poison damage (REBALANCED - much weaker)
        if (player.hasStatusEffect('poison')) {
            // Poison now does minimal damage - only 2% max HP
            const poisonDamage = Math.max(1, Math.floor(player.maxHp * 0.02)); // 2% of max HP (was 5%)
            const damage = player.takeDamage(poisonDamage);
            gameInstance.gameState.addMessage(`Poison deals ${damage} damage!`, 'damage-msg');
            
            if (player.hp <= 0) {
                gameInstance.handleGameOver();
            }
        }
        
        // Process blessed bonus (visual indicator only for now)
        if (player.hasStatusEffect('blessed')) {
            // Could add healing or damage bonus here
        }
        
        // Update all status effect durations
        player.updateStatusEffects();
    },

    /**
     * Process individual enemy movement and combat
     */
    processEnemyMove(gameInstance, enemy) {
        const player = gameInstance.gameState.player;
        const dist = enemy.distanceTo(player);
        
        // Attack if adjacent
        if (dist <= 1.5) {
            gameInstance.combat.enemyAttack(enemy, player);
            
            if (player.hp <= 0) {
                gameInstance.handleGameOver();
            }
            return;
        }
        
        // Move towards player
        const move = enemy.getMoveTowards(player.x, player.y);
        const newX = enemy.x + move.dx;
        const newY = enemy.y + move.dy;
        
        // Check if move is valid
        if (!gameInstance.gameState.isWall(newX, newY) && 
            !gameInstance.gameState.isOccupied(newX, newY)) {
            const oldX = enemy.x;
            const oldY = enemy.y;
            
            // Start smooth movement animation for enemy
            gameInstance.gameState.startEntityAnimation(enemy, oldX, oldY, newX, newY, 120);
            
            enemy.moveTo(newX, newY);
            
            // Mark dirty regions for rendering optimization
            gameInstance.renderer.markTileDirty(oldX, oldY); // Old position
            gameInstance.renderer.markTileDirty(newX, newY); // New position
        }
    }
};

/**
 * Mixin to add combat management methods to Game class
 */
window.CombatManagerMixin = {
    handleCombat(enemy) {
        return window.CombatManager.handleCombat(this, enemy);
    },

    processEnemyTurns() {
        return window.CombatManager.processEnemyTurns(this);
    },

    processStatusEffects() {
        return window.CombatManager.processStatusEffects(this);
    },

    processEnemyMove(enemy) {
        return window.CombatManager.processEnemyMove(this, enemy);
    }
};