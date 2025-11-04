class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('chase_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('chase_current_user')) || null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Form switching
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('signup');
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });
    }

    showForm(formType) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        if (formType === 'login') {
            document.getElementById('loginForm').classList.add('active');
        } else {
            document.getElementById('signupForm').classList.add('active');
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const useToken = document.getElementById('useToken').checked;

        if (!username || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        Utils.showLoading();

        // Simulate API call
        setTimeout(() => {
            const user = this.authenticateUser(username, password);
            if (user) {
                this.currentUser = user;
                localStorage.setItem('chase_current_user', JSON.stringify(user));
                this.showNotification('Login successful!', 'success');
                this.sendEmailNotification(user.email, 'login');
                this.showDashboard();
            } else {
                this.showNotification('Invalid username or password', 'error');
            }
            Utils.hideLoading();
        }, 1500);
    }

    handleSignup() {
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!fullName || !email || !username || !password || !confirmPassword) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (!Utils.validatePassword(password)) {
            this.showNotification('Password must be at least 8 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showNotification('Username already exists', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showNotification('Email already registered', 'error');
            return;
        }

        Utils.showLoading();

        // Simulate API call
        setTimeout(() => {
            const newUser = {
                id: Utils.generateId(),
                fullName,
                email,
                username,
                password: this.hashPassword(password),
                accounts: this.createInitialAccounts(),
                createdAt: new Date().toISOString()
            };

            this.users.push(newUser);
            localStorage.setItem('chase_users', JSON.stringify(this.users));

            this.currentUser = newUser;
            localStorage.setItem('chase_current_user', JSON.stringify(newUser));

            this.showNotification('Account created successfully!', 'success');
            this.sendEmailNotification(email, 'signup');
            this.showDashboard();
            Utils.hideLoading();
        }, 2000);
    }

    authenticateUser(username, password) {
        const user = this.users.find(u => 
            u.username === username && 
            u.password === this.hashPassword(password)
        );
        return user;
    }

    hashPassword(password) {
        // Simple hash for demo purposes - in real app, use proper hashing
        return btoa(password);
    }

    createInitialAccounts() {
        return [
            {
                id: Utils.generateId(),
                type: 'CHECKING',
                number: '****4582',
                balance: 2500.00,
                available: 2500.00
            },
            {
                id: Utils.generateId(),
                type: 'SAVINGS',
                number: '****7821',
                balance: 15000.00,
                available: 15000.00
            }
        ];
    }

    checkAuthStatus() {
        if (this.currentUser) {
            this.showDashboard();
        }
    }

    showDashboard() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'block';
        
        // Initialize dashboard
        if (window.dashboard) {
            window.dashboard.init(this.currentUser);
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('chase_current_user');
        document.getElementById('dashboardContainer').style.display = 'none';
        document.getElementById('authContainer').style.display = 'flex';
        this.showForm('login');
        this.showNotification('Logged out successfully', 'success');
    }

    sendEmailNotification(email, type) {
        const notifications = JSON.parse(localStorage.getItem('chase_notifications')) || [];
        
        const notification = {
            id: Utils.generateId(),
            email,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };

        notifications.push(notification);
        localStorage.setItem('chase_notifications', JSON.stringify(notifications));

        console.log(`Email notification sent to ${email} for ${type}`);
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});