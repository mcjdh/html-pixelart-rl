/**
 * GameLoop - Handles the main rendering loop and UI updates
 * Manages animation frames, rendering, debug info, and UI synchronization
 */
window.GameLoop = {
    /**
     * Initialize game loop related properties
     */
    initGameLoopProperties(gameInstance) {
        gameInstance.debugInfo = {
            fps: 0,
            frameTime: 0,
            lastFrameTime: performance.now(),
            frameCount: 0
        };
    },

    /**
     * Start the main game loop
     */
    startGameLoop(gameInstance) {
        const gameLoop = () => {
            this.render(gameInstance);
            this.updateUI(gameInstance);
            gameInstance.animationFrame = requestAnimationFrame(gameLoop);
        };
        gameLoop();
    },

    /**
     * Main render method - handles all game rendering
     */
    render(gameInstance) {
        // Only render if game state is initialized
        if (!gameInstance.gameState.map || !gameInstance.gameState.fogOfWar || !gameInstance.gameState.explored) {
            return;
        }
        
        // Update animations
        const currentTime = Date.now();
        const hasAnimations = gameInstance.gameState.updateAnimations(currentTime);
        
        // Update camera to follow player (use render position for smooth following)
        if (gameInstance.gameState.player) {
            const player = gameInstance.gameState.player;
            const camX = player.renderX !== undefined ? player.renderX : player.x;
            const camY = player.renderY !== undefined ? player.renderY : player.y;
            gameInstance.renderer.updateCamera(camX, camY);
        }
        
        // Performance optimization: Check if we need full clear
        const needsFullClear = gameInstance.renderer.dirtyRegions.size > CONFIG.VIEWPORT_WIDTH * CONFIG.VIEWPORT_HEIGHT * CONFIG.RENDERING.DIRTY_RECT_THRESHOLD ||
                              (gameInstance.gameState.hasFogChanged && gameInstance.gameState.hasFogChanged()) ||
                              !gameInstance.renderer.hasRenderedOnce;
        
        if (needsFullClear) {
            gameInstance.renderer.clear();
        } else {
            gameInstance.renderer.clearDirtyRegions();
        }
        
        // Apply screen shake effect (check if method exists first)
        let shake = { x: 0, y: 0 };
        if (gameInstance.renderer.applyScreenShake) {
            shake = gameInstance.renderer.applyScreenShake();
        }
        
        gameInstance.renderer.renderMap(gameInstance.gameState.map, gameInstance.gameState.fogOfWar, gameInstance.gameState.explored);
        gameInstance.renderer.renderStairs(
            gameInstance.gameState.stairsX, 
            gameInstance.gameState.stairsY, 
            gameInstance.gameState.fogOfWar
        );
        gameInstance.renderer.renderItems(gameInstance.gameState.items, gameInstance.gameState.fogOfWar);
        gameInstance.renderer.renderEnemies(gameInstance.gameState.enemies, gameInstance.gameState.fogOfWar);
        
        if (gameInstance.gameState.player) {
            gameInstance.renderer.renderPlayer(gameInstance.gameState.player);
        }
        
        // Reset screen shake transform (check if method exists first)
        if (gameInstance.renderer.resetScreenShake) {
            gameInstance.renderer.resetScreenShake(shake);
        }
        
        // Update particles
        if (gameInstance.gameState.settings.particlesEnabled) {
            gameInstance.particles.update();
        }
        
        // Debug rendering
        if (gameInstance.debug && gameInstance.gameState.enemies) {
            this.renderDebugInfo(gameInstance);
        }
    },

    /**
     * Render debug information overlay
     */
    renderDebugInfo(gameInstance) {
        const ctx = gameInstance.renderer.ctx;
        
        // Update FPS counter
        const now = performance.now();
        gameInstance.debugInfo.frameTime = now - gameInstance.debugInfo.lastFrameTime;
        gameInstance.debugInfo.lastFrameTime = now;
        gameInstance.debugInfo.frameCount++;
        
        if (gameInstance.debugInfo.frameCount % 30 === 0) {
            gameInstance.debugInfo.fps = Math.round(1000 / gameInstance.debugInfo.frameTime);
        }
        
        // Draw enemy vision ranges (configurable)
        if (CONFIG.DEBUG.SHOW_ENEMY_VISION) {
            ctx.globalAlpha = 0.08;
            ctx.strokeStyle = '#f44';
            ctx.lineWidth = 1;
            
            // Only show vision for up to 3 closest visible enemies to improve performance
            const visibleEnemies = gameInstance.gameState.enemies
                .filter(enemy => !gameInstance.gameState.fogOfWar[enemy.y][enemy.x] && 
                               enemy.distanceTo(gameInstance.gameState.player) <= 6)
                .sort((a, b) => a.distanceTo(gameInstance.gameState.player) - b.distanceTo(gameInstance.gameState.player))
                .slice(0, 3);
                
            for (const enemy of visibleEnemies) {
                const centerX = (enemy.x - gameInstance.renderer.cameraX) * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
                const centerY = (enemy.y - gameInstance.renderer.cameraY) * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, enemy.viewRange * CONFIG.CELL_SIZE, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Draw pathfinding target (configurable) - for auto-system
        if (CONFIG.DEBUG.SHOW_PATHFINDING && gameInstance.autoSystem && gameInstance.autoSystem.getSystemStatus().explorerManager.enabled) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#0f0';
            ctx.fillRect(
                (gameInstance.gameState.stairsX - gameInstance.renderer.cameraX) * CONFIG.CELL_SIZE,
                (gameInstance.gameState.stairsY - gameInstance.renderer.cameraY) * CONFIG.CELL_SIZE,
                CONFIG.CELL_SIZE,
                CONFIG.CELL_SIZE
            );
        }
        
        ctx.globalAlpha = 1;
        
        // Draw debug text
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(`FPS: ${gameInstance.debugInfo.fps}`, 5, 15);
        ctx.fillText(`Turn: ${gameInstance.gameState.turn || 0}`, 5, 25);
        
        // Additional debug info
        if (gameInstance.gameState.player) {
            ctx.fillText(`Energy: ${gameInstance.gameState.player.energy}/${gameInstance.gameState.player.maxEnergy}`, 5, 35);
            ctx.fillText(`HP: ${gameInstance.gameState.player.hp}/${gameInstance.gameState.player.maxHp}`, 5, 45);
            ctx.fillText(`Pos: ${gameInstance.gameState.player.x}, ${gameInstance.gameState.player.y}`, 5, 55);
        }
        
        if (gameInstance.autoSystem) {
            const status = gameInstance.autoSystem.getSystemStatus();
            if (status.explorerManager.enabled) {
                ctx.fillText(`Auto: ${status.explorerManager.mode}`, 5, 65);
            }
        }
    },

    /**
     * Update UI elements with current game state
     */
    updateUI(gameInstance) {
        const player = gameInstance.gameState.player;
        
        // Don't update UI if player doesn't exist yet
        if (!player) {
            return;
        }
        
        // Side panel stats (ensure integers for clean display)
        document.getElementById('player-level').textContent = Math.floor(player.level);
        document.getElementById('player-hp').textContent = `${Math.floor(player.hp)}/${Math.floor(player.maxHp)}`;
        document.getElementById('player-exp').textContent = `${Math.floor(player.exp)}/${Math.floor(player.expToNext)}`;
        document.getElementById('player-energy').textContent = `${Math.floor(player.energy)}/${Math.floor(player.maxEnergy)}`;
        document.getElementById('floor-level').textContent = gameInstance.gameState.floor;
        document.getElementById('player-gold').textContent = Math.floor(player.gold);
        
        // Update progress bars
        const healthBar = document.getElementById('health-bar');
        const energyBar = document.getElementById('energy-bar');
        const expBar = document.getElementById('exp-bar');
        
        if (healthBar) {
            const healthPercent = (player.hp / player.maxHp) * 100;
            healthBar.style.width = `${healthPercent}%`;
            
            // Add warning class for low health
            if (healthPercent <= 25) {
                healthBar.classList.add('low');
            } else {
                healthBar.classList.remove('low');
            }
        }
        
        if (energyBar) {
            const energyPercent = (player.energy / player.maxEnergy) * 100;
            energyBar.style.width = `${energyPercent}%`;
            
            // Add warning class for low energy
            if (energyPercent <= 15) {
                energyBar.classList.add('low');
            } else {
                energyBar.classList.remove('low');
            }
        }
        
        if (expBar) {
            const expPercent = (player.exp / player.expToNext) * 100;
            expBar.style.width = `${expPercent}%`;
        }
        
        // Update skill UI using dedicated SkillUI system
        if (player.skills && window.skillUI) {
            window.skillUI.updateSkillUI(player);
        } else if (CONFIG.DEBUG.ENABLE_CONSOLE_COMMANDS && player) {
            // Debug info - only show occasionally to avoid spam
            if (!this.skillUIDebugShown || Date.now() - this.skillUIDebugShown > 5000) {
                console.log('GameLoop Debug: player.skills:', !!player.skills, 'window.skillUI:', !!window.skillUI);
                this.skillUIDebugShown = Date.now();
            }
        }
        
        // Update attack and defense display
        const attackElement = document.getElementById('player-attack');
        const defenseElement = document.getElementById('player-defense');
        
        if (attackElement) attackElement.textContent = Math.floor(player.attack);
        if (defenseElement) defenseElement.textContent = Math.floor(player.defense);
        
        // Update message log display
        this.updateMessageLog(gameInstance);
    },

    /**
     * Update the message log display
     */
    updateMessageLog(gameInstance) {
        const messageConsole = document.getElementById('message-console');
        if (messageConsole && gameInstance.gameState.messages) {
            // Limit to last 10 messages for performance
            const recentMessages = gameInstance.gameState.messages.slice(0, 10);
            
            messageConsole.innerHTML = recentMessages
                .map(msg => `<div class="${msg.className || ''}">${msg.text}</div>`)
                .join('');
            
            // Auto-scroll to bottom only if user hasn't scrolled up
            if (messageConsole.scrollTop >= messageConsole.scrollHeight - messageConsole.clientHeight - 10) {
                messageConsole.scrollTop = messageConsole.scrollHeight;
            }
        }
    }
};

/**
 * Mixin to add game loop methods to Game class
 */
window.GameLoopMixin = {
    startGameLoop() {
        return window.GameLoop.startGameLoop(this);
    },

    render() {
        return window.GameLoop.render(this);
    },

    renderDebugInfo() {
        return window.GameLoop.renderDebugInfo(this);
    },

    updateUI() {
        return window.GameLoop.updateUI(this);
    },

    updateMessageLog() {
        return window.GameLoop.updateMessageLog(this);
    }
};