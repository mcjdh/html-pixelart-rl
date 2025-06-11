const terrainSprites = {
    // Main floor sprite function that chooses variant based on position
    floor: (ctx, x, y, size) => {
        const variant = terrainSprites.getFloorVariant(x, y);
        variant(ctx, x, y, size);
    },
    
    // Main wall sprite function that chooses variant based on position  
    wall: (ctx, x, y, size) => {
        const variant = terrainSprites.getWallVariant(x, y);
        variant(ctx, x, y, size);
    },
    
    // Choose floor variant based on tile position for consistent variety
    getFloorVariant: (x, y) => {
        const seed = (x * 31 + y * 17) % 4;
        switch(seed) {
            case 0: return terrainSprites.floor1;
            case 1: return terrainSprites.floor2;
            case 2: return terrainSprites.floor3;
            default: return terrainSprites.floor4;
        }
    },
    
    // Choose wall variant based on tile position
    getWallVariant: (x, y) => {
        const seed = (x * 23 + y * 41) % 3;
        switch(seed) {
            case 0: return terrainSprites.wall1;
            case 1: return terrainSprites.wall2;
            default: return terrainSprites.wall3;
        }
    },
    
    // Stone floor variant 1 - basic texture
    floor1: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Base floor color
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y, size, size);
        
        // Stone texture details
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 2*unit, y + 1*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 2*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 3*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 5*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 14*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 1*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 10*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 3*unit, y + 13*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 14*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 15*unit, 1*unit, 1*unit);
        
        // Highlight spots
        ctx.fillStyle = '#777';
        ctx.fillRect(x + 5*unit, y + 3*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 15*unit, y + 12*unit, 1*unit, 1*unit);
    },
    
    // Stone floor variant 2 - with cracks
    floor2: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Base floor color
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y, size, size);
        
        // Crack pattern
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 3*unit, y + 5*unit, 8*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 4*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 2*unit, y + 10*unit, 5*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 4*unit, 1*unit);
        
        // Texture spots
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 1*unit, y + 2*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 1*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 14*unit, y + 3*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 3*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 14*unit, 1*unit, 1*unit);
        
        // Highlights
        ctx.fillStyle = '#777';
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 11*unit, 1*unit, 1*unit);
    },
    
    // Stone floor variant 3 - weathered
    floor3: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Base floor with slight color variation
        ctx.fillStyle = '#544';
        ctx.fillRect(x, y, size, size);
        
        // Weathered patches
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 2*unit, y + 3*unit, 3*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 5*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 4*unit, y + 11*unit, 5*unit, 2*unit);
        
        // Small stones/debris
        ctx.fillStyle = '#777';
        ctx.fillRect(x + 6*unit, y + 2*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 2*unit, y + 13*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 14*unit, y + 14*unit, 1*unit, 1*unit);
        
        // Dark spots
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 8*unit, y + 3*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 1*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 7*unit, 1*unit, 1*unit);
    },
    
    // Stone floor variant 4 - clean
    floor4: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Cleaner base color
        ctx.fillStyle = '#565';
        ctx.fillRect(x, y, size, size);
        
        // Minimal texture - just some subtle spots
        ctx.fillStyle = '#677';
        ctx.fillRect(x + 4*unit, y + 4*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 13*unit, 1*unit, 1*unit);
        
        // Light highlights
        ctx.fillStyle = '#788';
        ctx.fillRect(x + 2*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 3*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 14*unit, 1*unit, 1*unit);
        
        // Subtle shadows
        ctx.fillStyle = '#454';
        ctx.fillRect(x + 8*unit, y + 5*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 14*unit, y + 9*unit, 1*unit, 1*unit);
    },
    
    // Stone wall variant 1 - detailed blocks
    wall1: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Base wall color
        ctx.fillStyle = '#777';
        ctx.fillRect(x, y, size, size);
        
        // Stone block outlines
        ctx.fillStyle = '#888';
        // Top edge highlight
        ctx.fillRect(x, y, size, 1*unit);
        // Left edge highlight  
        ctx.fillRect(x, y, 1*unit, size);
        
        // Stone block divisions
        ctx.fillStyle = '#666';
        // Vertical division
        ctx.fillRect(x + 8*unit, y + 2*unit, 1*unit, 12*unit);
        // Horizontal divisions
        ctx.fillRect(x + 1*unit, y + 5*unit, 7*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 8*unit, 6*unit, 1*unit);
        ctx.fillRect(x + 1*unit, y + 11*unit, 7*unit, 1*unit);
        
        // Dark edges for depth
        ctx.fillStyle = '#555';
        // Bottom edge
        ctx.fillRect(x, y + 15*unit, size, 1*unit);
        // Right edge
        ctx.fillRect(x + 15*unit, y, 1*unit, size);
        
        // Stone texture
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 3*unit, y + 2*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 3*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 2*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 13*unit, 1*unit, 1*unit);
        
        // Shadow spots
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 6*unit, y + 3*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 14*unit, y + 12*unit, 1*unit, 1*unit);
    },
    
    // Stone wall variant 2 - rough surface
    wall2: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Slightly different base color
        ctx.fillStyle = '#787';
        ctx.fillRect(x, y, size, size);
        
        // Rough texture all over
        ctx.fillStyle = '#898';
        ctx.fillRect(x + 1*unit, y + 1*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 2*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 1*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 3*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 14*unit, y + 2*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 2*unit, y + 5*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 3*unit, y + 14*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 15*unit, 1*unit, 1*unit);
        
        // Dark spots for depth
        ctx.fillStyle = '#565';
        ctx.fillRect(x + 6*unit, y + 4*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 15*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 1*unit, y + 10*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 14*unit, y + 13*unit, 1*unit, 1*unit);
        
        // Edge highlights
        ctx.fillStyle = '#999';
        ctx.fillRect(x, y, size, 1*unit);
        ctx.fillRect(x, y, 1*unit, size);
    },
    
    // Stone wall variant 3 - mossy/aged
    wall3: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Base wall with greenish tint
        ctx.fillStyle = '#776';
        ctx.fillRect(x, y, size, size);
        
        // Moss patches
        ctx.fillStyle = '#686';
        ctx.fillRect(x + 3*unit, y + 7*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 11*unit, y + 4*unit, 3*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 12*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 1*unit, y + 2*unit, 2*unit, 2*unit);
        
        // Stone texture
        ctx.fillStyle = '#887';
        ctx.fillRect(x + 6*unit, y + 3*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 2*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 15*unit, 1*unit, 1*unit);
        
        // Dark moss spots
        ctx.fillStyle = '#575';
        ctx.fillRect(x + 4*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 5*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 13*unit, 1*unit, 1*unit);
        
        // Edge definition
        ctx.fillStyle = '#665';
        ctx.fillRect(x, y + 15*unit, size, 1*unit);
        ctx.fillRect(x + 15*unit, y, 1*unit, size);
    },
    
    // Beautiful descending stairs
    stairs: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Base floor
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y, size, size);
        
        // Stairs descending from top-left to bottom-right
        ctx.fillStyle = '#66a';
        
        // Step 1 (highest)
        ctx.fillRect(x + 2*unit, y + 2*unit, 5*unit, 2*unit);
        ctx.fillStyle = '#44a';
        ctx.fillRect(x + 2*unit, y + 3*unit, 5*unit, 1*unit);
        
        // Step 2
        ctx.fillStyle = '#66a';
        ctx.fillRect(x + 4*unit, y + 4*unit, 5*unit, 2*unit);
        ctx.fillStyle = '#44a';
        ctx.fillRect(x + 4*unit, y + 5*unit, 5*unit, 1*unit);
        
        // Step 3
        ctx.fillStyle = '#66a';
        ctx.fillRect(x + 6*unit, y + 6*unit, 5*unit, 2*unit);
        ctx.fillStyle = '#44a';
        ctx.fillRect(x + 6*unit, y + 7*unit, 5*unit, 1*unit);
        
        // Step 4
        ctx.fillStyle = '#66a';
        ctx.fillRect(x + 8*unit, y + 8*unit, 5*unit, 2*unit);
        ctx.fillStyle = '#44a';
        ctx.fillRect(x + 8*unit, y + 9*unit, 5*unit, 1*unit);
        
        // Step 5 (lowest)
        ctx.fillStyle = '#66a';
        ctx.fillRect(x + 10*unit, y + 10*unit, 5*unit, 2*unit);
        ctx.fillStyle = '#44a';
        ctx.fillRect(x + 10*unit, y + 11*unit, 5*unit, 1*unit);
        
        // Side highlights
        ctx.fillStyle = '#88c';
        ctx.fillRect(x + 2*unit, y + 2*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 4*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 10*unit, 1*unit, 1*unit);
        
        // Descent indicator glow
        ctx.fillStyle = '#aaf';
        ctx.fillRect(x + 12*unit, y + 13*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 14*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 14*unit, y + 15*unit, 1*unit, 1*unit);
    }
};