const mushroomLevel = new LevelDefinition({
    id: 'mushroom',
    name: 'Fungal Depths',
    theme: 'mushroom',
    
    tileSprites: {
        wall: () => window.mushroomSprites ? window.mushroomSprites.wall : window.SPRITES.terrain.wall,
        floor: () => window.mushroomSprites ? window.mushroomSprites.floor : window.SPRITES.terrain.floor,
        mushroom: () => window.mushroomSprites ? window.mushroomSprites.mushroom : null,
        spores: () => window.mushroomSprites ? window.mushroomSprites.spores : null,
        giantMushroom: () => window.mushroomSprites ? window.mushroomSprites.giantMushroom : null
    },
    
    floors: [
        {
            number: 1,
            name: "Spore Caverns",
            description: "Damp caves filled with glowing fungi that pulse with otherworldly energy",
            narrative: {
                enter: "The air grows thick with spores as you descend into the fungal depths. Bioluminescent fungi cast an eerie purple glow on the cavern walls, and you can hear the soft rustle of unseen creatures moving through the mycelium networks.",
                complete: "The spores seem to pulse with an ancient rhythm, as if responding to your presence. You sense something greater awakening in the depths below."
            },
            enemies: ["sporeling"],
            enemyCount: { base: 5, perFloor: 2 },
            itemCount: { base: 3, perFloor: 0.5 },
            specialEvents: ["spore_cloud", "mushroom_growth"],
            completionBonus: {
                gold: 50,
                message: "The fungi release golden spores as a tribute to your strength!"
            }
        },
        {
            number: 2,
            name: "Mycelium Network",
            description: "A vast underground network of fungal threads that connects the entire island",
            narrative: {
                enter: "The walls pulse with bioluminescent veins that stretch endlessly through the caverns. You realize you've entered a living network of consciousness, where every step sends ripples through the fungal web. Armored fungal knights guard the ancient pathways.",
                complete: "The mycelium network trembles at your passage. The very island seems to recognize your power, and the path to the heart of the fungal realm opens before you."
            },
            enemies: ["sporeling", "fungalKnight"],
            enemyCount: { base: 6, perFloor: 2 },
            itemCount: { base: 4, perFloor: 0.5 },
            specialEvents: ["mycelium_pulse", "fungal_armor"],
            completionBonus: {
                gold: 75,
                message: "The mycelium network rewards your courage with ancient treasures!"
            }
        },
        {
            number: 3,
            name: "The Spore Mother's Chamber",
            description: "The sacred heart of the fungal kingdom, where the ancient Spore Mother has slumbered for millennia",
            narrative: {
                enter: "You enter a vast chamber where the very air shimmers with ancient magic. At its center, a colossal fungal entity rises from the living floor - the Spore Mother, guardian of the island's primordial power. Her countless eyes open to regard you with both curiosity and ancient wisdom.",
                complete: "With the Spore Mother's blessing earned through trial by combat, the fungal plague that threatened the mainland has been cleansed. The realm is finally at peace, and you stand as the champion who conquered all three sacred domains - the caverns of bone, the mystic forests, and the fungal depths."
            },
            enemies: ["sporeling", "fungalKnight"],
            bosses: ["sporeMother"],
            enemyCount: { base: 4, perFloor: 1 },
            itemCount: { base: 5, perFloor: 1 },
            isFinalFloor: true,
            completionBonus: {
                gold: 200,
                message: "The Spore Mother bestows upon you the treasures of the deep!"
            }
        }
    ],
    
    enemyTypes: {
        default: ["sporeling"],
        advanced: ["fungalKnight"],
        bosses: ["sporeMother"]
    },
    
    mapConfig: {
        baseRoomCount: 7,
        roomsPerFloor: 1,
        minRoomSize: 6,
        maxRoomSize: 12,
        corridorWidth: 2,
        decorationChance: 0.3,
        mushroomClusterChance: 0.4,
        sporeCloudChance: 0.2
    },
    
    progression: {
        unlocks: [],
        connections: [],
        victoryCondition: "game_complete"
    },
    
    narrative: {
        loreCategories: ["fungal", "spores", "ancient", "bioluminescence", "consciousness"],
        combatNarratives: {
            sporeling: [
                "The sporeling releases a cloud of toxic spores!",
                "Tiny fungal tendrils lash out with surprising strength!",
                "The creature pulses with bioluminescent energy!",
                "Spore clouds obscure your vision as the sporeling attacks!"
            ],
            fungalKnight: [
                "The fungal knight's armor gleams with organic plating!",
                "Ancient mushroom magic strengthens the warrior's blows!",
                "The knight's spore sword leaves a trail of toxic mist!",
                "Fungal networks amplify the knight's defensive capabilities!"
            ],
            sporeMother: [
                "The Spore Mother's presence fills the chamber with overwhelming power!",
                "Ancient fungal magic permeates every breath you take!",
                "Countless spores dance in the air like living constellations!",
                "The very island trembles as the Spore Mother awakens!",
                "Primordial consciousness flows through the mycelium network!",
                "The chamber itself seems to pulse with the Spore Mother's heartbeat!"
            ]
        },
        flavorText: {
            exploration: [
                "Glowing mushrooms provide an eerie light in the darkness.",
                "The air shimmers with floating spores that seem almost alive.",
                "Soft bioluminescent veins pulse along the cavern walls.",
                "The ground beneath your feet feels spongy with fungal growth.",
                "Ancient spores drift down from unseen heights above."
            ],
            combat: [
                "Your weapon cuts through clouds of defensive spores!",
                "The fungal creatures seem to communicate through chemical signals!",
                "Each defeated enemy releases a burst of glowing particles!",
                "The very air seems to fight against your intrusion!"
            ]
        }
    },
    
    ambience: {
        1: { atmosphere: "mysterious", lightLevel: 0.4, sporeIntensity: 0.3 },
        2: { atmosphere: "ancient", lightLevel: 0.3, sporeIntensity: 0.6 },
        3: { atmosphere: "primordial", lightLevel: 0.2, sporeIntensity: 1.0 }
    },
    
    specialFeatures: {
        sporeEffects: true,
        bioluminescence: true,
        livingWalls: true,
        mushroomGrowth: true
    }
});

// Register globally
window.mushroomLevel = mushroomLevel;