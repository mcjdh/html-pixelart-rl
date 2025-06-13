# CLAUDE.md - AI Context for HTML Pixel Roguelike

## 🧠 AI Instance Quick Context

**This is a PRODUCTION-READY 12-floor roguelike** built in pure vanilla JS. No frameworks, no build tools, no npm. The game is complete and stable - focus on understanding existing patterns before suggesting changes.

### Critical AI Awareness Points
- **NEVER suggest adding npm/webpack/frameworks** - This is intentionally vanilla JS
- **NEVER modify script loading order** in index.html - Will break everything
- **NEVER use ES6 modules** - Uses global namespace pattern only
- **Script loading dependencies are CRITICAL** - Check `old-claude-md.md` for order
- **Memory management is implemented** - Use tracked listeners, not direct ones

### First Actions for New AI Instances
1. **Read `current-task-updates.md`** - Shows recent work and current state
2. **Scan `src/config.js`** - All constants live here, avoid magic numbers  
3. **Check `src/auto/README.md`** - AI system can demo all features
4. **Test with**: `autoSystem.startSpeedRun()` in browser console

### Instant Game Testing (No Setup)
```bash
# Quick server + test
python3 -m http.server 8080 & sleep 2 && xdg-open http://localhost:8080

# In browser console, immediate full game demo:
autoSystem.startSpeedRun()  // Completes entire 12-floor campaign
```

### AI-Optimized Quick Tests
```javascript
// ✅ Use browser console for game logic tests
game.gameState.player.takeDamage(5)
debugCommands.spawnEnemy('goblin')
debugCommands.revealMap()

// ✅ Node for pure math/formulas only
node -e "console.log(Math.max(1, 10 - 5))"

// ❌ Don't create files for simple verification
// ❌ Don't start servers manually - user will handle
```

## 🎮 Game Architecture (AI Perspective)

### What This Game IS
- **Complete 12-floor campaign**: 4 areas × 3 floors, ends with victory
- **Turn-based roguelike**: Energy system, fog of war, tactical combat
- **Stateless auto-AI**: Can complete full campaign autonomously
- **Modular sprite system**: Each theme has organized sprite files
- **Event-driven**: EventBus connects all systems

### What This Game is NOT
- **Not a framework demo** - Pure game implementation
- **Not a tutorial project** - Production-quality, battle-tested
- **Not incomplete** - Has proper ending and victory condition
- **Not performance-critical** - Optimized but not real-time

### Core Systems Understanding
```javascript
// Main game loop (src/game.js)
Game.update() → GameState.update() → Renderer.render()

// Turn order (CRITICAL for AI to understand)
Player Input → Energy Check → Action → Fog Update → Enemy Turns → UI Update

// Auto-exploration (src/auto/)
AutoSystem → AutoGameRunner (campaign) | AutoExplorerManager (single floor)
```

## ⚡ Critical Implementation Patterns (AI Reference)

### Script Loading Order (MEMORIZE THIS)
```html
config.js → utils.js → sprites/player.js → sprites/enemies/*.js → 
sprites/items/*.js → sprites/environment/*.js → sprites/index.js → 
entities.js → levels/*.js → mapGenerator.js → gameState.js → 
renderer.js → combat.js → core/*.js → ui/*.js → game.js → 
levels/areas/*.js → auto/*.js
```
**Breaking this = runtime reference errors. DO NOT MODIFY.**

### Global Namespace Pattern (AI Must Follow)
```javascript
// ✅ CORRECT - How ALL sprites/systems work
window.goblinSprites = { default: function(ctx, x, y, size) {...} };
const SPRITES = { enemies: { goblin: window.goblinSprites.default } };

// ❌ WRONG - Will break everything
export const goblinSprites = {...}
import { SPRITES } from './sprites.js'
```

### Memory Management (Required Pattern)
```javascript
// ✅ CORRECT - Game class has tracking
this.addEventListenerTracked(element, 'click', handler);
this.addTimeoutTracked(() => callback(), 1000);

// ❌ WRONG - Memory leaks
element.addEventListener('click', handler);
setTimeout(() => callback(), 1000);
```

### Configuration Pattern (AI Should Always Use)
```javascript
// ✅ CORRECT - All values in CONFIG
const damage = CONFIG.BALANCE.GOBLIN_ATTACK_BASE + floorBonus;
const timing = CONFIG.UI.TIMING.NORMAL;

// ❌ WRONG - Magic numbers
const damage = 5 + floorBonus;
const timing = 1500;
```

## 🎯 AI-Optimized Development Patterns

### For Adding New Enemies
```javascript
// 1. CONFIG.BALANCE (required)
NEWENEMY_HP_BASE: 12, NEWENEMY_ATTACK_BASE: 6,

// 2. entities.js getStatsForType() (required)
case 'newEnemy': return { hp: CONFIG.BALANCE.NEWENEMY_HP_BASE + floorBonus, ... };

// 3. Sprite file: src/sprites/enemies/newEnemy.js (required)
window.newEnemySprites = { default: function(ctx, x, y, size) { /* sprite */ } };

// 4. Register: src/sprites/index.js (required)
newEnemy: window.newEnemySprites?.default || fallbackEnemySprite,

// 5. Add to area: src/levels/areas/[area].js (required)
enemies: ["goblin", "newEnemy", "skeleton"]
```

