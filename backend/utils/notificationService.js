const Notification = require('../models/notificationModel');

const createNotification = async (targetUsers, message, type, title, relatedItemId = null, relatedItemModel = null, createdBy = null) => {
    try {
        const notification = await Notification.create({
            targetUsers,
            message,
            type,
            title,
            relatedItemId,
            relatedItemModel,
            createdBy
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
};