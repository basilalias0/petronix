const Admin = require('../models/adminModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PumpOwner = require('../models/pumpOwnerModel');
const Customer = require('../models/customerModel');
const Pump = require('../models/pumpModel');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/emailService');
const validator = require('validator');
const CustomerCreditTransaction = require('../models/customerCreditTransactionModel');
const PumpTransaction = require('../models/pumpTransactionModel');



const generateToken = (adminId) => {
    return jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const adminController = {
    registerAdmin: asyncHandler(async (req, res) => {
        const { firstName, lastName, email, password, permissions } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'First name, last name, email, and password are required' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.create({
            firstName, lastName, email, password: hashedPassword, permissions,
        });

        logger.info(`Admin ${admin.email} registered successfully.`);

        res.status(201).json({
            _id: admin.id, firstName: admin.firstName, lastName: admin.lastName,
            email: admin.email, token: generateToken(admin._id),
        });
    }),

    getAdminProfile: asyncHandler(async (req, res) => {
        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    }),

    updateAdminProfile: asyncHandler(async (req, res) => {
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const { firstName, lastName, email, password, permissions } = req.body;
        if (firstName) admin.firstName = firstName;
        if (lastName) admin.lastName = lastName;
        if (email) admin.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }
        if (permissions) admin.permissions = permissions;

        if (req.file) { // Check if a file was uploaded
            admin.profilePicture = req.file.path;
        }

        const updatedAdmin = await admin.save();
        res.json({
            _id: updatedAdmin.id,
            firstName: updatedAdmin.firstName,
            lastName: updatedAdmin.lastName,
            email: updatedAdmin.email,
            permissions: updatedAdmin.permissions,
            profilePic: updatedAdmin.profilePicture,
        });
    }),

    deleteAdmin: asyncHandler(async (req, res) => {
        const { adminId } = req.params;
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        admin.deletedAt = new Date();
        await admin.save();
        logger.info(`Admin ${admin.email} soft deleted.`);

        res.json({ message: 'Admin soft deleted successfully' });
    }),

    getAllCustomers: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }

        const customers = await Customer.find({ isDeleted: false }).skip(skip).limit(limit);
        const totalCustomers = await Customer.countDocuments({ isDeleted: false });

        res.json({
            customers,
            currentPage: page,
            totalPages: Math.ceil(totalCustomers / limit),
        });
    }),

    getAllPumpOwners: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }

        const pumpOwners = await PumpOwner.find({}).skip(skip).limit(limit);
        const totalPumpOwners = await PumpOwner.countDocuments();

        res.json({
            pumpOwners,
            currentPage: page,
            totalPages: Math.ceil(totalPumpOwners / limit),
        });
    }),

    getAllPumps: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }

        const pumps = await Pump.find({})
            .skip(skip)
            .limit(limit)
            .populate('pumpOwner');

        const totalPumps = await Pump.countDocuments({});

        res.json({
            pumps,
            currentPage: page,
            totalPages: Math.ceil(totalPumps / limit),
        });
    }),

    getPumpOwnerById: asyncHandler(async (req, res) => {
        const owner = await PumpOwner.findById(req.params.id);
        if (!owner) {
            return res.status(404).json({ message: 'Pump owner not found' });
        }
        res.json(owner);
    }),

    getPumpById: asyncHandler(async (req, res) => {
        const { pumpId } = req.params;

        const pump = await Pump.findById(pumpId)
            .populate('pumpOwner')
            .populate('salesReps');

        if (!pump) {
            return res.status(404).json({ message: 'Pump not found' });
        }

        res.json(pump);
    }),

    getPumpsByOwnerId: asyncHandler(async (req, res) => {
        const { ownerId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;
      
        if (page < 1 || limit < 1) {
          return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }
      
        try {
          const query = { pumpOwner: ownerId };
          if (status) {
            query.status = status;
          }
      
          const pumps = await Pump.find(query)
            .skip(skip)
            .limit(limit)
            .populate('pumpOwner');
      
          const totalPumps = await Pump.countDocuments(query);
      
          if (!pumps || pumps.length === 0) {
            return res.status(404).json({ message: 'No pumps found for this owner' });
          }
      
          res.json({
            pumps,
            currentPage: page,
            totalPages: Math.ceil(totalPumps / limit),
            totalPumps,
          });
        } catch (error) {
          console.error('Error fetching pumps by ownerId:', error);
          res.status(500).json({ message: 'Server error while fetching pumps' });
        }
      }),

      getCustomerById: asyncHandler(async (req, res) => {
        const { customerId } = req.params;
    
        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }
    
        const customer = await Customer.findOne({ _id: customerId, isDeleted: false });
    
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
    
        res.status(200).json(customer);
    }),


    sendPaymentReminder: asyncHandler(async (req, res) => {
        const { transactionId, email, amount } = req.body;
    
        // Validate inputs
        if (!transactionId || !email) {
            logger.warn(`Missing required fields: transactionId=${transactionId}, email=${email}`);
            return res.status(400).json({ message: 'Transaction ID and email are required' });
        }
    
        // Validate email format
        if (!validator.isEmail(email)) {
            logger.warn(`Invalid email format: ${email}`);
            return res.status(400).json({ message: 'Invalid email format' });
        }
    
        const subject = 'Payment Reminder for Pending Credit';
        const body = `
            Dear Customer,
            
            This is a reminder to settle your pending credit payment.
            
            Transaction ID: ${transactionId}
            Amount Due: ₹${amount || 'N/A'}
            
            Please make the payment at your earliest convenience. Contact support if you have any questions.
            
            Best regards,
            Your Platform Team
        `;
    
        try {
            // Timeout for sendEmail (10 seconds)
            const emailPromise = sendEmail(email, subject, body);
            const emailResult = await Promise.race([
                emailPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timeout')), 10000)),
            ]);
    
            logger.info(`Payment reminder sent to ${email} for transaction ${transactionId}: ${JSON.stringify(emailResult)}`);
            res.status(200).json({
                message: 'Reminder email sent successfully',
            });
        } catch (error) {
            logger.error(`Failed to send payment reminder to ${email} for transaction ${transactionId}: ${error.message}`);
            res.status(500).json({
                message: 'Failed to send reminder email',
                error: error.message,
            });
        }
    }),

    getDailyCreditTotals : asyncHandler(async (req, res) => {
        
        try {
          const dailyTotals = await CustomerCreditTransaction.aggregate([
            {
                
              $match: {
                type: 'credit'
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            {
              $sort: { _id: -1 } // newest date first
            }
          ]);
          console.log(dailyTotals);
          
         
          
      
          res.status(200).json(dailyTotals);
        } catch (error) {
          console.error('Error fetching daily credit totals:', error);
          res.status(500).json({ message: 'Server error' });
        }
      }),

      getCustomerCount : asyncHandler( async (req, res) => {
        try {
           const recentTx = await PumpTransaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "firstName email"); // Adjust based on your model

    const formatted = recentTx.map(tx => ({
      user: tx.customer.firstName || "N/A",
      amount: tx.amount,
      status: tx.status,
    }));
console.log(formatted);

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Recent credit fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
      }),
      

    
};

module.exports = adminController;