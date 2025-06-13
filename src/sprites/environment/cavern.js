const cavernSprites = {
    wall: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
        // Base rock wall
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_WALL_BASE, 0, 0, 16, 16);
        
        // Rock texture variations
        const texturePatches = [
            {x: 2, y: 1, w: 3, h: 4}, {x: 8, y: 3, w: 4, h: 3},
            {x: 1, y: 8, w: 5, h: 3}, {x: 10, y: 10, w: 4, h: 4}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_WALL_TEXTURE, texturePatches);
        
        // Darker cracks and crevices
        const cracks = [
            {x: 4, y: 2, w: 1, h: 6}, {x: 9, y: 5, w: 1, h: 4},
            {x: 2, y: 12, w: 6, h: 1}, {x: 11, y: 8, w: 3, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_WALL_CRACK, cracks);
        
        // Lighter highlights
        const highlights = [
            {x: 1, y: 0, w: 2, h: 1}, {x: 6, y: 1, w: 2, h: 1},
            {x: 0, y: 5, w: 1, h: 2}, {x: 13, y: 7, w: 2, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_WALL_HIGHLIGHT, highlights);
        
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
        const unit = SpriteUtils.getUnit(size);
        
        // Base stone floor
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_FLOOR_BASE, 0, 0, 16, 16);
        
        // Stone tile variations
        const tiles = [
            {x: 1, y: 2, w: 6, h: 5}, {x: 9, y: 1, w: 5, h: 4},
            {x: 2, y: 9, w: 4, h: 5}, {x: 8, y: 10, w: 6, h: 4}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_FLOOR_TILE, tiles);
        
        // Mortar lines
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_FLOOR_MORTAR, 7, 0, 1, 16);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_FLOOR_MORTAR, 0, 8, 16, 1);
        
        // Small debris and pebbles
        const debris = [
            {x: 3, y: 4, w: 1, h: 1}, {x: 11, y: 6, w: 1, h: 1},
            {x: 5, y: 12, w: 1, h: 1}, {x: 13, y: 3, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_FLOOR_DEBRIS, debris);
    },
    
    stalagmite: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
        // Floor base
        cavernSprites.floor(ctx, x, y, size);
        
        // Stalagmite base (wide)
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_STALAGMITE, 5, 11, 6, 5);
        
        // Middle section and top point
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_STALAGMITE_MID, 6, 8, 4, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_STALAGMITE_MID, 7, 5, 2, 3);
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_STALAGMITE_MID, 7, 3, 2, 2);
        
        // Highlight
        const highlights = [
            {x: 6, y: 8, w: 1, h: 2}, {x: 7, y: 5, w: 1, h: 2}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_STALAGMITE_HIGHLIGHT, highlights);
        
        // Shadow
        const shadows = [
            {x: 9, y: 9, w: 1, h: 3}, {x: 8, y: 12, w: 2, h: 2}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_STALAGMITE_SHADOW, shadows);
        
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
        SpriteUtils.drawRect(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_CRYSTAL_BASE, 6, 10, 4, 6);
        
        // Crystal facets
        const facets = [
            {x: 5, y: 8, w: 2, h: 2}, {x: 9, y: 8, w: 2, h: 2}, {x: 7, y: 6, w: 2, h: 2}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_CRYSTAL_FACET, facets);
        
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
        const rocks = [
            {x: 3, y: 8, w: 3, h: 2}, {x: 8, y: 6, w: 2, h: 3},
            {x: 5, y: 12, w: 4, h: 2}, {x: 10, y: 11, w: 3, h: 3}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_RUBBLE, rocks);
        
        // Smaller debris
        const debris = [
            {x: 2, y: 10, w: 1, h: 1}, {x: 7, y: 9, w: 1, h: 1},
            {x: 11, y: 8, w: 1, h: 1}, {x: 4, y: 14, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_RUBBLE_SMALL, debris);
        
        // Dust and particles
        const dust = [
            {x: 1, y: 9, w: 1, h: 1}, {x: 6, y: 7, w: 1, h: 1},
            {x: 9, y: 13, w: 1, h: 1}, {x: 12, y: 10, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_RUBBLE_DUST, dust);
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
        const skullColor = CONFIG.COLORS.SPRITES.CAVERN_BONE_SKULL;
        ctx.fillStyle = skullColor;
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
        const scatteredColor = CONFIG.COLORS.SPRITES.CAVERN_BONE_SCATTERED;
        ctx.fillStyle = scatteredColor;
        const shift2 = Math.sin(time * 1.3 + seed + 1) * 0.2;
        const shiftX2 = Math.floor(shift2 * unit);
        
        ctx.fillRect(x + 8*unit + shiftX2, y + 2*unit, 6*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 3*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 2*unit, y + 9*unit + shiftX, 4*unit, 1*unit);
        ctx.fillRect(x + 1*unit, y + 12*unit, 1*unit, 3*unit);
        ctx.fillRect(x + 10*unit + shiftX2, y + 8*unit, 3*unit, 1*unit);
        
        // Bone fragments
        const fragments = [
            {x: 6, y: 7, w: 1, h: 1}, {x: 8, y: 11, w: 1, h: 1},
            {x: 12, y: 5, w: 1, h: 1}, {x: 4, y: 13, w: 1, h: 1}
        ];
        SpriteUtils.drawMarkings(ctx, x, y, unit, CONFIG.COLORS.SPRITES.CAVERN_BONE_FRAGMENT, fragments);
    },
    
    stairs: function(ctx, x, y, size) {
        const unit = SpriteUtils.getUnit(size);
        
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