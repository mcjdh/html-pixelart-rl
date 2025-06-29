// Narrative UI System for 640x480 classic RPG interface
class NarrativeUI {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.narrativeQueue = [];
        this.currentNarrative = null;
        this.isDisplaying = false;
        this.typewriterSpeed = 30; // ms per character
        this.displayDuration = 4000; // ms to show completed message
        
        this.setupEventListeners();
        this.createNarrativeElements();
    }
    
    setupEventListeners() {
        // Listen for narrative events
        this.eventBus.on('narrative.triggered', (eventData) => {
            this.queueNarrative(eventData.data);
        });
        
        // Listen for regular game messages to route to console
        this.eventBus.on('message.added', (eventData) => {
            this.addToMessageConsole(eventData.data.text, eventData.data.className);
        });
        
        // Listen for lore discoveries
        this.eventBus.on('lore.discovered', (eventData) => {
            this.showLoreDiscovery(eventData.data);
        });
        
        // Note: Death and floor completion are now handled by CutsceneManager
        // to avoid duplication
    }
    
    createNarrativeElements() {
        // Create narrative overlay for dramatic moments
        this.narrativeOverlay = this.createElement('div', 'narrative-overlay', {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#c0c0c0',
            display: 'none',
            zIndex: '1000',
            fontFamily: 'monospace',
            fontSize: '14px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            boxSizing: 'border-box'
        });
        
        // Create narrative text container
        this.narrativeText = this.createElement('div', 'narrative-text', {
            maxWidth: '80%',
            margin: '0 auto',
            lineHeight: '1.6',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            padding: '20px'
        });
        this.narrativeOverlay.appendChild(this.narrativeText);
        
        // Create atmospheric narrative banner (for less intrusive messages)
        this.narrativeBanner = this.createElement('div', 'narrative-banner', {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '40px',
            backgroundColor: 'rgba(16, 32, 48, 0.9)',
            color: '#e0e0e0',
            display: 'none',
            zIndex: '999',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '40px',
            textAlign: 'center',
            borderBottom: '2px solid #444',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            boxSizing: 'border-box'
        });
        
        // Lore discovery now integrated into terminal - no popup needed
        
        // Create floating combat text container  
        this.combatTextContainer = this.createElement('div', 'combat-text-container', {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '400px',  // Match canvas width
            height: '280px', // Match canvas height
            pointerEvents: 'none',
            zIndex: '997'
        });
        
        // Add to game container (use the game container instead of body)
        const gameContainer = document.getElementById('game-container');
        gameContainer.appendChild(this.narrativeOverlay);
        gameContainer.appendChild(this.narrativeBanner);
        gameContainer.appendChild(this.combatTextContainer);
    }
    
    createElement(tag, className, styles) {
        const element = document.createElement(tag);
        element.className = className;
        Object.assign(element.style, styles);
        return element;
    }
    
    queueNarrative(narrativeData) {
        // No more queueing - display immediately in console
        this.displayNarrative(narrativeData);
    }
    
    async displayNarrative(narrativeData) {
        const { narrative, importance = 'normal' } = narrativeData;
        
        // Route ALL narratives to the console - no more red banners or overlays
        switch (importance) {
            case 'urgent':
                this.showConsoleNarrative(narrative, 'urgent');
                break;
            case 'important':
                this.showConsoleNarrative(narrative, 'important');
                break;
            case 'normal':
                this.showConsoleNarrative(narrative, 'story');
                break;
            case 'low':
                this.showConsoleNarrative(narrative, 'atmospheric');
                break;
            default:
                this.showConsoleNarrative(narrative, 'story');
                break;
        }
    }
    
    async showFullScreenNarrative(text, importance) {
        this.narrativeOverlay.style.display = 'flex';
        
        // Add importance-based styling
        if (importance === 'urgent') {
            this.narrativeOverlay.style.backgroundColor = 'rgba(64, 0, 0, 0.9)';
            this.narrativeText.style.color = '#ff6666';
            this.narrativeText.style.fontSize = '16px';
        } else {
            this.narrativeOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            this.narrativeText.style.color = '#c0c0c0';
            this.narrativeText.style.fontSize = '14px';
        }
        
        // Typewriter effect
        await this.typewriterEffect(this.narrativeText, text);
        
        // Wait for display duration
        await this.sleep(this.displayDuration);
        
        // Fade out
        await this.fadeOut(this.narrativeOverlay);
        this.narrativeOverlay.style.display = 'none';
    }
    
    showBannerNarrative(text) {
        this.narrativeBanner.textContent = text;
        this.narrativeBanner.style.display = 'block';
        
        // Auto-hide after duration
        setTimeout(() => {
            this.fadeOut(this.narrativeBanner).then(() => {
                this.narrativeBanner.style.display = 'none';
            });
        }, 3000);
    }
    
    showConsoleNarrative(text, type) {
        // Create enhanced message for different narrative types
        const className = this.getNarrativeClassName(type);
        const prefix = this.getNarrativePrefix(type);
        
        this.addToMessageConsole(`${prefix}${text}`, className);
        
        // No more banner display - everything goes to console for faster victory sequence
    }
    
    getNarrativeClassName(type) {
        const classMap = {
            urgent: 'narrative-urgent',
            important: 'narrative-important', 
            story: 'narrative-story',
            atmospheric: 'narrative-atmospheric'
        };
        return classMap[type] || 'narrative-msg';
    }
    
    getNarrativePrefix(type) {
        const prefixMap = {
            urgent: '🔥 ',
            important: '⭐ ',
            story: '📜 ',
            atmospheric: '🌫️ '
        };
        return prefixMap[type] || '';
    }
    
    showUrgentBanner(text) {
        // Prevent banner overlap - only show if not already showing one
        if (this.narrativeBanner.style.display === 'block') {
            return; // Don't show overlapping banners
        }
        
        // Show a brief, non-blocking banner for urgent messages
        this.narrativeBanner.textContent = `🔥 ${text}`;
        this.narrativeBanner.style.display = 'block';
        this.narrativeBanner.style.backgroundColor = 'rgba(64, 16, 16, 0.95)';
        this.narrativeBanner.style.color = '#ff6666';
        this.narrativeBanner.style.borderBottomColor = '#ff6666';
        
        // Auto-hide after 2.5 seconds (shorter to reduce overlap)
        setTimeout(() => {
            this.fadeOut(this.narrativeBanner).then(() => {
                this.narrativeBanner.style.display = 'none';
                // Reset styles
                this.narrativeBanner.style.backgroundColor = 'rgba(16, 32, 48, 0.9)';
                this.narrativeBanner.style.color = '#e0e0e0';
                this.narrativeBanner.style.borderBottomColor = '#444';
            });
        }, 2500);
    }
    
    addToMessageConsole(text, className = '') {
        const messageLog = document.getElementById('message-log');
        if (messageLog) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${className}`;
            
            // Add special formatting for narrative messages
            if (className.includes('narrative-')) {
                messageDiv.style.borderLeft = this.getNarrativeBorderColor(className);
                messageDiv.style.paddingLeft = '8px';
                messageDiv.style.marginLeft = '4px';
                messageDiv.style.marginBottom = '4px';
                
                // Handle multi-line narrative text better
                if (text.length > 80) {
                    messageDiv.style.lineHeight = '1.4';
                    messageDiv.style.wordWrap = 'break-word';
                }
            }
            
            messageDiv.textContent = text;
            messageLog.appendChild(messageDiv);
            
            // Auto-scroll to bottom with smooth animation
            const messageConsole = document.getElementById('message-console');
            if (messageConsole) {
                messageConsole.scrollTo({
                    top: messageConsole.scrollHeight,
                    behavior: 'smooth'
                });
            }
            
            // Keep only last 50 messages for performance
            const messages = messageLog.children;
            if (messages.length > 50) {
                messageLog.removeChild(messages[0]);
            }
        }
    }
    
    getNarrativeBorderColor(className) {
        const borderMap = {
            'narrative-urgent': '3px solid #ff4444',
            'narrative-important': '3px solid #ffaa44', 
            'narrative-story': '3px solid #44aaff',
            'narrative-atmospheric': '3px solid #888888'
        };
        return borderMap[className] || '2px solid #666666';
    }
    
    async typewriterEffect(element, text) {
        element.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await this.sleep(this.typewriterSpeed);
        }
    }
    
    async fadeOut(element, duration = 500) {
        const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const fade = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const opacity = startOpacity * (1 - progress);
                
                element.style.opacity = opacity;
                
                if (progress < 1) {
                    requestAnimationFrame(fade);
                } else {
                    element.style.opacity = '';
                    resolve();
                }
            };
            fade();
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showLoreDiscovery(loreData) {
        const { category, entry } = loreData;
        
        // Enhanced rarity symbols and colors
        const rarityInfo = {
            common: { symbol: '○', color: '#c0c0c0', desc: 'Common Knowledge' },
            uncommon: { symbol: '◐', color: '#90ee90', desc: 'Uncommon Insight' }, 
            rare: { symbol: '●', color: '#4169e1', desc: 'Rare Revelation' },
            legendary: { symbol: '★', color: '#ffd700', desc: 'Legendary Secret' }
        }[entry.rarity] || { symbol: '○', color: '#c0c0c0', desc: 'Ancient Knowledge' };
        
        // Create enhanced lore discovery message with better formatting
        const categoryDisplayName = this.getCategoryDisplayName(category);
        const discoveryMessage = `📜 ${rarityInfo.desc} discovered! ${rarityInfo.symbol} ${categoryDisplayName}`;
        
        // Show discovery announcement in console with enhanced styling
        this.addToMessageConsole(discoveryMessage, 'lore-discovery');
        
        // Show the actual lore content with enhanced presentation
        setTimeout(() => {
            // Add some atmospheric formatting to the lore content
            const formattedContent = this.formatLoreContent(entry.content, category);
            this.addToMessageConsole(formattedContent, 'lore-content');
        }, 800);
        
        // Add a subtle separator line for better readability
        setTimeout(() => {
            this.addToMessageConsole('───────────────────────────────────', 'lore-separator');
        }, 1200);
    }
    
    getCategoryDisplayName(category) {
        const categoryNames = {
            'ruins': 'Ancient Ruins Lore',
            'creatures': 'Creature Bestiary', 
            'artifacts': 'Mystical Artifacts',
            'legends': 'Forgotten Legends',
            'history': 'Historical Records',
            'magic': 'Arcane Knowledge',
            'geography': 'Realm Geography',
            'culture': 'Lost Civilizations'
        };
        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }
    
    formatLoreContent(content, category) {
        // Add atmospheric prefixes based on category
        const atmosphericPrefixes = {
            'ruins': '🏛️ ',
            'creatures': '🐉 ',
            'artifacts': '🔮 ',
            'legends': '⚔️ ',
            'history': '📚 ',
            'magic': '✨ ',
            'geography': '🗺️ ',
            'culture': '🏺 '
        };
        
        const prefix = atmosphericPrefixes[category] || '📜 ';
        return `${prefix}"${content}"`;
    }
    
    showDeathNarrative() {
        const deathNarratives = [
            "Your journey ends here, brave adventurer. The cavern claims another soul...",
            "Darkness embraces you as your tale comes to a close. Will others remember your courage?",
            "The ancient stones bear witness to your final moments. Rest now, weary traveler...",
            "Your light fades, but legends of your bravery shall echo through these halls..."
        ];
        
        const narrative = deathNarratives[Math.floor(Math.random() * deathNarratives.length)];
        
        // Show death message immediately in console
        this.showConsoleNarrative(narrative, 'urgent');
        
        // Add a final epitaph
        setTimeout(() => {
            this.showConsoleNarrative("--- END OF TALE ---", 'urgent');
        }, 2000);
    }
    
    showFloorCompletionNarrative(floorData) {
        const { floor } = floorData;
        let narrative;
        
        if (floor % 5 === 0 || floor <= 3) {
            // Milestone floors or campaign floors
            narrative = `Floor ${floor} conquered! The deeper mysteries of this ancient place await your discovery...`;
            this.showConsoleNarrative(narrative, 'important');
        } else {
            narrative = `Floor ${floor} lies behind you. Onward, into the ever-deepening darkness...`;
            this.showConsoleNarrative(narrative, 'story');
        }
    }
    
    showFloatingCombatText(x, y, text, color = '#ff6666', size = '12px') {
        const floatingText = this.createElement('div', 'floating-combat-text', {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            color: color,
            fontSize: size,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            zIndex: '999'
        });
        
        floatingText.textContent = text;
        this.combatTextContainer.appendChild(floatingText);
        
        // Animate upward and fade
        this.animateFloatingText(floatingText);
    }
    
    async animateFloatingText(element) {
        const startY = parseFloat(element.style.top);
        const duration = 1500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                element.remove();
                return;
            }
            
            // Move up and fade out
            const y = startY - (progress * 30);
            const opacity = 1 - progress;
            
            element.style.top = `${y}px`;
            element.style.opacity = opacity;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // API for external systems
    showCustomNarrative(text, importance = 'normal') {
        this.queueNarrative({
            narrative: text,
            importance
        });
    }
    
    showCombatNarrative(attacker, target, damage, critical = false) {
        // Get camera position from renderer to calculate screen coordinates
        const renderer = window.game && window.game.renderer;
        if (!renderer) {
            return; // No renderer available
        }
        
        // Convert world coordinates to screen coordinates accounting for camera
        const screenX = (target.x - renderer.cameraX) * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const screenY = (target.y - renderer.cameraY) * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        
        // Only show floating text if target is visible on screen
        if (screenX >= 0 && screenX <= CONFIG.VIEWPORT_WIDTH * CONFIG.CELL_SIZE &&
            screenY >= 0 && screenY <= CONFIG.VIEWPORT_HEIGHT * CONFIG.CELL_SIZE) {
            
            if (critical) {
                this.showFloatingCombatText(screenX, screenY, `CRITICAL! ${damage}`, '#ffff00', '14px');
                this.showCustomNarrative(`A devastating critical strike!`, 'normal');
            } else {
                this.showFloatingCombatText(screenX, screenY, `${damage}`, '#ff6666');
            }
        }
    }
    
    // Lore system integration
    showLoreModal() {
        // This would integrate with the existing modal system
        const allLore = this.eventBus.getAllLore();
        
        if (window.game && window.game.modal) {
            const loreContent = this.formatLoreForModal(allLore);
            window.game.modal.show({
                title: '📜 COLLECTED LORE',
                content: loreContent,
                actions: [{ text: 'Close', action: 'close' }]
            });
        }
    }
    
    formatLoreForModal(loreEntries) {
        if (loreEntries.length === 0) {
            return '<div style="text-align: center; color: #888;">No lore discovered yet...</div>';
        }
        
        const categories = {};
        loreEntries.forEach(entry => {
            if (!categories[entry.category]) {
                categories[entry.category] = [];
            }
            categories[entry.category].push(entry);
        });
        
        let html = '';
        for (const [category, entries] of Object.entries(categories)) {
            html += `<div style="margin-bottom: 15px;">`;
            html += `<h3 style="color: #d4af37; border-bottom: 1px solid #444;">${category.toUpperCase()}</h3>`;
            
            entries.forEach(entry => {
                const rarityColor = {
                    common: '#c0c0c0',
                    uncommon: '#90ee90',
                    rare: '#4169e1',
                    legendary: '#ffd700'
                }[entry.rarity] || '#c0c0c0';
                
                html += `<div style="margin: 8px 0; padding: 6px; border-left: 3px solid ${rarityColor};">`;
                html += `<div style="font-size: 11px; color: ${rarityColor};">[${entry.rarity.toUpperCase()}]</div>`;
                html += `<div style="margin-top: 4px;">${entry.content}</div>`;
                html += `</div>`;
            });
            
            html += `</div>`;
        }
        
        return html;
    }
}