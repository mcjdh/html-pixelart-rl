/**
 * Utility class for common sprite drawing operations
 * Reduces code duplication and standardizes sprite rendering
 */
class SpriteUtils {
    /**
     * Calculate unit size for 16x16 sprite scaling
     * @param {number} size - Target sprite size
     * @returns {number} Unit size for positioning
     */
    static getUnit(size) {
        return size / 16;
    }
    
    /**
     * Draw a rectangular body part with standard positioning
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size (from getUnit)
     * @param {string} color - Fill color
     * @param {number} offsetX - X offset in units
     * @param {number} offsetY - Y offset in units
     * @param {number} width - Width in units
     * @param {number} height - Height in units
     */
    static drawRect(ctx, x, y, unit, color, offsetX, offsetY, width, height) {
        ctx.fillStyle = color;
        ctx.fillRect(x + offsetX * unit, y + offsetY * unit, width * unit, height * unit);
    }
    
    /**
     * Draw a pair of eyes with standard spacing
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} color - Eye color
     * @param {number} leftX - Left eye X offset in units
     * @param {number} eyeY - Eye Y offset in units
     * @param {number} spacing - Space between eyes in units (default 3)
     * @param {number} eyeSize - Eye size in units (default 1)
     */
    static drawEyes(ctx, x, y, unit, color, leftX, eyeY, spacing = 3, eyeSize = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(x + leftX * unit, y + eyeY * unit, eyeSize * unit, eyeSize * unit);
        ctx.fillRect(x + (leftX + spacing) * unit, y + eyeY * unit, eyeSize * unit, eyeSize * unit);
    }
    
    /**
     * Draw a humanoid head with standard proportions
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} skinColor - Head color
     * @param {number} headX - Head X offset (default 5)
     * @param {number} headY - Head Y offset (default 2)
     * @param {number} headWidth - Head width (default 6)
     * @param {number} headHeight - Head height (default 5)
     */
    static drawHead(ctx, x, y, unit, skinColor, headX = 5, headY = 2, headWidth = 6, headHeight = 5) {
        this.drawRect(ctx, x, y, unit, skinColor, headX, headY, headWidth, headHeight);
    }
    
    /**
     * Draw a standard humanoid body
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} bodyColor - Body/clothing color
     * @param {number} bodyX - Body X offset (default 5)
     * @param {number} bodyY - Body Y offset (default 7)
     * @param {number} bodyWidth - Body width (default 6)
     * @param {number} bodyHeight - Body height (default 5)
     */
    static drawBody(ctx, x, y, unit, bodyColor, bodyX = 5, bodyY = 7, bodyWidth = 6, bodyHeight = 5) {
        this.drawRect(ctx, x, y, unit, bodyColor, bodyX, bodyY, bodyWidth, bodyHeight);
    }
    
    /**
     * Draw standard arms for humanoid sprites
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} armColor - Arm color
     * @param {number} armY - Arm Y position (default 8)
     * @param {number} armWidth - Arm width (default 2)
     * @param {number} armHeight - Arm height (default 3)
     */
    static drawArms(ctx, x, y, unit, armColor, armY = 8, armWidth = 2, armHeight = 3) {
        // Left arm
        this.drawRect(ctx, x, y, unit, armColor, 3, armY, armWidth, armHeight);
        // Right arm
        this.drawRect(ctx, x, y, unit, armColor, 11, armY, armWidth, armHeight);
    }
    
    /**
     * Draw standard legs for humanoid sprites
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} legColor - Leg color
     * @param {number} legY - Leg Y position (default 12)
     * @param {number} legWidth - Leg width (default 2)
     * @param {number} legHeight - Leg height (default 3)
     * @param {number} legSpacing - Space between legs (default 3)
     */
    static drawLegs(ctx, x, y, unit, legColor, legY = 12, legWidth = 2, legHeight = 3, legSpacing = 3) {
        // Left leg
        this.drawRect(ctx, x, y, unit, legColor, 5, legY, legWidth, legHeight);
        // Right leg
        this.drawRect(ctx, x, y, unit, legColor, 5 + legSpacing, legY, legWidth, legHeight);
    }
    
