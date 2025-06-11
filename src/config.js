const CONFIG = {
    CELL_SIZE: 20,
    GRID_WIDTH: 24,
    GRID_HEIGHT: 16,
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
        FOG_EXPLORED: 'rgba(0, 0, 0, 0.4)'
    },
    
    GAME: {
        ENERGY_REGEN_RATE: 800,
        ENERGY_REGEN_AMOUNT: 2,
        AUTO_EXPLORE_DELAY: 150,
        MAX_MESSAGES: 15
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
        FLOOR_ENERGY_RESTORE: 50
    }
};