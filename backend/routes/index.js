const express = require('express');
const router = express.Router();

const adminRouter = require('./adminRoutes');
const pumpOwnerRouter = require('./pumpOwnerRoutes');
const pumpRouter = require('./pumpRoutes');
const salesRepRouter = require('./salesRepRoutes');
const customerRouter = require('./customerRoutes');
const notificationRouter = require('./notificationRoutes');
const transactionRouter = require('./transactionRoutes');
const authRouter = require('./authRouter');
const customerCreditTransactionRouter = require('./customerCreditTransactionRouter');
const pumpSubscriptionRouter = require('./pumpSubscriptionRouter');


router.use('/pump-subscription',pumpSubscriptionRouter)
router.use('/customer-credit-transaction',customerCreditTransactionRouter)
// API Routes

router.use(express.json());

router.use('/admin',adminRouter)
router.use('/auth',authRouter)
router.use('/customer',customerRouter)
router.use("/notification",notificationRouter)
router.use('/pump-owner',pumpOwnerRouter)
router.use('/pump',pumpRouter)
router.use('/salesRep',salesRepRouter)
router.use('/transcation',transactionRouter)

module.exports = router

