const mongoose = require('mongoose');

const pumpOwnerSchema = mongoose.Schema({
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
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    profilePicture: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        required: true,
        default: 'pumpOwner',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    deletedAt: Date,
    isBlacklisted: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['pending_approval', 'approved', 'rejected'], // changed status name
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
    idProofPhoto: {
        type: String,
        default: null,
    },
    stripeCustomerId:{
        type:String
    }
}, { timestamps: true });

module.exports = mongoose.model('PumpOwner', pumpOwnerSchema);
