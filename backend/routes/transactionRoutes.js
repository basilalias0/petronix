const express = require('express');
const transactionRouter = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');


// Record Fuel Sale (Protected and Authorized for Sales Reps)
transactionRouter.post('/fuel-sale', protect, authorize('salesRep'), transactionController.recordFuelSale);

// Get All Transactions (Protected and Authorized for Admin)
transactionRouter.get('/all', protect, authorize('admin'), transactionController.getAllTransactions);

// Get Customer Transactions (Protected and Authorized for Customers)
transactionRouter.get('/customer', protect, authorize('customer'), transactionController.getCustomerTransactions);

// Get Pump Owner Transactions (Protected and Authorized for Pump Owners)
transactionRouter.get('/pump-owner', protect, authorize('pumpOwner'), transactionController.getPumpOwnerTransactions);

// Get Sales Rep Transactions (Protected and Authorized for Sales Reps)
transactionRouter.get('/sales-rep', protect, authorize('salesRep'), transactionController.getSalesRepTransactions);

transactionRouter.get('/recent-payments', protect, authorize('pumpOwner'), transactionController.getRecentPumpTransactions);


transactionRouter.get('/track', protect, authorize('pumpOwner'), transactionController.getOwnerPumpSales);

transactionRouter.get('/pie', protect, authorize('pumpOwner'), transactionController.getAllOwnerPumpSales);



module.exports = transactionRouter;