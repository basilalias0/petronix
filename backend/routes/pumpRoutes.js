const express = require('express');
const pumpRouter = express.Router();
const pumpController = require('../controllers/pumpController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get All Pumps (Protected and Authorized for Admins)
pumpRouter.get('/', protect, authorize('admin'), pumpController.getAllPumps);

// Request New Pump (Protected and Authorized for Pump Owners)
pumpRouter.post(
    '/',
    protect,
    authorize('pumpOwner'),
    upload('PumpDocuments'), // <-- ✅ this handles file uploads to Cloudinary
    pumpController.requestNewPump
  );


// Approve Pump (Protected and Authorized for Admins)
pumpRouter.put('/approve/:id', protect, authorize('admin'), pumpController.approvePump);

// Reject Pump (Protected and Authorized for Admins)
pumpRouter.put('/reject/:id', protect, authorize('admin'), pumpController.rejectPump);

// Get Pump Owner's Pumps (Protected and Authorized for Pump Owners)
pumpRouter.get('/owner/pumps', protect, authorize('pumpOwner'), pumpController.getPumpOwnerPumps);

pumpRouter.get('/nearby', protect, authorize('customer'),pumpController.getNearbyPumps);


// Get Pump Details (Protected and Authorized for Admins and Pump Owners)
pumpRouter.get('/:pumpId', protect, authorize('admin', 'pumpOwner'), pumpController.getPumpDetails);



module.exports = pumpRouter;