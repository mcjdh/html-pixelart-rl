# Level Pack Implementation Guide

## Overview
This guide explains how to add new themed areas (level packs) to the HTML Pixel Roguelike game. The game uses a modular area-based level system where each area contains multiple floors with unique themes, enemies, and progression.

## Current Game Structure (COMPLETE CAMPAIGN)
- **Ancient Caverns** (floors 1-3) → unlocks Mystic Forest
- **Mystic Forest** (floors 4-6) → unlocks Fungal Depths  
- **Fungal Depths** (floors 7-9) → **GAME VICTORY!**

## Adding Level 4+ (Post-Victory Content)
To add new areas after the current complete campaign, you have two options:

**Option A: Extend Campaign (Recommended)**
- Modify Mushroom Island to unlock new area instead of ending game
- Create 4th area as new final area with victory condition

**Option B: New Game+ / Expansion**
- Create separate campaign mode or difficulty
- Add areas as optional post-game content

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

---

# COMPLETE EXAMPLE: Space Constellation Theme (Level 4)

This section provides a **complete, ready-to-implement** example of adding a Space Constellation theme as the 4th area, extending the game beyond the current 9-floor campaign.

## Theme Overview: Stellar Observatory

**Visual Theme:** Cosmic observatory with starfields, constellation patterns, and celestial phenomena
**Enemy Theme:** Cosmic entities, star guardians, and ethereal beings
**Narrative Theme:** Ancient astronomical knowledge and cosmic consciousness

### Floor Progression
1. **Star Chart Chamber** - Introduction to stellar mechanics
2. **Constellation Gallery** - Ancient star map navigation  
3. **Cosmic Observatory** - Final boss: Stellar Architect

## Implementation Files

### 1. Environment Sprites: `src/sprites/environment/stellar.js`

