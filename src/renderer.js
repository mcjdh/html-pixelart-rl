/**
 * Handles all game rendering including map, entities, and UI elements
 * @class Renderer
 */
class Renderer {
    constructor(canvas) {
        if (!canvas) {
            throw new Error('Renderer: Canvas element is required');
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        if (!this.ctx) {
            throw new Error('Renderer: Failed to get 2D rendering context');
        }
        
        this.canvas.width = CONFIG.VIEWPORT_WIDTH * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.VIEWPORT_HEIGHT * CONFIG.CELL_SIZE;
        
        // Camera tracking
        this.cameraX = 0;
        this.cameraY = 0;
        
        // Enable pixel art rendering
        this.ctx.imageSmoothingEnabled = false;
        
        // Cache for dirty region tracking and sprite optimization
        this.dirtyRegions = new Set();
        this.lastFogState = null;
        
        // Sprite caching for performance
        this.spriteCache = new Map();
        this.spriteCacheSize = 0;
        this.maxCacheSize = 100; // Limit memory usage
    }
    
    // Sprite caching system for performance optimization
    getCachedSprite(spriteKey, spriteFunction, size) {
        const cacheKey = `${spriteKey}_${size}`;
        
        if (this.spriteCache.has(cacheKey)) {
            return this.spriteCache.get(cacheKey);
        }
        
        // Create off-screen canvas for sprite caching
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        // Render sprite to cache canvas
        spriteFunction(ctx, 0, 0, size);
        
        // Store in cache with size management
        if (this.spriteCacheSize >= this.maxCacheSize) {
            // Clear oldest entries if cache is full
            const firstKey = this.spriteCache.keys().next().value;
            this.spriteCache.delete(firstKey);
            this.spriteCacheSize--;
        }
        
        this.spriteCache.set(cacheKey, canvas);
        this.spriteCacheSize++;
        
        return canvas;
    }
    
    clear() {
        if (!this.ctx) {
            console.error('Renderer: No rendering context available');
            return;
        }
        
        // Use dark gray instead of black for less jarring sprite borders
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Optimized sprite rendering with caching
    renderCachedSprite(spriteKey, spriteFunction, x, y, size) {
        if (!spriteFunction || typeof spriteFunction !== 'function') {
            return false;
        }
        
        try {
            // Use cache for static sprites (floor, decorations)
            if (spriteKey && (spriteKey.includes('floor') || spriteKey.includes('decoration'))) {
                const cachedCanvas = this.getCachedSprite(spriteKey, spriteFunction, size);
                this.ctx.drawImage(cachedCanvas, x, y);
                return true;
            } else {
                // Render dynamic sprites directly (entities, animations)
                spriteFunction(this.ctx, x, y, size);
                return true;
            }
        } catch (error) {
            console.warn(`Failed to render sprite ${spriteKey}:`, error);
            return false;
        }
    }
    
    updateCamera(playerX, playerY) {
        const oldCameraX = this.cameraX;
        const oldCameraY = this.cameraY;
        
        // Center camera on player
        this.cameraX = playerX - Math.floor(CONFIG.VIEWPORT_WIDTH / 2);
        this.cameraY = playerY - Math.floor(CONFIG.VIEWPORT_HEIGHT / 2);
        
        // Clamp camera to map bounds
        this.cameraX = Math.max(0, Math.min(CONFIG.GRID_WIDTH - CONFIG.VIEWPORT_WIDTH, this.cameraX));
        this.cameraY = Math.max(0, Math.min(CONFIG.GRID_HEIGHT - CONFIG.VIEWPORT_HEIGHT, this.cameraY));
        
        // Mark regions as dirty if camera moved
        if (oldCameraX !== this.cameraX || oldCameraY !== this.cameraY) {
            this.markViewportDirty();
        }
    }
    
    // Mark viewport as needing redraw
    markViewportDirty() {
        this.dirtyRegions.clear();
        // Mark entire viewport as dirty when camera moves
        const endY = Math.min(this.cameraY + CONFIG.VIEWPORT_HEIGHT, CONFIG.GRID_HEIGHT);
        const endX = Math.min(this.cameraX + CONFIG.VIEWPORT_WIDTH, CONFIG.GRID_WIDTH);
        for (let y = this.cameraY; y < endY; y++) {
            for (let x = this.cameraX; x < endX; x++) {
                this.dirtyRegions.add(`${x},${y}`);
            }
        }
    }
    
    // Mark specific tile as dirty (for entity movement, animations)
    markTileDirty(x, y) {
        this.dirtyRegions.add(`${x},${y}`);
    }
    
    renderMap(map, fogOfWar, explored, forceFullRender = false) {
        if (!this.ctx || !map || !fogOfWar || !explored) {
            console.warn('Renderer: Missing required data for renderMap');
            return;
        }
        
        // Render only the viewport area
        const startX = this.cameraX;
        const endX = Math.min(this.cameraX + CONFIG.VIEWPORT_WIDTH, CONFIG.GRID_WIDTH);
        const startY = this.cameraY;
        const endY = Math.min(this.cameraY + CONFIG.VIEWPORT_HEIGHT, CONFIG.GRID_HEIGHT);
        
        // Performance optimization: only render if something changed or forced
        const shouldRenderAll = true; // Temporarily disable dirty optimization for stability
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                // Skip if not dirty (unless forcing full render) - disabled for stability
                // if (!shouldRenderAll && !this.dirtyRegions.has(`${x},${y}`)) {
                //     continue;
                // }
                
                // Bounds check before accessing arrays
                if (y >= 0 && y < map.length && x >= 0 && x < map[y].length) {
                    this.renderTile(map, fogOfWar, explored, x, y);
                }
            }
        }
        
        // Cache fog state for next frame
        this.lastFogState = fogOfWar.map(row => [...row]);
    }
    
