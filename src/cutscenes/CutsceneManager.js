// Cutscene Manager - Handles all game cutscenes and narrative sequences
class CutsceneManager {
    constructor(eventBus, narrativeUI) {
        this.eventBus = eventBus;
        this.narrativeUI = narrativeUI;
        this.isPlaying = false;
        this.currentSequence = null;
        this.sequenceQueue = [];
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for cutscene triggers
        this.eventBus.on('cutscene.play', (eventData) => {
            this.playCutscene(eventData.data);
        });
        
        // Listen for campaign events
        this.eventBus.on('campaign.victory', (eventData) => {
            this.playVictoryCutscene(eventData.data);
        });
        
        this.eventBus.on('campaign.started', (eventData) => {
            this.playOpeningCutscene(eventData.data);
        });
        
        this.eventBus.on('floor.entered', (eventData) => {
            this.playFloorIntro(eventData.data);
        });
        
        this.eventBus.on('player.died', (eventData) => {
            this.playDeathCutscene(eventData.data);
        });
    }
    
    playCutscene(cutsceneData) {
        if (this.isPlaying && !cutsceneData.interrupt) {
            this.sequenceQueue.push(cutsceneData);
            return;
        }
        
        this.isPlaying = true;
        this.currentSequence = cutsceneData;
        
        this.executeCutscene(cutsceneData);
    }
    
    async executeCutscene(cutsceneData) {
        const { type, data, sequences } = cutsceneData;
        
        switch (type) {
            case 'narrative_sequence':
                await this.playNarrativeSequence(sequences);
                break;
            case 'victory':
                await this.playVictorySequence(data);
                break;
            case 'death':
                await this.playDeathSequence(data);
                break;
            case 'floor_intro':
                await this.playFloorIntroSequence(data);
                break;
            case 'opening':
                await this.playOpeningSequence(data);
                break;
        }
        
        this.isPlaying = false;
        this.currentSequence = null;
        
        // Process queued cutscenes
        if (this.sequenceQueue.length > 0) {
            const next = this.sequenceQueue.shift();
            this.playCutscene(next);
        }
    }
    
    async playNarrativeSequence(sequences) {
        for (let i = 0; i < sequences.length; i++) {
            const sequence = sequences[i];
            
            // Emit to narrative system (for red banners)
            this.eventBus.emit('narrative.triggered', {
                narrative: sequence.text,
                importance: sequence.importance || 'normal'
            });
            
            // Also directly add to console log for better visibility
            if (window.game && window.game.gameState) {
                const className = this.getConsoleClass(sequence.importance);
                window.game.gameState.addMessage(`📜 ${sequence.text}`, className);
            }
            
            if (sequence.delay) {
                await this.delay(sequence.delay);
            }
        }
    }
    
    getConsoleClass(importance) {
        const classMap = {
            urgent: 'narrative-urgent',
            important: 'narrative-important',
            story: 'narrative-story',
            normal: 'narrative-story'
        };
        return classMap[importance] || 'narrative-story';
    }
    
    async playVictorySequence(data) {
        const { stats, score, time } = data;
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        
        // Victory cutscene sequence - improved timing and visibility
        const victorySequences = [
            { text: "🌟 The final shadow dissolves as ancient magic unravels...", importance: 'urgent', delay: 3000 },
            { text: "⚡ The ancient evil is vanquished! Light returns to the depths!", importance: 'urgent', delay: 3000 },
            { text: "🏰 The cursed depths are cleansed! The kingdom is saved!", importance: 'urgent', delay: 3000 },
            { text: "👑 The kingdom celebrates your heroic triumph!", importance: 'important', delay: 2000 },
            { text: "🏆 CAMPAIGN COMPLETE! You are the Hero of the Cursed Depths! 🏆", importance: 'urgent', delay: 3000 }
        ];
        
        await this.playNarrativeSequence(victorySequences);
        
        // Show final statistics in console
        await this.showFinalStatsInConsole(stats, score, minutes, seconds);
        
        // Show victory modal after brief pause
        await this.delay(2000);
        this.showVictoryModal(stats, score, minutes, seconds);
    }
    
