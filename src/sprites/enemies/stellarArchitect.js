const stellarArchitectSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.001;
        
        // Massive cosmic entity
        ctx.fillStyle = '#2a2a5a';
        ctx.fillRect(x + unit * 2, y + unit * 4, unit * 12, unit * 10);
        
        // Cosmic robes with constellation patterns
        ctx.fillStyle = '#3a3a6a';
        ctx.fillRect(x, y + unit * 8, unit * 16, unit * 8);
        
        // Constellation patterns on robes
        ctx.fillStyle = '#5a5a8a';
        ctx.fillRect(x + unit * 3, y + unit * 10, unit * 2, unit);
        ctx.fillRect(x + unit * 8, y + unit * 12, unit * 2, unit);
        ctx.fillRect(x + unit * 11, y + unit * 11, unit * 2, unit);
        
        // Multiple cosmic eyes (boss-exclusive - stardust sprite has none)
        const eyeGlow = Math.sin(time * 2) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(150, 200, 255, ${eyeGlow})`;
        ctx.fillRect(x + unit * 5, y + unit * 6, unit * 2, unit);
        ctx.fillRect(x + unit * 9, y + unit * 6, unit * 2, unit);
        ctx.fillRect(x + unit * 7, y + unit * 8, unit * 2, unit);
        
        // Boss-exclusive cosmic consciousness indicator (fourth eye)
        ctx.fillStyle = `rgba(255, 255, 255, ${eyeGlow})`;
        ctx.fillRect(x + unit * 7, y + unit * 5, unit * 2, unit);
        
        // Crown of stars
        ctx.fillStyle = '#7a7aaa';
        ctx.fillRect(x + unit * 4, y + unit * 2, unit * 8, unit * 2);
        
        // Animated star crown points
        for (let i = 0; i < 5; i++) {
            const starTime = time + i * 0.5;
            const brightness = Math.sin(starTime) * 0.4 + 0.6;
            ctx.fillStyle = `rgba(255, 255, 200, ${brightness})`;
            ctx.fillRect(x + unit * (5 + i * 2), y + unit, unit, unit);
        }
        
        // Cosmic staff (contained within bounds)
        ctx.fillStyle = '#6a6a9a';
        ctx.fillRect(x + unit * 13, y + unit * 5, unit, unit * 10);
        
        // Staff orb with swirling energy (repositioned safely)
        const orbGlow = Math.sin(time * 3) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(100, 150, 255, ${orbGlow})`;
        ctx.fillRect(x + unit * 12, y + unit * 3, unit * 3, unit * 3);
        
        // Energy tendrils from staff (contained within bounds)
        for (let i = 0; i < 3; i++) {
            const angle = (time * 2 + i * 2.1) % (Math.PI * 2);
            const radius = unit * 1.5; // Reduced radius
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            
            const tendrilX = x + unit * 13 + dx;
            const tendrilY = y + unit * 4 + dy;
            
            // Only draw if within sprite bounds
            if (tendrilX >= x && tendrilX + unit <= x + size && tendrilY >= y && tendrilY + unit <= y + size) {
                ctx.fillStyle = `rgba(120, 170, 255, ${orbGlow * 0.7})`;
                ctx.fillRect(tendrilX, tendrilY, unit, unit);
            }
        }
    }
};

window.stellarArchitectSprites = stellarArchitectSprites;