    renderTile(map, fogOfWar, explored, x, y) {
        const tile = map[y][x];
        const pixelX = (x - this.cameraX) * CONFIG.CELL_SIZE;
        const pixelY = (y - this.cameraY) * CONFIG.CELL_SIZE;
        
        // Get theme-specific sprites if available
        const gameState = window.game && window.game.gameState;
        const currentArea = gameState && gameState.currentArea;
        let tileSprites = terrainSprites;
        
        if (currentArea && currentArea.tileSprites) {
            // Use area-specific tile sprites
            const tileType = this.getTileType(tile);
            const customSprite = currentArea.getTileSprite(tileType);
            if (customSprite && typeof customSprite === 'function') {
                if (fogOfWar[y][x]) {
                    if (explored[y][x]) {
                        customSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                        this.ctx.fillStyle = CONFIG.COLORS.FOG_EXPLORED;
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                    } else {
                        this.ctx.fillStyle = CONFIG.COLORS.FOG;
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                    }
                } else {
                    customSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                }
                return;
            }
        }
        
        // Fallback to default rendering
        if (fogOfWar[y][x]) {
            if (explored[y][x]) {
                // Explored but not currently visible - show dimmed terrain sprites
                if (tile === '#' || tile === 1) {
                    terrainSprites.wall(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                } else {
                    terrainSprites.floor(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                }
                
                // Add fog overlay
                this.ctx.fillStyle = CONFIG.COLORS.FOG_EXPLORED;
                this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
            } else {
                // Completely unexplored
                this.ctx.fillStyle = CONFIG.COLORS.FOG;
                this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
            }
        } else {
            // Currently visible - render beautiful sprite tiles
            if (tile === '#' || tile === 1) {
                terrainSprites.wall(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
            } else if (tile === 3) {
                // Decoration - use area-specific decoration
                const decorSprite = currentArea && currentArea.getTileSprite('bones');
                if (decorSprite && typeof decorSprite === 'function') {
                    decorSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                } else {
                    terrainSprites.floor(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                    if (decorationSprites.bones) {
                        decorationSprites.bones(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                    }
                }
            } else if (tile === 4) {
                // Stalagmite - use area-specific decoration
                const stalagmiteSprite = currentArea && currentArea.getTileSprite('stalagmite');
                if (stalagmiteSprite && typeof stalagmiteSprite === 'function') {
                    stalagmiteSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                } else {
                    terrainSprites.floor(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                    if (decorationSprites.stalagmite) {
                        decorationSprites.stalagmite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                    }
                }
            } else if (tile === 5) {
                // Crystal - use area-specific decoration
                const crystalSprite = currentArea && currentArea.getTileSprite('crystal');
                if (crystalSprite && typeof crystalSprite === 'function') {
                    crystalSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                } else {
                    terrainSprites.floor(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                    if (decorationSprites.crystal) {
                        decorationSprites.crystal(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                    }
                }
            } else if (tile === 6) {
                // Flower (forest)
                terrainSprites.floor(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                const flowerSprite = currentArea && currentArea.getTileSprite('flower');
                if (flowerSprite && typeof flowerSprite === 'function') {
                    flowerSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                }
            } else if (tile === 7) {
                // Stone (forest)
                terrainSprites.floor(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                const stoneSprite = currentArea && currentArea.getTileSprite('stone');
                if (stoneSprite && typeof stoneSprite === 'function') {
                    stoneSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                }
            } else if (tile === 8) {
                // Bush (forest)
                terrainSprites.floor(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                const bushSprite = currentArea && currentArea.getTileSprite('bush');
                if (bushSprite && typeof bushSprite === 'function') {
                    bushSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                }
            } else {
                terrainSprites.floor(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
            }
        }
    }
    
    getTileType(tile) {
        if (tile === '#' || tile === 1) return 'wall';
        if (tile === 0 || tile === '.') return 'floor';
        if (tile === 3) return 'decoration';
        if (tile === 4) return 'stalagmite';
        if (tile === 5) return 'crystal';
        if (tile === 6) return 'flower';
        if (tile === 7) return 'stone';
        if (tile === 8) return 'bush';
        return 'floor';
    }
    
    renderStairs(x, y, fogOfWar) {
        if (!this.ctx || fogOfWar === null || fogOfWar === undefined ||
            x < 0 || y < 0 || y >= fogOfWar.length || x >= fogOfWar[0].length) {
            return;
        }
        
        // Check if stairs are in viewport
        if (x >= this.cameraX && x < this.cameraX + CONFIG.VIEWPORT_WIDTH &&
            y >= this.cameraY && y < this.cameraY + CONFIG.VIEWPORT_HEIGHT &&
            !fogOfWar[y][x]) {
            
            const pixelX = (x - this.cameraX) * CONFIG.CELL_SIZE;
            const pixelY = (y - this.cameraY) * CONFIG.CELL_SIZE;
            terrainSprites.stairs(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
        }
    }
    
    renderItems(items, fogOfWar) {
        if (!this.ctx || !items || !fogOfWar) {
            return;
        }
        
        for (const item of items) {
            // Bounds check for fog of war access
            if (item.y < 0 || item.y >= fogOfWar.length || 
                item.x < 0 || item.x >= fogOfWar[0].length) {
                continue;
            }
            
            // Check if item is in viewport
            if (item.x >= this.cameraX && item.x < this.cameraX + CONFIG.VIEWPORT_WIDTH &&
                item.y >= this.cameraY && item.y < this.cameraY + CONFIG.VIEWPORT_HEIGHT &&
                !fogOfWar[item.y][item.x]) {
                
                const pixelX = (item.x - this.cameraX) * CONFIG.CELL_SIZE;
                const pixelY = (item.y - this.cameraY) * CONFIG.CELL_SIZE;
                
                const sprite = ITEM_SPRITES[item.type];
                if (sprite && typeof sprite === 'function') {
                    try {
                        sprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                    } catch (error) {
                        console.warn('Failed to render item sprite:', error);
                        // Draw fallback rectangle
                        this.ctx.fillStyle = '#ff0';
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                    }
                }
            }
        }
    }
    
    renderEnemies(enemies, fogOfWar) {
        if (!this.ctx || !enemies || !fogOfWar) {
            return;
        }
        
        for (const enemy of enemies) {
            // Bounds check for fog of war access
            if (enemy.y < 0 || enemy.y >= fogOfWar.length || 
                enemy.x < 0 || enemy.x >= fogOfWar[0].length) {
                continue;
            }
            
            // Check if enemy is in viewport
            if (enemy.x >= this.cameraX && enemy.x < this.cameraX + CONFIG.VIEWPORT_WIDTH &&
                enemy.y >= this.cameraY && enemy.y < this.cameraY + CONFIG.VIEWPORT_HEIGHT &&
                !fogOfWar[enemy.y][enemy.x]) {
                
                const pixelX = (enemy.x - this.cameraX) * CONFIG.CELL_SIZE;
                const pixelY = (enemy.y - this.cameraY) * CONFIG.CELL_SIZE;
                
                const sprite = ENEMY_SPRITES[enemy.type];
                if (sprite && typeof sprite === 'function') {
                    try {
                        sprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                    } catch (error) {
                        console.warn('Failed to render enemy sprite:', error);
                        // Draw fallback rectangle
                        this.ctx.fillStyle = '#f00';
                        this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
                    }
                }
                
                // Render health bar if damaged
                if (enemy.hp < enemy.maxHp) {
                    this.renderHealthBar(
                        pixelX, 
                        pixelY - 4,
                        CONFIG.CELL_SIZE,
                        3,
                        enemy.hp / enemy.maxHp
                    );
                }
            }
        }
    }
    
    renderPlayer(player) {
        if (!this.ctx || !player) {
            return;
        }
        
        const x = (player.x - this.cameraX) * CONFIG.CELL_SIZE;
        const y = (player.y - this.cameraY) * CONFIG.CELL_SIZE;
        
        // Draw player sprite with facing direction
        try {
            if (playerSprites && playerSprites.default && typeof playerSprites.default === 'function') {
                playerSprites.default(this.ctx, x, y, CONFIG.CELL_SIZE, player.facing);
            } else {
                // Fallback player rendering
                this.ctx.fillStyle = CONFIG.COLORS.PLAYER;
                this.ctx.fillRect(x, y, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
            }
        } catch (error) {
            console.warn('Failed to render player sprite:', error);
            // Fallback player rendering
            this.ctx.fillStyle = CONFIG.COLORS.PLAYER;
            this.ctx.fillRect(x, y, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        }
        
        // Draw status effect indicators
        if (CONFIG.FEATURES.STATUS_EFFECTS && player.statusEffects.length > 0) {
            this.renderStatusEffects(x, y, player.statusEffects);
        }
        
        // Draw health bar if damaged or in combat
        if (player.hp < player.maxHp || this.isPlayerInCombat(player)) {
            this.renderPlayerHealthBar(x, y, player.hp / player.maxHp);
        }
    }
    
    isPlayerInCombat(player) {
        // Check if any enemies are adjacent to player
        if (!window.game || !window.game.gameState) return false;
        
        const enemies = window.game.gameState.enemies;
        return enemies.some(enemy => {
            const dist = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
            return dist <= 1.5 && !window.game.gameState.fogOfWar[enemy.y][enemy.x];
        });
    }
    
    renderPlayerHealthBar(x, y, percentage) {
        const barWidth = CONFIG.CELL_SIZE;
        const barHeight = 3;
        const barY = y - 6;
        
        // Background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, barY, barWidth, barHeight);
        
        // Health fill with color based on health level
        if (percentage > 0.6) {
            this.ctx.fillStyle = '#4a4';
        } else if (percentage > 0.3) {
            this.ctx.fillStyle = '#aa4';
        } else {
            this.ctx.fillStyle = '#a44';
        }
        this.ctx.fillRect(x, barY, barWidth * percentage, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, barY, barWidth, barHeight);
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
        // Account for camera position when rendering
        const pixelX = (x - this.cameraX) * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const pixelY = (y - this.cameraY) * CONFIG.CELL_SIZE;
        
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