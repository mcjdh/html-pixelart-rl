# CLAUDE.md

## CRITICAL: AI-SPECIFIC IMPLEMENTATION PATTERNS

### Script Loading Dependencies
**ALWAYS CHECK** script loading order in index.html before any file modifications:
```
config.js → utils.js → 
sprites/player.js → sprites/enemies/*.js → sprites/items/*.js → 
sprites/environment/*.js → sprites/index.js → 
entities.js → levels/*.js → mapGenerator.js → gameState.js → 
renderer.js → combat.js → core/*.js → ui/*.js → game.js → 
levels/areas/*.js (LAST)
```
**FAILURE TO MAINTAIN ORDER = RUNTIME ERRORS**

**CRITICAL**: Area definition files MUST load after all sprite and system files!

### Global Namespace Pattern
```javascript
// CORRECT: Direct global assignment
const SPRITES = { player: function(ctx, x, y, size) {...} };
// WRONG: Any form of import/export/require
```

### Common Implementation Pitfalls
1. **NEVER** use ES6 modules - breaks file:// protocol
2. **NEVER** add external dependencies - pure vanilla JS only
3. **NEVER** use async/await in core game loop - causes frame drops
4. **AVOID** creating new files - extend existing systems
5. **CHECK** CONFIG.BALANCE before hardcoding any numbers

## GAME BALANCE QUICK REFERENCE

### Energy System (Current Implementation)
- Move cost: 1 energy
- Combat cost: 5 energy  
- Regen: 2 energy/800ms
- Floor restore: 50 energy

### Combat Formulas
```javascript
damage = max(1, attackerPower - defenderDefense)
critChance = 0.1 + (level * 0.01)
critDamage = baseDamage * 2
levelUpHP = currentMaxHP + 5
levelUpAttack = currentAttack + 1
```

### Entity Spawn Patterns
- Enemies: `3 + floor * 2`
- Items: `2 + floor(floor/2)`
- Gold value: `5 + random(10) + floor * 2`

## ROGUELIKE-SPECIFIC PATTERNS

### Turn Processing Order (CRITICAL)
1. Player input validation
2. Energy check
3. Execute player action
4. Update fog of war
5. Process ALL enemy turns
6. Update UI
7. Check win/loss conditions

### State Management Anti-Patterns
```javascript
// WRONG: Direct mutation
gameState.player.hp -= damage;

// CORRECT: Through methods
player.takeDamage(damage);
```

### Performance Optimization Targets
- Fog of war: Cache last state, only update on player move
- Pathfinding: Limit A* to 100 nodes max
- Rendering: Dirty rectangle tracking (not yet implemented)
- Particles: Object pool with 100 particle limit

## TESTING ROGUELIKE FEATURES

### Balance Testing Checklist
- [ ] Player can survive floor 1 with no upgrades
- [ ] Player needs upgrades by floor 3
- [ ] Gold economy allows 1 upgrade every 2 floors
- [ ] Energy depletes during extended combat
- [ ] Auto-explore doesn't break on edge cases

### Edge Cases to Verify
1. **Stairs spawn**: What if no valid room?
2. **Enemy pathfinding**: Diagonal movement blocked?
3. **Save/Load**: Mid-combat saves?
4. **Fog of war**: Corner visibility?
5. **Item spawning**: Full inventory?

## MODULAR LEVEL SYSTEM (CRITICAL)

### Level System Architecture
The game uses a **modular area-based system** instead of hardcoded floors:

**Core Components:**
- `LevelDefinition` class: Defines areas with floors, enemies, sprites, narrative
- `AreaManager` class: Handles area loading, progression, unlocking, state
- Theme generators: `BaseGenerator`, `CavernGenerator`, `ForestGenerator`
- Area definitions: `src/levels/areas/*.js` (caverns.js, forest.js)

### Current Areas
1. **Caverns** (3 floors): Shallow Crypts → Bone Gardens → Heart of Darkness
2. **Forest** (3 floors): Forest Edge → Deep Woods → Sacred Grove

