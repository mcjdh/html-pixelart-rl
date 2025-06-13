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
        NARRATIVE_LORE: '#dda0dd',
        
        // Sprite color palettes
        SPRITES: {
            // Common skin tones
            SKIN_HUMAN: '#dca',
            SKIN_GOBLIN: '#585',
            SKIN_SKELETON: '#ddd',
            
            // Eye colors
            EYES_HUMAN: '#444',
            EYES_GOBLIN_RED: '#f44',
            EYES_GOBLIN_MAGIC: '#a0f',
            EYES_WOLF: '#ff3',
            EYES_TREANT: '#f00',
            EYES_SKELETON: '#000',
            
            // Clothing and equipment
            CLOTH_BROWN: '#421',
            CLOTH_GREEN: '#684',
            CLOTH_DARK: '#333',
            CLOTH_PURPLE: '#a4a',
            ARMOR_METAL: '#444',
            ARMOR_DARK: '#333',
            LEATHER_BROWN: '#542',
            LEATHER_DARK: '#321',
            
            // Hair colors
            HAIR_BROWN: '#643',
            HAIR_HIGHLIGHT: '#754',
            
            // Natural colors
            FUR_WOLF_BASE: '#5a4a3a',
            FUR_WOLF_LIGHT: '#6a5a4a',
            FUR_WOLF_DARK: '#3a2a1a',
            FUR_WOLF_CHEST: '#7a6a5a',
            BARK_TREANT: '#4a2c17',
            BARK_DARK: '#3a2414',
            LEAVES_GREEN: '#228B22',
            LEAVES_DARK: '#006400',
            
            // Mushroom colors
            MUSHROOM_CAP: '#8a6aa8',
            MUSHROOM_CAP_DARK: '#7a5a98',
            MUSHROOM_CAP_LIGHT: '#9a7ab8',
            MUSHROOM_STEM: '#6a5a7a',
            MUSHROOM_GLOW: '#d8b8f8',
            SPORE_CLOUD: 'rgba(180, 140, 220, 0.5)',
            MUSHROOM_ARMOR: '#5a4a6a',
            MUSHROOM_HELM: '#7a5a8a',
            MUSHROOM_PLATE: '#6a4a7a',
            SPORE_WEAPON: '#9878b8',
            DARK_ARMOR: '#4a3a5a',
            SPORE_MOTHER_BODY: '#4a3a5a',
            SPORE_MOTHER_CAP: '#6a4a7a',
            SPORE_MOTHER_CROWN: '#7a5a8a',
            SPORE_MOTHER_PATTERN: '#5a3a6a',
            SPORE_MOTHER_EYES: '#d8a8f8',
            MYCELIUM_ROOT: '#3a2a4a',
            ANCIENT_RUNE: '#8a6aa8',
            
            // Boss colors
            BONE_LORD: '#e8e8e8',
            BONE_LORD_DARK: '#d0d0d0',
            BONE_LORD_SCAR: '#bbb',
            DARK_ENERGY: '#800040',
            CLOAK_DARK: 'rgba(40, 20, 40, 0.8)',
            
            // Stellar/cosmic colors  
            STARDUST_BODY: 'rgba(180, 200, 255, 0.8)',
            STARDUST_CORE: 'rgba(255, 255, 255, 1.0)',
            STAR_PARTICLE: 'rgba(200, 220, 255, 0.7)',
            COSMIC_ARMOR: '#4a4a7a',
            COSMIC_PLATE: '#6a6a9a',
            COSMIC_CROWN: '#8a8aba',
            COSMIC_STAFF: '#7a7aaa',
            STELLAR_BODY: '#2a2a5a',
            STELLAR_ROBE: '#3a3a6a',
            STELLAR_PATTERN: '#5a5a8a',
            STELLAR_CROWN: '#7a7aaa',
            COSMIC_EYE: 'rgba(150, 200, 255, 0.8)',
            CONSCIOUSNESS_EYE: 'rgba(255, 255, 255, 1.0)',
            
            // Item colors
            GLASS_BOTTLE: '#ccc',
            GLASS_INNER: '#eee',
            POTION_RED: '#f44',
            POTION_SURFACE: '#d33',
            CORK: '#841',
            CORK_TEXTURE: '#a52',
            GOLD_COIN: '#ffd700',
            GOLD_SHINE: '#ffff99',
            
            // Weapons and tools
            METAL_BLADE: '#987',
            METAL_CROSSGUARD: '#654',
            WOOD_HANDLE: '#421',
            BONE_WHITE: '#ddd',
            BONE_SKULL: '#eee',
            
            // Magic and effects
            MAGIC_PURPLE: '#f0f',
            MAGIC_WISP: '#a0f',
            TEETH_WHITE: '#eee',
            TEETH_FANG: '#ddd',
            
            // Equipment colors
            SWORD_BLADE: '#ccc',
            SWORD_GUARD: '#ccc',
            SWORD_HANDLE: '#843',
            SHIELD_FRAME: '#888',
            SHIELD_FACE: '#aaa',
            SHIELD_EMBLEM: '#44f',
            SCROLL_PARCHMENT: '#eed',
            SCROLL_RIBBON: '#654',
            SCROLL_TEXT: '#333',
            
            // Terrain colors
            FLOOR_BASE: '#555',
            FLOOR_BASE_ALT: '#544',
            FLOOR_BASE_CLEAN: '#565',
            FLOOR_TEXTURE: '#666',
            FLOOR_HIGHLIGHT: '#777',
            FLOOR_HIGHLIGHT_ALT: '#677',
            FLOOR_HIGHLIGHT_CLEAN: '#788',
            FLOOR_SHADOW: '#444',
            FLOOR_SHADOW_ALT: '#454',
            FLOOR_CRACK: '#444',
            FLOOR_WEATHERED: '#666',
            
            WALL_BASE: '#777',
            WALL_BASE_ROUGH: '#787',
            WALL_BASE_MOSSY: '#776',
            WALL_HIGHLIGHT: '#888',
            WALL_HIGHLIGHT_ROUGH: '#898',
            WALL_HIGHLIGHT_MOSSY: '#887',
            WALL_SHADOW: '#555',
            WALL_SHADOW_ROUGH: '#565',
            WALL_SHADOW_MOSSY: '#665',
            WALL_EDGE_HIGHLIGHT: '#999',
            WALL_DIVISIONS: '#666',
            MOSS_PATCH: '#686',
            MOSS_DARK: '#575',
            
            STAIRS_BASE: '#66a',
            STAIRS_SHADOW: '#44a',
            STAIRS_HIGHLIGHT: '#88c',
            STAIRS_GLOW: '#aaf',
            
            // Cavern environment colors
            CAVERN_WALL_BASE: '#2a251f',
            CAVERN_WALL_TEXTURE: '#3d3429',
            CAVERN_WALL_CRACK: '#1a1510',
            CAVERN_WALL_HIGHLIGHT: '#4f453a',
            CAVERN_FLOOR_BASE: '#6b6b6b',
            CAVERN_FLOOR_TILE: '#5a5a5a',
            CAVERN_FLOOR_MORTAR: '#484848',
            CAVERN_FLOOR_DEBRIS: '#7a7a7a',
            CAVERN_STALAGMITE: '#606060',
            CAVERN_STALAGMITE_MID: '#505050',
            CAVERN_STALAGMITE_HIGHLIGHT: '#707070',
            CAVERN_STALAGMITE_SHADOW: '#404040',
            CAVERN_CRYSTAL_BASE: '#4a4aff',
            CAVERN_CRYSTAL_FACET: '#6a6aff',
            CAVERN_RUBBLE: '#606060',
            CAVERN_RUBBLE_SMALL: '#505050',
            CAVERN_RUBBLE_DUST: '#4a4a4a',
            CAVERN_BONE_SKULL: '#e0e0e0',
            CAVERN_BONE_SCATTERED: '#d0d0d0',
            CAVERN_BONE_FRAGMENT: '#c0c0c0'
        }
    },
    
    GAME: {
        ENERGY_REGEN_RATE: 500, // Faster energy regen for better auto-explore flow
        ENERGY_REGEN_AMOUNT: 3, // More energy per tick
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
    
    AUTO_EXPLORE: {
        ENABLED: true,
        DEFAULT_MODE: 'balanced', // speedrun, balanced, complete
        SHOW_DECISION_VISUALS: false,
        
        // Anti-oscillation settings
        MAX_RECENT_POSITIONS: 10,
        OSCILLATION_THRESHOLD: 3,
        MAX_STUCK_COUNTER: 20,
        MAX_URGENCY_LEVEL: 5,
        ENERGY_WAIT_DELAY: 400,
        
        // Mode configurations
        MODES: {
            speedrun: {
                STEP_DELAY: 120,
                ITEM_RADIUS: 1,
                THREAT_CAUTION: 0.7,
                EXPLORATION_THRESHOLD: 0.75,  // Increased for better completion
                PRIORITIZE_STAIRS: true
            },
            balanced: {
                STEP_DELAY: 180,
                ITEM_RADIUS: 2,
                THREAT_CAUTION: 1.0,
                EXPLORATION_THRESHOLD: 0.85,  // Fixed to match implementation
                PRIORITIZE_STAIRS: false
            },
            complete: {
                STEP_DELAY: 220,
                ITEM_RADIUS: 3,
                THREAT_CAUTION: 1.3,
                EXPLORATION_THRESHOLD: 0.95,  // Increased for thorough exploration
                PRIORITIZE_STAIRS: false
            }
        },
        
        // Tactical settings
        TACTICAL_POSITIONING: true,
        THREAT_ASSESSMENT: true,
        ITEM_VALUE_PRIORITY: true,
        ENERGY_WAIT_DELAY: 400
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
        UPGRADE_COST_MULTIPLIER: 1.3,
        
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
        
        SKELETON_LORD_HP_BASE: 20,
        SKELETON_LORD_ATTACK_BASE: 7,
        SKELETON_LORD_EXP: 50,
        
        // Mushroom Island enemies
        SPORELING_HP_BASE: 10,
        SPORELING_ATTACK_BASE: 4,
        SPORELING_DEFENSE_BASE: 2,
        SPORELING_EXP: 10,
        
        FUNGAL_KNIGHT_HP_BASE: 16,
        FUNGAL_KNIGHT_ATTACK_BASE: 6,
        FUNGAL_KNIGHT_DEFENSE_BASE: 3,
        FUNGAL_KNIGHT_EXP: 15,
        
        SPORE_MOTHER_HP_BASE: 30,
        SPORE_MOTHER_ATTACK_BASE: 9,
        SPORE_MOTHER_DEFENSE_BASE: 4,
        SPORE_MOTHER_EXP: 75,
        
        GOLD_VALUE_BASE: 5,
        GOLD_VALUE_RANGE: 10,
        
        COMBAT_ENERGY_COST: 4,
        MOVE_ENERGY_COST: 1,
        FLOOR_ENERGY_RESTORE: 75,
        
        // Directional combat bonuses
        FLANKING_DAMAGE_BONUS: 0.25,
        BACKSTAB_DAMAGE_BONUS: 0.5,
        BLOCK_DAMAGE_REDUCTION: 0.25,
        CORNER_DAMAGE_BONUS: 0.5,
        
        // Status effect durations and chances
        STATUS_POISON_DURATION: 5,
        STATUS_POISON_DAMAGE: 1,
        STATUS_STUN_DURATION: 2,
        STATUS_CONFUSED_DURATION: 5,
        STATUS_BLESSED_DURATION: 20,
        BASE_CRIT_CHANCE: 0.1,
        CRIT_CHANCE_PER_LEVEL: 0.01,
        STATUS_EFFECT_CHANCE: 0.1,
        SKELETON_POISON_CHANCE: 0.1,
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
        
        // Mushroom Island gold drops
        SPORELING_GOLD_BASE: 15,
        SPORELING_GOLD_RANGE: 10,
        FUNGAL_KNIGHT_GOLD_BASE: 25,
        FUNGAL_KNIGHT_GOLD_RANGE: 15,
        SPORE_MOTHER_GOLD_BASE: 150,
        SPORE_MOTHER_GOLD_RANGE: 75,
        
        // Stellar Observatory enemies
        STARDUST_SPRITE_HP_BASE: 7,
        STARDUST_SPRITE_ATTACK_BASE: 3,
        STARDUST_SPRITE_DEFENSE_BASE: 1,
        STARDUST_SPRITE_EXP: 8,
        
        COSMIC_GUARDIAN_HP_BASE: 18,
        COSMIC_GUARDIAN_ATTACK_BASE: 7,
        COSMIC_GUARDIAN_DEFENSE_BASE: 4,
        COSMIC_GUARDIAN_EXP: 18,
        
        STELLAR_ARCHITECT_HP_BASE: 35,
        STELLAR_ARCHITECT_ATTACK_BASE: 10,
        STELLAR_ARCHITECT_DEFENSE_BASE: 5,
        STELLAR_ARCHITECT_EXP: 100,
        
        // Stellar Observatory gold drops
        STARDUST_SPRITE_GOLD_BASE: 12,
        STARDUST_SPRITE_GOLD_RANGE: 8,
        COSMIC_GUARDIAN_GOLD_BASE: 30,
        COSMIC_GUARDIAN_GOLD_RANGE: 20,
        STELLAR_ARCHITECT_GOLD_BASE: 200,
        STELLAR_ARCHITECT_GOLD_RANGE: 100,
        
        // Advanced Skills System
        SKILL_SYSTEM: {
            // Base skill mechanics
            BASE_EXP_MULTIPLIER: 100,  // More exp needed than before
            SKILL_CAP: 50,             // Max skill level
            MILESTONE_LEVELS: [5, 10, 15, 25, 35, 50], // Unlock new abilities
            
            // Skill synergy bonuses (when multiple skills reach certain levels)
            SYNERGIES: {
                // Combat + Vitality = Warrior Path
                WARRIOR_THRESHOLD: 10,  // Both skills at level 10+
                WARRIOR_BONUS: { critChance: 0.05, damageReduction: 0.1 },
                
                // Exploration + Fortune = Adventurer Path
                ADVENTURER_THRESHOLD: 10,
                ADVENTURER_BONUS: { goldMultiplier: 1.3, itemFind: 0.15 },
                
                // All four skills at 25+ = Master Path
                MASTER_THRESHOLD: 25,
                MASTER_BONUS: { allStats: 2, energyEfficiency: 0.5 }
            },
            
            // Skill-specific milestones
            COMBAT: {
                5: { type: 'ability', name: 'Power Strike', effect: 'critMultiplier', value: 0.5 },
                10: { type: 'ability', name: 'Combat Reflexes', effect: 'counterAttack', value: 0.2 },
                15: { type: 'passive', name: 'Weapon Mastery', effect: 'attackPerLevel', value: 0.5 },
                25: { type: 'ability', name: 'Berserker', effect: 'damageAtLowHP', value: 1.5 },
                35: { type: 'passive', name: 'Combat Veteran', effect: 'stunResist', value: 0.8 },
                50: { type: 'ultimate', name: 'Legendary Warrior', effect: 'ultimate', value: 'combat' }
            },
            
            VITALITY: {
                5: { type: 'passive', name: 'Toughness', effect: 'hpRegen', value: 1 },
                10: { type: 'ability', name: 'Second Wind', effect: 'lowHPBonus', value: 0.3 },
                15: { type: 'passive', name: 'Iron Constitution', effect: 'statusResist', value: 0.4 },
                25: { type: 'ability', name: 'Undying Will', effect: 'deathSave', value: 0.25 },
                35: { type: 'passive', name: 'Fortress Body', effect: 'damageReduction', value: 0.15 },
                50: { type: 'ultimate', name: 'Immortal Guardian', effect: 'ultimate', value: 'vitality' }
            },
            
            EXPLORATION: {
                5: { type: 'passive', name: 'Pathfinding', effect: 'moveSpeed', value: 0.2 },
                10: { type: 'ability', name: 'Keen Senses', effect: 'visionRange', value: 2 },
                15: { type: 'passive', name: 'Efficient Travel', effect: 'energyCost', value: -0.3 },
                25: { type: 'ability', name: 'Treasure Hunter', effect: 'secretFind', value: 0.4 },
                35: { type: 'passive', name: 'Master Explorer', effect: 'mapBonus', value: 1.0 },
                50: { type: 'ultimate', name: 'Realm Walker', effect: 'ultimate', value: 'exploration' }
            },
            
            FORTUNE: {
                5: { type: 'passive', name: 'Lucky Find', effect: 'goldBonus', value: 0.25 },
                10: { type: 'ability', name: 'Merchant Eye', effect: 'itemValue', value: 0.3 },
                15: { type: 'passive', name: 'Golden Touch', effect: 'goldMultiplier', value: 1.5 },
                25: { type: 'ability', name: 'Blessing of Fortune', effect: 'critGold', value: 2.0 },
                35: { type: 'passive', name: 'Wealth Magnet', effect: 'goldRadius', value: 2 },
                50: { type: 'ultimate', name: 'Lord of Fortune', effect: 'ultimate', value: 'fortune' }
            }
        },
        
        // Other balance values
        ENEMY_DEFENSE_DIVISOR: 10,
        ENEMY_VIEW_RANGE: 5,
        ENEMY_ATTACK_DISTANCE: 1.5,
        POTION_HEAL_VALUE: 5,
        SWORD_ATTACK_BONUS: 1,
        CONFUSION_CHANCE: 0.5,
        LOW_HEALTH_THRESHOLD: 0.25,
        // Auto-exploration configs handled in AUTO_EXPLORE section above
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
        MAX_NODES: 1000,  // Increased for better pathfinding in complex maps
        MAX_DISTANCE: 50, // Maximum pathfinding distance
        DIAGONAL_MOVEMENT: false, // Keep pathfinding simple
        FALLBACK_SEARCH_RADIUS: 15 // Radius for fallback exploration
    },
    
    SPRITES: {
        UNIT_SIZE: 16
    },
    
    DEBUG: {
        // Essential debug features (only what's actually used)
        GOLD_AMOUNT: 100,
        ENABLE_CONSOLE_COMMANDS: true,
        SHOW_AUTO_EXPLORER_LOGS: false,
        
        // Visual debug overlays
        SHOW_ENEMY_VISION: false,
        SHOW_PATHFINDING: false,
        SHOW_GRID_LINES: false
    },
    
    // Core game features (only implemented features)
    FEATURES: {
        DIRECTIONAL_COMBAT: true,
        STATUS_EFFECTS: true
    },
};

// Ensure CONFIG is available globally
window.CONFIG = CONFIG;