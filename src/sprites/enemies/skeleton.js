const skeletonSprites = {
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
    }
};