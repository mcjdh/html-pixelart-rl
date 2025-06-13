/**
 * Skill Action Tracking - Handles experience gains from player actions
 */
class SkillActions {
    constructor(player) {
        this.player = player;
        this.skillSystem = player.skillSystem;
    }
    
    /**
     * Track player actions and award appropriate skill experience
     */
    trackAction(actionType, value = 1) {
        this.player.actionCounts[actionType] += value;
        
        switch(actionType) {
            case 'enemiesKilled':
                this.handleCombatExp(value);
                break;
            case 'damageDealt':
                this.handleCombatDamageExp(value);
                break;
            case 'damageTaken':
                this.handleVitalityExp(value);
                break;
            case 'tilesExplored':
                this.handleExplorationExp(value);
                break;
            case 'itemsCollected':
                this.handleFortuneExp(value);
                break;
            case 'goldCollected':
                this.handleGoldExp(value);
                break;
            case 'secretsFound':
                this.handleSecretExp(value);
                break;
        }
    }
    
    /**
     * Handle combat experience from killing enemies
     */
    handleCombatExp(value) {
        // High exp for kills + floor scaling
        const floor = window.game?.gameState?.floor || 1;
        const floorBonus = Math.floor(floor / 2); // +1 per 2 floors
        const comboBonus = Math.min(this.player.temporaryEffects.consecutiveKills * 3, 15); // Max +15
        const combatExp = 30 + floorBonus + comboBonus;
        
        this.skillSystem.gainSkillExp('combat', combatExp);
        this.player.temporaryEffects.consecutiveKills++;
    }
    
    /**
     * Handle combat experience from dealing damage
     */
    handleCombatDamageExp(value) {
        // Smaller but consistent exp from dealing damage
        const floor = window.game?.gameState?.floor || 1;
        let combatExp = Math.floor(value / 3); // 1 exp per 3 damage
        combatExp = Math.max(1, Math.min(combatExp, 8)); // Between 1-8 exp
        combatExp += Math.floor(floor / 8); // Small floor bonus
        
        this.skillSystem.gainSkillExp('combat', combatExp);
    }
    
    /**
     * Handle vitality experience from taking damage
     */
    handleVitalityExp(value) {
        // Significantly increased vitality exp + meaningful damage scaling
        const damagePercent = value / this.player.maxHp;
        let vitalityExp = 8; // Base exp
        
        // Bonus for taking significant damage
        if (damagePercent > 0.3) vitalityExp += 12; // +12 for >30% damage
        else if (damagePercent > 0.15) vitalityExp += 6; // +6 for >15% damage
        else if (damagePercent > 0.05) vitalityExp += 3; // +3 for >5% damage
        
        // Floor scaling
        const floor = window.game?.gameState?.floor || 1;
        vitalityExp += Math.floor(floor / 3); // +1 every 3 floors
        
        this.skillSystem.gainSkillExp('vitality', vitalityExp);
    }
    
    /**
     * Handle exploration experience from discovering tiles
     */
    handleExplorationExp(value) {
        // Drastically reduced exploration exp - only every 10th tile
        this.player.explorationCounter = (this.player.explorationCounter || 0) + 1;
        
        if (this.player.explorationCounter >= 10) {
            this.player.explorationCounter = 0;
            const floor = window.game?.gameState?.floor || 1;
            const explorationExp = 8 + Math.floor(floor / 4); // Base 8, +1 every 4 floors
            this.skillSystem.gainSkillExp('exploration', explorationExp);
        }
    }
    
    /**
     * Handle fortune experience from collecting items
     */
    handleFortuneExp(value) {
        // Increased fortune exp for items
        const floor = window.game?.gameState?.floor || 1;
        const fortuneExp = 12 + Math.floor(floor / 3); // Base 12, +1 every 3 floors
        this.skillSystem.gainSkillExp('fortune', fortuneExp);
    }
    
    /**
     * Handle fortune experience from collecting gold
     */
    handleGoldExp(value) {
        // Fortune exp scales better with gold amount
        this.player.actionCounts.goldCollected += value;
        const floor = window.game?.gameState?.floor || 1;
        
        let fortuneExp = Math.floor(value / 5); // 1 exp per 5 gold
        fortuneExp = Math.max(2, Math.min(fortuneExp, 20)); // Between 2-20 exp
        fortuneExp += Math.floor(floor / 5); // Floor bonus
        
        this.skillSystem.gainSkillExp('fortune', fortuneExp);
    }
    
    /**
     * Handle high-value experience for finding secrets
     */
    handleSecretExp(value) {
        // High exp for finding secrets
        this.skillSystem.gainSkillExp('exploration', 15);
        this.skillSystem.gainSkillExp('fortune', 10);
    }
}