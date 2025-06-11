const goblinSprites = {
    default: (ctx, x, y, size) => {
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
    
    warrior: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#a44';
        // Head
        ctx.fillRect(x + 4*unit, y + 3*unit, 8*unit, 6*unit);
        // Armored body
        ctx.fillRect(x + 5*unit, y + 9*unit, 6*unit, 4*unit);
        // Arms with armor
        ctx.fillRect(x + 3*unit, y + 9*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 11*unit, y + 9*unit, 2*unit, 2*unit);
        // Legs
        ctx.fillRect(x + 5*unit, y + 13*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 13*unit, 2*unit, 2*unit);
        // Helmet
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 4*unit, y + 2*unit, 8*unit, 3*unit);
        // Eyes
        ctx.fillStyle = '#ff0';
        ctx.fillRect(x + 5*unit, y + 5*unit, unit, unit);
        ctx.fillRect(x + 10*unit, y + 5*unit, unit, unit);
        // Sword
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x + 13*unit, y + 8*unit, unit, 4*unit);
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 13*unit, y + 12*unit, unit, 2*unit);
    },
    
    shaman: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#a44';
        // Head
        ctx.fillRect(x + 4*unit, y + 3*unit, 8*unit, 6*unit);
        // Robed body
        ctx.fillRect(x + 4*unit, y + 9*unit, 8*unit, 5*unit);
        // Arms
        ctx.fillRect(x + 2*unit, y + 9*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 12*unit, y + 9*unit, 2*unit, 3*unit);
        // Eyes (glowing)
        ctx.fillStyle = '#f0f';
        ctx.fillRect(x + 5*unit, y + 5*unit, unit, unit);
        ctx.fillRect(x + 10*unit, y + 5*unit, unit, unit);
        // Staff
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 14*unit, y + 7*unit, unit, 6*unit);
        // Crystal orb
        ctx.fillStyle = '#f0f';
        ctx.fillRect(x + 13*unit, y + 6*unit, 3*unit, 2*unit);
    }
};