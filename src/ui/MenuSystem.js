// Main Menu and Campaign System
class MenuSystem {
    constructor(game) {
        this.game = game;
        this.currentMenu = 'main';
        this.selectedOption = 0;
        this.isVisible = true;
        
        this.createMenuElements();
        this.setupEventListeners();
        this.showMainMenu();
    }
    
    createMenuElements() {
        // Create main menu overlay
        this.menuOverlay = this.createElement('div', 'menu-overlay', {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            color: '#c0c0c0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '2000',
            fontFamily: 'monospace',
            fontSize: '14px',
            boxSizing: 'border-box'
        });
        
        // Create title
        this.titleElement = this.createElement('div', 'menu-title', {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#d4af37',
            marginBottom: '20px',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        });
        this.titleElement.textContent = 'THE CURSED DEPTHS';
        
        // Create subtitle
        this.subtitleElement = this.createElement('div', 'menu-subtitle', {
            fontSize: '12px',
            color: '#a0a0a0',
            marginBottom: '40px',
            textAlign: 'center',
            fontStyle: 'italic'
        });
        this.subtitleElement.textContent = 'A Tale of Three Depths';
        
        // Create menu container
        this.menuContainer = this.createElement('div', 'menu-container', {
            backgroundColor: 'rgba(16, 16, 16, 0.9)',
            border: '2px solid #404040',
            padding: '20px',
            borderRadius: '8px',
            minWidth: '300px',
            textAlign: 'center'
        });
        
        // Create menu options container
        this.optionsContainer = this.createElement('div', 'menu-options', {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        });
        
        // Create story text container
        this.storyContainer = this.createElement('div', 'story-container', {
            maxWidth: '500px',
            margin: '0 auto 30px auto',
            padding: '20px',
            backgroundColor: 'rgba(16, 16, 16, 0.9)',
            border: '2px solid #404040',
            borderRadius: '8px',
            lineHeight: '1.6',
            fontSize: '12px',
            display: 'none'
        });
        
        // Assemble menu
        this.menuOverlay.appendChild(this.titleElement);
        this.menuOverlay.appendChild(this.subtitleElement);
        this.menuOverlay.appendChild(this.storyContainer);
        this.menuContainer.appendChild(this.optionsContainer);
        this.menuOverlay.appendChild(this.menuContainer);
        
        // Add to game container
        const gameContainer = document.getElementById('game-container');
        gameContainer.appendChild(this.menuOverlay);
    }
    
