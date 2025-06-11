// Core Event Bus System for modular architecture and RPG narrative events
class EventBus {
    constructor() {
        this.listeners = new Map();
        this.eventHistory = [];
        this.narrativeEvents = new Map();
        this.loreLibrary = new Map();
        this.maxHistorySize = 1000;
        
        this.initializeNarrativeEvents();
        this.initializeLoreLibrary();
    }
    
    // Core event system
    emit(event, data = {}) {
        const timestamp = Date.now();
        const eventData = { 
            type: event, 
            data, 
            timestamp,
            id: this.generateEventId()
        };
        
        // Add to history
        this.eventHistory.push(eventData);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
        
        // Trigger listeners
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(eventData);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
        
        // Check for narrative event triggers
        this.checkNarrativeEvents(eventData);
        
        // Log important events for lore building
        this.logLoreEvent(eventData);
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        return () => this.off(event, callback);
    }
    
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    once(event, callback) {
        const unsubscribe = this.on(event, (data) => {
            callback(data);
            unsubscribe();
        });
        return unsubscribe;
    }
    
    // Narrative event system
    checkNarrativeEvents(eventData) {
        for (const [trigger, narrativeEvent] of this.narrativeEvents) {
            if (this.matchesNarrativeTrigger(trigger, eventData)) {
                this.triggerNarrativeEvent(narrativeEvent, eventData);
            }
        }
    }
    
    matchesNarrativeTrigger(trigger, eventData) {
        if (typeof trigger === 'string') {
            return trigger === eventData.type;
        }
        
        if (typeof trigger === 'function') {
            return trigger(eventData, this.getGameContext());
        }
        
        if (trigger.type && trigger.type !== eventData.type) {
            return false;
        }
        
        if (trigger.condition) {
            return trigger.condition(eventData, this.getGameContext());
        }
        
        return false;
    }
    
    triggerNarrativeEvent(narrativeEvent, triggerData) {
        const context = this.getGameContext();
        
        // Generate narrative content
        const narrative = this.generateNarrative(narrativeEvent, triggerData, context);
        
        // Emit the narrative event
        this.emit('narrative.triggered', {
            narrative,
            trigger: triggerData,
            context,
            importance: narrativeEvent.importance || 'normal'
        });
    }
    
    generateNarrative(narrativeEvent, triggerData, context) {
        if (typeof narrativeEvent.message === 'function') {
            return narrativeEvent.message(triggerData, context);
        }
        
        if (Array.isArray(narrativeEvent.message)) {
            const randomMessage = narrativeEvent.message[Math.floor(Math.random() * narrativeEvent.message.length)];
            return this.interpolateNarrative(randomMessage, triggerData, context);
        }
        
        return this.interpolateNarrative(narrativeEvent.message, triggerData, context);
    }
    
