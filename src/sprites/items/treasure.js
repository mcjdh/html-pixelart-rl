const treasureSprites = {
    gold: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#aa4';
        ctx.fillRect(x + 5*unit, y + 5*unit, 6*unit, unit);
        ctx.fillRect(x + 4*unit, y + 6*unit, 8*unit, 4*unit);
        ctx.fillRect(x + 5*unit, y + 10*unit, 6*unit, unit);
        ctx.fillStyle = '#ff8';
        ctx.fillRect(x + 6*unit, y + 6*unit, 2*unit, 2*unit);
    }
};