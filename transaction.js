class Transactions {
    constructor() {
        this.transferModal = null;
        this.otpModal = null;
        this.init();
    }

    init() {
        this.createModals();
    }

    createModals() {
        // Create transfer modal
        this.transferModal = document.createElement('div');
        this.transferModal.className = 'modal';
        this.transferModal.id = 'transferModal';
        this.transferModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Send Money</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="transferForm">
                    <div class="form-group">
                        <label for="recipientName">Recipient Name</label>
                        <input type="text" id="recipientName" placeholder="Enter recipient name" required>
                    </div>
                    <div class="form-group">
                        <label for="recipientEmail">Recipient Email</label>
                        <input type="email" id="recipientEmail" placeholder="Enter recipient email" required>
                    </div>
                    <div class="form-group">
                        <label for="transferAmount">Amount</label>
                        <input type="number" id="transferAmount" placeholder="Enter amount" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="transferMessage">Message (Optional)</label>
                        <textarea id="transferMessage" placeholder="Add a message" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <div class="remember-me">
                            <input type="checkbox" id="requestOtp">
                            <label for="requestOtp">Request OTP via email</label>
                        </div>
                    </div>
                </form>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn">Cancel</button>
                    <button class="modal-btn confirm-btn">Send Money</button>
                </div>
            </div>
        `;

        // Create OTP modal
        this.otpModal = document.createElement('div');
        this.otpModal.className = 'modal';
        this.otpModal.id = 'otpModal';
        this.otpModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Verify Transaction</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="form-group">
                    <label for="otpCode">Enter OTP</label>
                    <input type="text" id="otpCode" placeholder="Enter OTP sent to your email" required>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn">Cancel</button>
                    <button class="modal-btn confirm-btn">Verify</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.transferModal);
        document.body.appendChild(this.otpModal);

        this.bindModalEvents();
    }

    bindModalEvents() {
        // Transfer modal events
        this.transferModal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeTransferModal();
        });

        this.transferModal.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeTransferModal();
        });

        this.transferModal.querySelector('.confirm-btn').addEventListener('click', () => {
            this.confirmTransfer();
        });

        // OTP modal events
        this.otpModal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeOtpModal();
        });

        this.otpModal.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeOtpModal();
        });

        this.otpModal.querySelector('.confirm-btn').addEventListener('click', () => {
            this.verifyOtp();
        });
    }

    openTransferModal() {
        this.transferModal.style.display = 'flex';
        document.getElementById('transferForm').reset();
    }

    closeTransferModal() {
        this.transferModal.style.display = 'none';
    }

    closeOtpModal() {
        this.otpModal.style.display = 'none';
    }

    confirmTransfer() {
        const recipientName = document.getElementById('recipientName').value;
        const recipientEmail = document.getElementById('recipientEmail').value;
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const message = document.getElementById('transferMessage').value;
        const requestOtp = document.getElementById('requestOtp').checked;

        if (!recipientName || !recipientEmail || !amount) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        if (!Utils.validateEmail(recipientEmail)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (requestOtp) {
            this.closeTransferModal();
            this.otpModal.style.display = 'flex';
            this.sendOtp();
        } else {
            this.processTransfer(recipientName, recipientEmail, amount, message);
        }
    }

    sendOtp() {
        Utils.showLoading();
        
        // Simulate OTP sending
        setTimeout(() => {
            Utils.hideLoading();
            this.showNotification('OTP sent to your registered email', 'success');
            
            // Store the generated OTP (in real app, this would be server-side)
            this.currentOtp = '123456'; // Simple OTP for demo
            localStorage.setItem('current_otp', this.currentOtp);
        }, 2000);
    }

    verifyOtp() {
        const enteredOtp = document.getElementById('otpCode').value;
        const storedOtp = localStorage.getItem('current_otp');

        if (!enteredOtp) {
            this.showNotification('Please enter the OTP', 'error');
            return;
        }

        if (enteredOtp === storedOtp) {
            this.closeOtpModal();
            
            // Get transfer details from form
            const recipientName = document.getElementById('recipientName').value;
            const recipientEmail = document.getElementById('recipientEmail').value;
            const amount = parseFloat(document.getElementById('transferAmount').value);
            const message = document.getElementById('transferMessage').value;
            
            this.processTransfer(recipientName, recipientEmail, amount, message);
        } else {
            this.showNotification('Invalid OTP. Please try again.', 'error');
        }
    }

    processTransfer(recipientName, recipientEmail, amount, message) {
        Utils.showLoading();

        // Simulate transfer processing
        setTimeout(() => {
            // Update user balance
            const user = JSON.parse(localStorage.getItem('chase_current_user'));
            if (user.accounts[0].balance >= amount) {
                user.accounts[0].balance -= amount;
                localStorage.setItem('chase_current_user', JSON.stringify(user));

                // Add transaction to history
                this.addTransaction({
                    type: 'transfer',
                    category: 'Transfer',
                    merchant: recipientName,
                    amount: -amount,
                    description: message || `Transfer to ${recipientName}`
                });

                // Send email notifications
                this.sendTransferNotifications(user.email, recipientEmail, amount);

                Utils.hideLoading();
                this.showNotification(`Successfully transferred ${Utils.formatCurrency(amount)} to ${recipientName}`, 'success');
                this.closeTransferModal();
                
                // Refresh dashboard
                if (window.dashboard) {
                    window.dashboard.renderDashboard();
                }
            } else {
                Utils.hideLoading();
                this.showNotification('Insufficient funds', 'error');
            }
        }, 3000);
    }

    addTransaction(transactionData) {
        const transactions = JSON.parse(localStorage.getItem('chase_transactions')) || [];
        const user = JSON.parse(localStorage.getItem('chase_current_user'));

        const transaction = {
            id: Utils.generateId(),
            userId: user.id,
            ...transactionData,
            date: new Date().toISOString(),
            status: 'completed'
        };

        transactions.unshift(transaction); // Add to beginning
        localStorage.setItem('chase_transactions', JSON.stringify(transactions));
    }

    sendTransferNotifications(senderEmail, recipientEmail, amount) {
        // Send notification to sender
        this.sendEmailNotification(senderEmail, 'outgoing_transfer', {
            amount: amount,
            recipient: recipientEmail
        });

        // Send notification to recipient (in real app)
        this.sendEmailNotification(recipientEmail, 'incoming_transfer', {
            amount: amount,
            sender: senderEmail
        });
    }

    sendEmailNotification(email, type, data) {
        const notifications = JSON.parse(localStorage.getItem('chase_notifications')) || [];
        
        const notification = {
            id: Utils.generateId(),
            email,
            type,
            data,
            timestamp: new Date().toISOString(),
            read: false
        };

        notifications.push(notification);
        localStorage.setItem('chase_notifications', JSON.stringify(notifications));

        console.log(`Email notification sent to ${email} for ${type}:`, data);
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

// Initialize transactions
document.addEventListener('DOMContentLoaded', () => {
    window.transactions = new Transactions();
});