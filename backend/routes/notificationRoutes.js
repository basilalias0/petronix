const express = require('express');
const notificationRouter = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Create Notification (Protected and Authorized for Admins)
notificationRouter.post('/', protect, authorize('admin'), notificationController.createNotification);

// Get User Notifications (Protected and Authorized for all users)
notificationRouter.get('/user', protect, notificationController.getUserNotifications);

// Mark Notification as Read (Protected and Authorized for all users)
notificationRouter.put('/read/:id', protect, notificationController.markNotificationAsRead);

// Get All Notifications (Protected and Authorized for Admins)
notificationRouter.get('/', protect, authorize('admin'), notificationController.getAllNotifications);

// Delete Notification (Protected and Authorized for Admins)
notificationRouter.delete('/:id', protect, authorize('admin'), notificationController.deleteNotification);

notificationRouter.get('/unread-count', protect, notificationController.getUnreadCount);

module.exports = notificationRouter;