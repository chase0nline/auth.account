class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('chase_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('chase_current_user')) || null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.createSignupModal();
    }

    bindEvents() {
        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Show password toggle
        document.getElementById('togglePassword').addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Forgot password
        document.getElementById('forgotPassword').addEventListener('click', (e) => {
            e.preventDefault();
            this.showNotification('Password reset functionality would be implemented here', 'info');
        });

        // Sign up link
        document.getElementById('signUp').addEventListener('click', (e) => {
            e.preventDefault();
            this.openSignupModal();
        });
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('togglePassword');
        const icon = toggleButton.querySelector('i');
        const text = toggleButton.querySelector('span');
        
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            text.textContent = 'Hide';
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            text.textContent = 'Show';
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

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

    authenticateUser(username, password) {
        const user = this.users.find(u => 
            u.username === username && 
            u.password === this.hashPassword(password)
        );
        return user;
    }

    createSignupModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'signupModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create Your Account</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="signupForm">
                    <div class="form-group">
                        <label for="fullName">Full Name</label>
                        <input type="text" id="fullName" placeholder="Enter your full name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label for="newUsername">Username</label>
                        <input type="text" id="newUsername" placeholder="Choose a username" required>
                    </div>
                    <div class="form-group">
                        <label for="newPassword">Password</label>
                        <input type="password" id="newPassword" placeholder="Create a password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm your password" required>
                    </div>
                </form>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" id="cancelSignup">Cancel</button>
                    <button class="modal-btn confirm-btn" id="confirmSignup">Create Account</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindSignupModalEvents();
    }

    bindSignupModalEvents() {
        const modal = document.getElementById('signupModal');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.getElementById('cancelSignup');
        const confirmBtn = modal.getElementById('confirmSignup');

        closeBtn.addEventListener('click', () => this.closeSignupModal());
        cancelBtn.addEventListener('click', () => this.closeSignupModal());
        confirmBtn.addEventListener('click', () => this.handleSignup());
    }

    openSignupModal() {
        document.getElementById('signupModal').style.display = 'flex';
    }

    closeSignupModal() {
        document.getElementById('signupModal').style.display = 'none';
        document.getElementById('signupForm').reset();
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

            this.closeSignupModal();
            this.showNotification('Account created successfully!', 'success');
            this.sendEmailNotification(email, 'signup');
            this.showDashboard();
            Utils.hideLoading();
        }, 2000);
    }

    hashPassword(password) {
        // Simple hash for demo purposes
        return btoa(password);
    }

    createInitialAccounts() {
        return [
            {
                id: Utils.generateId(),
                type: 'CHECKING',
                number: '****4582',
                balance: 803543.23,
                available: 803543.23
            },
            {
                id: Utils.generateId(),
                type: 'SAVINGS',
                number: '****7821',
                balance: 150000.00,
                available: 150000.00
            }
        ];
    }

    checkAuthStatus() {
        if (this.currentUser) {
            this.showDashboard();
        }
    }

    showDashboard() {
        document.querySelector('.container header').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // Initialize dashboard
        if (window.dashboard) {
            window.dashboard.init(this.currentUser);
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('chase_current_user');
        document.getElementById('dashboard').style.display = 'none';
        document.querySelector('.container header').style.display = 'flex';
        document.getElementById('loginForm').reset();
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
