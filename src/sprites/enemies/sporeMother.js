const sporeMotherSprites = {
    default: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        const time = Date.now() * 0.002;
        
        // Massive boss body
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_BODY, 2, 8, 12, 8);
        
        // Giant cap structure
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_CAP, 0, 2, 16, 7);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_CAP, 2, 1, 12, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_CAP, 4, 0, 8, 1);
        
        // Boss crown ridges
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_CROWN, 6, 0, 4, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_CROWN, 4, 1, 8, 1);
        
        // Cap patterns
        const patterns = [
            {x: 2, y: 4, w: 3, h: 3},
            {x: 11, y: 4, w: 3, h: 3},
            {x: 6, y: 5, w: 4, h: 2}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_PATTERN, patterns);
        
        // Multiple ancient eyes
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_EYES, 4, 5, 2, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_EYES, 10, 5, 2, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_MOTHER_EYES, 7, 3, 2, 1);
        
        // Pulsating third eye (boss special)
        const eyePulse = Math.sin(time * 1.5) * 0.3 + 0.7;
        SpriteUtils.drawRect(ctx, x, y, unit, `rgba(255, 180, 255, ${eyePulse})`, 7, 6, 2, 2);
        
        // Pulsating core
        const pulse = Math.sin(time) * 0.5 + 0.5;
        const coreColor = `rgba(200, 150, 255, ${0.4 + pulse * 0.4})`;
        SpriteUtils.drawRect(ctx, x, y, unit, coreColor, 6, 10, 4, 4);
        
        // Mycelium tentacle roots
        const roots = [
            {x: 1, y: 14, w: 2, h: 2},
            {x: 13, y: 14, w: 2, h: 2},
            {x: 4, y: 15, w: 2, h: 1},
            {x: 10, y: 15, w: 2, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MYCELIUM_ROOT, roots);
        
        // Animated spore clouds
        for (let i = 0; i < 5; i++) {
            const angle = (time + i * 1.3) % (Math.PI * 2);
            const radius = unit * 2.5;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            const alpha = 0.2 + Math.sin(time + i * 0.7) * 0.15;
            
            const sporeX = x + unit * 8 + dx - unit;
            const sporeY = y + unit * 8 + dy - unit;
            
            // Bounds check for safety
            if (sporeX >= x && sporeX + unit * 2 <= x + size && 
                sporeY >= y && sporeY + unit * 2 <= y + size) {
                ctx.fillStyle = `rgba(180, 120, 220, ${alpha})`;
                ctx.fillRect(sporeX, sporeY, unit * 2, unit * 2);
            }
        }
        
        // Ancient runes
        const runes = [
            {x: 3, y: 2, w: 1, h: 1},
            {x: 12, y: 2, w: 1, h: 1},
            {x: 7, y: 6, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.ANCIENT_RUNE, runes);
        
        // Bioluminescent veins
        const veinGlow = Math.sin(time * 1.5) * 0.3 + 0.4;
        const veinColor = `rgba(150, 100, 255, ${veinGlow})`;
        SpriteUtils.drawRect(ctx, x, y, unit, veinColor, 5, 8, 6, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, veinColor, 8, 6, 1, 4);
    }
};

// Register globally
window.sporeMotherSprites = sporeMotherSprites;