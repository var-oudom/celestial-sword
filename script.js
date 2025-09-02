// Game Website Management System
class GameWebsite {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.rankings = {
            level: [],
            pvp: [],
            guild: []
        };
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupLeaderboards();
        this.setupScrollEffects();
        this.loadRankings();
        this.checkAuthState();
    }

    // Navigation System
    setupNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Mobile menu toggle
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }

                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Close mobile menu
                navMenu.classList.remove('active');
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Modal Management
    setupModals() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const loginClose = document.getElementById('login-close');
        const registerClose = document.getElementById('register-close');
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');

        // Open modals
        loginBtn.addEventListener('click', () => this.openModal('login-modal'));
        registerBtn.addEventListener('click', () => this.openModal('register-modal'));

        // Close modals
        loginClose.addEventListener('click', () => this.closeModal('login-modal'));
        registerClose.addEventListener('click', () => this.closeModal('register-modal'));

        // Switch between modals
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('login-modal');
            this.openModal('register-modal');
        });

        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('register-modal');
            this.openModal('login-modal');
        });

        // Close modal on outside click
        [loginModal, registerModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal('login-modal');
                this.closeModal('register-modal');
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Authentication System
    setupForms() {
        this.setupLoginForm();
        this.setupRegisterForm();
        this.setupContactForm();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            if (!this.validateEmail(email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }

            if (password.length < 6) {
                this.showNotification('Password must be at least 6 characters', 'error');
                return;
            }

            try {
                this.setLoading(loginForm, true);
                
                // Simulate API call
                const result = await this.authenticateUser(email, password, rememberMe);
                
                if (result.success) {
                    this.currentUser = result.user;
                    this.isLoggedIn = true;
                    this.updateAuthUI();
                    this.closeModal('login-modal');
                    this.showNotification(`Welcome back, ${result.user.username}!`, 'success');
                    
                    // Save auth state
                    if (rememberMe) {
                        localStorage.setItem('authToken', result.token);
                    } else {
                        sessionStorage.setItem('authToken', result.token);
                    }
                } else {
                    this.showNotification(result.message, 'error');
                }
            } catch (error) {
                this.showNotification('Login failed. Please try again.', 'error');
            } finally {
                this.setLoading(loginForm, false);
            }
        });
    }

    setupRegisterForm() {
        const registerForm = document.getElementById('register-form');
        const passwordInput = document.getElementById('register-password');
        const confirmInput = document.getElementById('register-confirm');
        const usernameInput = document.getElementById('register-username');

        // Real-time password strength checking
        passwordInput.addEventListener('input', () => {
            this.updatePasswordStrength(passwordInput.value);
        });

        // Real-time password confirmation
        confirmInput.addEventListener('input', () => {
            this.validatePasswordMatch();
        });

        // Username availability checking
        usernameInput.addEventListener('blur', () => {
            this.checkUsernameAvailability(usernameInput.value);
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            const server = document.getElementById('register-server').value;
            const agreeTerms = document.getElementById('agree-terms').checked;

            // Validation
            if (!this.validateRegistration(username, email, password, confirmPassword, server, agreeTerms)) {
                return;
            }

            try {
                this.setLoading(registerForm, true);
                
                // Simulate API call
                const result = await this.registerUser({
                    username,
                    email,
                    password,
                    server
                });
                
                if (result.success) {
                    this.closeModal('register-modal');
                    this.showNotification('Account created successfully! Please check your email to verify your account.', 'success');
                    
                    // Auto-open login modal
                    setTimeout(() => {
                        this.openModal('login-modal');
                        document.getElementById('login-email').value = email;
                    }, 2000);
                } else {
                    this.showNotification(result.message, 'error');
                }
            } catch (error) {
                this.showNotification('Registration failed. Please try again.', 'error');
            } finally {
                this.setLoading(registerForm, false);
            }
        });
    }

    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('support-email').value;
            const subject = document.getElementById('support-subject').value;
            const message = document.getElementById('support-message').value;

            if (!this.validateEmail(email)) {
                this.showNotification('Please enter a valid email address', 'error');
                return;
            }

            if (!subject) {
                this.showNotification('Please select a subject', 'error');
                return;
            }

            if (message.length < 10) {
                this.showNotification('Message must be at least 10 characters', 'error');
                return;
            }

            try {
                this.setLoading(contactForm, true);
                
                // Simulate API call
                await this.submitSupportTicket({ email, subject, message });
                
                this.showNotification('Support ticket submitted successfully! We\'ll get back to you within 24 hours.', 'success');
                contactForm.reset();
            } catch (error) {
                this.showNotification('Failed to submit ticket. Please try again.', 'error');
            } finally {
                this.setLoading(contactForm, false);
            }
        });
    }

    // Authentication API Simulation
    async authenticateUser(email, password, rememberMe) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock authentication logic
        const mockUsers = [
            { id: 1, username: 'DragonSlayer', email: 'dragon@example.com', password: 'password123', level: 85, server: 'Dragon Realm' },
            { id: 2, username: 'PhoenixMaster', email: 'phoenix@example.com', password: 'password123', level: 92, server: 'Phoenix Valley' }
        ];

        const user = mockUsers.find(u => 
            (u.email === email || u.username === email) && u.password === password
        );

        if (user) {
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    level: user.level,
                    server: user.server
                },
                token: 'mock-jwt-token-' + Date.now()
            };
        } else {
            return {
                success: false,
                message: 'Invalid email/username or password'
            };
        }
    }

    async registerUser(userData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock registration logic
        if (userData.username === 'admin' || userData.email === 'admin@example.com') {
            return {
                success: false,
                message: 'Username or email already exists'
            };
        }

        return {
            success: true,
            message: 'Account created successfully'
        };
    }

    async submitSupportTicket(ticketData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock ticket submission
        console.log('Support ticket submitted:', ticketData);
        return { success: true };
    }

    // Validation Functions
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateRegistration(username, email, password, confirmPassword, server, agreeTerms) {
        if (username.length < 3 || username.length > 20) {
            this.showNotification('Username must be 3-20 characters', 'error');
            return false;
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            this.showNotification('Username can only contain letters and numbers', 'error');
            return false;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        if (password.length < 8) {
            this.showNotification('Password must be at least 8 characters', 'error');
            return false;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return false;
        }

        if (!server) {
            this.showNotification('Please select a server', 'error');
            return false;
        }

        if (!agreeTerms) {
            this.showNotification('You must agree to the Terms of Service', 'error');
            return false;
        }

        return true;
    }

    updatePasswordStrength(password) {
        const strengthIndicator = document.getElementById('password-strength');
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        strengthIndicator.className = 'password-strength';
        
        if (strength < 3) {
            strengthIndicator.classList.add('weak');
        } else if (strength < 5) {
            strengthIndicator.classList.add('medium');
        } else {
            strengthIndicator.classList.add('strong');
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const confirmInput = document.getElementById('register-confirm');

        if (confirm && password !== confirm) {
            confirmInput.style.borderColor = '#dc2626';
        } else {
            confirmInput.style.borderColor = '';
        }
    }

    async checkUsernameAvailability(username) {
        if (username.length < 3) return;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const unavailableUsernames = ['admin', 'moderator', 'support', 'dragonslayer'];
        const isAvailable = !unavailableUsernames.includes(username.toLowerCase());
        
        const usernameInput = document.getElementById('register-username');
        if (isAvailable) {
            usernameInput.style.borderColor = '#10b981';
        } else {
            usernameInput.style.borderColor = '#dc2626';
            this.showNotification('Username is not available', 'warning');
        }
    }

    // Leaderboard System
    setupLeaderboards() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabType = btn.dataset.tab;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show corresponding table
                document.querySelectorAll('.leaderboard-table').forEach(table => {
                    table.classList.add('hidden');
                });
                document.getElementById(`${tabType}-table`).classList.remove('hidden');
                
                // Load rankings for this tab
                this.displayRankings(tabType);
            });
        });

        // Setup FAQ toggles
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                faqItem.classList.toggle('active');
            });
        });
    }

    loadRankings() {
        // Mock ranking data
        this.rankings.level = [
            { rank: 1, name: 'DragonEmperor', level: 99, class: 'Warrior', server: 'Dragon Realm', avatar: '👑' },
            { rank: 2, name: 'PhoenixMage', level: 98, class: 'Mage', server: 'Phoenix Valley', avatar: '🔥' },
            { rank: 3, name: 'TigerAssassin', level: 97, class: 'Assassin', server: 'Tiger Mountain', avatar: '🐅' },
            { rank: 4, name: 'JadeMonk', level: 96, class: 'Monk', server: 'Jade Empire', avatar: '🧘' },
            { rank: 5, name: 'SwordSaint', level: 95, class: 'Swordsman', server: 'Dragon Realm', avatar: '⚔️' }
        ];

        this.rankings.pvp = [
            { rank: 1, name: 'PvPKing', rating: 2850, wins: 1247, server: 'Dragon Realm', avatar: '👑' },
            { rank: 2, name: 'BattleMaster', rating: 2798, wins: 1156, server: 'Phoenix Valley', avatar: '⚔️' },
            { rank: 3, name: 'WarLord', rating: 2745, wins: 1089, server: 'Tiger Mountain', avatar: '🛡️' },
            { rank: 4, name: 'Gladiator', rating: 2692, wins: 987, server: 'Jade Empire', avatar: '🏆' },
            { rank: 5, name: 'Champion', rating: 2634, wins: 923, server: 'Dragon Realm', avatar: '🥇' }
        ];

        this.rankings.guild = [
            { rank: 1, name: 'Dragon Lords', members: 150, power: 98500, server: 'Dragon Realm', avatar: '🐉' },
            { rank: 2, name: 'Phoenix Rising', members: 142, power: 95200, server: 'Phoenix Valley', avatar: '🔥' },
            { rank: 3, name: 'Tiger Clan', members: 138, power: 92800, server: 'Tiger Mountain', avatar: '🐅' },
            { rank: 4, name: 'Jade Warriors', members: 135, power: 89600, server: 'Jade Empire', avatar: '💎' },
            { rank: 5, name: 'Celestial Order', members: 128, power: 87300, server: 'Dragon Realm', avatar: '⭐' }
        ];

        // Display initial rankings
        this.displayRankings('level');
    }

    displayRankings(type) {
        const tableBody = document.getElementById(`${type}-rankings`);
        const rankings = this.rankings[type];
        
        tableBody.innerHTML = '';
        
        rankings.forEach(item => {
            const row = document.createElement('div');
            row.className = 'rank-row';
            
            if (type === 'level') {
                row.innerHTML = `
                    <span class="rank-number ${item.rank <= 3 ? 'top-3' : ''}">#${item.rank}</span>
                    <div class="player-info">
                        <div class="player-avatar">${item.avatar}</div>
                        <span class="player-name">${item.name}</span>
                    </div>
                    <span>${item.level}</span>
                    <span>${item.class}</span>
                    <span>${item.server}</span>
                `;
            } else if (type === 'pvp') {
                row.innerHTML = `
                    <span class="rank-number ${item.rank <= 3 ? 'top-3' : ''}">#${item.rank}</span>
                    <div class="player-info">
                        <div class="player-avatar">${item.avatar}</div>
                        <span class="player-name">${item.name}</span>
                    </div>
                    <span>${item.rating}</span>
                    <span>${item.wins}</span>
                    <span>${item.server}</span>
                `;
            } else if (type === 'guild') {
                row.innerHTML = `
                    <span class="rank-number ${item.rank <= 3 ? 'top-3' : ''}">#${item.rank}</span>
                    <div class="player-info">
                        <div class="player-avatar">${item.avatar}</div>
                        <span class="player-name">${item.name}</span>
                    </div>
                    <span>${item.members}</span>
                    <span>${item.power.toLocaleString()}</span>
                    <span>${item.server}</span>
                `;
            }
            
            tableBody.appendChild(row);
        });
    }

    // UI Helper Functions
    setLoading(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
            const submitBtn = element.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Loading...';
            }
        } else {
            element.classList.remove('loading');
            const submitBtn = element.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                // Restore original text based on form type
                if (element.id === 'login-form') {
                    submitBtn.textContent = 'Login';
                } else if (element.id === 'register-form') {
                    submitBtn.textContent = 'Create Account';
                } else if (element.id === 'contact-form') {
                    submitBtn.textContent = 'Send Message';
                }
            }
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'notificationSlideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (this.isLoggedIn && this.currentUser) {
            loginBtn.textContent = this.currentUser.username;
            loginBtn.onclick = () => this.showUserMenu();
            registerBtn.style.display = 'none';
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => this.openModal('login-modal');
            registerBtn.style.display = 'block';
        }
    }

    showUserMenu() {
        // Create user dropdown menu
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-menu-content">
                <div class="user-info">
                    <div class="user-avatar">👤</div>
                    <div>
                        <div class="user-name">${this.currentUser.username}</div>
                        <div class="user-level">Level ${this.currentUser.level}</div>
                    </div>
                </div>
                <hr>
                <a href="#" class="menu-item">Profile</a>
                <a href="#" class="menu-item">Settings</a>
                <a href="#" class="menu-item">Game Client</a>
                <hr>
                <a href="#" class="menu-item logout" id="logout-btn">Logout</a>
            </div>
        `;
        
        document.body.appendChild(userMenu);
        
        // Position menu
        const loginBtn = document.getElementById('login-btn');
        const rect = loginBtn.getBoundingClientRect();
        userMenu.style.position = 'fixed';
        userMenu.style.top = `${rect.bottom + 10}px`;
        userMenu.style.right = '20px';
        
        // Handle logout
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
            document.body.removeChild(userMenu);
        });
        
        // Close menu on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!userMenu.contains(e.target) && e.target !== loginBtn) {
                    document.body.removeChild(userMenu);
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'success');
    }

    checkAuthState() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
            // Mock user data for demo
            this.currentUser = {
                id: 1,
                username: 'DragonSlayer',
                email: 'dragon@example.com',
                level: 85,
                server: 'Dragon Realm'
            };
            this.isLoggedIn = true;
            this.updateAuthUI();
        }
    }

    // Scroll Effects
    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.feature-card, .news-card, .download-btn').forEach(el => {
            observer.observe(el);
        });
    }

    // Download Handlers
    setupDownloadHandlers() {
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.querySelector('.download-title').textContent;
                this.handleDownload(platform);
            });
        });
    }

    handleDownload(platform) {
        if (!this.isLoggedIn) {
            this.showNotification('Please login to download the game client', 'warning');
            this.openModal('login-modal');
            return;
        }

        this.showNotification(`Starting download for ${platform}...`, 'success');
        
        // Simulate download start
        setTimeout(() => {
            this.showNotification('Download started! Check your downloads folder.', 'info');
        }, 1000);
    }
}

// Additional CSS for user menu (injected via JavaScript)
const userMenuStyles = `
.user-menu {
    position: fixed;
    z-index: 3000;
    animation: fadeInDown 0.3s ease;
}

.user-menu-content {
    background: var(--card-bg);
    border: 2px solid var(--primary-gold);
    border-radius: 12px;
    padding: var(--spacing-md);
    min-width: 200px;
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-lg);
}

