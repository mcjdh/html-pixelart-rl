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
        this.maxHp += CONFIG.BALANCE.LEVEL_HP_GAIN;
        this.hp = this.maxHp;
        this.attack += CONFIG.BALANCE.LEVEL_ATTACK_GAIN;
    }
    
    takeDamage(amount) {
        const damage = Math.max(1, amount - this.defense);
        this.hp -= damage;
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
                    hp: CONFIG.BALANCE.SKELETON_LORD_HP_BASE + floorBonus * 3,
                    attack: CONFIG.BALANCE.SKELETON_LORD_ATTACK_BASE + Math.floor(floorBonus / 2),
                    expValue: CONFIG.BALANCE.SKELETON_LORD_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.SKELETON_LORD_GOLD_RANGE) + CONFIG.BALANCE.SKELETON_LORD_GOLD_BASE + floorBonus * 5,
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
                    hp: CONFIG.BALANCE.SPORE_MOTHER_HP_BASE + floorBonus * 5,
                    attack: CONFIG.BALANCE.SPORE_MOTHER_ATTACK_BASE + Math.floor(floorBonus / 2),
                    defense: CONFIG.BALANCE.SPORE_MOTHER_DEFENSE_BASE,
                    expValue: CONFIG.BALANCE.SPORE_MOTHER_EXP,
                    goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.SPORE_MOTHER_GOLD_RANGE) + CONFIG.BALANCE.SPORE_MOTHER_GOLD_BASE + floorBonus * 10,
                    viewRange: 8,
                    moveSpeed: 0.7
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
                return 5; // HP restored
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