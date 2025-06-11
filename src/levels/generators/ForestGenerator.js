class ForestGenerator extends BaseGenerator {
    constructor() {
        super('forest');
    }
    
    generate(width, height, config) {
        const map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = 0;
            }
        }
        
        const rooms = this.generateClearings(width, height, config);
        this.carveRooms(map, rooms);
        this.addTrees(map, rooms, config);
        this.connectWithPaths(map, rooms, config);
        this.addForestFeatures(map, rooms, config);
        
        return { map, rooms };
    }
    
    generateClearings(width, height, config) {
        const clearings = [];
        const clearingCount = config.baseRoomCount + Math.floor(config.roomsPerFloor * (config.currentFloor - 1));
        
        for (let i = 0; i < clearingCount * 3; i++) {
            const size = Math.floor(Math.random() * (config.maxRoomSize - config.minRoomSize + 1)) + config.minRoomSize;
            const x = Math.floor(Math.random() * (width - size - 4)) + 2;
            const y = Math.floor(Math.random() * (height - size - 4)) + 2;
            
            const clearing = {
                x: x,
                y: y,
                width: size,
                height: size,
                shape: 'circular',
                radius: Math.floor(size / 2)
            };
            
            if (!this.clearingOverlaps(clearing, clearings)) {
                clearings.push(clearing);
                if (clearings.length >= clearingCount) break;
            }
        }
        
        return clearings;
    }
    
    clearingOverlaps(clearing, clearings) {
        for (let other of clearings) {
            const dist = Math.sqrt(
                Math.pow(clearing.x + clearing.radius - other.x - other.radius, 2) +
                Math.pow(clearing.y + clearing.radius - other.y - other.radius, 2)
            );
            if (dist < clearing.radius + other.radius + 3) {
                return true;
            }
        }
        return false;
    }
    
    carveRooms(map, clearings) {
        for (let clearing of clearings) {
            const centerX = clearing.x + clearing.radius;
            const centerY = clearing.y + clearing.radius;
            
            for (let y = clearing.y; y < clearing.y + clearing.height; y++) {
                for (let x = clearing.x; x < clearing.x + clearing.width; x++) {
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= clearing.radius) {
                        if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
                            map[y][x] = 0;
                        }
                    }
                }
            }
        }
    }
    
    addTrees(map, clearings, config) {
        const treeChance = 0.15;
        
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[0].length; x++) {
                if (map[y][x] === 0 && !this.isInClearing(x, y, clearings)) {
                    if (Math.random() < treeChance) {
                        map[y][x] = 1;
                    }
                }
            }
        }
        
        this.createTreeClusters(map, clearings);
    }
    
    createTreeClusters(map, clearings) {
        const clusterCount = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < clusterCount; i++) {
            const x = Math.floor(Math.random() * (map[0].length - 6)) + 3;
            const y = Math.floor(Math.random() * (map.length - 6)) + 3;
            const size = Math.floor(Math.random() * 3) + 2;
            
            for (let dy = -size; dy <= size; dy++) {
                for (let dx = -size; dx <= size; dx++) {
                    const px = x + dx;
                    const py = y + dy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist <= size && py >= 0 && py < map.length && 
                        px >= 0 && px < map[0].length &&
                        !this.isInClearing(px, py, clearings)) {
                        if (Math.random() < 0.7) {
                            map[py][px] = 1;
                        }
                    }
                }
            }
        }
    }
    
    isInClearing(x, y, clearings) {
        for (let clearing of clearings) {
            const centerX = clearing.x + clearing.radius;
            const centerY = clearing.y + clearing.radius;
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= clearing.radius + 1) {
                return true;
            }
        }
        return false;
    }
    
    connectWithPaths(map, clearings, config) {
        for (let i = 0; i < clearings.length - 1; i++) {
            this.createNaturalPath(map, clearings[i], clearings[i + 1], config);
        }
    }
    
    createNaturalPath(map, clearing1, clearing2, config) {
        const start = {
            x: clearing1.x + clearing1.radius,
            y: clearing1.y + clearing1.radius
        };
        const end = {
            x: clearing2.x + clearing2.radius,
            y: clearing2.y + clearing2.radius
        };
        
        let current = { ...start };
        const pathWidth = 2;
        
        while (Math.abs(current.x - end.x) > 1 || Math.abs(current.y - end.y) > 1) {
            const dx = end.x - current.x;
            const dy = end.y - current.y;
            
            if (Math.random() < 0.8) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    current.x += dx > 0 ? 1 : -1;
                } else {
                    current.y += dy > 0 ? 1 : -1;
                }
            } else {
                if (Math.random() < 0.5 && dy !== 0) {
                    current.y += dy > 0 ? 1 : -1;
                } else if (dx !== 0) {
                    current.x += dx > 0 ? 1 : -1;
                }
            }
            
            for (let w = -Math.floor(pathWidth/2); w <= Math.floor(pathWidth/2); w++) {
                for (let h = -Math.floor(pathWidth/2); h <= Math.floor(pathWidth/2); h++) {
                    const px = current.x + w;
                    const py = current.y + h;
                    if (py >= 0 && py < map.length && px >= 0 && px < map[0].length) {
                        map[py][px] = 0;
                    }
                }
            }
        }
    }
    
    addForestFeatures(map, clearings, config) {
        for (let clearing of clearings) {
            if (Math.random() < 0.3) {
                this.addFlowers(map, clearing);
            }
            
            if (Math.random() < 0.2) {
                this.addStones(map, clearing);
            }
        }
        
        this.addBushes(map, clearings);
    }
    
    addFlowers(map, clearing) {
        const count = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * (clearing.radius - 2);
            const x = Math.floor(clearing.x + clearing.radius + Math.cos(angle) * dist);
            const y = Math.floor(clearing.y + clearing.radius + Math.sin(angle) * dist);
            
            if (map[y] && map[y][x] === 0) {
                map[y][x] = 6;
            }
        }
    }
    
    addStones(map, clearing) {
        const x = Math.floor(clearing.x + clearing.radius + (Math.random() - 0.5) * clearing.radius);
        const y = Math.floor(clearing.y + clearing.radius + (Math.random() - 0.5) * clearing.radius);
        
        if (map[y] && map[y][x] === 0) {
            map[y][x] = 7;
        }
    }
    
    addBushes(map, clearings) {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[0].length; x++) {
                if (map[y][x] === 0 && Math.random() < 0.02) {
                    let nearTree = false;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (map[y + dy] && map[y + dy][x + dx] === 1) {
                                nearTree = true;
                                break;
                            }
                        }
                    }
                    
                    if (nearTree) {
                        map[y][x] = 8;
                    }
                }
            }
        }
    }
}

window.ForestGenerator = ForestGenerator;