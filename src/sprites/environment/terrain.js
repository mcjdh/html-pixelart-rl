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
        const unit = SpriteUtils.getUnit(size);
        
        // Base floor color
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_BASE, 0, 0, 16, 16);
        
        // Stone texture details
        const textureSpots = [
            {x: 2, y: 1, w: 1, h: 1}, {x: 7, y: 2, w: 1, h: 1}, {x: 12, y: 3, w: 1, h: 1},
            {x: 4, y: 5, w: 1, h: 1}, {x: 9, y: 6, w: 1, h: 1}, {x: 14, y: 7, w: 1, h: 1},
            {x: 1, y: 9, w: 1, h: 1}, {x: 6, y: 10, w: 1, h: 1}, {x: 11, y: 11, w: 1, h: 1},
            {x: 3, y: 13, w: 1, h: 1}, {x: 8, y: 14, w: 1, h: 1}, {x: 13, y: 15, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_TEXTURE, textureSpots);
        
        // Highlight spots
        const highlights = [
            {x: 5, y: 3, w: 1, h: 1}, {x: 10, y: 8, w: 1, h: 1}, {x: 15, y: 12, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_HIGHLIGHT, highlights);
    },
    
    // Stone floor variant 2 - with cracks
    floor2: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Base floor color
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_BASE, 0, 0, 16, 16);
        
        // Crack pattern
        const cracks = [
            {x: 3, y: 5, w: 8, h: 1}, {x: 6, y: 4, w: 1, h: 3},
            {x: 2, y: 10, w: 5, h: 1}, {x: 11, y: 8, w: 4, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_CRACK, cracks);
        
        // Texture spots
        const textureSpots = [
            {x: 1, y: 2, w: 1, h: 1}, {x: 8, y: 1, w: 1, h: 1}, {x: 14, y: 3, w: 1, h: 1},
            {x: 5, y: 7, w: 1, h: 1}, {x: 12, y: 6, w: 1, h: 1}, {x: 3, y: 12, w: 1, h: 1},
            {x: 9, y: 14, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_TEXTURE, textureSpots);
        
        // Highlights
        const highlights = [
            {x: 7, y: 9, w: 1, h: 1}, {x: 13, y: 11, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_HIGHLIGHT, highlights);
    },
    
    // Stone floor variant 3 - weathered
    floor3: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Base floor with slight color variation
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_BASE_ALT, 0, 0, 16, 16);
        
        // Weathered patches
        const weatheredPatches = [
            {x: 2, y: 3, w: 3, h: 2}, {x: 9, y: 5, w: 4, h: 3}, {x: 4, y: 11, w: 5, h: 2}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_WEATHERED, weatheredPatches);
        
        // Small stones/debris
        const debris = [
            {x: 6, y: 2, w: 1, h: 1}, {x: 11, y: 9, w: 1, h: 1},
            {x: 2, y: 13, w: 1, h: 1}, {x: 14, y: 14, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_HIGHLIGHT, debris);
        
        // Dark spots
        const darkSpots = [
            {x: 8, y: 3, w: 1, h: 1}, {x: 1, y: 8, w: 1, h: 1}, {x: 13, y: 7, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_SHADOW, darkSpots);
    },
    
    // Stone floor variant 4 - clean
    floor4: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Cleaner base color
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_BASE_CLEAN, 0, 0, 16, 16);
        
        // Minimal texture - just some subtle spots
        const subtleTexture = [
            {x: 4, y: 4, w: 1, h: 1}, {x: 10, y: 7, w: 1, h: 1},
            {x: 7, y: 11, w: 1, h: 1}, {x: 13, y: 13, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_HIGHLIGHT_ALT, subtleTexture);
        
        // Light highlights
        const highlights = [
            {x: 2, y: 6, w: 1, h: 1}, {x: 12, y: 3, w: 1, h: 1}, {x: 6, y: 14, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_HIGHLIGHT_CLEAN, highlights);
        
        // Subtle shadows
        const shadows = [
            {x: 8, y: 5, w: 1, h: 1}, {x: 14, y: 9, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_SHADOW_ALT, shadows);
    },
    
    // Stone wall variant 1 - detailed blocks
    wall1: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Base wall color
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_BASE, 0, 0, 16, 16);
        
        // Edge highlights
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_HIGHLIGHT, 0, 0, 16, 1); // Top
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_HIGHLIGHT, 0, 0, 1, 16); // Left
        
        // Stone block divisions
        const divisions = [
            {x: 8, y: 2, w: 1, h: 12}, // Vertical division
            {x: 1, y: 5, w: 7, h: 1}, {x: 9, y: 8, w: 6, h: 1}, {x: 1, y: 11, w: 7, h: 1} // Horizontal
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_DIVISIONS, divisions);
        
        // Dark edges for depth
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_SHADOW, 0, 15, 16, 1); // Bottom
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_SHADOW, 15, 0, 1, 16); // Right
        
        // Stone texture
        const texture = [
            {x: 3, y: 2, w: 1, h: 1}, {x: 12, y: 3, w: 1, h: 1}, {x: 5, y: 6, w: 1, h: 1},
            {x: 10, y: 9, w: 1, h: 1}, {x: 2, y: 12, w: 1, h: 1}, {x: 13, y: 13, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_HIGHLIGHT, texture);
        
        // Shadow spots
        const shadows = [
            {x: 6, y: 3, w: 1, h: 1}, {x: 11, y: 6, w: 1, h: 1},
            {x: 4, y: 9, w: 1, h: 1}, {x: 14, y: 12, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_DIVISIONS, shadows);
    },
    
    // Stone wall variant 2 - rough surface
    wall2: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Slightly different base color
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_BASE_ROUGH, 0, 0, 16, 16);
        
        // Rough texture all over
        const roughTexture = [
            {x: 1, y: 1, w: 1, h: 1}, {x: 4, y: 2, w: 1, h: 1}, {x: 7, y: 1, w: 1, h: 1},
            {x: 11, y: 3, w: 1, h: 1}, {x: 14, y: 2, w: 1, h: 1}, {x: 2, y: 5, w: 1, h: 1},
            {x: 9, y: 6, w: 1, h: 1}, {x: 13, y: 7, w: 1, h: 1}, {x: 5, y: 9, w: 1, h: 1},
            {x: 8, y: 11, w: 1, h: 1}, {x: 12, y: 12, w: 1, h: 1}, {x: 3, y: 14, w: 1, h: 1},
            {x: 10, y: 15, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_HIGHLIGHT_ROUGH, roughTexture);
        
        // Dark spots for depth
        const darkSpots = [
            {x: 6, y: 4, w: 1, h: 1}, {x: 15, y: 8, w: 1, h: 1},
            {x: 1, y: 10, w: 1, h: 1}, {x: 14, y: 13, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_SHADOW_ROUGH, darkSpots);
        
        // Edge highlights
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_EDGE_HIGHLIGHT, 0, 0, 16, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_EDGE_HIGHLIGHT, 0, 0, 1, 16);
    },
    
    // Stone wall variant 3 - mossy/aged
    wall3: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Base wall with greenish tint
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_BASE_MOSSY, 0, 0, 16, 16);
        
        // Moss patches
        const mossPatches = [
            {x: 3, y: 7, w: 2, h: 3}, {x: 11, y: 4, w: 3, h: 2},
            {x: 7, y: 12, w: 4, h: 2}, {x: 1, y: 2, w: 2, h: 2}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MOSS_PATCH, mossPatches);
        
        // Stone texture
        const stoneTexture = [
            {x: 6, y: 3, w: 1, h: 1}, {x: 13, y: 8, w: 1, h: 1},
            {x: 2, y: 11, w: 1, h: 1}, {x: 9, y: 15, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_HIGHLIGHT_MOSSY, stoneTexture);
        
        // Dark moss spots
        const darkMoss = [
            {x: 4, y: 8, w: 1, h: 1}, {x: 12, y: 5, w: 1, h: 1}, {x: 8, y: 13, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.MOSS_DARK, darkMoss);
        
        // Edge definition
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_SHADOW_MOSSY, 0, 15, 16, 1);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.WALL_SHADOW_MOSSY, 15, 0, 1, 16);
    },
    
    // Beautiful descending stairs
    stairs: (ctx, x, y, size) => {
        const unit = SpriteUtils.getUnit(size);
        
        // Base floor
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.FLOOR_BASE, 0, 0, 16, 16);
        
        // Steps with shadows
        const steps = [
            {step: 1, x: 2, y: 2}, {step: 2, x: 4, y: 4}, {step: 3, x: 6, y: 6},
            {step: 4, x: 8, y: 8}, {step: 5, x: 10, y: 10}
        ];
        
        steps.forEach(({x: stepX, y: stepY}) => {
            // Step surface
            SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.STAIRS_BASE, stepX, stepY, 5, 2);
            // Step shadow
            SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.STAIRS_SHADOW, stepX, stepY + 1, 5, 1);
        });
        
        // Side highlights
        const highlights = [
            {x: 2, y: 2, w: 1, h: 1}, {x: 4, y: 4, w: 1, h: 1}, {x: 6, y: 6, w: 1, h: 1},
            {x: 8, y: 8, w: 1, h: 1}, {x: 10, y: 10, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.STAIRS_HIGHLIGHT, highlights);
        
        // Descent indicator glow
        const glowSpots = [
            {x: 12, y: 13, w: 1, h: 1}, {x: 13, y: 14, w: 1, h: 1}, {x: 14, y: 15, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.STAIRS_GLOW, glowSpots);
    }
};