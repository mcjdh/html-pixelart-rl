const forestSprites = {
    tree: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Tree trunk (brown)
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 6*unit, y + 10*unit, 4*unit, 6*unit);
        
        // Tree leaves (multiple layers for depth)
        ctx.fillStyle = '#228B22';
        // Bottom layer
        ctx.fillRect(x + 2*unit, y + 8*unit, 12*unit, 4*unit);
        // Middle layer
        ctx.fillRect(x + 3*unit, y + 5*unit, 10*unit, 4*unit);
        // Top layer
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 4*unit);
        
        // Darker green for depth
        ctx.fillStyle = '#006400';
        ctx.fillRect(x + 3*unit, y + 9*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 11*unit, y + 9*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 3*unit, 2*unit, 1*unit);
    },
    
    flower: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Stem
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 7*unit, y + 10*unit, 2*unit, 4*unit);
        
        // Flower petals
        const colors = ['#FF69B4', '#FFB6C1', '#FF1493', '#FFC0CB'];
        const petalColor = colors[Math.floor((x + y) / size) % colors.length];
        ctx.fillStyle = petalColor;
        
        // Center
        ctx.fillRect(x + 6*unit, y + 6*unit, 4*unit, 4*unit);
        // Petals
        ctx.fillRect(x + 5*unit, y + 7*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 7*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 9*unit, 2*unit, 2*unit);
        
        // Yellow center
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x + 7*unit, y + 7*unit, 2*unit, 2*unit);
    },
    
    stone: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Main stone body
        ctx.fillStyle = '#808080';
        ctx.fillRect(x + 4*unit, y + 8*unit, 8*unit, 6*unit);
        ctx.fillRect(x + 5*unit, y + 7*unit, 6*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 14*unit, 6*unit, 1*unit);
        
        // Highlights
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(x + 5*unit, y + 8*unit, 3*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 9*unit, 1*unit, 1*unit);
        
        // Shadows
        ctx.fillStyle = '#696969';
        ctx.fillRect(x + 9*unit, y + 12*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 13*unit, 2*unit, 1*unit);
    },
    
    bush: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Bush body
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 3*unit, y + 9*unit, 10*unit, 6*unit);
        ctx.fillRect(x + 4*unit, y + 8*unit, 8*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 15*unit, 8*unit, 1*unit);
        
        // Darker areas for depth
        ctx.fillStyle = '#006400';
        ctx.fillRect(x + 4*unit, y + 11*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 10*unit, y + 10*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 7*unit, y + 12*unit, 2*unit, 2*unit);
        
        // Small berries
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(x + 5*unit, y + 10*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 1*unit);
    },
    
    grass: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Base grass color
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x, y, size, size);
        
        // Grass texture
        ctx.fillStyle = '#7CFC00';
        for (let i = 0; i < 8; i++) {
            const grassX = x + (Math.random() * 14 + 1) * unit;
            const grassY = y + (Math.random() * 14 + 1) * unit;
            ctx.fillRect(grassX, grassY, unit, 2*unit);
        }
        
        // Some darker spots
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 4; i++) {
            const spotX = x + Math.floor(Math.random() * 14 + 1) * unit;
            const spotY = y + Math.floor(Math.random() * 14 + 1) * unit;
            ctx.fillRect(spotX, spotY, 2*unit, 2*unit);
        }
    },
    
    path: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Dirt path
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x, y, size, size);
        
        // Path texture
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < 6; i++) {
            const dirtX = x + Math.floor(Math.random() * 14 + 1) * unit;
            const dirtY = y + Math.floor(Math.random() * 14 + 1) * unit;
            ctx.fillRect(dirtX, dirtY, 2*unit, unit);
        }
        
        // Small stones
        ctx.fillStyle = '#696969';
        for (let i = 0; i < 3; i++) {
            const stoneX = x + Math.floor(Math.random() * 15) * unit;
            const stoneY = y + Math.floor(Math.random() * 15) * unit;
            ctx.fillRect(stoneX, stoneY, unit, unit);
        }
    }
};

// Register forest sprites globally
window.forestSprites = forestSprites;