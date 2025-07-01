const Notification = require('../models/notificationModel');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const mongoose = require("mongoose");


const notificationController = {
    createNotification: asyncHandler(async (req, res) => {
        const { recipients, message, type, title } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ message: 'Recipients must be a non-empty array' });
        }

        if (recipients.some(recipient => !recipient.userId || !recipient.userType)) {
            return res.status(400).json({ message: 'Each recipient must have a userId and userType' });
        }

        if (!message || !type || !title) {
            return res.status(400).json({ message: 'Message, type, and title are required' });
        }

        const notification = await Notification.create({ recipients, message, type, title });

        if (notification) {
            res.status(201).json(notification);
            logger.info(`Notification created: ${notification._id}`);
        } else {
            logger.error('Invalid notification data');
            res.status(400).json({ message: 'Invalid notification data' });
        }
    }),

    getUserNotifications: asyncHandler(async (req, res) => {
        const userId = new mongoose.Types.ObjectId(req.user.id); // ✅ Convert to ObjectId
        const userType = req.query.userType || req.user.userType;
    
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
    
        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }
    
        const notifications = await Notification.find({
            targetUsers: { $elemMatch: { userId, userType } },
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    
        const total = await Notification.countDocuments({
            targetUsers: { $elemMatch: { userId, userType } },
        });
    
        res.status(200).json({
            notifications,
            page,
            limit,
            total,
        });
    }),
    
    

     markNotificationAsRead : asyncHandler(async (req, res) => {
        const notificationId = req.params.id;
        const userId = req.user.id; // Assuming you're using authentication middleware to get the user's ID
      
        if (!notificationId) {
          return res.status(400).json({ message: 'Notification ID is required' });
        }
      
        const notification = await Notification.findById(notificationId);
      
        if (!notification) {
          return res.status(404).json({ message: 'Notification not found' });
        }
      
        // Check if the user is a recipient of this notification
        const isRecipient = notification.targetUsers.some(
          (user) => user.userId.toString() === userId.toString()
        );
      
        if (!isRecipient) {
          return res.status(403).json({ message: 'You are not authorized to mark this notification as read' });
        }
      
        // Mark the notification as read
        notification.read = true;
        await notification.save();
      
        res.status(200).json({ message: 'Notification marked as read' });
      }),
      

    getAllNotifications: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }

        const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({});

        res.status(200).json({
            notifications,
            page,
            limit,
            total,
        });
        logger.info(`All notifications retrieved, page: ${page}, limit: ${limit}`);
    }),

    deleteNotification: asyncHandler(async (req, res) => {
        const notificationId = req.params.id;

        if (!notificationId) {
            return res.status(400).json({ message: 'Notification ID is required' });
        }

        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) {
            logger.warn(`Notification not found: ${notificationId}`);
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted' });
        logger.info(`Notification ${notificationId} deleted`);
    }),

    // GET /api/notification/unread-count
    getUnreadCount: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const userType = req.query.userType || req.user.userType;
      
        const unreadCount = await Notification.countDocuments({
          targetUsers: { $elemMatch: { userId, userType } },
          read: false,
        });
      
        res.status(200).json({ unreadCount });
      }),
      
  
};

module.exports = notificationController;