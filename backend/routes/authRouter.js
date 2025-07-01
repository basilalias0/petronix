const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');

// Forgot Password
authRouter.post('/forgotpassword', authController.forgotPassword);

// Reset Password
authRouter.post('/resetpassword/:resetToken/:userType', authController.resetPassword);

// Login
authRouter.post('/login', authController.login);

module.exports = authRouter;