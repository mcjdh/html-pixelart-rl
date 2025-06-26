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
        this.lastCameraX = null;
        this.lastCameraY = null;
        
        // Enable pixel art rendering
        this.ctx.imageSmoothingEnabled = false;
        
        // Cache for dirty region tracking and sprite optimization
        this.dirtyRegions = new Set();
        this.lastFogState = null;
        this.animatedTiles = new Set(); // Track tiles with animated sprites
        this.hasRenderedOnce = false; // Ensure first frame renders
        
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
    
    // Selective clearing - only clear changed areas
    clearDirtyRegions() {
        if (!this.ctx || this.dirtyRegions.size === 0) {
            return;
        }
        
        this.ctx.fillStyle = '#222';
        
        // Clear only dirty tiles
        for (const tileKey of this.dirtyRegions) {
            const [x, y] = tileKey.split(',').map(Number);
            
            // Only clear if tile is in viewport
            if (x >= this.cameraX && x < this.cameraX + CONFIG.VIEWPORT_WIDTH &&
                y >= this.cameraY && y < this.cameraY + CONFIG.VIEWPORT_HEIGHT) {
                
                const pixelX = (x - this.cameraX) * CONFIG.CELL_SIZE;
                const pixelY = (y - this.cameraY) * CONFIG.CELL_SIZE;
                this.ctx.fillRect(pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
            }
        }
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
            if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
                console.warn(`Failed to render sprite ${spriteKey}:`, error);
            }
            return false;
        }
    }
    
    /**
     * Safely render a sprite with error handling and fallback
     */
    renderSpriteSafe(spriteFunc, x, y, size, fallbackColor = '#444') {
        try {
            if (spriteFunc && typeof spriteFunc === 'function') {
                spriteFunc(this.ctx, x, y, size);
                return true;
            } else {
                // Fallback rendering
                this.ctx.fillStyle = fallbackColor;
                this.ctx.fillRect(x, y, size, size);
                return false;
            }
        } catch (error) {
            if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
                console.warn('Sprite render error:', error);
            }
            // Fallback rendering
            this.ctx.fillStyle = fallbackColor;
            this.ctx.fillRect(x, y, size, size);
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
        
        // Efficiently mark only new regions as dirty when camera moves
        if (oldCameraX !== this.cameraX || oldCameraY !== this.cameraY) {
            this.markCameraMovementDirty(oldCameraX, oldCameraY);
        }
    }
    
    // Efficiently mark only newly visible regions when camera moves
    markCameraMovementDirty(oldCameraX, oldCameraY) {
        const deltaX = this.cameraX - oldCameraX;
        const deltaY = this.cameraY - oldCameraY;
        
        // If camera moved too far, mark entire viewport
        if (Math.abs(deltaX) >= CONFIG.VIEWPORT_WIDTH || Math.abs(deltaY) >= CONFIG.VIEWPORT_HEIGHT) {
            this.markViewportDirty();
            return;
        }
        
        const startX = this.cameraX;
        const endX = Math.min(this.cameraX + CONFIG.VIEWPORT_WIDTH, CONFIG.GRID_WIDTH);
        const startY = this.cameraY;
        const endY = Math.min(this.cameraY + CONFIG.VIEWPORT_HEIGHT, CONFIG.GRID_HEIGHT);
        
        // Mark new columns if moved horizontally
        if (deltaX > 0) {
            // Moving right - mark new right edge
            const newX = Math.min(endX - deltaX, endX - 1);
            for (let x = newX; x < endX; x++) {
                for (let y = startY; y < endY; y++) {
                    this.dirtyRegions.add(`${x},${y}`);
                }
            }
        } else if (deltaX < 0) {
            // Moving left - mark new left edge
            const newX = Math.max(startX - deltaX, startX);
            for (let x = startX; x < newX; x++) {
                for (let y = startY; y < endY; y++) {
                    this.dirtyRegions.add(`${x},${y}`);
                }
            }
        }
        
        // Mark new rows if moved vertically
        if (deltaY > 0) {
            // Moving down - mark new bottom edge
            const newY = Math.min(endY - deltaY, endY - 1);
            for (let y = newY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    this.dirtyRegions.add(`${x},${y}`);
                }
            }
        } else if (deltaY < 0) {
            // Moving up - mark new top edge
            const newY = Math.max(startY - deltaY, startY);
            for (let y = startY; y < newY; y++) {
                for (let x = startX; x < endX; x++) {
                    this.dirtyRegions.add(`${x},${y}`);
                }
            }
        }
    }
    
    // Mark viewport as needing redraw (used for major changes)
    markViewportDirty() {
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

        // Optimization: Check if we need to render based on fog changes
        const gameState = window.game && window.game.gameState;
        const shouldFullRender = forceFullRender || !this.hasRenderedOnce || 
                                (gameState && gameState.hasFogChanged && gameState.hasFogChanged()) ||
                                this.dirtyRegions.size > CONFIG.VIEWPORT_WIDTH * CONFIG.VIEWPORT_HEIGHT * CONFIG.RENDERING.DIRTY_RECT_THRESHOLD;

        if (shouldFullRender) {
            // Full render for major changes
            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    if (y >= 0 && y < map.length && x >= 0 && x < map[y].length) {
                        this.renderTile(map, fogOfWar, explored, x, y);
                    }
                }
            }
        } else {
            // Selective render for minor changes
            for (const tileKey of this.dirtyRegions) {
                const [x, y] = tileKey.split(',').map(Number);
                
                // Only render if tile is in viewport
                if (x >= startX && x < endX && y >= startY && y < endY &&
                    y >= 0 && y < map.length && x >= 0 && x < map[y].length) {
                    this.renderTile(map, fogOfWar, explored, x, y);
                }
            }
        }

        // Cache fog state for next frame (used for fog change detection)
        this.lastFogState = fogOfWar.map(row => [...row]);
        
        // Mark that we've completed at least one render
        this.hasRenderedOnce = true;
        
        // Clear dirty regions but preserve animated tiles
        const newDirtyRegions = new Set();
        for (const tileKey of this.animatedTiles) {
            newDirtyRegions.add(tileKey);
        }
        this.dirtyRegions = newDirtyRegions;
    }
    
    renderTile(map, fogOfWar, explored, x, y) {
        const tile = map[y][x];
        const pixelX = (x - this.cameraX) * CONFIG.CELL_SIZE;
        const pixelY = (y - this.cameraY) * CONFIG.CELL_SIZE;
        
        // Track animated tiles for continuous updates
        if (tile === 5) { // Crystal tiles need animation
            this.animatedTiles.add(`${x},${y}`);
        }
        
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
                    this.renderSpriteSafe(terrainSprites?.wall, pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.COLORS.WALL);
                } else {
                    this.renderSpriteSafe(terrainSprites?.floor, pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.COLORS.FLOOR);
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
                this.renderSpriteSafe(terrainSprites?.wall, pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.COLORS.WALL);
            } else if (tile === 3) {
                // Decoration - use area-specific decoration
                const decorSprite = currentArea && currentArea.getTileSprite('bones');
                if (decorSprite && typeof decorSprite === 'function') {
                    decorSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                } else {
                    this.renderSpriteSafe(terrainSprites?.floor, pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.COLORS.FLOOR);
                    if (decorationSprites?.bones) {
                        this.renderSpriteSafe(decorationSprites.bones, pixelX, pixelY, CONFIG.CELL_SIZE);
                    }
                }
            } else if (tile === 4) {
                // Stalagmite - use area-specific decoration
                const stalagmiteSprite = currentArea && currentArea.getTileSprite('stalagmite');
                if (stalagmiteSprite && typeof stalagmiteSprite === 'function') {
                    stalagmiteSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                } else {
                    this.renderSpriteSafe(terrainSprites?.floor, pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.COLORS.FLOOR);
                    if (decorationSprites?.stalagmite) {
                        this.renderSpriteSafe(decorationSprites.stalagmite, pixelX, pixelY, CONFIG.CELL_SIZE);
                    }
                }
            } else if (tile === 5) {
                // Crystal - use area-specific decoration
                const crystalSprite = currentArea && currentArea.getTileSprite('crystal');
                if (crystalSprite && typeof crystalSprite === 'function') {
                    crystalSprite(this.ctx, pixelX, pixelY, CONFIG.CELL_SIZE);
                } else {
                    this.renderSpriteSafe(terrainSprites?.floor, pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.COLORS.FLOOR);
                    if (decorationSprites?.crystal) {
                        this.renderSpriteSafe(decorationSprites.crystal, pixelX, pixelY, CONFIG.CELL_SIZE);
                    }
                }
            } else if (tile === 6) {
                // Flower (forest)
                this.renderSpriteSafe(terrainSprites?.floor, pixelX, pixelY, CONFIG.CELL_SIZE, CONFIG.COLORS.FLOOR);
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
        this.maxPoolSize = CONFIG.RENDERING.PARTICLES.POOL_MAX;
        this.cleanupThreshold = CONFIG.RENDERING.PARTICLES.CLEANUP_THRESHOLD;
        
        // Pre-allocate initial pool for better performance
        this.preAllocatePool(CONFIG.RENDERING.PARTICLES.INITIAL_POOL_SIZE);
        
        // Performance tracking
        this.lastCleanup = Date.now();
        this.cleanupInterval = 10000; // Clean up every 10 seconds
    }
    
    preAllocatePool(size) {
        for (let i = 0; i < size; i++) {
            this.particlePool.push({
                x: 0, y: 0, vx: 0, vy: 0,
                color: '', lifetime: 0, maxLifetime: 0
            });
        }
    }
    
    addParticle(x, y, vx, vy, color, lifetime) {
        // Enforce maximum active particles limit to prevent memory bloat
        if (this.particles.length >= this.maxPoolSize * 2) {
            // Remove oldest particle if we hit the limit
            const removed = this.particles.shift();
            if (removed && this.particlePool.length < this.maxPoolSize) {
                this.particlePool.push(removed);
            }
        }
        
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
        // Batch particle updates for better performance
        const deadParticles = [];
        
        for (let i = 0; i < this.particles.length; i++) {
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
                deadParticles.push(i);
            }
        }
        
        // Remove dead particles and return to pool in batch
        for (let i = deadParticles.length - 1; i >= 0; i--) {
            const deadIndex = deadParticles[i];
            const deadParticle = this.particles[deadIndex];
            
            // Return to pool if there's space
            if (this.particlePool.length < this.maxPoolSize) {
                this.particlePool.push(deadParticle);
            }
            
            // Remove from active particles
            this.particles.splice(deadIndex, 1);
        }
        
        // Periodic cleanup to prevent memory bloat
        this.periodicCleanup();
    }
    
    periodicCleanup() {
        const now = Date.now();
        if (now - this.lastCleanup > this.cleanupInterval) {
            // If pool is too large, trim it down
            if (this.particlePool.length > this.cleanupThreshold) {
                this.particlePool.length = this.maxPoolSize;
            }
            this.lastCleanup = now;
        }
    }
    
    clear() {
        // Clear all particles and return them to pool
        for (const particle of this.particles) {
            if (this.particlePool.length < this.maxPoolSize) {
                this.particlePool.push(particle);
            }
        }
        this.particles.length = 0;
    }
}