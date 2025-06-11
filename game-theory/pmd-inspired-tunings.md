# Pokemon Mystery Dungeon Inspired Game Theory Tunings

## Core Design Philosophy
Pokemon Mystery Dungeon excels at creating meaningful risk/reward decisions through layered systems that interact emergently. This document explores small tunings to bring similar depth to our pixel roguelike.

## 1. Hunger/Satiation System
**Concept**: Replace or complement energy with hunger mechanics
- **Current**: Energy regenerates automatically over time
- **PMD-Style**: Hunger decreases each turn, requiring food management
- **Implementation**: 
  - Add `hunger` stat (0-100, starts at 80)
  - Hunger decreases by 1 per move, 2 per combat action
  - At 0 hunger: -1 HP per turn until death
  - Food items restore 20-50 hunger
  - Creates tension between exploration speed and resource management

## 2. Status Effects & Conditions
**Concept**: Temporary effects that create tactical depth
- **Sleep**: Skip 3-5 turns, but restore energy faster
- **Confused**: 50% chance movement goes in random direction
- **Paralyzed**: 50% chance to skip turn
- **Poisoned**: Lose 1 HP per turn for 10 turns
- **Blessed**: +50% damage and defense for 20 turns
- **Implementation**: Add `statusEffects` array to entities with duration tracking

## 3. Item Identification System
**Concept**: Unknown items add risk/reward gambling
- **Scrolls**: Random effects until identified (heal, teleport, confusion, etc.)
- **Potions**: Could be healing or poison until tested
- **Rings**: Permanent effects but unknown until worn
- **Identification Methods**:
  - Use item to learn its effect (risky)
  - Find "Scroll of Identify" 
  - Pay gold to NPC merchants
- Creates meaningful decisions about resource usage

## 4. Room-Based Special Events
**Concept**: Certain rooms have unique mechanics
- **Monster Houses**: Room full of enemies but guaranteed rare loot
- **Shops**: NPC vendor with expensive but powerful items
- **Puzzle Rooms**: Solve pattern/riddle for rewards
- **Trap Rooms**: Hidden dangers but valuable treasure
- **Warp Zones**: Teleport to different floor sections
- **Implementation**: 5% chance per room to be special type

## 5. Recruitable Allies
**Concept**: Defeated enemies can join your party
- **Recruitment Rate**: 5-15% based on level difference and charisma
- **Party Limit**: 2-3 allies maximum
- **AI Behavior**: Allies follow basic combat/movement AI
- **Ally Permadeath**: If ally dies, permanently lost
- **Growth**: Allies can level up and learn new abilities
- Creates emotional attachment and tactical formation play

## 6. Weather & Environmental Effects
**Concept**: Floor-wide conditions that affect gameplay
- **Sunny**: +1 damage for fire attacks, -1 for water
- **Rainy**: -1 damage for fire, +1 for electric attacks
- **Foggy**: Reduced vision radius by 2 tiles
- **Windy**: Projectiles/thrown items deviate randomly
- **Implementation**: Weather chosen at floor generation, shown in UI

## 7. Directional Combat
**Concept**: Positioning matters for damage calculation
- **Flanking**: +25% damage when attacking from side/behind
- **Blocking**: Face attacker for -25% damage taken
- **Knockback**: Strong attacks push enemies 1-2 tiles
- **Corner Trapping**: Enemies in corners take +50% damage
- **Implementation**: Track facing direction, modify damage based on relative positions

## 8. Crafting & Item Enhancement
**Concept**: Improve found equipment through combination
- **Weapon Sharpening**: Combine weapon + whetstone = +1 attack permanently  
- **Armor Reinforcement**: Armor + metal scraps = +1 defense
- **Potion Brewing**: Combine herbs found in dungeon
- **Enchanting**: Add magical effects to equipment
- **Materials**: Find crafting components as floor rewards
- Creates long-term progression goals beyond leveling

## 9. Stairs Variation
**Concept**: Multiple ways to progress floors
- **Normal Stairs**: Standard progression
- **Warp Stairs**: Skip 1-2 floors but miss loot
- **Locked Stairs**: Require key item to access
- **Hidden Stairs**: Must be discovered through exploration
- **Trap Stairs**: Lead to dangerous bonus floors with rare rewards
- **Implementation**: 20% chance for non-standard stairs

## 10. Emotional Resonance Systems
**Concept**: Create meaningful moments through emergent storytelling
- **Last Stand**: When at 1 HP, gain +100% damage for 5 turns
- **Revenge**: +50% damage against enemy type that killed your ally
- **Desperation**: Movement speed +1 when hunger < 20
- **Victory Rush**: +25% stats for 10 turns after defeating mini-boss
- **Survivor's Guilt**: -10% EXP gain if ally died on previous floor
- Creates memorable moments and emotional investment

## Balance Considerations

### Power Curve Tuning
- **Early Game** (Floors 1-3): Focus on basic mechanics, few status effects
- **Mid Game** (Floors 4-7): Introduce complexity, multiple status effects
- **Late Game** (Floors 8+): Full system interactions, high stakes decisions

### Player Agency
- Always provide multiple viable strategies
- Avoid mandatory grinding or repetitive actions
- Every decision should have meaningful trade-offs
- Failure should teach lessons, not just punish

### Emergent Complexity
- Simple rules that create complex interactions
- Systems that reinforce each other synergistically  
- Avoid feature bloat - each addition must serve core gameplay loop
- Test combinations extensively for edge cases

### Accessibility Balance
- Core game remains playable without mastering all systems
- Advanced mechanics provide depth for engaged players
- Clear visual/audio feedback for all system interactions
- Tutorial integration teaches systems gradually

## Implementation Priority

1. **High Impact, Low Complexity**: Status effects, directional combat
2. **Medium Impact, Medium Complexity**: Hunger system, item identification  
3. **High Impact, High Complexity**: Recruitable allies, crafting system
4. **Polish & Depth**: Weather effects, emotional resonance systems

Each system should be implemented incrementally and tested for balance before adding the next layer of complexity.