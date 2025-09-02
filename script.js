// Game State Management
class GameState {
    constructor() {
        this.currentLanguage = 'en';
        this.currentScreen = 'loading';
        this.player = {
            name: '',
            class: 'warrior',
            level: 1,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            experience: 0,
            position: { x: 0, y: 0 }
        };
        this.inventory = [];
        this.isInCombat = false;
        this.currentEnemy = null;
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        this.updateLanguageDisplay();
    }

    updateLanguageDisplay() {
        const elements = document.querySelectorAll('[data-en][data-km]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });

        // Update placeholders
        const inputs = document.querySelectorAll('[data-en-placeholder][data-km-placeholder]');
        inputs.forEach(input => {
            const placeholder = input.getAttribute(`data-${this.currentLanguage}-placeholder`);
            if (placeholder) {
                input.placeholder = placeholder;
            }
        });

        // Update language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.loading-screen, .main-menu, .character-creation, .game-world, .combat-screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }

        this.currentScreen = screenId;
    }
}

// Initialize game state
const gameState = new GameState();

// Language System
class LanguageManager {
    constructor() {
        this.setupLanguageButtons();
    }

    setupLanguageButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                gameState.setLanguage(btn.dataset.lang);
            });
        });
    }
}

// Character Creation System
class CharacterCreation {
    constructor() {
        this.selectedClass = 'warrior';
        this.setupClassSelection();
        this.setupCreateButton();
    }

    setupClassSelection() {
        document.querySelectorAll('.class-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.class-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.selectedClass = option.dataset.class;
                this.updateCharacterPreview();
            });
        });
    }

    updateCharacterPreview() {
        const avatar = document.getElementById('character-avatar');
        const classIcons = {
            warrior: '⚔️',
            mage: '🔮',
            archer: '🏹'
        };
        avatar.textContent = classIcons[this.selectedClass];
    }

    setupCreateButton() {
        document.getElementById('create-character-btn').addEventListener('click', () => {
            const name = document.getElementById('character-name').value.trim();
            if (name) {
                gameState.player.name = name;
                gameState.player.class = this.selectedClass;
                this.startGame();
            } else {
                alert(gameState.currentLanguage === 'en' ? 'Please enter a name!' : 'សូមបញ្ចូលឈ្មោះ!');
            }
        });
    }

    startGame() {
        // Update player display
        document.getElementById('player-name').textContent = gameState.player.name;
        document.getElementById('character-display-name').textContent = gameState.player.name;
        
        const classIcons = {
            warrior: '⚔️',
            mage: '🔮',
            archer: '🏹'
        };
        
        document.getElementById('player-avatar').textContent = classIcons[gameState.player.class];
        document.querySelector('.character-sprite').textContent = classIcons[gameState.player.class];

        // Initialize inventory
        this.initializeInventory();
        
        gameState.showScreen('game-world');
    }

    initializeInventory() {
        const startingItems = {
            warrior: ['⚔️', '🛡️', '🍖'],
            mage: ['🔮', '📜', '🧪'],
            archer: ['🏹', '🎯', '🍖']
        };

        gameState.inventory = startingItems[gameState.player.class] || [];
        this.updateInventoryDisplay();
    }

    updateInventoryDisplay() {
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';

        // Create 24 slots (4x6 grid)
        for (let i = 0; i < 24; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            if (gameState.inventory[i]) {
                slot.textContent = gameState.inventory[i];
                slot.classList.add('has-item');
            }
            
            grid.appendChild(slot);
        }
    }
}

// Combat System
class CombatSystem {
    constructor() {
        this.setupCombatButtons();
    }

    startCombat(enemy) {
        gameState.currentEnemy = enemy;
        gameState.isInCombat = true;
        
        document.getElementById('enemy-sprite').textContent = enemy.sprite;
        document.getElementById('enemy-name').textContent = enemy.name;
        document.getElementById('enemy-health-bar').style.width = '100%';
        
        this.addCombatLog(gameState.currentLanguage === 'en' ? 
            `A wild ${enemy.name} appears!` : 
            `${enemy.name} ព្រៃបានបង្ហាញខ្លួន!`);
        
        gameState.showScreen('combat-screen');
    }

    setupCombatButtons() {
        document.getElementById('attack-btn').addEventListener('click', () => this.playerAttack());
        document.getElementById('defend-btn').addEventListener('click', () => this.playerDefend());
        document.getElementById('heal-btn').addEventListener('click', () => this.playerHeal());
        document.getElementById('flee-btn').addEventListener('click', () => this.playerFlee());
    }

