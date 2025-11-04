class Dashboard {
    constructor() {
        this.currentUser = null;
        this.transactions = JSON.parse(localStorage.getItem('chase_transactions')) || [];
    }

    init(user) {
        this.currentUser = user;
        this.renderDashboard();
        this.bindEvents();
    }

    renderDashboard() {
        const dashboardContainer = document.getElementById('dashboardContainer');
        
        dashboardContainer.innerHTML = `
            <header class="dashboard-header">
                <div class="header-content">
                    <div class="user-welcome">
                        <h1>Good ${this.getTimeOfDay()}, ${this.currentUser.fullName}</h1>
                        <p>${Utils.formatDate(new Date())}</p>
                    </div>
                    <div class="header-actions">
                        <button class="header-btn" id="refreshBtn">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                        <button class="header-btn" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main class="dashboard-main">
                <div class="dashboard-content">
                    <!-- Account Summary -->
                    <div class="account-summary">
                        <div class="account-header">
                            <div>
                                <h3>CHASE CHECKING ACCOUNT</h3>
                                <p>Available Balance</p>
                            </div>
                            <div class="account-balance" id="mainBalance">
                                ${Utils.formatCurrency(this.getTotalBalance())}
                            </div>
                        </div>
                        <div class="account-actions">
                            <button class="action-btn" id="sendMoneyBtn">
                                <i class="fas fa-paper-plane"></i> Send Money
                            </button>
                            <button class="action-btn" id="payBillsBtn">
                                <i class="fas fa-file-invoice-dollar"></i> Pay Bills
                            </button>
                            <button class="action-btn" id="transferBtn">
                                <i class="fas fa-exchange-alt"></i> Transfer
                            </button>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <h3>Quick Actions</h3>
                        <div class="actions-grid">
                            <button class="quick-action" data-action="deposit">
                                <i class="fas fa-money-bill-wave"></i>
                                <span>Deposit</span>
                            </button>
                            <button class="quick-action" data-action="withdraw">
                                <i class="fas fa-wallet"></i>
                                <span>Withdraw</span>
                            </button>
                            <button class="quick-action" data-action="statements">
                                <i class="fas fa-file-pdf"></i>
                                <span>Statements</span>
                            </button>
                            <button class="quick-action" data-action="cards">
                                <i class="fas fa-credit-card"></i>
                                <span>Cards</span>
                            </button>
                        </div>
                    </div>

                    <!-- Transactions -->
                    <div class="transactions-section">
                        <div class="section-header">
                            <h3>Recent Transactions</h3>
                            <a href="#" class="view-all">View All</a>
                        </div>
                        
                        <div class="transaction-filters">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="income">Income</button>
                            <button class="filter-btn" data-filter="expense">Expenses</button>
                            <button class="filter-btn" data-filter="transfer">Transfers</button>
                        </div>

                        <div class="transactions-list" id="transactionsList">
                            <!-- Transactions will be loaded here -->
                        </div>
                    </div>
                </div>

                <div class="dashboard-sidebar">
                    <!-- Accounts -->
                    <div class="sidebar-card">
                        <div class="card-header">
                            <h3>Your Accounts</h3>
                        </div>
                        <div id="accountsList">
                            <!-- Accounts will be loaded here -->
                        </div>
                    </div>

                    <!-- Upcoming Bills -->
                    <div class="sidebar-card">
                        <div class="card-header">
                            <h3>Upcoming Bills</h3>
                            <a href="#" class="view-all">View All</a>
                        </div>
                        <div id="billsList">
                            <!-- Bills will be loaded here -->
                        </div>
                    </div>

                    <!-- Special Offers -->
                    <div class="sidebar-card">
                        <div class="card-header">
                            <h3>Special Offers</h3>
                        </div>
                        <div id="offersList">
                            <!-- Offers will be loaded here -->
                        </div>
                    </div>
                </div>
            </main>
        `;

        this.loadAccounts();
        this.loadTransactions();
        this.loadBills();
        this.loadOffers();
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('logoutBtn').addEventListener('click', () => {
            window.auth.logout();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // Action buttons
        document.getElementById('sendMoneyBtn').addEventListener('click', () => {
            this.openTransferModal();
        });

        document.getElementById('transferBtn').addEventListener('click', () => {
            this.openTransferModal();
        });

        document.getElementById('payBillsBtn').addEventListener('click', () => {
            this.showNotification('Bill pay functionality would be implemented here', 'info');
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Transaction filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.filterTransactions(e.currentTarget.dataset.filter);
            });
        });
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    getTotalBalance() {
        return this.currentUser.accounts.reduce((total, account) => total + account.balance, 0);
    }

    loadAccounts() {
        const accountsList = document.getElementById('accountsList');
        accountsList.innerHTML = this.currentUser.accounts.map(account => `
            <div class="account-item" style="padding: 15px 0; border-bottom: 1px solid #eee;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #333;">${account.type} ACCOUNT</h4>
                        <p style="margin: 0; color: #666; font-size: 14px;">${account.number}</p>
                    </div>
                    <div style="font-weight: 600; color: #1170ac;">
                        ${Utils.formatCurrency(account.balance)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadTransactions() {
        if (this.transactions.length === 0) {
            this.generateTransactionHistory();
        }

        const userTransactions = this.transactions.filter(t => t.userId === this.currentUser.id);
        this.renderTransactions(userTransactions);
    }

    generateTransactionHistory() {
        const transactions = [];
        const types = ['transfer', 'payment', 'deposit', 'withdrawal', 'purchase'];
        const categories = ['Shopping', 'Food & Dining', 'Entertainment', 'Utilities', 'Salary', 'Transfer'];
        const merchants = ['Amazon', 'Starbucks', 'Netflix', 'Walmart', 'Apple', 'Google', 'Target', 'Uber'];
        
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 3); // 3 years ago

        for (let i = 0; i < 500; i++) { // Generate 500 transactions
            const date = new Date(startDate.getTime() + Math.random() * (3 * 365 * 24 * 60 * 60 * 1000));
            const type = types[Math.floor(Math.random() * types.length)];
            const amount = this.generateTransactionAmount(type);
            const isNegative = amount < 0;
            const absAmount = Math.abs(amount);

            transactions.push({
                id: Utils.generateId(),
                userId: this.currentUser.id,
                type,
                category: categories[Math.floor(Math.random() * categories.length)],
                merchant: merchants[Math.floor(Math.random() * merchants.length)],
                amount: isNegative ? -absAmount : absAmount,
                date: date.toISOString(),
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${merchants[Math.floor(Math.random() * merchants.length)]}`,
                status: 'completed'
            });
        }

        // Sort by date
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.transactions = transactions;
        localStorage.setItem('chase_transactions', JSON.stringify(transactions));
    }

    generateTransactionAmount(type) {
        switch(type) {
            case 'salary':
                return Math.random() * 5000 + 2000; // $2000-$7000
            case 'transfer':
                return Math.random() > 0.5 ? Math.random() * 2000 + 100 : -(Math.random() * 2000 + 100);
            case 'purchase':
                return -(Math.random() * 200 + 10); // $10-$210
            case 'payment':
                return -(Math.random() * 1000 + 50); // $50-$1050
            default:
                return Math.random() > 0.5 ? Math.random() * 1000 : -(Math.random() * 1000);
        }
    }

    renderTransactions(transactions) {
        const transactionsList = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            transactionsList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No transactions found</p>';
            return;
        }

        const recentTransactions = transactions.slice(0, 50); // Show last 50 transactions

        transactionsList.innerHTML = recentTransactions.map(transaction => {
            const isNegative = transaction.amount < 0;
            const icon = this.getTransactionIcon(transaction.type);
            const color = isNegative ? 'negative' : 'positive';

            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-icon" style="background: ${isNegative ? '#ffe6e6' : '#e6f7ff'};">
                            <i class="fas fa-${icon}" style="color: ${isNegative ? '#dc3545' : '#28a745'};"></i>
                        </div>
                        <div class="transaction-details">
                            <h4>${transaction.merchant}</h4>
                            <p>${Utils.formatDate(transaction.date)} • ${transaction.category}</p>
                        </div>
                    </div>
                    <div class="transaction-amount ${color}">
                        ${isNegative ? '-' : '+'}${Utils.formatCurrency(Math.abs(transaction.amount))}
                    </div>
                </div>
            `;
        }).join('');
    }

    getTransactionIcon(type) {
        const icons = {
            transfer: 'exchange-alt',
            payment: 'file-invoice-dollar',
            deposit: 'money-bill-wave',
            withdrawal: 'wallet',
            purchase: 'shopping-bag',
            salary: 'briefcase'
        };
        return icons[type] || 'receipt';
    }

    filterTransactions(filter) {
        const userTransactions = this.transactions.filter(t => t.userId === this.currentUser.id);
        let filtered = userTransactions;

        if (filter !== 'all') {
            filtered = userTransactions.filter(transaction => {
                if (filter === 'income') return transaction.amount > 0;
                if (filter === 'expense') return transaction.amount < 0;
                if (filter === 'transfer') return transaction.type === 'transfer';
                return true;
            });
        }

        this.renderTransactions(filtered);
    }

    loadBills() {
        const bills = [
            { name: 'Electricity Bill', dueDate: '2024-01-15', amount: 125.75 },
            { name: 'Internet Service', dueDate: '2024-01-20', amount: 89.99 },
            { name: 'Car Insurance', dueDate: '2024-01-25', amount: 245.50 }
        ];

        const billsList = document.getElementById('billsList');
        billsList.innerHTML = bills.map(bill => `
            <div class="bill-item">
                <div class="bill-details">
                    <h4>${bill.name}</h4>
                    <p>Due ${Utils.formatDate(bill.dueDate)}</p>
                </div>
                <div class="bill-amount">${Utils.formatCurrency(bill.amount)}</div>
            </div>
        `).join('');
    }

    loadOffers() {
        const offers = [
            { title: 'Premium Credit Card', description: 'Earn 3% cash back', button: 'Apply' },
            { title: 'Auto Loan', description: 'Low rates starting at 3.99%', button: 'Learn More' },
            { title: 'Wealth Management', description: 'Expert financial advice', button: 'Explore' }
        ];

        const offersList = document.getElementById('offersList');
        offersList.innerHTML = offers.map(offer => `
            <div class="offer-item">
                <div class="offer-details">
                    <h4>${offer.title}</h4>
                    <p>${offer.description}</p>
                </div>
                <button class="offer-btn">${offer.button}</button>
            </div>
        `).join('');
    }

    handleQuickAction(action) {
        const actions = {
            deposit: () => this.showNotification('Deposit functionality would be implemented here', 'info'),
            withdraw: () => this.showNotification('Withdrawal functionality would be implemented here', 'info'),
            statements: () => this.showNotification('Statement download would be implemented here', 'info'),
            cards: () => this.showNotification('Card management would be implemented here', 'info')
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    openTransferModal() {
        // This would be implemented in transactions.js
        if (window.transactions) {
            window.transactions.openTransferModal();
        }
    }

    refreshData() {
        Utils.showLoading();
        setTimeout(() => {
            this.loadTransactions();
            Utils.hideLoading();
            this.showNotification('Data refreshed successfully', 'success');
        }, 1000);
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

// Initialize dashboard
window.dashboard = new Dashboard();