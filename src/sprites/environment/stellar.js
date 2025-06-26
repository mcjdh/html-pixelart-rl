const stellarSprites = {
    wall: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Deep space background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(x, y, size, size);
        
        // Observatory panels and controls
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(x + unit * 2, y + unit * 2, unit * 12, unit * 3);
        ctx.fillRect(x + unit * 2, y + unit * 11, unit * 12, unit * 3);
        
        // Control panels
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x + unit * 3, y + unit * 3, unit * 2, unit);
        ctx.fillRect(x + unit * 11, y + unit * 3, unit * 2, unit);
        
        // Glowing stars (animated)
        const time = Date.now() * 0.002;
        const seed = (x + y) * 0.01;
        const twinkle = Math.sin(time + seed) * 0.5 + 0.5;
        
        // Star points
        const starAlpha = 0.4 + twinkle * 0.6;
        ctx.fillStyle = `rgba(255, 255, 200, ${starAlpha})`;
        ctx.fillRect(x + unit * 5, y + unit * 6, unit, unit);
        ctx.fillRect(x + unit * 10, y + unit * 9, unit, unit);
    },
    
    floor: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Observatory floor with constellation patterns
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(x, y, size, size);
        
        // Constellation lines (position-based patterns)
        const pattern = ((x * 17 + y * 23) % 1000) / 1000;
        if (pattern > 0.7) {
            ctx.fillStyle = '#3a3a5a';
            // Horizontal constellation line
            ctx.fillRect(x + unit * 2, y + unit * 8, unit * 12, unit);
        } else if (pattern > 0.4) {
            ctx.fillStyle = '#3a3a5a';
            // Vertical constellation line
            ctx.fillRect(x + unit * 8, y + unit * 2, unit, unit * 12);
        }
        
        // Animated star field dots
        const time = Date.now() * 0.003;
        const seed1 = (x * 13 + y * 7) * 0.01;
        const seed2 = (x * 19 + y * 11) * 0.01;
        const seed3 = (x * 23 + y * 17) * 0.01;
        
        const twinkle1 = Math.sin(time + seed1) * 0.3 + 0.7;
        const twinkle2 = Math.sin(time * 1.3 + seed2) * 0.3 + 0.7;
        const twinkle3 = Math.sin(time * 0.7 + seed3) * 0.3 + 0.7;
        
        // Twinkling stars
        ctx.fillStyle = `rgba(90, 90, 122, ${twinkle1})`;
        ctx.fillRect(x + unit * 4, y + unit * 4, unit, unit);
        
        ctx.fillStyle = `rgba(90, 90, 122, ${twinkle2})`;
        ctx.fillRect(x + unit * 12, y + unit * 7, unit, unit);
        
        ctx.fillStyle = `rgba(90, 90, 122, ${twinkle3})`;
        ctx.fillRect(x + unit * 8, y + unit * 11, unit, unit);
        
        // Cosmic dust particles (very subtle)
        const dustTime = Date.now() * 0.0005;
        for (let i = 0; i < 2; i++) {
            const dustX = (dustTime * (i + 1) * 3) % 16;
            const dustY = 8 + Math.sin(dustTime * (i + 1) + seed1) * 4;
            ctx.fillStyle = 'rgba(100, 100, 150, 0.2)';
            ctx.fillRect(x + dustX*unit, y + dustY*unit, unit, unit);
        }
    },
    
    starChart: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Large star chart table
        ctx.fillStyle = '#3a3a5a';
        ctx.fillRect(x + unit * 2, y + unit * 6, unit * 12, unit * 8);
        
        // Chart surface
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x + unit * 3, y + unit * 7, unit * 10, unit * 6);
        
        // Constellation patterns on chart
        ctx.fillStyle = '#7a7a9a';
        // Major constellation points
        ctx.fillRect(x + unit * 5, y + unit * 8, unit, unit);
        ctx.fillRect(x + unit * 8, y + unit * 9, unit, unit);
        ctx.fillRect(x + unit * 11, y + unit * 10, unit, unit);
        
        // Connecting lines
        ctx.fillRect(x + unit * 6, y + unit * 8, unit * 2, unit);
        ctx.fillRect(x + unit * 8, y + unit * 9, unit * 3, unit);
    },
    
    telescope: function(ctx, x, y, size) {
        const unit = size / 16;
        
        // Telescope base
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(x + unit * 6, y + unit * 12, unit * 4, unit * 4);
        
        // Telescope tube
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x + unit * 7, y + unit * 4, unit * 2, unit * 10);
        
        // Telescope eyepiece
        ctx.fillStyle = '#6a6a8a';
        ctx.fillRect(x + unit * 6, y + unit * 3, unit * 4, unit * 2);
        
        // Animated viewing light
        const time = Date.now() * 0.003;
        const glow = Math.sin(time) * 0.3 + 0.5;
        ctx.fillStyle = `rgba(100, 150, 255, ${glow})`;
        ctx.fillRect(x + unit * 7, y + unit * 4, unit * 2, unit);
    },
    
    constellation: function(ctx, x, y, size) {
        const unit = size / 16;
        const time = Date.now() * 0.001;
        
        // Constellation pattern with animated stars
        const stars = [
            {x: 4, y: 3}, {x: 8, y: 5}, {x: 12, y: 4},
            {x: 6, y: 8}, {x: 10, y: 10}, {x: 14, y: 9},
            {x: 3, y: 12}, {x: 7, y: 13}, {x: 11, y: 15}
        ];
        
        // Draw constellation lines first
        ctx.fillStyle = 'rgba(150, 180, 255, 0.3)';
        // Horizontal connections
        ctx.fillRect(x + unit * 4, y + unit * 3, unit * 4, unit);
        ctx.fillRect(x + unit * 8, y + unit * 5, unit * 4, unit);
        // Vertical connections  
        ctx.fillRect(x + unit * 6, y + unit * 8, unit, unit * 2);
        ctx.fillRect(x + unit * 10, y + unit * 10, unit, unit * 3);
        
        // Draw animated stars
        stars.forEach((star, i) => {
            const starTime = time + i * 0.7;
            const brightness = Math.sin(starTime) * 0.4 + 0.6;
            ctx.fillStyle = `rgba(255, 255, 200, ${brightness})`;
            ctx.fillRect(x + unit * star.x, y + unit * star.y, unit * 2, unit * 2);
        });
    }
};

// Register globally
window.stellarSprites = stellarSprites;