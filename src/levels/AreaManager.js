class AreaManager {
    constructor() {
        this.areas = new Map();
        this.currentArea = null;
        this.unlockedAreas = new Set(['caverns']);
        this.completedAreas = new Map();
        this.areaProgress = new Map();
    }

    registerArea(levelDefinition) {
        this.areas.set(levelDefinition.id, levelDefinition);
    }

    loadArea(areaId) {
        if (!this.areas.has(areaId)) {
            console.error(`Area ${areaId} not found`);
            return null;
        }
        
        if (!this.unlockedAreas.has(areaId)) {
            console.error(`Area ${areaId} is locked`);
            return null;
        }
        
        this.currentArea = this.areas.get(areaId);
        return this.currentArea;
    }

    getCurrentArea() {
        return this.currentArea;
    }

    getAreaProgress(areaId) {
        return this.areaProgress.get(areaId) || { currentFloor: 1, highestFloor: 1 };
    }

    updateAreaProgress(areaId, floorNumber) {
        const progress = this.getAreaProgress(areaId);
        progress.currentFloor = floorNumber;
        progress.highestFloor = Math.max(progress.highestFloor, floorNumber);
        this.areaProgress.set(areaId, progress);
    }

    completeArea(areaId) {
        const area = this.areas.get(areaId);
        if (!area) return;
        
        this.completedAreas.set(areaId, true);
        
        const progression = area.getProgressionOptions();
        if (progression.unlocks) {
            progression.unlocks.forEach(unlockedAreaId => {
                this.unlockedAreas.add(unlockedAreaId);
                console.log(`Area unlocked: ${unlockedAreaId} (from completing ${areaId})`);
            });
        }
    }

    isAreaComplete(areaId) {
        return this.completedAreas.has(areaId);
    }

    getUnlockedAreas() {
        return Array.from(this.unlockedAreas).map(id => ({
            id,
            area: this.areas.get(id),
            progress: this.getAreaProgress(id),
            completed: this.isAreaComplete(id)
        })).filter(entry => entry.area);
    }

    getAvailableTransitions() {
        if (!this.currentArea) return [];
        
        const transitions = [];
        const progression = this.currentArea.getProgressionOptions();
        
        console.log(`Getting transitions for ${this.currentArea.id}:`, {
            unlocks: progression.unlocks,
            connections: progression.connections,
            unlockedAreas: Array.from(this.unlockedAreas)
        });
        
        if (progression.connections) {
            progression.connections.forEach(targetAreaId => {
                const isUnlocked = this.unlockedAreas.has(targetAreaId);
                const areaExists = this.areas.has(targetAreaId);
                console.log(`  Checking ${targetAreaId}: unlocked=${isUnlocked}, exists=${areaExists}`);
                
                if (isUnlocked && areaExists) {
                    transitions.push({
                        id: targetAreaId,
                        area: this.areas.get(targetAreaId),
                        isNewlyUnlocked: progression.unlocks && progression.unlocks.includes(targetAreaId),
                        isCompleted: this.isAreaComplete(targetAreaId)
                    });
                }
            });
        }
        
        // Sort transitions to prioritize newly unlocked areas and avoid completed areas for auto-progression
        transitions.sort((a, b) => {
            // Newly unlocked areas first
            if (a.isNewlyUnlocked && !b.isNewlyUnlocked) return -1;
            if (!a.isNewlyUnlocked && b.isNewlyUnlocked) return 1;
            
            // Incomplete areas before completed areas
            if (!a.isCompleted && b.isCompleted) return -1;
            if (a.isCompleted && !b.isCompleted) return 1;
            
            // Default order
            return 0;
        });
        
        return transitions;
    }

    saveState() {
        return {
            currentAreaId: this.currentArea ? this.currentArea.id : null,
            unlockedAreas: Array.from(this.unlockedAreas),
            completedAreas: Array.from(this.completedAreas.keys()),
            areaProgress: Array.from(this.areaProgress.entries())
        };
    }

    loadState(state) {
        if (state.currentAreaId) {
            this.currentArea = this.areas.get(state.currentAreaId);
        }
        this.unlockedAreas = new Set(state.unlockedAreas || ['caverns']);
        this.completedAreas = new Map();
        (state.completedAreas || []).forEach(id => this.completedAreas.set(id, true));
        this.areaProgress = new Map(state.areaProgress || []);
    }
}

window.AreaManager = AreaManager;