// Campaign System for 3-Floor Story Progression
class CampaignSystem {
    constructor(eventBus, gameState) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        
        this.campaignData = {
            totalFloors: 3,
            currentFloor: 1,
            completed: false,
            
            floorThemes: {
                1: {
                    name: "The Shallow Crypts",
                    description: "Ancient burial chambers where restless spirits guard forgotten treasures.",
                    atmosphere: "musty",
                    enemies: ["goblin"],
                    specialEvents: ["crypt_whispers", "ancient_inscription", "ghostly_presence"]
                },
                2: {
                    name: "The Bone Gardens", 
                    description: "Deeper halls where skeletal warriors patrol cursed groves of bone trees.",
                    atmosphere: "eerie",
                    enemies: ["goblin", "skeleton"],
                    specialEvents: ["bone_tree", "skeletal_patrol", "cursed_grove"]
                },
                3: {
                    name: "The Heart of Darkness",
                    description: "The deepest chamber where an ancient evil slumbers, waiting...",
                    atmosphere: "oppressive",
                    enemies: ["skeleton"],
                    specialEvents: ["final_chamber", "ancient_evil", "boss_encounter"],
                    isFinalFloor: true
                }
            },
            
            storyBeats: {
                floor1_enter: "You descend into the Shallow Crypts. The air grows thick with the musty scent of ages past...",
                floor1_complete: "The whispers of the dead fade as you find the descending passage. Darker depths await below.",
                
                floor2_enter: "You enter the Bone Gardens. Twisted trees of yellowed bone stretch toward the vaulted ceiling...",
                floor2_complete: "The skeletal guardians lie still. A final stairway descends into absolute darkness.",
                
                floor3_enter: "The Heart of Darkness throbs with malevolent energy. This is where your true test begins...",
                campaign_complete: "The ancient evil is vanquished! Light returns to the depths, and the kingdom is saved!"
            }
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
        const floorData = this.campaignData.floorThemes[floor];
        
        if (!floorData) return;
        
        // Show floor introduction
        const introKey = `floor${floor}_enter`;
        const introText = this.campaignData.storyBeats[introKey];
        
        if (introText) {
            this.eventBus.emit('narrative.triggered', {
                narrative: introText,
                importance: 'high'
            });
        }
        
        // Add floor-specific atmospheric message
        setTimeout(() => {
            this.eventBus.emit('narrative.triggered', {
                narrative: `Welcome to ${floorData.name}. ${floorData.description}`,
                importance: 'normal'
            });
        }, 3000);
        
        // Set floor-specific enemy spawning
        if (this.gameState && this.gameState.setFloorEnemyTypes) {
            this.gameState.setFloorEnemyTypes(floorData.enemies);
        }
        
        // Track campaign progress
        this.updateCampaignProgress(floor);
        
        // Generate floor-specific lore
        this.generateFloorLore(floor, floorData);
    }
    
    handleFloorCompleted(data) {
        const floor = data.floor;
        
        // Check if this is the final floor
        if (floor >= this.campaignData.totalFloors) {
            // Don't complete immediately - wait for boss event
            // Campaign completion happens in triggerBossEvent or when final enemy is killed
            return;
        }
        
        // Show floor completion narrative
        const completionKey = `floor${floor}_complete`;
        const completionText = this.campaignData.storyBeats[completionKey];
        
        if (completionText) {
            this.eventBus.emit('narrative.triggered', {
                narrative: completionText,
                importance: 'normal'
            });
        }
        
        // Award completion bonus
        this.awardFloorCompletionBonus(floor);
    }
    
    handleEnemyKilled(data) {
        const floor = this.gameState.floor;
        const enemy = data.enemy;
        
        // Generate contextual combat narratives
        this.generateCombatNarrative(floor, enemy);
        
        // Check for boss encounters on final floor
        if (floor === 3 && this.isSpecialEnemy(enemy)) {
            this.triggerBossEvent(enemy);
        }
    }
    
