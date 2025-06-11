class GameState {
    constructor() {
        this.player = null;
        this.floor = 1;
        this.map = [];
        this.enemies = [];
        this.items = [];
        this.fogOfWar = [];
        this.stairsX = -1;
        this.stairsY = -1;
        this.messages = [];
        this.turn = 0;
        
        this.upgrades = {
            attackCost: 10,
            defenseCost: 10,
            attackLevel: 0,
            defenseLevel: 0
        };
        
        this.settings = {
            autoExplore: false,
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
    }
    
    init() {
        this.generateFloor();
        this.initFogOfWar();
        this.updateFogOfWar();
    }
    
    generateFloor() {
        const generator = new MapGenerator();
        const mapData = generator.generate(this.floor);
        
        this.map = mapData.map;
        this.stairsX = mapData.stairsX;
        this.stairsY = mapData.stairsY;
        
        // Create or reset player
        if (!this.player) {
            this.player = new Player(mapData.startX, mapData.startY);
        } else {
            this.player.moveTo(mapData.startX, mapData.startY);
        }
        
        // Generate entities
        this.spawnEnemies(generator);
        this.spawnItems(generator);
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
        const itemCount = 2 + Math.floor(this.floor / 2);
        
        for (let i = 0; i < itemCount; i++) {
            const pos = this.findSpawnPosition(generator);
            if (pos) {
                // Item spawn chances
                const roll = Math.random();
                let type = 'gold';
                
                if (roll < 0.1) {
                    type = 'sword';
                } else if (roll < 0.25) {
                    type = 'potion';
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
        for (let attempts = 0; attempts < 100; attempts++) {
            const pos = generator.getRandomFloorTile();
            if (pos) {
                const dist = Math.sqrt(
                    (pos.x - this.player.x) ** 2 + 
                    (pos.y - this.player.y) ** 2
                );
                
                if (dist >= minDistanceFromPlayer && 
                    !this.isOccupied(pos.x, pos.y)) {
                    return pos;
                }
            }
        }
        return null;
    }
    
    getEnemyTypesForFloor() {
        const types = ['goblin'];
        
        if (this.floor >= 2) {
            types.push('skeleton');
        }
        
        // Add more enemy types as floors progress
        // if (this.floor >= 5) types.push('orc');
        // if (this.floor >= 8) types.push('demon');
        
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
    }
    
    updateFogOfWar() {
        const viewRadius = CONFIG.VIEW_RADIUS;
        const viewRadiusSquared = viewRadius * viewRadius;
        
        // Only update if player position changed
        if (this.lastPlayerX === this.player.x && this.lastPlayerY === this.player.y) {
            return;
        }
        
        this.lastPlayerX = this.player.x;
        this.lastPlayerY = this.player.y;
        
        // Reset all tiles to fogged, but keep explored status
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                this.fogOfWar[y][x] = true;
            }
        }
        
        // Pre-calculate bounds to avoid repeated checks
        const minX = Math.max(0, this.player.x - viewRadius);
        const maxX = Math.min(CONFIG.GRID_WIDTH - 1, this.player.x + viewRadius);
        const minY = Math.max(0, this.player.y - viewRadius);
        const maxY = Math.min(CONFIG.GRID_HEIGHT - 1, this.player.y + viewRadius);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const dx = x - this.player.x;
                const dy = y - this.player.y;
                const distSquared = dx * dx + dy * dy;
                
                if (distSquared <= viewRadiusSquared) {
                    if (this.hasLineOfSight(this.player.x, this.player.y, x, y)) {
                        this.fogOfWar[y][x] = false;    // Currently visible
                        this.explored[y][x] = true;     // Mark as explored
                    }
                }
            }
        }
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
        return this.map[y][x] === '#';
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
        this.addMessage(`Descending to floor ${this.floor}...`, 'level-msg');
        
        this.generateFloor();
        this.initFogOfWar();
        this.updateFogOfWar();
        
        // Restore some energy
        this.player.restoreEnergy(CONFIG.BALANCE.FLOOR_ENERGY_RESTORE);
    }
    
    addMessage(text, className = '') {
        this.messages.unshift({ text, className, turn: this.turn });
        if (this.messages.length > CONFIG.GAME.MAX_MESSAGES) {
            this.messages.pop();
        }
    }
    
    processTurn() {
        this.turn++;
        this.updateFogOfWar();
    }
    
    saveGame() {
        const saveData = {
            version: '1.1',
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
                maxEnergy: this.player.maxEnergy
            },
            floor: this.floor,
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
            
            // Restore game state
            this.floor = data.floor;
            this.upgrades = data.upgrades;
            this.stats = data.stats;
            this.settings = data.settings;
            
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