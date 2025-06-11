const equipmentSprites = {
    sword: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x + 7*unit, y + 2*unit, 2*unit, 8*unit);
        ctx.fillRect(x + 5*unit, y + 10*unit, 6*unit, unit);
        ctx.fillStyle = '#843';
        ctx.fillRect(x + 7*unit, y + 11*unit, 2*unit, 3*unit);
    }
};