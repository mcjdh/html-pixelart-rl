# Unified Auto-Completion System

This directory contains the complete auto-completion system for the HTML Pixel Roguelike, providing both manual floor exploration and full campaign automation.

## System Components

### Core AI Systems
- **`AutoExplorerFinal.js`** - Original production-ready auto-explorer (A+ rated)
- **`AutoExplorerEnhanced.js`** - Enhanced version with tactical intelligence

### Unified Automation Framework
- **`AutoGameRunner.js`** - Full campaign automation with statistics tracking
- **`AutoExplorerManager.js`** - AI switching interface for floor exploration
- **`AutoSystem.js`** - Main unified interface for all automation features
- **`index.js`** - System loader and initialization

### System Architecture
```
AutoSystem (Main Interface)
├── AutoGameRunner (Campaign Automation)
│   ├── AutoExplorerEnhanced (Tactical AI)
│   └── AutoExplorerFinal (Original AI)
└── AutoExplorerManager (Floor Automation)
    ├── AutoExplorerEnhanced
    └── AutoExplorerFinal
```

## Original Auto-Explorer (AutoExplorerFinal.js)

The original implementation follows a simple but reliable decision tree:
1. Attack adjacent enemies (8-directional)
2. Pick up nearby items (expanding circles)  
3. Seek visible enemies within 8 tiles
4. Seek items further away
5. Check if floor complete (60% explored)
6. Explore unknown areas
7. Move to stairs

**Key Features:**
- **Stateless design** - No internal state to corrupt
- **180ms timing** - Natural automated feel
- **Energy-aware** - Auto-pauses when low energy
- **Fail-safe** - Cannot break game state
- **100% completion rate** - Reliably clears all 12 floors

## Enhanced Auto-Explorer (AutoExplorerEnhanced.js)

The enhanced version adds strategic intelligence while maintaining reliability:

### Threat Assessment System
- Calculates threat scores based on enemy damage vs player
- Prioritizes dangerous enemies first
- Considers time-to-kill ratios
- Applies mode-specific caution multipliers

### Item Value Prioritization  
- Health potions valued higher when injured
- Equipment valued based on improvement potential
- Distance-adjusted value calculations
- Strategic item collection timing

### Tactical Positioning
- Seeks flanking and backstab opportunities
- Positions for combat advantages
- 2-3 tile enemy awareness for positioning
- Directional combat bonuses integration

### Multiple AI Modes

#### Speedrun Mode
- Fast 120ms timing
- Minimal item collection (1 tile radius)
- 40% exploration threshold
- Prioritizes weaker enemies
- Prefers stairs over thorough exploration

#### Balanced Mode (Default)
- Standard 180ms timing  
- Moderate item collection (2 tile radius)
- 60% exploration threshold
- Balanced threat vs opportunity assessment
- Original AutoExplorer behavior with enhancements

#### Complete Mode
- Slower 220ms timing
- Thorough item collection (3 tile radius)
- 85% exploration threshold
- Higher threat caution
- Prefers stronger enemies for better rewards

## Auto Game Runner (AutoGameRunner.js)

Provides full campaign automation across all 12 floors with intelligent progression management:

### Campaign Automation Features
- **Full 12-floor progression** (Ancient Caverns → Mystic Forest → Fungal Depths → Stellar Observatory)
- **AI strategy switching** based on floor difficulty and boss encounters
- **Death recovery** with configurable retry attempts
- **Performance tracking** with detailed statistics
- **Adaptive timing** that speeds up on easier floors

### Automation Modes
- **Speedrun**: Optimized for fastest completion time
- **Balanced**: Standard exploration with moderate collection
- **Complete**: Thorough exploration maximizing resources
- **Adaptive**: Intelligent strategy switching based on floor type

### Statistics Tracking
- Floor completion times and efficiency
- Enemy kills, items collected, gold earned
- Death count and retry statistics
- AI switches and strategy effectiveness
- Best/worst floor performance analysis

## Configuration

All settings are controlled through `CONFIG.AUTO_EXPLORE` in `config.js`:

```javascript
AUTO_EXPLORE: {
    ENABLED: true,
    DEFAULT_MODE: 'balanced',
    SHOW_DECISION_VISUALS: false,
    
    MODES: {
        speedrun: { STEP_DELAY: 120, ITEM_RADIUS: 1, ... },
        balanced: { STEP_DELAY: 180, ITEM_RADIUS: 2, ... },
        complete: { STEP_DELAY: 220, ITEM_RADIUS: 3, ... }
    },
    
    TACTICAL_POSITIONING: true,
    THREAT_ASSESSMENT: true,
    ITEM_VALUE_PRIORITY: true
}
```

## Usage

