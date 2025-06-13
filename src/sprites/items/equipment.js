const equipmentSprites = {
    sword: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Sword blade
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SWORD_BLADE, 7, 2, 2, 8);
        
        // Crossguard
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SWORD_GUARD, 5, 10, 6, 1);
        
        // Handle
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SWORD_HANDLE, 7, 11, 2, 3);
    },
    
    shield: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Shield frame
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SHIELD_FRAME, 4, 2, 8, 10);
        
        // Shield face
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SHIELD_FACE, 5, 3, 6, 8);
        
        // Shield emblem
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SHIELD_EMBLEM, 7, 6, 2, 2);
        
        // Shield grip
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SHIELD_FRAME, 6, 12, 4, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SHIELD_FRAME, 7, 14, 2, 1);
    },
    
    scroll: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Parchment
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SCROLL_PARCHMENT, 3, 4, 10, 8);
        
        // Ribbon ties
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SCROLL_RIBBON, 2, 3, 12, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SCROLL_RIBBON, 2, 11, 12, 2);
        
        // Text lines
        const textLines = [
            {x: 5, y: 6, w: 6, h: 1},
            {x: 5, y: 8, w: 5, h: 1},
            {x: 5, y: 10, w: 4, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SCROLL_TEXT, textLines);
    }
};