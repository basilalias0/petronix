const express = require('express');
const pumpOwnerRouter = express.Router();
const pumpOwnerController = require('../controllers/pumpOwnerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Assuming you have multer configured as upload

// Pump Owner Registration (Upload middleware for file upload)
pumpOwnerRouter.post('/register',upload("Pump owner"),  pumpOwnerController.registerPumpOwner); // don't call .fields() here
  
// Pump Owner Profile Routes (Protected and Authorized for Pump Owners)
pumpOwnerRouter.get('/profile', protect, authorize('pumpOwner'), pumpOwnerController.getPumpOwnerProfile);
pumpOwnerRouter.put('/profile', protect, authorize('pumpOwner'), pumpOwnerController.updatePumpOwnerProfile);
pumpOwnerRouter.delete('/:id', protect, authorize('pumpOwner'), pumpOwnerController.deletePumpOwner);
pumpOwnerRouter.get('/pumps', protect, authorize('admin', 'pumpOwner'),pumpOwnerController.getAllownerPumps);
pumpOwnerRouter.get("/active-sales-reps", protect, authorize('pumpOwner'),pumpOwnerController. getActiveSalesReps);



module.exports = pumpOwnerRouter;