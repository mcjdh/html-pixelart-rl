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
        const unit = size / 16;
        
        // Skin tone
        ctx.fillStyle = '#dca';
        // Head
        ctx.fillRect(x + 6*unit, y + 2*unit, 4*unit, 4*unit);
        
        // Long brown hair
        ctx.fillStyle = '#643';
        // Hair sides
        ctx.fillRect(x + 4*unit, y + 2*unit, 2*unit, 6*unit);
        ctx.fillRect(x + 10*unit, y + 2*unit, 2*unit, 6*unit);
        // Hair top
        ctx.fillRect(x + 5*unit, y + 1*unit, 6*unit, 2*unit);
        // Hair back flow
        ctx.fillRect(x + 5*unit, y + 6*unit, 6*unit, 3*unit);
        
        // Eyes
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 7*unit, y + 4*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 4*unit, 1*unit, 1*unit);
        
        // Tunic (green-brown)
        ctx.fillStyle = '#684';
        ctx.fillRect(x + 5*unit, y + 7*unit, 6*unit, 5*unit);
        
        // Arms
        ctx.fillStyle = '#dca';
        ctx.fillRect(x + 4*unit, y + 8*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 1*unit, 3*unit);
        
        // Tunic sleeves
        ctx.fillStyle = '#684';
        ctx.fillRect(x + 3*unit, y + 8*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 2*unit, 2*unit);
        
        // Legs/pants (brown)
        ctx.fillStyle = '#542';
        ctx.fillRect(x + 6*unit, y + 12*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 1*unit, 3*unit);
        
        // Boots
        ctx.fillStyle = '#321';
        ctx.fillRect(x + 5*unit, y + 14*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 14*unit, 2*unit, 1*unit);
    },
    
    // Player facing up (back view)
    up: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Long brown hair (back view - more prominent)
        ctx.fillStyle = '#643';
        ctx.fillRect(x + 4*unit, y + 1*unit, 8*unit, 8*unit);
        // Hair highlights
        ctx.fillStyle = '#754';
        ctx.fillRect(x + 5*unit, y + 2*unit, 1*unit, 6*unit);
        ctx.fillRect(x + 7*unit, y + 1*unit, 2*unit, 7*unit);
        
        // Small bit of skin (neck)
        ctx.fillStyle = '#dca';
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 1*unit);
        
        // Tunic (back view)
        ctx.fillStyle = '#684';
        ctx.fillRect(x + 5*unit, y + 7*unit, 6*unit, 5*unit);
        
        // Arms
        ctx.fillStyle = '#684';
        ctx.fillRect(x + 3*unit, y + 8*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 2*unit, 3*unit);
        
        // Legs/pants
        ctx.fillStyle = '#542';
        ctx.fillRect(x + 6*unit, y + 12*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 1*unit, 3*unit);
        
        // Boots
        ctx.fillStyle = '#321';
        ctx.fillRect(x + 5*unit, y + 14*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 14*unit, 2*unit, 1*unit);
    },
    
    // Player facing left (side view)
    left: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Head profile (facing left)
        ctx.fillStyle = '#dca';
        ctx.fillRect(x + 6*unit, y + 2*unit, 4*unit, 4*unit);
        
        // Long hair flowing behind (to the right)
        ctx.fillStyle = '#643';
        // Hair on top of head
        ctx.fillRect(x + 5*unit, y + 1*unit, 6*unit, 2*unit);
        // Hair flowing back
        ctx.fillRect(x + 8*unit, y + 1*unit, 5*unit, 2*unit);
        ctx.fillRect(x + 8*unit, y + 3*unit, 4*unit, 5*unit);
        ctx.fillRect(x + 5*unit, y + 6*unit, 3*unit, 3*unit);
        
        // Hair highlights
        ctx.fillStyle = '#754';
        ctx.fillRect(x + 10*unit, y + 2*unit, 1*unit, 4*unit);
        
        // Eye (visible on left side)
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 7*unit, y + 4*unit, 1*unit, 1*unit);
        
        // Tunic
        ctx.fillStyle = '#684';
        ctx.fillRect(x + 5*unit, y + 7*unit, 5*unit, 5*unit);
        
        // Arms (one visible in front)
        ctx.fillStyle = '#dca';
        ctx.fillRect(x + 4*unit, y + 8*unit, 1*unit, 3*unit);
        ctx.fillStyle = '#684';
        ctx.fillRect(x + 3*unit, y + 8*unit, 2*unit, 2*unit);
        
        // Legs
        ctx.fillStyle = '#542';
        ctx.fillRect(x + 6*unit, y + 12*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 8*unit, y + 12*unit, 1*unit, 3*unit);
        
        // Boots
        ctx.fillStyle = '#321';
        ctx.fillRect(x + 5*unit, y + 14*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 14*unit, 2*unit, 1*unit);
    },
    
    // Player facing right (side view)
    right: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Head profile (facing right)
        ctx.fillStyle = '#dca';
        ctx.fillRect(x + 6*unit, y + 2*unit, 4*unit, 4*unit);
        
        // Long hair flowing behind (to the left)
        ctx.fillStyle = '#643';
        // Hair on top of head
        ctx.fillRect(x + 5*unit, y + 1*unit, 6*unit, 2*unit);
        // Hair flowing back
        ctx.fillRect(x + 3*unit, y + 1*unit, 5*unit, 2*unit);
        ctx.fillRect(x + 4*unit, y + 3*unit, 4*unit, 5*unit);
        ctx.fillRect(x + 8*unit, y + 6*unit, 3*unit, 3*unit);
        
        // Hair highlights
        ctx.fillStyle = '#754';
        ctx.fillRect(x + 5*unit, y + 2*unit, 1*unit, 4*unit);
        
        // Eye (visible on right side)
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 8*unit, y + 4*unit, 1*unit, 1*unit);
        
        // Tunic
        ctx.fillStyle = '#684';
        ctx.fillRect(x + 6*unit, y + 7*unit, 5*unit, 5*unit);
        
        // Arms (one visible in front)
        ctx.fillStyle = '#dca';
        ctx.fillRect(x + 11*unit, y + 8*unit, 1*unit, 3*unit);
        ctx.fillStyle = '#684';
        ctx.fillRect(x + 11*unit, y + 8*unit, 2*unit, 2*unit);
        
        // Legs
        ctx.fillStyle = '#542';
        ctx.fillRect(x + 7*unit, y + 12*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 1*unit, 3*unit);
        
        // Boots
        ctx.fillStyle = '#321';
        ctx.fillRect(x + 6*unit, y + 14*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 14*unit, 2*unit, 1*unit);
    },
    
    warrior: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#66a';
        // Head
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 5*unit);
        // Body (armored)
        ctx.fillRect(x + 4*unit, y + 7*unit, 8*unit, 5*unit);
        // Arms (armored)
        ctx.fillRect(x + 2*unit, y + 8*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 12*unit, y + 8*unit, 2*unit, 3*unit);
        // Legs (armored)
        ctx.fillRect(x + 5*unit, y + 12*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 2*unit, 3*unit);
        // Helmet
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 4*unit, y + 1*unit, 8*unit, 3*unit);
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6*unit, y + 4*unit, unit, unit);
        ctx.fillRect(x + 9*unit, y + 4*unit, unit, unit);
    },
    
    mage: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#a4a';
        // Head
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 5*unit);
        // Robe body
        ctx.fillRect(x + 3*unit, y + 7*unit, 10*unit, 6*unit);
        // Arms
        ctx.fillRect(x + 2*unit, y + 8*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 12*unit, y + 8*unit, 2*unit, 3*unit);
        // Hat
        ctx.fillStyle = '#648';
        ctx.fillRect(x + 5*unit, y + 1*unit, 6*unit, 3*unit);
        ctx.fillRect(x + 6*unit, y + 0*unit, 4*unit, 2*unit);
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6*unit, y + 4*unit, unit, unit);
        ctx.fillRect(x + 9*unit, y + 4*unit, unit, unit);
        // Staff
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 14*unit, y + 6*unit, unit, 6*unit);
        ctx.fillStyle = '#44a';
        ctx.fillRect(x + 13*unit, y + 5*unit, 3*unit, 2*unit);
    },
    
    rogue: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#333';
        // Head
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 5*unit);
        // Body (dark clothes)
        ctx.fillRect(x + 4*unit, y + 7*unit, 8*unit, 5*unit);
        // Arms
        ctx.fillRect(x + 2*unit, y + 8*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 12*unit, y + 8*unit, 2*unit, 3*unit);
        // Legs
        ctx.fillRect(x + 5*unit, y + 12*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 2*unit, 3*unit);
        // Hood
        ctx.fillStyle = '#222';
        ctx.fillRect(x + 4*unit, y + 1*unit, 8*unit, 4*unit);
        // Eyes (glowing)
        ctx.fillStyle = '#f80';
        ctx.fillRect(x + 6*unit, y + 4*unit, unit, unit);
        ctx.fillRect(x + 9*unit, y + 4*unit, unit, unit);
        // Daggers
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x + 1*unit, y + 9*unit, unit, 2*unit);
        ctx.fillRect(x + 14*unit, y + 9*unit, unit, 2*unit);
    }
};