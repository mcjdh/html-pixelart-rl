# CLAUDE.md

## CRITICAL: AI-SPECIFIC IMPLEMENTATION PATTERNS

### Script Loading Dependencies
**ALWAYS CHECK** script loading order in index.html before any file modifications:
```
config.js → sprite files → sprites/index.js → entities.js → mapGenerator.js → gameState.js → renderer.js → combat.js → game.js
```
**FAILURE TO MAINTAIN ORDER = RUNTIME ERRORS**

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

## FEATURE IMPLEMENTATION TEMPLATES

### Adding New Enemy Type
```javascript
// 1. Add to gameState.js getEnemyTypesForFloor()
if (this.floor >= X) types.push('newEnemy');

// 2. Add to entities.js getStatsForType()
case 'newEnemy':
    return {
        hp: CONFIG.BALANCE.NEWENEMY_HP_BASE + floorBonus,
        attack: CONFIG.BALANCE.NEWENEMY_ATTACK_BASE + Math.floor(floorBonus/2),
        expValue: CONFIG.BALANCE.NEWENEMY_EXP,
        goldDrop: Math.floor(Math.random() * X) + Y + floorBonus
    };

// 3. Add sprite to sprites/enemies/newEnemy.js
const newEnemySprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        // Draw using ctx.fillRect only
    }
};

// 4. Register in sprites/index.js
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

### Current Technical Debt
- DungeonThemes class removed (was unused)
- No unit tests (relies on manual testing)
- Particle system could use object pooling
- Some magic numbers still exist outside CONFIG

### Performance Bottlenecks
- Fog of war recalculates entire grid each update
- No sprite caching/atlasing
- Full map render each frame (no dirty rectangles)

### Refactoring Opportunities
- Extract UI updates into separate class
- Consolidate duplicate pathfinding code
- Create proper event system for combat messages

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