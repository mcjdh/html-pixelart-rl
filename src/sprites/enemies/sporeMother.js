const sporeMotherSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.002;
        
        // Massive mushroom body
        ctx.fillStyle = '#4a3a5a';
        ctx.fillRect(x + unit * 2, y + unit * 8, unit * 12, unit * 8);
        
        // Giant cap (boss-sized - much larger than sporeling)
        ctx.fillStyle = '#6a4a7a';
        ctx.fillRect(x, y + unit * 2, unit * 16, unit * 7);
        ctx.fillRect(x + unit * 2, y + unit, unit * 12, unit);
        ctx.fillRect(x + unit * 4, y, unit * 8, unit);
        
        // Boss-exclusive crown ridges
        ctx.fillStyle = '#7a5a8a';
        ctx.fillRect(x + unit * 6, y, unit * 4, unit);
        ctx.fillRect(x + unit * 4, y + unit, unit * 8, unit);
        
        // Cap patterns and ridges
        ctx.fillStyle = '#5a3a6a';
        ctx.fillRect(x + unit * 2, y + unit * 4, unit * 3, unit * 3);
        ctx.fillRect(x + unit * 11, y + unit * 4, unit * 3, unit * 3);
        ctx.fillRect(x + unit * 6, y + unit * 5, unit * 4, unit * 2);
        
        // Multiple glowing ancient eyes (boss-exclusive - sporeling only has 2)
        ctx.fillStyle = '#d8a8f8';
        ctx.fillRect(x + unit * 4, y + unit * 5, unit * 2, unit);
        ctx.fillRect(x + unit * 10, y + unit * 5, unit * 2, unit);
        ctx.fillRect(x + unit * 7, y + unit * 3, unit * 2, unit);
        
        // Boss-exclusive third eye (center forehead)
        const eyePulse = Math.sin(time * 1.5) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 180, 255, ${eyePulse})`;
        ctx.fillRect(x + unit * 7, y + unit * 6, unit * 2, unit * 2);
        
        // Pulsating core
        const pulse = Math.sin(time) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(200, 150, 255, ${0.4 + pulse * 0.4})`;
        ctx.fillRect(x + unit * 6, y + unit * 10, unit * 4, unit * 4);
        
        // Tentacle-like mycelium roots
        ctx.fillStyle = '#3a2a4a';
        ctx.fillRect(x + unit, y + unit * 14, unit * 2, unit * 2);
        ctx.fillRect(x + unit * 13, y + unit * 14, unit * 2, unit * 2);
        ctx.fillRect(x + unit * 4, y + unit * 15, unit * 2, unit);
        ctx.fillRect(x + unit * 10, y + unit * 15, unit * 2, unit);
        
        // Spore clouds emanating (contained within bounds)
        for (let i = 0; i < 5; i++) {
            const angle = (time + i * 1.3) % (Math.PI * 2);
            const radius = unit * 2.5; // Reduced radius to stay within bounds
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            const alpha = 0.2 + Math.sin(time + i * 0.7) * 0.15;
            
            const sporeX = x + unit * 8 + dx - unit;
            const sporeY = y + unit * 8 + dy - unit;
            
            // Only draw if within sprite bounds
            if (sporeX >= x && sporeX + unit * 2 <= x + size && sporeY >= y && sporeY + unit * 2 <= y + size) {
                ctx.fillStyle = `rgba(180, 120, 220, ${alpha})`;
                ctx.fillRect(sporeX, sporeY, unit * 2, unit * 2);
            }
        }
        
        // Ancient runes on cap
        ctx.fillStyle = '#8a6aa8';
        ctx.fillRect(x + unit * 3, y + unit * 2, unit, unit);
        ctx.fillRect(x + unit * 12, y + unit * 2, unit, unit);
        ctx.fillRect(x + unit * 7, y + unit * 6, unit, unit);
        
        // Bioluminescent veins
        const veinGlow = Math.sin(time * 1.5) * 0.3 + 0.4;
        ctx.fillStyle = `rgba(150, 100, 255, ${veinGlow})`;
        ctx.fillRect(x + unit * 5, y + unit * 8, unit * 6, unit);
        ctx.fillRect(x + unit * 8, y + unit * 6, unit, unit * 4);
    }
};

// Register globally
window.sporeMotherSprites = sporeMotherSprites;