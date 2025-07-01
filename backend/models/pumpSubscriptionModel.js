const mongoose = require('mongoose');

const pumpSubscriptionSchema = mongoose.Schema({
    pumpOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PumpOwner',
        required: true,
    },
    pump: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pump',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: { // Changed to 'status' to match webhook handling
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'past_due', 'active'], 
        default: 'pending',
    },
    paymentMethod: {
        type: String,
    },
    paymentIntentId: { // Renamed for clarity
        type: String,
    },
    stripeSubscriptionId: { // Added for subscription-related events
        type: String,
    },
    stripeChargeId: { //added to store the charge ID.
        type: String,
    },
    isSubscribed: { // Added isSubscribed field
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('PumpSubscription', pumpSubscriptionSchema);