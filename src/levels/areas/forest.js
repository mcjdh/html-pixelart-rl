const forestLevel = new LevelDefinition({
    id: 'forest',
    name: 'The Enchanted Woods',
    theme: 'forest',
    sprite: 'forest',
    
    tileSprites: {
        wall: () => window.forestSprites ? window.forestSprites.tree : (window.terrainSprites ? window.terrainSprites.wall : null),
        floor: () => window.forestSprites ? window.forestSprites.grass : (window.terrainSprites ? window.terrainSprites.floor : null),
        stairs: () => window.terrainSprites ? window.terrainSprites.stairs : null,
        path: () => window.forestSprites ? window.forestSprites.path : (window.terrainSprites ? window.terrainSprites.floor : null),
        flower: () => window.forestSprites ? window.forestSprites.flower : (window.decorationSprites ? window.decorationSprites.crystal : null),
        stone: () => window.forestSprites ? window.forestSprites.stone : (window.decorationSprites ? window.decorationSprites.rubble : null),
        bush: () => window.forestSprites ? window.forestSprites.bush : (window.decorationSprites ? window.decorationSprites.bones : null)
    },
    
    floors: [
        {
            number: 1,
            name: "Forest Edge",
            description: "The outskirts of the ancient forest, where civilization meets the wild.",
            narrative: {
                enter: "You step into the forest. Sunlight filters through the canopy, casting dancing shadows on the forest floor...",
                complete: "The path winds deeper into the woods. The trees grow thicker, and strange sounds echo from within..."
            },
            enemies: ["goblin"],
            enemyCount: { base: 4, perFloor: 1 },
            itemCount: { base: 3, perFloor: 0.5 },
            mapOverrides: {
                roomCount: { base: 6, perFloor: 0 },
                roomSize: { min: 6, max: 10 },
                decorationChance: 0.15
            },
            specialEvents: ["rustling_leaves", "fairy_lights", "ancient_oak"],
            completionBonus: {
                gold: 30,
                message: "The forest spirits reward your courage with golden acorns."
            }
        },
        {
            number: 2,
            name: "Deep Woods",
            description: "The heart of the forest, where ancient magic still lingers.",
            narrative: {
                enter: "The canopy above blocks most sunlight. Glowing mushrooms provide an eerie illumination...",
                complete: "You've reached the sacred grove. One final challenge awaits in the forest's depths..."
            },
            enemies: ["goblin", "wolf"],
            enemyCount: { base: 6, perFloor: 1 },
            itemCount: { base: 4, perFloor: 0.5 },
            mapOverrides: {
                roomCount: { base: 7, perFloor: 0 },
                roomSize: { min: 7, max: 12 },
                decorationChance: 0.2
            },
            specialEvents: ["enchanted_spring", "talking_tree", "wisp_guidance"],
            completionBonus: {
                gold: 60,
                message: "The woodland creatures leave gifts of precious amber and herbs."
            }
        },
        {
            number: 3,
            name: "Sacred Grove",
            description: "The most ancient part of the forest, protected by powerful nature spirits.",
            narrative: {
                enter: "You enter the Sacred Grove. The very air hums with primal magic...",
                complete: "The forest spirit has been appeased! The woods return to their peaceful slumber."
            },
            enemies: ["wolf", "treant"],
            enemyCount: { base: 8, perFloor: 1 },
            itemCount: { base: 5, perFloor: 0.5 },
            mapOverrides: {
                roomCount: { base: 8, perFloor: 0 },
                roomSize: { min: 8, max: 14 },
                decorationChance: 0.25
            },
            specialEvents: ["spirit_challenge", "nature_blessing", "elder_tree"],
            isFinalFloor: true,
            completionBonus: {
                gold: 120,
                message: "The forest spirit grants you its blessing and a hoard of nature's treasures."
            }
        }
    ],
    
    enemyTypes: {
        default: ["goblin", "wolf"]
    },
    
    itemTypes: {
        common: ["health_potion", "energy_potion", "herb"],
        rare: ["nature_staff", "bark_armor", "speed_potion"],
        epic: ["druid_robe", "forest_crown", "spirit_bow"]
    },
    
    mapConfig: {
        baseRoomCount: 12,
        roomsPerFloor: 3,
        minRoomSize: 7,
        maxRoomSize: 14,
        corridorWidth: 1,
        decorationChance: 0.15
    },
    
    progression: {
        unlocks: ["mushroom"],  // Unlock the final fungal depths
        connections: ["caverns", "mushroom"],
        victoryCondition: "complete_all_floors"
    },
    
    narrative: {
        loreCategories: ["nature", "spirits", "ancient_magic", "forest_creatures"],
        combatNarratives: {
            goblin: [
                "The forest goblin returns to the earth.",
                "Nature reclaims the fallen goblin.",
                "The goblin's spirit joins the forest."
            ],
            wolf: [
                "The wolf's howl fades into silence.",
                "The pack will mourn this fallen hunter.",
                "The wolf returns to the eternal hunt."
            ],
            treant: [
                "The ancient tree spirit finally finds rest.",
                "Leaves fall as the treant returns to slumber.",
                "The forest guardian's vigil ends."
            ]
        }
    },
    
    ambience: {
        1: { atmosphere: "peaceful", lightLevel: 0.8 },
        2: { atmosphere: "mysterious", lightLevel: 0.6 },
        3: { atmosphere: "magical", lightLevel: 0.7 }
    }
});

window.forestLevel = forestLevel;