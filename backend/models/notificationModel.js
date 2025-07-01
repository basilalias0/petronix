const mongoose = require('mongoose')

const notificationSchema = mongoose.Schema({
    targetUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        userType: {
            type: String,
            enum: ['admin', 'pumpOwner', 'salesRep', 'customer'],
            required: true,
        },
        _id: false,
    }],
    message: {
        type: String,
    },
    type: {
        type: String,
    },
    read: { // changed from isRead
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
    },
    relatedItem: {
        itemId: { type: mongoose.Schema.Types.ObjectId },
        itemModel: { type: String },
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);