    playerAttack() {
        const damage = Math.floor(Math.random() * 25) + 15;
        gameState.currentEnemy.health -= damage;
        
        this.addCombatLog(gameState.currentLanguage === 'en' ? 
            `You deal ${damage} damage!` : 
            `អ្នកធ្វើឱ្យខូចខាត ${damage}!`);

        if (gameState.currentEnemy.health <= 0) {
            this.endCombat(true);
        } else {
            this.enemyTurn();
        }
    }

    playerDefend() {
        this.addCombatLog(gameState.currentLanguage === 'en' ? 
            'You raise your guard!' : 
            'អ្នកលើកការពារ!');
        this.enemyTurn(0.5); // Reduce enemy damage
    }

    playerHeal() {
        if (gameState.player.mana >= 10) {
            const healAmount = Math.floor(Math.random() * 20) + 10;
            gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + healAmount);
            gameState.player.mana -= 10;
            
            this.addCombatLog(gameState.currentLanguage === 'en' ? 
                `You heal for ${healAmount} HP!` : 
                `អ្នកព្យាបាល ${healAmount} HP!`);
            
            this.updatePlayerStats();
            this.enemyTurn();
        } else {
            this.addCombatLog(gameState.currentLanguage === 'en' ? 
                'Not enough mana!' : 
                'មិនមានម៉ាណាគ្រប់គ្រាន់!');
        }
    }

    playerFlee() {
        if (Math.random() < 0.7) {
            this.addCombatLog(gameState.currentLanguage === 'en' ? 
                'You successfully fled!' : 
                'អ្នករត់គេចបានជោគជ័យ!');
            this.endCombat(false);
        } else {
            this.addCombatLog(gameState.currentLanguage === 'en' ? 
                'Cannot escape!' : 
                'មិនអាចរត់គេចបាន!');
            this.enemyTurn();
        }
    }

    enemyTurn(damageMultiplier = 1) {
        setTimeout(() => {
            const damage = Math.floor((Math.random() * 15 + 10) * damageMultiplier);
            gameState.player.health -= damage;
            
            this.addCombatLog(gameState.currentLanguage === 'en' ? 
                `${gameState.currentEnemy.name} deals ${damage} damage!` : 
                `${gameState.currentEnemy.name} ធ្វើឱ្យខូចខាត ${damage}!`);

            this.updatePlayerStats();

            if (gameState.player.health <= 0) {
                this.endCombat(false, true);
            }
        }, 1000);
    }

    updatePlayerStats() {
        const healthPercent = (gameState.player.health / gameState.player.maxHealth) * 100;
        const manaPercent = (gameState.player.mana / gameState.player.maxMana) * 100;
        
        document.getElementById('health-bar').style.width = `${healthPercent}%`;
        document.getElementById('mana-bar').style.width = `${manaPercent}%`;
        document.getElementById('health-text').textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;
        document.getElementById('mana-text').textContent = `${gameState.player.mana}/${gameState.player.maxMana}`;
    }

    addCombatLog(message) {
        const log = document.getElementById('combat-log');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'log-message';
        messageDiv.textContent = message;
        log.appendChild(messageDiv);
        log.scrollTop = log.scrollHeight;
    }

    endCombat(victory, playerDied = false) {
        gameState.isInCombat = false;
        gameState.currentEnemy = null;

        if (playerDied) {
            this.addCombatLog(gameState.currentLanguage === 'en' ? 
                'You have been defeated...' : 
                'អ្នកត្រូវបានបរាជ័យ...');
            setTimeout(() => {
                gameState.player.health = gameState.player.maxHealth;
                this.updatePlayerStats();
                gameState.showScreen('game-world');
            }, 2000);
        } else if (victory) {
            const exp = Math.floor(Math.random() * 50) + 25;
            this.addCombatLog(gameState.currentLanguage === 'en' ? 
                `Victory! You gained ${exp} experience!` : 
                `ជ័យជម្នះ! អ្នកទទួលបាន ${exp} បទពិសោធន៍!`);
            
            setTimeout(() => {
                gameState.showScreen('game-world');
            }, 2000);
        } else {
            setTimeout(() => {
                gameState.showScreen('game-world');
            }, 1000);
        }
    }
}

// Game World System
class GameWorld {
    constructor() {
        this.setupMovement();
        this.setupMenuButtons();
        this.setupChatSystem();
        this.setupSkillBar();
        this.spawnRandomEnemies();
    }

