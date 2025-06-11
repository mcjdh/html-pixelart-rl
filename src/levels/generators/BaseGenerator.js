class BaseGenerator {
    constructor(theme) {
        this.theme = theme;
    }
    
    generate(width, height, config) {
        const map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = 1;
            }
        }
        
        const rooms = this.generateRooms(width, height, config);
        this.carveRooms(map, rooms);
        this.connectRooms(map, rooms, config);
        this.addDecorations(map, rooms, config);
        
        // Validate connectivity and fix if needed
        this.validateConnectivity(map, rooms, config);
        
        return { map, rooms };
    }
    
    generateRooms(width, height, config) {
        const rooms = [];
        const targetRoomCount = config.baseRoomCount + Math.floor(config.roomsPerFloor * (config.currentFloor - 1));
        const maxAttempts = targetRoomCount * 10; // Try harder to place rooms
        
        for (let attempts = 0; attempts < maxAttempts && rooms.length < targetRoomCount; attempts++) {
            const room = this.createRoom(width, height, config);
            if (room && !this.roomOverlaps(room, rooms)) {
                rooms.push(room);
            }
        }
        
        // Ensure minimum room count for playability
        if (rooms.length < 3) {
            this.generateFallbackRooms(width, height, rooms);
        }
        
        return rooms;
    }
    
    createRoom(width, height, config) {
        const roomWidth = Math.floor(Math.random() * (config.maxRoomSize - config.minRoomSize + 1)) + config.minRoomSize;
        const roomHeight = Math.floor(Math.random() * (config.maxRoomSize - config.minRoomSize + 1)) + config.minRoomSize;
        const x = Math.floor(Math.random() * (width - roomWidth - 2)) + 1;
        const y = Math.floor(Math.random() * (height - roomHeight - 2)) + 1;
        
        return { x, y, width: roomWidth, height: roomHeight };
    }
    
    roomOverlaps(room, rooms) {
        for (let other of rooms) {
            if (room.x < other.x + other.width + 2 &&
                room.x + room.width + 2 > other.x &&
                room.y < other.y + other.height + 2 &&
                room.y + room.height + 2 > other.y) {
                return true;
            }
        }
        return false;
    }
    
    generateFallbackRooms(width, height, rooms) {
        // Generate guaranteed non-overlapping rooms for basic playability
        const fallbackRooms = [
            { x: 2, y: 2, width: 6, height: 4 },
            { x: width - 8, y: 2, width: 6, height: 4 },
            { x: 2, y: height - 6, width: 6, height: 4 },
            { x: width - 8, y: height - 6, width: 6, height: 4 },
            { x: Math.floor(width/2) - 3, y: Math.floor(height/2) - 2, width: 6, height: 4 }
        ];
        
        for (const roomData of fallbackRooms) {
            if (rooms.length >= 5) break; // Enough rooms
            
            const room = { ...roomData };
            // Check bounds
            if (room.x + room.width >= width - 1 || room.y + room.height >= height - 1) continue;
            
            if (!this.roomOverlaps(room, rooms)) {
                rooms.push(room);
            }
        }
    }
    
    carveRooms(map, rooms) {
        for (let room of rooms) {
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
                        map[y][x] = 0;
                    }
                }
            }
        }
    }
    
    connectRooms(map, rooms, config) {
        if (rooms.length < 2) return;
        
        // Connect each room to the next to ensure all rooms are reachable
        for (let i = 0; i < rooms.length - 1; i++) {
            this.createCorridor(map, rooms[i], rooms[i + 1], config);
        }
        
        // Add some extra connections for more interesting layouts
        if (rooms.length >= 3) {
            // Connect first and last room occasionally
            if (Math.random() < 0.4) {
                this.createCorridor(map, rooms[0], rooms[rooms.length - 1], config);
            }
            
            // Add random connections between non-adjacent rooms
            const extraConnections = Math.floor(rooms.length / 4);
            for (let i = 0; i < extraConnections; i++) {
                const roomA = rooms[Math.floor(Math.random() * rooms.length)];
                const roomB = rooms[Math.floor(Math.random() * rooms.length)];
                if (roomA !== roomB) {
                    this.createCorridor(map, roomA, roomB, config);
                }
            }
        }
    }
    
    createCorridor(map, room1, room2, config) {
        const center1 = {
            x: Math.floor(room1.x + room1.width / 2),
            y: Math.floor(room1.y + room1.height / 2)
        };
        const center2 = {
            x: Math.floor(room2.x + room2.width / 2),
            y: Math.floor(room2.y + room2.height / 2)
        };
        
        // Create L-shaped corridor with guaranteed intersection
        if (Math.random() < 0.5) {
            // Horizontal first, then vertical
            this.createHCorridor(map, center1.x, center2.x, center1.y, config.corridorWidth);
            this.createVCorridor(map, center1.y, center2.y, center2.x, config.corridorWidth);
            // Ensure intersection is clear
            this.createIntersection(map, center2.x, center1.y, config.corridorWidth);
        } else {
            // Vertical first, then horizontal
            this.createVCorridor(map, center1.y, center2.y, center1.x, config.corridorWidth);
            this.createHCorridor(map, center1.x, center2.x, center2.y, config.corridorWidth);
            // Ensure intersection is clear
            this.createIntersection(map, center1.x, center2.y, config.corridorWidth);
        }
    }
    
    createIntersection(map, x, y, width) {
        // Create a wider intersection area to prevent blocking
        const intersectionSize = Math.max(width, 2);
        for (let dy = -Math.floor(intersectionSize/2); dy <= Math.floor(intersectionSize/2); dy++) {
            for (let dx = -Math.floor(intersectionSize/2); dx <= Math.floor(intersectionSize/2); dx++) {
                const newX = x + dx;
                const newY = y + dy;
                if (newY >= 0 && newY < map.length && newX >= 0 && newX < map[0].length) {
                    map[newY][newX] = 0;
                }
            }
        }
    }
    
    createHCorridor(map, x1, x2, y, width) {
        const start = Math.min(x1, x2);
        const end = Math.max(x1, x2);
        
        // Create corridor centered on y coordinate
        const halfWidth = Math.floor(width / 2);
        for (let x = start; x <= end; x++) {
            for (let w = -halfWidth; w <= halfWidth; w++) {
                const corridorY = y + w;
                if (corridorY >= 0 && corridorY < map.length && x >= 0 && x < map[0].length) {
                    map[corridorY][x] = 0;
                }
            }
        }
    }
    
    createVCorridor(map, y1, y2, x, width) {
        const start = Math.min(y1, y2);
        const end = Math.max(y1, y2);
        
        // Create corridor centered on x coordinate
        const halfWidth = Math.floor(width / 2);
        for (let y = start; y <= end; y++) {
            for (let w = -halfWidth; w <= halfWidth; w++) {
                const corridorX = x + w;
                if (y >= 0 && y < map.length && corridorX >= 0 && corridorX < map[0].length) {
                    map[y][corridorX] = 0;
                }
            }
        }
    }
    
    addDecorations(map, rooms, config) {
        if (!config.decorationChance) return;
        
        for (let room of rooms) {
            if (Math.random() < config.decorationChance) {
                const decorX = room.x + Math.floor(Math.random() * room.width);
                const decorY = room.y + Math.floor(Math.random() * room.height);
                if (map[decorY][decorX] === 0) {
                    map[decorY][decorX] = 3;
                }
            }
        }
    }
    
    validateConnectivity(map, rooms, config) {
        if (rooms.length < 2) return;
        
        // Check if all rooms are reachable from the first room
        const visited = new Set();
        const queue = [rooms[0]];
        visited.add(rooms[0]);
        
        while (queue.length > 0) {
            const currentRoom = queue.shift();
            const currentCenter = {
                x: Math.floor(currentRoom.x + currentRoom.width / 2),
                y: Math.floor(currentRoom.y + currentRoom.height / 2)
            };
            
            // Check connectivity to other rooms
            for (const otherRoom of rooms) {
                if (visited.has(otherRoom)) continue;
                
                const otherCenter = {
                    x: Math.floor(otherRoom.x + otherRoom.width / 2),
                    y: Math.floor(otherRoom.y + otherRoom.height / 2)
                };
                
                // Simple path check - if we can trace a path through floor tiles
                if (this.hasPath(map, currentCenter, otherCenter)) {
                    visited.add(otherRoom);
                    queue.push(otherRoom);
                }
            }
        }
        
        // If any rooms are not reachable, create direct connections
        for (const room of rooms) {
            if (!visited.has(room)) {
                // Connect to nearest visited room
                let nearestRoom = null;
                let minDistance = Infinity;
                
                for (const visitedRoom of visited) {
                    const distance = Math.sqrt(
                        Math.pow(room.x - visitedRoom.x, 2) + 
                        Math.pow(room.y - visitedRoom.y, 2)
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestRoom = visitedRoom;
                    }
                }
                
                if (nearestRoom) {
                    this.createCorridor(map, room, nearestRoom, config);
                    visited.add(room);
                }
            }
        }
    }
    
    hasPath(map, start, end) {
        // Simple flood fill to check if there's a path
        const queue = [{x: start.x, y: start.y}];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            // Check if we reached the end
            if (Math.abs(current.x - end.x) <= 1 && Math.abs(current.y - end.y) <= 1) {
                return true;
            }
            
            // Add neighboring floor tiles
            const directions = [[0,1], [0,-1], [1,0], [-1,0]];
            for (const [dx, dy] of directions) {
                const newX = current.x + dx;
                const newY = current.y + dy;
                
                if (newY >= 0 && newY < map.length && 
                    newX >= 0 && newX < map[0].length && 
                    map[newY][newX] === 0) {
                    queue.push({x: newX, y: newY});
                }
            }
            
            // Limit search to prevent infinite loops
            if (visited.size > 200) break;
        }
        
        return false;
    }
}

window.BaseGenerator = BaseGenerator;