const wolfSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Wolf fur - natural gray-brown
        ctx.fillStyle = '#5a4a3a'; // Dark brown base
        ctx.fillRect(x + 3*unit, y + 8*unit, 10*unit, 5*unit);
        
        // Wolf head with muzzle
        ctx.fillRect(x + 2*unit, y + 9*unit, 4*unit, 3*unit);
        // Extended muzzle
        ctx.fillRect(x + 1*unit, y + 10*unit, 2*unit, 2*unit);
        
        // Four legs (proper wolf stance)
        ctx.fillRect(x + 4*unit, y + 13*unit, 2*unit, 3*unit); // Front left
        ctx.fillRect(x + 7*unit, y + 13*unit, 2*unit, 3*unit); // Front right
        ctx.fillRect(x + 9*unit, y + 13*unit, 2*unit, 3*unit); // Back left
        ctx.fillRect(x + 11*unit, y + 13*unit, 2*unit, 3*unit); // Back right
        
        // Bushy tail
        ctx.fillRect(x + 13*unit, y + 8*unit, 2*unit, 3*unit);
        
        // Pointed wolf ears
        ctx.fillStyle = '#6a5a4a'; // Lighter fur for ears
        ctx.fillRect(x + 3*unit, y + 8*unit, 1*unit, 2*unit); // Left ear
        ctx.fillRect(x + 5*unit, y + 8*unit, 1*unit, 2*unit); // Right ear
        // Ear tips
        ctx.fillRect(x + 3*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 7*unit, 1*unit, 1*unit);
        
        // Piercing yellow eyes
        ctx.fillStyle = '#ff3'; // Yellow wolf eyes
        ctx.fillRect(x + 3*unit, y + 10*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 10*unit, 1*unit, 1*unit);
        
        // Black nose
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 1*unit, y + 11*unit, 1*unit, 1*unit);
        
        // Subtle fangs
        ctx.fillStyle = '#eee';
        ctx.fillRect(x + 2*unit, y + 11*unit, 1*unit, 1*unit);
        
        // Darker fur markings (natural wolf patterns)
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(x + 6*unit, y + 9*unit, 3*unit, 2*unit); // Back stripe
        ctx.fillRect(x + 10*unit, y + 10*unit, 2*unit, 1*unit); // Side marking
        ctx.fillRect(x + 13*unit, y + 9*unit, 2*unit, 1*unit); // Tail tip
        
        // Lighter chest fur
        ctx.fillStyle = '#7a6a5a';
        ctx.fillRect(x + 4*unit, y + 11*unit, 2*unit, 2*unit);
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