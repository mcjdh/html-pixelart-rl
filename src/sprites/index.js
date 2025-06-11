// Main sprite registry - backwards compatible with existing code
const SPRITES = {
    // Player sprites
    player: (ctx, x, y, size) => playerSprites.default(ctx, x, y, size, 'down'),
    playerWarrior: playerSprites.warrior,
    playerMage: playerSprites.mage,
    playerRogue: playerSprites.rogue,
    
    // Enemy sprites
    goblin: goblinSprites.default,
    goblinWarrior: goblinSprites.warrior,
    goblinShaman: goblinSprites.shaman,
    skeleton: skeletonSprites.default,
    wolf: wolfSprites.default,
    treant: treantSprites.default,
    
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
        skeleton: skeletonSprites,
        wolf: wolfSprites,
        treant: treantSprites
    },
    items: {
        consumables: consumableSprites,
        treasure: treasureSprites,
        equipment: equipmentSprites
    },
    environment: {
        terrain: terrainSprites,
        decorations: decorationSprites,
        cavern: cavernSprites,
        forest: forestSprites
    }
};

// Backwards compatible registries
const ENEMY_SPRITES = {
    goblin: goblinSprites.default,
    skeleton: skeletonSprites.default,
    wolf: wolfSprites.default,
    treant: treantSprites.default
};

const ITEM_SPRITES = {
    gold: treasureSprites.gold,
    potion: consumableSprites.potion,
    sword: equipmentSprites.sword,
    shield: equipmentSprites.shield,
    scroll: equipmentSprites.scroll
};