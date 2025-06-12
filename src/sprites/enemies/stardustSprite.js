const stardustSpriteSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.005;
        
        // Ethereal body (shifting transparency)
        const alpha = Math.sin(time) * 0.3 + 0.5;
        ctx.fillStyle = `rgba(180, 200, 255, ${alpha})`;
        ctx.fillRect(x + unit * 5, y + unit * 6, unit * 6, unit * 6);
        
        // Core light
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.2})`;
        ctx.fillRect(x + unit * 7, y + unit * 8, unit * 2, unit * 2);
        
        // Floating star particles around sprite (contained within bounds)
        for (let i = 0; i < 4; i++) {
            const angle = (time + i * 1.5) % (Math.PI * 2);
            const radius = unit * 2.5; // Reduced radius
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            
            const particleX = x + unit * 8 + dx;
            const particleY = y + unit * 9 + dy;
            
            // Only draw if within sprite bounds
            if (particleX >= x && particleX + unit <= x + size && particleY >= y && particleY + unit <= y + size) {
                ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
                ctx.fillRect(particleX, particleY, unit, unit);
            }
        }
    }
};

window.stardustSpriteSprites = stardustSpriteSprites;