# Level Pack Implementation Guide

## Overview
This guide explains how to add new themed areas (level packs) to the HTML Pixel Roguelike game. The game uses a modular area-based level system where each area contains multiple floors with unique themes, enemies, and progression.

## Current Game Structure
- **Caverns** (3 floors) → unlocks Forest
- **Forest** (3 floors) → unlocks next area
- **[Your New Area]** (3 floors) → game completion

## File Structure for New Level Packs

```
src/
├── sprites/
│   ├── environment/
│   │   └── [theme].js          # Theme-specific terrain sprites
│   └── enemies/
│       └── [enemyName].js      # New enemy sprites
├── levels/
│   ├── generators/
│   │   └── [Theme]Generator.js # Optional custom map generator
│   └── areas/
│       └── [areaname].js       # Area definition file
```

## Step-by-Step Implementation Guide

### 1. Create Theme Sprites (`src/sprites/environment/[theme].js`)

```javascript
// Example: src/sprites/environment/mushroom.js
const mushroomSprites = {
    // Wall sprite
    wall: function(ctx, x, y, size) {
        const unit = size / 16;
        // Draw your wall sprite here
    },
    
    // Floor sprite
    floor: function(ctx, x, y, size) {
        const unit = size / 16;
        // Draw your floor sprite here
    },
    
    // Decorative elements
    mushroom: function(ctx, x, y, size) {
        const unit = size / 16;
        // Draw mushroom decoration
    },
    
    // Add more sprite types as needed
    spores: function(ctx, x, y, size) {
        // Animated spore effects
    }
};

// CRITICAL: Register globally
window.mushroomSprites = mushroomSprites;
```

### 2. Create Enemy Sprites (`src/sprites/enemies/[enemyName].js`)

```javascript
// Example: src/sprites/enemies/sporeling.js
const sporelingSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        // Draw enemy sprite
    },
    
    // Optional: attack animation
    attack: function(ctx, x, y, size) {
        // Attack pose sprite
    }
};

// CRITICAL: Register globally
window.sporelingSprites = sporelingSprites;
```

### 3. Add Enemy Stats to CONFIG (`src/config.js`)

```javascript
// In CONFIG.BALANCE, add:
SPORELING_HP_BASE: 15,
SPORELING_ATTACK_BASE: 6,
SPORELING_DEFENSE_BASE: 2,
SPORELING_EXP: 10,
SPORELING_GOLD_BASE: 20,
SPORELING_GOLD_RANGE: 10,
```

### 4. Register Enemy Stats (`src/entities.js`)

In the `getStatsForType()` function, add:

```javascript
case 'sporeling':
    return {
        hp: CONFIG.BALANCE.SPORELING_HP_BASE + floorBonus,
        attack: CONFIG.BALANCE.SPORELING_ATTACK_BASE + Math.floor(floorBonus / 2),
        defense: CONFIG.BALANCE.SPORELING_DEFENSE_BASE,
        expValue: CONFIG.BALANCE.SPORELING_EXP,
        goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.SPORELING_GOLD_RANGE) + 
                  CONFIG.BALANCE.SPORELING_GOLD_BASE + floorBonus,
        viewRange: 6,
        moveSpeed: 1.0
    };
```

### 5. Update Sprite Registry (`src/sprites/index.js`)

Add to the `ENEMY_SPRITES` object:

```javascript
sporeling: window.sporelingSprites ? window.sporelingSprites.default : fallbackEnemy,
```

### 6. Create Area Definition (`src/levels/areas/[areaname].js`)