```javascript
const stellarSprites = {
    wall: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Deep space background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(x, y, size, size);
        
        // Observatory panels and controls
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(x + unit * 2, y + unit * 2, unit * 12, unit * 3);
        ctx.fillRect(x + unit * 2, y + unit * 11, unit * 12, unit * 3);
        
        // Control panels
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x + unit * 3, y + unit * 3, unit * 2, unit);
        ctx.fillRect(x + unit * 11, y + unit * 3, unit * 2, unit);
        
        // Glowing stars (animated)
        const time = Date.now() * 0.002;
        const seed = (x + y) * 0.01;
        const twinkle = Math.sin(time + seed) * 0.5 + 0.5;
        
        // Star points
        const starAlpha = 0.4 + twinkle * 0.6;
        ctx.fillStyle = `rgba(255, 255, 200, ${starAlpha})`;
        ctx.fillRect(x + unit * 5, y + unit * 6, unit, unit);
        ctx.fillRect(x + unit * 10, y + unit * 9, unit, unit);
    },
    
    floor: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Observatory floor with constellation patterns
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(x, y, size, size);
        
        // Constellation lines (position-based patterns)
        const pattern = ((x * 17 + y * 23) % 1000) / 1000;
        if (pattern > 0.7) {
            ctx.fillStyle = '#3a3a5a';
            // Horizontal constellation line
            ctx.fillRect(x + unit * 2, y + unit * 8, unit * 12, unit);
        } else if (pattern > 0.4) {
            ctx.fillStyle = '#3a3a5a';
            // Vertical constellation line
            ctx.fillRect(x + unit * 8, y + unit * 2, unit, unit * 12);
        }
        
        // Star field dots
        ctx.fillStyle = '#5a5a7a';
        ctx.fillRect(x + unit * 4, y + unit * 4, unit, unit);
        ctx.fillRect(x + unit * 12, y + unit * 7, unit, unit);
        ctx.fillRect(x + unit * 8, y + unit * 11, unit, unit);
    },
    
    starChart: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Large star chart table
        ctx.fillStyle = '#3a3a5a';
        ctx.fillRect(x + unit * 2, y + unit * 6, unit * 12, unit * 8);
        
        // Chart surface
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x + unit * 3, y + unit * 7, unit * 10, unit * 6);
        
        // Constellation patterns on chart
        ctx.fillStyle = '#7a7a9a';
        // Major constellation points
        ctx.fillRect(x + unit * 5, y + unit * 8, unit, unit);
        ctx.fillRect(x + unit * 8, y + unit * 9, unit, unit);
        ctx.fillRect(x + unit * 11, y + unit * 10, unit, unit);
        
        // Connecting lines
        ctx.fillRect(x + unit * 6, y + unit * 8, unit * 2, unit);
        ctx.fillRect(x + unit * 8, y + unit * 9, unit * 3, unit);
    },
    
    telescope: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Telescope base
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(x + unit * 6, y + unit * 12, unit * 4, unit * 4);
        
        // Telescope tube
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x + unit * 7, y + unit * 4, unit * 2, unit * 10);
        
        // Telescope eyepiece
        ctx.fillStyle = '#6a6a8a';
        ctx.fillRect(x + unit * 6, y + unit * 3, unit * 4, unit * 2);
        
        // Animated viewing light
        const time = Date.now() * 0.003;
        const glow = Math.sin(time) * 0.3 + 0.5;
        ctx.fillStyle = `rgba(100, 150, 255, ${glow})`;
        ctx.fillRect(x + unit * 7, y + unit * 4, unit * 2, unit);
    },
    
    constellation: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.001;
        
        // Constellation pattern with animated stars
        const stars = [
            {x: 4, y: 3}, {x: 8, y: 5}, {x: 12, y: 4},
            {x: 6, y: 8}, {x: 10, y: 10}, {x: 14, y: 9},
            {x: 3, y: 12}, {x: 7, y: 13}, {x: 11, y: 15}
        ];
        
        // Draw constellation lines first
        ctx.fillStyle = 'rgba(150, 180, 255, 0.3)';
        // Horizontal connections
        ctx.fillRect(x + unit * 4, y + unit * 3, unit * 4, unit);
        ctx.fillRect(x + unit * 8, y + unit * 5, unit * 4, unit);
        // Vertical connections  
        ctx.fillRect(x + unit * 6, y + unit * 8, unit, unit * 2);
        ctx.fillRect(x + unit * 10, y + unit * 10, unit, unit * 3);
        
        // Draw animated stars
        stars.forEach((star, i) => {
            const starTime = time + i * 0.7;
            const brightness = Math.sin(starTime) * 0.4 + 0.6;
            ctx.fillStyle = `rgba(255, 255, 200, ${brightness})`;
            ctx.fillRect(x + unit * star.x, y + unit * star.y, unit * 2, unit * 2);
        });
    }
};

// Register globally
window.stellarSprites = stellarSprites;
```

### 2. Enemy Sprites

#### Stardust Sprite: `src/sprites/enemies/stardustSprite.js`

```javascript
const stardustSpriteSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.005;
        
        // Ethereal body (shifting transparency)
        const alpha = Math.sin(time) * 0.3 + 0.5;
        ctx.fillStyle = `rgba(180, 200, 255, ${alpha})`;
        ctx.fillRect(x + unit * 5, y + unit * 6, unit * 6, unit * 6);
        
        // Core light
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.2})`;
        ctx.fillRect(x + unit * 7, y + unit * 8, unit * 2, unit * 2);
        
        // Floating star particles around sprite
        for (let i = 0; i < 4; i++) {
            const angle = (time + i * 1.5) % (Math.PI * 2);
            const radius = unit * 3;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            
            ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
            ctx.fillRect(x + unit * 8 + dx, y + unit * 9 + dy, unit, unit);
        }
    }
};

