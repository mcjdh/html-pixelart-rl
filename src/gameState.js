/**
 * Manages the core game state including player, enemies, map, and progression
 * @class GameState
 */
class GameState {
    constructor(renderer = null) {
        this.renderer = renderer; // For dirty region tracking
        this.player = null;
        this.floor = 1;
        this.areaManager = new AreaManager();
        this.currentArea = null;
        this.map = [];
        this.enemies = [];
        this.items = [];
        this.fogOfWar = [];
        this.stairsX = -1;
        this.stairsY = -1;
        this.messages = [];
        this.turn = 0;
        
        // Legacy upgrade system removed - maintained for save compatibility
        this.upgrades = {
            attackCost: 10,
            defenseCost: 10,
            attackLevel: 0,
            defenseLevel: 0
        };
        
        this.settings = {
            particlesEnabled: true,
            soundEnabled: false
        };
        
        this.stats = {
            enemiesKilled: 0,
            goldCollected: 0,
            floorsCompleted: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0
        };
        
        // Victory flag to prevent actions after winning
        this.gameVictory = false;
    }
    
    init() {
        // Register all available areas
        this.registerAreas();
        
        // Load the starting area
        this.loadArea('caverns');
        
        this.generateFloor();
        this.initFogOfWar();
        this.updateFogOfWar(true); // Force initial fog of war calculation
    }
    
    registerAreas() {
        // Register the caverns level
        if (window.cavernsLevel) {
            this.areaManager.registerArea(window.cavernsLevel);
        }
        
        // Register the forest level
        if (window.forestLevel) {
            this.areaManager.registerArea(window.forestLevel);
        }
        
        // Register the mushroom level
        if (window.mushroomLevel) {
            this.areaManager.registerArea(window.mushroomLevel);
            console.log("Mushroom level registered:", window.mushroomLevel.id);
        } else {
            console.warn("Mushroom level not found in window.mushroomLevel");
        }
        
        // Register the stellar level
        if (window.stellarLevel) {
            this.areaManager.registerArea(window.stellarLevel);
            console.log("Stellar level registered:", window.stellarLevel.id);
        } else {
            console.warn("Stellar level not found in window.stellarLevel");
        }
    }
    
    loadArea(areaId) {
        this.currentArea = this.areaManager.loadArea(areaId);
        if (!this.currentArea) {
            console.error(`Failed to load area: ${areaId}`);
            // Fallback to caverns
            this.currentArea = this.areaManager.loadArea('caverns');
        }
        
        // Reset floor to 1 when entering new area
        this.floor = 1;
        this.areaManager.updateAreaProgress(areaId, this.floor);
    }
    
