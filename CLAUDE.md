# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based pixel art roguelike RPG built with native HTML, CSS, and vanilla JavaScript. The game features turn-based combat, procedural dungeon generation, fog of war, auto-exploration, and a persistent save system. The entire game runs client-side with no server dependencies and works directly with the file:// protocol.

## Development Commands

### Running the Game
```bash
# Open index.html directly in any browser
# Works with file:// protocol - no server required
# No build process needed - pure HTML/CSS/JavaScript

### Testing
- Test by opening index.html in browser 
- Game works offline and with file:// protocol
- Consider game theory, balance, and system integration for quality assurance
## Core Architecture

### Main Entry Point
- `index.html` - Classic 16-bit roguelike UI layout optimized for 640x480
- `src/game.js` - Main Game class that orchestrates all systems

### System Architecture (Native JavaScript)
- **Model**: `gameState.js` - Central state management for player, enemies, items, map
- **View**: `renderer.js` - Handles all canvas rendering and particle effects  
- **Controller**: `game.js` - Input handling, game loop, UI updates
- **Global Classes**: All classes are globally accessible without import/export

### UI Layout (640x480 Classic Design)
- **Game Canvas**: 480x320px main viewport (24x16 cells @ 20px each)
- **Side Panel**: 160x320px character stats, actions, and message log
- **Status Bar**: 640x80px bottom bar with key stats and controls
- **Color Scheme**: Classic terminal colors (#c0c0c0 text, #000 background)

### Key Systems

#### Entity System (`entities.js`)
- Base `Entity` class with position and movement
- `Player` extends Entity with stats, level progression, energy system
- `Enemy` extends Entity with AI pathfinding and type variants
- `Item` class for collectibles with type-based effects

#### Map Generation (`mapGenerator.js`)
- Room-based dungeon generation algorithm
- `Room` class for spatial management
- `MapGenerator` creates connected rooms with corridors
- Handles stairs placement and spawn point generation

#### Combat System (`combat.js`)
- `CombatSystem` - Damage calculation, critical hits, level scaling
- `UpgradeSystem` - Player progression through gold spending
- Turn-based with energy cost mechanics

#### Sprite System (`src/sprites/`)
Native JavaScript sprite organization:
- `sprites/index.js` - Global sprite registries and utility functions
- `sprites/player.js` - Player character variants (default, warrior, mage, rogue)
- `sprites/enemies/` - Enemy types (goblin, skeleton with variants)
- `sprites/items/` - Organized by category (consumables, equipment, treasure)
- `sprites/environment/` - Terrain and decoration sprites
- All sprite objects are globally accessible as constants
- No imports needed - scripts loaded in dependency order

#### Configuration (`config.js`)
Centralized configuration with sections:
- Grid dimensions and rendering settings
- Color scheme definitions
- Game timing and balance parameters
- Entity stats and progression formulas

### Data Flow

1. **Initialization**: Scripts load → `Game.init()` → `GameState.init()` → Map generation → Entity spawning
2. **Input**: Keyboard events → `Game.handleInput()` → `Game.movePlayer()`
3. **Game Loop**: `Game.render()` → Updates all visual systems
4. **Turn Processing**: Player action → Enemy turns → Fog of war update → UI refresh
5. **Persistence**: `GameState.saveGame()` / `loadGame()` with localStorage

### Key Design Patterns

#### Native Script Loading
- All scripts loaded via `<script>` tags in dependency order
- No module bundling or build process required
- All classes and constants are globally accessible
- Compatible with file:// protocol for offline play

#### Entity Class Hierarchy
- Base Entity class with common position/movement behavior
- Specialized classes (Player, Enemy, Item) extend with specific behaviors
- Type-based variants handled through constructor parameters

#### State Management
- GameState acts as single source of truth
- Immutable-style updates with explicit state changes
- Save/load serializes essential state to localStorage

#### Fog of War Implementation
- Grid-based visibility system
- Line-of-sight algorithm using Bresenham's line
- Real-time updates based on player position

## Important Development Notes

### Sprite System Usage
All sprites are globally accessible after script loading:
```javascript
// Use sprites directly - no imports needed
SPRITES.player(ctx, x, y, size);
playerSprites.warrior(ctx, x, y, size);
```

Sprite files must be loaded before sprites/index.js in the HTML.

### Canvas Rendering
- Uses pixel art rendering (imageSmoothingEnabled = false)
- 16px cell size with configurable grid dimensions
- All sprites expect (ctx, x, y, size) parameters

### Balance Configuration
Game balance is centralized in `CONFIG.BALANCE` - modify values there rather than hardcoding throughout the codebase.

### Entity Type System
New enemy/item types require:
1. Sprite definition in appropriate sprites folder
2. Type handling in spawn methods  
3. Balance values in config.js
4. Global constant declaration in sprites/index.js

### Script Loading Order
Critical: Scripts must load in this order in index.html:
1. config.js
2. All sprite files (player, enemies, items, environment)
3. sprites/index.js
4. entities.js
5. mapGenerator.js
6. gameState.js
7. renderer.js
8. combat.js
9. game.js

### Save System
Save data structure is versioned. When modifying save format, update the version number and handle migration in `loadGame()`.