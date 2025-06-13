const fungalKnightSprites = {
    default: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
        // Armored mushroom body
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_ARMOR, 5, 6, 6, 8);
        
        // Mushroom cap helmet
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_HELM, 3, 2, 10, 5);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_HELM, 4, 1, 8, 1);
        
        // Armor plates on cap
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_PLATE, 3, 3, 3, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_PLATE, 10, 3, 3, 3);
        
        // Glowing eyes through helmet
        SpriteUtils.drawEyes(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_GLOW, 6, 4, 3);
        
        // Armored arms
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_ARMOR, 2, 8, 2, 4);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_ARMOR, 12, 8, 2, 4);
        
        // Spore sword
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_WEAPON, 13, 4, 1, 6); // Blade
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SPORE_WEAPON, 12, 5, 3, 1); // Crossguard
        
        // Shield with emblem
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.DARK_ARMOR, 1, 7, 3, 5);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MUSHROOM_CAP, 2, 8, 1, 3); // Mushroom emblem
        
        // Armored legs
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.DARK_ARMOR, 6, 13, 2, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.DARK_ARMOR, 8, 13, 2, 3);
        
        // Animated spore aura
        const time = Date.now() * 0.003;
        const alpha = Math.sin(time) * 0.15 + 0.2;
        const auraColor = `rgba(140, 100, 180, ${alpha})`;
        
        for (let i = 0; i < 3; i++) {
            const angle = (time + i * 2.1) % (Math.PI * 2);
            const dx = Math.cos(angle) * unit * 2;
            const dy = Math.sin(angle) * unit * 2;
            ctx.fillStyle = auraColor;
            ctx.fillRect(x + unit * 8 + dx, y + unit * 8 + dy, unit, unit);
        }
    }
};

// Register globally
window.fungalKnightSprites = fungalKnightSprites;