// Campaign System for Modular Level Progression
class CampaignSystem {
    constructor(eventBus, gameState) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        
        this.campaignData = {
            completed: false,
            currentAreaId: null,
            currentFloor: 1
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for floor progression
        this.eventBus.on('floor.entered', (eventData) => {
            if (this.gameState.campaignMode) {
                this.handleFloorEntered(eventData.data);
            }
        });
        
        // Listen for floor completion
        this.eventBus.on('floor.completed', (eventData) => {
            if (this.gameState.campaignMode) {
                this.handleFloorCompleted(eventData.data);
            }
        });
        
        // Listen for enemy deaths for special events
        this.eventBus.on('enemy.killed', (eventData) => {
            if (this.gameState.campaignMode) {
                this.handleEnemyKilled(eventData.data);
            }
        });
        
        // Listen for random events
        this.eventBus.on('turn.processed', (eventData) => {
            if (this.gameState.campaignMode) {
                this.checkForSpecialEvents(eventData.data);
            }
        });
    }
    
    handleFloorEntered(data) {
        const floor = data.floor;
        const currentArea = this.gameState.currentArea;
        
        if (!currentArea) return;
        
        const floorData = currentArea.getFloorData(floor);
        if (!floorData) return;
        
        // Update campaign state
        this.campaignData.currentAreaId = currentArea.id;
        this.campaignData.currentFloor = floor;
        
        // Trigger floor intro cutscene
        this.eventBus.emit('cutscene.play', {
            type: 'floor_intro',
            data: {
                floor: floor,
                floorData: floorData,
                area: currentArea
            }
        });
        
        // Trigger narrative if available
        if (floorData.narrative && floorData.narrative.enter) {
            this.eventBus.emit('narrative.triggered', {
                narrative: floorData.narrative.enter,
                importance: 'story'
            });
        }
        
        // Track campaign progress
        this.updateCampaignProgress(floor);
        
        // Generate area-specific lore
        this.generateAreaLore(currentArea, floor);
    }
    
    handleFloorCompleted(data) {
        const floor = data.floor;
        const currentArea = this.gameState.currentArea;
        
        if (!currentArea) return;
        
        const floorData = currentArea.getFloorData(floor);
        
        // Check if this is the final floor of the area
        if (currentArea.isComplete(floor)) {
            // Area complete - handle based on campaign mode
            if (this.gameState.campaignMode && currentArea.id === 'caverns') {
                // Original campaign mode - check for full completion
                if (this.gameState.campaignProgress && this.gameState.campaignProgress.bossDefeated) {
                    this.completeCampaign();
                } else if (this.gameState.enemies.length === 0) {
                    this.gameState.campaignProgress = this.gameState.campaignProgress || {};
                    this.gameState.campaignProgress.bossDefeated = true;
                    this.completeCampaign();
                } else {
                    this.eventBus.emit('narrative.triggered', {
                        narrative: "The stairs to the surface beckon, but dark energies still pulse through these depths. Defeat all foes to claim victory!",
                        importance: 'important'
                    });
                }
            } else {
                // Modular mode - show area completion
                this.handleAreaCompleted(currentArea);
            }
            return;
        }
        
        // Show floor completion narrative
        if (floorData && floorData.narrative && floorData.narrative.complete) {
            this.eventBus.emit('narrative.triggered', {
                narrative: floorData.narrative.complete,
                importance: 'normal'
            });
        }
        
        // Award completion bonus
        this.awardFloorCompletionBonus(currentArea, floor);
    }
    
    handleAreaCompleted(area) {
        // Show area completion message
        this.eventBus.emit('narrative.triggered', {
            narrative: `${area.name} has been conquered! New paths have opened...`,
            importance: 'important'
        });
        
        // Check if this completes the campaign
        const availableAreas = this.gameState.areaManager.getUnlockedAreas();
        const completedAreas = availableAreas.filter(a => a.completed);
        
        if (completedAreas.length >= availableAreas.length - 1) {
            // Most areas complete - this might be campaign victory
            setTimeout(() => this.completeCampaign(), 2000);
        }
    }
    
    handleEnemyKilled(data) {
        const floor = this.gameState.floor;
        const enemy = data.enemy;
        const currentArea = this.gameState.currentArea;
        
        if (!currentArea) return;
        
        // Generate contextual combat narratives
        this.generateCombatNarrative(currentArea, enemy);
        
        // Check for boss encounters on final floors
        const floorData = currentArea.getFloorData(floor);
        if (floorData && floorData.isFinalFloor && this.isSpecialEnemy(enemy, currentArea)) {
            this.triggerBossEvent(enemy, currentArea);
        }
    }
    