    async playDeathSequence(data) {
        const deathNarratives = [
            "💀 Your journey ends here, brave adventurer. The dungeon claims another soul...",
            "🌑 Darkness embraces you as your tale comes to a close...",
            "⚰️ The ancient stones bear witness to your final moments. Rest now, weary traveler...",
            "🕯️ Your light fades, but legends of your bravery shall echo through these halls..."
        ];
        
        const narrative = deathNarratives[Math.floor(Math.random() * deathNarratives.length)];
        
        const sequences = [
            { text: narrative, importance: 'urgent', delay: 3000 },
            { text: "💔 --- END OF TALE ---", importance: 'urgent', delay: 0 }
        ];
        
        await this.playNarrativeSequence(sequences);
    }
    
    async playFloorIntroSequence(data) {
        const { floor } = data;
        
        // Floor introduction with better emojis and shorter text
        const floorIntros = {
            1: "⚰️ You descend into the Shallow Crypts. Ancient whispers echo...",
            2: "🦴 You enter the Bone Gardens. Twisted bone trees stretch overhead...",
            3: "💀 The Heart of Darkness throbs with malevolent energy. Your final test begins..."
        };
        
        const introText = floorIntros[floor];
        if (introText) {
            const sequences = [
                { text: introText, importance: 'important', delay: 2000 },
                { text: `🗡️ Floor ${floor} - Prepare yourself, brave adventurer!`, importance: 'story', delay: 1000 }
            ];
            
            await this.playNarrativeSequence(sequences);
        }
    }
    
    async playOpeningSequence(data) {
        const openingSequences = [
            { text: "🏰 You stand at the entrance to the Cursed Depths. Ancient stones whisper warnings...", importance: 'important', delay: 2500 },
            { text: "⚔️ Yet duty calls, and the kingdom's fate rests upon your shoulders.", importance: 'important', delay: 2500 },
            { text: "🌟 Welcome to The Cursed Depths! Your quest begins now...", importance: 'story', delay: 1000 }
        ];
        
        await this.playNarrativeSequence(openingSequences);
    }
    
    async showFinalStatsInConsole(stats, score, minutes, seconds) {
        const sequences = [
            { text: "📊 FINAL CAMPAIGN STATISTICS 📊", importance: 'important', delay: 1000 },
            { text: `⚔️ Hero Level: ${stats.level} | 💰 Gold Earned: ${stats.gold}`, importance: 'story', delay: 1000 },
            { text: `💀 Enemies Vanquished: ${stats.enemiesKilled} | ⏱️ Time: ${minutes}m ${seconds}s`, importance: 'story', delay: 1000 },
            { text: `🏆 Final Score: ${score} | 📜 Lore Collected: ${stats.loreCount || 0}`, importance: 'story', delay: 0 }
        ];
        
        await this.playNarrativeSequence(sequences);
    }
    
    showVictoryModal(stats, score, minutes, seconds) {
        if (window.game && window.game.modal) {
            // Simplified, more compact victory message
            const content = `🏆 CAMPAIGN COMPLETE! 🏆

The Cursed Depths have been cleansed!

Final Stats:
Level: ${stats.level} | Time: ${minutes}m ${seconds}s
Enemies: ${stats.enemiesKilled} | Score: ${score}
Lore: ${stats.loreCount || 0} | Gold: ${stats.gold}

Thank you for playing!`;
            
            window.game.modal.show({
                title: 'VICTORY!',
                message: content,
                buttons: [
                    { 
                        text: 'Play Again', 
                        primary: true,
                        callback: () => {
                            location.reload();
                        }
                    },
                    { 
                        text: 'View Lore', 
                        callback: () => {
                            window.game.modal.hide();
                            window.game.showLoreInConsole();
                        }
                    }
                ]
            });
        }
    }
    
    // Trigger methods for external use
    playVictoryCutscene(data) {
        this.playCutscene({
            type: 'victory',
            data: data,
            interrupt: true
        });
    }
    
    playOpeningCutscene(data) {
        this.playCutscene({
            type: 'opening',
            data: data
        });
    }
    
    playFloorIntro(data) {
        this.playCutscene({
            type: 'floor_intro',
            data: data
        });
    }
    
    playDeathCutscene(data) {
        this.playCutscene({
            type: 'death',
            data: data,
            interrupt: true
        });
    }
    
    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    skipCurrentCutscene() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.currentSequence = null;
            // Process next in queue if any
            if (this.sequenceQueue.length > 0) {
                const next = this.sequenceQueue.shift();
                this.playCutscene(next);
            }
        }
    }
    
    clearQueue() {
        this.sequenceQueue = [];
    }
    
    isPlayingCutscene() {
        return this.isPlaying;
    }
    
}