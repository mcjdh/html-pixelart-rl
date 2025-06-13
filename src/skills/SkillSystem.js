/**
 * Advanced Skills System - Core skill management
 * Inspired by Path of Exile, Runescape, and Pokemon Mystery Dungeon
 */
class SkillSystem {
    constructor(player) {
        this.player = player;
        this.config = CONFIG.BALANCE.SKILL_SYSTEM;
    }
    
    /**
     * Calculate experience needed for a specific level
     */
    getExpNeededForLevel(targetLevel) {
        return Math.floor(this.config.BASE_EXP_MULTIPLIER * 
                         Math.pow(targetLevel - 1, 1.5));
    }
    
    /**
     * Gain skill experience with proper scaling and milestone checking
     */
    gainSkillExp(skillType, amount) {
        if (!this.player.skills[skillType]) return false;
        
        const skill = this.player.skills[skillType];
        const oldLevel = skill.level;
        
        // Add experience with diminishing returns at higher levels
        const scaledAmount = Math.max(1, Math.floor(amount * (1 - (skill.level - 1) * 0.02)));
        skill.exp += scaledAmount;
        
        // Check for level up - exponential scaling
        let leveled = false;
        while (skill.level < this.config.SKILL_CAP) {
            const expNeeded = this.getExpNeededForLevel(skill.level + 1);
            if (skill.exp >= expNeeded) {
                skill.exp -= expNeeded;
                skill.level++;
                leveled = true;
                this.onSkillLevelUp(skillType, skill.level);
            } else {
                break;
            }
        }
        
        // Check for synergy bonuses when multiple skills advance
        if (leveled) {
            this.checkSynergyBonuses();
        }
        
        return leveled;
    }
    
    /**
     * Handle skill level up with base bonuses and milestone checks
     */
    onSkillLevelUp(skillType, newLevel) {
        // Apply base stat increases (smaller than before)
        this.applyBaseSkillBonus(skillType);
        
        // Check for milestone unlocks
        this.checkMilestoneUnlock(skillType, newLevel);
        
        // Recalculate all skill bonuses
        this.recalculateSkillBonuses();
        
        if (window.game?.gameState) {
            const skillName = skillType.charAt(0).toUpperCase() + skillType.slice(1);
            window.game.gameState.addMessage(
                `${skillName} skill increased to level ${newLevel}!`, 
                'level-msg'
            );
        }
    }
    
    /**
     * Apply base skill bonuses (reduced from old system)
     */
    applyBaseSkillBonus(skillType) {
        switch(skillType) {
            case 'combat':
                this.player.attack += 0.5;
                break;
            case 'vitality':
                this.player.maxHp += 2;
                this.player.hp += 2;
                break;
            case 'exploration':
                this.player.maxEnergy += 3;
                this.player.energy = Math.min(this.player.energy + 3, this.player.maxEnergy);
                break;
            case 'fortune':
                this.player.defense += 0.3;
                break;
        }
    }
    
    /**
     * Check and unlock skill milestones
     */
    checkMilestoneUnlock(skillType, level) {
        const milestones = this.config[skillType.toUpperCase()];
        if (!milestones || !milestones[level]) return;
        
        const milestone = milestones[level];
        const skill = this.player.skills[skillType];
        
        // Mark milestone as unlocked
        skill.milestones.add(level);
        
        // Add to passives if it's a passive effect
        if (milestone.type === 'passive') {
            skill.passives.add(milestone.name);
        }
        
        if (window.game?.gameState) {
            const icon = this.getMilestoneIcon(milestone.type);
            window.game.gameState.addMessage(
                `${icon} Milestone Unlocked: ${milestone.name}!`, 
                'level-msg'
            );
        }
    }
    
    /**
     * Get appropriate icon for milestone type
     */
    getMilestoneIcon(type) {
        switch(type) {
            case 'ability': return '⚡';
            case 'passive': return '🛡️';
            case 'ultimate': return '🌟';
            default: return '✨';
        }
    }
    
