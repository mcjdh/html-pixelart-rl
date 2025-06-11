class LevelDefinition {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.theme = config.theme;
        this.floors = config.floors || [];
        this.sprite = config.sprite;
        this.tileSprites = config.tileSprites;
        this.enemyTypes = config.enemyTypes || {};
        this.itemTypes = config.itemTypes || {};
        this.mapConfig = config.mapConfig || {};
        this.progression = config.progression || {};
        this.narrative = config.narrative || {};
        this.ambience = config.ambience || {};
    }

    getFloorData(floorNumber) {
        return this.floors[floorNumber - 1] || null;
    }

    getEnemyTypesForFloor(floorNumber) {
        const floor = this.getFloorData(floorNumber);
        if (!floor) return [];
        
        const types = [];
        const floorEnemies = floor.enemies || this.enemyTypes.default || [];
        
        floorEnemies.forEach(enemyConfig => {
            if (typeof enemyConfig === 'string') {
                types.push(enemyConfig);
            } else if (enemyConfig.type) {
                for (let i = 0; i < (enemyConfig.count || 1); i++) {
                    types.push(enemyConfig.type);
                }
            }
        });
        
        return types;
    }

    getMapGenerationConfig(floorNumber) {
        const floor = this.getFloorData(floorNumber);
        const baseConfig = { ...this.mapConfig };
        
        if (floor && floor.mapOverrides) {
            Object.assign(baseConfig, floor.mapOverrides);
        }
        
        baseConfig.theme = this.theme;
        baseConfig.tileSprites = this.tileSprites;
        
        return baseConfig;
    }

    getTileSprite(tileType) {
        if (!this.tileSprites || !this.tileSprites[tileType]) {
            // Fallback to default terrain sprites
            if (window.terrainSprites) {
                return window.terrainSprites[tileType] || window.terrainSprites.wall;
            }
            return null;
        }
        
        const sprite = this.tileSprites[tileType];
        // Handle function-based sprite references
        if (typeof sprite === 'function') {
            return sprite();
        }
        return sprite;
    }

    getFloorNarrative(floorNumber) {
        const floor = this.getFloorData(floorNumber);
        return floor ? floor.narrative : null;
    }

    getProgressionOptions() {
        return this.progression;
    }

    isComplete(completedFloors) {
        return completedFloors >= this.floors.length;
    }
}

window.LevelDefinition = LevelDefinition;