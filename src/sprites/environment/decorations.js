const decorationSprites = {
    torch: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Wooden torch pole with texture
        ctx.fillStyle = '#654';
        ctx.fillRect(x + 7*unit, y + 8*unit, 2*unit, 6*unit);
        
        // Wood grain
        ctx.fillStyle = '#543';
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 13*unit, 1*unit, 1*unit);
        
        // Warm flame base
        ctx.fillStyle = '#f70';
        ctx.fillRect(x + 6*unit, y + 5*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 7*unit, y + 3*unit, 2*unit, 2*unit);
        
        // Bright flame center
        ctx.fillStyle = '#fd0';
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 2*unit);
        
        // Hot flame tip
        ctx.fillStyle = '#ffa';
        ctx.fillRect(x + 7*unit, y + 4*unit, 2*unit, 1*unit);
        
        // Metal bracket holding flame
        ctx.fillStyle = '#876';
        ctx.fillRect(x + 6*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 8*unit, 1*unit, 1*unit);
    },
    
    // Small rocks/debris
    rocks: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Rock 1 - natural stone color
        ctx.fillStyle = '#6a6';
        ctx.fillRect(x + 3*unit, y + 12*unit, 2*unit, 2*unit);
        ctx.fillStyle = '#7b7';
        ctx.fillRect(x + 3*unit, y + 12*unit, 1*unit, 1*unit);
        
        // Rock 2 - earth tone
        ctx.fillStyle = '#595';
        ctx.fillRect(x + 8*unit, y + 13*unit, 3*unit, 2*unit);
        ctx.fillStyle = '#6a6';
        ctx.fillRect(x + 8*unit, y + 13*unit, 2*unit, 1*unit);
        
        // Rock 3 - darker earth
        ctx.fillStyle = '#484';
        ctx.fillRect(x + 13*unit, y + 11*unit, 2*unit, 3*unit);
        ctx.fillStyle = '#595';
        ctx.fillRect(x + 13*unit, y + 11*unit, 1*unit, 2*unit);
        
        // Small pebbles for texture
        ctx.fillStyle = '#7b7';
        ctx.fillRect(x + 6*unit, y + 14*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 12*unit, 1*unit, 1*unit);
    },
    
    // Moss patch
    moss: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Main moss blob with natural green
        ctx.fillStyle = '#5a5';
        ctx.fillRect(x + 5*unit, y + 10*unit, 6*unit, 4*unit);
        ctx.fillRect(x + 4*unit, y + 11*unit, 8*unit, 2*unit);
        
        // Deeper moss texture
        ctx.fillStyle = '#494';
        ctx.fillRect(x + 6*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 13*unit, 1*unit, 1*unit);
        
        // Fresh growth highlights
        ctx.fillStyle = '#6b6';
        ctx.fillRect(x + 5*unit, y + 10*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 13*unit, 1*unit, 1*unit);
        
        // Tiny moss tendrils
        ctx.fillStyle = '#4a4';
        ctx.fillRect(x + 3*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 9*unit, 1*unit, 1*unit);
    },
    
    // Bone pile
    bones: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Weathered skull
        ctx.fillStyle = '#cbc';
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 3*unit);
        ctx.fillStyle = '#898';
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 10*unit, 1*unit, 1*unit);
        
        // Scattered ancient bones
        ctx.fillStyle = '#bab';
        ctx.fillRect(x + 4*unit, y + 12*unit, 3*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 13*unit, 4*unit, 1*unit);
        ctx.fillRect(x + 3*unit, y + 14*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 11*unit, 1*unit, 2*unit);
        
        // Natural weathering
        ctx.fillStyle = '#a9a';
        ctx.fillRect(x + 6*unit, y + 11*unit, 4*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 13*unit, 3*unit, 1*unit);
        
        // Age spots and wear
        ctx.fillStyle = '#989';
        ctx.fillRect(x + 5*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 12*unit, 1*unit, 1*unit);
    }
};