    generateFloor() {
        // Use theme-specific generator if available
        let generator;
        if (this.currentArea && this.currentArea.theme === 'cavern' && window.CavernGenerator) {
            generator = new CavernGenerator();
        } else if (this.currentArea && this.currentArea.theme === 'forest' && window.ForestGenerator) {
            generator = new ForestGenerator();
        } else if (this.currentArea && this.currentArea.theme === 'mushroom' && window.MushroomGenerator) {
            generator = new MushroomGenerator();
        } else if (this.currentArea && this.currentArea.theme === 'stellar' && window.StellarGenerator) {
            generator = new StellarGenerator();
        } else if (this.currentArea && this.currentArea.theme === 'stellar') {
            // Fallback to BaseGenerator for stellar if StellarGenerator not available
            generator = new BaseGenerator();
        } else {
            generator = new MapGenerator();
        }
        
        // Get area-specific map config
        const config = this.currentArea ? 
            this.currentArea.getMapGenerationConfig(this.floor) : 
            { currentFloor: this.floor };
        
        const mapData = generator.generate ? 
            generator.generate(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT, {
                ...config,
                currentFloor: this.floor,
                baseRoomCount: config.baseRoomCount || 5,
                roomsPerFloor: config.roomsPerFloor || 1,
                minRoomSize: config.minRoomSize || 5,
                maxRoomSize: config.maxRoomSize || 10,
                corridorWidth: config.corridorWidth || 1,
                decorationChance: config.decorationChance || 0.1
            }) : 
            new MapGenerator().generate(this.floor);
        
        this.map = mapData.map;
        
        // Place stairs if not already placed by generator
        if (mapData.stairsX !== undefined && mapData.stairsY !== undefined) {
            this.stairsX = mapData.stairsX;
            this.stairsY = mapData.stairsY;
        } else {
            // Place stairs in a room far from player spawn
            this.placeStairsAwayFromPlayer(mapData);
        }
        
        // Create a MapGenerator for spawning operations (needs getRandomFloorTile method)
        this.mapGenerator = new MapGenerator(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
        this.mapGenerator.map = this.map;
        this.mapGenerator.rooms = mapData.rooms || [];
        
        // Override getRandomFloorTile to handle numeric tile format from theme generators
        this.mapGenerator.getRandomFloorTile = () => {
            // Cache floor tiles for better performance
            if (!this.mapGenerator.cachedFloorTiles) {
                this.mapGenerator.cachedFloorTiles = [];
                
                for (let y = 1; y < CONFIG.GRID_HEIGHT - 1; y++) {
                    for (let x = 1; x < CONFIG.GRID_WIDTH - 1; x++) {
                        // Check for both numeric (0) and string ('.') floor tiles
                        if (this.map[y][x] === 0 || this.map[y][x] === '.') {
                            this.mapGenerator.cachedFloorTiles.push({ x, y });
                        }
                    }
                }
            }
            
            if (this.mapGenerator.cachedFloorTiles.length > 0) {
                return this.mapGenerator.cachedFloorTiles[Math.floor(Math.random() * this.mapGenerator.cachedFloorTiles.length)];
            }
            
            return null;
        };
        
        // Create or reset player
        const startX = mapData.startX !== undefined ? mapData.startX : (mapData.rooms && mapData.rooms[0] ? Math.floor(mapData.rooms[0].x + mapData.rooms[0].width / 2) : 2);
        const startY = mapData.startY !== undefined ? mapData.startY : (mapData.rooms && mapData.rooms[0] ? Math.floor(mapData.rooms[0].y + mapData.rooms[0].height / 2) : 2);
        
        if (!this.player) {
            this.player = new Player(startX, startY);
        } else {
            this.player.moveTo(startX, startY);
        }
        
        // Generate entities using the MapGenerator for spawning
        this.spawnEnemies(this.mapGenerator);
        this.spawnItems(this.mapGenerator);
    }
    
    spawnEnemies(generator) {
        this.enemies = [];
        const enemyCount = 3 + this.floor * 2;
        const enemyTypes = this.getEnemyTypesForFloor();
        
        for (let i = 0; i < enemyCount; i++) {
            const pos = this.findSpawnPosition(generator, 5);
            if (pos) {
                const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                this.enemies.push(new Enemy(pos.x, pos.y, type, this.floor));
            }
        }
    }
    
    spawnItems(generator) {
        this.items = [];
        const itemCount = 3 + Math.floor(this.floor / 2);  // Increased from 2 to 3 base items
        
        for (let i = 0; i < itemCount; i++) {
            const pos = this.findSpawnPosition(generator);
            if (pos) {
                // Item spawn chances (REBALANCED - more healing items)
                const roll = Math.random();
                let type = 'gold';
                
                if (roll < 0.04) {
                    type = 'sword';
                } else if (roll < 0.08) {
                    type = 'shield';
                } else if (roll < 0.40) {        // Increased potion chance from 35% to 40%
                    type = 'potion';
                } else if (roll < 0.47) {        // Slight increase to scroll chance
                    type = 'scroll';
                }
                
                const value = type === 'gold' ? 
                    CONFIG.BALANCE.GOLD_VALUE_BASE + 
                    Math.floor(Math.random() * CONFIG.BALANCE.GOLD_VALUE_RANGE) + 
                    this.floor * 2 : null;
                    
                this.items.push(new Item(pos.x, pos.y, type, value));
            }
        }
    }
    
    findSpawnPosition(generator, minDistanceFromPlayer = 0) {
        for (let attempts = 0; attempts < 200; attempts++) {
            const pos = generator.getRandomFloorTile();
            if (pos) {
                // Enhanced validation
                if (!this.isValidSpawnPosition(pos.x, pos.y, minDistanceFromPlayer)) {
                    continue;
                }
                
                return pos;
            }
        }
        return null;
    }
    
    isValidSpawnPosition(x, y, minDistanceFromPlayer = 0) {
        // Check bounds
        if (!this.inBounds(x, y)) return false;
        
        // Check if it's a floor tile
        if (this.isWall(x, y)) return false;
        
        // Check if position is occupied
        if (this.isOccupied(x, y)) return false;
        
        // Check if it's the stairs position
        if (x === this.stairsX && y === this.stairsY) return false;
        
        // Check distance from player
        if (this.player) {
            const dist = Math.sqrt(
                (x - this.player.x) ** 2 + 
                (y - this.player.y) ** 2
            );
            if (dist < minDistanceFromPlayer) return false;
        }
        
        // Make sure it's connected to the floor network (not isolated)
        if (!this.isConnectedToFloor(x, y)) return false;
        
        return true;
    }
    
    isConnectedToFloor(x, y) {
        // Simple connectivity check - ensure there's at least one adjacent floor tile
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        for (const [dx, dy] of directions) {
            const checkX = x + dx;
            const checkY = y + dy;
            if (this.inBounds(checkX, checkY) && !this.isWall(checkX, checkY)) {
                return true;
            }
        }
        return false;
    }
    
    getEnemyTypesForFloor() {
        // Use area-specific enemy types if available
        if (this.currentArea) {
            const areaTypes = this.currentArea.getEnemyTypesForFloor(this.floor);
            if (areaTypes && areaTypes.length > 0) {
                return areaTypes;
            }
        }
        
        // Fallback to default logic
        const types = ['goblin'];
        
        if (this.floor >= 2) {
            types.push('skeleton');
        }
        
        return types;
    }
    
    initFogOfWar() {
        this.fogOfWar = [];
        this.explored = [];
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            this.fogOfWar[y] = [];
            this.explored[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                this.fogOfWar[y][x] = true;   // true = fogged, false = visible
                this.explored[y][x] = false;  // true = explored before
            }
        }
        // Reset fog tracking when initializing new floor
        this.lastPlayerX = undefined;
        this.lastPlayerY = undefined;
        this.lastVisibleTiles = [];
    }
    
