const skeletonLordSprites = {
    default: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Animation: Menacing presence with dark energy
        const time = Date.now() * 0.004; // Slow, ominous pulse
        const seed = (x + y) * 0.01;
        const darkPulse = Math.sin(time + seed) * 0.3 + 0.7; // 0.4 to 1.0
        const energyFlicker = Math.sin(time * 2 + seed) * 0.5 + 0.5; // 0 to 1
        
        // Dark aura emanating from the boss (contained within sprite bounds)
        const auraAlpha = Math.floor(darkPulse * 60);
        ctx.fillStyle = `rgba(120, 0, 120, ${auraAlpha})`;
        ctx.fillRect(x + 1*unit, y + 1*unit, size - 2*unit, size - 2*unit);
        
        // Larger, more imposing skull (boss is bigger)
        ctx.fillStyle = '#e8e8e8'; // Slightly brighter bone
        ctx.fillRect(x + 3*unit, y + 1*unit, 10*unit, 8*unit);
        ctx.fillRect(x + 2*unit, y + 3*unit, 2*unit, 4*unit); // Jaw extension
        ctx.fillRect(x + 12*unit, y + 3*unit, 2*unit, 4*unit);
        
        // Menacing crown/horn protrusions (boss-exclusive - regular skeleton has none)
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(x + 5*unit, y + 0*unit, 2*unit, 2*unit); // Left horn
        ctx.fillRect(x + 9*unit, y + 0*unit, 2*unit, 2*unit); // Right horn
        ctx.fillRect(x + 7*unit, y + 0*unit, 2*unit, 1*unit); // Center spike (within bounds)
        
        // Boss crown jewel
        ctx.fillStyle = '#ff0080';
        ctx.fillRect(x + 7*unit, y + 0*unit, 2*unit, 1*unit);
        
        // Larger ribcage (more imposing)
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 5*unit, y + 9*unit, 6*unit, 1*unit);  // Top rib
        ctx.fillRect(x + 4*unit, y + 10*unit, 8*unit, 1*unit); // Main ribs
        ctx.fillRect(x + 5*unit, y + 11*unit, 6*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 12*unit, 8*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 13*unit, 6*unit, 1*unit); // Bottom rib
        
        // Powerful arms with ancient weapons
        ctx.fillStyle = '#d8d8d8';
        ctx.fillRect(x + 2*unit, y + 9*unit, 2*unit, 6*unit);  // Left arm (thicker)
        ctx.fillRect(x + 12*unit, y + 9*unit, 2*unit, 6*unit); // Right arm
        
        // Ancient weapon in left hand (contained within bounds)
        ctx.fillStyle = '#8b4513'; // Brown handle
        ctx.fillRect(x + 2*unit, y + 11*unit, 1*unit, 3*unit);
        ctx.fillStyle = '#c0c0c0'; // Metal blade
        ctx.fillRect(x + 2*unit, y + 8*unit, 1*unit, 4*unit);
        
        // Shield in right hand (safely within bounds)
        ctx.fillStyle = '#654321'; // Dark wood
        ctx.fillRect(x + 12*unit, y + 10*unit, 2*unit, 4*unit);
        ctx.fillStyle = '#888'; // Metal rim
        ctx.fillRect(x + 12*unit, y + 10*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 13*unit, 2*unit, 1*unit);
        
        // Stronger leg bones
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 5*unit, y + 14*unit, 2*unit, 2*unit); // Left leg (within bounds)
        ctx.fillRect(x + 9*unit, y + 14*unit, 2*unit, 2*unit);  // Right leg (within bounds)
        
        // Glowing eye sockets with flickering evil energy
        const eyeGlowR = Math.floor(255 * (0.7 + energyFlicker * 0.3));
        const eyeGlowG = Math.floor(50 * energyFlicker);
        ctx.fillStyle = '#000'; // Socket base
        ctx.fillRect(x + 5*unit, y + 3*unit, 2*unit, 2*unit); // Left socket
        ctx.fillRect(x + 9*unit, y + 3*unit, 2*unit, 2*unit);  // Right socket
        
        // Flickering red eyes
        ctx.fillStyle = `rgb(${eyeGlowR}, ${eyeGlowG}, 0)`;
        ctx.fillRect(x + 5*unit, y + 3*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 3*unit, 2*unit, 2*unit);
        
        // Extra bright eye centers when energy peaks
        if (energyFlicker > 0.8) {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
            ctx.fillRect(x + 6*unit, y + 4*unit, 1*unit, 1*unit);
            ctx.fillRect(x + 10*unit, y + 4*unit, 1*unit, 1*unit);
        }
        
        // Dark energy crackling around the boss (contained within bounds)
        if (darkPulse > 0.8) {
            ctx.fillStyle = 'rgba(160, 0, 160, 0.7)';
            // Energy sparks at safe positions within sprite bounds
            const spark1X = x + Math.floor((5 + Math.sin(time * 3) * 2) * unit);
            const spark1Y = y + Math.floor((6 + Math.cos(time * 2.7) * 2) * unit);
            if (spark1X >= x && spark1X < x + size - unit && spark1Y >= y && spark1Y < y + size - unit) {
                ctx.fillRect(spark1X, spark1Y, 1*unit, 1*unit);
            }
            
            const spark2X = x + Math.floor((9 + Math.sin(time * 2.3) * 2) * unit);
            const spark2Y = y + Math.floor((8 + Math.cos(time * 3.1) * 2) * unit);
            if (spark2X >= x && spark2X < x + size - unit && spark2Y >= y && spark2Y < y + size - unit) {
                ctx.fillRect(spark2X, spark2Y, 1*unit, 1*unit);
            }
        }
        
        // Tattered ancient cloak/cape flowing behind
        ctx.fillStyle = 'rgba(40, 20, 40, 0.8)';
        ctx.fillRect(x + 6*unit, y + 15*unit, 4*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 15*unit, 6*unit, 1*unit);
        
        // Battle scars on skull (character detail)
        ctx.fillStyle = '#bbb';
        ctx.fillRect(x + 4*unit, y + 2*unit, 1*unit, 3*unit); // Left scar
        ctx.fillRect(x + 11*unit, y + 4*unit, 1*unit, 2*unit); // Right scar
    }
};

window.skeletonLordSprites = skeletonLordSprites;