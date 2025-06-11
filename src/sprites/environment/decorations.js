const decorationSprites = {
    torch: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 7*unit, y + 8*unit, 2*unit, 6*unit);
        ctx.fillStyle = '#f80';
        ctx.fillRect(x + 6*unit, y + 5*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 7*unit, y + 3*unit, 2*unit, 2*unit);
        ctx.fillStyle = '#ff0';
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 2*unit);
    }
};