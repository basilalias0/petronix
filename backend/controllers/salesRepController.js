const SalesRep = require('../models/salesRepModel');
const PumpOwner = require('../models/pumpOwnerModel');
const Transaction = require('../models/adminTransactionModel');
const PumpTransaction = require('../models/pumpTransactionModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationService');
const logger = require('../utils/logger');
const Customer = require('../models/customerModel');
const Pump = require('../models/pumpModel');


const generateToken = (salesRepId, role = 'salesRep') => {
    return jwt.sign({ id: salesRepId, role: role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const salesRepController = {
    updateSalesRepPassword: asyncHandler(async (req, res) => {
        const { password, newPassword } = req.body;

        if (!password || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const salesRep = await SalesRep.findById(req.user.id);
        if (!salesRep) {
            logger.warn(`Sales rep not found: ${req.user.id}`);
            return res.status(404).json({ message: 'Sales rep not found' });
        }

        if (!(await bcrypt.compare(password, salesRep.password))) {
            logger.warn(`Incorrect current password for sales rep: ${req.user.id}`);
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        salesRep.password = await bcrypt.hash(newPassword, salt);
        await salesRep.save();

        await createNotification(
            [{ userId: salesRep._id, userType: 'salesRep' }],
            'Your password has been updated.',
            'passwordUpdate',
            'Password Updated'
        );

        await sendEmail(
            salesRep.email,
            'Password Updated',
            'Your password has been successfully updated.'
        );

        res.json({ message: 'Password updated successfully' });
        logger.info(`Password updated for sales rep: ${salesRep.email}`);
    }),

    recordFuelSale: asyncHandler(async (req, res) => {
        const { customer, fuelAmount, fuelPrice, paymentType, pin } = req.body;
        const salesRepPumpId = req.user.pump; // Get pump ID from the sales rep's user object


        if (!customer || !fuelAmount || !fuelPrice || !pin) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!customer.includes('@')) {
            return res.status(400).json({ message: 'Invalid customer email format' });
        }

        if (fuelAmount <= 0 || fuelPrice <= 0) {
            return res.status(400).json({ message: 'Fuel amount and price must be positive numbers' });
        }

        const pumpExists = await Pump.findById(salesRepPumpId); // Use salesRepPumpId
        if (!pumpExists) {
            logger.warn(`Pump not found: ${salesRepPumpId}`);
            return res.status(404).json({ message: 'Pump not found for sales rep' });
        }

        const customerDetails = await Customer.findOne({ email: customer });
        if (!customerDetails) {
            logger.warn(`Customer not found with email: ${customer}`);
            return res.status(404).json({ message: 'Customer not found with provided email' });
        }

        if (customerDetails.pin !== pin) {
            logger.warn(`Incorrect PIN for customer: ${customer}`);
            return res.status(401).json({ message: 'Incorrect PIN' });
        }

        const totalPrice = fuelAmount * fuelPrice;
        if (customerDetails.credit < totalPrice) {
            logger.warn(`Insufficient credit for customer: ${customer}`);
            return res.status(402).json({ message: 'Insufficient credit' });
        }

        customerDetails.credit -= totalPrice;
        await customerDetails.save();

        const transaction = await PumpTransaction.create({ // Use PumpTransaction model
            customer: customerDetails._id,
            pump: salesRepPumpId, // Use salesRepPumpId
            salesRep: req.user.id,
            fuelQuantity: fuelAmount, // changed fuelAmount to fuelQuantity
            fuelPrice,
            paymentType,
            amount: totalPrice, // added total price to transaction
            fuelType: 'fuel' // added fuelType
        });

        if (transaction) {
            await createNotification(
                [{ userId: customerDetails._id, userType: 'customer' }],
                `Fuel sale recorded for ${fuelAmount} liters.`,
                'fuelSale',
                'Fuel Sale Recorded'
            );

            await sendEmail(
                customerDetails.email,
                'Fuel Sale Recorded',
                `A fuel sale of ${fuelAmount} liters has been recorded for your account. Your remaining credit is ${customerDetails.credit}.`
            );

            res.status(201).json(transaction);
            logger.info(`Fuel sale recorded for customer: ${customer}, pump: ${salesRepPumpId}`); // Added pump ID to log
        } else {
            logger.error('Invalid transaction data');
            res.status(400).json({ message: 'Invalid transaction data' });
        }
    }),

    addSalesRep: asyncHandler(async (req, res) => {
        const {
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            pump,
            aadharNumber,
            gender,
            address,
        } = req.body;

        // 🔒 Basic validation
        if (!firstName || !lastName || !email || !password || !phoneNumber || !pump) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const existingRep = await SalesRep.findOne({ email });
        if (existingRep) {
            return res.status(400).json({ message: 'Sales rep with this email already exists' });
        }

        // 🔐 Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 📁 Handle file upload
        const idProof = req?.files?.idProof?.[0]?.path || null;

        // 🚀 Create SalesRep with pumpOwner field
        const salesRep = await SalesRep.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            pump,
            aadharNumber,
            gender,
            address,
            idProof,
            pumpOwner: req.user._id,
        });

        if (salesRep) {
            // 🔔 Notification and email
            await createNotification(
                [{ userId: req.user._id, userType: 'pumpOwner' }],
                `A new sales rep ${firstName} has been added.`,
                'salesRepAdd',
                'Sales Rep Added'
            );

            await sendEmail(
                req.user.email,
                'Sales Rep Added',
                `A new sales rep ${firstName} has been added to your pump.`
            );

            return res.status(201).json(salesRep);
        } else {
            return res.status(400).json({ message: 'Failed to create sales rep' });
        }
    }),



    updateSalesRep: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { firstName, lastName, email, password, phoneNumber } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Sales rep ID is required' });
        }

        const salesRep = await SalesRep.findById(id);
        if (!salesRep) {
            logger.warn(`Sales rep not found: ${id}`);
            return res.status(404).json({ message: 'Sales rep not found' });
        }

        if (firstName) salesRep.firstName = firstName;
        if (lastName) salesRep.lastName = lastName;
        if (email) salesRep.email = email;
        if (phoneNumber) salesRep.phoneNumber = phoneNumber;

        if (password) {
            const isSamePassword = await bcrypt.compare(password, salesRep.password);
            if (isSamePassword) {
                logger.warn(`New password is same as old password for sales rep: ${salesRep.email}`);
                return res.status(400).json({ message: 'New password cannot be the same as the old password' });
            }

            const salt = await bcrypt.genSalt(10);
            salesRep.password = await bcrypt.hash(password, salt);
        }

        const updatedSalesRep = await salesRep.save();
        const pumpOwner = await PumpOwner.findById(req.user.pumpOwner);

        await createNotification(
            [{ userId: req.user.pumpOwner, userType: 'pumpOwner' }],
            `Sales rep ${updatedSalesRep.firstName} has been updated.`,
            'salesRepUpdate',
            'Sales Rep Updated'
        );

        await sendEmail(
            pumpOwner.email,
            'Sales Rep Updated',
            `Sales rep ${updatedSalesRep.firstName} has been updated.`
        );

        res.json(updatedSalesRep);
        logger.info(`Sales rep updated: ${updatedSalesRep.email}`);
    }),

    deleteSalesRep: asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Sales rep ID is required' });
        }

        const salesRep = await SalesRep.findByIdAndDelete(id);
        if (!salesRep) {
            logger.warn(`Sales rep not found: ${id}`);
            return res.status(404).json({ message: 'Sales rep not found' });
        }

        const pumpOwner = await PumpOwner.findById(req.user.pumpOwner);

        await createNotification(
            [{ userId: req.user.pumpOwner, userType: 'pumpOwner' }],
            `Sales rep ${salesRep.firstName} has been deleted.`,
            'salesRepDelete',
            'Sales Rep Deleted'
        );

        await sendEmail(
            pumpOwner.email,
            'Sales Rep Deleted',
            `Sales rep ${salesRep.firstName} has been deleted.`
        );

        res.json({ message: 'Sales rep deleted successfully' });
        logger.info(`Sales rep deleted: ${salesRep.email}`);
    }),

    getAllSalesReps: asyncHandler(async (req, res) => {
        const pumpOwnerId = req.user.id;

        const salesReps = await SalesRep.find({ pumpOwner: pumpOwnerId }).populate('pump', 'pumpName');


        res.status(200).json({
            success: true,
            data: salesReps,
        });

        logger.info(`Sales reps retrieved for pump owner: ${pumpOwnerId}`);
    }),

    getShiftTransactions: asyncHandler(async (req, res) => {
        const salesRepId = req.user._id;
        const { shiftStart, shiftEnd } = req.query;

        if (!shiftStart || !shiftEnd) {
            return res.status(400).json({ message: 'Shift start and end times are required' });
        }

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');

        const shiftStartTime = new Date(`${yyyy}-${mm}-${dd}T${shiftStart}`);
        const shiftEndTime = new Date(`${yyyy}-${mm}-${dd}T${shiftEnd}`);

        const transactions = await PumpTransaction.find({
            salesRep: salesRepId,
            createdAt: {
                $gte: shiftStartTime,
                $lte: shiftEndTime,
            },
        })

            .populate('customer', 'firstName lastName email phoneNumber')

            .populate('pump', 'pumpName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: transactions,
        });

        logger.info(`Shift transactions fetched for sales rep: ${salesRepId} from ${shiftStart} to ${shiftEnd}`);
    }),


    getAllTypeTransactions: asyncHandler(async (req, res) => {
        const salesRepId = req.user.id;
        const { email, date, startTime, endTime } = req.query;
      
        let query = { salesRep: salesRepId };
      
        // Validate date (if provided)
        let referenceDate;
        if (date) {
          referenceDate = date;
          const isValidDate = !isNaN(new Date(referenceDate).getTime());
          if (!isValidDate) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
          }
        }
      
        // Validate and apply startTime and endTime filters
        if (startTime && endTime) {
          const shiftStartTime = new Date(`${referenceDate}T${startTime}:00`);
          const shiftEndTime = new Date(`${referenceDate}T${endTime}:00`);
      
          if (isNaN(shiftStartTime.getTime()) || isNaN(shiftEndTime.getTime())) {
            return res.status(400).json({ message: 'Invalid time format. Use HH:mm (24-hour format).' });
          }
      
          if (shiftStartTime >= shiftEndTime) {
            return res.status(400).json({ message: 'Start time cannot be later than or equal to end time.' });
          }
      
          query.createdAt = {
            $gte: shiftStartTime,
            $lte: shiftEndTime,
          };
        } else if ((startTime && !endTime) || (!startTime && endTime)) {
          return res.status(400).json({ message: 'Both startTime and endTime must be provided.' });
        } else if (referenceDate) {
          // Filter for the whole date (if no time provided)
          query.createdAt = {
            $gte: new Date(`${referenceDate}T00:00:00.000Z`),
            $lte: new Date(`${referenceDate}T23:59:59.999Z`)
          };
        }
      
        // Handle customer email filter
        if (email) {
          const customer = await Customer.findOne({ email: { $regex: email, $options: 'i' } });
          if (!customer) {
            return res.status(404).json({ message: 'No customer found with this email.' });
          }
          query.customer = customer._id;
        }
      
        console.log("Final query:", query);
      
        // Execute the query
        const transactions = await PumpTransaction.find(query)
          .populate('customer', 'firstName lastName email phoneNumber')
          .populate('pump', 'pumpName')
          .sort({ createdAt: -1 });
      
        if (transactions.length === 0) {
          return res.status(404).json({ message: 'No transactions found for the given filters.' });
        }
      
        res.status(200).json(transactions);
      }),
      

};

module.exports = salesRepController;