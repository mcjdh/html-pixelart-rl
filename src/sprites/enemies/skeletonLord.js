const skeletonLordSprites = {
    default: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
        // Animation timing (preserve original complex animation)
        const time = Date.now() * 0.004;
        const seed = (x + y) * 0.01;
        const darkPulse = Math.sin(time + seed) * 0.3 + 0.7;
        const energyFlicker = Math.sin(time * 2 + seed) * 0.5 + 0.5;
        
        // Imposing skull structure
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BONE_LORD, 3, 1, 10, 8);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BONE_LORD, 2, 3, 2, 4); // Jaw left
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BONE_LORD, 12, 3, 2, 4); // Jaw right
        
        // Crown horns
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BONE_LORD_DARK, 5, 0, 2, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BONE_LORD_DARK, 9, 0, 2, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BONE_LORD_DARK, 7, 0, 2, 1);
        
        // Dark energy crown jewel
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.DARK_ENERGY, 7, 0, 2, 1);
        
        // Expanded ribcage structure
        const ribs = [
            {x: 5, y: 9, w: 6, h: 1},
            {x: 4, y: 10, w: 8, h: 1},
            {x: 5, y: 11, w: 6, h: 1},
            {x: 4, y: 12, w: 8, h: 1},
            {x: 5, y: 13, w: 6, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_SKELETON, ribs);
        
        // Powerful arms
        SpriteUtils.drawRect(ctx, x, y, unit, '#d8d8d8', 2, 9, 2, 6);
        SpriteUtils.drawRect(ctx, x, y, unit, '#d8d8d8', 12, 9, 2, 6);
        
        // Ancient weapon (left hand)
        SpriteUtils.drawRect(ctx, x, y, unit, '#8b4513', 2, 11, 1, 3); // Handle
        SpriteUtils.drawRect(ctx, x, y, unit, '#c0c0c0', 2, 8, 1, 4); // Blade
        
        // Shield (right hand)
        SpriteUtils.drawRect(ctx, x, y, unit, '#654321', 12, 10, 2, 4); // Wood
        SpriteUtils.drawRect(ctx, x, y, unit, '#888', 12, 10, 2, 1); // Top rim
        SpriteUtils.drawRect(ctx, x, y, unit, '#888', 12, 13, 2, 1); // Bottom rim
        
        // Strong leg bones
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_SKELETON, 5, 14, 2, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_SKELETON, 9, 14, 2, 2);
        
        // Animated glowing eyes
        const eyeGlowR = Math.floor(255 * (0.7 + energyFlicker * 0.3));
        const eyeGlowG = Math.floor(50 * energyFlicker);
        SpriteUtils.drawRect(ctx, x, y, unit, '#000', 5, 3, 2, 2); // Socket base
        SpriteUtils.drawRect(ctx, x, y, unit, '#000', 9, 3, 2, 2);
        
        const eyeColor = `rgb(${eyeGlowR}, ${eyeGlowG}, 0)`;
        SpriteUtils.drawRect(ctx, x, y, unit, eyeColor, 5, 3, 2, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, eyeColor, 9, 3, 2, 2);
        
        // Eye intensity peaks
        if (energyFlicker > 0.8) {
            SpriteUtils.drawRect(ctx, x, y, unit, 'rgba(255, 100, 100, 0.9)', 6, 4, 1, 1);
            SpriteUtils.drawRect(ctx, x, y, unit, 'rgba(255, 100, 100, 0.9)', 10, 4, 1, 1);
        }
        
        // Dark energy sparks
        if (darkPulse > 0.8) {
            const sparkColor = 'rgba(80, 0, 80, 0.9)';
            const sparks = [
                {x: 4, y: 6, w: 1, h: 1},
                {x: 11, y: 8, w: 1, h: 1},
                {x: 6, y: 12, w: 1, h: 1}
            ];
            SpriteUtils.drawMarkings(ctx, x, y, unit, sparkColor, sparks);
        }
        
        // Tattered cloak
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOAK_DARK, 6, 15, 4, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOAK_DARK, 5, 15, 6, 1);
        
        // Battle scars
        const scars = [
            {x: 4, y: 2, w: 1, h: 3},
            {x: 11, y: 4, w: 1, h: 2}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BONE_LORD_SCAR, scars);
    }
};

window.skeletonLordSprites = skeletonLordSprites;