window.stardustSpriteSprites = stardustSpriteSprites;
```

#### Cosmic Guardian: `src/sprites/enemies/cosmicGuardian.js`

```javascript
const cosmicGuardianSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.002;
        
        // Armored celestial body
        ctx.fillStyle = '#4a4a7a';
        ctx.fillRect(x + unit * 4, y + unit * 6, unit * 8, unit * 8);
        
        // Stellar armor plates
        ctx.fillStyle = '#6a6a9a';
        ctx.fillRect(x + unit * 3, y + unit * 5, unit * 3, unit * 4);
        ctx.fillRect(x + unit * 10, y + unit * 5, unit * 3, unit * 4);
        
        // Constellation crown
        ctx.fillStyle = '#8a8aba';
        ctx.fillRect(x + unit * 5, y + unit * 3, unit * 6, unit * 3);
        
        // Glowing constellation points on crown
        const glow = Math.sin(time) * 0.4 + 0.6;
        ctx.fillStyle = `rgba(150, 180, 255, ${glow})`;
        ctx.fillRect(x + unit * 6, y + unit * 4, unit, unit);
        ctx.fillRect(x + unit * 9, y + unit * 4, unit, unit);
        
        // Star staff
        ctx.fillStyle = '#7a7aaa';
        ctx.fillRect(x + unit * 13, y + unit * 7, unit, unit * 6);
        ctx.fillStyle = `rgba(200, 220, 255, ${glow})`;
        ctx.fillRect(x + unit * 12, y + unit * 6, unit * 3, unit * 2);
        
        // Legs
        ctx.fillStyle = '#4a4a7a';
        ctx.fillRect(x + unit * 6, y + unit * 13, unit * 2, unit * 3);
        ctx.fillRect(x + unit * 8, y + unit * 13, unit * 2, unit * 3);
    }
};

window.cosmicGuardianSprites = cosmicGuardianSprites;
```

#### Stellar Architect (Boss): `src/sprites/enemies/stellarArchitect.js`

```javascript
const stellarArchitectSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.001;
        
        // Massive cosmic entity
        ctx.fillStyle = '#2a2a5a';
        ctx.fillRect(x + unit * 2, y + unit * 4, unit * 12, unit * 10);
        
        // Cosmic robes with constellation patterns
        ctx.fillStyle = '#3a3a6a';
        ctx.fillRect(x, y + unit * 8, unit * 16, unit * 8);
        
        // Constellation patterns on robes
        ctx.fillStyle = '#5a5a8a';
        ctx.fillRect(x + unit * 3, y + unit * 10, unit * 2, unit);
        ctx.fillRect(x + unit * 8, y + unit * 12, unit * 2, unit);
        ctx.fillRect(x + unit * 11, y + unit * 11, unit * 2, unit);
        
        // Multiple eyes (cosmic consciousness)
        const eyeGlow = Math.sin(time * 2) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(150, 200, 255, ${eyeGlow})`;
        ctx.fillRect(x + unit * 5, y + unit * 6, unit * 2, unit);
        ctx.fillRect(x + unit * 9, y + unit * 6, unit * 2, unit);
        ctx.fillRect(x + unit * 7, y + unit * 8, unit * 2, unit);
        
        // Crown of stars
        ctx.fillStyle = '#7a7aaa';
        ctx.fillRect(x + unit * 4, y + unit * 2, unit * 8, unit * 2);
        
        // Animated star crown points
        for (let i = 0; i < 5; i++) {
            const starTime = time + i * 0.5;
            const brightness = Math.sin(starTime) * 0.4 + 0.6;
            ctx.fillStyle = `rgba(255, 255, 200, ${brightness})`;
            ctx.fillRect(x + unit * (5 + i * 2), y + unit, unit, unit);
        }
        
        // Cosmic staff
        ctx.fillStyle = '#6a6a9a';
        ctx.fillRect(x + unit * 15, y + unit * 5, unit, unit * 10);
        
        // Staff orb with swirling energy
        const orbGlow = Math.sin(time * 3) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(100, 150, 255, ${orbGlow})`;
        ctx.fillRect(x + unit * 14, y + unit * 3, unit * 3, unit * 3);
        
        // Energy tendrils from staff
        for (let i = 0; i < 3; i++) {
            const angle = (time * 2 + i * 2.1) % (Math.PI * 2);
            const radius = unit * 2;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            
            ctx.fillStyle = `rgba(120, 170, 255, ${orbGlow * 0.7})`;
            ctx.fillRect(x + unit * 15 + dx, y + unit * 4 + dy, unit, unit);
        }
    }
};

