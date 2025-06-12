const mushroomSprites = {
    wall: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Base rock wall with fungal overgrowth
        ctx.fillStyle = '#3a2f4a';
        ctx.fillRect(x, y, size, size);
        
        // Darker cracks
        ctx.fillStyle = '#2a1f3a';
        ctx.fillRect(x + unit * 3, y, unit, size);
        ctx.fillRect(x + unit * 10, y, unit * 2, size);
        ctx.fillRect(x, y + unit * 7, size, unit);
        
        // Fungal growth patches
        ctx.fillStyle = '#5a4a6a';
        ctx.fillRect(x + unit * 2, y + unit * 2, unit * 3, unit * 2);
        ctx.fillRect(x + unit * 8, y + unit * 10, unit * 4, unit * 3);
        
        // Glowing spores (position-based animation)
        const time = Date.now() * 0.002;
        const seed = (x + y) * 0.01;
        const glow = Math.sin(time + seed) * 0.5 + 0.5;
        
        ctx.fillStyle = `rgba(180, 120, 255, ${0.3 + glow * 0.4})`;
        ctx.fillRect(x + unit * 5, y + unit * 4, unit, unit);
        ctx.fillRect(x + unit * 12, y + unit * 8, unit, unit);
    },
    
    floor: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Base mycelium floor
        ctx.fillStyle = '#4a3f5a';
        ctx.fillRect(x, y, size, size);
        
        // Mycelium network patterns
        ctx.fillStyle = '#5f4f6f';
        ctx.fillRect(x + unit * 2, y + unit * 2, unit * 2, unit);
        ctx.fillRect(x + unit * 8, y + unit * 6, unit * 3, unit);
        ctx.fillRect(x + unit * 5, y + unit * 11, unit * 2, unit * 2);
        
        // Darker spots
        ctx.fillStyle = '#3a2f4a';
        ctx.fillRect(x + unit * 10, y + unit * 3, unit, unit);
        ctx.fillRect(x + unit * 4, y + unit * 8, unit, unit);
        
        // Bioluminescent veins
        const variation = ((x * 31 + y * 17) % 1000) / 1000;
        if (variation > 0.8) {
            ctx.fillStyle = 'rgba(120, 180, 255, 0.3)';
            ctx.fillRect(x + unit * 6, y + unit * 7, unit * 4, unit);
        }
    },
    
    mushroom: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Stem
        ctx.fillStyle = '#8a7f9a';
        ctx.fillRect(x + unit * 6, y + unit * 8, unit * 4, unit * 8);
        
        // Stem details
        ctx.fillStyle = '#7a6f8a';
        ctx.fillRect(x + unit * 7, y + unit * 8, unit, unit * 8);
        
        // Cap
        ctx.fillStyle = '#b878d8';
        ctx.fillRect(x + unit * 3, y + unit * 3, unit * 10, unit * 6);
        ctx.fillRect(x + unit * 4, y + unit * 2, unit * 8, unit);
        ctx.fillRect(x + unit * 5, y + unit * 1, unit * 6, unit);
        
        // Cap highlights
        ctx.fillStyle = '#c898e8';
        ctx.fillRect(x + unit * 5, y + unit * 3, unit * 3, unit * 2);
        ctx.fillRect(x + unit * 6, y + unit * 2, unit * 2, unit);
        
        // Spots on cap
        ctx.fillStyle = '#e8c8f8';
        ctx.fillRect(x + unit * 9, y + unit * 4, unit, unit);
        ctx.fillRect(x + unit * 5, y + unit * 5, unit, unit);
        ctx.fillRect(x + unit * 11, y + unit * 6, unit, unit);
        
        // Glowing spores underneath
        const time = Date.now() * 0.003;
        const glowAlpha = Math.sin(time) * 0.3 + 0.4;
        ctx.fillStyle = `rgba(200, 150, 255, ${glowAlpha})`;
        ctx.fillRect(x + unit * 5, y + unit * 9, unit, unit);
        ctx.fillRect(x + unit * 10, y + unit * 9, unit, unit);
    },
    
    spores: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.001;
        const seed = (x + y) * 0.02;
        
        // Floating spore particles
        for (let i = 0; i < 3; i++) {
            const offset = Math.sin(time + seed + i * 2) * unit * 2;
            const yOffset = (time * 0.5 + i * 3) % 16;
            const alpha = Math.sin(time + i) * 0.3 + 0.5;
            
            ctx.fillStyle = `rgba(180, 120, 255, ${alpha})`;
            ctx.fillRect(
                x + unit * 4 + offset + i * unit * 4, 
                y + unit * yOffset, 
                unit, 
                unit
            );
        }
    },
    
    giantMushroom: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Thick stem
        ctx.fillStyle = '#6a5f7a';
        ctx.fillRect(x + unit * 4, y + unit * 10, unit * 8, unit * 6);
        
        // Stem texture
        ctx.fillStyle = '#5a4f6a';
        ctx.fillRect(x + unit * 5, y + unit * 10, unit * 2, unit * 6);
        ctx.fillRect(x + unit * 9, y + unit * 11, unit, unit * 5);
        
        // Large cap
        ctx.fillStyle = '#9868b8';
        ctx.fillRect(x, y + unit * 4, size, unit * 7);
        ctx.fillRect(x + unit * 2, y + unit * 2, unit * 12, unit * 2);
        ctx.fillRect(x + unit * 4, y + unit, unit * 8, unit);
        
        // Cap shading
        ctx.fillStyle = '#8858a8';
        ctx.fillRect(x + unit * 2, y + unit * 6, unit * 12, unit * 3);
        
        // Bioluminescent patches
        ctx.fillStyle = '#b888d8';
        ctx.fillRect(x + unit * 3, y + unit * 4, unit * 2, unit * 2);
        ctx.fillRect(x + unit * 10, y + unit * 5, unit * 2, unit);
        ctx.fillRect(x + unit * 6, y + unit * 3, unit, unit);
    }
};

// Register globally
window.mushroomSprites = mushroomSprites;