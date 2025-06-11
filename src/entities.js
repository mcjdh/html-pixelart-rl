class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }
    
    distanceTo(other) {
        return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2);
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
                    goldDrop: Math.floor(Math.random() * 5) + 2 + floorBonus,
                    viewRange: 5,
                    moveSpeed: 1
                };
            case 'skeleton':
                return {
                    hp: CONFIG.BALANCE.SKELETON_HP_BASE + floorBonus,
                    attack: CONFIG.BALANCE.SKELETON_ATTACK_BASE + Math.floor(floorBonus / 2),
                    expValue: CONFIG.BALANCE.SKELETON_EXP,
                    goldDrop: Math.floor(Math.random() * 8) + 5 + floorBonus * 2,
                    viewRange: 6,
                    moveSpeed: 1
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
                return { message: `Restored ${healed} HP!`, type: 'heal-msg' };
            case 'sword':
                player.attack += this.value;
                return { message: `Attack increased by ${this.value}!`, type: 'level-msg' };
            default:
                return { message: 'Picked up an item!', type: '' };
        }
    }
}