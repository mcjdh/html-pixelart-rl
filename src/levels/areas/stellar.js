const stellarLevel = new LevelDefinition({
    id: 'stellar',
    name: 'Stellar Observatory',
    theme: 'stellar',
    
    tileSprites: {
        wall: () => window.stellarSprites ? window.stellarSprites.wall : window.SPRITES.terrain.wall,
        floor: () => window.stellarSprites ? window.stellarSprites.floor : window.SPRITES.terrain.floor,
        starChart: () => window.stellarSprites ? window.stellarSprites.starChart : null,
        telescope: () => window.stellarSprites ? window.stellarSprites.telescope : null,
        constellation: () => window.stellarSprites ? window.stellarSprites.constellation : null
    },
    
    floors: [
        {
            number: 1,
            name: "Star Chart Chamber",
            description: "An ancient astronomical library filled with celestial maps and cosmic instruments",
            narrative: {
                enter: "You ascend into a vast observatory where countless star charts cover every surface. The air hums with cosmic energy, and ethereal beings of stardust drift between the constellation maps. Ancient telescopes point toward distant galaxies, their lenses gleaming with otherworldly light.",
                complete: "The star charts begin to glow, revealing pathways between the constellations. You sense a greater cosmic intelligence watching your progress."
            },
            enemies: ["stardustSprite"],
            enemyCount: { base: 4, perFloor: 2 },
            itemCount: { base: 3, perFloor: 0.5 },
            specialEvents: ["stellar_alignment", "cosmic_insight"],
            completionBonus: {
                gold: 60,
                message: "The stars bestow celestial treasures upon you!"
            }
        },
        {
            number: 2,
            name: "Constellation Gallery",
            description: "A magnificent hall where living constellations dance across the cosmic ceiling",
            narrative: {
                enter: "You enter a breathtaking gallery where the very constellations have come to life. Cosmic guardians patrol the stellar pathways, their armor gleaming with starlight. The ceiling displays the entire known universe, with new star patterns forming and dissolving in cosmic harmony.",
                complete: "The constellations align in your honor, opening a pathway to the heart of the observatory. The cosmic guardians bow as you pass, recognizing your astronomical knowledge."
            },
            enemies: ["stardustSprite", "cosmicGuardian"],
            enemyCount: { base: 5, perFloor: 2 },
            itemCount: { base: 4, perFloor: 0.5 },
            specialEvents: ["constellation_formation", "stellar_wisdom"],
            completionBonus: {
                gold: 90,
                message: "The constellations gift you with cosmic knowledge!"
            }
        },
        {
            number: 3,
            name: "Cosmic Observatory",
            description: "The supreme chamber where the Stellar Architect weaves the very fabric of space and time",
            narrative: {
                enter: "At the pinnacle of the observatory, you face the Stellar Architect - an ancient cosmic entity who has mapped every star and guided the birth of galaxies. The chamber itself pulses with the heartbeat of the universe, and you realize this being holds the final key to cosmic understanding.",
                complete: "With the Stellar Architect's cosmic blessing earned through celestial combat, you have mastered the four fundamental realms - earth, nature, primordial life, and cosmic consciousness. The universe itself acknowledges your journey from mortal explorer to cosmic champion. Your legend echoes across all stars!"
            },
            enemies: ["stardustSprite", "cosmicGuardian"],
            bosses: ["stellarArchitect"],
            enemyCount: { base: 3, perFloor: 1 },
            itemCount: { base: 6, perFloor: 1 },
            isFinalFloor: true,
            completionBonus: {
                gold: 300,
                message: "The Stellar Architect grants you mastery over cosmic forces!"
            }
        }
    ],
    
    enemyTypes: {
        default: ["stardustSprite"],
        advanced: ["cosmicGuardian"],
        bosses: ["stellarArchitect"]
    },
    
    mapConfig: {
        baseRoomCount: 8,
        roomsPerFloor: 2,
        minRoomSize: 8,
        maxRoomSize: 14,
        corridorWidth: 3,
        decorationChance: 0.4,
        stellarFeatureChance: 0.5,
        constellationChance: 0.3
    },
    
    progression: {
        unlocks: [],
        connections: [],
        victoryCondition: "game_complete"
    },
    
    narrative: {
        loreCategories: ["astronomy", "cosmic_consciousness", "stellar_mechanics", "universal_harmony"],
        combatNarratives: {
            stardustSprite: [
                "The stardust sprite dissolves into cosmic particles!",
                "Ethereal energy swirls as the sprite fades!",
                "The sprite's stellar essence returns to the void!",
                "Twinkling star fragments mark the sprite's departure!"
            ],
            cosmicGuardian: [
                "The cosmic guardian's stellar armor cracks and crumbles!",
                "Ancient star magic protects the guardian's final moments!",
                "The guardian's constellation crown dims as it falls!",
                "Cosmic energy disperses from the defeated guardian!"
            ],
            stellarArchitect: [
                "The Stellar Architect's cosmic form trembles with ancient power!",
                "Universal constants bend around the Architect's presence!",
                "The very fabric of space-time ripples with each movement!",
                "Galaxies themselves seem to pause, awaiting the outcome!",
                "The Architect's star-crown pulses with the light of creation!",
                "Reality itself shifts as cosmic forces clash!"
            ]
        },
        flavorText: {
            exploration: [
                "Star charts glow softly in the cosmic light.",
                "The observatory hums with celestial energy.",
                "Constellation patterns shift slowly across the walls.",
                "Ancient telescopes track invisible cosmic phenomena.",
                "The air shimmers with stardust and cosmic radiation."
            ],
            combat: [
                "Your weapon cuts through trails of cosmic energy!",
                "Stellar forces amplify the impact of your attacks!",
                "The cosmic battlefield sparkles with celestial power!",
                "Star fragments scatter with each defeated foe!"
            ]
        }
    },
    
    ambience: {
        1: { atmosphere: "cosmic", lightLevel: 0.6, stellarIntensity: 0.4 },
        2: { atmosphere: "celestial", lightLevel: 0.5, stellarIntensity: 0.7 },
        3: { atmosphere: "universal", lightLevel: 0.3, stellarIntensity: 1.0 }
    },
    
    specialFeatures: {
        stellarEffects: true,
        constellationAnimations: true,
        cosmicParticles: true,
        universalHarmony: true
    }
});

// Register globally
window.stellarLevel = stellarLevel;