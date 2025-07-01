const express = require('express');
const customerRouter = express.Router();
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Customer Registration
customerRouter.post('/register', upload("customer"), customerController.registerCustomer);

// Customer Profile Routes (Protected and Authorized)
customerRouter.get('/profile', protect, authorize('customer'), customerController.getCustomerProfile);
customerRouter.put('/profile', protect, authorize('customer'), upload("customer"),customerController.updateCustomerProfile);
customerRouter.delete('/:id', protect, authorize('customer'), customerController.deleteCustomer);

// Customer PIN Routes (Protected and Authorized)
customerRouter.post('/forgot-pin', customerController.forgotPin);
customerRouter.put('/change-pin', protect, authorize('customer'), customerController.changePin);

// Admin Customer Deletion Route (Protected and Authorized for Admins)
customerRouter.delete('/admin/:customerId', protect, authorize('admin'), customerController.deleteCustomerByAdmin);


module.exports = customerRouter;