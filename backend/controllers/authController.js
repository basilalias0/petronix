const Customer = require('../models/customerModel');
const SalesRep = require('../models/salesRepModel');
const PumpOwner = require('../models/pumpOwnerModel');
const Admin = require('../models/adminModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Function to find user and determine user type
const findUserByEmail = async (email) => {
    let user, userType;

    user = await SalesRep.findOne({ email });
    if (user) return { user, userType: 'salesRep' };

    user = await Customer.findOne({ email });
    if (user) return { user, userType: 'customer' };

    user = await PumpOwner.findOne({ email });
    if (user) return { user, userType: 'pumpOwner' };

    user = await Admin.findOne({ email });
    if (user) return { user, userType: 'admin' };

    return { user: null, userType: null };
};

const authController = {
    forgotPassword: asyncHandler(async (req, res) => {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const { user, userType } = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}/${userType}`;
        const message = `You are receiving this email because you requested a password reset. Please use this link: ${resetUrl}`;

        try {
            await sendEmail(user.email, 'Password Reset Token', message);
            res.status(200).json({ success: true, message: 'Password reset email sent' });
            logger.info(`Password reset email sent to ${user.email}`);
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({ success: false, message: 'Failed to send email' });
            logger.error(`Failed to send password reset email to ${user.email}: ${err.message}`);
        }
    }),

    resetPassword: asyncHandler(async (req, res) => {
        const { resetToken, userType } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const resetPasswordTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        let user;
        switch (userType) {
            case 'customer': user = await Customer.findOne({ resetPasswordToken: resetPasswordTokenHash, resetPasswordExpire: { $gt: Date.now() } }); break;
            case 'salesRep': user = await SalesRep.findOne({ resetPasswordToken: resetPasswordTokenHash, resetPasswordExpire: { $gt: Date.now() } }); break;
            case 'pumpOwner': user = await PumpOwner.findOne({ resetPasswordToken: resetPasswordTokenHash, resetPasswordExpire: { $gt: Date.now() } }); break;
            case 'admin': user = await Admin.findOne({ resetPasswordToken: resetPasswordTokenHash, resetPasswordExpire: { $gt: Date.now() } }); break;
            default: return res.status(400).json({ success: false, message: 'Invalid user type' });
        }

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
        logger.info(`Password reset for ${user.email} successful`);
    }),

    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const { user, userType } = await findUserByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                token: jwt.sign({ id: user._id, role: userType }, process.env.JWT_SECRET, { expiresIn: '30d' }),
                userType: userType,
            });
            logger.info(`User ${user.email} logged in successfully`);
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            logger.warn(`Failed login attempt for email: ${email}`);
        }
    }),
};

module.exports = authController;