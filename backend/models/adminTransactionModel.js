const mongoose = require('mongoose')

const adminTransactionSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    pumpOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PumpOwner',
    },
    amount: {
        type: Number,
        required: true,
    },
    stripePaymentIntentId: { // Renamed for clarity
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
    },
    currency: {
        type: String,
        default: 'INR',
        uppercase: true,
    },
    type: {
        type: String,
        enum: ['subscription', 'debtPayment'],
        required: true,
    },
    stripeCustomerId: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminTransaction', adminTransactionSchema);