```javascript
// Example: src/levels/areas/mushroom.js
const mushroomLevel = new LevelDefinition({
    id: 'mushroom',
    name: 'Fungal Depths',
    theme: 'mushroom',
    
    tileSprites: {
        wall: () => window.mushroomSprites ? window.mushroomSprites.wall : window.SPRITES.terrain.wall,
        floor: () => window.mushroomSprites ? window.mushroomSprites.floor : window.SPRITES.terrain.floor,
        mushroom: () => window.mushroomSprites ? window.mushroomSprites.mushroom : null,
        spores: () => window.mushroomSprites ? window.mushroomSprites.spores : null
    },
    
    floors: [
        {
            number: 1,
            name: "Spore Caverns",
            description: "Damp caves filled with glowing fungi",
            narrative: {
                enter: "The air is thick with spores as you descend into the fungal depths...",
                complete: "The spores seem to pulse with an otherworldly rhythm."
            },
            enemies: ["sporeling"],
            enemyCount: { base: 5, perFloor: 2 },
            itemCount: { base: 3, perFloor: 0.5 },
            specialEvents: ["spore_cloud"],
            completionBonus: {
                gold: 40,
                message: "The fungi release golden spores!"
            }
        },
        {
            number: 2,
            name: "Mycelium Network",
            description: "A vast underground network of fungal threads",
            narrative: {
                enter: "The walls pulse with bioluminescent veins...",
                complete: "The mycelium trembles at your presence."
            },
            enemies: ["sporeling", "fungalKnight"],
            enemyCount: { base: 6, perFloor: 2 },
            itemCount: { base: 4, perFloor: 0.5 }
        },
        {
            number: 3,
            name: "The Spore Mother's Chamber",
            description: "The heart of the fungal kingdom",
            narrative: {
                enter: "A massive fungal entity awaits in the depths...",
                complete: "With the Spore Mother defeated, the realm is saved!"
            },
            enemies: ["sporeling", "fungalKnight"],
            bosses: ["sporeMother"],
            enemyCount: { base: 4, perFloor: 1 },
            itemCount: { base: 5, perFloor: 1 },
            isFinalFloor: true,  // Mark as game's final floor
            completionBonus: {
                gold: 100,
                message: "You have saved the realm from the fungal plague!"
            }
        }
    ],
    
    enemyTypes: {
        default: ["sporeling"],
        bosses: ["sporeMother"]
    },
    
    mapConfig: {
        baseRoomCount: 7,
        roomsPerFloor: 1,
        minRoomSize: 6,
        maxRoomSize: 12,
        corridorWidth: 2,
        decorationChance: 0.25  // More decorations for atmosphere
    },
    
    progression: {
        unlocks: [],  // No unlocks - game ends here
        connections: [],  // No connections back
        victoryCondition: "game_complete"  // Special victory flag
    },
    
    narrative: {
        loreCategories: ["fungal", "spores", "ancient"],
        combatNarratives: {
            sporeling: [
                "The sporeling releases toxic clouds!",
                "Fungal tendrils lash out!"
            ],
            sporeMother: [
                "The Spore Mother's presence fills you with dread!",
                "Ancient fungal magic permeates the air!"
            ]
        }
    }
});

// CRITICAL: Register globally
window.mushroomLevel = mushroomLevel;
```

### 7. Optional: Custom Map Generator (`src/levels/generators/[Theme]Generator.js`)

```javascript
// Example: src/levels/generators/MushroomGenerator.js
class MushroomGenerator extends BaseGenerator {
    constructor() {
        super('mushroom');
    }
    
    generate(width, height, config) {
        const result = super.generate(width, height, config);
        this.addMushroomClusters(result.map, result.rooms, config);
        return result;
    }
    
    addMushroomClusters(map, rooms, config) {
        // Add mushroom decorations in clusters
        rooms.forEach(room => {
            if (Math.random() < 0.7) {  // 70% chance per room
                const clusterX = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
                const clusterY = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
                
                // Create a small cluster of mushrooms
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (Math.random() < 0.5) {
                            const x = clusterX + dx;
                            const y = clusterY + dy;
                            if (map[y] && map[y][x] && map[y][x].type === 'floor') {
                                map[y][x].decoration = 'mushroom';
                            }
                        }
                    }
                }
            }
        });
    }
}

window.MushroomGenerator = MushroomGenerator;
```

### 8. Update Script Loading (`index.html`)

