/**
 * Skill Effects - Handles application of skill bonuses to gameplay
 */
class SkillEffects {
    constructor(player) {
        this.player = player;
    }
    
    /**
     * Apply skill bonuses to damage calculation
     */
    getModifiedDamage(baseDamage) {
        let damage = baseDamage;
        
        // Apply combat skill bonuses
        if (this.player.skills.combat.passives.has('Weapon Mastery')) {
            damage += this.player.skills.combat.level * 0.5;
        }
        
        // Berserker mode when low HP
        if (this.player.skills.combat.passives.has('Berserker') && 
            this.player.hp <= this.player.maxHp * 0.3) {
            damage *= 1.5;
        }
        
        return Math.floor(damage);
    }
    
    /**
     * Apply skill bonuses to energy costs
     */
    getModifiedEnergyCost(baseCost) {
        return Math.max(1, Math.floor(baseCost * this.player.skillBonuses.energyEfficiency));
    }
    
    /**
     * Apply skill bonuses to gold gains
     */
    getModifiedGoldGain(baseGold) {
        return Math.floor(baseGold * this.player.skillBonuses.goldMultiplier);
    }
    
    /**
     * Check for death save from Vitality milestone
     */
    attemptDeathSave() {
        if (this.player.skillBonuses.deathSaveChance > 0 && 
            Math.random() < this.player.skillBonuses.deathSaveChance) {
            this.player.hp = 1;
            if (window.game?.gameState) {
                window.game.gameState.addMessage(
                    '💫 Undying Will saves you from death!', 
                    'heal-msg'
                );
            }
            return true;
        }
        return false;
    }
    
    /**
     * Process skill-based regeneration
     */
    processSkillRegeneration() {
        // HP regeneration from Vitality skills
        if (this.player.skillBonuses.hpRegenRate > 0 && this.player.hp < this.player.maxHp) {
            // Track last skill healing to prevent spam
            const now = Date.now();
            this.player.lastSkillHeal = this.player.lastSkillHeal || 0;
            
            // Only heal every 3 seconds from skills
            if (now - this.player.lastSkillHeal >= 3000) {
                const healed = this.player.heal(this.player.skillBonuses.hpRegenRate);
                if (healed > 0 && window.game?.gameState) {
                    window.game.gameState.addMessage(
                        `⚡ Toughness restores ${healed} HP`, 
                        'heal-msg'
                    );
                    this.player.lastSkillHeal = now;
                }
            }
        }
    }
    
    /**
     * Check for Second Wind activation (Vitality milestone)
     */
    triggerSecondWind() {
        if (this.player.skills.vitality.milestones.has(10) && 
            this.player.hp <= this.player.maxHp * 0.3) {
            const secondWindBonus = Math.floor(this.player.maxHp * 0.05);
            if (secondWindBonus > 0) {
                this.player.heal(secondWindBonus);
                if (window.game?.gameState) {
                    window.game.gameState.addMessage(
                        `Second Wind restores ${secondWindBonus} HP!`, 
                        'heal-msg'
                    );
                }
                return secondWindBonus;
            }
        }
        return 0;
    }
    
    /**
     * Calculate enhanced crit multiplier from Combat milestones
     */
    getCritMultiplier() {
        let critMultiplier = 2;
        if (this.player.skills.combat.milestones.has(5)) { // Power Strike
            critMultiplier += 0.5;
        }
        return critMultiplier;
    }
    
    /**
     * Check for counter-attack from Combat Reflexes
     */
    attemptCounterAttack(enemy) {
        if (this.player.skillBonuses.counterAttackChance > 0 && 
            Math.random() < this.player.skillBonuses.counterAttackChance && 
            !enemy.isDead()) {
            const counterDamage = Math.floor(this.player.attack * 0.5);
            const counterActual = enemy.takeDamage(counterDamage, this.player.level);
            
            if (window.game?.gameState) {
                window.game.gameState.addMessage(
                    `Counter-attack deals ${counterActual} damage!`, 
                    'damage-msg'
                );
            }
            
            return { damage: counterActual, killed: enemy.isDead() };
        }
        return null;
    }
    
    /**
     * Calculate status effect resistance from skills
     */
    getStatusResistance() {
        let resistance = 0;
        
        if (this.player.skills.vitality.passives.has('Iron Constitution')) {
            resistance += 0.4; // 40% resistance
        }
        
        if (this.player.skills.combat.passives.has('Combat Veteran')) {
            resistance += 0.8; // 80% stun resistance specifically
        }
        
        return Math.min(0.9, resistance); // Cap at 90% resistance
    }
    
    /**
     * Check for secret item discovery
     */
    checkSecretDiscovery(baseItem) {
        if (this.player.skillBonuses.secretFindChance > 0 && 
            Math.random() < this.player.skillBonuses.secretFindChance) {
            return {
                found: true,
                bonus: Math.floor(baseItem.value * 2),
                message: '🔍 Keen senses reveal hidden treasure!'
            };
        }
        return { found: false };
    }
}