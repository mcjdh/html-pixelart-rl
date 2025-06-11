import { CONFIG } from './config.js';
import { GameState } from './gameState.js';
import { Renderer, ParticleSystem } from './renderer.js';
import { CombatSystem, UpgradeSystem } from './combat.js';
import { Enemy } from './entities.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.particles = new ParticleSystem(this.renderer);
        
        this.gameState = new GameState();
        this.combat = new CombatSystem(this.gameState);
        this.upgrades = new UpgradeSystem(this.gameState);
        
        this.autoExploreTarget = null;
        this.animationFrame = null;
        this.lastEnergyRegen = Date.now();
        
        this.inputEnabled = true;
        this.gameOver = false;
    }
    
    init() {
        this.gameState.init();
        this.setupEventListeners();
        this.startGameLoop();
        this.startEnergyRegeneration();
        this.updateUI();
        
        // Try to load saved game
        if (!this.gameState.loadGame()) {
            this.gameState.addMessage('Welcome to Pixel Roguelike!', 'level-msg');
            this.gameState.addMessage('Use arrow keys or WASD to move.', '');
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Prevent arrow key scrolling
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    handleInput(e) {
        if (!this.inputEnabled || this.gameOver) return;
        if (this.gameState.player.energy <= 0) return;
        
        let dx = 0, dy = 0;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                dy = -1;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                dy = 1;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                dx = -1;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                dx = 1;
                break;
            case 'z':
            case 'Z':
                this.toggleAutoExplore();
                return;
            case 'Escape':
                if (this.gameState.settings.autoExplore) {
                    this.toggleAutoExplore();
                }
                return;
            default:
                return;
        }
        
        e.preventDefault();
        this.movePlayer(dx, dy);
    }
    
    movePlayer(dx, dy) {
        const player = this.gameState.player;
        const newX = player.x + dx;
        const newY = player.y + dy;
        
        // Check bounds
        if (!this.gameState.inBounds(newX, newY)) return;
        
        // Check walls
        if (this.gameState.isWall(newX, newY)) return;
        
        // Check for enemy
        const enemy = this.gameState.getEnemyAt(newX, newY);
        if (enemy) {
            this.handleCombat(enemy);
            return;
        }
        
        // Move player
        if (player.useEnergy(CONFIG.BALANCE.MOVE_ENERGY_COST)) {
            player.moveTo(newX, newY);
            
            // Check for item pickup
            const item = this.gameState.getItemAt(newX, newY);
            if (item) {
                const result = item.apply(player);
                this.gameState.addMessage(result.message, result.type);
                
                if (item.type === 'gold') {
                    this.gameState.stats.goldCollected += item.value;
                }
                
                this.gameState.removeItem(item);
            }
            
            // Check for stairs
            if (newX === this.gameState.stairsX && newY === this.gameState.stairsY) {
                this.handleStairs();
            }
            
            // Process turn
            this.gameState.processTurn();
            this.processEnemyTurns();
        }
    }
    
    handleCombat(enemy) {
        if (!this.gameState.player.useEnergy(CONFIG.BALANCE.COMBAT_ENERGY_COST)) {
            return;
        }
        
        const result = this.combat.playerAttack(enemy);
        
        if (result.killed && this.gameState.settings.particlesEnabled) {
            this.particles.addExplosion(enemy.x, enemy.y, '#a44');
        }
        
        if (this.gameState.player.hp <= 0) {
            this.handleGameOver();
        }
    }
    
    handleStairs() {
        this.gameState.nextFloor();
        
        if (this.gameState.settings.particlesEnabled) {
            this.particles.addExplosion(
                this.gameState.player.x, 
                this.gameState.player.y, 
                '#44a'
            );
        }
    }
    
    handleGameOver() {
        this.gameOver = true;
        this.inputEnabled = false;
        
        setTimeout(() => {
            if (confirm('Game Over! Start a new game?')) {
                location.reload();
            }
        }, 1000);
    }
    
    processEnemyTurns() {
        for (const enemy of this.gameState.enemies) {
            if (enemy.canSeeEntity(this.gameState.player, this.gameState.fogOfWar)) {
                this.processEnemyMove(enemy);
            }
        }
    }
    
    processEnemyMove(enemy) {
        const player = this.gameState.player;
        const dist = enemy.distanceTo(player);
        
        // Attack if adjacent
        if (dist <= 1.5) {
            this.combat.enemyAttack(enemy, player);
            
            if (player.hp <= 0) {
                this.handleGameOver();
            }
            return;
        }
        
        // Move towards player
        const move = enemy.getMoveTowards(player.x, player.y);
        const newX = enemy.x + move.dx;
        const newY = enemy.y + move.dy;
        
        // Check if move is valid
        if (!this.gameState.isWall(newX, newY) && 
            !this.gameState.isOccupied(newX, newY)) {
            enemy.moveTo(newX, newY);
        }
    }
    
    toggleAutoExplore() {
        this.gameState.settings.autoExplore = !this.gameState.settings.autoExplore;
        document.getElementById('auto-explore-status').textContent = 
            this.gameState.settings.autoExplore ? 'ON' : 'OFF';
        
        if (this.gameState.settings.autoExplore) {
            this.autoExploreStep();
        }
    }
    
    autoExploreStep() {
        if (!this.gameState.settings.autoExplore || 
            this.gameState.player.energy <= 20 ||
            this.gameOver) {
            return;
        }
        
        const player = this.gameState.player;
        let targetX = -1, targetY = -1;
        let minDist = Infinity;
        
        // Priority 1: Visible items
        for (const item of this.gameState.items) {
            if (!this.gameState.fogOfWar[item.y][item.x]) {
                const dist = player.distanceTo(item);
                if (dist < minDist) {
                    minDist = dist;
                    targetX = item.x;
                    targetY = item.y;
                }
            }
        }
        
        // Priority 2: Unexplored areas
        if (targetX === -1) {
            for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
                for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                    if (!this.gameState.isWall(x, y) && 
                        this.gameState.fogOfWar[y][x]) {
                        const dist = Math.sqrt(
                            (x - player.x) ** 2 + 
                            (y - player.y) ** 2
                        );
                        if (dist < minDist) {
                            minDist = dist;
                            targetX = x;
                            targetY = y;
                        }
                    }
                }
            }
        }
        
        // Priority 3: Stairs
        if (targetX === -1) {
            targetX = this.gameState.stairsX;
            targetY = this.gameState.stairsY;
        }
        
        // Move towards target
        const dx = Math.sign(targetX - player.x);
        const dy = Math.sign(targetY - player.y);
        
        this.movePlayer(dx || 0, dy || 0);
        
        // Continue auto-exploring
        setTimeout(() => this.autoExploreStep(), CONFIG.GAME.AUTO_EXPLORE_DELAY);
    }
    
    startEnergyRegeneration() {
        setInterval(() => {
            const player = this.gameState.player;
            if (player.energy < player.maxEnergy) {
                player.restoreEnergy(CONFIG.GAME.ENERGY_REGEN_AMOUNT);
                this.updateUI();
            }
        }, CONFIG.GAME.ENERGY_REGEN_RATE);
    }
    
    render() {
        this.renderer.clear();
        this.renderer.renderMap(this.gameState.map, this.gameState.fogOfWar);
        this.renderer.renderStairs(
            this.gameState.stairsX, 
            this.gameState.stairsY, 
            this.gameState.fogOfWar
        );
        this.renderer.renderItems(this.gameState.items, this.gameState.fogOfWar);
        this.renderer.renderEnemies(this.gameState.enemies, this.gameState.fogOfWar);
        this.renderer.renderPlayer(this.gameState.player);
        
        // Update particles
        if (this.gameState.settings.particlesEnabled) {
            this.particles.update();
        }
    }
    
    updateUI() {
        const player = this.gameState.player;
        
        // Player stats
        document.getElementById('player-level').textContent = player.level;
        document.getElementById('player-hp').textContent = `${player.hp}/${player.maxHp}`;
        document.getElementById('hp-bar').style.width = `${(player.hp / player.maxHp) * 100}%`;
        document.getElementById('player-exp').textContent = `${player.exp}/${player.expToNext}`;
        document.getElementById('exp-bar').style.width = `${(player.exp / player.expToNext) * 100}%`;
        document.getElementById('player-energy').textContent = `${player.energy}/${player.maxEnergy}`;
        document.getElementById('energy-bar').style.width = `${(player.energy / player.maxEnergy) * 100}%`;
        document.getElementById('floor-level').textContent = this.gameState.floor;
        document.getElementById('player-gold').textContent = player.gold;
        
        // Upgrade costs
        const upgradeInfo = this.upgrades.getUpgradeInfo();
        document.getElementById('attack-cost').textContent = upgradeInfo.attack.cost;
        document.getElementById('defense-cost').textContent = upgradeInfo.defense.cost;
        document.getElementById('upgrade-attack').disabled = !upgradeInfo.attack.canAfford;
        document.getElementById('upgrade-defense').disabled = !upgradeInfo.defense.canAfford;
        
        // Update message log
        this.updateMessageLog();
    }
    
    updateMessageLog() {
        const log = document.getElementById('message-log');
        log.innerHTML = this.gameState.messages.map(m => 
            `<div class="message ${m.className}">${m.text}</div>`
        ).join('');
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.render();
            this.updateUI();
            this.animationFrame = requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
    
    // Public methods for UI buttons
    upgradeAttack() {
        this.upgrades.purchaseAttackUpgrade();
        this.updateUI();
    }
    
    upgradeDefense() {
        this.upgrades.purchaseDefenseUpgrade();
        this.updateUI();
    }
    
    saveGame() {
        this.gameState.saveGame();
    }
}