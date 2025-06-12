class StellarGenerator extends BaseGenerator {
    constructor() {
        super('stellar');
    }
    
    generate(width, height, config) {
        const result = super.generate(width, height, config);
        this.addStellarFeatures(result.map, result.rooms, config);
        return result;
    }
    
    addStellarFeatures(map, rooms, config) {
        // Add star charts, telescopes, and constellation decorations
        rooms.forEach((room, index) => {
            // Add stellar decorations based on floor type
            const decorationType = this.getStellarDecorationType(config.currentFloor, index);
            this.addRoomStellarDecorations(map, room, decorationType, config);
        });
        
        // Add constellation pathways between rooms
        this.addConstellationPaths(map, rooms, config);
    }
    
    getStellarDecorationType(floor, roomIndex) {
        if (floor === 1) {
            // Star Chart Chamber - focus on charts and basic telescopes
            return roomIndex === 0 ? 'starChart' : 'telescope';
        } else if (floor === 2) {
            // Constellation Gallery - focus on constellation displays
            return roomIndex % 2 === 0 ? 'constellation' : 'starChart';
        } else {
            // Cosmic Observatory - mix of all stellar features
            const types = ['starChart', 'telescope', 'constellation'];
            return types[roomIndex % types.length];
        }
    }
    
    addRoomStellarDecorations(map, room, decorationType, config) {
        const stellarChance = config.stellarFeatureChance || 0.5;
        
        // Add decorations in the center and corners of rooms
        const decorationPositions = [
            { x: room.x + Math.floor(room.width / 2), y: room.y + Math.floor(room.height / 2) }, // Center
            { x: room.x + 2, y: room.y + 2 }, // Top-left
            { x: room.x + room.width - 3, y: room.y + 2 }, // Top-right
            { x: room.x + 2, y: room.y + room.height - 3 }, // Bottom-left
            { x: room.x + room.width - 3, y: room.y + room.height - 3 } // Bottom-right
        ];
        
        decorationPositions.forEach(pos => {
            if (Math.random() < stellarChance && 
                pos.x >= room.x + 1 && pos.x < room.x + room.width - 1 &&
                pos.y >= room.y + 1 && pos.y < room.y + room.height - 1) {
                
                if (map[pos.y] && map[pos.y][pos.x] !== undefined && map[pos.y][pos.x] === 0) {
                    map[pos.y][pos.x] = { type: 'floor', decoration: decorationType };
                }
            }
        });
    }
    
    addConstellationPaths(map, rooms, config) {
        const constellationChance = config.constellationChance || 0.3;
        
        // Add constellation-like connecting patterns in corridors
        for (let y = 1; y < map.length - 1; y++) {
            for (let x = 1; x < map[y].length - 1; x++) {
                if (map[y][x] === 0 && Math.random() < constellationChance) {
                    // Check if this is in a corridor (not in a room)
                    const inRoom = rooms.some(room => 
                        x >= room.x && x < room.x + room.width &&
                        y >= room.y && y < room.y + room.height
                    );
                    
                    if (!inRoom) {
                        // Add small constellation markers
                        map[y][x] = { type: 'floor', decoration: 'constellation' };
                    }
                }
            }
        }
    }
}

window.StellarGenerator = StellarGenerator;