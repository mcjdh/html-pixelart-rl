const cosmicGuardianSprites = {
    default: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        const time = Date.now() * 0.002;
        
        // Celestial armored body
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.COSMIC_ARMOR, 4, 6, 8, 8);
        
        // Stellar armor plates
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.COSMIC_PLATE, 3, 5, 3, 4);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.COSMIC_PLATE, 10, 5, 3, 4);
        
        // Constellation crown
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.COSMIC_CROWN, 5, 3, 6, 3);
        
        // Glowing constellation points
        const glow = Math.sin(time) * 0.4 + 0.6;
        const glowColor = `rgba(150, 180, 255, ${glow})`;
        SpriteUtils.drawRect(ctx, x, y, unit, glowColor, 6, 4, 1, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, glowColor, 9, 4, 1, 1);
        
        // Star staff
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.COSMIC_STAFF, 13, 7, 1, 6);
        const staffGlow = `rgba(200, 220, 255, ${glow})`;
        SpriteUtils.drawRect(ctx, x, y, unit, staffGlow, 12, 6, 3, 2);
        
        // Cosmic legs
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.COSMIC_ARMOR, 6, 13, 2, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.COSMIC_ARMOR, 8, 13, 2, 3);
    }
};

window.cosmicGuardianSprites = cosmicGuardianSprites;