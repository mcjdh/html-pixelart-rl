export const consumableSprites = {
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
    
    manaPotion: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#44f';
        // Bottle body
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 6*unit);
        // Bottle neck
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 2*unit);
        // Cork
        ctx.fillStyle = '#a84';
        ctx.fillRect(x + 7*unit, y + 4*unit, 2*unit, 2*unit);
        // Magical shimmer
        ctx.fillStyle = '#88f';
        ctx.fillRect(x + 7*unit, y + 9*unit, 2*unit, 2*unit);
    },
    
    bomb: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#333';
        // Bomb body (circle approximation)
        ctx.fillRect(x + 5*unit, y + 8*unit, 6*unit, 6*unit);
        ctx.fillRect(x + 4*unit, y + 9*unit, 8*unit, 4*unit);
        // Fuse
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 8*unit, y + 7*unit, unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 6*unit, unit, 2*unit);
        // Spark
        ctx.fillStyle = '#f80';
        ctx.fillRect(x + 9*unit, y + 5*unit, 2*unit, unit);
    },
    
    scroll: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#db8';
        // Scroll body
        ctx.fillRect(x + 5*unit, y + 6*unit, 6*unit, 8*unit);
        // Scroll ends
        ctx.fillRect(x + 4*unit, y + 7*unit, unit, 6*unit);
        ctx.fillRect(x + 11*unit, y + 7*unit, unit, 6*unit);
        // Text lines
        ctx.fillStyle = '#642';
        ctx.fillRect(x + 6*unit, y + 8*unit, 3*unit, unit);
        ctx.fillRect(x + 6*unit, y + 10*unit, 4*unit, unit);
        ctx.fillRect(x + 6*unit, y + 12*unit, 2*unit, unit);
    },
    
    food: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#a84';
        // Bread loaf
        ctx.fillRect(x + 4*unit, y + 9*unit, 8*unit, 4*unit);
        ctx.fillRect(x + 5*unit, y + 8*unit, 6*unit, 2*unit);
        // Crust detail
        ctx.fillStyle = '#964';
        ctx.fillRect(x + 4*unit, y + 9*unit, 8*unit, unit);
        ctx.fillRect(x + 5*unit, y + 8*unit, 6*unit, unit);
    }
};