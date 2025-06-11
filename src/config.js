const CONFIG = {
    CELL_SIZE: 20,
    GRID_WIDTH: 20,
    GRID_HEIGHT: 14,
    TILE_SIZE: 20,
    VIEW_RADIUS: 6,
    
    COLORS: {
        FLOOR: '#444',
        WALL: '#777',
        PLAYER: '#4a4',
        ENEMY: '#a44',
        GOLD: '#aa4',
        STAIRS: '#44a',
        FOG: 'rgba(0, 0, 0, 0.8)',
        FOG_EXPLORED: 'rgba(0, 0, 0, 0.4)',
        
        // Status effect colors
        POISON: '#7a4',
        STUN: '#aa7',
        BLESSED: '#aaf',
        CONFUSED: '#f7a',
        
        // Combat indicators
        CRIT: '#ff4',
        HEAL: '#4f4',
        DAMAGE: '#f44',
        BLOCK: '#44f',
        
        // Narrative UI colors
        NARRATIVE_PRIMARY: '#c0c0c0',
        NARRATIVE_URGENT: '#ff6666',
        NARRATIVE_DISCOVERY: '#d4af37',
        NARRATIVE_LORE: '#dda0dd'
    },
    
    GAME: {
        ENERGY_REGEN_RATE: 800,
        ENERGY_REGEN_AMOUNT: 2,
        AUTO_EXPLORE_DELAY: 150,
        MAX_MESSAGES: 15,
        
        // Animation settings
        DAMAGE_NUMBER_DURATION: 1000,
        STATUS_EFFECT_BLINK_RATE: 500,
        SCREEN_SHAKE_DURATION: 200
    },
    
    BALANCE: {
        PLAYER_START_HP: 10,
        PLAYER_START_ATTACK: 1,
        PLAYER_START_DEFENSE: 0,
        PLAYER_START_ENERGY: 100,
        
        LEVEL_HP_GAIN: 5,
        LEVEL_ATTACK_GAIN: 1,
        EXP_PER_LEVEL: 10,
        
        UPGRADE_ATTACK_GAIN: 2,
        UPGRADE_DEFENSE_GAIN: 1,
        UPGRADE_COST_MULTIPLIER: 1.5,
        
        GOBLIN_HP_BASE: 3,
        GOBLIN_ATTACK_BASE: 1,
        GOBLIN_EXP: 5,
        
        SKELETON_HP_BASE: 5,
        SKELETON_ATTACK_BASE: 2,
        SKELETON_EXP: 8,
        
        GOLD_VALUE_BASE: 5,
        GOLD_VALUE_RANGE: 10,
        
        COMBAT_ENERGY_COST: 5,
        MOVE_ENERGY_COST: 1,
        FLOOR_ENERGY_RESTORE: 50,
        
        // Directional combat bonuses
        FLANKING_DAMAGE_BONUS: 0.25,
        BACKSTAB_DAMAGE_BONUS: 0.5,
        BLOCK_DAMAGE_REDUCTION: 0.25,
        CORNER_DAMAGE_BONUS: 0.5,
        
        // Status effect durations
        STATUS_POISON_DURATION: 10,
        STATUS_STUN_DURATION: 2,
        STATUS_CONFUSED_DURATION: 5,
        STATUS_BLESSED_DURATION: 20
    },
    
    // Feature flags for easy development
    FEATURES: {
        DIRECTIONAL_COMBAT: true,
        STATUS_EFFECTS: true,
        HUNGER_SYSTEM: false,
        ITEM_IDENTIFICATION: false,
        ROOM_EVENTS: false,
        WEATHER_EFFECTS: false,
        DEBUG_MODE: true
    }
};