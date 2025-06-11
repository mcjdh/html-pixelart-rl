const wolfSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Body (gray)
        ctx.fillStyle = '#696969';
        ctx.fillRect(x + 3*unit, y + 8*unit, 10*unit, 5*unit);
        
        // Head
        ctx.fillRect(x + 2*unit, y + 9*unit, 3*unit, 3*unit);
        
        // Legs
        ctx.fillRect(x + 4*unit, y + 13*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 7*unit, y + 13*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 10*unit, y + 13*unit, 2*unit, 3*unit);
        
        // Tail
        ctx.fillRect(x + 13*unit, y + 9*unit, 2*unit, 2*unit);
        
        // Ears
        ctx.fillRect(x + 2*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 8*unit, 1*unit, 1*unit);
        
        // Eye (red)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x + 3*unit, y + 10*unit, 1*unit, 1*unit);
        
        // Teeth (white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 2*unit, y + 11*unit, 1*unit, 1*unit);
        
        // Darker fur patches
        ctx.fillStyle = '#404040';
        ctx.fillRect(x + 6*unit, y + 9*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 10*unit, y + 10*unit, 2*unit, 1*unit);
    },
    
    attacking: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Body (gray) - slightly crouched
        ctx.fillStyle = '#696969';
        ctx.fillRect(x + 3*unit, y + 9*unit, 10*unit, 5*unit);
        
        // Head - lowered
        ctx.fillRect(x + 1*unit, y + 10*unit, 3*unit, 3*unit);
        
        // Legs - spread for pounce
        ctx.fillRect(x + 3*unit, y + 14*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 14*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 14*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 12*unit, y + 14*unit, 2*unit, 2*unit);
        
        // Tail - raised
        ctx.fillRect(x + 13*unit, y + 8*unit, 2*unit, 2*unit);
        
        // Ears - flattened
        ctx.fillRect(x + 1*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 3*unit, y + 9*unit, 1*unit, 1*unit);
        
        // Eyes (bright red)
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(x + 2*unit, y + 11*unit, 1*unit, 1*unit);
        
        // Open mouth with teeth
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 1*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 2*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 3*unit, y + 12*unit, 1*unit, 1*unit);
        
        // Darker fur patches
        ctx.fillStyle = '#404040';
        ctx.fillRect(x + 6*unit, y + 10*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 10*unit, y + 11*unit, 2*unit, 1*unit);
    }
};

// Register wolf sprites globally
window.wolfSprites = wolfSprites;