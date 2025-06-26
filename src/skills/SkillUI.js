/**
 * Skill UI Management - Handles compact skill display and synergy visualization
 */
class SkillUI {
    constructor() {
        this.skills = ['combat', 'vitality', 'exploration', 'fortune'];
    }
    
    /**
     * Update the complete skill UI with compact layout
     */
    updateSkillUI(player) {
        if (!player || !player.skills) {
            if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
                console.warn('SkillUI: No player or skills data available');
            }
            return;
        }
        
        this.skills.forEach(skillName => {
            try {
                this.updateSkillDisplay(skillName, player);
            } catch (error) {
                console.error(`SkillUI: Error updating ${skillName}:`, error);
            }
        });
        
        this.updateSynergyUI(player);
    }
    
    /**
     * Update individual skill display
     */
    updateSkillDisplay(skillName, player) {
        const skill = player.skills[skillName];
        if (!skill) {
            if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
                console.warn(`SkillUI: No skill data for ${skillName}`);
            }
            return;
        }
        
        // Calculate experience needed for next level
        let expPercent = 0;
        if (skill.level >= CONFIG.BALANCE.SKILL_SYSTEM.SKILL_CAP) {
            expPercent = 100;
        } else if (player.skillSystem) {
            const expNeeded = player.skillSystem.getExpNeededForLevel(skill.level + 1);
            expPercent = (skill.exp / expNeeded) * 100;
        } else {
            // Fallback calculation if skillSystem not available
            const expNeeded = Math.floor(CONFIG.BALANCE.SKILL_SYSTEM.BASE_EXP_MULTIPLIER * 
                                       Math.pow(skill.level, 1.5));
            expPercent = (skill.exp / expNeeded) * 100;
        }
        
        // Ensure valid percentage
        expPercent = Math.max(0, Math.min(100, expPercent));
        
        // Update level display with color coding
        this.updateLevelDisplay(skillName, skill.level);
        
        // Update progress bar
        this.updateProgressBar(skillName, expPercent);
        
        // Update milestone display
        this.updateMilestoneDisplay(skillName, skill.level);
    }
    
    /**
     * Update level display with color coding based on level ranges
     */
    updateLevelDisplay(skillName, level) {
        const levelElement = document.getElementById(`${skillName}-level`);
        if (!levelElement) return;
        
        levelElement.textContent = level;
        
        // Color code based on level milestones
        if (level >= 50) {
            levelElement.style.background = 'linear-gradient(135deg, #ffd700, #ffaa00)';
            levelElement.style.color = '#000';
        } else if (level >= 25) {
            levelElement.style.background = 'linear-gradient(135deg, #9932cc, #663399)';
            levelElement.style.color = '#fff';
        } else if (level >= 10) {
            levelElement.style.background = 'linear-gradient(135deg, #4169e1, #1e3a8a)';
            levelElement.style.color = '#fff';
        } else if (level >= 5) {
            levelElement.style.background = 'linear-gradient(135deg, #228b22, #006400)';
            levelElement.style.color = '#fff';
        } else {
            levelElement.style.background = 'rgba(255, 255, 255, 0.15)';
            levelElement.style.color = '#ffffff';
        }
    }
    
    /**
     * Update progress bar with glow effects
     */
    updateProgressBar(skillName, expPercent) {
        // Handle the exploration skill bar ID conflict
        const elementId = skillName === 'exploration' ? 'exploration-skill-bar' : `${skillName}-bar`;
        const barElement = document.getElementById(elementId);
        
        if (!barElement) {
            if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS) {
                console.warn(`SkillUI: Could not find progress bar element: ${elementId}`);
            }
            return;
        }
        
        barElement.style.width = `${expPercent}%`;
        
        // Debug info for testing
        if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS && Math.random() < 0.01) { // 1% chance to avoid spam
            console.log(`SkillUI: Updated ${skillName} bar to ${expPercent.toFixed(1)}%`);
        }
        
        // Add glow effect when close to leveling
        if (expPercent > 80) {
            barElement.style.boxShadow = '0 0 4px rgba(255, 255, 255, 0.6)';
        } else {
            barElement.style.boxShadow = 'none';
        }
    }
    
    /**
     * Update milestone display with next milestone info
     */
    updateMilestoneDisplay(skillName, level) {
        const milestoneElement = document.getElementById(`${skillName}-milestone`);
        if (!milestoneElement) return;
        
        const nextMilestone = this.getNextMilestone(skillName, level);
        if (nextMilestone) {
            const distance = nextMilestone.level - level;
            milestoneElement.textContent = `${nextMilestone.icon} ${distance} to ${nextMilestone.name}`;
            milestoneElement.className = 'skill-milestone';
        } else if (level >= 50) {
            milestoneElement.textContent = '🌟 MASTERED';
            milestoneElement.className = 'skill-milestone unlocked';
        } else {
            milestoneElement.textContent = '';
        }
    }
    
    /**
     * Get next milestone information for display
     */
    getNextMilestone(skillName, currentLevel) {
        const milestones = CONFIG.BALANCE.SKILL_SYSTEM.MILESTONE_LEVELS;
        const nextLevel = milestones.find(level => level > currentLevel);
        
        if (!nextLevel) return null;
        
        const config = CONFIG.BALANCE.SKILL_SYSTEM[skillName.toUpperCase()];
        if (!config || !config[nextLevel]) return null;
        
        const milestone = config[nextLevel];
        return {
            level: nextLevel,
            name: milestone.name.split(' ').slice(-1)[0], // Just the last word for space
            icon: this.getMilestoneIcon(milestone.type)
        };
    }
    
    /**
     * Get appropriate icon for milestone type
     */
    getMilestoneIcon(type) {
        switch(type) {
            case 'ability': return '⚡';
            case 'passive': return '🛡️';
            case 'ultimate': return '🌟';
            default: return '✨';
        }
    }
    
    /**
     * Update synergy displays with animation
     */
    updateSynergyUI(player) {
        const synergies = CONFIG.BALANCE.SKILL_SYSTEM.SYNERGIES;
        
        // Warrior Synergy (Combat + Vitality)
        const warriorElement = document.getElementById('warrior-synergy');
        if (warriorElement) {
            const hasWarrior = player.skills.combat.level >= synergies.WARRIOR_THRESHOLD && 
                             player.skills.vitality.level >= synergies.WARRIOR_THRESHOLD;
            this.toggleSynergyDisplay(warriorElement, hasWarrior);
        }
        
        // Adventurer Synergy (Exploration + Fortune)
        const adventurerElement = document.getElementById('adventurer-synergy');
        if (adventurerElement) {
            const hasAdventurer = player.skills.exploration.level >= synergies.ADVENTURER_THRESHOLD && 
                                player.skills.fortune.level >= synergies.ADVENTURER_THRESHOLD;
            this.toggleSynergyDisplay(adventurerElement, hasAdventurer);
        }
        
        // Master Synergy (All skills high level)
        const masterElement = document.getElementById('master-synergy');
        if (masterElement) {
            const hasMaster = player.skills.combat.level >= synergies.MASTER_THRESHOLD && 
                            player.skills.vitality.level >= synergies.MASTER_THRESHOLD &&
                            player.skills.exploration.level >= synergies.MASTER_THRESHOLD &&
                            player.skills.fortune.level >= synergies.MASTER_THRESHOLD;
            this.toggleSynergyDisplay(masterElement, hasMaster);
        }
    }
    
    /**
     * Toggle synergy display with animation
     */
    toggleSynergyDisplay(element, shouldShow) {
        const isCurrentlyShown = element.style.display === 'flex';
        
        if (shouldShow && !isCurrentlyShown) {
            element.style.display = 'flex';
            element.style.animation = 'milestone-unlock 0.8s ease';
        } else if (!shouldShow && isCurrentlyShown) {
            element.style.display = 'none';
        }
    }
    
    /**
     * Trigger milestone unlock animation
     */
    triggerMilestoneAnimation(skillName) {
        const milestoneElement = document.getElementById(`${skillName}-milestone`);
        if (milestoneElement) {
            milestoneElement.classList.add('just-unlocked');
            setTimeout(() => {
                milestoneElement.classList.remove('just-unlocked');
            }, 800);
        }
    }
}