const goblinSprites = {
    default: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Head with pointed ears
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 4, 3, 8, 6);
        SpriteUtils.drawPointedEars(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN);
        
        // Body (crude clothing)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_BROWN, 5, 9, 6, 4);
        
        // Arms and legs (green skin)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 3, 9, 2, 2); // Left arm
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 11, 9, 2, 2); // Right arm
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 5, 13, 2, 2); // Left leg
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 9, 13, 2, 2); // Right leg
        
        // Menacing red eyes
        SpriteUtils.drawEyes(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_GOBLIN_RED, 5, 5, 5);
        
        // Crude fangs
        SpriteUtils.drawFangs(ctx, x, y, unit, CONFIG.COLORS.SPRITES.TEETH_FANG, 6, 9, 7);
        
        // Simple weapon (club)
        SpriteUtils.drawWeapon(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WOOD_HANDLE, CONFIG.COLORS.SPRITES.METAL_CROSSGUARD, 13, 7, 4);
    },
    
    warrior: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Head with pointed ears
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 4, 3, 8, 6);
        SpriteUtils.drawPointedEars(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN);
        
        // Crude armor body
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.ARMOR_METAL, 5, 9, 6, 4);
        
        // Arms with armor pieces
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 3, 9, 2, 2); // Left arm skin
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 11, 9, 2, 2); // Right arm skin
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.ARMOR_METAL, 3, 9, 2, 1); // Left armor
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.ARMOR_METAL, 11, 9, 2, 1); // Right armor
        
        // Legs
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 5, 13, 2, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 9, 13, 2, 2);
        
        // Crude helmet with spikes
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.ARMOR_DARK, 4, 2, 8, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.ARMOR_DARK, 6, 1, 1, 1); // Left spike
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.ARMOR_DARK, 9, 1, 1, 1); // Right spike
        
        // Glowing red eyes (visible through helmet)
        SpriteUtils.drawEyes(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_GOBLIN_RED, 5, 5, 5);
        
        // Crude sword
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.METAL_BLADE, 13, 8, 1, 4); // Blade
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WOOD_HANDLE, 13, 12, 1, 2); // Handle
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.METAL_CROSSGUARD, 12, 11, 3, 1); // Crossguard
    },
    
    shaman: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Head with pointed ears
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 4, 3, 8, 6);
        SpriteUtils.drawPointedEars(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN);
        
        // Dark ritual robes
        SpriteUtils.drawRect(ctx, x, y, unit, '#201', 4, 9, 8, 5);
        
        // Arms (skin showing)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 2, 9, 2, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_GOBLIN, 12, 9, 2, 3);
        
        // Ritual face markings
        const markings = [
            {x: 4, y: 4, w: 1, h: 1},
            {x: 11, y: 4, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MAGIC_PURPLE, markings);
        
        // Magical glowing eyes
        SpriteUtils.drawEyes(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_GOBLIN_MAGIC, 5, 5, 5);
        
        // Bone staff
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BONE_WHITE, 14, 7, 1, 6);
        
        // Skull totem
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.BONE_SKULL, 13, 6, 3, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_SKELETON, 13, 6, 1, 1); // Left socket
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_SKELETON, 15, 6, 1, 1); // Right socket
        
        // Magical energy wisps
        const wisps = [
            {x: 1, y: 8, w: 1, h: 1},
            {x: 15, y: 9, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MAGIC_WISP, wisps);
    }
};