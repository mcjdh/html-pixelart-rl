const treantSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Trunk (dark brown)
        ctx.fillStyle = '#4a2c17';
        ctx.fillRect(x + 5*unit, y + 7*unit, 6*unit, 9*unit);
        
        // Roots/legs
        ctx.fillRect(x + 3*unit, y + 14*unit, 3*unit, 2*unit);
        ctx.fillRect(x + 10*unit, y + 14*unit, 3*unit, 2*unit);
        
        // Branches/arms
        ctx.fillRect(x + 2*unit, y + 8*unit, 3*unit, 2*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 3*unit, 2*unit);
        
        // Leaves (green canopy)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 3*unit, y + 2*unit, 10*unit, 6*unit);
        ctx.fillRect(x + 4*unit, y + 1*unit, 8*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 0*unit, 6*unit, 1*unit);
        
        // Darker leaves for depth
        ctx.fillStyle = '#006400';
        ctx.fillRect(x + 4*unit, y + 3*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 10*unit, y + 3*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 2*unit);
        
        // Face (eyes)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + 6*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 9*unit, 1*unit, 1*unit);
        
        // Mouth
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 7*unit, y + 11*unit, 2*unit, 1*unit);
        
        // Bark texture
        ctx.fillStyle = '#3a2414';
        ctx.fillRect(x + 6*unit, y + 8*unit, 1*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 10*unit, 1*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 13*unit, 1*unit, 2*unit);
    },
    
    attacking: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Trunk (dark brown) - leaning forward
        ctx.fillStyle = '#4a2c17';
        ctx.fillRect(x + 6*unit, y + 7*unit, 6*unit, 9*unit);
        
        // Roots/legs - spread
        ctx.fillRect(x + 2*unit, y + 14*unit, 3*unit, 2*unit);
        ctx.fillRect(x + 11*unit, y + 14*unit, 3*unit, 2*unit);
        
        // Branches/arms - reaching
        ctx.fillRect(x + 1*unit, y + 9*unit, 5*unit, 2*unit);
        ctx.fillRect(x + 12*unit, y + 7*unit, 3*unit, 2*unit);
        
        // Branch claws
        ctx.fillRect(x + 0*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 0*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 15*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 15*unit, y + 9*unit, 1*unit, 1*unit);
        
        // Leaves (green canopy) - rustling
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 4*unit, y + 2*unit, 10*unit, 5*unit);
        ctx.fillRect(x + 3*unit, y + 3*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 13*unit, y + 3*unit, 2*unit, 3*unit);
        
        // Darker leaves
        ctx.fillStyle = '#006400';
        ctx.fillRect(x + 5*unit, y + 3*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 11*unit, y + 3*unit, 2*unit, 3*unit);
        
        // Angry face (glowing eyes)
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 9*unit, 1*unit, 1*unit);
        
        // Open mouth
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 8*unit, y + 11*unit, 3*unit, 2*unit);
        
        // Teeth
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 8*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 11*unit, 1*unit, 1*unit);
    }
};

// Register treant sprites globally
window.treantSprites = treantSprites;