class MushroomGenerator extends BaseGenerator {
    constructor() {
        super('mushroom');
    }
    
    generate(width, height, config) {
        const result = super.generate(width, height, config);
        
        // Add mushroom-specific features
        this.addMushroomClusters(result.map, result.rooms, config);
        this.addSporeVents(result.map, result.rooms, config);
        this.addMyceliumNetworks(result.map, result.rooms, config);
        
        return result;
    }
    
    addMushroomClusters(map, rooms, config) {
        const clusterChance = config.mushroomClusterChance || 0.4;
        
        rooms.forEach(room => {
            if (Math.random() < clusterChance) {
                const clusterCount = 1 + Math.floor(Math.random() * 3); // 1-3 clusters per room
                
                for (let c = 0; c < clusterCount; c++) {
                    const centerX = room.x + 2 + Math.floor(Math.random() * (room.width - 4));
                    const centerY = room.y + 2 + Math.floor(Math.random() * (room.height - 4));
                    
                    // Create cluster around center point
                    for (let dx = -2; dx <= 2; dx++) {
                        for (let dy = -2; dy <= 2; dy++) {
                            const x = centerX + dx;
                            const y = centerY + dy;
                            const distance = Math.abs(dx) + Math.abs(dy);
                            
                            if (map[y] && map[y][x] && map[y][x].type === 'floor' && distance <= 2) {
                                const chance = 1.0 - (distance * 0.3); // Higher chance closer to center
                                if (Math.random() < chance) {
                                    // Vary mushroom types based on distance from center
                                    if (distance === 0) {
                                        map[y][x].decoration = 'giantMushroom';
                                    } else {
                                        map[y][x].decoration = 'mushroom';
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    
    addSporeVents(map, rooms, config) {
        const sporeChance = config.sporeCloudChance || 0.2;
        
        rooms.forEach(room => {
            if (Math.random() < sporeChance) {
                // Add 1-2 spore vents per selected room
                const ventCount = 1 + Math.floor(Math.random() * 2);
                
                for (let v = 0; v < ventCount; v++) {
                    const x = room.x + 1 + Math.floor(Math.random() * (room.width - 2));
                    const y = room.y + 1 + Math.floor(Math.random() * (room.height - 2));
                    
                    if (map[y] && map[y][x] && map[y][x].type === 'floor') {
                        map[y][x].decoration = 'spores';
                        map[y][x].hazard = 'spore_cloud'; // Can cause status effects
                    }
                }
            }
        });
    }
    
    addMyceliumNetworks(map, rooms, config) {
        // Connect rooms with visible mycelium networks (floor variations)
        for (let i = 0; i < rooms.length - 1; i++) {
            const room1 = rooms[i];
            const room2 = rooms[i + 1];
            
            // Find connection points
            const x1 = room1.x + Math.floor(room1.width / 2);
            const y1 = room1.y + Math.floor(room1.height / 2);
            const x2 = room2.x + Math.floor(room2.width / 2);
            const y2 = room2.y + Math.floor(room2.height / 2);
            
            // Create mycelium trail along the corridor path
            this.addMyceliumPath(map, x1, y1, x2, y2);
        }
    }
    
    addMyceliumPath(map, x1, y1, x2, y2) {
        let currentX = x1;
        let currentY = y1;
        
        while (currentX !== x2 || currentY !== y2) {
            // Add mycelium network visuals to floor tiles
            if (map[currentY] && map[currentY][currentX] && map[currentY][currentX].type === 'floor') {
                if (Math.random() < 0.3) { // 30% chance for visible mycelium
                    map[currentY][currentX].variant = 'mycelium';
                }
            }
            
            // Move toward target
            if (currentX < x2) currentX++;
            else if (currentX > x2) currentX--;
            else if (currentY < y2) currentY++;
            else if (currentY > y2) currentY--;
        }
    }
    
    // Override room decoration to add mushroom-specific touches
    decorateRoom(map, room, config) {
        super.decorateRoom(map, room, config);
        
        // Add bioluminescent patches to walls
        const wallCells = this.findWallCells(map, room);
        wallCells.forEach(cell => {
            if (Math.random() < 0.1) { // 10% chance for glowing wall patches
                map[cell.y][cell.x].variant = 'bioluminescent';
            }
        });
    }
    
    findWallCells(map, room) {
        const wallCells = [];
        
        for (let x = room.x; x < room.x + room.width; x++) {
            for (let y = room.y; y < room.y + room.height; y++) {
                if (map[y] && map[y][x] && map[y][x].type === 'wall') {
                    wallCells.push({x, y});
                }
            }
        }
        
        return wallCells;
    }
}

// Register globally
window.MushroomGenerator = MushroomGenerator;