    placeStairsAwayFromPlayer(mapData) {
        const rooms = mapData.rooms || [];
        const startX = mapData.startX !== undefined ? mapData.startX : (rooms[0] ? Math.floor(rooms[0].x + rooms[0].width / 2) : 2);
        const startY = mapData.startY !== undefined ? mapData.startY : (rooms[0] ? Math.floor(rooms[0].y + rooms[0].height / 2) : 2);
        
        if (rooms.length > 0) {
            // Find the room farthest from player spawn
            let bestRoom = rooms[rooms.length - 1]; // Default to last room
            let maxDistance = 0;
            
            for (const room of rooms) {
                const roomCenterX = Math.floor(room.x + room.width / 2);
                const roomCenterY = Math.floor(room.y + room.height / 2);
                const distance = Math.sqrt((roomCenterX - startX) ** 2 + (roomCenterY - startY) ** 2);
                
                if (distance > maxDistance) {
                    maxDistance = distance;
                    bestRoom = room;
                }
            }
            
            // Place stairs in the farthest room, but not exactly in center to avoid predictability
            this.stairsX = bestRoom.x + Math.floor(Math.random() * (bestRoom.width - 2)) + 1;
            this.stairsY = bestRoom.y + Math.floor(Math.random() * (bestRoom.height - 2)) + 1;
            
            // Ensure minimum distance from player spawn (at least 5 tiles)
            const finalDistance = Math.sqrt((this.stairsX - startX) ** 2 + (this.stairsY - startY) ** 2);
            if (finalDistance < 5 && rooms.length > 1) {
                // Try a different room if too close
                const alternateRoom = rooms[rooms.length - 2];
                this.stairsX = Math.floor(alternateRoom.x + alternateRoom.width / 2);
                this.stairsY = Math.floor(alternateRoom.y + alternateRoom.height / 2);
            }
        } else {
            // Fallback: place far from spawn
            this.stairsX = CONFIG.GRID_WIDTH - 3;
            this.stairsY = CONFIG.GRID_HEIGHT - 3;
        }
    }
    
