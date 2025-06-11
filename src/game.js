class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.particles = new ParticleSystem(this.renderer);
        
        this.gameState = new GameState();
        this.combat = new CombatSystem(this.gameState);
        this.upgrades = new UpgradeSystem(this.gameState);
        this.modal = new ModalManager();
        
        this.autoExploreTarget = null;
        this.animationFrame = null;
        this.lastEnergyRegen = Date.now();
        
        this.inputEnabled = true;
        this.gameOver = false;
        this.lastInputTime = 0;
        this.inputThrottle = 50; // 50ms between inputs
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
        // Check if modal is open and handle modal input
        if (this.modal.isShowing()) {
            if (e.key === 'Escape') {
                this.modal.hide();
            }
            return;
        }
        
        if (!this.inputEnabled || this.gameOver) return;
        if (this.gameState.player.energy <= 0) return;
        
        // Throttle input to prevent spam
        const now = Date.now();
        if (now - this.lastInputTime < this.inputThrottle) return;
        this.lastInputTime = now;
        
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
            case 'h':
            case 'H':
            case '?':
                this.showHelpModal();
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
            this.modal.show({
                title: 'GAME OVER',
                message: `You have fallen on floor ${this.gameState.floor}!\n\nYour final stats:\nLevel: ${this.gameState.player.level}\nGold: ${this.gameState.player.gold}\nEnemies Killed: ${this.gameState.stats.enemiesKilled}`,
                buttons: [
                    {
                        text: 'New Game',
                        primary: true,
                        callback: () => {
                            location.reload();
                        }
                    },
                    {
                        text: 'View Stats',
                        callback: () => {
                            this.showStatsModal();
                        }
                    }
                ]
            });
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
        let target = this.findAutoExploreTarget(player);
        
        if (target) {
            // Use A* pathfinding for smart movement
            const path = this.findPath(player.x, player.y, target.x, target.y);
            if (path && path.length > 1) {
                const nextStep = path[1];
                const dx = nextStep.x - player.x;
                const dy = nextStep.y - player.y;
                this.movePlayer(dx, dy);
            } else {
                // Fallback to direct movement
                const dx = Math.sign(target.x - player.x);
                const dy = Math.sign(target.y - player.y);
                this.movePlayer(dx || 0, dy || 0);
            }
        }
        
        // Continue auto-exploring
        setTimeout(() => this.autoExploreStep(), CONFIG.GAME.AUTO_EXPLORE_DELAY);
    }
    
    findAutoExploreTarget(player) {
        // Priority 1: Visible items (cached check)
        if (!this.cachedVisibleItems || this.lastVisibleItemsCheck !== this.gameState.turn) {
            this.cachedVisibleItems = this.gameState.items.filter(item => 
                !this.gameState.fogOfWar[item.y][item.x]
            );
            this.lastVisibleItemsCheck = this.gameState.turn;
        }
        
        if (this.cachedVisibleItems.length > 0) {
            return this.cachedVisibleItems.reduce((closest, item) => {
                const dist = player.distanceTo(item);
                return dist < player.distanceTo(closest) ? item : closest;
            });
        }
        
        // Priority 2: Closest unexplored area (spiral search)
        const unexplored = this.findClosestUnexplored(player.x, player.y);
        if (unexplored) return unexplored;
        
        // Priority 3: Stairs
        return { x: this.gameState.stairsX, y: this.gameState.stairsY };
    }
    
    findClosestUnexplored(startX, startY) {
        const maxRadius = Math.max(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
        
        for (let radius = 1; radius <= maxRadius; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const x = startX + dx;
                        const y = startY + dy;
                        
                        if (this.gameState.inBounds(x, y) && 
                            !this.gameState.isWall(x, y) && 
                            this.gameState.fogOfWar[y][x]) {
                            return { x, y };
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    // Simple A* pathfinding
    findPath(startX, startY, targetX, targetY) {
        const openSet = [{ x: startX, y: startY, g: 0, h: this.heuristic(startX, startY, targetX, targetY), f: 0, parent: null }];
        const closedSet = new Set();
        
        while (openSet.length > 0) {
            // Find lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            
            if (current.x === targetX && current.y === targetY) {
                // Reconstruct path
                const path = [];
                let node = current;
                while (node) {
                    path.unshift({ x: node.x, y: node.y });
                    node = node.parent;
                }
                return path;
            }
            
            closedSet.add(`${current.x},${current.y}`);
            
            // Check neighbors
            for (const [dx, dy] of [[-1,0], [1,0], [0,-1], [0,1]]) {
                const nx = current.x + dx;
                const ny = current.y + dy;
                
                if (!this.gameState.inBounds(nx, ny) || 
                    this.gameState.isWall(nx, ny) ||
                    closedSet.has(`${nx},${ny}`)) {
                    continue;
                }
                
                const g = current.g + 1;
                const h = this.heuristic(nx, ny, targetX, targetY);
                const f = g + h;
                
                const existing = openSet.find(n => n.x === nx && n.y === ny);
                if (!existing || g < existing.g) {
                    const neighbor = { x: nx, y: ny, g, h, f, parent: current };
                    if (existing) {
                        Object.assign(existing, neighbor);
                    } else {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        return null; // No path found
    }
    
    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
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
        this.renderer.renderMap(this.gameState.map, this.gameState.fogOfWar, this.gameState.explored);
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
        
        // Side panel stats
        document.getElementById('player-level').textContent = player.level;
        document.getElementById('player-hp').textContent = `${player.hp}/${player.maxHp}`;
        document.getElementById('player-exp').textContent = `${player.exp}/${player.expToNext}`;
        document.getElementById('player-energy').textContent = `${player.energy}/${player.maxEnergy}`;
        document.getElementById('floor-level').textContent = this.gameState.floor;
        document.getElementById('player-gold').textContent = player.gold;
        
        // Status bar (duplicate for classic feel)
        document.getElementById('status-hp').textContent = `${player.hp}/${player.maxHp}`;
        document.getElementById('status-exp').textContent = `${player.exp}/${player.expToNext}`;
        document.getElementById('status-energy').textContent = `${player.energy}/${player.maxEnergy}`;
        document.getElementById('status-floor').textContent = this.gameState.floor;
        document.getElementById('status-gold').textContent = player.gold;
        
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
        this.modal.show({
            title: 'GAME SAVED',
            message: 'Your progress has been saved successfully!',
            buttons: [
                {
                    text: 'Continue',
                    primary: true,
                    callback: () => {
                        this.modal.hide();
                    }
                }
            ]
        });
    }
    
    showStatsModal() {
        const stats = this.gameState.stats;
        const player = this.gameState.player;
        this.modal.show({
            title: 'FINAL STATISTICS',
            message: `Level: ${player.level}\nHP: ${player.hp}/${player.maxHp}\nAttack: ${player.attack}\nDefense: ${player.defense}\nGold: ${player.gold}\n\nFloors Completed: ${stats.floorsCompleted}\nEnemies Killed: ${stats.enemiesKilled}\nGold Collected: ${stats.goldCollected}\nDamage Dealt: ${stats.totalDamageDealt}\nDamage Taken: ${stats.totalDamageTaken}`,
            buttons: [
                {
                    text: 'New Game',
                    primary: true,
                    callback: () => {
                        location.reload();
                    }
                },
                {
                    text: 'Close',
                    callback: () => {
                        this.modal.hide();
                    }
                }
            ]
        });
    }
    
    showHelpModal() {
        this.modal.show({
            title: 'PIXEL ROGUELIKE - HELP',
            message: `MOVEMENT:\n↑↓←→ or WASD - Move character\n\nCOMBAT:\nMove into enemies to attack\nEnemies attack when adjacent\n\nGAME:\nZ - Toggle Auto-Explore\nESC - Stop Auto-Explore\nH or ? - Show this help\n\nGOAL:\nFind stairs to descend deeper\nDefeat enemies for XP and gold\nUpgrade your character\nSurvive as long as possible!`,
            buttons: [
                {
                    text: 'Got it!',
                    primary: true,
                    callback: () => {
                        this.modal.hide();
                    }
                }
            ]
        });
    }
}

class ModalManager {
    constructor() {
        this.overlay = document.getElementById('modal-overlay');
        this.window = document.getElementById('modal-window');
        this.header = document.getElementById('modal-header');
        this.body = document.getElementById('modal-body');
        this.buttons = document.getElementById('modal-buttons');
        this.isVisible = false;
    }
    
    show(config) {
        this.header.textContent = config.title || '';
        // Handle line breaks in message
        if (config.message) {
            this.body.innerHTML = config.message.replace(/\n/g, '<br>');
        } else {
            this.body.textContent = '';
        }
        
        // Clear previous buttons
        this.buttons.innerHTML = '';
        
        // Add new buttons
        if (config.buttons) {
            config.buttons.forEach(buttonConfig => {
                const button = document.createElement('button');
                button.className = `modal-button ${buttonConfig.primary ? 'primary' : ''}`;
                button.textContent = buttonConfig.text;
                button.onclick = () => {
                    if (buttonConfig.callback) {
                        buttonConfig.callback();
                    }
                };
                this.buttons.appendChild(button);
            });
        }
        
        // Show modal
        this.overlay.style.display = 'flex';
        this.isVisible = true;
        
        // Focus first button for keyboard accessibility
        const firstButton = this.buttons.querySelector('.modal-button');
        if (firstButton) {
            firstButton.focus();
        }
    }
    
    hide() {
        this.overlay.style.display = 'none';
        this.isVisible = false;
    }
    
    isShowing() {
        return this.isVisible;
    }
}