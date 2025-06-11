const equipmentSprites = {
    sword: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x + 7*unit, y + 2*unit, 2*unit, 8*unit);
        ctx.fillRect(x + 5*unit, y + 10*unit, 6*unit, unit);
        ctx.fillStyle = '#843';
        ctx.fillRect(x + 7*unit, y + 11*unit, 2*unit, 3*unit);
    },
    
    shield: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 4*unit, y + 2*unit, 8*unit, 10*unit);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x + 5*unit, y + 3*unit, 6*unit, 8*unit);
        ctx.fillStyle = '#44f';
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 2*unit);
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 6*unit, y + 12*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 14*unit, 2*unit, 1*unit);
    },
    
    scroll: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#eed';
        ctx.fillRect(x + 3*unit, y + 4*unit, 10*unit, 8*unit);
        ctx.fillStyle = '#654';
        ctx.fillRect(x + 2*unit, y + 3*unit, 12*unit, 2*unit);
        ctx.fillRect(x + 2*unit, y + 11*unit, 12*unit, 2*unit);
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 5*unit, y + 6*unit, 6*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 8*unit, 5*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 10*unit, 4*unit, 1*unit);
    }
};