    checkForSpecialEvents(data) {
        const floor = this.gameState.floor;
        const floorData = this.campaignData.floorThemes[floor];
        
        if (!floorData || !floorData.specialEvents) return;
        
        // 2% chance per turn for special event
        if (Math.random() < 0.02) {
            const eventType = floorData.specialEvents[Math.floor(Math.random() * floorData.specialEvents.length)];
            this.triggerSpecialEvent(floor, eventType);
        }
    }
    
    triggerSpecialEvent(floor, eventType) {
        const events = {
            // Floor 1 events
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
            
            // Floor 2 events
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
            
            // Floor 3 events
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
        };
        
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
                    id: `special_${eventType}_${Date.now()}`,
                    content: event.narrative,
                    rarity: 'rare',
                    timestamp: Date.now(),
                    source: 'special_event'
                }
            });
        }
    }
    
    generateCombatNarrative(floor, enemy) {
        const narratives = {
            1: { // Shallow Crypts
                goblin: [
                    "The crypt goblin's eyes glaze over as it returns to eternal rest.",
                    "Another guardian of the ancient tombs falls silent.",
                    "The goblin's death rattle echoes through the burial chambers."
                ]
            },
            2: { // Bone Gardens
                goblin: [
                    "The bone garden goblin crumbles to dust among the twisted trees.",
                    "Your blade sends another corrupted soul to its final rest."
                ],
                skeleton: [
                    "The skeletal warrior collapses into a pile of ancient bones.",
                    "Freed from its cursed duty, the skeleton finally finds peace.",
                    "The bone guardian's eternal vigil comes to an end."
                ]
            },
            3: { // Heart of Darkness
                skeleton: [
                    "The shadow-wreathed skeleton dissolves into nothingness.",
                    "Another servant of darkness falls before your righteous blade.",
                    "The cursed bones scatter as the dark magic binding them fails."
                ]
            }
        };
        
        const floorNarratives = narratives[floor];
        if (floorNarratives && floorNarratives[enemy.type]) {
            const possibleNarratives = floorNarratives[enemy.type];
            const selectedNarrative = possibleNarratives[Math.floor(Math.random() * possibleNarratives.length)];
            
            this.eventBus.emit('narrative.triggered', {
                narrative: selectedNarrative,
                importance: 'low'
            });
        }
    }
    
    generateFloorLore(floor, floorData) {
        const loreEntries = {
            1: [
                "The Shallow Crypts were once the honored burial ground of Aethermoor's noble families.",
                "Ancient texts speak of protective wards that have long since failed.",
                "The goblins here were once grave keepers, now twisted by dark magic."
            ],
            2: [
                "The Bone Gardens were created by a mad necromancer centuries ago.",
                "Each bone tree represents a fallen hero who tried to cleanse this place.",
                "The skeletal guardians were once the necromancer's most trusted servants."
            ],
            3: [
                "The Heart of Darkness contains the source of all the dungeon's corruption.",
                "An ancient demon lord was bound here by the kingdom's greatest heroes.",
                "The final chamber holds the key to either salvation or eternal damnation."
            ]
        };
        
        const entries = loreEntries[floor];
        if (entries) {
            entries.forEach((content, index) => {
                setTimeout(() => {
                    this.eventBus.emit('lore.discovered', {
                        category: 'exploration',
                        entry: {
                            id: `floor${floor}_lore_${index}`,
                            content: content,
                            rarity: 'common',
                            timestamp: Date.now(),
                            source: 'floor_exploration'
                        }
                    });
                }, (index + 1) * 2000); // Stagger discoveries
            });
        }
    }
    
    isSpecialEnemy(enemy) {
        // In a full implementation, this would check for boss enemies
        // For now, we'll trigger on the 5th skeleton killed on floor 3
        if (this.gameState.floor === 3 && enemy.type === 'skeleton') {
            if (!this.gameState.campaignProgress.skeletonsKilledFloor3) {
                this.gameState.campaignProgress.skeletonsKilledFloor3 = 0;
            }
            this.gameState.campaignProgress.skeletonsKilledFloor3++;
            
            return this.gameState.campaignProgress.skeletonsKilledFloor3 >= 5;
        }
        return false;
    }
    
    triggerBossEvent(enemy) {
        this.eventBus.emit('narrative.triggered', {
            narrative: "As the final guardian falls, the chamber trembles. The ancient evil stirs... but your courage has proven greater than its malice. The curse begins to lift!",
            importance: 'urgent'
        });
        
        // Mark campaign as nearly complete
        this.gameState.campaignProgress.bossDefeated = true;
        
        // Trigger ending sequence in 3 seconds
        setTimeout(() => {
            this.completeCampaign();
        }, 3000);
    }
    
    awardFloorCompletionBonus(floor) {
        const bonuses = {
            1: { gold: 25, message: "The spirits of the crypts reward your courage with ancient gold." },
            2: { gold: 50, message: "The bone gardens yield their treasures to the worthy." },
            3: { gold: 100, message: "The darkness recedes, revealing the final treasure hoard." }
        };
        
        const bonus = bonuses[floor];
        if (bonus) {
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
        this.campaignData.completed = true;
        this.gameState.campaignProgress.completed = true;
        this.gameState.campaignProgress.endTime = Date.now();
        
        // Show victory cutscene
        this.showVictoryCutscene();
    }
    
    showVictoryCutscene() {
        const completionTime = this.gameState.campaignProgress.endTime - this.gameState.campaignProgress.startTime;
        const minutes = Math.floor(completionTime / 60000);
        const seconds = Math.floor((completionTime % 60000) / 1000);
        
        const stats = this.gameState.stats;
        const finalScore = this.calculateCampaignScore();
        
        // Show ending narrative immediately
        this.eventBus.emit('narrative.triggered', {
            narrative: this.campaignData.storyBeats.campaign_complete,
            importance: 'urgent'
        });
        
        // Add victory announcement
        setTimeout(() => {
            this.eventBus.emit('narrative.triggered', {
                narrative: "🏆 CAMPAIGN COMPLETE! The kingdom is saved! 🏆",
                importance: 'urgent'
            });
        }, 1500);
        
        // Show victory screen after brief pause
        setTimeout(() => {
            this.showVictoryScreen(finalScore, minutes, seconds);
        }, 3000);
    }
    
    showVictoryScreen(score, minutes, seconds) {
        if (window.game && window.game.modal) {
            const content = `
                <div style="text-align: center; color: #d4af37; font-size: 16px; margin-bottom: 20px;">
                    🏆 CAMPAIGN COMPLETE! 🏆
                </div>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <strong>The Cursed Depths have been cleansed!</strong><br>
                    Your heroic deeds will be remembered for generations.
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; text-align: left;">
                    <div>
                        <strong style="color: #8fbc8f;">Final Statistics:</strong><br>
                        Final Level: ${this.gameState.player.level}<br>
                        Gold Earned: ${this.gameState.player.gold}<br>
                        Enemies Defeated: ${this.gameState.stats.enemiesKilled}<br>
                        Floors Conquered: ${this.campaignData.totalFloors}
                    </div>
                    <div>
                        <strong style="color: #daa520;">Campaign Results:</strong><br>
                        Time: ${minutes}m ${seconds}s<br>
                        Final Score: ${score}<br>
                        Lore Collected: ${this.getLoreCount()}<br>
                        Completion: 100%
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-style: italic; color: #a0a0a0;">
                    Thank you for playing The Cursed Depths!<br>
                    Your legend lives on in the kingdom of Aethermoor.
                </div>
            `;
            
            window.game.modal.show({
                title: 'VICTORY!',
                content: content,
                actions: [
                    { 
                        text: 'Play Again', 
                        action: () => {
                            location.reload();
                        }
                    },
                    { 
                        text: 'View Lore Collection', 
                        action: () => {
                            window.game.modal.hide();
                            window.game.narrativeUI.showLoreModal();
                        }
                    }
                ]
            });
        }
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