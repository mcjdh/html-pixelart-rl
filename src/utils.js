// Utility functions for common game operations

class GameUtils {
    /**
     * Calculate distance between two points
     * @param {Object} point1 - Object with x,y properties
     * @param {Object} point2 - Object with x,y properties
     * @returns {number} Distance between points
     */
    static calculateDistance(point1, point2) {
        return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
    }
    
    /**
     * Check if coordinates are within game bounds
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if within bounds
     */
    static isInBounds(x, y) {
        return x >= 0 && x < CONFIG.GRID_WIDTH && y >= 0 && y < CONFIG.GRID_HEIGHT;
    }
    
    /**
     * Get random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Clamp value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    /**
     * Get direction vector from one point to another
     * @param {Object} from - Starting point with x,y
     * @param {Object} to - Target point with x,y
     * @returns {Object} Direction object with dx,dy (-1, 0, or 1)
     */
    static getDirection(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        return {
            dx: dx === 0 ? 0 : (dx > 0 ? 1 : -1),
            dy: dy === 0 ? 0 : (dy > 0 ? 1 : -1)
        };
    }
    
    /**
     * Check if two rectangles overlap
     * @param {Object} rect1 - Rectangle with x,y,width,height
     * @param {Object} rect2 - Rectangle with x,y,width,height
     * @returns {boolean} True if rectangles overlap
     */
    static rectanglesOverlap(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
}


// Global utilities object for backwards compatibility
const Utils = GameUtils;