    createElement(tag, className, styles) {
        const element = document.createElement(tag);
        element.className = className;
        Object.assign(element.style, styles);
        return element;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.navigateUp();
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.navigateDown();
                    e.preventDefault();
                    break;
                case 'Enter':
                case ' ':
                    this.selectOption();
                    e.preventDefault();
                    break;
                case 'Escape':
                    if (this.currentMenu !== 'main') {
                        this.showMainMenu();
                    }
                    e.preventDefault();
                    break;
            }
        });
    }
    
    showMainMenu() {
        this.currentMenu = 'main';
        this.selectedOption = 0;
        this.isVisible = true;
        this.menuOverlay.style.display = 'flex';
        this.storyContainer.style.display = 'none';
        
        const options = [
            { text: 'Begin Campaign', action: 'start_campaign' },
            { text: 'Continue (Load Save)', action: 'load_game' },
            { text: 'Story', action: 'show_story' },
            { text: 'Help', action: 'show_help' }
        ];
        
        this.renderOptions(options);
    }
    
    showStoryMenu() {
        this.currentMenu = 'story';
        this.selectedOption = 0;
        this.storyContainer.style.display = 'block';
        
        this.storyContainer.innerHTML = `
            <div style="color: #d4af37; font-weight: bold; margin-bottom: 15px;">THE LEGEND OF THE CURSED DEPTHS</div>
            
            <p>Long ago, the prosperous kingdom of Aethermoor discovered a vast dungeon beneath their capital. 
            What began as a source of wealth and magical artifacts soon became their doom.</p>
            
            <p>The dungeon's depths are cursed, growing more treacherous with each level. Brave adventurers 
            venture down seeking glory, but few return. Those who do speak of three distinct realms:</p>
            
            <div style="margin: 15px 0; padding: 10px; background: rgba(32, 32, 32, 0.8); border-left: 3px solid #666;">
                <strong style="color: #8fbc8f;">The Shallow Crypts</strong> - Ancient burial chambers where restless spirits guard forgotten treasures.
            </div>
            
            <div style="margin: 15px 0; padding: 10px; background: rgba(32, 32, 32, 0.8); border-left: 3px solid #666;">
                <strong style="color: #daa520;">The Bone Gardens</strong> - Deeper halls where skeletal warriors patrol cursed groves of bone trees.
            </div>
            
            <div style="margin: 15px 0; padding: 10px; background: rgba(32, 32, 32, 0.8); border-left: 3px solid #666;">
                <strong style="color: #b22222;">The Heart of Darkness</strong> - The deepest chamber where an ancient evil slumbers, waiting...
            </div>
            
            <p style="color: #ff6666; margin-top: 20px;">You are the kingdom's last hope. Armed with courage and steel, 
            you must descend into the cursed depths and end the threat that grows stronger each day.</p>
            
            <p style="text-align: center; margin-top: 20px; font-style: italic; color: #a0a0a0;">
                Will you emerge victorious, or become another lost soul in the darkness?
            </p>
        `;
        
        const options = [
            { text: 'Begin Your Quest', action: 'start_campaign' },
            { text: 'Back to Main Menu', action: 'main_menu' }
        ];
        
        this.renderOptions(options);
    }
    
    showHelpMenu() {
        this.currentMenu = 'help';
        this.selectedOption = 0;
        this.storyContainer.style.display = 'block';
        
        this.storyContainer.innerHTML = `
            <div style="color: #d4af37; font-weight: bold; margin-bottom: 15px;">HOW TO PLAY</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left;">
                <div>
                    <strong style="color: #8fbc8f;">Movement</strong><br>
                    ↑↓←→ or WASD<br>
                    Move your character<br><br>
                    
                    <strong style="color: #8fbc8f;">Combat</strong><br>
                    Move into enemies to attack<br>
                    Position matters!<br>
                    • Backstab: +50% damage<br>
                    • Flanking: +25% damage<br><br>
                    
                    <strong style="color: #8fbc8f;">Items</strong><br>
                    Walk over items to collect<br>
                    Gold automatically upgrades you
                </div>
                
                <div>
                    <strong style="color: #daa520;">Controls</strong><br>
                    Z - Toggle Auto-Explore<br>
                    L - View Collected Lore<br>
                    H - Show Help<br>
                    ESC - Stop Auto-Explore<br><br>
                    
                    <strong style="color: #daa520;">Goal</strong><br>
                    Complete all 3 floors<br>
                    Find stairs to descend<br>
                    Defeat the final boss<br>
                    Survive and grow stronger!<br><br>
                    
                    <strong style="color: #daa520;">Strategy</strong><br>
                    Use positioning in combat<br>
                    Manage your energy<br>
                    Collect lore for the story
                </div>
            </div>
        `;
        
        const options = [
            { text: 'Start Playing', action: 'start_campaign' },
            { text: 'Back to Main Menu', action: 'main_menu' }
        ];
        
        this.renderOptions(options);
    }
    
    updateOptionStyles() {
        const optionElements = this.optionsContainer.querySelectorAll('.menu-option');
        optionElements.forEach((element, index) => {
            const isSelected = index === this.selectedOption;
            element.style.backgroundColor = isSelected ? '#444' : 'transparent';
            element.style.color = isSelected ? '#fff' : '#c0c0c0';
            element.style.border = isSelected ? '1px solid #666' : '1px solid transparent';
        });
    }
    
    renderOptions(options) {
        this.optionsContainer.innerHTML = '';
        this.options = options;
        
        options.forEach((option, index) => {
            const optionElement = this.createElement('div', 'menu-option', {
                padding: '12px 20px',
                cursor: 'pointer',
                backgroundColor: index === this.selectedOption ? '#444' : 'transparent',
                color: index === this.selectedOption ? '#fff' : '#c0c0c0',
                border: index === this.selectedOption ? '1px solid #666' : '1px solid transparent',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
            });
            
            optionElement.textContent = option.text;
            
            // Add click/tap support
            optionElement.addEventListener('click', () => {
                this.selectedOption = index;
                this.selectOption();
            });
            
            // Add hover effects (update selection without re-rendering)
            optionElement.addEventListener('mouseenter', () => {
                if (this.selectedOption !== index) {
                    this.selectedOption = index;
                    this.updateOptionStyles();
                }
            });
            
            // Add touch support for mobile
            optionElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.selectedOption !== index) {
                    this.selectedOption = index;
                    this.updateOptionStyles();
                }
            });
            
            optionElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.selectOption();
            });
            
            this.optionsContainer.appendChild(optionElement);
        });
    }
    
    navigateUp() {
        this.selectedOption = Math.max(0, this.selectedOption - 1);
        this.updateOptionStyles();
    }
    
    navigateDown() {
        this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
        this.updateOptionStyles();
    }
    
    selectOption() {
        const selectedAction = this.options[this.selectedOption].action;
        
        switch (selectedAction) {
            case 'start_campaign':
                this.startCampaign();
                break;
            case 'load_game':
                this.loadGame();
                break;
            case 'show_story':
                this.showStoryMenu();
                break;
            case 'show_help':
                this.showHelpMenu();
                break;
            case 'main_menu':
                this.showMainMenu();
                break;
        }
    }
    
    startCampaign() {
        this.hide();
        
        // Reset game state for new campaign
        this.game.gameState.floor = 1;
        this.game.gameState.campaignMode = true;
        this.game.gameState.campaignProgress = {
            floorsCompleted: 0,
            bossesDefeated: 0,
            loreCollected: 0,
            startTime: Date.now()
        };
        
        // Initialize game state
        this.game.initGameState();
        
        // Trigger opening cutscene through new cutscene manager
        this.game.events.emit('campaign.started', {
            player: this.game.gameState.player,
            startTime: Date.now()
        });
    }
    
    loadGame() {
        // First initialize the game so we have a proper state to load into
        this.game.initGameState();
        
        if (this.game.gameState.loadGame()) {
            this.hide();
            this.game.updateUI();
            this.game.gameState.addMessage('Game loaded successfully!', 'level-msg');
        } else {
            // Show error - no save found
            this.game.gameState.addMessage('No saved game found.', 'damage-msg');
        }
    }
    
    
    hide() {
        this.isVisible = false;
        this.menuOverlay.style.display = 'none';
    }
    
    show() {
        this.isVisible = true;
        this.menuOverlay.style.display = 'flex';
    }
    
    isMenuVisible() {
        return this.isVisible;
    }
}