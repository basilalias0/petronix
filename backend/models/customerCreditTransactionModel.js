const mongoose = require('mongoose')

const customerCreditTransactionSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['credit', 'payment'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
    },
    stripeChargeId: { // Add this field
        type: String,
    },
    creditRequestStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'not_applicable'],
        default: 'approved',
      },
}, { timestamps: true });

module.exports = mongoose.model('CustomerCreditTransaction', customerCreditTransactionSchema);