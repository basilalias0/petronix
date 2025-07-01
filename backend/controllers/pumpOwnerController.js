const PumpOwner = require('../models/pumpOwnerModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationService');
const logger = require('../utils/logger');
const validator = require('validator')
const Pump = require('../models/pumpModel');
const SalesRep = require("../models/salesRepModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const generateToken = (pumpOwnerId, role = 'pumpOwner') => {
    return jwt.sign({ id: pumpOwnerId, role: role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const pumpOwnerController = {
   
    registerPumpOwner: asyncHandler(async (req, res) => {
        try {
            const { firstName, lastName, email, password, phoneNumber, aadharNumber, gender } = req.body;
            console.log(req.body);

            // Check if files were uploaded
            const idProofPhoto = req.files?.idProofPhoto?.[0]?.path || null;
            const profilePicture = req.files?.profilePicture?.[0]?.path || null;

            // Inline Validation Checks using validator.js
            if (!firstName) return res.status(400).json({ message: 'First name is required' });
            if (!lastName) return res.status(400).json({ message: 'Last name is required' });
            if (!email) return res.status(400).json({ message: 'Email is required' });
            if (!validator.isEmail(email)) return res.status(400).json({ message: 'Invalid email address' });
            if (!password) return res.status(400).json({ message: 'Password is required' });
            if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
            if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });
            if (!validator.isMobilePhone(phoneNumber)) return res.status(400).json({ message: 'Invalid phone number' });
            if (!aadharNumber) return res.status(400).json({ message: 'Aadhaar number is required' });
            if (!validator.isLength(aadharNumber, { min: 12, max: 12 }) || !validator.isInt(aadharNumber)) {
                return res.status(400).json({ message: 'Invalid Aadhaar number (must be 12 digits)' });
            }
            if (!idProofPhoto) return res.status(400).json({ message: 'ID proof photo is required' });
            if (!profilePicture) return res.status(400).json({ message: 'Profile picture is required' });

            // Check if user already exists
            const [aadharExists, pumpOwnerExists] = await Promise.all([
                PumpOwner.findOne({ aadharNumber }),
                PumpOwner.findOne({ email }),
            ]);

            if (pumpOwnerExists) {
                return res.status(400).json({
                    field: "email",
                    message: "Email already exists",
                });
            }

            if (aadharExists) {
                return res.status(400).json({
                    field: "aadharNumber",
                    message: "Aadhaar number already exists",
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new Pump Owner
            const pumpOwner = await PumpOwner.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phoneNumber,
                aadharNumber,
                gender, // Added gender field here
                idProofPhoto: idProofPhoto,
                profilePicture: profilePicture,
            });

            // Create a Stripe Customer
            const stripeCustomer = await stripe.customers.create({
                name: `${firstName} ${lastName}`,
                email: email,
                phone: phoneNumber,
                metadata: { pumpOwnerId: pumpOwner._id.toString()}, // Link Stripe customer to your user
            });

            // Store the Stripe Customer ID in the PumpOwner record
            pumpOwner.stripeCustomerId = stripeCustomer.id;
            await pumpOwner.save();

            // Send Notification and Email
            await Promise.all([
                createNotification(
                    [{ userId: pumpOwner._id, userType: 'pumpOwner' }],
                    'Welcome! Your pump owner account has been created.',
                    'accountCreation',
                    'Account Created'
                ),
                sendEmail(
                    pumpOwner.email,
                    'Account Created',
                    'Welcome to our platform! Your pump owner account has been successfully created.'
                ),
            ]);

            return res.status(201).json({
                _id: pumpOwner.id,
                firstName: pumpOwner.firstName,
                lastName: pumpOwner.lastName,
                email: pumpOwner.email,
                phoneNumber: pumpOwner.phoneNumber,
                gender: pumpOwner.gender,  // Send gender in response
                profilePicture: pumpOwner.profilePicture,
                token: generateToken(pumpOwner._id),
                stripeCustomerId: pumpOwner.stripeCustomerId, // Send the Stripe Customer ID
            });

        } catch (error) {
            console.error(`Error registering pump owner: ${error.message}`);
            if (!res.headersSent) return res.status(500).json({ message: 'Internal server error' });
        }
    }),
    
    
    
    

    getPumpOwnerProfile: asyncHandler(async (req, res) => {
        const pumpOwner = await PumpOwner.findById(req.user.id).select('-password');
        if (!pumpOwner) {
            logger.warn(`Pump owner not found: ${req.user.id}`);
            return res.status(404).json({ message: 'Pump owner not found' });
        }
        res.json(pumpOwner);
        logger.info(`Pump owner profile retrieved: ${pumpOwner.email}`);
    }),

    updatePumpOwnerProfile: asyncHandler(async (req, res) => {
        const pumpOwner = await PumpOwner.findById(req.user.id);
        if (!pumpOwner) {
            logger.warn(`Pump owner not found: ${req.user.id}`);
            return res.status(404).json({ message: 'Pump owner not found' });
        }
    
        const { firstName, lastName, email, password, phoneNumber, aadharNumber, gender } = req.body;
        if (firstName) pumpOwner.firstName = firstName;
        if (lastName) pumpOwner.lastName = lastName;
        if (email) pumpOwner.email = email;
        if (phoneNumber) pumpOwner.phoneNumber = phoneNumber;
        if (aadharNumber) pumpOwner.aadharNumber = aadharNumber;
        if (gender) pumpOwner.gender = gender;  // Update gender if provided
        if (req.file && req.file.path) pumpOwner.idProofPhoto = req.file.path;
    
        if (password) {
            const isSamePassword = await bcrypt.compare(password, pumpOwner.password);
            if (isSamePassword) {
                return res.status(400).json({ message: 'New password cannot be the same as the old password' });
            }
            const salt = await bcrypt.genSalt(10);
            pumpOwner.password = await bcrypt.hash(password, salt);
        }
    
        const updatedPumpOwner = await pumpOwner.save();
    
        await createNotification(
            [{ userId: updatedPumpOwner._id, userType: 'pumpOwner' }],
            'Your pump owner profile has been updated.',
            'profileUpdate',
            'Profile Updated'
        );
    
        await sendEmail(
            updatedPumpOwner.email,
            'Profile Updated',
            'Your pump owner profile has been successfully updated.'
        );
    
        res.json({
            _id: updatedPumpOwner.id, firstName: updatedPumpOwner.firstName, lastName: updatedPumpOwner.lastName,
            email: updatedPumpOwner.email, phoneNumber: updatedPumpOwner.phoneNumber, aadharNumber: updatedPumpOwner.aadharNumber,
            gender: updatedPumpOwner.gender, idProofPhoto: updatedPumpOwner.idProofPhoto,
        });
        logger.info(`Pump owner profile updated: ${updatedPumpOwner.email}`);
    }),
    

    deletePumpOwner: asyncHandler(async (req, res) => {
        const pumpOwner = await PumpOwner.findByIdAndDelete(req.params.id);
        if (!pumpOwner) {
            logger.warn(`Pump owner not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Pump owner not found' });
        }

        await createNotification(
            [{ userId: pumpOwner._id, userType: 'pumpOwner' }],
            'Your pump owner account has been deleted.',
            'accountDeletion',
            'Account Deleted'
        );

        await sendEmail(
            pumpOwner.email,
            'Account Deleted',
            'Your pump owner account has been successfully deleted.'
        );

        res.json({ message: 'Pump owner deleted successfully' });
        logger.info(`Pump owner deleted: ${pumpOwner.email}`);
    }),

    getAllownerPumps: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
    
        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }
    
        let filter = {};
    
        // If the logged-in user is a pumpOwner, fetch only their pumps
        if (req.user.role === 'pumpOwner') {
            filter.pumpOwner = req.user.id;
        }
    
        const pumps = await Pump.find(filter)
            .populate('pumpOwner')
            .skip(skip)
            .limit(limit);
    
        const total = await Pump.countDocuments(filter);
    
        res.json({ pumps, page, limit, total });
        logger.info(`Pumps retrieved by ${req.user.role}, page: ${page}, limit: ${limit}`);
    }),
    
    getActiveSalesReps : asyncHandler(async (req, res) => {
        try {
          const pumpOwnerId = req.user.id; // Make sure you're using authentication middleware
      
          const salesReps = await SalesRep.find({
            pumpOwner: pumpOwnerId,
            status: "approved",
            isBlacklisted: false,
          });
      
          const activeSalesReps = salesReps.length;
      
          res.status(200).json({ activeSalesReps });
        } catch (err) {
          console.error("Error fetching active sales reps:", err);
          res.status(500).json({ message: "Server error" });
        }
      }),
};

module.exports = pumpOwnerController;