### For Quick Feature Testing
```javascript
// ✅ Use existing debug system
debugCommands.giveGold(1000)         // Test economy
debugCommands.teleport(15, 15)       // Test positioning
debugCommands.spawnEnemy('goblin')   // Test combat
debugCommands.revealMap()            // Test rendering

// ✅ Use auto-system for full feature demo
autoSystem.startFloor('enhanced', 'complete')  // Watch AI play
autoSystem.stats()                              // See performance data
```

### For Understanding Game State
```javascript
// ✅ Inspect current state quickly
game.gameState.player           // Player stats, position, inventory
game.gameState.enemies          // All enemy positions and health
game.gameState.floor            // Current floor number
game.gameState.areaManager.currentArea  // Current area info

// ✅ Check configuration
CONFIG.BALANCE                  // All stat formulas
CONFIG.AUTO_EXPLORE            // AI behavior settings
CONFIG.DEBUG                   // Debug flags
```

## 🚧 AI Development Guidelines

### What AI Should Do FIRST
1. **Check `current-task-updates.md`** for recent changes and context
2. **Read relevant area documentation** in `src/levels/areas/` for context
3. **Test changes via browser console** before modifying files
4. **Use auto-exploration** to verify balance/gameplay changes

### What AI Should AVOID
- **Creating new files** unless absolutely necessary
- **Breaking script loading order** 
- **Adding external dependencies**
- **Modifying core game loop** without deep understanding
- **Using async/await** in performance-critical code
- **Direct state mutation** - use methods instead

### AI Error Recovery Patterns
```javascript
// ✅ When sprite loading fails
if (window.someSprites && window.someSprites.default) {
    window.someSprites.default(ctx, x, y, size);
} else {
    // Fallback rendering
    ctx.fillRect(x, y, size, size);
}

// ✅ When game state is broken
if (game && game.gameState && game.gameState.player) {
    // Normal operation
} else {
    console.error('Game state invalid, check console for errors');
    // Graceful failure
}
```

## 📊 Quick Game Data Reference (AI Cheat Sheet)

### Combat Formulas
```javascript
damage = Math.max(1, attack - defense)
critChance = 0.1 + (level * 0.01)  
critDamage = baseDamage * 2
levelUpHP = currentMaxHP + 5
levelUpAttack = currentAttack + 1
```

### Energy System
- Move: 1 energy | Combat: 5 energy | Regen: 2/800ms | Floor: +50

### Campaign Structure
```javascript
// 12 floors total, 4 areas
Area 1: Ancient Caverns (floors 1-3) → Skeleton Lord boss
Area 2: Mystic Forest (floors 4-6) → Normal progression  
Area 3: Fungal Depths (floors 7-9) → Spore Mother boss
Area 4: Stellar Observatory (floors 10-12) → Stellar Architect boss → VICTORY
```

### Auto-Exploration Commands (AI Testing)
```javascript
autoSystem.startFloor()                    // Single floor, enhanced AI
autoSystem.startSpeedRun()                 // Full campaign, fast
autoSystem.startCompleteRun()              // Full campaign, thorough
autoSystem.stop(); autoSystem.status()     // Control and info
```

### Debug Commands (AI Verification)
```javascript
debugCommands.help()                       // List all commands
debugCommands.giveGold(amount)             // Economy testing
debugCommands.teleport(x, y)               // Position testing  
debugCommands.godMode()                    // Invincibility testing
debugCommands.spawnEnemy(type)             // Combat testing
debugCommands.revealMap()                  // Visibility testing
```

## 🎯 Current Status Context (December 2025)

### Production Ready Features ✅
- Complete 12-floor campaign with ending
- 3 boss encounters with complex sprites
- 11+ enemy types across 4 themed areas
- Production-grade auto-exploration (A+ rated)
- Comprehensive error handling and debug tools
- Optimized performance with memory management

### File Organization
```
src/
├── config.js              ← All constants, first stop for AI
├── game.js                ← Main game loop, entry point
├── gameState.js           ← All game data and state
├── auto/                  ← AI system with 3 implementations
├── levels/areas/          ← 4 complete themed areas
├── sprites/               ← Organized by type (enemies, environment, items)
└── [other systems]        ← Combat, renderer, UI, etc.
```

### AI Priority Understanding
1. **Game is complete** - Don't add major features unless requested
2. **Focus on optimization** - Performance, debugging, quality of life
3. **Preserve existing patterns** - Don't "modernize" the vanilla JS approach  
4. **Test thoroughly** - Use auto-exploration and debug commands
5. **Document changes** - Update `current-task-updates.md`

## 💡 AI Development Philosophy

### Core Principles for AI
1. **Understand before changing** - This codebase has deep patterns
2. **Test immediately** - Browser console and auto-system are your friends
3. **Preserve game feel** - Every change should enhance core loop
4. **Fail gracefully** - Error handling is implemented, use it
5. **Follow conventions** - Sprite patterns, config usage, memory management

### Remember for AI Context
- This is **vanilla JS by design** - Don't suggest "modernization"
- Script loading order is **critical** - One wrong move breaks everything  
- The auto-exploration AI can **demo any feature** - Use it for testing
- Game has **proper ending** - It's complete, not a work-in-progress
- **Performance is good** - Don't over-optimize unless specifically asked

---

**AI Context Version**: December 2025  
**Game State**: Production Ready (v1.0)  
**Primary Function**: Assist with enhancements to complete, stable roguelike  
**Key Files**: `current-task-updates.md`, `src/config.js`, `src/auto/README.md`