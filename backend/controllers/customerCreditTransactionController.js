const CustomerCreditTransaction = require('../models/customerCreditTransactionModel');
const Customer = require('../models/customerModel');
const AdminTransaction = require('../models/adminTransactionModel');
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Replace with the latest
});
const logger = require('../utils/logger');
const crypto = require('crypto');
const PumpTransaction = require('../models/pumpTransactionModel');
const moment = require('moment');

const customerCreditTransactionController = {
    recordCreditTransaction: asyncHandler(async (req, res) => {
        const { amount } = req.body;
        const customerId = req.user.id;

        if (typeof amount !== 'number' || amount === 0) {
            return res.status(400).json({ message: 'Amount must be a non-zero number' });
        }

        const type = amount > 0 ? 'credit' : 'payment';

        // Fetch customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Prevent new credit if there's existing debt
        if (amount > 0 && customer.credit < 0) {
            return res.status(403).json({ message: 'Please settle your previous debt before requesting more credit.' });
        }

        // Monthly credit limit validation (only for new credit)
        if (amount > 0) {
            const startOfMonth = moment().startOf('month').toDate();
            const endOfMonth = moment().endOf('month').toDate();

            const monthlyCredits = await CustomerCreditTransaction.aggregate([
                {
                    $match: {
                        customer: customer._id,
                        type: 'credit',
                        creditRequestStatus: 'approved',
                        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            const currentMonthTotal = monthlyCredits[0]?.total || 0;
            const totalAfterRequest = currentMonthTotal + amount;

            if (totalAfterRequest > customer.creditLimit) {
                return res.status(403).json({
                    message: `Monthly credit limit exceeded. You've already used ₹${currentMonthTotal}, your limit is ₹${customer.creditLimit}.`
                });
            }
        }

        // Create transaction
        const transaction = await CustomerCreditTransaction.create({
            customer: customerId,
            amount,
            type,
            creditRequestStatus: type === 'credit' ? 'approved' : 'not_applicable',
            transactionId: crypto.randomBytes(16).toString('hex'),
            transactionDate: new Date(),
            note: `${type === 'credit' ? 'Credit issued' : 'Customer payment'} of ₹${Math.abs(amount)}`,
        });

        // Update customer credit balance
        customer.credit += amount;
        await customer.save();

        // Notify user
        await createNotification(
            [{ userId: customerId, userType: 'customer' }],
            `₹${Math.abs(amount)} ${type} recorded.`,
            'creditTransaction',
            'Credit Transaction Recorded'
        );

        // Email confirmation
        await sendEmail(
            customer.email,
            'Credit Transaction Recorded',
            `A credit ${type} of ₹${Math.abs(amount)} has been recorded. New balance: ₹${customer.credit}.`
        );

        // Respond to client
        res.status(201).json(transaction);

        // Log the event
        logger.info(`Credit transaction recorded for customer ${customer.email}, amount: ₹${amount}, type: ${type}`);
    }),

    getCreditTransactions: asyncHandler(async (req, res) => {
        const customerId = req.user.id;
        console.log("Customer ID from token:", customerId);
        console.log("User role:", req.user.role);

        let creditTransactions;
        if (req.user.role === "admin") {
            // Fetch all transactions for admin with customer population
            creditTransactions = await CustomerCreditTransaction.find({})
                .populate("customer", "firstName lastName email") // Updated to match schema
                .sort({ transactionDate: -1 });
        } else {
            // Fetch only customer's transactions with customer population
            creditTransactions = await CustomerCreditTransaction.find({ customer: customerId })
                .populate("customer", "firstName lastName email") // Updated to match schema
                .sort({ transactionDate: -1 });
        }
        console.log("Fetched creditTransactions:", creditTransactions);

        const approvedCredits = creditTransactions.filter(
            (txn) => txn.type === "credit" && txn.creditRequestStatus === "approved"
        );
        const totalApprovedCredit = approvedCredits.reduce((sum, txn) => sum + txn.amount, 0);

        const fuelingTransactions = await PumpTransaction.find({
            customer: customerId,
            paymentType: "credit",
            paymentStatus: "succeeded",
        }).sort({ createdAt: -1 });

        const usedCredit = fuelingTransactions.reduce((total, txn) => total + txn.amount, 0);
        const balanceCredit = totalApprovedCredit - usedCredit;

        const firstApprovedCredit = approvedCredits[0]?.transactionDate || new Date();
        const daysLeft = Math.max(
            30 - Math.floor((new Date() - new Date(firstApprovedCredit)) / (1000 * 60 * 60 * 24)),
            0
        );

        res.status(200).json({
            totalApprovedCredit,
            usedCredit,
            balanceCredit,
            paybackDaysLeft: daysLeft,
            creditTransactions,
            fuelingTransactions,
        });
    }),

    getCreditTransactionByIdForAdmin: asyncHandler(async (req, res) => {
        const creditId = req.params.creditId;

        // Find the credit transaction and populate customer
        const creditTransaction = await CustomerCreditTransaction.findById(creditId).populate("customer");
        if (!creditTransaction) {
            return res.status(404).json({ message: "Credit transaction not found" });
        }

        const customerId = creditTransaction.customer._id;

        // Get all credit transactions of the same customer
        const creditTransactions = await CustomerCreditTransaction.find({ customer: customerId }).sort({ transactionDate: -1 });

        const approvedCredits = creditTransactions.filter(
            (txn) => txn.type === "credit" && txn.creditRequestStatus === "approved"
        );
        const totalApprovedCredit = approvedCredits.reduce((sum, txn) => sum + txn.amount, 0);

        const fuelingTransactions = await PumpTransaction.find({
            customer: customerId,
            paymentType: "credit",
            paymentStatus: "succeeded",
        }).sort({ createdAt: -1 });

        const usedCredit = fuelingTransactions.reduce((total, txn) => total + txn.amount, 0);
        const balanceCredit = totalApprovedCredit - usedCredit;

        const firstApprovedCredit = approvedCredits[0]?.transactionDate || new Date();
        const daysLeft = Math.max(
            30 - Math.floor((new Date() - new Date(firstApprovedCredit)) / (1000 * 60 * 60 * 24)),
            0
        );

        res.status(200).json({
            customer: creditTransaction.customer,
            selectedTransaction: creditTransaction,
            totalApprovedCredit,
            usedCredit,
            balanceCredit,
            paybackDaysLeft: daysLeft,
            transactions: creditTransactions,
        });
    }),

    payDebt: asyncHandler(async (req, res) => {
        const { amount, transactionId } = req.body;
        const customerId = req.user._id;
    
        console.log(amount, transactionId);
    
    
        if (!amount || !transactionId) {
            return res.status(400).json({ message: 'Amount and transactionId are required' });
        }
    
        if (typeof amount !== 'number') {
            return res.status(400).json({ message: 'Amount must be a number' });
        }
    
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
    
        try {
            // Create a PaymentIntent (mocked for testing)
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // Stripe uses cents
                currency: 'usd',
                metadata: { customerId: customerId.toString(), transactionId: transactionId },
            });
    
            // Simulate successful payment
            const status = 'succeeded';
    
            //update the transaction
            const updatedTransaction = await CustomerCreditTransaction.findOneAndUpdate(
                { _id: transactionId, paymentStatus: 'pending' },
                { paymentStatus: status }
            );
    
            if (updatedTransaction) {
                // Create an admin transaction record
                const adminTransaction = await AdminTransaction.create({
                    customer: customerId,
                    amount: amount,
                    paymentStatus: status,
                    paymentMethod: 'stripe',
                    type: 'debtPayment',
                    transactionId: paymentIntent.id,  // Use the mock paymentIntent ID
                    transactionDate: Date.now(),
                });
                console.log("Admin Transaction Created:", adminTransaction);
    
                //send notification
                await createNotification(
                    [{ userId: customerId, userType: 'customer' }],
                    `Debt payment of $${amount} ${status}.`,
                    `debtPayment${status === 'failed' ? 'Failed' : ''}`,
                    `Debt Payment ${status === 'failed' ? 'Failed' : 'Recorded'}`
                );
    
                // Send email
                await sendEmail(
                    customer.email,
                    `Debt Payment ${status === 'failed' ? 'Failed' : 'Recorded'}`,
                    `Your debt payment of $${amount} has ${status}. Your new credit balance is: $${customer.credit + (status === 'succeeded' ? amount : 0)}`
                );
    
                // Update customer credit
                if (status === 'succeeded') {
                    customer.credit += amount;
                    await customer.save();
                }
                logger.info(`Debt payment ${status} for transaction ${transactionId}, customer: ${customer.email}, amount: ${amount}`);
                res.json({ clientSecret: paymentIntent.client_secret });
    
            } else {
                logger.warn(`Pending transaction not found for transaction ${transactionId}, amount ${amount}`);
                return res.status(400).json({ message: 'Pending transaction not found' });
            }
    
    
        } catch (error) {
            logger.error(`Stripe error for customer ${customer.email}, amount: ${amount}: ${error.message}`);
            return res.status(500).json({ message: 'Payment processing error', error: error.message });
        }
    }),
    

    stripeWebhook: asyncHandler(async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_USER_WEBHOOK_SECRET);
        } catch (err) {
            logger.error(`Stripe Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        const handlePaymentIntentEvent = async (paymentIntent, status) => {
            const customerId = paymentIntent.metadata.customerId;
            const amount = paymentIntent.amount / 100;
            const transactionId = paymentIntent.metadata.transactionId;

            if (customerId && transactionId) {
                const updatedTransaction = await CustomerCreditTransaction.findOneAndUpdate(
                    { _id: transactionId, paymentStatus: 'pending' },
                    { paymentStatus: status }
                );

                if (updatedTransaction) {
                    await AdminTransaction.create({
                        customer: customerId,
                        amount: amount,
                        paymentStatus: status,
                        paymentMethod: 'stripe',
                        type: 'debtPayment',
                        transactionId: paymentIntent.id,
                        transactionDate: Date.now(),
                    });

                    await createNotification(
                        [{ userId: customerId, userType: 'customer' }],
                        `Debt payment of ${amount} ${status}.`,
                        `debtPayment${status === 'failed' ? 'Failed' : ''}`,
                        `Debt Payment ${status === 'failed' ? 'Failed' : 'Recorded'}`
                    );

                    const customer = await Customer.findById(customerId);

                    await sendEmail(
                        customer.email,
                        `Debt Payment ${status === 'failed' ? 'Failed' : 'Recorded'}`,
                        `Your debt payment of ${amount} has ${status}. Your new credit balance is: ${customer.credit + (status === 'succeeded' ? amount : 0)}`
                    );

                    if (status === 'succeeded') {
                        customer.credit += amount;
                        await customer.save();
                    }
                    logger.info(`Debt payment ${status} for transaction ${transactionId}, customer: ${customer.email}, amount: ${amount}`);
                } else {
                    logger.warn(`Pending transaction not found for transaction ${transactionId}, amount ${amount}`);
                }
            }
        };

        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentIntentEvent(event.data.object, 'succeeded');
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentEvent(event.data.object, 'failed');
                break;
            default:
                logger.warn(`Unhandled event type ${event.type}`);
        }

        res.send();
    }),
};

module.exports = customerCreditTransactionController;