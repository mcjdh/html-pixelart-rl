const consumableSprites = {
    potion: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#f44';
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 6*unit);
        ctx.fillStyle = '#a84';
        ctx.fillRect(x + 7*unit, y + 4*unit, 2*unit, 2*unit);
    }
};