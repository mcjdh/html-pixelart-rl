const sporelingSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Mushroom body (small cap creature)
        ctx.fillStyle = '#8a6aa8';
        ctx.fillRect(x + unit * 4, y + unit * 4, unit * 8, unit * 8);
        ctx.fillRect(x + unit * 3, y + unit * 5, unit * 10, unit * 6);
        
        // Cap details
        ctx.fillStyle = '#7a5a98';
        ctx.fillRect(x + unit * 5, y + unit * 6, unit * 6, unit * 3);
        
        // Lighter spots on cap
        ctx.fillStyle = '#9a7ab8';
        ctx.fillRect(x + unit * 5, y + unit * 5, unit * 2, unit);
        ctx.fillRect(x + unit * 9, y + unit * 6, unit, unit);
        ctx.fillRect(x + unit * 6, y + unit * 8, unit, unit);
        
        // Stem/legs
        ctx.fillStyle = '#6a5a7a';
        ctx.fillRect(x + unit * 5, y + unit * 11, unit * 2, unit * 4);
        ctx.fillRect(x + unit * 9, y + unit * 11, unit * 2, unit * 4);
        
        // Eyes (glowing)
        ctx.fillStyle = '#d8b8f8';
        ctx.fillRect(x + unit * 6, y + unit * 7, unit, unit);
        ctx.fillRect(x + unit * 9, y + unit * 7, unit, unit);
        
        // Spore cloud effect
        const time = Date.now() * 0.004;
        const alpha = Math.sin(time) * 0.2 + 0.3;
        ctx.fillStyle = `rgba(180, 140, 220, ${alpha})`;
        ctx.fillRect(x + unit * 2, y + unit * 2, unit * 2, unit * 2);
        ctx.fillRect(x + unit * 12, y + unit * 3, unit * 2, unit * 2);
    }
};

// Register globally
window.sporelingSprites = sporelingSprites;