export const playerSprites = {
    default: (ctx, x, y, size) => {
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
    
    warrior: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#66a';
        // Head
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 5*unit);
        // Body (armored)
        ctx.fillRect(x + 4*unit, y + 7*unit, 8*unit, 5*unit);
        // Arms (armored)
        ctx.fillRect(x + 2*unit, y + 8*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 12*unit, y + 8*unit, 2*unit, 3*unit);
        // Legs (armored)
        ctx.fillRect(x + 5*unit, y + 12*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 2*unit, 3*unit);
        // Helmet
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 4*unit, y + 1*unit, 8*unit, 3*unit);
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6*unit, y + 4*unit, unit, unit);
        ctx.fillRect(x + 9*unit, y + 4*unit, unit, unit);
    },
    
    mage: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#a4a';
        // Head
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 5*unit);
        // Robe body
        ctx.fillRect(x + 3*unit, y + 7*unit, 10*unit, 6*unit);
        // Arms
        ctx.fillRect(x + 2*unit, y + 8*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 12*unit, y + 8*unit, 2*unit, 3*unit);
        // Hat
        ctx.fillStyle = '#648';
        ctx.fillRect(x + 5*unit, y + 1*unit, 6*unit, 3*unit);
        ctx.fillRect(x + 6*unit, y + 0*unit, 4*unit, 2*unit);
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6*unit, y + 4*unit, unit, unit);
        ctx.fillRect(x + 9*unit, y + 4*unit, unit, unit);
        // Staff
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 14*unit, y + 6*unit, unit, 6*unit);
        ctx.fillStyle = '#44a';
        ctx.fillRect(x + 13*unit, y + 5*unit, 3*unit, 2*unit);
    },
    
    rogue: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#333';
        // Head
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 5*unit);
        // Body (dark clothes)
        ctx.fillRect(x + 4*unit, y + 7*unit, 8*unit, 5*unit);
        // Arms
        ctx.fillRect(x + 2*unit, y + 8*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 12*unit, y + 8*unit, 2*unit, 3*unit);
        // Legs
        ctx.fillRect(x + 5*unit, y + 12*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 2*unit, 3*unit);
        // Hood
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 4*unit, y + 1*unit, 8*unit, 4*unit);
        // Eyes (glowing)
        ctx.fillStyle = '#f80';
        ctx.fillRect(x + 6*unit, y + 4*unit, unit, unit);
        ctx.fillRect(x + 9*unit, y + 4*unit, unit, unit);
        // Daggers
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x + 1*unit, y + 9*unit, unit, 2*unit);
        ctx.fillRect(x + 14*unit, y + 9*unit, unit, 2*unit);
    }
};