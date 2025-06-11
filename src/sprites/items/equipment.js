export const equipmentSprites = {
    sword: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ccc';
        // Blade
        ctx.fillRect(x + 7*unit, y + 2*unit, 2*unit, 8*unit);
        // Guard
        ctx.fillRect(x + 5*unit, y + 10*unit, 6*unit, unit);
        // Handle
        ctx.fillStyle = '#843';
        ctx.fillRect(x + 7*unit, y + 11*unit, 2*unit, 3*unit);
        // Pommel
        ctx.fillStyle = '#aa4';
        ctx.fillRect(x + 6*unit, y + 14*unit, 4*unit, unit);
    },
    
    dagger: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ccc';
        // Blade
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 5*unit);
        // Guard
        ctx.fillRect(x + 6*unit, y + 10*unit, 4*unit, unit);
        // Handle
        ctx.fillStyle = '#643';
        ctx.fillRect(x + 7*unit, y + 11*unit, 2*unit, 3*unit);
    },
    
    axe: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ccc';
        // Axe head
        ctx.fillRect(x + 5*unit, y + 6*unit, 6*unit, 4*unit);
        ctx.fillRect(x + 4*unit, y + 7*unit, 2*unit, 2*unit);
        // Handle
        ctx.fillStyle = '#843';
        ctx.fillRect(x + 7*unit, y + 10*unit, 2*unit, 5*unit);
    },
    
    bow: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#841';
        // Bow body
        ctx.fillRect(x + 6*unit, y + 3*unit, 2*unit, 10*unit);
        // Bow tips
        ctx.fillRect(x + 5*unit, y + 3*unit, 2*unit, unit);
        ctx.fillRect(x + 9*unit, y + 3*unit, 2*unit, unit);
        ctx.fillRect(x + 5*unit, y + 12*unit, 2*unit, unit);
        ctx.fillRect(x + 9*unit, y + 12*unit, 2*unit, unit);
        // String
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 8*unit, y + 3*unit, unit, 10*unit);
    },
    
    staff: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#841';
        // Staff body
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 10*unit);
        // Orb
        ctx.fillStyle = '#44f';
        ctx.fillRect(x + 6*unit, y + 3*unit, 4*unit, 3*unit);
        // Orb shine
        ctx.fillStyle = '#88f';
        ctx.fillRect(x + 7*unit, y + 4*unit, 2*unit, unit);
    },
    
    shield: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#666';
        // Shield body
        ctx.fillRect(x + 5*unit, y + 4*unit, 6*unit, 8*unit);
        ctx.fillRect(x + 6*unit, y + 3*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 12*unit, 4*unit, 2*unit);
        // Boss (center decoration)
        ctx.fillStyle = '#aa4';
        ctx.fillRect(x + 7*unit, y + 7*unit, 2*unit, 2*unit);
        // Cross pattern
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 6*unit);
        ctx.fillRect(x + 6*unit, y + 7*unit, 4*unit, 2*unit);
    },
    
    armor: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#888';
        // Chestplate
        ctx.fillRect(x + 4*unit, y + 6*unit, 8*unit, 6*unit);
        // Shoulder guards
        ctx.fillRect(x + 3*unit, y + 6*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 11*unit, y + 6*unit, 2*unit, 3*unit);
        // Detail lines
        ctx.fillStyle = '#aaa';
        ctx.fillRect(x + 5*unit, y + 7*unit, 6*unit, unit);
        ctx.fillRect(x + 5*unit, y + 9*unit, 6*unit, unit);
        ctx.fillRect(x + 5*unit, y + 11*unit, 6*unit, unit);
    }
};