const cavernSprites = {
    wall: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Base rock wall (dark brown-gray for better contrast)
        ctx.fillStyle = '#2a251f';
        ctx.fillRect(x, y, size, size);
        
        // Rock texture variations (brownish stone)
        ctx.fillStyle = '#3d3429';
        ctx.fillRect(x + 2*unit, y + 1*unit, 3*unit, 4*unit);
        ctx.fillRect(x + 8*unit, y + 3*unit, 4*unit, 3*unit);
        ctx.fillRect(x + 1*unit, y + 8*unit, 5*unit, 3*unit);
        ctx.fillRect(x + 10*unit, y + 10*unit, 4*unit, 4*unit);
        
        // Darker cracks and crevices (very dark)
        ctx.fillStyle = '#1a1510';
        ctx.fillRect(x + 4*unit, y + 2*unit, 1*unit, 6*unit);
        ctx.fillRect(x + 9*unit, y + 5*unit, 1*unit, 4*unit);
        ctx.fillRect(x + 2*unit, y + 12*unit, 6*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 3*unit, 1*unit);
        
        // Lighter highlights (tan/beige)
        ctx.fillStyle = '#4f453a';
        ctx.fillRect(x + 1*unit, y + 0*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 1*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 0*unit, y + 5*unit, 1*unit, 2*unit);
        ctx.fillRect(x + 13*unit, y + 7*unit, 2*unit, 1*unit);
        
        // Animation: Subtle moisture sparkles
        const time = Date.now() * 0.004;
        const seed = (x * 7 + y * 11) * 0.01; // Position-based seed
        const sparkle1 = Math.sin(time + seed) * 0.5 + 0.5;
        const sparkle2 = Math.sin(time * 1.3 + seed + 1) * 0.5 + 0.5;
        const sparkle3 = Math.sin(time * 0.7 + seed + 2) * 0.5 + 0.5;
        
        // Occasional moisture glints
        if (sparkle1 > 0.85) {
            ctx.fillStyle = 'rgba(150, 200, 255, 0.6)';
            ctx.fillRect(x + 3*unit, y + 4*unit, 1*unit, 1*unit);
        }
        if (sparkle2 > 0.9) {
            ctx.fillStyle = 'rgba(180, 220, 255, 0.7)';
            ctx.fillRect(x + 12*unit, y + 9*unit, 1*unit, 1*unit);
        }
        if (sparkle3 > 0.88) {
            ctx.fillStyle = 'rgba(160, 210, 255, 0.5)';
            ctx.fillRect(x + 7*unit, y + 14*unit, 1*unit, 1*unit);
        }
    },
    
    floor: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Base stone floor (lighter gray for strong contrast with dark walls)
        ctx.fillStyle = '#6b6b6b';
        ctx.fillRect(x, y, size, size);
        
        // Stone tile variations (medium gray)
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(x + 1*unit, y + 2*unit, 6*unit, 5*unit);
        ctx.fillRect(x + 9*unit, y + 1*unit, 5*unit, 4*unit);
        ctx.fillRect(x + 2*unit, y + 9*unit, 4*unit, 5*unit);
        ctx.fillRect(x + 8*unit, y + 10*unit, 6*unit, 4*unit);
        
        // Mortar lines (darker gray for definition)
        ctx.fillStyle = '#484848';
        ctx.fillRect(x + 7*unit, y + 0*unit, 1*unit, size);
        ctx.fillRect(x + 0*unit, y + 8*unit, size, 1*unit);
        
        // Small debris and pebbles (light highlights)
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x + 3*unit, y + 4*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 12*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 13*unit, y + 3*unit, 1*unit, 1*unit);
    },
    
    stalagmite: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Stalagmite base (wide)
        ctx.fillStyle = '#606060';
        ctx.fillRect(x + 5*unit, y + 11*unit, 6*unit, 5*unit);
        
        // Middle section
        ctx.fillStyle = '#505050';
        ctx.fillRect(x + 6*unit, y + 8*unit, 4*unit, 3*unit);
        
        // Top point
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 7*unit, y + 3*unit, 2*unit, 2*unit);
        
        // Highlight
        ctx.fillStyle = '#707070';
        ctx.fillRect(x + 6*unit, y + 8*unit, 1*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 5*unit, 1*unit, 2*unit);
        
        // Shadow
        ctx.fillStyle = '#404040';
        ctx.fillRect(x + 9*unit, y + 9*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 8*unit, y + 12*unit, 2*unit, 2*unit);
        
        // Animation: Water drip
        const time = Date.now() * 0.002;
        const seed = (x + y) * 0.05; // Different timing per stalagmite
        const dropCycle = (time + seed) % 4; // 4-second cycle
        
        // Moisture at tip
        if (dropCycle < 3) {
            ctx.fillStyle = 'rgba(135, 206, 235, 0.6)'; // Light blue water
            ctx.fillRect(x + 7*unit, y + 3*unit, 2*unit, 1*unit);
        }
        
        // Falling drip
        if (dropCycle > 2.5 && dropCycle < 3.5) {
            const dropProgress = (dropCycle - 2.5) * 10; // 0 to 10
            const dropY = y + 3*unit + dropProgress*unit;
            if (dropY < y + 13*unit) {
                ctx.fillStyle = 'rgba(135, 206, 235, 0.8)';
                ctx.fillRect(x + 8*unit, dropY, 1*unit, 1*unit);
            }
        }
        
        // Water puddle at base (appears when drop hits)
        if (dropCycle > 3.5 || dropCycle < 0.2) {
            ctx.fillStyle = 'rgba(135, 206, 235, 0.4)';
            ctx.fillRect(x + 7*unit, y + 14*unit, 2*unit, 1*unit);
        }
    },
    
    crystal: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Animation: Pulsing glow effect
        const time = Date.now() * 0.003; // Slow pulse
        const seed = (x + y) * 0.01; // Position-based offset
        const pulse = Math.sin(time + seed) * 0.5 + 0.5; // 0 to 1
        const glowIntensity = 0.3 + pulse * 0.4; // 0.3 to 0.7
        
        // Crystal base
        ctx.fillStyle = '#4a4aff';
        ctx.fillRect(x + 6*unit, y + 10*unit, 4*unit, 6*unit);
        
        // Crystal facets
        ctx.fillStyle = '#6a6aff';
        ctx.fillRect(x + 5*unit, y + 8*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 8*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 7*unit, y + 6*unit, 2*unit, 2*unit);
        
        // Bright highlights with pulse
        const highlightAlpha = Math.floor(255 * (0.6 + pulse * 0.4));
        ctx.fillStyle = `rgba(170, 170, 255, ${highlightAlpha})`;
        ctx.fillRect(x + 7*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 11*unit, 1*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 9*unit, 1*unit, 1*unit);
        
        // Animated glow effect
        const glowAlpha = Math.floor(255 * glowIntensity);
        ctx.fillStyle = `rgba(138, 138, 255, ${glowAlpha})`;
        ctx.fillRect(x + 5*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 10*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 5*unit, 2*unit, 1*unit);
        
        // Sparkle effect
        if (pulse > 0.8) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(x + 8*unit, y + 7*unit, 1*unit, 1*unit);
        }
    },
    
    rubble: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Scattered rocks
        ctx.fillStyle = '#606060';
        ctx.fillRect(x + 3*unit, y + 8*unit, 3*unit, 2*unit);
        ctx.fillRect(x + 8*unit, y + 6*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 5*unit, y + 12*unit, 4*unit, 2*unit);
        ctx.fillRect(x + 10*unit, y + 11*unit, 3*unit, 3*unit);
        
        // Smaller debris
        ctx.fillStyle = '#505050';
        ctx.fillRect(x + 2*unit, y + 10*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 7*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 14*unit, 1*unit, 1*unit);
        
        // Dust and particles
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(x + 1*unit, y + 9*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 13*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 10*unit, 1*unit, 1*unit);
    },
    
    bones: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Animation: Very subtle bone shifting
        const time = Date.now() * 0.0008; // Very slow
        const seed = (x * 13 + y * 17) * 0.01;
        const shift = Math.sin(time + seed) * 0.3; // Small offset
        const shiftX = Math.floor(shift * unit);
        const shiftY = Math.floor(shift * 0.5 * unit);
        
        // Skull (with tiny movement)
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x + 3*unit + shiftX, y + 3*unit + shiftY, 4*unit, 4*unit);
        ctx.fillRect(x + 2*unit + shiftX, y + 4*unit + shiftY, 1*unit, 2*unit);
        ctx.fillRect(x + 7*unit + shiftX, y + 4*unit + shiftY, 1*unit, 2*unit);
        
        // Eye sockets (glowing occasionally)
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 3*unit + shiftX, y + 4*unit + shiftY, 1*unit, 1*unit);
        ctx.fillRect(x + 5*unit + shiftX, y + 4*unit + shiftY, 1*unit, 1*unit);
        
        // Occasionally glowing eyes
        const eyeGlow = Math.sin(time * 2 + seed) * 0.5 + 0.5;
        if (eyeGlow > 0.95) {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.6)'; // Red glow
            ctx.fillRect(x + 3*unit + shiftX, y + 4*unit + shiftY, 1*unit, 1*unit);
            ctx.fillRect(x + 5*unit + shiftX, y + 4*unit + shiftY, 1*unit, 1*unit);
        }
        
        // Scattered bones (some slightly moving)
        ctx.fillStyle = '#d0d0d0';
        const shift2 = Math.sin(time * 1.3 + seed + 1) * 0.2;
        const shiftX2 = Math.floor(shift2 * unit);
        
        ctx.fillRect(x + 8*unit + shiftX2, y + 2*unit, 6*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 3*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 2*unit, y + 9*unit + shiftX, 4*unit, 1*unit);
        ctx.fillRect(x + 1*unit, y + 12*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 10*unit + shiftX2, y + 8*unit, 3*unit, 1*unit);
        
        // Bone fragments
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x + 6*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 8*unit, y + 11*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 12*unit, y + 5*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 4*unit, y + 13*unit, 1*unit, 1*unit);
    },
    
    stairs: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Animation: Mysterious depth glow
        const time = Date.now() * 0.002;
        const depthGlow = Math.sin(time) * 0.3 + 0.7; // 0.4 to 1.0
        const glowAlpha = Math.floor(depthGlow * 40); // Subtle glow
        
        // Stairs going down with animated depth
        ctx.fillStyle = `rgba(15, 15, 15, ${depthGlow})`;
        ctx.fillRect(x + 4*unit, y + 4*unit, 8*unit, 8*unit);
        
        // Mysterious glow from depths
        const deepGlow = Math.sin(time * 0.7) * 0.5 + 0.5;
        if (deepGlow > 0.3) {
            ctx.fillStyle = `rgba(100, 120, 200, ${Math.floor(deepGlow * 100)})`;
            ctx.fillRect(x + 6*unit, y + 9*unit, 4*unit, 2*unit);
        }
        
        // Step edges (bright stone for visibility with pulse)
        const stepBrightness = Math.floor(138 + deepGlow * 20);
        ctx.fillStyle = `rgb(${stepBrightness}, ${stepBrightness}, ${stepBrightness})`;
        ctx.fillRect(x + 4*unit, y + 6*unit, 8*unit, 1*unit);
        ctx.fillRect(x + 5*unit, y + 8*unit, 7*unit, 1*unit);
        ctx.fillRect(x + 6*unit, y + 10*unit, 6*unit, 1*unit);
        
        // Side walls of stairwell (using new wall color)
        ctx.fillStyle = '#2a251f';
        ctx.fillRect(x + 4*unit, y + 4*unit, 1*unit, 8*unit);
        ctx.fillRect(x + 11*unit, y + 4*unit, 1*unit, 8*unit);
        ctx.fillRect(x + 4*unit, y + 4*unit, 8*unit, 1*unit);
        
        // Highlight on edges (bright for visibility with animation)
        const edgeBrightness = Math.floor(154 + deepGlow * 25);
        ctx.fillStyle = `rgb(${edgeBrightness}, ${edgeBrightness}, ${edgeBrightness})`;
        ctx.fillRect(x + 3*unit, y + 3*unit, 10*unit, 1*unit);
        ctx.fillRect(x + 3*unit, y + 3*unit, 1*unit, 10*unit);
        
        // Occasional mysterious sparks
        const sparkTime = (time * 3) % 5; // 5-second cycle
        if (sparkTime > 4.5) {
            ctx.fillStyle = 'rgba(150, 200, 255, 0.8)';
            ctx.fillRect(x + 8*unit, y + 8*unit, 1*unit, 1*unit);
        }
    }
};

// Register cavern sprites globally
window.cavernSprites = cavernSprites;