### Sprite Organization Standards
**CRITICAL**: Each theme MUST have consistent sprite organization:

```
src/sprites/environment/
├── terrain.js      # Default/base sprites
├── decorations.js  # Generic decorations
├── cavern.js      # Cavern-specific sprites
├── forest.js      # Forest-specific sprites
└── [theme].js     # Future theme sprites
```

**Each theme sprite file MUST:**
1. Export `[theme]Sprites` object globally (`window.[theme]Sprites`)
2. Register in `window.SPRITES.[theme]` if available
3. Follow standard sprite function signature: `(ctx, x, y, size)`

### Level Definition Template
```javascript
const newAreaLevel = new LevelDefinition({
    id: 'area_name',
    name: 'Display Name',
    theme: 'theme_name',
    
    tileSprites: {
        wall: () => window.themeSprites ? window.themeSprites.wall : fallback,
        floor: () => window.themeSprites ? window.themeSprites.floor : fallback,
        // Add all tile types used by this theme
    },
    
    floors: [
        {
            number: 1,
            name: "Floor Display Name",
            description: "Floor description for lore",
            narrative: {
                enter: "Floor entrance narrative...",
                complete: "Floor completion narrative..."
            },
            enemies: ["enemy1", "enemy2"],
            enemyCount: { base: 4, perFloor: 1 },
            itemCount: { base: 3, perFloor: 0.5 },
            specialEvents: ["event1", "event2"],
            completionBonus: {
                gold: 30,
                message: "Completion message"
            }
        }
        // Add more floors...
    ],
    
    enemyTypes: {
        default: ["enemy1", "enemy2"]
    },
    
    mapConfig: {
        baseRoomCount: 6,
        roomsPerFloor: 1,
        minRoomSize: 6,
        maxRoomSize: 10,
        corridorWidth: 2,
        decorationChance: 0.15
    },
    
    progression: {
        unlocks: ["next_area"],
        connections: ["connected_area"],
        victoryCondition: "complete_all_floors"
    },
    
    narrative: {
        loreCategories: ["category1", "category2"],
        combatNarratives: {
            enemy1: ["Narrative 1", "Narrative 2"],
            enemy2: ["Narrative 3", "Narrative 4"]
        }
    }
});

window.newAreaLevel = newAreaLevel;
```

### Adding New Theme Generator
```javascript
class NewThemeGenerator extends BaseGenerator {
    constructor() {
        super('new_theme');
    }
    
    generate(width, height, config) {
        // Custom generation logic
        const result = super.generate(width, height, config);
        this.addThemeSpecificFeatures(result.map, result.rooms, config);
        return result;
    }
    
    addThemeSpecificFeatures(map, rooms, config) {
        // Theme-specific map modifications
    }
}

window.NewThemeGenerator = NewThemeGenerator;
```

### Enemy Integration with Areas
```javascript
// 1. Add stats to CONFIG.BALANCE
NEWENEMY_HP_BASE: 12,
NEWENEMY_ATTACK_BASE: 5,
NEWENEMY_EXP: 8,
NEWENEMY_GOLD_BASE: 15,
NEWENEMY_GOLD_RANGE: 8,

// 2. Add to entities.js getStatsForType()
case 'newEnemy':
    return {
        hp: CONFIG.BALANCE.NEWENEMY_HP_BASE + floorBonus,
        attack: CONFIG.BALANCE.NEWENEMY_ATTACK_BASE + Math.floor(floorBonus / 2),
        expValue: CONFIG.BALANCE.NEWENEMY_EXP,
        goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.NEWENEMY_GOLD_RANGE) + CONFIG.BALANCE.NEWENEMY_GOLD_BASE + floorBonus,
        viewRange: 6,
        moveSpeed: 1.0
    };

// 3. Create sprite file: src/sprites/enemies/newEnemy.js
const newEnemySprites = {
    default: function(ctx, x, y, size) {
        // Sprite drawing code
    }
};
window.newEnemySprites = newEnemySprites;

// 4. Update sprites/index.js ENEMY_SPRITES registry
newEnemy: window.newEnemySprites ? window.newEnemySprites.default : fallback,

// 5. Add to area definition enemies array
enemies: ["goblin", "newEnemy"]
```

