const terrainSprites = {
    stairs: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#44a';
        ctx.fillRect(x + 2*unit, y + 12*unit, 12*unit, 2*unit);
        ctx.fillRect(x + 3*unit, y + 10*unit, 10*unit, 2*unit);
        ctx.fillRect(x + 4*unit, y + 8*unit, 8*unit, 2*unit);
        ctx.fillRect(x + 5*unit, y + 6*unit, 6*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 4*unit, 4*unit, 2*unit);
    }
};