window.stellarArchitectSprites = stellarArchitectSprites;
```

### 3. Config Updates: Add to `src/config.js`

```javascript
// Add to CONFIG.BALANCE:
// Stellar Observatory enemies
STARDUST_SPRITE_HP_BASE: 8,
STARDUST_SPRITE_ATTACK_BASE: 4,
STARDUST_SPRITE_DEFENSE_BASE: 1,
STARDUST_SPRITE_EXP: 8,

COSMIC_GUARDIAN_HP_BASE: 22,
COSMIC_GUARDIAN_ATTACK_BASE: 8,
COSMIC_GUARDIAN_DEFENSE_BASE: 5,
COSMIC_GUARDIAN_EXP: 18,

STELLAR_ARCHITECT_HP_BASE: 50,
STELLAR_ARCHITECT_ATTACK_BASE: 12,
STELLAR_ARCHITECT_DEFENSE_BASE: 6,
STELLAR_ARCHITECT_EXP: 100,

// Gold drops
STARDUST_SPRITE_GOLD_BASE: 12,
STARDUST_SPRITE_GOLD_RANGE: 8,
COSMIC_GUARDIAN_GOLD_BASE: 30,
COSMIC_GUARDIAN_GOLD_RANGE: 20,
STELLAR_ARCHITECT_GOLD_BASE: 200,
STELLAR_ARCHITECT_GOLD_RANGE: 100,
```

### 4. Entity Stats: Add to `src/entities.js` getStatsForType()

```javascript
case 'stardustSprite':
    return {
        hp: CONFIG.BALANCE.STARDUST_SPRITE_HP_BASE + floorBonus,
        attack: CONFIG.BALANCE.STARDUST_SPRITE_ATTACK_BASE + Math.floor(floorBonus / 2),
        defense: CONFIG.BALANCE.STARDUST_SPRITE_DEFENSE_BASE,
        expValue: CONFIG.BALANCE.STARDUST_SPRITE_EXP,
        goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.STARDUST_SPRITE_GOLD_RANGE) + CONFIG.BALANCE.STARDUST_SPRITE_GOLD_BASE + floorBonus,
        viewRange: 7,
        moveSpeed: 1.2
    };
case 'cosmicGuardian':
    return {
        hp: CONFIG.BALANCE.COSMIC_GUARDIAN_HP_BASE + floorBonus * 2,
        attack: CONFIG.BALANCE.COSMIC_GUARDIAN_ATTACK_BASE + Math.floor(floorBonus / 2),
        defense: CONFIG.BALANCE.COSMIC_GUARDIAN_DEFENSE_BASE,
        expValue: CONFIG.BALANCE.COSMIC_GUARDIAN_EXP,
        goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.COSMIC_GUARDIAN_GOLD_RANGE) + CONFIG.BALANCE.COSMIC_GUARDIAN_GOLD_BASE + floorBonus * 3,
        viewRange: 8,
        moveSpeed: 0.8
    };
case 'stellarArchitect':
    return {
        hp: CONFIG.BALANCE.STELLAR_ARCHITECT_HP_BASE + floorBonus * 8,
        attack: CONFIG.BALANCE.STELLAR_ARCHITECT_ATTACK_BASE + Math.floor(floorBonus / 2),
        defense: CONFIG.BALANCE.STELLAR_ARCHITECT_DEFENSE_BASE,
        expValue: CONFIG.BALANCE.STELLAR_ARCHITECT_EXP,
        goldDrop: Math.floor(Math.random() * CONFIG.BALANCE.STELLAR_ARCHITECT_GOLD_RANGE) + CONFIG.BALANCE.STELLAR_ARCHITECT_GOLD_BASE + floorBonus * 15,
        viewRange: 10,
        moveSpeed: 0.6
    };