    updateFogOfWar(forceUpdate = false) {
        const viewRadius = CONFIG.VIEW_RADIUS;
        const viewRadiusSquared = viewRadius * viewRadius;
        
        // Only update if player position changed or forced
        if (!forceUpdate && this.lastPlayerX === this.player.x && this.lastPlayerY === this.player.y) {
            return;
        }
        
        // Debug logging
        if (CONFIG.DEBUG?.SHOW_AUTO_EXPLORER_LOGS) {
            console.log(`Updating fog of war: player at (${this.player.x}, ${this.player.y}), force=${forceUpdate}`);
        }
        
        // Check if this is the first update (no previous position)
        const isFirstUpdate = this.lastPlayerX === undefined || this.lastPlayerY === undefined;
        
        const oldX = this.lastPlayerX !== undefined ? this.lastPlayerX : this.player.x;
        const oldY = this.lastPlayerY !== undefined ? this.lastPlayerY : this.player.y;
        this.lastPlayerX = this.player.x;
        this.lastPlayerY = this.player.y;
        
        // Calculate new visible tiles
        const newVisibleTiles = this.calculateVisibleTiles(this.player.x, this.player.y, viewRadius, viewRadiusSquared);
        
        if (isFirstUpdate || forceUpdate) {
            // On first update or forced update, just reveal all visible tiles
            for (const tile of newVisibleTiles) {
                const wasExplored = this.explored[tile.y][tile.x];
                this.fogOfWar[tile.y][tile.x] = false;
                this.explored[tile.y][tile.x] = true;
                
                // Track exploration for skill progression
                if (!wasExplored && this.player && this.player.trackAction) {
                    this.player.trackAction('tilesExplored');
                }
                
                if (this.renderer && this.renderer.markTileDirty) {
                    this.renderer.markTileDirty(tile.x, tile.y);
                }
            }
        } else {
            // Normal update - only update changed tiles
            const oldVisibleTiles = this.calculateVisibleTiles(oldX, oldY, viewRadius, viewRadiusSquared);
            
            // Create sets for efficient difference calculation
            const oldSet = new Set(oldVisibleTiles.map(t => `${t.x},${t.y}`));
            const newSet = new Set(newVisibleTiles.map(t => `${t.x},${t.y}`));
            
            // Hide tiles that are no longer visible
            for (const tile of oldVisibleTiles) {
                if (!newSet.has(`${tile.x},${tile.y}`)) {
                    this.fogOfWar[tile.y][tile.x] = true;
                    if (this.renderer && this.renderer.markTileDirty) {
                        this.renderer.markTileDirty(tile.x, tile.y);
                    }
                }
            }
            
            // Show tiles that are newly visible
            for (const tile of newVisibleTiles) {
                if (!oldSet.has(`${tile.x},${tile.y}`)) {
                    const wasExplored = this.explored[tile.y][tile.x];
                    this.fogOfWar[tile.y][tile.x] = false;
                    this.explored[tile.y][tile.x] = true;
                    
                    // Track exploration for skill progression
                    if (!wasExplored && this.player && this.player.trackAction) {
                        this.player.trackAction('tilesExplored');
                    }
                    
                    if (this.renderer && this.renderer.markTileDirty) {
                        this.renderer.markTileDirty(tile.x, tile.y);
                    }
                }
            }
        }
        
        this.lastVisibleTiles = newVisibleTiles;
    }
    
