const cavernSprites = {
    wall: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Base rock wall (dark brown-gray for better contrast)
        ctx.fillStyle = '#2a251f';
        ctx.fillRect(x, y, size, size);
        
        // Rock texture variations (brownish stone)
        ctx.fillStyle = '#3d3429';
        ctx.fillRect(x + 2*unit, y + 1*unit, 3*unit, 4*unit);
        ctx.fillRect(x + 8*unit, y + 3*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 1*unit, y + 8*unit, 5*unit, 3*unit);
        ctx.fillRect(x + 10*unit, y + 10*unit, 4*unit, 4*unit);
        
        // Darker cracks and crevices (very dark)
        ctx.fillStyle = '#1a1510';
        ctx.fillRect(x + 4*unit, y + 2*unit, 1*unit, 6*unit);
        ctx.fillRect(x + 9*unit, y + 5*unit, 1*unit, 4*unit);
        ctx.fillRect(x + 2*unit, y + 12*unit, 6*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 3*unit, 1*unit);
        
        // Lighter highlights (tan/beige)
        ctx.fillStyle = '#4f453a';
        ctx.fillRect(x + 1*unit, y + 0*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 1*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 0*unit, y + 5*unit, 1*unit, 2*unit);
        ctx.fillRect(x + 13*unit, y + 7*unit, 2*unit, 1*unit);
    },
    
    floor: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Base stone floor (lighter gray for strong contrast with dark walls)
        ctx.fillStyle = '#6b6b6b';
        ctx.fillRect(x, y, size, size);
        
        // Stone tile variations (medium gray)
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(x + 1*unit, y + 2*unit, 6*unit, 5*unit);
        ctx.fillRect(x + 9*unit, y + 1*unit, 5*unit, 4*unit);
        ctx.fillRect(x + 2*unit, y + 9*unit, 4*unit, 5*unit);
        ctx.fillRect(x + 8*unit, y + 10*unit, 6*unit, 4*unit);
        
        // Mortar lines (darker gray for definition)
        ctx.fillStyle = '#484848';
        ctx.fillRect(x + 7*unit, y + 0*unit, 1*unit, size);
        ctx.fillRect(x + 0*unit, y + 8*unit, size, 1*unit);
        
        // Small debris and pebbles (light highlights)
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x + 3*unit, y + 4*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 3*unit, 1*unit, 1*unit);
    },
    
    stalagmite: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Stalagmite base (wide)
        ctx.fillStyle = '#606060';
        ctx.fillRect(x + 5*unit, y + 11*unit, 6*unit, 5*unit);
        
        // Middle section
        ctx.fillStyle = '#505050';
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 3*unit);
        
        // Top point
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 7*unit, y + 3*unit, 2*unit, 2*unit);
        
        // Highlight
        ctx.fillStyle = '#707070';
        ctx.fillRect(x + 6*unit, y + 8*unit, 1*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 5*unit, 1*unit, 2*unit);
        
        // Shadow
        ctx.fillStyle = '#404040';
        ctx.fillRect(x + 9*unit, y + 9*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 8*unit, y + 12*unit, 2*unit, 2*unit);
    },
    
    crystal: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Crystal base
        ctx.fillStyle = '#4a4aff';
        ctx.fillRect(x + 6*unit, y + 10*unit, 4*unit, 6*unit);
        
        // Crystal facets
        ctx.fillStyle = '#6a6aff';
        ctx.fillRect(x + 5*unit, y + 8*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 8*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 2*unit);
        
        // Bright highlights
        ctx.fillStyle = '#aaaaff';
        ctx.fillRect(x + 7*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 11*unit, 1*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 9*unit, 1*unit, 1*unit);
        
        // Glow effect
        ctx.fillStyle = '#8a8aff';
        ctx.fillRect(x + 5*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 1*unit);
    },
    
    rubble: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Scattered rocks
        ctx.fillStyle = '#606060';
        ctx.fillRect(x + 3*unit, y + 8*unit, 3*unit, 2*unit);
        ctx.fillRect(x + 8*unit, y + 6*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 5*unit, y + 12*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 10*unit, y + 11*unit, 3*unit, 3*unit);
        
        // Smaller debris
        ctx.fillStyle = '#505050';
        ctx.fillRect(x + 2*unit, y + 10*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 14*unit, 1*unit, 1*unit);
        
        // Dust and particles
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(x + 1*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 13*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 10*unit, 1*unit, 1*unit);
    },
    
    bones: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Skull
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x + 3*unit, y + 3*unit, 4*unit, 4*unit);
        ctx.fillRect(x + 2*unit, y + 4*unit, 1*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 4*unit, 1*unit, 2*unit);
        
        // Eye sockets
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 3*unit, y + 4*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 4*unit, 1*unit, 1*unit);
        
        // Scattered bones
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(x + 8*unit, y + 2*unit, 6*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 3*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 2*unit, y + 9*unit, 4*unit, 1*unit);
        ctx.fillRect(x + 1*unit, y + 12*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 10*unit, y + 8*unit, 3*unit, 1*unit);
        
        // Bone fragments
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x + 6*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 5*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 13*unit, 1*unit, 1*unit);
    },
    
    stairs: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Stairs going down (very dark opening for depth)
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(x + 4*unit, y + 4*unit, 8*unit, 8*unit);
        
        // Step edges (bright stone for visibility)
        ctx.fillStyle = '#8a8a8a';
        ctx.fillRect(x + 4*unit, y + 6*unit, 8*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 8*unit, 7*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 10*unit, 6*unit, 1*unit);
        
        // Side walls of stairwell (using new wall color)
        ctx.fillStyle = '#2a251f';
        ctx.fillRect(x + 4*unit, y + 4*unit, 1*unit, 8*unit);
        ctx.fillRect(x + 11*unit, y + 4*unit, 1*unit, 8*unit);
        ctx.fillRect(x + 4*unit, y + 4*unit, 8*unit, 1*unit);
        
        // Highlight on edges (bright for visibility)
        ctx.fillStyle = '#9a9a9a';
        ctx.fillRect(x + 3*unit, y + 3*unit, 10*unit, 1*unit);
        ctx.fillRect(x + 3*unit, y + 3*unit, 1*unit, 10*unit);
    }
};

// Register cavern sprites globally
window.cavernSprites = cavernSprites;