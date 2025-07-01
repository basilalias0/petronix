const mongoose = require('mongoose')

const salesRepSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please add a first name'],
    },
    lastName: {
        type: String,
        required: [true, 'Please add a last name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
    },
    role: {
        type: String,
        required: true,
        default: 'salesRep',
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    profilePicture: {
        type: String,
        default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    deletedAt: Date,
    isBlacklisted: {
        type: Boolean,
        default: false,
    },
    pump: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pump',
    },
    status: {
        type: String,
        enum: ['pending_approval', 'approved', 'rejected'],// changed status name
        default: 'approved',
    },
    phoneNumber: {
        type: String,
    },
    aadharNumber: {
        type: String,
    },
    gender: {
        type: String,
    },
    idProof: {
        type: String,
    },
    pumpOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PumpOwner',
        required: true,
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // CASE-SENSITIVE
      },

}, { timestamps: true });

module.exports = mongoose.model('SalesRep', salesRepSchema);