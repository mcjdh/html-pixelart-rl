/**
 * ModalManager - Handles modal dialog display and interaction
 * Manages modal overlays, buttons, and accessibility features
 */
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
        
        // Add new buttons with enhanced interaction
        if (config.buttons) {
            config.buttons.forEach((buttonConfig, index) => {
                const button = document.createElement('button');
                button.className = `modal-button ${buttonConfig.primary ? 'primary' : ''}`;
                button.textContent = buttonConfig.text;
                
                // Enhanced click/tap handling
                const handleActivation = () => {
                    if (buttonConfig.callback) {
                        buttonConfig.callback();
                    }
                };
                
                button.addEventListener('click', handleActivation);
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    handleActivation();
                });
                
                // Keyboard navigation support
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleActivation();
                    }
                });
                
                // Focus first button or primary button
                if (index === 0 || buttonConfig.primary) {
                    setTimeout(() => button.focus(), 100);
                }
                
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

// Make ModalManager globally available (maintaining vanilla JS pattern)
window.ModalManager = ModalManager;