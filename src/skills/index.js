/**
 * Skills System Index - Exports all skill-related classes
 * This file loads after all individual skill components
 */

// Make skill classes available globally for the game systems
window.SkillSystem = SkillSystem;
window.SkillActions = SkillActions;
window.SkillEffects = SkillEffects;
window.SkillUI = SkillUI;

// Initialize skill UI instance for global access
window.skillUI = new SkillUI();

// Initialize existing player's skill system if available
if (window.game && window.game.gameState && window.game.gameState.player) {
    const player = window.game.gameState.player;
    if (!player.skillSystem) {
        player.initializeSkillComponents();
    }
}

console.log('Skills system loaded successfully');