    calculateVisibleTiles(centerX, centerY, viewRadius, viewRadiusSquared) {
        const visibleTiles = [];
        
        // Pre-calculate bounds to avoid repeated checks
        const minX = Math.max(0, centerX - viewRadius);
        const maxX = Math.min(CONFIG.GRID_WIDTH - 1, centerX + viewRadius);
        const minY = Math.max(0, centerY - viewRadius);
        const maxY = Math.min(CONFIG.GRID_HEIGHT - 1, centerY + viewRadius);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distSquared = dx * dx + dy * dy;
                
                if (distSquared <= viewRadiusSquared) {
                    if (this.hasLineOfSight(centerX, centerY, x, y)) {
                        visibleTiles.push({x, y});
                    }
                }
            }
        }
        
        return visibleTiles;
    }
    
    hasLineOfSight(x0, y0, x1, y1) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        
        while (x0 !== x1 || y0 !== y1) {
            if (this.map[y0][x0] === '#') {
                return false;
            }
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        
        return true;
    }
    
    inBounds(x, y) {
        return x >= 0 && x < CONFIG.GRID_WIDTH && 
               y >= 0 && y < CONFIG.GRID_HEIGHT;
    }
    
    isWall(x, y) {
        if (!this.inBounds(x, y)) return true;
        // Handle both string format ('#' for wall) and numeric format (1 for wall)
        return this.map[y][x] === '#' || this.map[y][x] === 1;
    }
    
    isOccupied(x, y) {
        if (this.player.x === x && this.player.y === y) return true;
        if (this.enemies.some(e => e.x === x && e.y === y)) return true;
        return false;
    }
    
    getEnemyAt(x, y) {
        return this.enemies.find(e => e.x === x && e.y === y);
    }
    
    getItemAt(x, y) {
        return this.items.find(i => i.x === x && i.y === y);
    }
    
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
            this.stats.enemiesKilled++;
        }
    }
    
    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }
    
    nextFloor() {
        this.floor++;
        this.stats.floorsCompleted++;
        
        // Check if current area is complete
        if (this.currentArea && this.currentArea.isComplete(this.floor - 1)) {
            // Area complete - check for progression to next area
            this.areaManager.completeArea(this.currentArea.id);
            
            // Show area completion and check for transitions
            this.addMessage(`${this.currentArea.name} completed!`, 'level-msg');
            const transitions = this.areaManager.getAvailableTransitions();
            
            if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
                console.log('Available transitions after completing', this.currentArea.id, ':', transitions.map(t => `${t.id} (newly unlocked: ${t.isNewlyUnlocked}, completed: ${t.isCompleted})`));
            }
            
            if (transitions.length > 0) {
                // Transition to next area
                const nextAreaTransition = transitions[0];
                const nextArea = nextAreaTransition.area;
                this.addMessage(`Entering ${nextArea.name}...`, 'level-msg');
                this.loadArea(nextAreaTransition.id);
                this.generateFloor();
                this.initFogOfWar();
                this.updateFogOfWar(true); // Force initial fog of war calculation
            } else {
                // No more areas - game complete!
                this.addMessage('All areas conquered! Victory!', 'level-msg');
                
                // Trigger victory event for proper handling
                if (typeof window !== 'undefined' && window.GameEvents) {
                    window.GameEvents.emit('campaign.victory', {
                        player: this.player,
                        stats: this.stats,
                        floor: this.floor,
                        completedAreas: Array.from(this.areaManager.completedAreas.keys())
                    });
                }
                
                // Set victory flag to prevent further actions
                this.gameVictory = true;
                return;
            }
        } else {
            // Continue in current area
            const floorData = this.currentArea ? this.currentArea.getFloorData(this.floor) : null;
            if (floorData && floorData.name) {
                this.addMessage(`Entering ${floorData.name}...`, 'level-msg');
            } else {
                this.addMessage(`Descending to floor ${this.floor}...`, 'level-msg');
            }
            
            // Update area progress
            if (this.currentArea) {
                this.areaManager.updateAreaProgress(this.currentArea.id, this.floor);
            }
            
            this.generateFloor();
            this.initFogOfWar();
            this.updateFogOfWar(true); // Force initial fog of war calculation
        }
        
        // Restore some energy
        this.player.restoreEnergy(CONFIG.BALANCE.FLOOR_ENERGY_RESTORE);
        
        // Auto-save progress on floor transitions (QoL improvement)
        try {
            this.saveGame();
        } catch (e) {
            console.warn('Auto-save failed:', e);
        }
    }
    
    addMessage(text, className = '') {
        this.messages.unshift({ text, className, turn: this.turn });
        if (this.messages.length > CONFIG.GAME.MAX_MESSAGES) {
            this.messages.pop();
        }
        
        // Emit message event for narrative UI
        if (typeof window !== 'undefined' && window.GameEvents) {
            window.GameEvents.emit('message.added', {
                text: text,
                className: className
            });
        }
    }
    
    processTurn() {
        this.turn++;
        this.updateFogOfWar();
    }
    
    saveGame() {
        const saveData = {
            version: '1.2',
            player: {
                x: this.player.x,
                y: this.player.y,
                hp: this.player.hp,
                maxHp: this.player.maxHp,
                attack: this.player.attack,
                defense: this.player.defense,
                level: this.player.level,
                exp: this.player.exp,
                expToNext: this.player.expToNext,
                gold: this.player.gold,
                energy: this.player.energy,
                maxEnergy: this.player.maxEnergy,
                skills: this.player.skills,
                actionCounts: this.player.actionCounts
            },
            floor: this.floor,
            currentAreaId: this.currentArea ? this.currentArea.id : null,
            areaManagerState: this.areaManager ? this.areaManager.saveState() : null,
            upgrades: this.upgrades,
            stats: this.stats,
            settings: this.settings,
            explored: this.explored
        };
        
        localStorage.setItem('pixelRoguelikeSave', JSON.stringify(saveData));
        this.addMessage('Game saved!', 'heal-msg');
    }
    
    loadGame() {
        const saveData = localStorage.getItem('pixelRoguelikeSave');
        if (!saveData) return false;
        
        try {
            const data = JSON.parse(saveData);
            
            // Restore player
            this.player = new Player(data.player.x, data.player.y);
            Object.assign(this.player, data.player);
            
            // Restore skill data (backwards compatibility)
            if (data.player.skills) {
                this.player.skills = data.player.skills;
            }
            if (data.player.actionCounts) {
                this.player.actionCounts = data.player.actionCounts;
            }
            
            // Restore game state
            this.floor = data.floor;
            this.upgrades = data.upgrades;
            this.stats = data.stats;
            this.settings = data.settings;
            
            // Restore area state if available
            if (data.currentAreaId && data.areaManagerState) {
                this.registerAreas(); // Ensure areas are registered
                if (this.areaManager) {
                    this.areaManager.loadState(data.areaManagerState);
                    this.loadArea(data.currentAreaId);
                }
            } else {
                // Fallback for old saves
                this.registerAreas();
                this.loadArea('caverns');
            }
            
            // Generate current floor
            this.generateFloor();
            this.player.moveTo(data.player.x, data.player.y);
            
            // Restore explored areas if available
            if (data.explored) {
                this.explored = data.explored;
            } else {
                this.initFogOfWar();
            }
            
            this.addMessage('Game loaded!', 'heal-msg');
            return true;
        } catch (e) {
            console.error('Failed to load save:', e);
            return false;
        }
    }
}