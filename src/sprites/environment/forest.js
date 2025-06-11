const forestSprites = {
    tree: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Forest floor background to prevent black borders
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x, y, size, size);
        
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
        
        // Forest floor background to prevent black borders
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x, y, size, size);
        
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
        
        // Forest floor background to prevent black borders
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x, y, size, size);
        
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
        
        // Forest floor background to prevent black borders
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x, y, size, size);
        
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
        
        // Deterministic grass patterns based on position
        const seed = (x * 31 + y * 17) % 1000;
        
        // Grass texture (position-based)
        ctx.fillStyle = '#7CFC00';
        const grassPositions = [
            [2, 3], [5, 1], [8, 4], [11, 2], [3, 7], [9, 9], [6, 12], [13, 6]
        ];
        
        for (let i = 0; i < grassPositions.length; i++) {
            const [baseX, baseY] = grassPositions[i];
            const offsetX = ((seed + i * 37) % 3) - 1; // -1 to 1 offset
            const offsetY = ((seed + i * 53) % 3) - 1;
            const grassX = x + (baseX + offsetX) * unit;
            const grassY = y + (baseY + offsetY) * unit;
            ctx.fillRect(grassX, grassY, unit, 2*unit);
        }
        
        // Darker spots (position-based)
        ctx.fillStyle = '#32CD32';
        const spotPositions = [[4, 5], [10, 8], [7, 11], [12, 3]];
        
        for (let i = 0; i < spotPositions.length; i++) {
            if ((seed + i * 71) % 3 === 0) { // Only show some spots
                const [baseX, baseY] = spotPositions[i];
                const spotX = x + baseX * unit;
                const spotY = y + baseY * unit;
                ctx.fillRect(spotX, spotY, 2*unit, 2*unit);
            }
        }
    },
    
    path: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Dirt path
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x, y, size, size);
        
        // Deterministic path texture based on position
        const seed = (x * 47 + y * 23) % 1000;
        
        // Path texture (dirt patches)
        ctx.fillStyle = '#A0522D';
        const dirtPositions = [
            [2, 4], [6, 2], [9, 7], [12, 5], [4, 10], [8, 12]
        ];
        
        for (let i = 0; i < dirtPositions.length; i++) {
            const [baseX, baseY] = dirtPositions[i];
            const offsetX = ((seed + i * 41) % 3) - 1;
            const offsetY = ((seed + i * 59) % 3) - 1;
            const dirtX = x + (baseX + offsetX) * unit;
            const dirtY = y + (baseY + offsetY) * unit;
            ctx.fillRect(dirtX, dirtY, 2*unit, unit);
        }
        
        // Small stones (position-based)
        ctx.fillStyle = '#696969';
        const stonePositions = [[3, 6], [10, 3], [7, 9]];
        
        for (let i = 0; i < stonePositions.length; i++) {
            if ((seed + i * 83) % 4 !== 0) { // Skip some stones for variation
                const [baseX, baseY] = stonePositions[i];
                const stoneX = x + baseX * unit;
                const stoneY = y + baseY * unit;
                ctx.fillRect(stoneX, stoneY, unit, unit);
            }
        }
    }
};

// Register forest sprites globally
window.forestSprites = forestSprites;