    /**
     * Draw quadruped legs (for animals like wolves)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} legColor - Leg color
     * @param {number} legY - Leg Y position
     * @param {number} legWidth - Leg width
     * @param {number} legHeight - Leg height
     */
    static drawQuadrupedLegs(ctx, x, y, unit, legColor, legY = 13, legWidth = 2, legHeight = 3) {
        const positions = [4, 7, 9, 11]; // Front left, front right, back left, back right
        ctx.fillStyle = legColor;
        positions.forEach(xPos => {
            ctx.fillRect(x + xPos * unit, y + legY * unit, legWidth * unit, legHeight * unit);
        });
    }
    
    /**
     * Draw pointed ears (for goblins, elves, etc.)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} earColor - Ear color
     * @param {number} earY - Ear Y position
     * @param {number} earHeight - Ear height (default 2)
     */
    static drawPointedEars(ctx, x, y, unit, earColor, earY = 4, earHeight = 2) {
        ctx.fillStyle = earColor;
        // Left ear
        ctx.fillRect(x + 3 * unit, y + earY * unit, 1 * unit, earHeight * unit);
        // Right ear
        ctx.fillRect(x + 12 * unit, y + earY * unit, 1 * unit, earHeight * unit);
    }
    
    /**
     * Draw fangs or teeth
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} toothColor - Tooth color (default white)
     * @param {number} leftToothX - Left tooth X position
     * @param {number} rightToothX - Right tooth X position
     * @param {number} toothY - Tooth Y position
     * @param {number} toothSize - Tooth size (default 1)
     */
    static drawFangs(ctx, x, y, unit, toothColor = '#ddd', leftToothX, rightToothX, toothY, toothSize = 1) {
        ctx.fillStyle = toothColor;
        ctx.fillRect(x + leftToothX * unit, y + toothY * unit, toothSize * unit, toothSize * unit);
        ctx.fillRect(x + rightToothX * unit, y + toothY * unit, toothSize * unit, toothSize * unit);
    }
    
    /**
     * Draw a simple weapon (club, sword, staff)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} handleColor - Handle color
     * @param {string} headColor - Weapon head color
     * @param {number} weaponX - Weapon X position
     * @param {number} weaponY - Weapon Y position
     * @param {number} handleLength - Handle length
     * @param {number} headWidth - Weapon head width
     * @param {number} headHeight - Weapon head height
     */
    static drawWeapon(ctx, x, y, unit, handleColor, headColor, weaponX, weaponY, handleLength, headWidth = 3, headHeight = 2) {
        // Handle
        ctx.fillStyle = handleColor;
        ctx.fillRect(x + weaponX * unit, y + (weaponY + headHeight) * unit, 1 * unit, handleLength * unit);
        // Weapon head
        ctx.fillStyle = headColor;
        ctx.fillRect(x + (weaponX - Math.floor(headWidth/2)) * unit, y + weaponY * unit, headWidth * unit, headHeight * unit);
    }
    
    /**
     * Draw decorative markings or patterns
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} unit - Unit size
     * @param {string} markingColor - Marking color
     * @param {Array} positions - Array of {x, y, w, h} objects for marking positions
     */
    static drawMarkings(ctx, x, y, unit, markingColor, positions) {
        ctx.fillStyle = markingColor;
        positions.forEach(pos => {
            ctx.fillRect(x + pos.x * unit, y + pos.y * unit, pos.w * unit, pos.h * unit);
        });
    }
    
    /**
     * Draw a basic humanoid sprite with all standard parts
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - Base X position
     * @param {number} y - Base Y position
     * @param {number} size - Sprite size
     * @param {Object} colors - Color configuration object
     * @param {Object} options - Optional overrides for positioning
     */
    static drawHumanoid(ctx, x, y, size, colors, options = {}) {
        const unit = this.getUnit(size);
        
        // Draw all parts with color configuration
        this.drawHead(ctx, x, y, unit, colors.skin || '#dca');
        this.drawBody(ctx, x, y, unit, colors.body || '#684');
        this.drawArms(ctx, x, y, unit, colors.arms || colors.skin || '#dca');
        this.drawLegs(ctx, x, y, unit, colors.legs || '#542');
        
        if (colors.eyes) {
            this.drawEyes(ctx, x, y, unit, colors.eyes, 6, 4);
        }
    }
}

// Make SpriteUtils available globally
window.SpriteUtils = SpriteUtils;