    /**
     * Check and activate synergy bonuses
     */
    checkSynergyBonuses() {
        const synergies = this.config.SYNERGIES;
        
        // Check Warrior Path (Combat + Vitality)
        if (this.player.skills.combat.level >= synergies.WARRIOR_THRESHOLD && 
            this.player.skills.vitality.level >= synergies.WARRIOR_THRESHOLD) {
            if (!this.player.skills.combat.passives.has('Warrior Synergy')) {
                this.player.skills.combat.passives.add('Warrior Synergy');
                this.player.skills.vitality.passives.add('Warrior Synergy');
                if (window.game?.gameState) {
                    window.game.gameState.addMessage(
                        '⚔️ Synergy Unlocked: Warrior Path! +Crit Chance +Damage Reduction', 
                        'level-msg'
                    );
                }
            }
        }
        
        // Check Adventurer Path (Exploration + Fortune)
        if (this.player.skills.exploration.level >= synergies.ADVENTURER_THRESHOLD && 
            this.player.skills.fortune.level >= synergies.ADVENTURER_THRESHOLD) {
            if (!this.player.skills.exploration.passives.has('Adventurer Synergy')) {
                this.player.skills.exploration.passives.add('Adventurer Synergy');
                this.player.skills.fortune.passives.add('Adventurer Synergy');
                if (window.game?.gameState) {
                    window.game.gameState.addMessage(
                        '🗺️ Synergy Unlocked: Adventurer Path! +Gold +Item Find', 
                        'level-msg'
                    );
                }
            }
        }
        
        // Check Master Path (All skills high level)
        if (this.player.skills.combat.level >= synergies.MASTER_THRESHOLD && 
            this.player.skills.vitality.level >= synergies.MASTER_THRESHOLD &&
            this.player.skills.exploration.level >= synergies.MASTER_THRESHOLD &&
            this.player.skills.fortune.level >= synergies.MASTER_THRESHOLD) {
            if (!this.player.skills.combat.passives.has('Master Synergy')) {
                Object.keys(this.player.skills).forEach(skill => {
                    this.player.skills[skill].passives.add('Master Synergy');
                });
                if (window.game?.gameState) {
                    window.game.gameState.addMessage(
                        '👑 MASTER SYNERGY UNLOCKED! You have transcended mortal limits!', 
                        'level-msg'
                    );
                }
            }
        }
    }
    
    /**
     * Recalculate all skill bonuses from milestones and synergies
     */
    recalculateSkillBonuses() {
        // Reset bonuses
        this.player.skillBonuses = {
            combatEfficiency: 1.0,
            goldMultiplier: 1.0,
            damageReduction: 0.0,
            critChance: 0.0,
            visionRange: 0,
            hpRegenRate: 0,
            energyEfficiency: 1.0,
            deathSaveChance: 0.0,
            counterAttackChance: 0.0,
            secretFindChance: 0.0
        };
        
        // Apply milestone bonuses
        Object.keys(this.player.skills).forEach(skillType => {
            this.applyMilestoneBonuses(skillType);
        });
        
        // Apply synergy bonuses
        this.applySynergyBonuses();
    }
    
    /**
     * Apply bonuses from unlocked milestones
     */
    applyMilestoneBonuses(skillType) {
        const skill = this.player.skills[skillType];
        const config = this.config[skillType.toUpperCase()];
        if (!config) return;
        
        skill.milestones.forEach(level => {
            const milestone = config[level];
            if (!milestone) return;
            
            switch(milestone.effect) {
                case 'critMultiplier':
                    this.player.skillBonuses.critChance += milestone.value;
                    break;
                case 'counterAttack':
                    this.player.skillBonuses.counterAttackChance += milestone.value;
                    break;
                case 'hpRegen':
                    this.player.skillBonuses.hpRegenRate += milestone.value;
                    break;
                case 'damageReduction':
                    this.player.skillBonuses.damageReduction += milestone.value;
                    break;
                case 'visionRange':
                    this.player.skillBonuses.visionRange += milestone.value;
                    break;
                case 'energyCost':
                    this.player.skillBonuses.energyEfficiency += milestone.value;
                    break;
                case 'goldBonus':
                    this.player.skillBonuses.goldMultiplier += milestone.value;
                    break;
                case 'goldMultiplier':
                    this.player.skillBonuses.goldMultiplier *= milestone.value;
                    break;
                case 'deathSave':
                    this.player.skillBonuses.deathSaveChance += milestone.value;
                    break;
                case 'secretFind':
                    this.player.skillBonuses.secretFindChance += milestone.value;
                    break;
            }
        });
    }
    
    /**
     * Apply synergy bonuses
     */
    applySynergyBonuses() {
        const synergies = this.config.SYNERGIES;
        
        // Warrior Synergy
        if (this.player.skills.combat.passives.has('Warrior Synergy')) {
            this.player.skillBonuses.critChance += synergies.WARRIOR_BONUS.critChance;
            this.player.skillBonuses.damageReduction += synergies.WARRIOR_BONUS.damageReduction;
        }
        
        // Adventurer Synergy
        if (this.player.skills.exploration.passives.has('Adventurer Synergy')) {
            this.player.skillBonuses.goldMultiplier *= synergies.ADVENTURER_BONUS.goldMultiplier;
            this.player.skillBonuses.secretFindChance += synergies.ADVENTURER_BONUS.itemFind;
        }
        
        // Master Synergy
        if (this.player.skills.combat.passives.has('Master Synergy')) {
            this.player.attack += synergies.MASTER_BONUS.allStats;
            this.player.defense += synergies.MASTER_BONUS.allStats;
            this.player.skillBonuses.energyEfficiency -= synergies.MASTER_BONUS.energyEfficiency;
        }
    }
}