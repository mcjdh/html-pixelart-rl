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
        const roomCount = Math.min(5 + Math.floor(floor / 3), 12);
        const attempts = 200;
        
        for (let i = 0; i < attempts && this.rooms.length < roomCount; i++) {
            const room = this.createRandomRoom();
            
            // Check if room overlaps with existing rooms
            let valid = true;
            for (const other of this.rooms) {
                if (room.intersects(other)) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
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
    }
    
    connectRooms() {
        for (let i = 0; i < this.rooms.length - 1; i++) {
            const roomA = this.rooms[i];
            const roomB = this.rooms[i + 1];
            
            // Create L-shaped corridor
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
    }
    
    carveHorizontalCorridor(x1, x2, y) {
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        
        for (let x = startX; x <= endX; x++) {
            if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
                this.map[y][x] = '.';
            }
        }
    }
    
    carveVerticalCorridor(y1, y2, x) {
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        
        for (let y = startY; y <= endY; y++) {
            if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
                this.map[y][x] = '.';
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
        const floorTiles = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[y][x] === '.') {
                    floorTiles.push({ x, y });
                }
            }
        }
        
        if (floorTiles.length > 0) {
            return floorTiles[Math.floor(Math.random() * floorTiles.length)];
        }
        
        return null;
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