```

### 5. Area Definition: `src/levels/areas/stellar.js`

```javascript
const stellarLevel = new LevelDefinition({
    id: 'stellar',
    name: 'Stellar Observatory',
    theme: 'stellar',
    
    tileSprites: {
        wall: () => window.stellarSprites ? window.stellarSprites.wall : window.SPRITES.terrain.wall,
        floor: () => window.stellarSprites ? window.stellarSprites.floor : window.SPRITES.terrain.floor,
        starChart: () => window.stellarSprites ? window.stellarSprites.starChart : null,
        telescope: () => window.stellarSprites ? window.stellarSprites.telescope : null,
        constellation: () => window.stellarSprites ? window.stellarSprites.constellation : null
    },
    
    floors: [
        {
            number: 1,
            name: "Star Chart Chamber",
            description: "An ancient astronomical library filled with celestial maps and cosmic instruments",
            narrative: {
                enter: "You ascend into a vast observatory where countless star charts cover every surface. The air hums with cosmic energy, and ethereal beings of stardust drift between the constellation maps. Ancient telescopes point toward distant galaxies, their lenses gleaming with otherworldly light.",
                complete: "The star charts begin to glow, revealing pathways between the constellations. You sense a greater cosmic intelligence watching your progress."
            },
            enemies: ["stardustSprite"],
            enemyCount: { base: 4, perFloor: 2 },
            itemCount: { base: 3, perFloor: 0.5 },
            specialEvents: ["stellar_alignment", "cosmic_insight"],
            completionBonus: {
                gold: 60,
                message: "The stars bestow celestial treasures upon you!"
            }
        },
        {
            number: 2,
            name: "Constellation Gallery",
            description: "A magnificent hall where living constellations dance across the cosmic ceiling",
            narrative: {
                enter: "You enter a breathtaking gallery where the very constellations have come to life. Cosmic guardians patrol the stellar pathways, their armor gleaming with starlight. The ceiling displays the entire known universe, with new star patterns forming and dissolving in cosmic harmony.",
                complete: "The constellations align in your honor, opening a pathway to the heart of the observatory. The cosmic guardians bow as you pass, recognizing your astronomical knowledge."
            },
            enemies: ["stardustSprite", "cosmicGuardian"],
            enemyCount: { base: 5, perFloor: 2 },
            itemCount: { base: 4, perFloor: 0.5 },
            specialEvents: ["constellation_formation", "stellar_wisdom"],
            completionBonus: {
                gold: 90,
                message: "The constellations gift you with cosmic knowledge!"
            }
        },
        {
            number: 3,
            name: "Cosmic Observatory",
            description: "The supreme chamber where the Stellar Architect weaves the very fabric of space and time",
            narrative: {
                enter: "At the pinnacle of the observatory, you face the Stellar Architect - an ancient cosmic entity who has mapped every star and guided the birth of galaxies. The chamber itself pulses with the heartbeat of the universe, and you realize this being holds the final key to cosmic understanding.",
                complete: "With the Stellar Architect's cosmic blessing earned through celestial combat, you have mastered the four fundamental realms - earth, nature, primordial life, and cosmic consciousness. The universe itself acknowledges your journey from mortal explorer to cosmic champion. Your legend echoes across all stars!"
            },
            enemies: ["stardustSprite", "cosmicGuardian"],
            bosses: ["stellarArchitect"],
            enemyCount: { base: 3, perFloor: 1 },
            itemCount: { base: 6, perFloor: 1 },
            isFinalFloor: true,
            completionBonus: {
                gold: 300,
                message: "The Stellar Architect grants you mastery over cosmic forces!"
            }
        }
    ],
    
    enemyTypes: {
        default: ["stardustSprite"],
        advanced: ["cosmicGuardian"],
        bosses: ["stellarArchitect"]
    },
    
    mapConfig: {
        baseRoomCount: 8,
        roomsPerFloor: 2,
        minRoomSize: 8,
        maxRoomSize: 14,
        corridorWidth: 3,
        decorationChance: 0.4,
        stellarFeatureChance: 0.5,
        constellationChance: 0.3
    },
    
    progression: {
        unlocks: [],
        connections: [],
        victoryCondition: "cosmic_mastery_complete"
    },
    
    narrative: {
        loreCategories: ["astronomy", "cosmic_consciousness", "stellar_mechanics", "universal_harmony"],
        combatNarratives: {
            stardustSprite: [
                "The stardust sprite dissolves into cosmic particles!",
                "Ethereal energy swirls as the sprite fades!",
                "The sprite's stellar essence returns to the void!",
                "Twinkling star fragments mark the sprite's departure!"
            ],
            cosmicGuardian: [
                "The cosmic guardian's stellar armor cracks and crumbles!",
                "Ancient star magic protects the guardian's final moments!",
                "The guardian's constellation crown dims as it falls!",
                "Cosmic energy disperses from the defeated guardian!"
            ],
            stellarArchitect: [
                "The Stellar Architect's cosmic form trembles with ancient power!",
                "Universal constants bend around the Architect's presence!",
                "The very fabric of space-time ripples with each movement!",
                "Galaxies themselves seem to pause, awaiting the outcome!",
                "The Architect's star-crown pulses with the light of creation!",
                "Reality itself shifts as cosmic forces clash!"
            ]
        },
        flavorText: {
            exploration: [
                "Star charts glow softly in the cosmic light.",
                "The observatory hums with celestial energy.",
                "Constellation patterns shift slowly across the walls.",
                "Ancient telescopes track invisible cosmic phenomena.",
                "The air shimmers with stardust and cosmic radiation."
            ],
            combat: [
                "Your weapon cuts through trails of cosmic energy!",
                "Stellar forces amplify the impact of your attacks!",
                "The cosmic battlefield sparkles with celestial power!",
                "Star fragments scatter with each defeated foe!"
            ]
        }
    },
    
    ambience: {
        1: { atmosphere: "cosmic", lightLevel: 0.6, stellarIntensity: 0.4 },
        2: { atmosphere: "celestial", lightLevel: 0.5, stellarIntensity: 0.7 },
        3: { atmosphere: "universal", lightLevel: 0.3, stellarIntensity: 1.0 }
    },
    
    specialFeatures: {
        stellarEffects: true,
        constellationAnimations: true,
        cosmicParticles: true,
        universalHarmony: true
    }
});

