const playerSprites = {
    // Main player sprite function that chooses facing direction
    default: (ctx, x, y, size, facing = 'down') => {
        const sprite = playerSprites.getDirectionalSprite(facing);
        sprite(ctx, x, y, size);
    },
    
    // Choose sprite based on facing direction
    getDirectionalSprite: (facing) => {
        switch(facing) {
            case 'up': return playerSprites.up;
            case 'down': return playerSprites.down;
            case 'left': return playerSprites.left;
            case 'right': return playerSprites.right;
            default: return playerSprites.down;
        }
    },
    
    // Player facing down (front view)
    down: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Head
        SpriteUtils.drawHead(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_HUMAN, 6, 2, 4, 4);
        
        // Long brown hair (flowing style)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 4, 2, 2, 6); // Left side
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 10, 2, 2, 6); // Right side
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 5, 1, 6, 2); // Top
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 5, 6, 6, 3); // Back flow
        
        // Eyes
        SpriteUtils.drawEyes(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_HUMAN, 7, 4, 1);
        
        // Tunic
        SpriteUtils.drawBody(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 5, 7, 6, 5);
        
        // Arms (skin + sleeves)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_HUMAN, 4, 8, 1, 3); // Left arm
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_HUMAN, 11, 8, 1, 3); // Right arm
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 3, 8, 2, 2); // Left sleeve
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 11, 8, 2, 2); // Right sleeve
        
        // Legs
        SpriteUtils.drawLegs(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_BROWN);
        
        // Boots
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_DARK, 5, 14, 2, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_DARK, 9, 14, 2, 1);
    },
    
    // Player facing up (back view)
    up: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Prominent hair (back view)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 4, 1, 8, 8);
        // Hair highlights
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_HIGHLIGHT, 5, 2, 1, 6);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_HIGHLIGHT, 7, 1, 2, 7);
        
        // Neck
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_HUMAN, 7, 6, 2, 1);
        
        // Tunic back
        SpriteUtils.drawBody(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 5, 7, 6, 5);
        
        // Arms (covered by sleeves)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 3, 8, 2, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 11, 8, 2, 3);
        
        // Legs
        SpriteUtils.drawLegs(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_BROWN);
        
        // Boots
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_DARK, 5, 14, 2, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_DARK, 9, 14, 2, 1);
    },
    
    // Player facing left (side view)
    left: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Head profile
        SpriteUtils.drawHead(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_HUMAN, 6, 2, 4, 4);
        
        // Hair flowing behind (to the right)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 5, 1, 6, 2); // Top
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 8, 1, 5, 2); // Flow back top
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 8, 3, 4, 5); // Flow back main
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 5, 6, 3, 3); // Side flow
        
        // Hair highlights
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_HIGHLIGHT, 10, 2, 1, 4);
        
        // Eye (profile view)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_HUMAN, 7, 4, 1, 1);
        
        // Tunic (side view)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 5, 7, 5, 5);
        
        // Visible arm with sleeve
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_HUMAN, 4, 8, 1, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 3, 8, 2, 2);
        
        // Legs (side profile)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_BROWN, 6, 12, 1, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_BROWN, 8, 12, 1, 3);
        
        // Boots
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_DARK, 5, 14, 2, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_DARK, 8, 14, 2, 1);
    },
    
    // Player facing right (side view)
    right: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Head profile
        SpriteUtils.drawHead(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_HUMAN, 6, 2, 4, 4);
        
        // Hair flowing behind (to the left)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 5, 1, 6, 2); // Top
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 3, 1, 5, 2); // Flow back top
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 4, 3, 4, 5); // Flow back main
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_BROWN, 8, 6, 3, 3); // Side flow
        
        // Hair highlights
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.HAIR_HIGHLIGHT, 5, 2, 1, 4);
        
        // Eye (profile view)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.EYES_HUMAN, 8, 4, 1, 1);
        
        // Tunic (side view)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 6, 7, 5, 5);
        
        // Visible arm with sleeve
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.SKIN_HUMAN, 11, 8, 1, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_GREEN, 11, 8, 2, 2);
        
        // Legs (side profile)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_BROWN, 7, 12, 1, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_BROWN, 9, 12, 1, 3);
        
        // Boots
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_DARK, 6, 14, 2, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.LEATHER_DARK, 9, 14, 2, 1);
    },
    
    warrior: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Head
        SpriteUtils.drawHead(ctx, x, y, unit, '#66a', 5, 2, 6, 5);
        
        // Armored body
        SpriteUtils.drawBody(ctx, x, y, unit, '#66a', 4, 7, 8, 5);
        
        // Armored arms
        SpriteUtils.drawArms(ctx, x, y, unit, '#66a', 8, 2, 3);
        
        // Armored legs
        SpriteUtils.drawLegs(ctx, x, y, unit, '#66a');
        
        // Helmet
        SpriteUtils.drawRect(ctx, x, y, unit, '#888', 4, 1, 8, 3);
        
        // Eyes through helmet
        SpriteUtils.drawEyes(ctx, x, y, unit, '#fff', 6, 4, 3);
    },
    
    mage: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Head
        SpriteUtils.drawHead(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_PURPLE, 5, 2, 6, 5);
        
        // Flowing robes
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_PURPLE, 3, 7, 10, 6);
        
        // Arms in robes
        SpriteUtils.drawArms(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_PURPLE, 8, 2, 3);
        
        // Wizard hat
        SpriteUtils.drawRect(ctx, x, y, unit, '#648', 5, 1, 6, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, '#648', 6, 0, 4, 2);
        
        // Eyes
        SpriteUtils.drawEyes(ctx, x, y, unit, '#fff', 6, 4, 3);
        
        // Magic staff
        SpriteUtils.drawWeapon(ctx, x, y, unit, '#841', '#44a', 14, 5, 6);
    },
    
    rogue: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Head in shadow
        SpriteUtils.drawHead(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_DARK, 5, 2, 6, 5);
        
        // Dark clothing
        SpriteUtils.drawBody(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_DARK, 4, 7, 8, 5);
        SpriteUtils.drawArms(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_DARK, 8, 2, 3);
        SpriteUtils.drawLegs(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CLOTH_DARK);
        
        // Hood
        SpriteUtils.drawRect(ctx, x, y, unit, '#222', 4, 1, 8, 4);
        
        // Glowing eyes
        SpriteUtils.drawEyes(ctx, x, y, unit, '#f80', 6, 4, 3);
        
        // Twin daggers
        SpriteUtils.drawRect(ctx, x, y, unit, '#ccc', 1, 9, 1, 2);
        SpriteUtils.drawRect(ctx, x, y, unit, '#ccc', 14, 9, 1, 2);
    }
};