.user-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
}

.user-avatar {
    width: 40px;
    height: 40px;
    background: var(--primary-gold);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--dark-bg);
}

.user-name {
    font-weight: 600;
    color: var(--text-primary);
}

.user-level {
    font-size: 0.9rem;
    color: var(--text-muted);
}

.user-menu hr {
    border: none;
    height: 1px;
    background: var(--border-color);
    margin: var(--spacing-sm) 0;
}

.menu-item {
    display: block;
    padding: var(--spacing-xs) 0;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.3s ease;
}

.menu-item:hover {
    color: var(--primary-gold);
}

.menu-item.logout {
    color: #dc2626;
}

.menu-item.logout:hover {
    color: #ef4444;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes notificationSlideOut {
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = userMenuStyles;
document.head.appendChild(styleSheet);

// Initialize the website
let gameWebsite;

document.addEventListener('DOMContentLoaded', () => {
    gameWebsite = new GameWebsite();
    
    // Setup download handlers after initialization
    gameWebsite.setupDownloadHandlers();
    
    // Add some demo interactions
    setTimeout(() => {
        gameWebsite.showNotification('Welcome to Celestial Sword! Create an account to start your journey.', 'info');
    }, 2000);
});

// Additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Hero buttons functionality
    document.querySelector('.btn-hero-primary').addEventListener('click', () => {
        if (gameWebsite.isLoggedIn) {
            gameWebsite.showNotification('Launching game client...', 'success');
        } else {
            gameWebsite.showNotification('Please login to play the game', 'warning');
            gameWebsite.openModal('login-modal');
        }
    });

    document.querySelector('.btn-hero-secondary').addEventListener('click', () => {
        gameWebsite.showNotification('Game trailer coming soon!', 'info');
    });

    // Add particle effect to hero section
    createParticleEffect();
});

// Particle Effect for Hero Section
function createParticleEffect() {
    const hero = document.querySelector('.hero');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--primary-gold);
            border-radius: 50%;
            opacity: 0.6;
            animation: float ${Math.random() * 10 + 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            z-index: 1;
        `;
        hero.appendChild(particle);
    }
}

// Add floating animation for particles
const floatKeyframes = `
@keyframes float {
    0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 0.6;
    }
    90% {
        opacity: 0.6;
    }
    100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
    }
}
`;

const floatStyleSheet = document.createElement('style');
floatStyleSheet.textContent = floatKeyframes;
document.head.appendChild(floatStyleSheet);

// Performance optimization
window.addEventListener('load', () => {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + L for login
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        if (!gameWebsite.isLoggedIn) {
            gameWebsite.openModal('login-modal');
        }
    }
    
    // Ctrl/Cmd + R for register
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        if (!gameWebsite.isLoggedIn) {
            gameWebsite.openModal('register-modal');
        }
    }
});

// Error handling for missing video
document.querySelector('.hero-video').addEventListener('error', function() {
    this.style.display = 'none';
    const heroBackground = document.querySelector('.hero-background');
    heroBackground.style.background = 'url("https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg") center/cover';
});