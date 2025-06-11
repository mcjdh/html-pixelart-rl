const decorationSprites = {
    torch: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Torch pole
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 7*unit, y + 8*unit, 2*unit, 6*unit);
        
        // Flame base
        ctx.fillStyle = '#f80';
        ctx.fillRect(x + 6*unit, y + 5*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 7*unit, y + 3*unit, 2*unit, 2*unit);
        
        // Flame center
        ctx.fillStyle = '#ff0';
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 2*unit);
        
        // Flame tip glow
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 7*unit, y + 4*unit, 2*unit, 1*unit);
    },
    
    // Small rocks/debris
    rocks: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Rock 1
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 3*unit, y + 12*unit, 2*unit, 2*unit);
        ctx.fillStyle = '#777';
        ctx.fillRect(x + 3*unit, y + 12*unit, 1*unit, 1*unit);
        
        // Rock 2
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 8*unit, y + 13*unit, 3*unit, 2*unit);
        ctx.fillStyle = '#666';
        ctx.fillRect(x + 8*unit, y + 13*unit, 2*unit, 1*unit);
        
        // Rock 3
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 13*unit, y + 11*unit, 2*unit, 3*unit);
        ctx.fillStyle = '#555';
        ctx.fillRect(x + 13*unit, y + 11*unit, 1*unit, 2*unit);
    },
    
    // Moss patch
    moss: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Main moss blob
        ctx.fillStyle = '#585';
        ctx.fillRect(x + 5*unit, y + 10*unit, 6*unit, 4*unit);
        ctx.fillRect(x + 4*unit, y + 11*unit, 8*unit, 2*unit);
        
        // Darker moss details
        ctx.fillStyle = '#474';
        ctx.fillRect(x + 6*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 13*unit, 1*unit, 1*unit);
        
        // Light moss highlights
        ctx.fillStyle = '#696';
        ctx.fillRect(x + 5*unit, y + 10*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 13*unit, 1*unit, 1*unit);
    },
    
    // Bone pile
    bones: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Skull
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 3*unit);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 10*unit, 1*unit, 1*unit);
        
        // Bones scattered
        ctx.fillStyle = '#ccc';
        ctx.fillRect(x + 4*unit, y + 12*unit, 3*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 13*unit, 4*unit, 1*unit);
        ctx.fillRect(x + 3*unit, y + 14*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 11*unit, 1*unit, 2*unit);
        
        // Shadows
        ctx.fillStyle = '#999';
        ctx.fillRect(x + 6*unit, y + 11*unit, 4*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 13*unit, 3*unit, 1*unit);
    }
};