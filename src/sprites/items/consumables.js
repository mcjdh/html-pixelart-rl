const consumableSprites = {
    potion: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Glass bottle outline
        ctx.fillStyle = '#ccc'; // Light gray glass
        ctx.fillRect(x + 6*unit, y + 4*unit, 4*unit, 10*unit);
        ctx.fillRect(x + 5*unit, y + 6*unit, 1*unit, 6*unit); // Left side
        ctx.fillRect(x + 10*unit, y + 6*unit, 1*unit, 6*unit); // Right side
        ctx.fillRect(x + 6*unit, y + 13*unit, 4*unit, 2*unit); // Bottom
        
        // Inner glass (transparent effect)
        ctx.fillStyle = '#eee';
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 8*unit);
        
        // Health potion liquid (red)
        ctx.fillStyle = '#f44';
        ctx.fillRect(x + 7*unit, y + 7*unit, 2*unit, 6*unit);
        
        // Liquid surface (slightly darker)
        ctx.fillStyle = '#d33';
        ctx.fillRect(x + 7*unit, y + 7*unit, 2*unit, 1*unit);
        
        // Cork stopper
        ctx.fillStyle = '#841'; // Brown cork
        ctx.fillRect(x + 7*unit, y + 4*unit, 2*unit, 2*unit);
        
        // Cork texture
        ctx.fillStyle = '#a52';
        ctx.fillRect(x + 7*unit, y + 4*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 5*unit, 1*unit, 1*unit);
        
        // Paper label
        ctx.fillStyle = '#fed'; // Off-white paper
        ctx.fillRect(x + 6*unit, y + 9*unit, 4*unit, 3*unit);
        
        // Label text (simple cross for health)
        ctx.fillStyle = '#f44'; // Red cross
        ctx.fillRect(x + 7*unit, y + 10*unit, 2*unit, 1*unit); // Horizontal
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 3*unit); // Vertical part 1
        ctx.fillRect(x + 8*unit, y + 9*unit, 1*unit, 3*unit); // Vertical part 2
        
        // Glass highlights
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6*unit, y + 5*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 8*unit, 1*unit, 1*unit);
        
        // Bottle neck highlight
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 6*unit, y + 4*unit, 1*unit, 1*unit);
    }
};