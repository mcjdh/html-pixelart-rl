const sporelingSprites = {
    default: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
        // Mushroom cap body
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_CAP, 4, 4, 8, 8);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_CAP, 3, 5, 10, 6);
        
        // Cap details and shading
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_CAP_DARK, 5, 6, 6, 3);
        
        // Light spots on cap
        const spots = [
            {x: 5, y: 5, w: 2, h: 1},
            {x: 9, y: 6, w: 1, h: 1},
            {x: 6, y: 8, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_CAP_LIGHT, spots);
        
        // Stem legs
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_STEM, 5, 11, 2, 4);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_STEM, 9, 11, 2, 4);
        
        // Glowing eyes
        SpriteUtils.drawEyes(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_GLOW, 6, 7, 3);
        
        // Animated spore cloud effect
        const time = Date.now() * 0.004;
        const alpha = Math.sin(time) * 0.2 + 0.3;
        ctx.fillStyle = `rgba(180, 140, 220, ${alpha})`;
        SpriteUtils.drawRect(ctx, x, y, unit, ctx.fillStyle, 2, 2, 2, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, ctx.fillStyle, 12, 3, 2, 2);
    }
};

// Register globally
window.sporelingSprites = sporelingSprites;