/**
 * ResourceManager - Handles tracked resource management for memory leak prevention
 * Provides methods for tracked event listeners, timers, and cleanup
 */
window.ResourceManager = {
    /**
     * Initialize resource tracking properties on game instance
     */
    initResourceTracking(gameInstance) {
        gameInstance.eventListeners = [];
        gameInstance.timers = [];
        gameInstance.intervals = [];
        gameInstance.animationFrame = null;
    },

    /**
     * Helper methods for tracked resource management
     */
    addEventListenerTracked(gameInstance, element, event, listener, options = {}) {
        element.addEventListener(event, listener, options);
        gameInstance.eventListeners.push({ element, event, listener, options });
    },

    addTimeoutTracked(gameInstance, callback, delay) {
        const timeoutId = setTimeout(callback, delay);
        gameInstance.timers.push(timeoutId);
        return timeoutId;
    },

    addIntervalTracked(gameInstance, callback, delay) {
        const intervalId = setInterval(callback, delay);
        gameInstance.intervals.push(intervalId);
        return intervalId;
    },

    /**
     * Clean up all tracked resources
     */
    destroy(gameInstance) {
        // Cancel animation frame
        if (gameInstance.animationFrame) {
            cancelAnimationFrame(gameInstance.animationFrame);
            gameInstance.animationFrame = null;
        }

        // Remove all event listeners
        gameInstance.eventListeners.forEach(({ element, event, listener, options }) => {
            element.removeEventListener(event, listener, options);
        });
        gameInstance.eventListeners = [];

        // Clear all timers
        gameInstance.timers.forEach(clearTimeout);
        gameInstance.timers = [];

        // Clear all intervals
        gameInstance.intervals.forEach(clearInterval);
        gameInstance.intervals = [];

        // Clean up auto system
        if (gameInstance.autoSystem) {
            gameInstance.autoSystem.destroy();
        }

        // Clean up other systems
        if (gameInstance.particles) {
            gameInstance.particles.clear();
        }

        console.log('Game resources cleaned up');
    }
};

/**
 * Mixin to add resource management methods to Game class
 */
window.ResourceManagerMixin = {
    addEventListenerTracked(element, event, listener, options = {}) {
        return window.ResourceManager.addEventListenerTracked(this, element, event, listener, options);
    },

    addTimeoutTracked(callback, delay) {
        return window.ResourceManager.addTimeoutTracked(this, callback, delay);
    },

    addIntervalTracked(callback, delay) {
        return window.ResourceManager.addIntervalTracked(this, callback, delay);
    },

    destroy() {
        return window.ResourceManager.destroy(this);
    }
};