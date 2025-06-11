class CavernGenerator extends BaseGenerator {
    constructor() {
        super('cavern');
    }
    
    generate(width, height, config) {
        const result = super.generate(width, height, config);
        
        this.addCavernFeatures(result.map, result.rooms, config);
        this.smoothCavernWalls(result.map);
        
        return result;
    }
    
    createRoom(width, height, config) {
        const room = super.createRoom(width, height, config);
        if (!room) return null;
        
        if (Math.random() < 0.3) {
            room.shape = 'irregular';
            room.cornerRadius = Math.floor(Math.min(room.width, room.height) * 0.3);
        }
        
        return room;
    }
    
    carveRooms(map, rooms) {
        for (let room of rooms) {
            if (room.shape === 'irregular') {
                this.carveIrregularRoom(map, room);
            } else {
                super.carveRooms(map, [room]);
            }
        }
    }
    
    carveIrregularRoom(map, room) {
        const centerX = room.x + room.width / 2;
        const centerY = room.y + room.height / 2;
        const radiusX = room.width / 2;
        const radiusY = room.height / 2;
        
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                const dx = (x - centerX) / radiusX;
                const dy = (y - centerY) / radiusY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 0.9 + Math.random() * 0.2) {
                    if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
                        map[y][x] = 0;
                    }
                }
            }
        }
    }
    
    createCorridor(map, room1, room2, config) {
        if (Math.random() < 0.2) {
            this.createWindingCorridor(map, room1, room2, config);
        } else {
            super.createCorridor(map, room1, room2, config);
        }
    }
    
    createWindingCorridor(map, room1, room2, config) {
        const start = {
            x: Math.floor(room1.x + room1.width / 2),
            y: Math.floor(room1.y + room1.height / 2)
        };
        const end = {
            x: Math.floor(room2.x + room2.width / 2),
            y: Math.floor(room2.y + room2.height / 2)
        };
        
        let current = { ...start };
        const steps = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
        
        for (let i = 0; i < steps; i++) {
            const dx = end.x - current.x;
            const dy = end.y - current.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                current.x += dx > 0 ? 1 : -1;
            } else if (dy !== 0) {
                current.y += dy > 0 ? 1 : -1;
            }
            
            if (Math.random() < 0.3) {
                if (Math.random() < 0.5 && Math.abs(dy) > 2) {
                    current.y += dy > 0 ? 1 : -1;
                } else if (Math.abs(dx) > 2) {
                    current.x += dx > 0 ? 1 : -1;
                }
            }
            
            for (let w = 0; w < config.corridorWidth; w++) {
                for (let h = 0; h < config.corridorWidth; h++) {
                    const px = current.x + w;
                    const py = current.y + h;
                    if (py >= 0 && py < map.length && px >= 0 && px < map[0].length) {
                        map[py][px] = 0;
                    }
                }
            }
        }
    }
    
    addCavernFeatures(map, rooms, config) {
        for (let room of rooms) {
            if (Math.random() < 0.2) {
                this.addStalagmites(map, room);
            }
            
            if (Math.random() < 0.1) {
                this.addCrystals(map, room);
            }
        }
    }
    
    addStalagmites(map, room) {
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            const x = room.x + Math.floor(Math.random() * room.width);
            const y = room.y + Math.floor(Math.random() * room.height);
            if (map[y] && map[y][x] === 0) {
                map[y][x] = 4;
            }
        }
    }
    
    addCrystals(map, room) {
        const x = room.x + Math.floor(Math.random() * room.width);
        const y = room.y + Math.floor(Math.random() * room.height);
        if (map[y] && map[y][x] === 0) {
            map[y][x] = 5;
        }
    }
    
    smoothCavernWalls(map) {
        const height = map.length;
        const width = map[0].length;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (map[y][x] === 1) {
                    let floorNeighbors = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (map[y + dy][x + dx] === 0) {
                                floorNeighbors++;
                            }
                        }
                    }
                    
                    if (floorNeighbors >= 5) {
                        map[y][x] = 2;
                    }
                }
            }
        }
    }
}

window.CavernGenerator = CavernGenerator;