// Register globally
window.stellarLevel = stellarLevel;
```

### 6. Update Mushroom Area to Unlock Stellar

Modify `src/levels/areas/mushroom.js`:

```javascript
progression: {
    unlocks: ["stellar"],  // Unlock stellar observatory instead of ending
    connections: ["stellar"],
    victoryCondition: "complete_all_floors"
}
```

### 7. Add Scripts to `index.html`

```html
<!-- After mushroom sprites -->
<script src="./src/sprites/environment/stellar.js"></script>

<!-- After mushroom enemies -->
<script src="./src/sprites/enemies/stardustSprite.js"></script>
<script src="./src/sprites/enemies/cosmicGuardian.js"></script>
<script src="./src/sprites/enemies/stellarArchitect.js"></script>

<!-- After mushroom area -->
<script src="./src/levels/areas/stellar.js"></script>
```

### 8. Register in `src/gameState.js`

```javascript
// Register the stellar level
if (window.stellarLevel) {
    this.areaManager.registerArea(window.stellarLevel);
}
```

## Final Campaign Flow (12 Floors)

1. **Ancient Caverns** (floors 1-3) → Mystic Forest
2. **Mystic Forest** (floors 4-6) → Fungal Depths  
3. **Fungal Depths** (floors 7-9) → Stellar Observatory
4. **Stellar Observatory** (floors 10-12) → **COSMIC MASTERY!**

This creates a complete thematic progression: **Earth → Nature → Life → Cosmos**, taking the player from underground caverns to cosmic consciousness across 12 floors with 3 boss encounters.

The Space Constellation theme provides a satisfying cosmic conclusion to the expanded campaign while maintaining the modular architecture for future additions!