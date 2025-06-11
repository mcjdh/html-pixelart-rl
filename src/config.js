export const CONFIG = {
    CELL_SIZE: 16,
    GRID_WIDTH: 30,
    GRID_HEIGHT: 20,
    TILE_SIZE: 16,
    VIEW_RADIUS: 5,
    
    COLORS: {
        FLOOR: '#333',
        WALL: '#666',
        PLAYER: '#4a4',
        ENEMY: '#a44',
        GOLD: '#aa4',
        STAIRS: '#44a',
        FOG: '#000'
    },
    
    GAME: {
        ENERGY_REGEN_RATE: 1000,
        ENERGY_REGEN_AMOUNT: 1,
        AUTO_EXPLORE_DELAY: 200,
        MAX_MESSAGES: 20
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