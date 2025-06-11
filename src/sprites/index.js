// Import all sprite modules
import { playerSprites } from './player.js';
import { goblinSprites } from './enemies/goblin.js';
import { skeletonSprites } from './enemies/skeleton.js';
import { consumableSprites } from './items/consumables.js';
import { treasureSprites } from './items/treasure.js';
import { equipmentSprites } from './items/equipment.js';
import { terrainSprites } from './environment/terrain.js';
import { decorationSprites } from './environment/decorations.js';

// Main sprite registry - backwards compatible with existing code
export const SPRITES = {
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
    skeletonArcher: skeletonSprites.archer,
    skeletonMage: skeletonSprites.mage,
    
    // Item sprites
    gold: treasureSprites.gold,
    goldPile: treasureSprites.goldPile,
    gem: treasureSprites.gem,
    emerald: treasureSprites.emerald,
    ruby: treasureSprites.ruby,
    chest: treasureSprites.chest,
    
    potion: consumableSprites.potion,
    manaPotion: consumableSprites.manaPotion,
    bomb: consumableSprites.bomb,
    scroll: consumableSprites.scroll,
    food: consumableSprites.food,
    
    sword: equipmentSprites.sword,
    dagger: equipmentSprites.dagger,
    axe: equipmentSprites.axe,
    bow: equipmentSprites.bow,
    staff: equipmentSprites.staff,
    shield: equipmentSprites.shield,
    armor: equipmentSprites.armor,
    
    // Environment sprites
    stairs: terrainSprites.stairs,
    stairsUp: terrainSprites.stairsUp,
    door: terrainSprites.door,
    openDoor: terrainSprites.openDoor,
    trap: terrainSprites.trap,
    portal: terrainSprites.portal,
    altar: terrainSprites.altar,
    
    // Decoration sprites
    torch: decorationSprites.torch,
    wallTorch: decorationSprites.wallTorch,
    bones: decorationSprites.bones,
    cobweb: decorationSprites.cobweb,
    bloodStain: decorationSprites.bloodStain,
    mushroom: decorationSprites.mushroom,
    crystal: decorationSprites.crystal,
    statue: decorationSprites.statue
};

// Organized sprite registries for easier access
export const SPRITE_CATEGORIES = {
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
export const ENEMY_SPRITES = {
    goblin: goblinSprites.default,
    skeleton: skeletonSprites.default
};

export const ITEM_SPRITES = {
    gold: treasureSprites.gold,
    potion: consumableSprites.potion,
    sword: equipmentSprites.sword,
    chest: treasureSprites.chest
};

// Utility functions for sprite management
export class SpriteManager {
    static getPlayerSprite(type = 'default') {
        return playerSprites[type] || playerSprites.default;
    }
    
    static getEnemySprite(enemyType, variant = 'default') {
        const spriteSet = SPRITE_CATEGORIES.enemies[enemyType];
        return spriteSet ? (spriteSet[variant] || spriteSet.default) : null;
    }
    
    static getItemSprite(category, type) {
        const spriteSet = SPRITE_CATEGORIES.items[category];
        return spriteSet ? spriteSet[type] : null;
    }
    
    static getEnvironmentSprite(category, type) {
        const spriteSet = SPRITE_CATEGORIES.environment[category];
        return spriteSet ? spriteSet[type] : null;
    }
    
    static getAllSpritesOfType(type) {
        switch(type) {
            case 'player':
                return Object.keys(playerSprites);
            case 'enemies':
                return Object.keys(SPRITE_CATEGORIES.enemies);
            case 'items':
                return Object.keys(SPRITE_CATEGORIES.items);
            case 'environment':
                return Object.keys(SPRITE_CATEGORIES.environment);
            default:
                return [];
        }
    }
    
    static registerCustomSprite(category, subcategory, name, spriteFunction) {
        if (!SPRITE_CATEGORIES[category]) {
            SPRITE_CATEGORIES[category] = {};
        }
        if (!SPRITE_CATEGORIES[category][subcategory]) {
            SPRITE_CATEGORIES[category][subcategory] = {};
        }
        SPRITE_CATEGORIES[category][subcategory][name] = spriteFunction;
        
        // Also add to main registry for backwards compatibility
        SPRITES[`${subcategory}${name.charAt(0).toUpperCase() + name.slice(1)}`] = spriteFunction;
    }
}

// Animation support
export class SpriteAnimator {
    constructor() {
        this.animations = new Map();
    }
    
    addAnimation(name, sprites, duration = 500) {
        this.animations.set(name, {
            sprites,
            duration,
            frameTime: duration / sprites.length
        });
    }
    
    getAnimationFrame(name, time) {
        const animation = this.animations.get(name);
        if (!animation) return null;
        
        const frame = Math.floor((time % animation.duration) / animation.frameTime);
        return animation.sprites[frame];
    }
}

// Export a default animator instance
export const spriteAnimator = new SpriteAnimator();

// Add some basic animations
spriteAnimator.addAnimation('torch', [
    decorationSprites.torch,
    (ctx, x, y, size) => {
        decorationSprites.torch(ctx, x, y, size);
        // Slightly different flame
        const unit = size / 16;
        ctx.fillStyle = '#f60';
        ctx.fillRect(x + 6*unit, y + 4*unit, 4*unit, 2*unit);
    }
], 1000);

spriteAnimator.addAnimation('crystal', [
    decorationSprites.crystal,
    (ctx, x, y, size) => {
        decorationSprites.crystal(ctx, x, y, size);
        // Brighter glow
        const unit = size / 16;
        ctx.fillStyle = '#adf';
        ctx.fillRect(x + 6*unit, y + 4*unit, 4*unit, unit);
    }
], 2000);