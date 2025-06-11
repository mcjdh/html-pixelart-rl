export const skeletonSprites = {
    default: (ctx, x, y, size) => {
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
    
    archer: (ctx, x, y, size) => {
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
        // Eye sockets (glowing)
        ctx.fillStyle = '#f44';
        ctx.fillRect(x + 6*unit, y + 4*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 8*unit, y + 4*unit, 2*unit, 2*unit);
        // Bow
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 2*unit, y + 6*unit, unit, 6*unit);
        ctx.fillRect(x + 3*unit, y + 6*unit, unit, unit);
        ctx.fillRect(x + 3*unit, y + 11*unit, unit, unit);
        // Arrow
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x + 3*unit, y + 9*unit, 2*unit, unit);
    },
    
    mage: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ddd';
        // Skull
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 6*unit);
        // Robed ribs
        ctx.fillStyle = '#424';
        ctx.fillRect(x + 5*unit, y + 8*unit, 6*unit, 5*unit);
        // Arms
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 3*unit, y + 8*unit, 2*unit, 4*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 2*unit, 4*unit);
        // Legs
        ctx.fillRect(x + 6*unit, y + 13*unit, unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 13*unit, unit, 2*unit);
        // Eye sockets (magical)
        ctx.fillStyle = '#44f';
        ctx.fillRect(x + 6*unit, y + 4*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 8*unit, y + 4*unit, 2*unit, 2*unit);
        // Staff
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 13*unit, y + 5*unit, unit, 8*unit);
        // Magical orb
        ctx.fillStyle = '#44f';
        ctx.fillRect(x + 12*unit, y + 4*unit, 3*unit, 2*unit);
    }
};