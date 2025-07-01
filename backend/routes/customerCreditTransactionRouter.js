const express = require('express');
const customerCreditTransactionRouter = express.Router();
const customerCreditTransactionController = require('../controllers/customerCreditTransactionController');
const { protect, authorize } = require('../middleware/authMiddleware');


// Stripe Webhook (No protection or authorization needed)
customerCreditTransactionRouter.post('/webhook', express.raw({ type: 'application/json' }), customerCreditTransactionController.stripeWebhook);

// Record Customer Credit Transaction (Protected and Authorized for Customers)
customerCreditTransactionRouter.post('/', express.json(), protect, authorize('customer'), customerCreditTransactionController.recordCreditTransaction);

// Get Customer Credit Transactions (Protected and Authorized for Customers)
customerCreditTransactionRouter.get('/', express.json(), protect, authorize('customer','admin'), customerCreditTransactionController.getCreditTransactions);

// In routes
// GET /api/v1/admin/customer-credit/:creditId
customerCreditTransactionRouter.get('/customer-credit/:creditId', protect, authorize("admin"), customerCreditTransactionController.getCreditTransactionByIdForAdmin);


// Pay Debt (Protected and Authorized for Customers)
customerCreditTransactionRouter.post('/pay-debt', express.json(), protect, authorize('customer'), customerCreditTransactionController.payDebt);

customerCreditTransactionRouter.get('/transactions/credits',protect, authorize("admin"), customerCreditTransactionController.getCreditTransactions);

module.exports = customerCreditTransactionRouter;