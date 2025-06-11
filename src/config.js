const CONFIG = {
    CELL_SIZE: 20,
    GRID_WIDTH: 40,
    GRID_HEIGHT: 30,
    TILE_SIZE: 20,
    VIEW_RADIUS: 6,
    VIEWPORT_WIDTH: 20,  // Tiles visible horizontally
    VIEWPORT_HEIGHT: 14, // Tiles visible vertically
    
    COLORS: {
        FLOOR: '#666',
        WALL: '#222',
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
        ENERGY_REGEN_RATE: 750, // Slightly faster energy regen for better flow
        ENERGY_REGEN_AMOUNT: 2,
        AUTO_EXPLORE_DELAY: 150,
        MAX_MESSAGES: 15,
        INPUT_THROTTLE: 50,
        MIN_SWIPE_DISTANCE: 40, // Increased for better mobile responsiveness
        MAX_SWIPE_TIME: 300, // Maximum time for a swipe gesture
        TOUCH_DEADZONE: 10, // Minimum distance to register as intentional swipe
        HIGH_SCORES_LIMIT: 10,
        GAME_OVER_DELAY: 1000,
        
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
        
        WOLF_HP_BASE: 8,
        WOLF_ATTACK_BASE: 4,
        WOLF_EXP: 6,
        
        TREANT_HP_BASE: 15,
        TREANT_ATTACK_BASE: 6,
        TREANT_EXP: 12,
        
        SKELETON_LORD_HP_BASE: 25,
        SKELETON_LORD_ATTACK_BASE: 8,
        SKELETON_LORD_EXP: 50,
        
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
        
        // Status effect durations and chances
        STATUS_POISON_DURATION: 10,
        STATUS_STUN_DURATION: 2,
        STATUS_CONFUSED_DURATION: 5,
        STATUS_BLESSED_DURATION: 20,
        BASE_CRIT_CHANCE: 0.1,
        CRIT_CHANCE_PER_LEVEL: 0.01,
        STATUS_EFFECT_CHANCE: 0.1,
        SKELETON_POISON_CHANCE: 0.15,
        BLESSED_POTION_CHANCE: 0.2,
        
        // Enemy and item counts
        BASE_ENEMY_COUNT: 3,
        ENEMIES_PER_FLOOR: 2,
        BASE_ITEM_COUNT: 2,
        ITEM_COUNT_DIVISOR: 2,
        
        // Gold drops
        GOBLIN_GOLD_BASE: 2,
        GOBLIN_GOLD_RANGE: 5,
        SKELETON_GOLD_BASE: 5,
        SKELETON_GOLD_RANGE: 8,
        WOLF_GOLD_BASE: 8,
        WOLF_GOLD_RANGE: 6,
        TREANT_GOLD_BASE: 15,
        TREANT_GOLD_RANGE: 10,
        SKELETON_LORD_GOLD_BASE: 100,
        SKELETON_LORD_GOLD_RANGE: 50,
        
        // Other balance values
        ENEMY_DEFENSE_DIVISOR: 10,
        ENEMY_VIEW_RANGE: 5,
        ENEMY_ATTACK_DISTANCE: 1.5,
        POTION_HEAL_VALUE: 5,
        SWORD_ATTACK_BONUS: 1,
        CONFUSION_CHANCE: 0.5,
        LOW_HEALTH_THRESHOLD: 0.25,
        AUTO_EXPLORE_ENEMY_RANGE: 3,
        AUTO_EXPLORE_ESCAPE_THRESHOLD: 0.5,
        AUTO_EXPLORE_ITEM_THRESHOLD: 0.7,
        STAIRS_PURSUIT_THRESHOLD: 0.3,
        AUTO_PATH_TO_STAIRS: true, // Auto-path to stairs when all enemies cleared
        CORNER_WALL_COUNT: 6,
        
        // Scoring
        SCORE_PER_FLOOR: 1000,
        SCORE_PER_LEVEL: 100,
        SCORE_PER_ENEMY: 10
    },
    
    UI: {
        // Semantic timing presets (simplified from 8 specific values)
        TIMING: {
            INSTANT: 0,
            QUICK: 500,     // Fade transitions, lore delays
            NORMAL: 1500,   // Floating text, standard displays  
            SLOW: 3000,     // Banners, notifications
            STORY: 4000     // Narrative displays, death epitaphs
        },
        
        // Font size presets (simplified from 7 specific values)
        FONTS: {
            SMALL: 10,      // Lore notifications
            NORMAL: 12,     // Banners, UI text
            LARGE: 14,      // Main narrative
            URGENT: 16,     // Important messages
            TITLE: 24       // Menu titles
        },
        
        // Essential layout (kept only critical dimensions)
        BANNER_HEIGHT: 40,
        NOTIFICATION_WIDTH: 200,
        FLOATING_TEXT_DISTANCE: 30,
        MENU_MIN_WIDTH: 300,
        MENU_OPTIONS_GAP: 8,
        MAX_CONSOLE_MESSAGES: 50
    },
    
    RENDERING: {
        // Health and status indicators (consolidated)
        HEALTH_BAR: { HEIGHT: 3, Y_OFFSET: 4, PLAYER_Y_OFFSET: 6 },
        STATUS_EFFECTS: { SIZE: 4, SPACING: 5 },
        
        // Drawing presets (simplified)
        STROKE_WIDTH: 1,
        DAMAGE_TEXT: { SIZE: 12, STROKE: 2 },
        
        // Particle system (essential values only)
        PARTICLES: { 
            SIZE: 2, 
            POOL_MAX: 100, 
            EXPLOSION_COUNT: 10,
            LIFETIME: 20,
            GRAVITY: 0.2 
        }
    },
    
    MAP: {
        // Room generation
        BASE_ROOM_COUNT: 5,
        ROOM_COUNT_PER_FLOOR: 3,
        MAX_ROOM_COUNT: 10,
        ROOM_GENERATION_ATTEMPTS: 300,
        MIN_ROOMS: 3,
        MIN_ROOM_SIZE: 4,
        MAX_ROOM_SIZE: 10,
        ROOM_OVERLAP_BUFFER: 1,
        SPAWN_POSITION_ATTEMPTS: 200
    },
    
    PATHFINDING: {
        MAX_NODES: 100
    },
    
    SPRITES: {
        UNIT_SIZE: 16
    },
    
    DEBUG: {
        // Essential debug features (only what's actually used)
        GOLD_AMOUNT: 100,
        ENABLE_CONSOLE_COMMANDS: true,
        
        // Visual debug overlays
        SHOW_ENEMY_VISION: false,
        SHOW_PATHFINDING: false,
        SHOW_GRID_LINES: false
    },
    
    // Core game features (only implemented features)
    FEATURES: {
        DIRECTIONAL_COMBAT: true,
        STATUS_EFFECTS: true
    }
};