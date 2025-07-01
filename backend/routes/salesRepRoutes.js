const express = require('express');
const salesRepRouter = express.Router();
const salesRepController = require('../controllers/salesRepController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Update Sales Rep Password (Protected and Authorized for Sales Reps)
salesRepRouter.put('/update-password', protect, authorize('salesRep'), salesRepController.updateSalesRepPassword);

// Record Fuel Sale (Protected and Authorized for Sales Reps)
salesRepRouter.post('/record-sale', protect, authorize('salesRep'), salesRepController.recordFuelSale);

// Add Sales Rep (Protected and Authorized for Pump Owners)
salesRepRouter.post(
    '/add',
    protect,
    authorize('pumpOwner'),
    upload('salesReps'), // 👈 folder name in Cloudinary
    salesRepController.addSalesRep
  );

// Update Sales Rep (Protected and Authorized for Pump Owners)
salesRepRouter.put('/:id', protect, authorize('pumpOwner'), salesRepController.updateSalesRep);

// Delete Sales Rep (Protected and Authorized for Pump Owners)
salesRepRouter.delete('/:id', protect, authorize('pumpOwner'), salesRepController.deleteSalesRep);

// Get All Sales Reps (Protected and Authorized for Pump Owners)
salesRepRouter.get('/', protect, authorize('pumpOwner'), salesRepController.getAllSalesReps);

salesRepRouter.get('/transactions/today', protect, authorize('salesRep'), salesRepController.getShiftTransactions);

salesRepRouter.get('/anytransactions', protect, authorize('salesRep'), salesRepController.getAllTypeTransactions);


module.exports = salesRepRouter;