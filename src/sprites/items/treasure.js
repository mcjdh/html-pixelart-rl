const treasureSprites = {
    gold: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Gold coin structure
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.GOLD_COIN, 5, 5, 6, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.GOLD_COIN, 4, 6, 8, 4);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.GOLD_COIN, 5, 10, 6, 1);
        
        // Coin shine/highlight
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.GOLD_SHINE, 6, 6, 2, 2);
    }
};