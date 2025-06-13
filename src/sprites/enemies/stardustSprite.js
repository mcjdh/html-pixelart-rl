const stardustSpriteSprites = {
    default: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        const time = Date.now() * 0.005;
        
        // Ethereal body with shifting transparency
        const alpha = Math.sin(time) * 0.3 + 0.5;
        const bodyColor = `rgba(180, 200, 255, ${alpha})`;
        SpriteUtils.drawRect(ctx, x, y, unit, bodyColor, 5, 6, 6, 6);
        
        // Bright core
        const coreColor = `rgba(255, 255, 255, ${alpha + 0.2})`;
        SpriteUtils.drawRect(ctx, x, y, unit, coreColor, 7, 8, 2, 2);
        
        // Animated floating star particles
        for (let i = 0; i < 4; i++) {
            const angle = (time + i * 1.5) % (Math.PI * 2);
            const radius = unit * 2.5;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            
            const particleX = x + unit * 8 + dx;
            const particleY = y + unit * 9 + dy;
            
            // Bounds check for particle safety
            if (particleX >= x && particleX + unit <= x + size && 
                particleY >= y && particleY + unit <= y + size) {
                ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
                ctx.fillRect(particleX, particleY, unit, unit);
            }
        }
    }
};

window.stardustSpriteSprites = stardustSpriteSprites;