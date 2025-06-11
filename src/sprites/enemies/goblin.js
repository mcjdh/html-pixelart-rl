const goblinSprites = {
    default: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Goblin green skin
        ctx.fillStyle = '#585';
        // Head (larger with pointed ears)
        ctx.fillRect(x + 4*unit, y + 3*unit, 8*unit, 6*unit);
        // Pointed ears
        ctx.fillRect(x + 3*unit, y + 4*unit, 1*unit, 2*unit); // Left ear
        ctx.fillRect(x + 12*unit, y + 4*unit, 1*unit, 2*unit); // Right ear
        
        // Body (smaller, crude clothing)
        ctx.fillStyle = '#421'; // Brown crude cloth
        ctx.fillRect(x + 5*unit, y + 9*unit, 6*unit, 4*unit);
        
        // Arms (green skin)
        ctx.fillStyle = '#585';
        ctx.fillRect(x + 3*unit, y + 9*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 11*unit, y + 9*unit, 2*unit, 2*unit);
        // Legs
        ctx.fillRect(x + 5*unit, y + 13*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 13*unit, 2*unit, 2*unit);
        
        // Menacing red eyes
        ctx.fillStyle = '#f44';
        ctx.fillRect(x + 5*unit, y + 5*unit, unit, unit);
        ctx.fillRect(x + 10*unit, y + 5*unit, unit, unit);
        
        // Crude fangs
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 6*unit, y + 7*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 7*unit, 1*unit, 1*unit);
        
        // Simple weapon (club)
        ctx.fillStyle = '#421';
        ctx.fillRect(x + 13*unit, y + 8*unit, 1*unit, 4*unit);
        ctx.fillStyle = '#654';
        ctx.fillRect(x + 12*unit, y + 7*unit, 3*unit, 2*unit);
    },
    
    warrior: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Goblin green skin
        ctx.fillStyle = '#585';
        // Head with pointed ears
        ctx.fillRect(x + 4*unit, y + 3*unit, 8*unit, 6*unit);
        ctx.fillRect(x + 3*unit, y + 4*unit, 1*unit, 2*unit); // Left ear
        ctx.fillRect(x + 12*unit, y + 4*unit, 1*unit, 2*unit); // Right ear
        
        // Crude armor (dark metal)
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 5*unit, y + 9*unit, 6*unit, 4*unit);
        
        // Arms with armor pieces
        ctx.fillStyle = '#585'; // Skin
        ctx.fillRect(x + 3*unit, y + 9*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 11*unit, y + 9*unit, 2*unit, 2*unit);
        ctx.fillStyle = '#444'; // Armor on arms
        ctx.fillRect(x + 3*unit, y + 9*unit, 2*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 9*unit, 2*unit, 1*unit);
        
        // Legs
        ctx.fillStyle = '#585';
        ctx.fillRect(x + 5*unit, y + 13*unit, 2*unit, 2*unit);
        ctx.fillRect(x + 9*unit, y + 13*unit, 2*unit, 2*unit);
        
        // Crude helmet
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 4*unit, y + 2*unit, 8*unit, 3*unit);
        // Helmet spikes
        ctx.fillRect(x + 6*unit, y + 1*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 9*unit, y + 1*unit, 1*unit, 1*unit);
        
        // Glowing red eyes (visible through helmet)
        ctx.fillStyle = '#f44';
        ctx.fillRect(x + 5*unit, y + 5*unit, unit, unit);
        ctx.fillRect(x + 10*unit, y + 5*unit, unit, unit);
        
        // Crude sword (rusty)
        ctx.fillStyle = '#987'; // Rusty blade
        ctx.fillRect(x + 13*unit, y + 8*unit, unit, 4*unit);
        ctx.fillStyle = '#421'; // Leather wrap handle
        ctx.fillRect(x + 13*unit, y + 12*unit, unit, 2*unit);
        ctx.fillStyle = '#654'; // Metal crossguard
        ctx.fillRect(x + 12*unit, y + 11*unit, 3*unit, 1*unit);
    },
    
    shaman: (ctx, x, y, size) => {
        const unit = size / 16;
        
        // Goblin green skin
        ctx.fillStyle = '#585';
        // Head with pointed ears
        ctx.fillRect(x + 4*unit, y + 3*unit, 8*unit, 6*unit);
        ctx.fillRect(x + 3*unit, y + 4*unit, 1*unit, 2*unit); // Left ear
        ctx.fillRect(x + 12*unit, y + 4*unit, 1*unit, 2*unit); // Right ear
        
        // Dark ritual robes
        ctx.fillStyle = '#201'; // Very dark red robe
        ctx.fillRect(x + 4*unit, y + 9*unit, 8*unit, 5*unit);
        
        // Arms (green skin showing)
        ctx.fillStyle = '#585';
        ctx.fillRect(x + 2*unit, y + 9*unit, 2*unit, 3*unit);
        ctx.fillRect(x + 12*unit, y + 9*unit, 2*unit, 3*unit);
        
        // Ritual markings on face
        ctx.fillStyle = '#f0f'; // Purple magic markings
        ctx.fillRect(x + 4*unit, y + 4*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 11*unit, y + 4*unit, 1*unit, 1*unit);
        
        // Glowing magical eyes
        ctx.fillStyle = '#a0f';
        ctx.fillRect(x + 5*unit, y + 5*unit, unit, unit);
        ctx.fillRect(x + 10*unit, y + 5*unit, unit, unit);
        
        // Bone staff
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x + 14*unit, y + 7*unit, unit, 6*unit);
        
        // Skull totem on staff
        ctx.fillStyle = '#eee';
        ctx.fillRect(x + 13*unit, y + 6*unit, 3*unit, 2*unit);
        ctx.fillStyle = '#000'; // Eye sockets
        ctx.fillRect(x + 13*unit, y + 6*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 15*unit, y + 6*unit, 1*unit, 1*unit);
        
        // Magical energy wisps
        ctx.fillStyle = '#a0f';
        ctx.fillRect(x + 1*unit, y + 8*unit, 1*unit, 1*unit);
        ctx.fillRect(x + 15*unit, y + 9*unit, 1*unit, 1*unit);
    }
};