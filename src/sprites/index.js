// Main sprite registry - backwards compatible with existing code
const SPRITES = {
    // Player sprites
    player: playerSprites.default,
    playerWarrior: playerSprites.warrior,
    playerMage: playerSprites.mage,
    playerRogue: playerSprites.rogue,
    
    // Enemy sprites
    goblin: goblinSprites.default,
    goblinWarrior: goblinSprites.warrior,
    goblinShaman: goblinSprites.shaman,
    skeleton: skeletonSprites.default,
    
    // Item sprites
    gold: treasureSprites.gold,
    potion: consumableSprites.potion,
    sword: equipmentSprites.sword,
    
    // Environment sprites
    stairs: terrainSprites.stairs,
    torch: decorationSprites.torch
};

// Organized sprite registries for easier access
const SPRITE_CATEGORIES = {
    player: playerSprites,
    enemies: {
        goblin: goblinSprites,
        skeleton: skeletonSprites
    },
    items: {
        consumables: consumableSprites,
        treasure: treasureSprites,
        equipment: equipmentSprites
    },
    environment: {
        terrain: terrainSprites,
        decorations: decorationSprites
    }
};

// Backwards compatible registries
const ENEMY_SPRITES = {
    goblin: goblinSprites.default,
    skeleton: skeletonSprites.default
};

const ITEM_SPRITES = {
    gold: treasureSprites.gold,
    potion: consumableSprites.potion,
    sword: equipmentSprites.sword
};