    setupMovement() {
        let keys = {};
        
        document.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            this.handleMovement(keys);
        });

        document.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        // Touch controls for mobile
        let touchStartX, touchStartY;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 50) this.movePlayer('right');
                else if (deltaX < -50) this.movePlayer('left');
            } else {
                if (deltaY > 50) this.movePlayer('down');
                else if (deltaY < -50) this.movePlayer('up');
            }
        });
    }

    handleMovement(keys) {
        if (gameState.isInCombat) return;

        if (keys['w'] || keys['arrowup']) this.movePlayer('up');
        if (keys['s'] || keys['arrowdown']) this.movePlayer('down');
        if (keys['a'] || keys['arrowleft']) this.movePlayer('left');
        if (keys['d'] || keys['arrowright']) this.movePlayer('right');
    }

    movePlayer(direction) {
        const player = document.getElementById('player-character');
        const moveDistance = 20;
        
        switch (direction) {
            case 'up':
                gameState.player.position.y -= moveDistance;
                break;
            case 'down':
                gameState.player.position.y += moveDistance;
                break;
            case 'left':
                gameState.player.position.x -= moveDistance;
                break;
            case 'right':
                gameState.player.position.x += moveDistance;
                break;
        }

        // Update player position
        player.style.transform = `translate(calc(-50% + ${gameState.player.position.x}px), calc(-50% + ${gameState.player.position.y}px))`;

        // Check for random encounters
        if (Math.random() < 0.05) { // 5% chance per move
            this.triggerRandomEncounter();
        }
    }

    triggerRandomEncounter() {
        const enemies = [
            { name: 'Forest Bandit', sprite: '🥷', health: 80, maxHealth: 80 },
            { name: 'Ancient Spirit', sprite: '👻', health: 60, maxHealth: 60 },
            { name: 'Mountain Tiger', sprite: '🐅', health: 100, maxHealth: 100 },
            { name: 'Shadow Demon', sprite: '👹', health: 120, maxHealth: 120 }
        ];

        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        combatSystem.startCombat(randomEnemy);
    }

    setupMenuButtons() {
        document.getElementById('inventory-btn').addEventListener('click', () => {
            document.getElementById('inventory-panel').classList.toggle('hidden');
        });

        document.getElementById('close-inventory').addEventListener('click', () => {
            document.getElementById('inventory-panel').classList.add('hidden');
        });

        document.getElementById('quests-btn').addEventListener('click', () => {
            this.addChatMessage(gameState.currentLanguage === 'en' ? 
                'Quest system coming soon!' : 
                'ប្រព័ន្ធបេសកកម្មនឹងមកដល់ឆាប់ៗ!', 'system');
        });

        document.getElementById('map-btn').addEventListener('click', () => {
            this.addChatMessage(gameState.currentLanguage === 'en' ? 
                'World map coming soon!' : 
                'ផែនទីពិភពលោកនឹងមកដល់ឆាប់ៗ!', 'system');
        });

        document.getElementById('settings-game-btn').addEventListener('click', () => {
            this.addChatMessage(gameState.currentLanguage === 'en' ? 
                'Settings panel coming soon!' : 
                'បន្ទះការកំណត់នឹងមកដល់ឆាប់ៗ!', 'system');
        });
    }

    setupChatSystem() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send');

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (message) {
                this.addChatMessage(`${gameState.player.name}: ${message}`, 'player');
                chatInput.value = '';
                
                // Simple bot responses
                setTimeout(() => {
                    this.handleBotResponse(message);
                }, 1000);
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    addChatMessage(message, type = 'system') {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    handleBotResponse(playerMessage) {
        const responses = {
            en: [
                "The ancient spirits whisper in the wind...",
                "A merchant offers rare items in the distance.",
                "The path ahead seems treacherous.",
                "You sense powerful magic nearby.",
                "The dragon's roar echoes through the mountains."
            ],
            km: [
                "វិញ្ញាណបុរាណខ្សឹបក្នុងខ្យល់...",
                "ពាណិជ្ជករផ្តល់របស់វត្ថុកម្រនៅចម្ងាយ។",
                "ផ្លូវខាងមុខហាក់ដូចជាគ្រោះថ្នាក់។",
                "អ្នកដឹងពីវេទមន្តដ៏មានអំណាចនៅក្បែរ។",
                "សំឡេងគ្រហឹមរបស់នាគបន្លឺឡើងពេញភ្នំ។"
            ]
        };

        const langResponses = responses[gameState.currentLanguage];
        const randomResponse = langResponses[Math.floor(Math.random() * langResponses.length)];
        this.addChatMessage(randomResponse, 'system');
    }

    setupSkillBar() {
        document.querySelectorAll('.skill-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.useSkill(slot.dataset.skill);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (gameState.currentScreen !== 'game-world' || gameState.isInCombat) return;
            
            const skillMap = {
                '1': 'attack',
                '2': 'defend', 
                '3': 'heal',
                '4': 'special'
            };

            if (skillMap[e.key]) {
                this.useSkill(skillMap[e.key]);
            }
        });
    }

    useSkill(skillType) {
        const messages = {
            attack: {
                en: 'You practice your combat stance!',
                km: 'អ្នកហាត់ប្រាណការចម្បាំង!'
            },
            defend: {
                en: 'You strengthen your defenses!',
                km: 'អ្នកពង្រឹងការពារ!'
            },
            heal: {
                en: 'You meditate to restore energy!',
                km: 'អ្នកធ្វើសមាធិដើម្បីស្តារថាមពល!'
            },
            special: {
                en: 'You channel ancient power!',
                km: 'អ្នកបញ្ជូនអំណាចបុរាណ!'
            }
        };

        const message = messages[skillType][gameState.currentLanguage];
        this.addChatMessage(message, 'system');

        // Add visual effect
        const slot = document.querySelector(`[data-skill="${skillType}"]`);
        slot.style.transform = 'scale(1.2)';
        setTimeout(() => {
            slot.style.transform = 'scale(1)';
        }, 200);
    }

    spawnRandomEnemies() {
        setInterval(() => {
            if (!gameState.isInCombat && gameState.currentScreen === 'game-world' && Math.random() < 0.02) {
                this.triggerRandomEncounter();
            }
        }, 5000);
    }
}

