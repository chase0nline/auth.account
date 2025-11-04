class Dashboard {
    constructor() {
        this.currentUser = null;
        this.transactions = JSON.parse(localStorage.getItem('chase_transactions')) || [];
    }

    init(user) {
        this.currentUser = user;
        this.updateDashboardInfo();
        this.bindEvents();
        this.loadTransactions();
    }

    updateDashboardInfo() {
        // Update user name
        document.getElementById('userName').textContent = this.currentUser.fullName;
        
        // Update date
        const currentDate = new Date();
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', options);
        
        // Update balance
        const totalBalance = this.currentUser.accounts.reduce((total, account) => total + account.balance, 0);
        document.getElementById('balance').textContent = Utils.formatCurrency(totalBalance);
    }

    bindEvents() {
        // Send money button
        document.getElementById('sendMoneyBtn').addEventListener('click', () => {
            if (window.transactions) {
                window.transactions.openTransferModal();
            }
        });

        // Pay bills button
        document.getElementById('payBillsBtn').addEventListener('click', () => {
            this.showNotification('Bill pay functionality would be implemented here', 'info');
        });

        // Open account button
        document.getElementById('openAccountBtn').addEventListener('click', () => {
            this.showNotification('Account opening functionality would be implemented here', 'info');
        });

        // Feature buttons
        document.getElementById('spendingSummaryBtn').addEventListener('click', () => {
            this.showNotification('Spending summary would be implemented here', 'info');
        });

        document.getElementById('creditJourneyBtn').addEventListener('click', () => {
            this.showNotification('Credit journey would be implemented here', 'info');
        });
    }

    loadTransactions() {
        if (this.transactions.length === 0) {
            this.generateTransactionHistory();
        }
    }

    generateTransactionHistory() {
        const transactions = [];
        const types = ['transfer', 'payment', 'deposit', 'withdrawal', 'purchase'];
        const categories = ['Shopping', 'Food & Dining', 'Entertainment', 'Utilities', 'Salary', 'Transfer'];
        const merchants = ['Amazon', 'Starbucks', 'Netflix', 'Walmart', 'Apple', 'Google', 'Target', 'Uber'];
        
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 3);

        for (let i = 0; i < 500; i++) {
            const date = new Date(startDate.getTime() + Math.random() * (3 * 365 * 24 * 60 * 60 * 1000));
            const type = types[Math.floor(Math.random() * types.length)];
            const amount = this.generateTransactionAmount(type);
            const isNegative = amount < 0;

            transactions.push({
                id: Utils.generateId(),
                userId: this.currentUser.id,
                type,
                category: categories[Math.floor(Math.random() * categories.length)],
                merchant: merchants[Math.floor(Math.random() * merchants.length)],
                amount: amount,
                date: date.toISOString(),
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${merchants[Math.floor(Math.random() * merchants.length)]}`,
                status: 'completed'
            });
        }

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.transactions = transactions;
        localStorage.setItem('chase_transactions', JSON.stringify(transactions));
    }

    generateTransactionAmount(type) {
        switch(type) {
            case 'salary':
                return Math.random() * 5000 + 2000;
            case 'transfer':
                return Math.random() > 0.5 ? Math.random() * 2000 + 100 : -(Math.random() * 2000 + 100);
            case 'purchase':
                return -(Math.random() * 200 + 10);
            case 'payment':
                return -(Math.random() * 1000 + 50);
            default:
                return Math.random() > 0.5 ? Math.random() * 1000 : -(Math.random() * 1000);
        }
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
