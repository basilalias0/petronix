const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Admin Registration (No validation needed here, it's done in the controller)
adminRouter.post('/register', adminController.registerAdmin);

// Admin Profile Routes (Protected and Authorized)
adminRouter.get('/profile', protect, authorize('admin'), adminController.getAdminProfile);
adminRouter.put('/profile',protect,authorize('admin'),upload("admin"),adminController.updateAdminProfile); // ✅ FIXED: no .single()

 
adminRouter.delete('/:adminId', protect, authorize('admin'), adminController.deleteAdmin);

// Customer Routes (Protected and Authorized)
adminRouter.get('/customers', protect, authorize('admin'), adminController.getAllCustomers);

// Pump Owner Routes (Protected and Authorized)
adminRouter.get('/pump-owners', protect, authorize('admin'), adminController.getAllPumpOwners);


adminRouter.get('/pump-owners/:id', protect, authorize('admin'), adminController.getPumpOwnerById);


// Pump Routes (Protected and Authorized)
adminRouter.get('/pumps', protect, authorize('admin'), adminController.getAllPumps);


// Add this line to import the controller function for getting pumps by ownerId
adminRouter.get('/pump-owners/:ownerId/pumps', protect, authorize('admin'),adminController.getPumpsByOwnerId);

adminRouter.get('/customers/:customerId', protect, authorize('admin'), adminController.getCustomerById);

adminRouter.post('/send-payment-reminder',protect,authorize('admin'),adminController.sendPaymentReminder);


adminRouter.get('/daily-credit-totals',protect,authorize('admin'),adminController.getDailyCreditTotals);

adminRouter.get('/customerCount',protect,authorize('admin'),adminController.getCustomerCount);




module.exports = adminRouter;