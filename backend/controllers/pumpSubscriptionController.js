const Pump = require('../models/pumpModel');
const PumpSubscription = require('../models/pumpSubscriptionModel');
const AdminTransaction = require('../models/adminTransactionModel');
const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');
const logger = require('../utils/logger');
const cron = require('node-cron');

// Function to deactivate expired subscriptions
async function deactivateExpiredSubscriptions() {
    try {
        const now = new Date();
        const expiredSubscriptions = await PumpSubscription.find({
            endDate: { $lt: now },
            status: 'active',
        });

        logger.info(`Found ${expiredSubscriptions.length} expired subscriptions.`);

        for (const subscription of expiredSubscriptions) {
            logger.info(`Deactivating subscription ${subscription._id}.`);
            subscription.status = 'past_due';
            await subscription.save();
            await Pump.findByIdAndUpdate(subscription.pump, { isSubscribed: false });

            logger.info(`Subscription ${subscription._id} deactivated.`);
        }
        logger.info('Deactivate expired subscriptions job completed.');
    } catch (error) {
        logger.error(`Error deactivating expired subscriptions: ${error}`);
    }
}

// Schedule the task to run daily at midnight
cron.schedule('0 0 * * *', deactivateExpiredSubscriptions);

const pumpSubscriptionController = {
    createSubscription: asyncHandler(async (req, res) => {
        const { pumpId,paymentMethod } = req.body; // Removed paymentMethod from here if using PaymentElement
        const pumpOwnerId = req.user.id;
        console.log(req.user);
    
        if (!pumpId) {
            return res.status(400).json({ message: 'Pump ID is required' });
        }
    
        const pump = await Pump.findById(pumpId);
        if (!pump) {
            return res.status(404).json({ message: 'Pump not found' });
        }
        console.log("pump",pump);
        
    
        if (pump.pumpOwner.toString() !== pumpOwnerId) {
            return res.status(403).json({ message: 'You do not own this pump' });
        }
    
        if (pump.status !== 'approved') {
            return res.status(403).json({ message: 'Pump is not approved yet' });
        }
    
        // const subscription = await PumpSubscription.findOne({ pump: pumpId, status: 'active' });
        // if (subscription) {
        //     return res.status(400).json({ message: 'Pump is already subscribed' });
        // }
        // console.log(subscription);
        
    
        const halfYear = 6 * 30 * 24 * 60 * 60 * 1000;
        const endDate = new Date(Date.now() + halfYear);
    
        try {
            const stripeSubscription = await stripe.subscriptions.create({
                customer: req.user.stripeCustomerId,
                items: [{ price: process.env.STRIPE_PUMP_PRICE_ID }],
                payment_behavior: 'default_incomplete',
                payment_settings: {
                    save_default_payment_method: 'on_subscription',
                },
                expand: ['latest_invoice.payment_intent'],
                metadata: { pumpId, pumpOwnerId },
            });
    
            const newSubscription = await PumpSubscription.create({
                pump: pumpId,
                pumpOwner: pumpOwnerId,
                startDate: Date.now(),
                endDate: endDate,
                stripeSubscriptionId: stripeSubscription.id,
                paymentMethod: 'stripe', // Or consider not storing this here initially
                status: 'active',
                isSubscribed: true,
            });
    
            res.status(200).json({
                clientSecret: stripeSubscription.latest_invoice.payment_intent.client_secret,
                subscriptionId: newSubscription._id,
            });
            logger.info(`Subscription created for pump ${pumpId}`);
        } catch (error) {
            logger.error(`Stripe error creating subscription: ${error.message}`);
            res.status(500).json({ message: 'Failed to create subscription' });
        }
    }),

    createWithoutSubs:  asyncHandler(async (req, res) => {
        const { pumpId, } = req.body; // Removed paymentMethod from here if using PaymentElement
        const pumpOwnerId = req.user.id;
        console.log(req.user);
    
        if (!pumpId) {
            return res.status(400).json({ message: 'Pump ID is required' });
        }
    
        const pump = await Pump.findById(pumpId);
        if (!pump) {
            return res.status(404).json({ message: 'Pump not found' });
        }
        console.log("pump", pump);
    
    
        if (pump.pumpOwner.toString() !== pumpOwnerId) {
            return res.status(403).json({ message: 'You do not own this pump' });
        }
    
        if (pump.status !== 'approved') {
            return res.status(403).json({ message: 'Pump is not approved yet' });
        }
    
        // const subscription = await PumpSubscription.findOne({ pump: pumpId, status: 'active' });
        // if (subscription) {
        //     return res.status(400).json({ message: 'Pump is already subscribed' });
        // }
        // console.log(subscription);
    
    
        const halfYear = 6 * 30 * 24 * 60 * 60 * 1000;
        const endDate = new Date(Date.now() + halfYear);
    
        try {
            const stripeSubscription = await stripe.subscriptions.create({
                customer: req.user.stripeCustomerId,
                items: [{ price: process.env.STRIPE_PUMP_PRICE_ID }],
                payment_behavior: 'default_incomplete',
                payment_settings: {
                    save_default_payment_method: 'on_subscription',
                },
                expand: ['latest_invoice.payment_intent'],
                metadata: { pumpId, pumpOwnerId },
            });
    
            const newSubscription = await PumpSubscription.create({
                pump: pumpId,
                pumpOwner: pumpOwnerId,
                startDate: Date.now(),
                endDate: endDate,
                stripeSubscriptionId: stripeSubscription.id,
                paymentMethod: 'stripe', // Or consider not storing this here initially
                status: 'active',  //set to active
                isSubscribed: true,
            });

            await Pump.findByIdAndUpdate(pumpId,{isSubscribed:true},{new:true,runValidators:true})
    
             // Simulate successful payment processing and handle it immediately.
            const adminTransaction = await AdminTransaction.create({
                customer: pumpOwnerId,
                pumpOwner: pumpOwnerId,
                pump: pumpId,
                amount: 200, //  Replace with actual amount from stripeSubscription if available
                transactionId: stripeSubscription.latest_invoice.payment_intent.id, //mock
                paymentStatus: 'succeeded', //  Hardcode success
                paymentMethod: 'stripe',
                type: 'subscription',
            });
    
            //send notification
            await createNotification(
                [{ userId: pumpOwnerId, userType: 'pumpOwner' }],
                `Pump subscription payment succeeded for ${pump.pumpName}.`,
                `pumpSubscriptionPayment`,
                `Pump Subscription Payment`
            );
    
            //send email
            await sendEmail(
                req.user.email,
                `Pump Subscription Payment`,
                `Your subscription payment was successful.`
            );
    
            res.status(200).json({
                clientSecret: stripeSubscription.latest_invoice.payment_intent.client_secret,
                subscriptionId: newSubscription._id,
            });
            logger.info(`Subscription created for pump ${pumpId}`);
        } catch (error) {
            logger.error(`Stripe error creating subscription: ${error.message}`);
            res.status(500).json({ message: 'Failed to create subscription' });
        }
    }),

    stripeWebhook: asyncHandler(async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_PUMP_WEBHOOK_SECRET);
        } catch (err) {
            logger.error(`Stripe Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        const handleSubscriptionEvent = async (subscription, status) => {
            const pumpSubscription = await PumpSubscription.findOne({ stripeSubscriptionId: subscription.id }).populate('pumpOwner').populate('pump');

            if (pumpSubscription) {
                pumpSubscription.status = status;
                pumpSubscription.endDate = new Date(subscription.current_period_end * 1000); // Update end date
                await pumpSubscription.save();
                await Pump.findByIdAndUpdate(pumpSubscription.pump._id, { isSubscribed: status === 'active' });

                const amount = subscription.latest_invoice ? subscription.latest_invoice.amount_paid / 100 : 200; // Default amount or from invoice
                const transactionId = subscription.latest_invoice ? subscription.latest_invoice.payment_intent : null;
                const paymentMethodType = subscription.latest_invoice?.payment_settings?.payment_method_types?.[0] || 'stripe';

                await AdminTransaction.create({
                    customer: pumpSubscription.pumpOwner._id,
                    pumpOwner: pumpSubscription.pumpOwner._id,
                    pump: pumpSubscription.pump._id,
                    amount: amount,
                    transactionId: transactionId,
                    paymentStatus: status === 'active' ? 'succeeded' : 'failed',
                    paymentMethod: paymentMethodType,
                    type: 'subscription_payment',
                });

                const notificationType = status === 'active' ? 'pumpSubscriptionPayment' : 'pumpSubscriptionPaymentFailed';
                const notificationTitle = status === 'active' ? 'Pump Subscription Payment' : 'Pump Subscription Payment Failed';
                const notificationMessage = status === 'active'
                    ? `Pump subscription payment succeeded for ${pumpSubscription.pump.pumpName}.`
                    : `Pump subscription payment failed for ${pumpSubscription.pump.pumpName}. Please check your payment details.`;

                await createNotification(
                    [{ userId: pumpSubscription.pumpOwner._id, userType: 'pumpOwner' }],
                    notificationMessage,
                    notificationType,
                    notificationTitle
                );

                const emailSubject = notificationTitle;
                const emailMessage = notificationMessage;
                await sendEmail(pumpSubscription.pumpOwner.email, emailSubject, emailMessage);
            }
        };

        switch (event.type) {
            case 'customer.subscription.updated':
            case 'customer.subscription.created':
            case 'customer.subscription.deleted':
                await handleSubscriptionEvent(event.data.object, event.data.object.status);
                break;
            case 'invoice.payment_succeeded':
                await handleSubscriptionEvent(event.data.object.subscription_details || event.data.object, 'active');
                break;
            case 'invoice.payment_failed':
                await handleSubscriptionEvent(event.data.object.subscription_details || event.data.object, 'past_due');
                break;
            default:
                logger.warn(`Unhandled event type ${event.type}`);
        }

        res.send();
    }),

    getSubscriptionStatus: asyncHandler(async (req, res) => {
        const status = req.query.status;
        const { user } = req;

        let subscriptions;

        if (user.role === 'admin') {
            subscriptions = await PumpSubscription.find(status ? { status } : {}).populate('pump').populate('pumpOwner');
        } else if (user.role === 'pumpOwner') {
            subscriptions = await PumpSubscription.find({ pumpOwner: user._id, status: status ? status : {} }).populate('pump');
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (subscriptions && subscriptions.length > 0) {
            res.status(200).json({ subscribed: true, subscriptions });
        } else {
            res.status(200).json({ subscribed: false, subscriptions: [] });
        }
    }),

    getPumpsByOwner: asyncHandler(async (req, res) => {
        const pumpOwnerId = req.user.id;
        const pumps = await Pump.find({ pumpOwner: pumpOwnerId });
        res.status(200).json(pumps);
        logger.info(`Pumps retrieved for owner ${pumpOwnerId}`);
    }),
};

module.exports = pumpSubscriptionController;