export const terrainSprites = {
    stairs: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#44a';
        // Steps
        ctx.fillRect(x + 2*unit, y + 12*unit, 12*unit, 2*unit);
        ctx.fillRect(x + 3*unit, y + 10*unit, 10*unit, 2*unit);
        ctx.fillRect(x + 4*unit, y + 8*unit, 8*unit, 2*unit);
        ctx.fillRect(x + 5*unit, y + 6*unit, 6*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 4*unit, 4*unit, 2*unit);
    },
    
    stairsUp: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#4aa';
        // Steps going up
        ctx.fillRect(x + 6*unit, y + 2*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 5*unit, y + 4*unit, 6*unit, 2*unit);
        ctx.fillRect(x + 4*unit, y + 6*unit, 8*unit, 2*unit);
        ctx.fillRect(x + 3*unit, y + 8*unit, 10*unit, 2*unit);
        ctx.fillRect(x + 2*unit, y + 10*unit, 12*unit, 2*unit);
    },
    
    door: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#843';
        // Door frame
        ctx.fillRect(x + 5*unit, y + 2*unit, 6*unit, 12*unit);
        // Door handle
        ctx.fillStyle = '#aa4';
        ctx.fillRect(x + 9*unit, y + 8*unit, unit, unit);
        // Door panels
        ctx.fillStyle = '#964';
        ctx.fillRect(x + 6*unit, y + 4*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 6*unit, y + 9*unit, 4*unit, 3*unit);
    },
    
    openDoor: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#843';
        // Door frame (open)
        ctx.fillRect(x + 2*unit, y + 2*unit, 2*unit, 12*unit);
        ctx.fillRect(x + 12*unit, y + 2*unit, 2*unit, 12*unit);
        // Top frame
        ctx.fillRect(x + 4*unit, y + 2*unit, 8*unit, 2*unit);
    },
    
    trap: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#666';
        // Spike trap
        ctx.fillRect(x + 4*unit, y + 12*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 10*unit, 2*unit, 4*unit);
        ctx.fillRect(x + 8*unit, y + 12*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 10*unit, y + 10*unit, 2*unit, 4*unit);
        ctx.fillRect(x + 12*unit, y + 12*unit, 2*unit, 2*unit);
    },
    
    portal: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#f0f';
        // Outer ring
        ctx.fillRect(x + 4*unit, y + 4*unit, 8*unit, 2*unit);
        ctx.fillRect(x + 4*unit, y + 10*unit, 8*unit, 2*unit);
        ctx.fillRect(x + 3*unit, y + 6*unit, 2*unit, 4*unit);
        ctx.fillRect(x + 11*unit, y + 6*unit, 2*unit, 4*unit);
        // Inner swirl
        ctx.fillStyle = '#84f';
        ctx.fillRect(x + 6*unit, y + 6*unit, 4*unit, unit);
        ctx.fillRect(x + 7*unit, y + 7*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 6*unit, y + 9*unit, 4*unit, unit);
    },
    
    altar: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#666';
        // Base
        ctx.fillRect(x + 2*unit, y + 12*unit, 12*unit, 2*unit);
        // Pillar
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 4*unit);
        // Top slab
        ctx.fillRect(x + 4*unit, y + 6*unit, 8*unit, 2*unit);
        // Flame
        ctx.fillStyle = '#f80';
        ctx.fillRect(x + 7*unit, y + 3*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 6*unit, y + 4*unit, 4*unit, 2*unit);
    }
};