    checkForSpecialEvents(data) {
        const floor = this.gameState.floor;
        const currentArea = this.gameState.currentArea;
        
        if (!currentArea) return;
        
        const floorData = currentArea.getFloorData(floor);
        if (!floorData || !floorData.specialEvents) return;
        
        // 2% chance per turn for special event
        if (Math.random() < 0.02) {
            const eventType = floorData.specialEvents[Math.floor(Math.random() * floorData.specialEvents.length)];
            this.triggerSpecialEvent(currentArea, floor, eventType);
        }
    }
    
    triggerSpecialEvent(area, floor, eventType) {
        // Get area-specific special events
        const events = this.getSpecialEventsForArea(area.id);
        
        const event = events[eventType];
        if (event) {
            this.eventBus.emit('narrative.triggered', {
                narrative: event.narrative,
                importance: 'normal'
            });
            
            // Generate special lore entry
            this.eventBus.emit('lore.discovered', {
                category: event.loreCategory,
                entry: {
                    id: `special_${area.id}_${eventType}_${Date.now()}`,
                    content: event.narrative,
                    rarity: 'rare',
                    timestamp: Date.now(),
                    source: 'special_event'
                }
            });
        }
    }
    
    getSpecialEventsForArea(areaId) {
        const areaEvents = {
            caverns: {
                // Cavern events
                crypt_whispers: {
                    narrative: "Ancient whispers echo through the crypts... 'Turn back, mortal, before it's too late...'",
                    loreCategory: "mysteries"
                },
                ancient_inscription: {
                    narrative: "You discover weathered inscriptions on a tomb wall. The ancient script speaks of a sleeping evil below.",
                    loreCategory: "legends"
                },
                ghostly_presence: {
                    narrative: "A translucent figure watches you from the shadows before fading away with a mournful sigh.",
                    loreCategory: "mysteries"
                },
                bone_tree: {
                    narrative: "A massive tree of fused bones reaches toward the ceiling. Its hollow eye sockets seem to track your movement.",
                    loreCategory: "bestiary"
                },
                skeletal_patrol: {
                    narrative: "You hear the rhythmic clacking of bone on stone. Ancient guardians still walk their eternal patrol.",
                    loreCategory: "exploration"
                },
                cursed_grove: {
                    narrative: "The bone trees whisper in an language long forgotten. Their words chill your very soul.",
                    loreCategory: "mysteries"
                },
                final_chamber: {
                    narrative: "The walls pulse with dark energy. You sense an ancient presence stirring in the depths ahead.",
                    loreCategory: "legends"
                },
                ancient_evil: {
                    narrative: "A voice echoes from the darkness: 'Another fool seeks to challenge the eternal darkness...'",
                    loreCategory: "legends"
                },
                boss_encounter: {
                    narrative: "The very air crackles with malevolent power. The final confrontation approaches...",
                    loreCategory: "legends"
                }
            },
            forest: {
                // Forest events
                rustling_leaves: {
                    narrative: "The leaves rustle without wind, as if the trees themselves are whispering secrets of the ancient world.",
                    loreCategory: "nature"
                },
                fairy_lights: {
                    narrative: "Tiny lights dance between the branches, leading you deeper into the mystical heart of the forest.",
                    loreCategory: "spirits"
                },
                ancient_oak: {
                    narrative: "You stand before an oak so ancient its bark tells the story of centuries. It hums with primal magic.",
                    loreCategory: "ancient_magic"
                },
                enchanted_spring: {
                    narrative: "A crystal-clear spring bubbles from the earth, its waters glowing with an otherworldly light.",
                    loreCategory: "nature"
                },
                talking_tree: {
                    narrative: "An old willow speaks in a voice like wind through leaves: 'Few mortals walk these paths with pure intent...'",
                    loreCategory: "spirits"
                },
                wisp_guidance: {
                    narrative: "A wisp of light hovers nearby, beckoning you toward a hidden path through the undergrowth.",
                    loreCategory: "spirits"
                },
                spirit_challenge: {
                    narrative: "The forest spirit materializes before you, its eyes holding the wisdom of ages: 'Prove your worth, wanderer.'",
                    loreCategory: "ancient_magic"
                },
                nature_blessing: {
                    narrative: "The grove pulses with life energy. You feel the blessing of nature itself flowing through your veins.",
                    loreCategory: "ancient_magic"
                },
                elder_tree: {
                    narrative: "The Elder Tree awakens, its massive form towering above. Ancient magic flows from its heartwood.",
                    loreCategory: "ancient_magic"
                }
            }
        };
        
        return areaEvents[areaId] || {};
    }
    
    generateCombatNarrative(area, enemy) {
        if (!area || !area.narrative || !area.narrative.combatNarratives) return;
        
        const narratives = area.narrative.combatNarratives[enemy.type];
        if (narratives && narratives.length > 0) {
            const selectedNarrative = narratives[Math.floor(Math.random() * narratives.length)];
            
            this.eventBus.emit('narrative.triggered', {
                narrative: selectedNarrative,
                importance: 'low'
            });
        }
    }
    
