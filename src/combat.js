class CombatSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.combatLog = [];
    }
    
    playerAttack(enemy) {
        const player = this.gameState.player;
        
        // Calculate base damage with skill modifiers
        let baseDamage = player.getModifiedDamage(player.attack);
        
        // Apply skill-based crit chance bonuses
        const baseCritChance = CONFIG.BALANCE.BASE_CRIT_CHANCE + (player.level * CONFIG.BALANCE.CRIT_CHANCE_PER_LEVEL);
        const critChance = baseCritChance + player.skillBonuses.critChance;
        const isCrit = Math.random() < critChance;
        
        // Apply directional combat bonuses
        let positionBonus = 0;
        let positionText = '';
        
        if (CONFIG.FEATURES.DIRECTIONAL_COMBAT) {
            const relativePos = player.getRelativePosition(enemy);
            
            switch(relativePos) {
                case 'behind':
                    positionBonus = CONFIG.BALANCE.BACKSTAB_DAMAGE_BONUS;
                    positionText = ' (Backstab!)';
                    break;
                case 'side':
                    positionBonus = CONFIG.BALANCE.FLANKING_DAMAGE_BONUS;
                    positionText = ' (Flanking!)';
                    break;
                case 'cornered':
                    positionBonus = CONFIG.BALANCE.CORNER_DAMAGE_BONUS;
                    positionText = ' (Cornered!)';
                    break;
            }
        }
        
        // Apply skill-based crit multiplier
        const critMultiplier = player.skillEffects ? 
            player.skillEffects.getCritMultiplier() : 2;
        
        // Calculate final damage
        const damage = Math.floor(baseDamage * (1 + positionBonus) * (isCrit ? critMultiplier : 1));
        
        // Check for status effect applications
        if (CONFIG.FEATURES.STATUS_EFFECTS && Math.random() < CONFIG.BALANCE.STATUS_EFFECT_CHANCE) {
            enemy.applyStatusEffect('stun', CONFIG.BALANCE.STATUS_STUN_DURATION);
            this.gameState.addMessage('Enemy is stunned!', 'damage-msg');
        }
        
        // Apply damage
        const actualDamage = enemy.takeDamage(damage, player.level);
        this.gameState.stats.totalDamageDealt += actualDamage;
        
        // Track damage dealt for combat skill progression
        player.trackAction('damageDealt', actualDamage);
        
        // Add message
        let message = `You deal ${actualDamage} damage`;
        if (isCrit) {
            if (critMultiplier > 2) {
                message = `POWER CRITICAL! ${message}`;
            } else {
                message = `CRITICAL! ${message}`;
            }
        }
        message += positionText + '!';
        this.gameState.addMessage(message, 'damage-msg');
        
        // Check if enemy died
        if (enemy.isDead()) {
            this.onEnemyDeath(enemy);
            return { killed: true, damage: actualDamage, critical: isCrit };
        }
        
        // Counter-attack is now handled in the main game loop for better flow
        
        // Enemy counter-attack (unless stunned)
        if (!enemy.hasStatusEffect('stun')) {
            this.enemyAttack(enemy, player);
        }
        
        return { killed: false, damage: actualDamage, critical: isCrit };
    }
    
    enemyAttack(enemy, player) {
        let damage = Math.max(1, enemy.attack - player.defense);
        
        // Apply directional defense
        if (CONFIG.FEATURES.DIRECTIONAL_COMBAT) {
            const relativePos = enemy.getRelativePosition(player);
            
            // Player blocks attacks from the front
            if (relativePos === 'front') {
                damage = Math.floor(damage * (1 - CONFIG.BALANCE.BLOCK_DAMAGE_REDUCTION));
                this.gameState.addMessage(`You block some damage!`, '');
            }
        }
        
        // Apply skill-based damage reduction
        if (player.skillBonuses.damageReduction > 0) {
            const reduction = Math.min(damage - 1, Math.floor(damage * player.skillBonuses.damageReduction));
            damage -= reduction;
            if (reduction > 0) {
                this.gameState.addMessage(`Your training reduces ${reduction} damage!`, '');
            }
        }
        
        // Apply status effects from enemy with skill resistance
        let statusChance = 0.15;
        if (player.skillEffects) {
            statusChance *= (1 - player.skillEffects.getStatusResistance());
        }
        
        if (CONFIG.FEATURES.STATUS_EFFECTS && enemy.type === 'skeleton' && Math.random() < statusChance) {
            player.applyStatusEffect('poison', CONFIG.BALANCE.STATUS_POISON_DURATION);
            this.gameState.addMessage('You are poisoned!', 'damage-msg');
        }
        
        const actualDamage = player.takeDamage(damage);
        this.gameState.stats.totalDamageTaken += actualDamage;
        
        this.gameState.addMessage(
            `${enemy.type} deals ${actualDamage} damage!`, 
            'damage-msg'
        );
        
        // Second Wind is now handled in the takeDamage method
        
        if (player.hp <= 0) {
            this.onPlayerDeath();
        }
    }
    
    onEnemyDeath(enemy) {
        // Grant experience
        const expGain = enemy.expValue;
        const leveled = this.gameState.player.gainExp(expGain);
        
        // Track enemy kill for combat skill progression
        this.gameState.player.trackAction('enemiesKilled');
        
        this.gameState.addMessage(
            `Defeated ${enemy.type}! (+${expGain} exp)`, 
            'level-msg'
        );
        
        if (leveled) {
            this.gameState.addMessage(
                `LEVEL UP! You are now level ${this.gameState.player.level}!`, 
                'level-msg'
            );
        }
        
        // Drop gold
        if (enemy.goldDrop > 0) {
            this.gameState.items.push(
                new Item(enemy.x, enemy.y, 'gold', enemy.goldDrop)
            );
        }
        
        // Remove enemy
        this.gameState.removeEnemy(enemy);
    }
    
    onPlayerDeath() {
        this.gameState.addMessage('GAME OVER!', 'damage-msg');
        
        // Save death stats
        const deathStats = {
            floor: this.gameState.floor,
            level: this.gameState.player.level,
            ...this.gameState.stats
        };
        
        // Save to high scores
        this.saveHighScore(deathStats);
    }
    
    saveHighScore(stats) {
        const highScores = JSON.parse(localStorage.getItem('pixelRoguelikeHighScores') || '[]');
        
        highScores.push({
            date: new Date().toISOString(),
            floor: stats.floor,
            level: stats.level,
            gold: this.gameState.player.gold,
            enemiesKilled: stats.enemiesKilled,
            score: this.calculateScore(stats)
        });
        
        // Keep top 10 scores
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10);
        
        localStorage.setItem('pixelRoguelikeHighScores', JSON.stringify(highScores));
    }
    
    calculateScore(stats) {
        return (stats.floor * 1000) + 
               (stats.level * 100) + 
               (stats.enemiesKilled * 10) + 
               (stats.goldCollected);
    }
}

// Legacy UpgradeSystem removed - now using passive skill progression