### Quick Start Commands
```javascript
// Full campaign automation
autoSystem.startSpeedRun()      // Fast 12-floor completion
autoSystem.startCompleteRun()   // Thorough 12-floor exploration  
autoSystem.startAdaptiveRun()   // Smart strategy switching

// Single floor automation
autoSystem.startFloor()                    // Enhanced AI, balanced mode
autoSystem.startFloor('enhanced', 'speedrun') // Enhanced AI, speedrun mode
autoSystem.startFloor('original')          // Original AI

// Control
autoSystem.stop()     // Stop all automation
autoSystem.pause()    // Pause current automation
autoSystem.resume()   // Resume paused automation

// Information
autoSystem.status()   // Show current system status
autoSystem.stats()    // Show performance statistics
autoSystem.help()     // Show all available commands
```

### In-Game Controls
- **Z** - Toggle auto-exploration ON/OFF
- **P** - Pause/unpause (Enhanced version only)
- **ESC** - Stop auto-exploration immediately

### Legacy Console Commands (Still Available)
```javascript
// Original AI commands
autoExplorerCommands.switchToEnhanced()
autoExplorerCommands.switchToOriginal()
autoExplorerCommands.setMode('speedrun')
autoExplorerCommands.help()
```

## Performance Comparison

| Feature | Original | Enhanced | Game Runner |
|---------|----------|----------|-------------|
| Decision Speed | O(1) | O(1) | O(1) |
| Pathfinding | O(V+E) | O(V+E) | O(V+E) |
| Memory Usage | Minimal | Minimal | Low |
| Code Size | 140 lines | 300+ lines | 500+ lines |
| Complexity | Simple | Moderate | Advanced |
| Completion Rate | 100% | 100% | 100% |
| Strategic Intelligence | Basic | Advanced | Adaptive |
| Campaign Automation | No | No | Yes |
| Statistics Tracking | No | Basic | Comprehensive |

## System Integration

### Loading the Auto System
Add to your HTML after all game scripts:
```html
<script src="src/auto/AutoExplorerFinal.js"></script>
<script src="src/auto/AutoExplorerEnhanced.js"></script> 
<script src="src/auto/AutoExplorerManager.js"></script>
<script src="src/auto/AutoGameRunner.js"></script>
<script src="src/auto/AutoSystem.js"></script>
<script src="src/auto/index.js"></script>
```

### Game Integration
The system auto-initializes when the game loads. For manual integration:

1. **Game.js initialization**:
```javascript
this.autoSystemInstance = new AutoSystem(this.gameState, this);
```

2. **Input handling** (optional - console commands work without this):
```javascript
case 'z': case 'Z':
    this.autoSystemInstance.startFloorExploration();
```

3. **Event integration** (optional - for better statistics):
```javascript
// In combat.js or wherever events occur
this.autoSystemInstance?.onEnemyKilled();
this.autoSystemInstance?.onItemCollected();
this.autoSystemInstance?.onFloorChange();
```

## Design Philosophy

Both implementations follow the "just works" philosophy but with different approaches:

- **Original**: Maximum simplicity and reliability
- **Enhanced**: Strategic intelligence with maintained reliability

The enhanced version adds sophistication without sacrificing the stateless design and fail-safe behavior that makes the original so reliable.

## Recommended Usage Scenarios

### For Different Player Types
- **New players**: Use `autoSystem.startFloor('original')` for learning game mechanics
- **Speedrunners**: Use `autoSystem.startSpeedRun()` for fastest completion
- **Completionists**: Use `autoSystem.startCompleteRun()` for thorough exploration
- **General play**: Use `autoSystem.startFloor()` for balanced floor automation

### For Different Purposes
- **Testing balance changes**: `autoSystem.startTestRun()` for quick validation
- **AFK progression**: `autoSystem.startAdaptiveRun()` for hands-off gaming
- **Learning AI behavior**: `autoSystem.startFloor('enhanced', 'complete')` with decision visuals
- **Performance benchmarking**: Multiple `autoSystem.startSpeedRun()` runs for statistics

## Future Enhancements

The modular system design allows for easy additions:

### Planned Features
- **Visual indicators** for AI decision-making in the game canvas
- **Save/load** automation profiles and statistics
- **Custom strategies** with user-defined behavior parameters
- **Multiplayer automation** for competitive speedrun comparisons
- **Machine learning** integration for adaptive behavior optimization

### Extensibility Points
- **New AI implementations** can be added by extending the base interface
- **Custom campaign modes** can be defined with different floor progression rules
- **Event hooks** allow integration with mods and custom game features
- **Statistics exporters** can save data in different formats (JSON, CSV, etc.)

## Technical Notes

The system maintains the original's core philosophy of being **slightly suboptimal** to preserve the skill gap between AI and human play, while providing substantial assistance for exploration and repetitive tasks.

All automation respects the game's energy system, fog of war mechanics, and turn-based structure. The AI never cheats or uses information not available to human players.