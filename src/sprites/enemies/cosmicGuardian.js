const cosmicGuardianSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.002;
        
        // Armored celestial body
        ctx.fillStyle = '#4a4a7a';
        ctx.fillRect(x + unit * 4, y + unit * 6, unit * 8, unit * 8);
        
        // Stellar armor plates
        ctx.fillStyle = '#6a6a9a';
        ctx.fillRect(x + unit * 3, y + unit * 5, unit * 3, unit * 4);
        ctx.fillRect(x + unit * 10, y + unit * 5, unit * 3, unit * 4);
        
        // Constellation crown
        ctx.fillStyle = '#8a8aba';
        ctx.fillRect(x + unit * 5, y + unit * 3, unit * 6, unit * 3);
        
        // Glowing constellation points on crown
        const glow = Math.sin(time) * 0.4 + 0.6;
        ctx.fillStyle = `rgba(150, 180, 255, ${glow})`;
        ctx.fillRect(x + unit * 6, y + unit * 4, unit, unit);
        ctx.fillRect(x + unit * 9, y + unit * 4, unit, unit);
        
        // Star staff
        ctx.fillStyle = '#7a7aaa';
        ctx.fillRect(x + unit * 13, y + unit * 7, unit, unit * 6);
        ctx.fillStyle = `rgba(200, 220, 255, ${glow})`;
        ctx.fillRect(x + unit * 12, y + unit * 6, unit * 3, unit * 2);
        
        // Legs
        ctx.fillStyle = '#4a4a7a';
        ctx.fillRect(x + unit * 6, y + unit * 13, unit * 2, unit * 3);
        ctx.fillRect(x + unit * 8, y + unit * 13, unit * 2, unit * 3);
    }
};

window.cosmicGuardianSprites = cosmicGuardianSprites;