    interpolateNarrative(template, triggerData, context) {
        return template.replace(/\{(\w+(?:\.\w+)*)\}/g, (match, path) => {
            const value = this.getNestedValue({ trigger: triggerData, context }, path);
            return value !== undefined ? value : match;
        });
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : undefined, obj);
    }
    
    // Lore system
    logLoreEvent(eventData) {
        const loreCategories = this.determineLoreCategories(eventData);
        
        loreCategories.forEach(category => {
            if (!this.loreLibrary.has(category)) {
                this.loreLibrary.set(category, []);
            }
            
            const loreEntry = this.createLoreEntry(eventData, category);
            if (loreEntry) {
                this.loreLibrary.get(category).push(loreEntry);
                
                // Emit lore discovery event
                this.emit('lore.discovered', {
                    category,
                    entry: loreEntry,
                    source: eventData
                });
            }
        });
    }
    
    determineLoreCategories(eventData) {
        const categories = [];
        
        switch (eventData.type) {
            case 'enemy.killed':
                categories.push('bestiary', 'combat');
                break;
            case 'floor.completed':
                categories.push('exploration', 'dungeons');
                break;
            case 'item.discovered':
                categories.push('artifacts', 'treasures');
                break;
            case 'player.died':
                categories.push('legends', 'heroes');
                break;
            case 'rare.event':
                categories.push('mysteries', 'legends');
                break;
        }
        
        return categories;
    }
    
    createLoreEntry(eventData, category) {
        const templates = this.getLoreTemplates(category);
        if (!templates.length) return null;
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        const context = this.getGameContext();
        
        return {
            id: this.generateEventId(),
            timestamp: eventData.timestamp,
            category,
            content: this.interpolateNarrative(template, eventData.data, context),
            source: eventData.type,
            rarity: this.determineLoreRarity(eventData)
        };
    }
    
    getLoreTemplates(category) {
        const templates = {
            bestiary: [
                "A {trigger.data.enemy.type} was slain on floor {context.floor}. These creatures are known for their {trigger.data.enemy.traits}.",
                "The ancient texts speak of {trigger.data.enemy.type}s that once roamed these depths...",
                "Scholar's note: {trigger.data.enemy.type} specimens exhibit {trigger.data.enemy.behavior} behavior."
            ],
            combat: [
                "Combat technique discovered: {trigger.data.technique} proved effective against {trigger.data.enemy.type}.",
                "Battle record: Victory achieved through {trigger.data.strategy} on floor {context.floor}.",
                "The warrior's journal: '{trigger.data.reflection}'"
            ],
            exploration: [
                "Floor {context.floor} of the ancient dungeon has been conquered. {context.roomsExplored} chambers explored.",
                "The depths grow stranger... Floor {context.floor} revealed {context.secrets} hidden secrets.",
                "Cartographer's note: Floor {context.floor} layout suggests {context.architectural_style} construction."
            ],
            artifacts: [
                "A {trigger.data.item.type} was discovered on floor {context.floor}. Its origins remain mysterious...",
                "Ancient artifact recovered: {trigger.data.item.name}. Purpose unknown.",
                "Treasure log: {trigger.data.item.description}"
            ],
            legends: [
                "The tale of the brave adventurer who reached floor {context.floor} before {trigger.data.fate}...",
                "Local legends speak of heroes who dared venture into this memory cavern...",
                "Another soul joins the countless others who sought glory in the ancient dungeon..."
            ]
        };
        
        return templates[category] || [];
    }
    
    determineLoreRarity(eventData) {
        if (eventData.data.critical || eventData.data.rare) return 'legendary';
        if (eventData.data.special || Math.random() < 0.1) return 'rare';
        if (Math.random() < 0.3) return 'uncommon';
        return 'common';
    }
    
    // Initialize narrative events
    initializeNarrativeEvents() {
        // Combat narratives
        this.narrativeEvents.set('enemy.killed', {
            importance: 'normal',
            message: [
                "The {trigger.data.enemy.type} falls with a final, echoing cry...",
                "Victory! The {trigger.data.enemy.type} collapses in defeat.",
                "Your blade finds its mark. The {trigger.data.enemy.type} is no more.",
                "The dungeon grows quieter as another foe is vanquished."
            ]
        });
        
        this.narrativeEvents.set('player.levelup', {
            importance: 'high',
            message: [
                "Power courses through your veins! You feel stronger, more capable...",
                "The trials of the dungeon have forged you into a mightier warrior!",
                "Your experience in these depths grants you new strength and wisdom."
            ]
        });
        
        // Floor exploration narratives
        this.narrativeEvents.set('floor.entered', {
            importance: 'high',
            message: (trigger, context) => {
                const floorMessages = {
                    1: "You descend into the ancient dungeon. The air grows cold and stale...",
                    2: "Deeper into the earth you venture. Strange shadows dance on the walls.",
                    3: "The darkness seems alive here. You sense malevolent eyes watching...",
                    5: "These depths are ancient beyond measure. What secrets lie hidden?",
                    10: "Few have ventured this deep and returned to tell the tale...",
                    15: "The very stones whisper of age-old curses and forgotten magic.",
                    20: "You walk where heroes of legend once tread. The air thrums with power."
                };
                
                return floorMessages[context.floor] || 
                       `Floor ${context.floor}... The dungeon's mysteries deepen with each step.`;
            }
        });
        
        // Discovery narratives
        this.narrativeEvents.set('item.rare_discovered', {
            importance: 'high',
            message: [
                "A glimmer catches your eye... This {trigger.data.item.type} radiates ancient power!",
                "Fortune smiles upon you! A legendary {trigger.data.item.type} lies before you.",
                "The fates have guided you to this {trigger.data.item.type}. Its magic is palpable."
            ]
        });
        
        // Critical moments
        this.narrativeEvents.set('player.low_health', {
            importance: 'urgent',
            message: [
                "Your vision blurs. Death stalks these corridors...",
                "Pain courses through your body. You must find healing soon!",
                "The dungeon senses your weakness. Creatures stir in the shadows..."
            ]
        });
        
        // Atmospheric events
        this.narrativeEvents.set({
            type: 'turn.processed',
            condition: (event, context) => Math.random() < 0.01 // 1% chance per turn
        }, {
            importance: 'low',
            message: [
                "A cold breeze whispers through the ancient halls...",
                "Distant echoes suggest you are not alone in these depths...",
                "The torchlight flickers, casting dancing shadows on worn stone...",
                "You hear the faint drip of water echoing through forgotten chambers...",
                "The silence is broken only by your own footsteps on ancient stone..."
            ]
        });
    }
    
    // Initialize lore library
    initializeLoreLibrary() {
        // Pre-populate with foundational lore
        this.loreLibrary.set('legends', [{
            id: 'origin_001',
            category: 'legends',
            content: "In ages past, a great civilization built this dungeon as a trial for their greatest heroes...",
            rarity: 'legendary',
            timestamp: Date.now()
        }]);
        
        this.loreLibrary.set('mysteries', [{
            id: 'mystery_001',
            category: 'mysteries',
            content: "The deeper chambers are said to contain artifacts of immense power, guarded by ancient curses...",
            rarity: 'rare',
            timestamp: Date.now()
        }]);
    }
    
    // Utility methods
    generateEventId() {
        return 'evt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    getGameContext() {
        // Access game state safely (will be injected later)
        if (window.game && window.game.gameState) {
            const state = window.game.gameState;
            return {
                floor: state.floor,
                playerLevel: state.player.level,
                playerHp: state.player.hp,
                maxHp: state.player.maxHp,
                gold: state.player.gold,
                roomsExplored: state.roomsExplored || 0,
                enemiesKilled: state.stats.enemiesKilled,
                timeElapsed: Date.now() - (state.gameStartTime || Date.now())
            };
        }
        return {};
    }
    
    // Query methods for UI integration
    getRecentNarratives(count = 5) {
        return this.eventHistory
            .filter(event => event.type === 'narrative.triggered')
            .slice(-count)
            .map(event => event.data.narrative);
    }
    
    getLoreByCategory(category) {
        return this.loreLibrary.get(category) || [];
    }
    
    getAllLore() {
        const allLore = [];
        for (const [category, entries] of this.loreLibrary) {
            allLore.push(...entries.map(entry => ({ ...entry, category })));
        }
        return allLore.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    getEventHistory(eventType = null, limit = 100) {
        let history = this.eventHistory;
        
        if (eventType) {
            history = history.filter(event => event.type === eventType);
        }
        
        return history.slice(-limit);
    }
}

// Global event bus instance
const GameEvents = new EventBus();