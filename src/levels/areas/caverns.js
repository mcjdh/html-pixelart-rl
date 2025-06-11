const cavernsLevel = new LevelDefinition({
    id: 'caverns',
    name: 'The Ancient Caverns',
    theme: 'cavern',
    sprite: 'cavern',
    
    tileSprites: {
        wall: () => window.cavernSprites ? window.cavernSprites.wall : (window.terrainSprites ? window.terrainSprites.wall : null),
        floor: () => window.cavernSprites ? window.cavernSprites.floor : (window.terrainSprites ? window.terrainSprites.floor : null),
        stairs: () => window.cavernSprites ? window.cavernSprites.stairs : (window.terrainSprites ? window.terrainSprites.stairs : null),
        stalagmite: () => window.cavernSprites ? window.cavernSprites.stalagmite : null,
        crystal: () => window.cavernSprites ? window.cavernSprites.crystal : null,
        rubble: () => window.cavernSprites ? window.cavernSprites.rubble : null,
        bones: () => window.cavernSprites ? window.cavernSprites.bones : null
    },
    
    floors: [
        {
            number: 1,
            name: "The Shallow Crypts",
            description: "Ancient burial chambers where restless spirits guard forgotten treasures.",
            narrative: {
                enter: "You descend into the Shallow Crypts. The air grows thick with the musty scent of ages past...",
                complete: "The whispers of the dead fade as you find the descending passage. Darker depths await below."
            },
            enemies: ["goblin"],
            enemyCount: { base: 3, perFloor: 2 },
            itemCount: { base: 2, perFloor: 0.5 },
            mapOverrides: {
                roomCount: { base: 5, perFloor: 0 },
                roomSize: { min: 5, max: 10 }
            },
            specialEvents: ["crypt_whispers", "ancient_inscription", "ghostly_presence"],
            completionBonus: {
                gold: 25,
                message: "The spirits of the crypts reward your courage with ancient gold."
            }
        },
        {
            number: 2,
            name: "The Bone Gardens",
            description: "Deeper halls where skeletal warriors patrol cursed groves of bone trees.",
            narrative: {
                enter: "You enter the Bone Gardens. Twisted trees of yellowed bone stretch toward the vaulted ceiling...",
                complete: "The skeletal guardians lie still. A final stairway descends into absolute darkness."
            },
            enemies: ["goblin", "skeleton"],
            enemyCount: { base: 5, perFloor: 2 },
            itemCount: { base: 3, perFloor: 0.5 },
            mapOverrides: {
                roomCount: { base: 6, perFloor: 0 },
                roomSize: { min: 6, max: 12 }
            },
            specialEvents: ["bone_tree", "skeletal_patrol", "cursed_grove"],
            completionBonus: {
                gold: 50,
                message: "The bone gardens yield their treasures to the worthy."
            }
        },
        {
            number: 3,
            name: "The Heart of Darkness",
            description: "The deepest chamber where an ancient evil slumbers, waiting...",
            narrative: {
                enter: "The Heart of Darkness throbs with malevolent energy. This is where your true test begins...",
                complete: "The ancient evil is vanquished! Light returns to the cavern, and the kingdom is saved!"
            },
            enemies: ["skeleton"],
            enemyCount: { base: 7, perFloor: 2 },
            itemCount: { base: 4, perFloor: 0.5 },
            mapOverrides: {
                roomCount: { base: 7, perFloor: 0 },
                roomSize: { min: 7, max: 14 }
            },
            specialEvents: ["final_chamber", "ancient_evil", "boss_encounter"],
            isFinalFloor: true,
            completionBonus: {
                gold: 100,
                message: "The darkness recedes, revealing the final treasure hoard."
            }
        }
    ],
    
    enemyTypes: {
        default: ["goblin", "skeleton"]
    },
    
    itemTypes: {
        common: ["health_potion", "energy_potion"],
        rare: ["strength_potion", "defense_potion"],
        epic: ["sword", "shield", "armor"]
    },
    
    mapConfig: {
        baseRoomCount: 12,
        roomsPerFloor: 3,
        minRoomSize: 6,
        maxRoomSize: 12,
        corridorWidth: 1,
        decorationChance: 0.1
    },
    
    progression: {
        unlocks: ["forest"],
        connections: ["forest"],
        victoryCondition: "complete_all_floors"
    },
    
    narrative: {
        loreCategories: ["mysteries", "legends", "bestiary", "exploration"],
        combatNarratives: {
            goblin: [
                "The crypt goblin's eyes glaze over as it returns to eternal rest.",
                "Another guardian of the ancient tombs falls silent.",
                "The goblin's death rattle echoes through the burial chambers."
            ],
            skeleton: [
                "The skeletal warrior collapses into a pile of ancient bones.",
                "Freed from its cursed duty, the skeleton finally finds peace.",
                "The bone guardian's eternal vigil comes to an end."
            ]
        }
    },
    
    ambience: {
        1: { atmosphere: "musty", lightLevel: 0.7 },
        2: { atmosphere: "eerie", lightLevel: 0.5 },
        3: { atmosphere: "oppressive", lightLevel: 0.3 }
    }
});

window.cavernsLevel = cavernsLevel;