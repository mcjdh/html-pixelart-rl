class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.facing = 'down'; // up, down, left, right
        this.statusEffects = [];
    }
    
    moveTo(x, y) {
        // Update facing based on movement
        if (x > this.x) this.facing = 'right';
        else if (x < this.x) this.facing = 'left';
        else if (y > this.y) this.facing = 'down';
        else if (y < this.y) this.facing = 'up';
        
        this.x = x;
        this.y = y;
    }
    
    distanceTo(other) {
        return GameUtils.calculateDistance(this, other);
    }
    
    getRelativePosition(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        
        // Check if target is in a corner relative to this entity
        if (this.isInCorner(target)) {
            return 'cornered';
        }
        
        // Check facing-based positions
        switch(this.facing) {
            case 'up':
                if (dy < 0) return 'front';
                if (dy > 0) return 'behind';
                return 'side';
            case 'down':
                if (dy > 0) return 'front';
                if (dy < 0) return 'behind';
                return 'side';
            case 'left':
                if (dx < 0) return 'front';
                if (dx > 0) return 'behind';
                return 'side';
            case 'right':
                if (dx > 0) return 'front';
                if (dx < 0) return 'behind';
                return 'side';
        }
    }
    
    isInCorner(target) {
        // Check if target is trapped in a corner (simplified check)
        let wallCount = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const checkX = target.x + dx;
                const checkY = target.y + dy;
                if (checkX < 0 || checkX >= CONFIG.GRID_WIDTH || 
                    checkY < 0 || checkY >= CONFIG.GRID_HEIGHT ||
                    (window.game && window.game.gameState.isWall(checkX, checkY))) {
                    wallCount++;
                }
            }
        }
        return wallCount >= CONFIG.BALANCE.CORNER_WALL_COUNT; // Surrounded by enough walls/edges = cornered
    }
    
    applyStatusEffect(type, duration) {
        if (!CONFIG.FEATURES.STATUS_EFFECTS) return;
        
        // Check if already has this effect
        const existing = this.statusEffects.find(e => e.type === type);
        if (existing) {
            existing.duration = Math.max(existing.duration, duration);
        } else {
            this.statusEffects.push({ type, duration });
        }
    }
    
    hasStatusEffect(type) {
        return this.statusEffects.some(e => e.type === type);
    }
    
    updateStatusEffects() {
        this.statusEffects = this.statusEffects.filter(effect => {
            effect.duration--;
            return effect.duration > 0;
        });
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y);
        this.hp = CONFIG.BALANCE.PLAYER_START_HP;
        this.maxHp = CONFIG.BALANCE.PLAYER_START_HP;
        this.attack = CONFIG.BALANCE.PLAYER_START_ATTACK;
        this.defense = CONFIG.BALANCE.PLAYER_START_DEFENSE;
        this.level = 1;
        this.exp = 0;
        this.expToNext = CONFIG.BALANCE.EXP_PER_LEVEL;
        this.gold = 0;
        this.energy = CONFIG.BALANCE.PLAYER_START_ENERGY;
        this.maxEnergy = CONFIG.BALANCE.PLAYER_START_ENERGY;
        this.inventory = [];
        
        // Advanced Skills System (Path of Exile / Runescape inspired)
        this.skills = {
            combat: { 
                exp: 0, 
                level: 1, 
                milestones: new Set(), // Track unlocked abilities
                passives: new Set()    // Track active passive effects
            },
            vitality: { 
                exp: 0, 
                level: 1, 
                milestones: new Set(),
                passives: new Set()
            },
            exploration: { 
                exp: 0, 
                level: 1, 
                milestones: new Set(),
                passives: new Set()
            },
            fortune: { 
                exp: 0, 
                level: 1, 
                milestones: new Set(),
                passives: new Set()
            }
        };
        
        // Active skill effects and synergies
        this.skillBonuses = {
            combatEfficiency: 1.0,    // Reduces energy costs
            goldMultiplier: 1.0,      // Multiplies gold gain
            damageReduction: 0.0,     // Flat damage reduction
            critChance: 0.0,          // Additional crit chance
            visionRange: 0,           // Bonus vision tiles
            hpRegenRate: 0,           // HP regeneration per turn
            energyEfficiency: 1.0,    // Energy cost multiplier
            deathSaveChance: 0.0,     // Chance to survive lethal damage
            counterAttackChance: 0.0, // Chance to counter-attack
            secretFindChance: 0.0     // Chance to find hidden items
        };
        
        // Track actions for skill progression
        this.actionCounts = {
            enemiesKilled: 0,
            damageTaken: 0,
            tilesExplored: 0,
            itemsCollected: 0,
            secretsFound: 0,
            goldCollected: 0
        };
        
        // Temporary effects for combat
        this.temporaryEffects = {
            lastDamageTime: 0,
            consecutiveKills: 0,
            turnsAtLowHP: 0
        };
    }
    
    gainExp(amount) {
        this.exp += amount;
        let leveled = false;
        
        while (this.exp >= this.expToNext) {
            this.levelUp();
            leveled = true;
        }
        
        return leveled;
    }
    
    levelUp() {
        this.level++;
        this.exp -= this.expToNext;
        this.expToNext = this.level * CONFIG.BALANCE.EXP_PER_LEVEL;
        
        // Progressive HP scaling - more HP at higher levels
        const hpGain = CONFIG.BALANCE.LEVEL_HP_GAIN + Math.floor(this.level / 4);
        this.maxHp += hpGain;
        this.hp = this.maxHp;
        
        // Progressive attack scaling - more attack at higher levels
        const attackGain = CONFIG.BALANCE.LEVEL_ATTACK_GAIN + Math.floor(this.level / 5);
        this.attack += attackGain;
    }
    
    // Advanced skill progression system
    gainSkillExp(skillType, amount) {
        if (!this.skills[skillType]) return false;
        
        const skill = this.skills[skillType];
        const oldLevel = skill.level;
        
        // Add experience with diminishing returns at higher levels
        const scaledAmount = Math.max(1, Math.floor(amount * (1 - (skill.level - 1) * 0.02)));
        skill.exp += scaledAmount;
        
        // Check for level up - exponential scaling like Runescape
        let leveled = false;
        while (skill.level < CONFIG.BALANCE.SKILL_SYSTEM.SKILL_CAP) {
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
    
    getExpNeededForLevel(targetLevel) {
        // Exponential scaling similar to Runescape
        return Math.floor(CONFIG.BALANCE.SKILL_SYSTEM.BASE_EXP_MULTIPLIER * 
                         Math.pow(targetLevel - 1, 1.5));
    }
    
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
    
    applyBaseSkillBonus(skillType) {
        // Smaller base bonuses since milestones provide the major effects
        switch(skillType) {
            case 'combat':
                this.attack += 0.5; // Half what it was before
                break;
            case 'vitality':
                this.maxHp += 2;    // Reduced from 3
                this.hp += 2;
                break;
            case 'exploration':
                this.maxEnergy += 3; // Reduced from 5
                this.energy = Math.min(this.energy + 3, this.maxEnergy);
                break;
            case 'fortune':
                this.defense += 0.3; // Reduced from 1
                break;
        }
    }
    
    checkMilestoneUnlock(skillType, level) {
        const milestones = CONFIG.BALANCE.SKILL_SYSTEM[skillType.toUpperCase()];
        if (!milestones || !milestones[level]) return;
        
        const milestone = milestones[level];
        const skill = this.skills[skillType];
        
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
    
    getMilestoneIcon(type) {
        switch(type) {
            case 'ability': return '⚡';
            case 'passive': return '🛡️';
            case 'ultimate': return '🌟';
            default: return '✨';
        }
    }
    
    checkSynergyBonuses() {
        const synergies = CONFIG.BALANCE.SKILL_SYSTEM.SYNERGIES;
        
        // Check Warrior Path (Combat + Vitality)
        if (this.skills.combat.level >= synergies.WARRIOR_THRESHOLD && 
            this.skills.vitality.level >= synergies.WARRIOR_THRESHOLD) {
            if (!this.skills.combat.passives.has('Warrior Synergy')) {
                this.skills.combat.passives.add('Warrior Synergy');
                this.skills.vitality.passives.add('Warrior Synergy');
                if (window.game?.gameState) {
                    window.game.gameState.addMessage(
                        '⚔️ Synergy Unlocked: Warrior Path! +Crit Chance +Damage Reduction', 
                        'level-msg'
                    );
                }
            }
        }
        
        // Check Adventurer Path (Exploration + Fortune)
        if (this.skills.exploration.level >= synergies.ADVENTURER_THRESHOLD && 
            this.skills.fortune.level >= synergies.ADVENTURER_THRESHOLD) {
            if (!this.skills.exploration.passives.has('Adventurer Synergy')) {
                this.skills.exploration.passives.add('Adventurer Synergy');
                this.skills.fortune.passives.add('Adventurer Synergy');
                if (window.game?.gameState) {
                    window.game.gameState.addMessage(
                        '🗺️ Synergy Unlocked: Adventurer Path! +Gold +Item Find', 
                        'level-msg'
                    );
                }
            }
        }
        
        // Check Master Path (All skills high level)
        if (this.skills.combat.level >= synergies.MASTER_THRESHOLD && 
            this.skills.vitality.level >= synergies.MASTER_THRESHOLD &&
            this.skills.exploration.level >= synergies.MASTER_THRESHOLD &&
            this.skills.fortune.level >= synergies.MASTER_THRESHOLD) {
            if (!this.skills.combat.passives.has('Master Synergy')) {
                Object.keys(this.skills).forEach(skill => {
                    this.skills[skill].passives.add('Master Synergy');
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
    
    recalculateSkillBonuses() {
        // Reset bonuses
        this.skillBonuses = {
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
        Object.keys(this.skills).forEach(skillType => {
            this.applyMilestoneBonuses(skillType);
        });
        
        // Apply synergy bonuses
        this.applySynergyBonuses();
    }
    
    applyMilestoneBonuses(skillType) {
        const skill = this.skills[skillType];
        const config = CONFIG.BALANCE.SKILL_SYSTEM[skillType.toUpperCase()];
        if (!config) return;
        
        skill.milestones.forEach(level => {
            const milestone = config[level];
            if (!milestone) return;
            
            switch(milestone.effect) {
                case 'critMultiplier':
                    this.skillBonuses.critChance += milestone.value;
                    break;
                case 'counterAttack':
                    this.skillBonuses.counterAttackChance += milestone.value;
                    break;
                case 'hpRegen':
                    this.skillBonuses.hpRegenRate += milestone.value;
                    break;
                case 'damageReduction':
                    this.skillBonuses.damageReduction += milestone.value;
                    break;
                case 'visionRange':
                    this.skillBonuses.visionRange += milestone.value;
                    break;
                case 'energyCost':
                    this.skillBonuses.energyEfficiency += milestone.value;
                    break;
                case 'goldBonus':
                    this.skillBonuses.goldMultiplier += milestone.value;
                    break;
                case 'goldMultiplier':
                    this.skillBonuses.goldMultiplier *= milestone.value;
                    break;
                case 'deathSave':
                    this.skillBonuses.deathSaveChance += milestone.value;
                    break;
                case 'secretFind':
                    this.skillBonuses.secretFindChance += milestone.value;
                    break;
            }
        });
    }
    
    applySynergyBonuses() {
        const synergies = CONFIG.BALANCE.SKILL_SYSTEM.SYNERGIES;
        
        // Warrior Synergy
        if (this.skills.combat.passives.has('Warrior Synergy')) {
            this.skillBonuses.critChance += synergies.WARRIOR_BONUS.critChance;
            this.skillBonuses.damageReduction += synergies.WARRIOR_BONUS.damageReduction;
        }
        
        // Adventurer Synergy
        if (this.skills.exploration.passives.has('Adventurer Synergy')) {
            this.skillBonuses.goldMultiplier *= synergies.ADVENTURER_BONUS.goldMultiplier;
            this.skillBonuses.secretFindChance += synergies.ADVENTURER_BONUS.itemFind;
        }
        
        // Master Synergy
        if (this.skills.combat.passives.has('Master Synergy')) {
            this.attack += synergies.MASTER_BONUS.allStats;
            this.defense += synergies.MASTER_BONUS.allStats;
            this.skillBonuses.energyEfficiency -= synergies.MASTER_BONUS.energyEfficiency;
        }
    }
    
    // Track actions and award skill experience
    trackAction(actionType, value = 1) {
        this.actionCounts[actionType] += value;
        
        switch(actionType) {
            case 'enemiesKilled':
                // More exp for stronger enemies, consecutive kills
                const combatExp = 8 + (this.temporaryEffects.consecutiveKills * 2);
                this.gainSkillExp('combat', combatExp);
                this.temporaryEffects.consecutiveKills++;
                break;
            case 'damageTaken':
                // More exp when taking significant damage relative to max HP
                const vitalityExp = Math.min(value, Math.max(1, Math.floor(value / this.maxHp * 10)));
                this.gainSkillExp('vitality', vitalityExp);
                break;
            case 'tilesExplored':
                // Bonus exp for exploring new areas
                this.gainSkillExp('exploration', 2);
                break;
            case 'itemsCollected':
                // Different exp based on item type
                this.gainSkillExp('fortune', 3);
                break;
            case 'goldCollected':
                // Fortune exp scales with gold amount
                this.actionCounts.goldCollected += value;
                const fortuneExp = Math.min(5, Math.max(1, Math.floor(value / 10)));
                this.gainSkillExp('fortune', fortuneExp);
                break;
            case 'secretsFound':
                // High exp for finding secrets
                this.gainSkillExp('exploration', 15);
                this.gainSkillExp('fortune', 10);
                break;
        }
    }
    
    // Apply skill bonuses to damage calculation
    getModifiedDamage(baseDamage) {
        let damage = baseDamage;
        
        // Apply combat skill bonuses
        if (this.skills.combat.passives.has('Weapon Mastery')) {
            damage += this.skills.combat.level * 0.5;
        }
        
        // Berserker mode when low HP
        if (this.skills.combat.passives.has('Berserker') && this.hp <= this.maxHp * 0.3) {
            damage *= 1.5;
        }
        
        return Math.floor(damage);
    }
    
    // Apply skill bonuses to energy costs
    getModifiedEnergyCost(baseCost) {
        return Math.max(1, Math.floor(baseCost * this.skillBonuses.energyEfficiency));
    }
    
    // Apply skill bonuses to gold gains
    getModifiedGoldGain(baseGold) {
        return Math.floor(baseGold * this.skillBonuses.goldMultiplier);
    }
    
    // Check for death save from Vitality milestone
    attemptDeathSave() {
        if (this.skillBonuses.deathSaveChance > 0 && Math.random() < this.skillBonuses.deathSaveChance) {
            this.hp = 1;
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
    
    // Process skill-based regeneration
    processSkillRegeneration() {
        // HP regeneration from Vitality
        if (this.skillBonuses.hpRegenRate > 0 && this.hp < this.maxHp) {
            const healed = this.heal(this.skillBonuses.hpRegenRate);
            if (healed > 0 && window.game?.gameState) {
                window.game.gameState.addMessage(
                    `Toughness restores ${healed} HP`, 
                    'heal-msg'
                );
            }
        }
    }
    
    takeDamage(amount) {
        // Apply skill-based damage reduction
        const reducedAmount = Math.max(1, amount - this.skillBonuses.damageReduction);
        const damage = Math.max(1, reducedAmount - this.defense);
        
        // Check for death save before applying lethal damage
        if (this.hp - damage <= 0 && this.attemptDeathSave()) {
            return 0; // Death save triggered
        }
        
        this.hp -= damage;
        
        // Track damage for vitality skill progression
        this.trackAction('damageTaken', damage);
        
        // Update combat state
        this.temporaryEffects.lastDamageTime = Date.now();
        if (this.hp <= this.maxHp * 0.3) {
            this.temporaryEffects.turnsAtLowHP++;
        }
        
        return damage;
    }
    
    heal(amount) {
        const healed = Math.min(amount, this.maxHp - this.hp);
        this.hp += healed;
        return healed;
    }
    
    useEnergy(amount) {
        if (this.energy >= amount) {
            this.energy -= amount;
            return true;
        }
        return false;
    }
    
    restoreEnergy(amount) {
        this.energy = Math.min(this.energy + amount, this.maxEnergy);
    }
}

class Enemy extends Entity {
    constructor(x, y, type, floor = 1) {
        super(x, y);
        this.type = type;
        this.floor = floor;
        
        // Set stats based on enemy type
        const stats = this.getStatsForType(type, floor);
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.attack = stats.attack;
        this.expValue = stats.expValue;
        this.goldDrop = stats.goldDrop;
        this.viewRange = stats.viewRange || 5;
        this.moveSpeed = stats.moveSpeed || 1;
    }
    
    getStatsForType(type, floor) {
        const floorBonus = floor - 1;
        
        switch(type) {
            case 'goblin':
                return {
                    hp: CONFIG.BALANCE.GOBLIN_HP_BASE + floorBonus,
                    attack: CONFIG.BALANCE.GOBLIN_ATTACK_BASE + Math.floor(floorBonus / 2),
                    expValue: CONFIG.BALANCE.GOBLIN_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.GOBLIN_GOLD_RANGE) + CONFIG.BALANCE.GOBLIN_GOLD_BASE + floorBonus,
                    viewRange: 5,
                    moveSpeed: 1
                };
            case 'skeleton':
                return {
                    hp: CONFIG.BALANCE.SKELETON_HP_BASE + floorBonus,
                    attack: CONFIG.BALANCE.SKELETON_ATTACK_BASE + Math.floor(floorBonus / 2),
                    expValue: CONFIG.BALANCE.SKELETON_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.SKELETON_GOLD_RANGE) + CONFIG.BALANCE.SKELETON_GOLD_BASE + floorBonus * 2,
                    viewRange: 6,
                    moveSpeed: 1
                };
            case 'wolf':
                return {
                    hp: CONFIG.BALANCE.WOLF_HP_BASE + floorBonus,
                    attack: CONFIG.BALANCE.WOLF_ATTACK_BASE + Math.floor(floorBonus / 2),
                    expValue: CONFIG.BALANCE.WOLF_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.WOLF_GOLD_RANGE) + CONFIG.BALANCE.WOLF_GOLD_BASE + floorBonus,
                    viewRange: 7,
                    moveSpeed: 1.2
                };
            case 'treant':
                return {
                    hp: CONFIG.BALANCE.TREANT_HP_BASE + floorBonus * 2,
                    attack: CONFIG.BALANCE.TREANT_ATTACK_BASE + Math.floor(floorBonus / 2),
                    expValue: CONFIG.BALANCE.TREANT_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.TREANT_GOLD_RANGE) + CONFIG.BALANCE.TREANT_GOLD_BASE + floorBonus * 2,
                    viewRange: 5,
                    moveSpeed: 0.8
                };
            case 'skeletonLord':
                return {
                    hp: CONFIG.BALANCE.SKELETON_LORD_HP_BASE + Math.floor(floorBonus * 1.5),
                    attack: CONFIG.BALANCE.SKELETON_LORD_ATTACK_BASE + Math.floor(floorBonus / 3),
                    expValue: CONFIG.BALANCE.SKELETON_LORD_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.SKELETON_LORD_GOLD_RANGE) + CONFIG.BALANCE.SKELETON_LORD_GOLD_BASE + floorBonus * 3,
                    viewRange: 8,
                    moveSpeed: 0.9
                };
            case 'sporeling':
                return {
                    hp: CONFIG.BALANCE.SPORELING_HP_BASE + floorBonus,
                    attack: CONFIG.BALANCE.SPORELING_ATTACK_BASE + Math.floor(floorBonus / 2),
                    defense: CONFIG.BALANCE.SPORELING_DEFENSE_BASE,
                    expValue: CONFIG.BALANCE.SPORELING_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.SPORELING_GOLD_RANGE) + CONFIG.BALANCE.SPORELING_GOLD_BASE + floorBonus,
                    viewRange: 6,
                    moveSpeed: 1.0
                };
            case 'fungalKnight':
                return {
                    hp: CONFIG.BALANCE.FUNGAL_KNIGHT_HP_BASE + floorBonus * 2,
                    attack: CONFIG.BALANCE.FUNGAL_KNIGHT_ATTACK_BASE + Math.floor(floorBonus / 2),
                    defense: CONFIG.BALANCE.FUNGAL_KNIGHT_DEFENSE_BASE,
                    expValue: CONFIG.BALANCE.FUNGAL_KNIGHT_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.FUNGAL_KNIGHT_GOLD_RANGE) + CONFIG.BALANCE.FUNGAL_KNIGHT_GOLD_BASE + floorBonus * 2,
                    viewRange: 6,
                    moveSpeed: 0.9
                };
            case 'sporeMother':
                return {
                    hp: CONFIG.BALANCE.SPORE_MOTHER_HP_BASE + Math.floor(floorBonus * 2),
                    attack: CONFIG.BALANCE.SPORE_MOTHER_ATTACK_BASE + Math.floor(floorBonus / 3),
                    defense: CONFIG.BALANCE.SPORE_MOTHER_DEFENSE_BASE,
                    expValue: CONFIG.BALANCE.SPORE_MOTHER_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.SPORE_MOTHER_GOLD_RANGE) + CONFIG.BALANCE.SPORE_MOTHER_GOLD_BASE + floorBonus * 5,
                    viewRange: 8,
                    moveSpeed: 0.7
                };
            case 'stardustSprite':
                return {
                    hp: CONFIG.BALANCE.STARDUST_SPRITE_HP_BASE + floorBonus,
                    attack: CONFIG.BALANCE.STARDUST_SPRITE_ATTACK_BASE + Math.floor(floorBonus / 2),
                    defense: CONFIG.BALANCE.STARDUST_SPRITE_DEFENSE_BASE,
                    expValue: CONFIG.BALANCE.STARDUST_SPRITE_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.STARDUST_SPRITE_GOLD_RANGE) + CONFIG.BALANCE.STARDUST_SPRITE_GOLD_BASE + floorBonus,
                    viewRange: 7,
                    moveSpeed: 1.2
                };
            case 'cosmicGuardian':
                return {
                    hp: CONFIG.BALANCE.COSMIC_GUARDIAN_HP_BASE + floorBonus * 2,
                    attack: CONFIG.BALANCE.COSMIC_GUARDIAN_ATTACK_BASE + Math.floor(floorBonus / 2),
                    defense: CONFIG.BALANCE.COSMIC_GUARDIAN_DEFENSE_BASE,
                    expValue: CONFIG.BALANCE.COSMIC_GUARDIAN_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.COSMIC_GUARDIAN_GOLD_RANGE) + CONFIG.BALANCE.COSMIC_GUARDIAN_GOLD_BASE + floorBonus * 3,
                    viewRange: 8,
                    moveSpeed: 0.8
                };
            case 'stellarArchitect':
                return {
                    hp: CONFIG.BALANCE.STELLAR_ARCHITECT_HP_BASE + Math.floor(floorBonus * 2.5),
                    attack: CONFIG.BALANCE.STELLAR_ARCHITECT_ATTACK_BASE + Math.floor(floorBonus / 3),
                    defense: CONFIG.BALANCE.STELLAR_ARCHITECT_DEFENSE_BASE,
                    expValue: CONFIG.BALANCE.STELLAR_ARCHITECT_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.STELLAR_ARCHITECT_GOLD_RANGE) + CONFIG.BALANCE.STELLAR_ARCHITECT_GOLD_BASE + floorBonus * 8,
                    viewRange: 10,
                    moveSpeed: 0.6
                };
            default:
                return {
                    hp: 5,
                    attack: 1,
                    expValue: 5,
                    goldDrop: 5,
                    viewRange: 5,
                    moveSpeed: 1
                };
        }
    }
    
    takeDamage(amount, playerLevel) {
        const damage = Math.max(1, amount - Math.floor(this.hp / 10));
        this.hp -= damage;
        return damage;
    }
    
    isDead() {
        return this.hp <= 0;
    }
    
    canSeeEntity(entity, fogOfWar) {
        const dist = this.distanceTo(entity);
        return dist <= this.viewRange && !fogOfWar[this.y][this.x];
    }
    
    getMoveTowards(targetX, targetY) {
        let dx = 0, dy = 0;
        
        if (this.x < targetX) dx = 1;
        else if (this.x > targetX) dx = -1;
        
        if (this.y < targetY) dy = 1;
        else if (this.y > targetY) dy = -1;
        
        return { dx, dy };
    }
}