// Game Initialization
class Game {
    constructor() {
        this.languageManager = new LanguageManager();
        this.characterCreation = new CharacterCreation();
        this.gameWorld = new GameWorld();
        this.combatSystem = new CombatSystem();
        
        this.setupMainMenu();
        this.startLoadingSequence();
    }

    setupMainMenu() {
        document.getElementById('new-game-btn').addEventListener('click', () => {
            gameState.showScreen('character-creation');
        });

        document.getElementById('continue-btn').addEventListener('click', () => {
            this.addChatMessage(gameState.currentLanguage === 'en' ? 
                'No saved game found!' : 
                'រកមិនឃើញហ្គេមដែលបានរក្សាទុក!', 'system');
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.addChatMessage(gameState.currentLanguage === 'en' ? 
                'Settings coming soon!' : 
                'ការកំណត់នឹងមកដល់ឆាប់ៗ!', 'system');
        });
    }

    startLoadingSequence() {
        // Simulate loading
        setTimeout(() => {
            gameState.showScreen('main-menu');
        }, 3000);
    }

    addChatMessage(message, type) {
        if (gameState.currentScreen === 'game-world') {
            this.gameWorld.addChatMessage(message, type);
        }
    }
}

// Global variables for cross-system access
let game, combatSystem;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    combatSystem = game.combatSystem;
    
    // Initialize language display
    gameState.updateLanguageDisplay();
    
    // Add some starting inventory items
    setTimeout(() => {
        if (gameState.currentScreen === 'game-world') {
            game.gameWorld.addChatMessage(
                gameState.currentLanguage === 'en' ? 
                'Use WASD or arrow keys to move. Press 1-4 to use skills!' : 
                'ប្រើ WASD ឬគ្រាប់ចុចព្រួញដើម្បីផ្លាស់ទី។ ចុច 1-4 ដើម្បីប្រើជំនាញ!', 
                'system'
            );
        }
    }, 1000);
});

// Auto-save system (localStorage)
setInterval(() => {
    if (gameState.player.name) {
        localStorage.setItem('celestialSwordSave', JSON.stringify({
            player: gameState.player,
            inventory: gameState.inventory,
            language: gameState.currentLanguage
        }));
    }
}, 30000); // Save every 30 seconds

// Load saved game on startup
window.addEventListener('load', () => {
    const savedGame = localStorage.getItem('celestialSwordSave');
    if (savedGame) {
        try {
            const data = JSON.parse(savedGame);
            gameState.player = { ...gameState.player, ...data.player };
            gameState.inventory = data.inventory || [];
            if (data.language) {
                gameState.setLanguage(data.language);
            }
        } catch (e) {
            console.log('Could not load saved game');
        }
    }
});