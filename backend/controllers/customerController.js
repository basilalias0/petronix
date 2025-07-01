const Customer = require('../models/customerModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationService');
const logger = require('../utils/logger');
const crypto = require('crypto');
const validator = require('validator');

const generateToken = (customerId, role) => {
    return jwt.sign({ id: customerId, role: role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const customerController = {

    registerCustomer: asyncHandler(async (req, res) => {
        const {
            firstName,
            lastName,
            email,
            password,
            pin,
            aadharNumber,
            phoneNumber,
            alternativeNumber,
            address,
        } = req.body;
    
    
        // File extraction
        const profilePicture = req.files?.profilePicture?.[0]?.path || null;
        const idProofPhoto = req.files?.idProofPhoto?.[0]?.path || null;
    
        // Inline Validations
        if (!firstName) return res.status(400).json({ message: 'First name is required' });
        if (!lastName) return res.status(400).json({ message: 'Last name is required' });
        if (!email) return res.status(400).json({ message: 'Email is required' });
        if (!validator.isEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
        if (!password) return res.status(400).json({ message: 'Password is required' });
        if (!validator.isLength(password, { min: 6 })) return res.status(400).json({ message: 'Password must be at least 6 characters' });
        if (!pin) return res.status(400).json({ message: 'PIN is required' });
        if (!validator.isLength(pin, { min: 4, max: 4 }) || !validator.isNumeric(pin)) return res.status(400).json({ message: 'PIN must be 4 digits' });
        if (!aadharNumber) return res.status(400).json({ message: 'Aadhar number is required' });
        if (!validator.isLength(aadharNumber, { min: 12, max: 12 }) || !validator.isNumeric(aadharNumber)) {
            return res.status(400).json({ message: 'Aadhar number must be 12 digits' });
        }
        if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });
        if (!validator.isMobilePhone(phoneNumber)) return res.status(400).json({ message: 'Invalid phone number' });
        if (!address) return res.status(400).json({ message: 'Address is required' });
        if (!profilePicture) return res.status(400).json({ message: 'Profile picture is required' });
        if (!idProofPhoto) return res.status(400).json({ message: 'ID proof photo is required' });
    
        // Check if customer already exists
        const customerExists = await Customer.findOne({ email });
        if (customerExists) {
            return res.status(400).json({ message: 'Customer already exists' });
        }
    
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        const customer = await Customer.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            pin,
            aadharNumber,
            phoneNumber,
            alternatePhoneNumber:alternativeNumber,
            address,
            profilePicture:profilePicture,
            idProofPhoto:idProofPhoto,
        });
    
        await Promise.all([
            createNotification(
                [{ userId: customer._id, userType: 'customer' }],
                'Welcome! Your customer account has been created.',
                'accountCreation',
                'Account Created'
            ),
            sendEmail(
                customer.email,
                'Account Created',
                'Welcome to our platform! Your customer account has been successfully created.'
            ),
        ]);
    
        res.status(201).json({
            _id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            token: generateToken(customer._id, 'customer'),
            aadharNumber: customer.aadharNumber,
            phoneNumber: customer.phoneNumber,
            alternativeNumber: customer.alternatePhoneNumber,
            address: customer.address,
            profilePicture: customer.profilePicture,
            idProofPhoto: customer.idProofPhoto,
        });
    
        logger.info(`Customer ${customer.email} registered successfully.`);
    }),
    
    
    getCustomerProfile: asyncHandler(async (req, res) => {
        console.log("🔥 getCustomerProfile route hit");
    
        const customer = await Customer.findById(req.user._id).select('-password');
        console.log('customer', customer);
    
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
    
        res.json(customer);
    }),
    

    updateCustomerProfile: asyncHandler(async (req, res) => {
        const customer = await Customer.findById(req.user.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const { firstName, lastName, email, password, aadharNumber, phoneNumber, alternativeNumber } = req.body;

        if (firstName) customer.firstName = firstName;
        if (lastName) customer.lastName = lastName;
        if (email) customer.email = email;
        if (aadharNumber) customer.aadharNumber = aadharNumber;
        if (phoneNumber) customer.phoneNumber = phoneNumber;
        if (req.file && req.file.path) customer.idProof = req.file.path;
        if (alternativeNumber) customer.alternativeNumber = alternativeNumber;

        if (password) {
            const isSamePassword = await bcrypt.compare(password, customer.password);
            if (isSamePassword) {
                return res.status(400).json({ message: 'New password cannot be the same as the old password' });
            }
            const salt = await bcrypt.genSalt(10);
            customer.password = await bcrypt.hash(password, salt);
        }

        const updatedCustomer = await customer.save();

        await createNotification(
            [{ userId: updatedCustomer._id, userType: 'customer' }],
            'Your profile has been updated.',
            'profileUpdate',
            'Profile Updated'
        );

        await sendEmail(
            updatedCustomer.email,
            'Profile Updated',
            'Your profile has been successfully updated.'
        );

        res.json({
            _id: updatedCustomer.id, firstName: updatedCustomer.firstName, lastName: updatedCustomer.lastName,
            email: updatedCustomer.email, aadharNumber: updatedCustomer.aadharNumber, phoneNumber: updatedCustomer.phoneNumber,
            idProof: updatedCustomer.idProof, alternativeNumber: updatedCustomer.alternativeNumber,
        });
        logger.info(`Customer ${customer.email} profile updated successfully.`);
    }),

    deleteCustomer: asyncHandler(async (req, res) => {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id, { isDeleted: true }, { new: true }
        );

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await createNotification(
            [{ userId: customer._id, userType: 'customer' }],
            'Your account has been deactivated.',
            'accountDeactivation',
            'Account Deactivated'
        );

        await sendEmail(
            customer.email,
            'Account Deactivated',
            'Your account has been deactivated. You can contact support to reactivate it.'
        );

        res.json({ message: 'Customer deactivated successfully' });
        logger.info(`Customer ${customer.email} deactivated.`);
    }),

    forgotPin: asyncHandler(async (req, res) => {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetLink = `${req.protocol}://${req.get('host')}/reset-pin/${resetToken}`;

        try {
            await sendEmail(customer.email, 'PIN Reset', `Please use this link to reset your PIN: ${resetLink}`);
            res.status(200).json({ message: 'Reset link sent successfully' });
            logger.info(`PIN reset link sent to ${customer.email}`);
        } catch (err) {
            logger.error(`Failed to send pin reset email for customer ${customer.email}: ${err.message}`);
            res.status(500).json({ message: 'Failed to send email' });
        }
    }),

    changePin: asyncHandler(async (req, res) => {
        const customer = await Customer.findById(req.user.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const { oldPin, newPin } = req.body;

        if (oldPin !== customer.pin) {
            return res.status(400).json({ message: 'Incorrect old PIN' });
        }

        customer.pin = newPin;
        await customer.save();

        await createNotification(
            [{ userId: customer._id, userType: 'customer' }],
            'Your PIN has been changed.',
            'pinChange',
            'PIN Changed'
        );

        await sendEmail(
            customer.email,
            'PIN Changed',
            'Your PIN has been successfully changed.'
        );

        res.json({ message: 'PIN changed successfully' });
        logger.info(`Customer ${customer.email} PIN changed successfully.`);
    }),

    deleteCustomerByAdmin: asyncHandler(async (req, res) => {
        const { customerId } = req.params;

        const customer = await Customer.findByIdAndUpdate(customerId, { isDeleted: true }, { new: true });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await createNotification(
            [{ userId: req.user.id, userType: 'admin' }],
            `Customer ${customer.email} deleted by admin.`,
            'customerDeletedByAdmin',
            'Customer Deleted'
        );

        await sendEmail(
            req.user.email,
            'Customer Deleted',
            `Customer with email ${customer.email} has been deleted by you.`
        );

        res.json({ message: 'Customer deleted by admin successfully' });
        logger.info(`Customer ${customer.email} deleted by admin.`);
    }),

    getCreditTransactions : asyncHandler( async (req, res) => {
        try {
          const transactions = await CustomerCreditTransaction.find({ type: 'credit' })
            .populate('customer', 'name email');
            
      
          const paidCredits = transactions.filter(txn => txn.paymentStatus === 'succeeded');
          const unpaidCredits = transactions.filter(txn => txn.paymentStatus !== 'succeeded');
      
          const formatData = (list) =>
            list.map(txn => ({
              id: txn._id,
              name: txn.customer.name,
              email: txn.customer.email,
              amount: txn.amount,
              dueDate: new Date(txn.createdAt).toISOString().split('T')[0],
              status: txn.paymentStatus === 'succeeded' ? 'Paid' : 'Unpaid',
            }));
      
          res.status(200).json({
            paid: formatData(paidCredits),
            unpaid: formatData(unpaidCredits),
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to fetch credit transactions' });
        }
      }),
};

module.exports = customerController;