Add your new files in the correct order:

```html
<!-- After other environment sprites -->
<script src="src/sprites/environment/mushroom.js"></script>

<!-- After other enemy sprites -->
<script src="src/sprites/enemies/sporeling.js"></script>
<script src="src/sprites/enemies/fungalKnight.js"></script>
<script src="src/sprites/enemies/sporeMother.js"></script>

<!-- After other generators (if using custom generator) -->
<script src="src/levels/generators/MushroomGenerator.js"></script>

<!-- After other area definitions -->
<script src="src/levels/areas/mushroom.js"></script>
```

### 9. Register the Area (`src/gameState.js`)

In the `registerAreas()` method:

```javascript
registerAreas() {
    // Register existing areas
    this.areaManager.registerArea(window.cavernsLevel);
    this.areaManager.registerArea(window.forestLevel);
    
    // Register new area
    this.areaManager.registerArea(window.mushroomLevel);
}
```

### 10. Update Previous Area's Progression

Modify `src/levels/areas/forest.js` to unlock your new area:

```javascript
progression: {
    unlocks: ["mushroom"],  // Changed from ["castle", "swamp"]
    connections: ["caverns", "mushroom"],
    victoryCondition: "complete_all_floors"
}
```

### 11. Handle Game Completion

In `src/gameState.js`, add special handling for the final area:

```javascript
// In completeFloor() method, after normal completion:
if (this.currentArea.progression.victoryCondition === 'game_complete') {
    this.handleGameVictory();
}

// Add new method:
handleGameVictory() {
    this.gameWon = true;
    this.ui.showVictoryScreen({
        title: "Realm Saved!",
        message: "You have completed all three realms and saved the land!",
        finalStats: {
            level: this.player.level,
            gold: this.player.gold,
            floorsCleared: this.totalFloorsCleared,
            enemiesDefeated: this.totalEnemiesDefeated
        }
    });
}
```

## Testing Your Level Pack

1. **Debug loading**: Use console to verify sprites loaded:
   ```javascript
   console.log(window.mushroomSprites);
   console.log(window.mushroomLevel);
   ```

2. **Force load area** (for testing):
   ```javascript
   game.gameState.loadArea('mushroom');
   game.gameState.generateFloor();
   ```

3. **Check sprite rendering**: Verify all sprites render correctly

4. **Test progression**: Complete forest and ensure mushroom area unlocks

5. **Balance testing**: Ensure difficulty curve is appropriate

## Common Issues & Solutions

### Sprites Not Appearing
- Check script loading order in index.html
- Verify global registration (window.spriteObject)
- Check sprite function signatures match expected format

### Area Not Loading
- Ensure area is registered in gameState.js
- Verify previous area unlocks it
- Check area ID matches in all references

### Enemies Not Spawning
- Add stats to CONFIG.BALANCE
- Add case to getStatsForType() in entities.js
- Register sprite in sprites/index.js

### Map Generation Issues
- If using custom generator, verify it extends BaseGenerator
- Check generator is registered in gameState.js
- Ensure map config values are reasonable

## Best Practices

1. **Theme Consistency**: Keep all sprites for a theme visually cohesive
2. **Balanced Difficulty**: Scale enemy stats appropriately for floor progression
3. **Narrative Flow**: Write engaging enter/complete messages for immersion
4. **Unique Mechanics**: Consider theme-specific events or hazards
5. **Performance**: Limit animated effects to maintain 60fps
6. **Fallbacks**: Always provide fallback sprites for missing assets

## Example Timeline for Implementation

1. **Hour 1**: Create basic wall/floor sprites and area definition
2. **Hour 2**: Design and implement enemy sprites and stats
3. **Hour 3**: Create decorative elements and special effects
4. **Hour 4**: Write narratives and balance gameplay
5. **Hour 5**: Test progression and fix any issues
6. **Hour 6**: Polish and add unique features (boss, events)

This modular system makes it easy to add unlimited themed areas while maintaining code quality and game balance!