## FEATURE IMPLEMENTATION TEMPLATES

### Adding New Area (Complete Process)
1. **Create theme sprites**: `src/sprites/environment/[theme].js`
2. **Create enemy sprites**: `src/sprites/enemies/[enemy].js` (if new)
3. **Create generator**: `src/levels/generators/[Theme]Generator.js` (if needed)
4. **Create area definition**: `src/levels/areas/[area].js`
5. **Update index.html**: Add script tags in correct order
6. **Update gameState.js**: Add theme generator support
7. **Register area**: Add to `registerAreas()` in gameState.js
8. **Update progression**: Set unlock conditions in existing areas

### Theme Integration Checklist
- [ ] Theme sprites created and registered globally
- [ ] Area definition created with all required floors
- [ ] Generator created (if custom generation needed)
- [ ] Script loading order maintained in index.html
- [ ] Enemy stats added to CONFIG.BALANCE
- [ ] Area registered in gameState.js
- [ ] Progression configured from existing areas
- [ ] Special events defined for theme
- [ ] Combat narratives written for theme enemies

### File Structure (Updated)
```
src/
├── levels/
│   ├── LevelDefinition.js     # Core level class
│   ├── AreaManager.js         # Area progression management
│   ├── generators/
│   │   ├── BaseGenerator.js   # Base map generation
│   │   ├── CavernGenerator.js # Cave-style generation
│   │   └── ForestGenerator.js # Forest-style generation
│   └── areas/
│       ├── caverns.js         # 3-floor cavern area
│       └── forest.js          # 3-floor forest area
├── sprites/
│   ├── environment/
│   │   ├── terrain.js         # Base terrain sprites
│   │   ├── decorations.js     # Generic decorations
│   │   ├── cavern.js         # Cavern-specific sprites
│   │   └── forest.js         # Forest-specific sprites
│   ├── enemies/
│   │   ├── goblin.js         # Basic enemy
│   │   ├── skeleton.js       # Cavern enemy
│   │   ├── wolf.js           # Forest enemy
│   │   └── treant.js         # Forest boss
│   └── index.js              # Sprite registry
└── core/
    └── CampaignSystem.js     # Integrates with areas
```

### Testing New Areas
```javascript
// Debug mode - add to game.js or console
game.gameState.loadArea('new_area_id');
game.gameState.generateFloor();

// Check area registration
console.log(game.gameState.areaManager.areas);

// Check sprite loading
console.log(window.newThemeSprites);

// Test progression
game.gameState.areaManager.completeArea('current_area');
```

### Adding Status Effect
```javascript
// 1. Add to entities.js
this.statusEffects = []; // In constructor

applyStatus(effect, duration) {
    this.statusEffects.push({type: effect, remaining: duration});
}

// 2. Process in game.js processTurn()
player.statusEffects = player.statusEffects.filter(s => {
    s.remaining--;
    if (s.type === 'poison') player.takeDamage(1);
    return s.remaining > 0;
});
```

## GAME THEORY INTEGRATION PRIORITIES

### Quick Win Features (Low complexity, high impact)
1. **Directional combat**: Check relative positions in combat.js
2. **Status effects**: Add to Entity base class
3. **Hunger system**: Replace energy regen with depletion

### Medium Complexity Features
1. **Item identification**: Add `identified` flag to Item class
2. **Room events**: Extend Room class with `specialType` property
3. **Weather effects**: Add to GameState with floor-wide modifier

### High Complexity Features (Requires significant refactoring)
1. **Ally system**: New AI controller, party management
2. **Crafting**: Item combination logic, UI additions
3. **Persistent progression**: Meta-game save system

## CODEBASE HEALTH METRICS

