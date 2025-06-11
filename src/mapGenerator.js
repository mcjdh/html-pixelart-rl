class Room {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.centerX = Math.floor(x + width / 2);
        this.centerY = Math.floor(y + height / 2);
    }
    
    intersects(other) {
        return !(this.x + this.width < other.x || 
                other.x + other.width < this.x ||
                this.y + this.height < other.y ||
                other.y + other.height < this.y);
    }
}

class MapGenerator {
    constructor(width = CONFIG.GRID_WIDTH, height = CONFIG.GRID_HEIGHT) {
        this.width = width;
        this.height = height;
        this.map = [];
        this.rooms = [];
        this.stairsX = -1;
        this.stairsY = -1;
    }
    
    generate(floor = 1) {
        this.initializeMap();
        this.generateRooms(floor);
        this.connectRooms();
        this.placeStairs();
        
        return {
            map: this.map,
            rooms: this.rooms,
            stairsX: this.stairsX,
            stairsY: this.stairsY,
            startX: this.rooms[0].centerX,
            startY: this.rooms[0].centerY
        };
    }
    
    initializeMap() {
        this.map = [];
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = '#'; // Wall
            }
        }
    }
    
    generateRooms(floor) {
        this.rooms = [];
        const roomCount = Math.min(5 + Math.floor(floor / 3), 10);
        const attempts = 300;
        
        for (let i = 0; i < attempts && this.rooms.length < roomCount; i++) {
            const room = this.createRandomRoom();
            
            // Enhanced room validation
            if (this.isValidRoomPlacement(room)) {
                this.carveRoom(room);
                this.rooms.push(room);
            }
        }
        
        // Ensure we have at least 3 rooms for basic gameplay
        if (this.rooms.length < 3) {
            this.generateEmergencyRooms();
        }
    }
    
    isValidRoomPlacement(room) {
        // Check if room overlaps with existing rooms (with small buffer)
        for (const other of this.rooms) {
            if (this.roomsOverlapWithBuffer(room, other, 1)) {
                return false;
            }
        }
        
        // Check room is within map bounds (with border)
        if (room.x <= 1 || room.y <= 1 || 
            room.x + room.width >= this.width - 1 || 
            room.y + room.height >= this.height - 1) {
            return false;
        }
        
        return true;
    }
    
    roomsOverlapWithBuffer(room1, room2, buffer) {
        return !(room1.x + room1.width + buffer < room2.x || 
                room2.x + room2.width + buffer < room1.x ||
                room1.y + room1.height + buffer < room2.y ||
                room2.y + room2.height + buffer < room1.y);
    }
    
    generateEmergencyRooms() {
        // Generate guaranteed non-overlapping rooms for basic playability
        const emergencyRooms = [
            { x: 2, y: 2, width: 6, height: 6 },
            { x: this.width - 8, y: 2, width: 6, height: 6 },
            { x: 2, y: this.height - 8, width: 6, height: 6 }
        ];
        
        for (const roomData of emergencyRooms) {
            if (this.rooms.length >= 3) break;
            
            const room = new Room(roomData.x, roomData.y, roomData.width, roomData.height);
            if (!this.rooms.some(existing => existing.intersects(room))) {
                this.carveRoom(room);
                this.rooms.push(room);
            }
        }
    }
    
    createRandomRoom() {
        const minSize = 4;
        const maxSize = 10;
        
        const width = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
        const height = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
        const x = Math.floor(Math.random() * (this.width - width - 2)) + 1;
        const y = Math.floor(Math.random() * (this.height - height - 2)) + 1;
        
        return new Room(x, y, width, height);
    }
    
    carveRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
                    this.map[y][x] = '.'; // Floor
                }
            }
        }
        // Invalidate floor tile cache since we modified the map
        this.cachedFloorTiles = null;
    }
    
    connectRooms() {
        if (this.rooms.length < 2) return;
        
        // Connect rooms in a more intelligent way to ensure all are reachable
        // First, connect each room to the next to form a chain
        for (let i = 0; i < this.rooms.length - 1; i++) {
            this.connectTwoRooms(this.rooms[i], this.rooms[i + 1]);
        }
        
        // Add some extra connections for more interesting layouts
        if (this.rooms.length >= 3) {
            // Connect first and last room for loops
            this.connectTwoRooms(this.rooms[0], this.rooms[this.rooms.length - 1]);
            
            // Add random connections between non-adjacent rooms
            for (let i = 0; i < Math.floor(this.rooms.length / 3); i++) {
                const roomA = this.rooms[Math.floor(Math.random() * this.rooms.length)];
                const roomB = this.rooms[Math.floor(Math.random() * this.rooms.length)];
                if (roomA !== roomB) {
                    this.connectTwoRooms(roomA, roomB);
                }
            }
        }
    }
    
    connectTwoRooms(roomA, roomB) {
        // Create L-shaped corridor with improved pathfinding
        if (Math.random() < 0.5) {
            // Horizontal first, then vertical
            this.carveHorizontalCorridor(roomA.centerX, roomB.centerX, roomA.centerY);
            this.carveVerticalCorridor(roomA.centerY, roomB.centerY, roomB.centerX);
        } else {
            // Vertical first, then horizontal
            this.carveVerticalCorridor(roomA.centerY, roomB.centerY, roomA.centerX);
            this.carveHorizontalCorridor(roomA.centerX, roomB.centerX, roomB.centerY);
        }
    }
    
    carveHorizontalCorridor(x1, x2, y) {
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        
        // Ensure y is valid
        if (y <= 0 || y >= this.height - 1) return;
        
        for (let x = startX; x <= endX; x++) {
            if (x > 0 && x < this.width - 1) {
                this.map[y][x] = '.';
                // Invalidate floor tile cache since we modified the map
                this.cachedFloorTiles = null;
            }
        }
    }
    
    carveVerticalCorridor(y1, y2, x) {
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        
        // Ensure x is valid
        if (x <= 0 || x >= this.width - 1) return;
        
        for (let y = startY; y <= endY; y++) {
            if (y > 0 && y < this.height - 1) {
                this.map[y][x] = '.';
                // Invalidate floor tile cache since we modified the map
                this.cachedFloorTiles = null;
            }
        }
    }
    
    placeStairs() {
        if (this.rooms.length > 0) {
            const lastRoom = this.rooms[this.rooms.length - 1];
            this.stairsX = lastRoom.centerX;
            this.stairsY = lastRoom.centerY;
        }
    }
    
    getRandomFloorTile() {
        // Cache floor tiles for better performance
        if (!this.cachedFloorTiles) {
            this.cacheFloorTiles();
        }
        
        if (this.cachedFloorTiles.length > 0) {
            return this.cachedFloorTiles[Math.floor(Math.random() * this.cachedFloorTiles.length)];
        }
        
        return null;
    }
    
    cacheFloorTiles() {
        this.cachedFloorTiles = [];
        
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.map[y][x] === '.') {
                    // Ensure the tile is actually walkable and connected
                    if (this.isValidFloorTile(x, y)) {
                        this.cachedFloorTiles.push({ x, y });
                    }
                }
            }
        }
    }
    
    isValidFloorTile(x, y) {
        // Check if this is actually a floor tile with proper connectivity
        if (this.map[y][x] !== '.') return false;
        
        // Ensure it's not at the very edge
        if (x <= 0 || x >= this.width - 1 || y <= 0 || y >= this.height - 1) return false;
        
        // Check that it has at least one adjacent floor tile
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        let adjacentFloors = 0;
        
        for (const [dx, dy] of directions) {
            const checkX = x + dx;
            const checkY = y + dy;
            if (checkX >= 0 && checkX < this.width && 
                checkY >= 0 && checkY < this.height && 
                this.map[checkY][checkX] === '.') {
                adjacentFloors++;
            }
        }
        
        return adjacentFloors > 0;
    }
    
    isValidTile(x, y) {
        return x >= 0 && x < this.width && 
               y >= 0 && y < this.height && 
               this.map[y][x] === '.';
    }
    
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return true;
        }
        return this.map[y][x] === '#';
    }
}

