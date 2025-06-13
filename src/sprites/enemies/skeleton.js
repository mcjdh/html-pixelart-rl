const skeletonSprites = {
    default: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Skull
        SpriteUtils.drawHead(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_SKELETON, 5, 2, 6, 6);
        
        // Ribcage structure
        const ribMarkings = [
            {x: 7, y: 8, w: 2, h: 1},  // Top rib
            {x: 6, y: 9, w: 4, h: 1},  // Wide rib
            {x: 7, y: 10, w: 2, h: 1}, // Middle rib
            {x: 6, y: 11, w: 4, h: 1}  // Bottom rib
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_SKELETON, ribMarkings);
        
        // Arms (bone structure)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_SKELETON, 4, 8, 1, 4); // Left arm
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_SKELETON, 11, 8, 1, 4); // Right arm
        
        // Legs (thin bone structure)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_SKELETON, 6, 12, 1, 3); // Left leg
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_SKELETON, 9, 12, 1, 3); // Right leg
        
        // Dark eye sockets
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_SKELETON, 6, 4, 2, 2); // Left socket
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_SKELETON, 8, 4, 2, 2); // Right socket
    }
};