export const SPRITES = {
    player: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#4a4';
        // Head
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 5*unit);
        // Body
        ctx.fillRect(x + 4*unit, y + 7*unit, 8*unit, 5*unit);
        // Arms
        ctx.fillRect(x + 2*unit, y + 8*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 12*unit, y + 8*unit, 2*unit, 3*unit);
        // Legs
        ctx.fillRect(x + 5*unit, y + 12*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 2*unit, 3*unit);
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6*unit, y + 4*unit, unit, unit);
        ctx.fillRect(x + 9*unit, y + 4*unit, unit, unit);
    },
    
    goblin: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#a44';
        // Head (larger)
        ctx.fillRect(x + 4*unit, y + 3*unit, 8*unit, 6*unit);
        // Body (smaller)
        ctx.fillRect(x + 5*unit, y + 9*unit, 6*unit, 4*unit);
        // Arms
        ctx.fillRect(x + 3*unit, y + 9*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 11*unit, y + 9*unit, 2*unit, 2*unit);
        // Legs
        ctx.fillRect(x + 5*unit, y + 13*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 13*unit, 2*unit, 2*unit);
        // Eyes
        ctx.fillStyle = '#ff0';
        ctx.fillRect(x + 5*unit, y + 5*unit, unit, unit);
        ctx.fillRect(x + 10*unit, y + 5*unit, unit, unit);
    },
    
    skeleton: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ddd';
        // Skull
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 6*unit);
        // Ribs
        ctx.fillRect(x + 7*unit, y + 8*unit, 2*unit, unit);
        ctx.fillRect(x + 6*unit, y + 9*unit, 4*unit, unit);
        ctx.fillRect(x + 7*unit, y + 10*unit, 2*unit, unit);
        ctx.fillRect(x + 6*unit, y + 11*unit, 4*unit, unit);
        // Arms
        ctx.fillRect(x + 4*unit, y + 8*unit, unit, 4*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, unit, 4*unit);
        // Legs
        ctx.fillRect(x + 6*unit, y + 12*unit, unit, 3*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, unit, 3*unit);
        // Eye sockets
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 6*unit, y + 4*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 8*unit, y + 4*unit, 2*unit, 2*unit);
    },
    
    gold: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#aa4';
        // Coin shape
        ctx.fillRect(x + 5*unit, y + 5*unit, 6*unit, unit);
        ctx.fillRect(x + 4*unit, y + 6*unit, 8*unit, 4*unit);
        ctx.fillRect(x + 5*unit, y + 10*unit, 6*unit, unit);
        // Shine
        ctx.fillStyle = '#ff8';
        ctx.fillRect(x + 6*unit, y + 6*unit, 2*unit, 2*unit);
    },
    
    stairs: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#44a';
        // Steps
        ctx.fillRect(x + 2*unit, y + 12*unit, 12*unit, 2*unit);
        ctx.fillRect(x + 3*unit, y + 10*unit, 10*unit, 2*unit);
        ctx.fillRect(x + 4*unit, y + 8*unit, 8*unit, 2*unit);
        ctx.fillRect(x + 5*unit, y + 6*unit, 6*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 4*unit, 4*unit, 2*unit);
    },
    
    potion: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#f44';
        // Bottle body
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 6*unit);
        // Bottle neck
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 2*unit);
        // Cork
        ctx.fillStyle = '#a84';
        ctx.fillRect(x + 7*unit, y + 4*unit, 2*unit, 2*unit);
        // Liquid shine
        ctx.fillStyle = '#f88';
        ctx.fillRect(x + 7*unit, y + 9*unit, 2*unit, 2*unit);
    },
    
    sword: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ccc';
        // Blade
        ctx.fillRect(x + 7*unit, y + 2*unit, 2*unit, 8*unit);
        // Guard
        ctx.fillRect(x + 5*unit, y + 10*unit, 6*unit, unit);
        // Handle
        ctx.fillStyle = '#843';
        ctx.fillRect(x + 7*unit, y + 11*unit, 2*unit, 3*unit);
        // Pommel
        ctx.fillStyle = '#aa4';
        ctx.fillRect(x + 6*unit, y + 14*unit, 4*unit, unit);
    },
    
    chest: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#843';
        // Chest body
        ctx.fillRect(x + 3*unit, y + 7*unit, 10*unit, 7*unit);
        // Chest lid
        ctx.fillRect(x + 3*unit, y + 5*unit, 10*unit, 3*unit);
        // Lock
        ctx.fillStyle = '#aa4';
        ctx.fillRect(x + 7*unit, y + 9*unit, 2*unit, 3*unit);
    }
};

// Sprite registry for dynamic enemy types
export const ENEMY_SPRITES = {
    goblin: SPRITES.goblin,
    skeleton: SPRITES.skeleton
};

// Item sprite registry
export const ITEM_SPRITES = {
    gold: SPRITES.gold,
    potion: SPRITES.potion,
    sword: SPRITES.sword,
    chest: SPRITES.chest
};