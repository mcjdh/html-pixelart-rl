export const treasureSprites = {
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
    
    goldPile: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#aa4';
        // Multiple coins
        ctx.fillRect(x + 4*unit, y + 8*unit, 3*unit, 3*unit);
        ctx.fillRect(x + 6*unit, y + 7*unit, 3*unit, 3*unit);
        ctx.fillRect(x + 8*unit, y + 9*unit, 3*unit, 3*unit);
        ctx.fillRect(x + 5*unit, y + 10*unit, 3*unit, 3*unit);
        // Shine
        ctx.fillStyle = '#ff8';
        ctx.fillRect(x + 7*unit, y + 8*unit, unit, unit);
        ctx.fillRect(x + 9*unit, y + 10*unit, unit, unit);
    },
    
    gem: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#44f';
        // Diamond shape
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, unit);
        ctx.fillRect(x + 6*unit, y + 7*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 5*unit, y + 9*unit, 6*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 11*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 13*unit, 2*unit, unit);
        // Sparkle
        ctx.fillStyle = '#88f';
        ctx.fillRect(x + 7*unit, y + 8*unit, 2*unit, unit);
    },
    
    emerald: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#4a4';
        // Diamond shape
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, unit);
        ctx.fillRect(x + 6*unit, y + 7*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 5*unit, y + 9*unit, 6*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 11*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 13*unit, 2*unit, unit);
        // Sparkle
        ctx.fillStyle = '#8f8';
        ctx.fillRect(x + 7*unit, y + 8*unit, 2*unit, unit);
    },
    
    ruby: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#a44';
        // Diamond shape
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, unit);
        ctx.fillRect(x + 6*unit, y + 7*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 5*unit, y + 9*unit, 6*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 11*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 13*unit, 2*unit, unit);
        // Sparkle
        ctx.fillStyle = '#f88';
        ctx.fillRect(x + 7*unit, y + 8*unit, 2*unit, unit);
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
        // Metal bands
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 3*unit, y + 8*unit, 10*unit, unit);
        ctx.fillRect(x + 3*unit, y + 12*unit, 10*unit, unit);
    }
};