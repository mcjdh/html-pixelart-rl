const treantSprites = {
    default: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
        // Main trunk
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 5, 7, 6, 9);
        
        // Root legs
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 3, 14, 3, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 10, 14, 3, 2);
        
        // Branch arms
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 2, 8, 3, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 11, 8, 3, 2);
        
        // Leafy canopy (main structure)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEAVES_GREEN, 3, 2, 10, 6);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEAVES_GREEN, 4, 1, 8, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEAVES_GREEN, 5, 0, 6, 1);
        
        // Leaf depth shading
        const leafPatches = [
            {x: 4, y: 3, w: 2, h: 3},
            {x: 10, y: 3, w: 2, h: 3},
            {x: 7, y: 5, w: 2, h: 2}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEAVES_DARK, leafPatches);
        
        // Face features
        SpriteUtils.drawEyes(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_TREANT, 6, 9, 3);
        
        // Mouth
        SpriteUtils.drawRect(ctx, x, y, unit, '#000000', 7, 11, 2, 1);
        
        // Bark texture details
        const barkTexture = [
            {x: 6, y: 8, w: 1, h: 2},
            {x: 9, y: 10, w: 1, h: 2},
            {x: 7, y: 13, w: 1, h: 2}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_DARK, barkTexture);
    },
    
    attacking: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
        // Trunk - leaning forward aggressively  
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 6, 7, 6, 9);
        
        // Roots - spread wide for stability
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 2, 14, 3, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 11, 14, 3, 2);
        
        // Branches - reaching menacingly
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 1, 9, 5, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, 12, 7, 3, 2);
        
        // Sharp branch claws
        const claws = [
            {x: 0, y: 9, w: 1, h: 1},
            {x: 0, y: 11, w: 1, h: 1},
            {x: 15, y: 7, w: 1, h: 1},
            {x: 15, y: 9, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BARK_TREANT, claws);
        
        // Rustling canopy
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEAVES_GREEN, 4, 2, 10, 5);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEAVES_GREEN, 3, 3, 2, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEAVES_GREEN, 13, 3, 2, 3);
        
        // Darker leaf shadows
        const leafShadows = [
            {x: 5, y: 3, w: 2, h: 3},
            {x: 11, y: 3, w: 2, h: 3}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEAVES_DARK, leafShadows);
        
        // Angry glowing eyes
        SpriteUtils.drawEyes(ctx, x, y, unit, '#ff6666', 7, 9, 3);
        
        // Gaping mouth
        SpriteUtils.drawRect(ctx, x, y, unit, '#000000', 8, 11, 3, 2);
        
        // Sharp teeth
        SpriteUtils.drawRect(ctx, x, y, unit, '#ffffff', 8, 11, 1, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, '#ffffff', 10, 11, 1, 1);
    }
};

// Register treant sprites globally
window.treantSprites = treantSprites;