import { CONFIG } from './config.js';

export class CombatSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.combatLog = [];
    }
    
    playerAttack(enemy) {
        const player = this.gameState.player;
        
        // Calculate damage
        const baseDamage = player.attack;
        const critChance = 0.1 + (player.level * 0.01);
        const isCrit = Math.random() < critChance;
        const damage = isCrit ? baseDamage * 2 : baseDamage;
        
        // Apply damage
        const actualDamage = enemy.takeDamage(damage, player.level);
        this.gameState.stats.totalDamageDealt += actualDamage;
        
        // Add message
        if (isCrit) {
            this.gameState.addMessage(`CRITICAL! You deal ${actualDamage} damage!`, 'damage-msg');
        } else {
            this.gameState.addMessage(`You deal ${actualDamage} damage!`, 'damage-msg');
        }
        
        // Check if enemy died
        if (enemy.isDead()) {
            this.onEnemyDeath(enemy);
            return { killed: true, damage: actualDamage, crit: isCrit };
        }
        
        // Enemy counter-attack
        this.enemyAttack(enemy, player);
        
        return { killed: false, damage: actualDamage, crit: isCrit };
    }
    
    enemyAttack(enemy, player) {
        const damage = Math.max(1, enemy.attack - player.defense);
        const actualDamage = player.takeDamage(damage);
        this.gameState.stats.totalDamageTaken += actualDamage;
        
        this.gameState.addMessage(
            `${enemy.type} deals ${actualDamage} damage!`, 
            'damage-msg'
        );
        
        if (player.hp <= 0) {
            this.onPlayerDeath();
        }
    }
    
    onEnemyDeath(enemy) {
        // Grant experience
        const expGain = enemy.expValue;
        const leveled = this.gameState.player.gainExp(expGain);
        
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

export class UpgradeSystem {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    canAffordUpgrade(type) {
        const cost = type === 'attack' ? 
            this.gameState.upgrades.attackCost : 
            this.gameState.upgrades.defenseCost;
        
        return this.gameState.player.gold >= cost;
    }
    
    purchaseAttackUpgrade() {
        if (!this.canAffordUpgrade('attack')) return false;
        
        const cost = this.gameState.upgrades.attackCost;
        this.gameState.player.gold -= cost;
        this.gameState.player.attack += CONFIG.BALANCE.UPGRADE_ATTACK_GAIN;
        this.gameState.upgrades.attackLevel++;
        this.gameState.upgrades.attackCost = Math.floor(
            cost * CONFIG.BALANCE.UPGRADE_COST_MULTIPLIER
        );
        
        this.gameState.addMessage(
            `Attack upgraded to ${this.gameState.player.attack}!`, 
            'heal-msg'
        );
        
        return true;
    }
    
    purchaseDefenseUpgrade() {
        if (!this.canAffordUpgrade('defense')) return false;
        
        const cost = this.gameState.upgrades.defenseCost;
        this.gameState.player.gold -= cost;
        this.gameState.player.defense += CONFIG.BALANCE.UPGRADE_DEFENSE_GAIN;
        this.gameState.upgrades.defenseLevel++;
        this.gameState.upgrades.defenseCost = Math.floor(
            cost * CONFIG.BALANCE.UPGRADE_COST_MULTIPLIER
        );
        
        this.gameState.addMessage(
            `Defense upgraded to ${this.gameState.player.defense}!`, 
            'heal-msg'
        );
        
        return true;
    }
    
    getUpgradeInfo() {
        return {
            attack: {
                level: this.gameState.upgrades.attackLevel,
                cost: this.gameState.upgrades.attackCost,
                bonus: CONFIG.BALANCE.UPGRADE_ATTACK_GAIN,
                canAfford: this.canAffordUpgrade('attack')
            },
            defense: {
                level: this.gameState.upgrades.defenseLevel,
                cost: this.gameState.upgrades.defenseCost,
                bonus: CONFIG.BALANCE.UPGRADE_DEFENSE_GAIN,
                canAfford: this.canAffordUpgrade('defense')
            }
        };
    }
}

// Import Item class for loot drops
import { Item } from './entities.js';