### Codebase Strengths ✅
- **Excellent architecture**: Modular level system, event-driven design
- **Clean organization**: No duplicate code, no unused files, clear separation of concerns
- **Modern JS patterns**: Good use of ES6 classes and modern JavaScript
- **Configuration management**: Almost all values properly externalized to CONFIG.js
- **Script loading**: Well-documented dependencies prevent runtime errors

### Current Technical Debt 🔧
- **Error handling**: Limited try/catch blocks (only in 3 files: game.js, gameState.js, EventBus.js)
- **DOM safety**: Missing null checks for DOM element access
- **Documentation**: Most classes lack JSDoc comments
- **Debug tools**: Basic debug mode, could be expanded
- **Testing**: No unit tests (relies on manual testing)

### Performance Bottlenecks ⚡
- Fog of war recalculates entire grid each update
- No sprite caching/atlasing
- Full map render each frame (no dirty rectangles)
- Particle system could use object pooling

### Priority Improvements 🎯
1. **High Priority**: Add error handling to game initialization and core systems
2. **Medium Priority**: Expand debug tools, add JSDoc documentation
3. **Low Priority**: Conditional debug logging, expand utility functions

### Development Quality Notes 📝
- Camera tracking system works excellently (40x30 grid with 20x14 viewport)
- Color contrast improvements successful (3.8:1 ratio in caverns)
- Modular area system fully functional with caverns + forest themes
- No hardcoded magic numbers found outside CONFIG (excellent adherence)

## QUICK COMMAND REFERENCE

### Add Feature Flag
```javascript
// In config.js
FEATURES: {
    HUNGER_SYSTEM: false,
    STATUS_EFFECTS: false,
    ITEM_IDENTIFICATION: false
}

// In relevant system
if (CONFIG.FEATURES.HUNGER_SYSTEM) {
    // Feature code
}
```

### Debug Mode
```javascript
// Add to Game constructor
this.debug = false; // Toggle with 'D' key

// In render methods
if (game.debug) {
    // Draw collision boxes, enemy vision, etc
}
```

### Recommended Debug Enhancements
```javascript
// Add to CONFIG.DEBUG
DEBUG: {
    ENABLE_CONSOLE_COMMANDS: true,
    SHOW_COLLISION_BOXES: false,
    SHOW_PATHFINDING: false,
    SHOW_FOG_CALCULATIONS: false,
    ENABLE_GOD_MODE: false,
    LOG_PERFORMANCE: false
}

// Console commands to add
window.debugCommands = {
    giveGold: (amount) => game.gameState.player.gold += amount,
    teleport: (x, y) => game.gameState.movePlayer(x, y),
    nextFloor: () => game.gameState.completeFloor(),
    godMode: () => { game.gameState.player.hp = 999; game.gameState.player.energy = 999; }
};
```

### Error Handling Patterns
```javascript
// Recommended pattern for DOM operations
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element not found: ${id}`);
        return null;
    }
    return element;
}

// Recommended pattern for sprite operations
function safeDrawSprite(spriteFunction, ctx, x, y, size) {
    try {
        if (typeof spriteFunction === 'function') {
            spriteFunction(ctx, x, y, size);
        } else {
            // Draw fallback rectangle
            ctx.fillStyle = '#f0f';
            ctx.fillRect(x, y, size, size);
        }
    } catch (error) {
        console.warn('Sprite draw failed:', error);
        // Draw error indicator
        ctx.fillStyle = '#f00';
        ctx.fillRect(x, y, size, size);
    }
}
```

### Performance Profiling
```javascript
// Wrap suspicious code
const start = performance.now();
// ... code to profile ...
if (performance.now() - start > 16) {
    console.warn('Frame budget exceeded:', performance.now() - start);
}
```

## REMEMBER: GAME FEEL > FEATURE COUNT
Every addition should enhance the core loop of exploration → combat → progression → exploration. If a feature doesn't directly improve this loop, it's probably not worth adding.