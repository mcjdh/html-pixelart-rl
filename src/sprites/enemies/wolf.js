const wolfSprites = {
    default: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
        // Main body
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_BASE, 3, 8, 10, 5);
        
        // Head with muzzle
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_BASE, 2, 9, 4, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_BASE, 1, 10, 2, 2); // Extended muzzle
        
        // Quadruped legs
        SpriteUtils.drawQuadrupedLegs(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_BASE);
        
        // Bushy tail
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_BASE, 13, 8, 2, 3);
        
        // Pointed ears
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_LIGHT, 3, 8, 1, 2); // Left ear
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_LIGHT, 5, 8, 1, 2); // Right ear
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_LIGHT, 3, 7, 1, 1); // Left tip
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_LIGHT, 5, 7, 1, 1); // Right tip
        
        // Eyes
        SpriteUtils.drawEyes(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_WOLF, 3, 10, 1);
        
        // Nose
        SpriteUtils.drawRect(ctx, x, y, unit, '#000', 1, 11, 1, 1);
        
        // Fangs
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.TEETH_WHITE, 2, 11, 1, 1);
        
        // Natural markings
        const markings = [
            {x: 6, y: 9, w: 3, h: 2},  // Back stripe
            {x: 10, y: 10, w: 2, h: 1}, // Side marking
            {x: 13, y: 9, w: 2, h: 1}   // Tail tip
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_DARK, markings);
        
        // Chest fur
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FUR_WOLF_CHEST, 4, 11, 2, 2);
    },
    
    attacking: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
        // Body - crouched stance
        SpriteUtils.drawRect(ctx, x, y, unit, '#696969', 3, 9, 10, 5);
        
        // Head - lowered aggressively
        SpriteUtils.drawRect(ctx, x, y, unit, '#696969', 1, 10, 3, 3);
        
        // Legs - spread for pouncing
        const positions = [3, 6, 9, 12];
        positions.forEach(xPos => {
            SpriteUtils.drawRect(ctx, x, y, unit, '#696969', xPos, 14, 2, 2);
        });
        
        // Tail - raised in aggression
        SpriteUtils.drawRect(ctx, x, y, unit, '#696969', 13, 8, 2, 2);
        
        // Flattened ears
        SpriteUtils.drawRect(ctx, x, y, unit, '#696969', 1, 9, 1, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, '#696969', 3, 9, 1, 1);
        
        // Angry red eyes
        SpriteUtils.drawRect(ctx, x, y, unit, '#ff4444', 2, 11, 1, 1);
        
        // Snarling mouth with visible teeth
        const teeth = [
            {x: 1, y: 12, w: 1, h: 1},
            {x: 2, y: 12, w: 1, h: 1},
            {x: 3, y: 12, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, '#ffffff', teeth);
        
        // Darker fur patches for aggressive look
        const furPatches = [
            {x: 6, y: 10, w: 2, h: 2},
            {x: 10, y: 11, w: 2, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, '#404040', furPatches);
    }
};

// Register wolf sprites globally
window.wolfSprites = wolfSprites;