    generateAreaLore(area, floor) {
        // Area-specific lore is now handled by the area definitions
        // This method can be extended for dynamic lore generation
        
        // For now, just emit a basic exploration lore entry
        const floorData = area.getFloorData(floor);
        if (floorData && floorData.description) {
            setTimeout(() => {
                this.eventBus.emit('lore.discovered', {
                    category: 'exploration',
                    entry: {
                        id: `${area.id}_floor${floor}_lore`,
                        content: floorData.description,
                        rarity: 'common',
                        timestamp: Date.now(),
                        source: 'floor_exploration'
                    }
                });
            }, 1000);
        }
    }
    
    isSpecialEnemy(enemy, area) {
        if (!area) return false;
        
        const floor = this.gameState.floor;
        const floorData = area.getFloorData(floor);
        
        // Check if this is a final floor with boss mechanics
        if (floorData && floorData.isFinalFloor) {
            // Different areas can have different boss trigger conditions
            if (area.id === 'caverns' && enemy.type === 'skeleton') {
                // Original cavern logic - 5th skeleton
                const progressKey = `${area.id}_skeletonsKilled_${floor}`;
                if (!this.gameState.campaignProgress[progressKey]) {
                    this.gameState.campaignProgress[progressKey] = 0;
                }
                this.gameState.campaignProgress[progressKey]++;
                return this.gameState.campaignProgress[progressKey] >= 5;
            } else if (area.id === 'forest' && enemy.type === 'treant') {
                // Forest logic - any treant on final floor
                return true;
            }
        }
        return false;
    }
    
    triggerBossEvent(enemy, area) {
        // Use area-specific boss narratives if available
        let narrative = "As the final guardian falls, the chamber trembles. Victory is yours!";
        
        if (area.id === 'caverns') {
            narrative = "As the final guardian falls, the chamber trembles. The ancient evil stirs... but your courage has proven greater than its malice. The curse begins to lift!";
        } else if (area.id === 'forest') {
            narrative = "The ancient treant's final breath rustles through the sacred grove. The forest spirits whisper their gratitude as peace returns to the woods.";
        }
        
        this.eventBus.emit('narrative.triggered', {
            narrative: narrative,
            importance: 'urgent'
        });
        
        // Mark area boss as defeated
        const progressKey = `${area.id}_bossDefeated`;
        this.gameState.campaignProgress[progressKey] = true;
        
        // Trigger area completion
        setTimeout(() => {
            this.handleAreaCompleted(area);
        }, 500);
    }
    
    awardFloorCompletionBonus(area, floor) {
        if (!area) return;
        
        const floorData = area.getFloorData(floor);
        if (floorData && floorData.completionBonus) {
            const bonus = floorData.completionBonus;
            this.gameState.player.gold += bonus.gold;
            this.gameState.addMessage(`+${bonus.gold} gold! ${bonus.message}`, 'gold-msg');
        }
    }
    
    updateCampaignProgress(floor) {
        if (!this.gameState.campaignProgress) {
            this.gameState.campaignProgress = {};
        }
        
        this.gameState.campaignProgress.currentFloor = floor;
        this.gameState.campaignProgress.floorsReached = Math.max(
            this.gameState.campaignProgress.floorsReached || 0, 
            floor
        );
    }
    
    completeCampaign() {
        // Prevent duplicate completion
        if (this.campaignData.completed || (this.gameState.campaignProgress && this.gameState.campaignProgress.completed)) {
            return;
        }
        
        this.campaignData.completed = true;
        this.gameState.campaignProgress = this.gameState.campaignProgress || {};
        this.gameState.campaignProgress.completed = true;
        this.gameState.campaignProgress.endTime = Date.now();
        
        // Trigger victory cutscene through new cutscene manager
        const completionTime = this.gameState.campaignProgress.endTime - this.gameState.campaignProgress.startTime;
        const stats = {
            level: this.gameState.player.level,
            gold: this.gameState.player.gold,
            enemiesKilled: this.gameState.stats.enemiesKilled,
            loreCount: this.getLoreCount()
        };
        const finalScore = this.calculateCampaignScore();
        
        this.eventBus.emit('campaign.victory', {
            stats: stats,
            score: finalScore,
            time: completionTime
        });
    }
    
    
    calculateCampaignScore() {
        const stats = this.gameState.stats;
        const progress = this.gameState.campaignProgress;
        const timeBonus = Math.max(0, 10000 - (progress.endTime - progress.startTime) / 100);
        
        return Math.floor(
            (this.gameState.player.level * 200) +
            (stats.enemiesKilled * 50) +
            (this.gameState.player.gold * 2) +
            (this.getLoreCount() * 100) +
            timeBonus
        );
    }
    
    getLoreCount() {
        if (window.GameEvents) {
            const allLore = window.GameEvents.getAllLore();
            return allLore.length;
        }
        return 0;
    }
}