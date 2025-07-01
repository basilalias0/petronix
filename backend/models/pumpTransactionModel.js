const mongoose = require('mongoose')

const pumpTransactionSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    salesRep: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalesRep',
    },
    pump: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pump',
    },
    amount: {
        type: Number,
        required: true,
    },
    fuelType: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'refunded'],
        default: 'succeeded',
    },
    paymentMethod: {
        type: String,
    },
    currency: {
        type: String,
        default: 'INR',
        uppercase: true,
    },
    status: {
        type: String,
        enum: ['pendingPayment', 'completed', 'credit'],
        default: 'completed',
    },
    pinVerified: {
        type: Boolean,
        default: false,
    },
    pin: {
        type: String,
    },
    fuelQuantity: {
        type: Number,
    },
    fuelPrice: {
        type: Number,
    },
    paymentType: {
        type: String,
        enum: ['credit', 'stripe'],
        default: 'credit'
    }
}, { timestamps: true });

module.exports = mongoose.model('PumpTransaction', pumpTransactionSchema);