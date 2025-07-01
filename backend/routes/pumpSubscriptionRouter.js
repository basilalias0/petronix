const express = require('express');
const pumpSubscriptionRouter = express.Router();
const pumpSubscriptionController = require('../controllers/pumpSubscriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');


// Stripe Webhook (No protection or authorization needed)
pumpSubscriptionRouter.post('/webhook', express.raw({ type: 'application/json' }), pumpSubscriptionController.stripeWebhook);

// Create Pump Subscription (Protected and Authorized for Pump Owners)
pumpSubscriptionRouter.post('/', express.json(), protect, authorize('pumpOwner'), pumpSubscriptionController.createWithoutSubs);

// Get Subscription Status (Protected and Authorized for Pump Owners)
pumpSubscriptionRouter.get('/status',express.json(), protect,authorize('pumpOwner','admin'), pumpSubscriptionController.getSubscriptionStatus);

// Get Pumps by Owner (Protected and Authorized for Pump Owners)
pumpSubscriptionRouter.get('/owner/pumps', express.json(), protect, authorize('pumpOwner'), pumpSubscriptionController.getPumpsByOwner);

module.exports = pumpSubscriptionRouter;