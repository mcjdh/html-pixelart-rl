export const decorationSprites = {
    torch: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#841';
        // Torch handle
        ctx.fillRect(x + 7*unit, y + 8*unit, 2*unit, 6*unit);
        // Flame
        ctx.fillStyle = '#f80';
        ctx.fillRect(x + 6*unit, y + 5*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 7*unit, y + 3*unit, 2*unit, 2*unit);
        // Inner flame
        ctx.fillStyle = '#ff0';
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 2*unit);
    },
    
    wallTorch: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#666';
        // Wall mount
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 2*unit);
        // Torch
        ctx.fillStyle = '#841';
        ctx.fillRect(x + 8*unit, y + 6*unit, 2*unit, 2*unit);
        // Flame
        ctx.fillStyle = '#f80';
        ctx.fillRect(x + 7*unit, y + 3*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 8*unit, y + 1*unit, 2*unit, 2*unit);
        // Inner flame
        ctx.fillStyle = '#ff0';
        ctx.fillRect(x + 8*unit, y + 4*unit, 2*unit, 2*unit);
    },
    
    bones: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ddd';
        // Scattered bones
        ctx.fillRect(x + 3*unit, y + 10*unit, 4*unit, unit);
        ctx.fillRect(x + 8*unit, y + 12*unit, 3*unit, unit);
        ctx.fillRect(x + 5*unit, y + 8*unit, unit, 3*unit);
        ctx.fillRect(x + 10*unit, y + 9*unit, unit, 2*unit);
        // Skull
        ctx.fillRect(x + 12*unit, y + 7*unit, 3*unit, 3*unit);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 12*unit, y + 8*unit, unit, unit);
        ctx.fillRect(x + 14*unit, y + 8*unit, unit, unit);
    },
    
    cobweb: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#ccc';
        // Web strands
        ctx.fillRect(x + 2*unit, y + 2*unit, 6*unit, unit);
        ctx.fillRect(x + 2*unit, y + 2*unit, unit, 6*unit);
        ctx.fillRect(x + 4*unit, y + 4*unit, 4*unit, unit);
        ctx.fillRect(x + 4*unit, y + 4*unit, unit, 4*unit);
        ctx.fillRect(x + 6*unit, y + 6*unit, 2*unit, unit);
        // Spider
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 5*unit, y + 5*unit, 2*unit, 2*unit);
    },
    
    bloodStain: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#822';
        // Blood splatter
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 5*unit, y + 9*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 10*unit, y + 10*unit, 2*unit, unit);
        ctx.fillRect(x + 7*unit, y + 11*unit, unit, 2*unit);
    },
    
    mushroom: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#a44';
        // Mushroom cap
        ctx.fillRect(x + 5*unit, y + 7*unit, 6*unit, 3*unit);
        ctx.fillRect(x + 4*unit, y + 8*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 10*unit, y + 8*unit, 2*unit, 2*unit);
        // Stem
        ctx.fillStyle = '#db8';
        ctx.fillRect(x + 7*unit, y + 10*unit, 2*unit, 3*unit);
        // Spots
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6*unit, y + 8*unit, unit, unit);
        ctx.fillRect(x + 9*unit, y + 8*unit, unit, unit);
    },
    
    crystal: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#48f';
        // Crystal formation
        ctx.fillRect(x + 7*unit, y + 4*unit, 2*unit, 6*unit);
        ctx.fillRect(x + 6*unit, y + 6*unit, 4*unit, 4*unit);
        ctx.fillRect(x + 5*unit, y + 8*unit, 6*unit, 2*unit);
        // Glow
        ctx.fillStyle = '#8af';
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 2*unit);
    },
    
    statue: (ctx, x, y, size) => {
        const unit = size / 16;
        ctx.fillStyle = '#888';
        // Base
        ctx.fillRect(x + 4*unit, y + 12*unit, 8*unit, 2*unit);
        // Body
        ctx.fillRect(x + 6*unit, y + 6*unit, 4*unit, 6*unit);
        // Head
        ctx.fillRect(x + 6*unit, y + 3*unit, 4*unit, 3*unit);
        // Arms
        ctx.fillRect(x + 4*unit, y + 7*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 10*unit, y + 7*unit, 2*unit, 3*unit);
    }
};