# Skills System Architecture

This folder contains the modular skills system inspired by Path of Exile, Runescape, and Pokemon Mystery Dungeon.

## File Structure

### Core Components

- **`SkillSystem.js`** - Core skill management, leveling, and milestone unlocking
- **`SkillActions.js`** - Handles experience gains from player actions  
- **`SkillEffects.js`** - Applies skill bonuses to gameplay mechanics
- **`SkillUI.js`** - Manages compact skill display and synergy visualization
- **`index.js`** - Exports all classes and initializes global instances

## System Overview

### Four Core Skills
- **🗡️ Combat** - Damage, crits, counter-attacks (gain from killing enemies)
- **❤️ Vitality** - HP, defense, death saves (gain from taking damage)  
- **🗺️ Exploration** - Energy, vision, secrets (gain from exploring tiles)
- **💰 Fortune** - Gold, items, luck (gain from collecting items/gold)

### Progression System
- **50 level cap** with exponential XP requirements
- **6 milestone levels** per skill: 5, 10, 15, 25, 35, 50
- **Three milestone types**: ⚡Abilities, 🛡️Passives, 🌟Ultimates

### Synergy System
- **⚔️ Warrior Path** (Combat 10+ & Vitality 10+): +Crit, +Damage Reduction
- **🗺️ Adventurer Path** (Exploration 10+ & Fortune 10+): +Gold, +Secret Finding  
- **👑 Master Path** (All skills 25+): Transcendent bonuses

## Integration Points

### Player Entity (`entities.js`)
```javascript
// Initialize in Player constructor
this.initializeSkillsSystem();

// Delegate skill actions
this.trackAction(actionType, value);
this.getModifiedDamage(baseDamage);
this.getModifiedGoldGain(baseGold);
```

### Game Loop (`game.js`)  
```javascript
// Update UI
this.updateSkillUI(); // Delegates to SkillUI class

// Apply effects in combat/movement
player.getModifiedEnergyCost(baseCost);
player.skillEffects.checkSecretDiscovery(item);
```

### Combat System (`combat.js`)
```javascript
// Enhanced combat with skill bonuses
const critMultiplier = player.skillEffects.getCritMultiplier();
const statusResistance = player.skillEffects.getStatusResistance();
```

## Key Design Principles

1. **Modular Architecture** - Each component has single responsibility
2. **Clean Delegation** - Player class delegates to skill components  
3. **Backward Compatibility** - Maintains save game compatibility
4. **Performance Optimized** - Efficient UI updates and bonus calculations
5. **Extensible** - Easy to add new skills, milestones, or synergies

## Adding New Features

### New Milestone
1. Add to `CONFIG.BALANCE.SKILL_SYSTEM.SKILLNAME` in `config.js`
2. Handle effect in `SkillEffects.applyMilestoneBonuses()`
3. Add UI display logic in `SkillUI.getNextMilestone()`

### New Synergy  
1. Define thresholds in `CONFIG.BALANCE.SKILL_SYSTEM.SYNERGIES`
2. Add check logic in `SkillSystem.checkSynergyBonuses()`
3. Add UI element in `index.html` synergies section

### New Skill Type
1. Extend skill initialization in `Player.initializeSkillsSystem()`
2. Add tracking in `SkillActions.trackAction()`
3. Define milestones in config and implement effects