class Item extends Entity {
    constructor(x, y, type, value = null) {
        super(x, y);
        this.type = type;
        this.value = value || this.getDefaultValue(type);
    }
    
    getDefaultValue(type) {
        switch(type) {
            case 'gold':
                return CONFIG.BALANCE.GOLD_VALUE_BASE + 
                       Math.floor(Math.random() * CONFIG.BALANCE.GOLD_VALUE_RANGE);
            case 'potion':
                const floor = window.game?.gameState?.floor || 1;
                return CONFIG.BALANCE.POTION_HEAL_VALUE + Math.floor(floor / 2); // HP restored, scales with floor
            case 'sword':
                return 1; // Attack bonus
            default:
                return 1;
        }
    }
    
    apply(player) {
        switch(this.type) {
            case 'gold':
                player.gold += this.value;
                return { message: `Found ${this.value} gold!`, type: 'heal-msg' };
            case 'potion':
                const healed = player.heal(this.value);
                // Chance for blessed effect
                if (CONFIG.FEATURES.STATUS_EFFECTS && Math.random() < 0.2) {
                    player.applyStatusEffect('blessed', CONFIG.BALANCE.STATUS_BLESSED_DURATION);
                    return { message: `Blessed potion! Restored ${healed} HP and feel blessed!`, type: 'heal-msg' };
                }
                return { message: `Restored ${healed} HP!`, type: 'heal-msg' };
            case 'sword':
                player.attack += this.value;
                return { message: `Attack increased by ${this.value}!`, type: 'level-msg' };
            case 'shield':
                player.defense += this.value;
                return { message: `Defense increased by ${this.value}!`, type: 'level-msg' };
            case 'scroll':
                // Random scroll effects
                const scrollEffects = [
                    () => {
                        player.applyStatusEffect('confused', CONFIG.BALANCE.STATUS_CONFUSED_DURATION);
                        return { message: 'Scroll of Confusion! You feel dizzy...', type: 'damage-msg' };
                    },
                    () => {
                        // Teleport to random location
                        const tiles = [];
                        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
                            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                                if (!window.game.gameState.isWall(x, y) && !window.game.gameState.isOccupied(x, y)) {
                                    tiles.push({x, y});
                                }
                            }
                        }
                        if (tiles.length > 0) {
                            const target = tiles[Math.floor(Math.random() * tiles.length)];
                            player.moveTo(target.x, target.y);
                            return { message: 'Scroll of Teleportation!', type: 'level-msg' };
                        }
                        return { message: 'The scroll fizzles...', type: '' };
                    },
                    () => {
                        player.energy = player.maxEnergy;
                        return { message: 'Scroll of Energy! Full energy restored!', type: 'heal-msg' };
                    }
                ];
                const effect = scrollEffects[Math.floor(Math.random() * scrollEffects.length)];
                return effect();
            default:
                return { message: 'Picked up an item!', type: '' };
        }
    }
}