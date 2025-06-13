const consumableSprites = {
    potion: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Glass bottle structure
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.GLASS_BOTTLE, 6, 4, 4, 10);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.GLASS_BOTTLE, 5, 6, 1, 6); // Left side
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.GLASS_BOTTLE, 10, 6, 1, 6); // Right side
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.GLASS_BOTTLE, 6, 13, 4, 2); // Bottom
        
        // Inner glass transparency effect
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.GLASS_INNER, 7, 5, 2, 8);
        
        // Health potion liquid
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.POTION_RED, 7, 7, 2, 6);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.POTION_SURFACE, 7, 7, 2, 1); // Surface
        
        // Cork stopper with texture
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CORK, 7, 4, 2, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CORK_TEXTURE, 7, 4, 1, 1);
        ctx.fillRect(x + 8*unit, y + 5*unit, 1*unit, 1*unit);
        
        // Paper label
        ctx.fillStyle = '#fed'; // Off-white paper
        ctx.fillRect(x + 6*unit, y + 9*unit, 4*unit, 3*unit);
        
        // Label text (simple cross for health)
        ctx.fillStyle = '#f44'; // Red cross
        ctx.fillRect(x + 7*unit, y + 10*unit, 2*unit, 1*unit); // Horizontal
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 3*unit); // Vertical part 1
        ctx.fillRect(x + 8*unit, y + 9*unit, 1*unit, 3*unit); // Vertical part 2
        
        // Glass highlights
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6*unit, y + 5*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 8*unit, 1*unit, 1*unit);
        
        // Bottle neck highlight
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 6*unit, y + 4*unit, 1*unit, 1*unit);
    }
};