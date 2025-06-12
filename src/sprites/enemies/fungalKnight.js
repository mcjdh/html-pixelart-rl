const fungalKnightSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Armored mushroom body
        ctx.fillStyle = '#5a4a6a';
        ctx.fillRect(x + unit * 5, y + unit * 6, unit * 6, unit * 8);
        
        // Mushroom cap helmet
        ctx.fillStyle = '#7a5a8a';
        ctx.fillRect(x + unit * 3, y + unit * 2, unit * 10, unit * 5);
        ctx.fillRect(x + unit * 4, y + unit, unit * 8, unit);
        
        // Cap armor plates
        ctx.fillStyle = '#6a4a7a';
        ctx.fillRect(x + unit * 3, y + unit * 3, unit * 3, unit * 3);
        ctx.fillRect(x + unit * 10, y + unit * 3, unit * 3, unit * 3);
        
        // Glowing eyes through helmet
        ctx.fillStyle = '#b898d8';
        ctx.fillRect(x + unit * 6, y + unit * 4, unit, unit);
        ctx.fillRect(x + unit * 9, y + unit * 4, unit, unit);
        
        // Arms with spore weapons
        ctx.fillStyle = '#5a4a6a';
        ctx.fillRect(x + unit * 2, y + unit * 8, unit * 2, unit * 4);
        ctx.fillRect(x + unit * 12, y + unit * 8, unit * 2, unit * 4);
        
        // Spore sword
        ctx.fillStyle = '#9878b8';
        ctx.fillRect(x + unit * 13, y + unit * 4, unit, unit * 6);
        ctx.fillRect(x + unit * 12, y + unit * 5, unit * 3, unit);
        
        // Shield with mushroom emblem
        ctx.fillStyle = '#4a3a5a';
        ctx.fillRect(x + unit * 1, y + unit * 7, unit * 3, unit * 5);
        ctx.fillStyle = '#8a6aa8';
        ctx.fillRect(x + unit * 2, y + unit * 8, unit, unit * 3);
        
        // Legs
        ctx.fillStyle = '#4a3a5a';
        ctx.fillRect(x + unit * 6, y + unit * 13, unit * 2, unit * 3);
        ctx.fillRect(x + unit * 8, y + unit * 13, unit * 2, unit * 3);
        
        // Spore aura
        const time = Date.now() * 0.003;
        const alpha = Math.sin(time) * 0.15 + 0.2;
        ctx.fillStyle = `rgba(140, 100, 180, ${alpha})`;
        for (let i = 0; i < 3; i++) {
            const angle = (time + i * 2.1) % (Math.PI * 2);
            const dx = Math.cos(angle) * unit * 2;
            const dy = Math.sin(angle) * unit * 2;
            ctx.fillRect(x + unit * 8 + dx, y + unit * 8 + dy, unit, unit);
        }
    }
};

// Register globally
window.fungalKnightSprites = fungalKnightSprites;