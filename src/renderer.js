class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.GRID_WIDTH * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.GRID_HEIGHT * CONFIG.CELL_SIZE;
        
        // Enable pixel art rendering
        this.ctx.imageSmoothingEnabled = false;
        
        // Cache for dirty region tracking
        this.dirtyRegions = new Set();
        this.lastFogState = null;
    }
    
    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderMap(map, fogOfWar, explored) {
        // Always render everything for now (could optimize later)
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                this.renderTile(map, fogOfWar, explored, x, y);
            }
        }
        
        // Cache fog state for next frame
        this.lastFogState = fogOfWar.map(row => [...row]);
    }
    
    renderTile(map, fogOfWar, explored, x, y) {
        const tile = map[y][x];
        const pixelX = x * CONFIG.CELL_SIZE;
        const pixelY = y * CONFIG.CELL_SIZE;
        
        if (fogOfWar[y][x]) {
            if (explored[y][x]) {
                // Explored but not currently visible - show dimmed terrain
                this.ctx.fillStyle = tile === '#' ? CONFIG.COLORS.WALL : CONFIG.COLORS.FLOOR;
                this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                
                // Add fog overlay
                this.ctx.fillStyle = CONFIG.COLORS.FOG_EXPLORED;
                this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
            } else {
                // Completely unexplored
                this.ctx.fillStyle = CONFIG.COLORS.FOG;
                this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
            }
        } else {
            // Currently visible
            this.ctx.fillStyle = tile === '#' ? CONFIG.COLORS.WALL : CONFIG.COLORS.FLOOR;
            this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        }
    }
    
    renderStairs(x, y, fogOfWar) {
        if (!fogOfWar[y][x]) {
            SPRITES.stairs(this.ctx, x * CONFIG.CELL_SIZE, y * CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        }
    }
    
    renderItems(items, fogOfWar) {
        for (const item of items) {
            if (!fogOfWar[item.y][item.x]) {
                const sprite = ITEM_SPRITES[item.type];
                if (sprite) {
                    sprite(this.ctx, item.x * CONFIG.CELL_SIZE, item.y * CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                }
            }
        }
    }
    
    renderEnemies(enemies, fogOfWar) {
        for (const enemy of enemies) {
            if (!fogOfWar[enemy.y][enemy.x]) {
                const sprite = ENEMY_SPRITES[enemy.type];
                if (sprite) {
                    sprite(this.ctx, enemy.x * CONFIG.CELL_SIZE, enemy.y * CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                }
                
                // Render health bar if damaged
                if (enemy.hp < enemy.maxHp) {
                    this.renderHealthBar(
                        enemy.x * CONFIG.CELL_SIZE, 
                        enemy.y * CONFIG.CELL_SIZE - 4,
                        CONFIG.CELL_SIZE,
                        3,
                        enemy.hp / enemy.maxHp
                    );
                }
            }
        }
    }
    
    renderPlayer(player) {
        const x = player.x * CONFIG.CELL_SIZE;
        const y = player.y * CONFIG.CELL_SIZE;
        
        // Draw player sprite
        SPRITES.player(this.ctx, x, y, CONFIG.CELL_SIZE);
        
        // Draw facing indicator
        if (CONFIG.FEATURES.DIRECTIONAL_COMBAT) {
            this.renderFacingIndicator(x, y, player.facing);
        }
        
        // Draw status effect indicators
        if (CONFIG.FEATURES.STATUS_EFFECTS && player.statusEffects.length > 0) {
            this.renderStatusEffects(x, y, player.statusEffects);
        }
    }
    
    renderFacingIndicator(x, y, facing) {
        this.ctx.fillStyle = '#fff';
        const size = 3;
        const offset = CONFIG.CELL_SIZE - 4;
        
        switch(facing) {
            case 'up':
                this.ctx.fillRect(x + CONFIG.CELL_SIZE/2 - size/2, y + 2, size, size);
                break;
            case 'down':
                this.ctx.fillRect(x + CONFIG.CELL_SIZE/2 - size/2, y + offset, size, size);
                break;
            case 'left':
                this.ctx.fillRect(x + 2, y + CONFIG.CELL_SIZE/2 - size/2, size, size);
                break;
            case 'right':
                this.ctx.fillRect(x + offset, y + CONFIG.CELL_SIZE/2 - size/2, size, size);
                break;
        }
    }
    
    renderStatusEffects(x, y, effects) {
        let offsetX = 0;
        for (const effect of effects) {
            this.ctx.fillStyle = CONFIG.COLORS[effect.type.toUpperCase()] || '#fff';
            this.ctx.fillRect(x + offsetX, y - 4, 4, 4);
            offsetX += 5;
        }
    }
    
    renderHealthBar(x, y, width, height, percentage) {
        // Background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, width, height);
        
        // Health fill
        this.ctx.fillStyle = percentage > 0.5 ? '#4a4' : percentage > 0.25 ? '#aa4' : '#a44';
        this.ctx.fillRect(x, y, width * percentage, height);
    }
    
    renderParticle(x, y, color, size = 2) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x - size/2, y - size/2, size, size);
    }
    
    renderDamageNumber(x, y, damage, color = '#f88') {
        this.ctx.font = 'bold 12px monospace';
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        
        const text = `-${damage}`;
        const pixelX = x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const pixelY = y * CONFIG.CELL_SIZE;
        
        this.ctx.strokeText(text, pixelX, pixelY);
        this.ctx.fillText(text, pixelX, pixelY);
    }
}

class ParticleSystem {
    constructor(renderer) {
        this.renderer = renderer;
        this.particles = [];
        this.particlePool = [];
        this.maxPoolSize = 100;
    }
    
    addParticle(x, y, vx, vy, color, lifetime) {
        let particle = this.particlePool.pop();
        
        if (!particle) {
            particle = {
                x: 0, y: 0, vx: 0, vy: 0, 
                color: '', lifetime: 0, maxLifetime: 0
            };
        }
        
        particle.x = x;
        particle.y = y;
        particle.vx = vx;
        particle.vy = vy;
        particle.color = color;
        particle.lifetime = lifetime;
        particle.maxLifetime = lifetime;
        
        this.particles.push(particle);
    }
    
    addExplosion(x, y, color = '#f88', count = 10) {
        const centerX = x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const centerY = y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 2;
            this.addParticle(
                centerX,
                centerY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                20 + Math.random() * 10
            );
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.lifetime--;
            
            if (p.lifetime > 0) {
                const alpha = p.lifetime / p.maxLifetime;
                this.renderer.ctx.globalAlpha = alpha;
                this.renderer.renderParticle(p.x, p.y, p.color);
                this.renderer.ctx.globalAlpha = 1;
            } else {
                // Return to pool
                if (this.particlePool.length < this.maxPoolSize) {
                    this.particlePool.push(p);
                }
                this.particles.splice(i, 1);
            }
        }
    }
}