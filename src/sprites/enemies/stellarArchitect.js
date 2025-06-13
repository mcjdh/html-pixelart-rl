const stellarArchitectSprites = {
    default: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        const time = Date.now() * 0.001;
        
        // Massive cosmic entity body
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.STELLAR_BODY, 2, 4, 12, 10);
        
        // Cosmic robes with constellation patterns
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.STELLAR_ROBE, 0, 8, 16, 8);
        
        // Constellation patterns on robes
        const patterns = [
            {x: 3, y: 10, w: 2, h: 1},
            {x: 8, y: 12, w: 2, h: 1},
            {x: 11, y: 11, w: 2, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.STELLAR_PATTERN, patterns);
        
        // Multiple cosmic eyes (boss-exclusive)
        const eyeGlow = Math.sin(time * 2) * 0.3 + 0.7;
        const cosmicEyeColor = CONFIG.COLORS.SPRITES.COSMIC_EYE.replace('0.8', eyeGlow.toString());
        SpriteUtils.drawRect(ctx, x, y, unit, cosmicEyeColor, 5, 6, 2, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, cosmicEyeColor, 9, 6, 2, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, cosmicEyeColor, 7, 8, 2, 1);
        
        // Boss-exclusive cosmic consciousness indicator (fourth eye)
        const consciousnessColor = CONFIG.COLORS.SPRITES.CONSCIOUSNESS_EYE.replace('1.0', eyeGlow.toString());
        SpriteUtils.drawRect(ctx, x, y, unit, consciousnessColor, 7, 5, 2, 1);
        
        // Crown of stars
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.STELLAR_CROWN, 4, 2, 8, 2);
        
        // Animated star crown points
        for (let i = 0; i < 5; i++) {
            const starTime = time + i * 0.5;
            const brightness = Math.sin(starTime) * 0.4 + 0.6;
            const starColor = `rgba(255, 255, 200, ${brightness})`;
            SpriteUtils.drawRect(ctx, x, y, unit, starColor, 5 + i * 2, 1, 1, 1);
        }
        
        // Cosmic staff (contained within bounds)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.COSMIC_STAFF, 13, 5, 1, 10);
        
        // Staff orb with swirling energy
        const orbGlow = Math.sin(time * 3) * 0.5 + 0.5;
        const orbColor = `rgba(100, 150, 255, ${orbGlow})`;
        SpriteUtils.drawRect(ctx, x, y, unit, orbColor, 12, 3, 3, 3);
        
        // Energy tendrils from staff (contained within bounds)
        for (let i = 0; i < 3; i++) {
            const angle = (time * 2 + i * 2.1) % (Math.PI * 2);
            const radius = unit * 1.5;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            
            const tendrilX = x + unit * 13 + dx;
            const tendrilY = y + unit * 4 + dy;
            
            // Only draw if within sprite bounds
            if (tendrilX >= x && tendrilX + unit <= x + size && tendrilY >= y && tendrilY + unit <= y + size) {
                const tendrilColor = `rgba(120, 170, 255, ${orbGlow * 0.7})`;
                ctx.fillStyle = tendrilColor;
                ctx.fillRect(tendrilX, tendrilY, unit, unit);
            }
        }
    }
};

window.stellarArchitectSprites = stellarArchitectSprites;