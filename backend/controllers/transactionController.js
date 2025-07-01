const AdminTransaction = require('../models/adminTransactionModel');
const PumpTransaction = require('../models/pumpTransactionModel');
const Customer = require('../models/customerModel');
const Pump = require('../models/pumpModel');
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationService');
const logger = require('../utils/logger');
const CustomerCreditTransaction = require('../models/customerCreditTransactionModel');
const mongoose = require('mongoose');

const transactionController = {
    recordFuelSale: asyncHandler(async (req, res) => {
        const { customerEmail, fuelAmount, fuelPrice, paymentType, pin, fuelType } = req.body;
        const salesRepPumpId = req.user.pump;
      
        if (!customerEmail || !fuelAmount || !fuelPrice || !pin || !fuelType) {
          return res.status(400).json({ message: 'All fields are required' });
        }
      
        if (!['petrol', 'diesel', 'cng'].includes(fuelType)) {
          return res.status(400).json({ message: 'Invalid fuel type' });
        }
      
        if (!customerEmail.includes('@')) {
          return res.status(400).json({ message: 'Invalid customer email' });
        }
      
        if (fuelAmount <= 0 || fuelPrice <= 0) {
          return res.status(400).json({ message: 'Fuel amount and price must be positive numbers' });
        }
      
        const customerDetails = await Customer.findOne({ email: customerEmail });
        if (!customerDetails) {
          return res.status(404).json({ message: 'Customer not found with provided email' });
        }
      
        if (customerDetails.isCreditSuspended) {
          return res.status(403).json({ message: 'Credit usage is currently suspended for this customer.' });
        }
      
        const pump = await Pump.findById(salesRepPumpId);
        if (!pump) {
          return res.status(404).json({ message: 'Pump not found for sales rep' });
        }
      
        if (customerDetails.pin !== pin) {
          return res.status(401).json({ message: 'Incorrect PIN' });
        }
      
        const totalPrice = parseFloat(fuelAmount);
      
        if (customerDetails.credit < totalPrice) {
          return res.status(402).json({ message: 'Insufficient credit' });
        }
      
        // 🔻 Reduce Customer Credit
        const updatedCredit = customerDetails.credit - totalPrice;
        customerDetails.credit = updatedCredit;
        await customerDetails.save();
      
        const transaction = await PumpTransaction.create({
          customer: customerDetails._id,
          pump: pump._id,
          salesRep: req.user.id,
          fuelQuantity: fuelAmount,
          fuelPrice,
          paymentType,
          amount: totalPrice,
          fuelType,
        });
      
        await createNotification(
          [{ userId: customerDetails._id, userType: 'customer' }],
          `Fuel sale recorded for ₹${fuelAmount} of ${fuelType}.`,
          'fuelSale',
          'Fuel Sale Recorded'
        );
      
        await sendEmail(
          customerDetails.email,
          'Fuel Sale Recorded',
          `A fuel sale of ₹${fuelAmount} (${fuelType}) has been recorded. Remaining credit: ₹${updatedCredit.toFixed(2)}.`
        );
      
        res.status(201).json({
            message: 'Fueling successful',
            transaction,
            chargedAmount: parseFloat(fuelAmount),
            remainingCredit: updatedCredit,
          });
      
        logger.info(`Fuel sale recorded for customer: ${customerEmail}, fuel: ${fuelType}, pump: ${pump._id}`);
      }),  

    getAllTransactions: asyncHandler(async (req, res) => {
        try {
            const adminTransactions = await AdminTransaction.find({}).populate('customer').populate('pumpOwner');
            const pumpTransactions = await PumpTransaction.find({}).populate('customer').populate('pump').populate('salesRep');
            res.json({ adminTransactions, pumpTransactions });
            logger.info('All transactions retrieved');
        } catch (error) {
            logger.error(`Error getting all transactions: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }),

    getCustomerTransactions: asyncHandler(async (req, res) => {
        try {
            const pumpTransactions = await PumpTransaction.find({ customer: req.user.id }).populate('customer').populate('pump').populate('salesRep');
            const adminTransactions = await AdminTransaction.find({ customer: req.user.id }).populate('customer').populate('pumpOwner');
            res.json({ pumpTransactions, adminTransactions });
            logger.info(`Transactions retrieved for customer: ${req.user.id}`);
        } catch (error) {
            logger.error(`Error getting customer transactions: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }),

    getPumpOwnerTransactions: asyncHandler(async (req, res) => {
        try {
            const adminTransactions = await AdminTransaction.find({ pumpOwner: req.user.id }).populate('customer').populate('pumpOwner');
            res.json({ adminTransactions });
            logger.info(`Transactions retrieved for pump owner: ${req.user.id}`);
        } catch (error) {
            logger.error(`Error getting pump owner transactions: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }),

    getSalesRepTransactions: asyncHandler(async (req, res) => {
        try {
            const pumpTransactions = await PumpTransaction.find({ salesRep: req.user.id }).populate('customer').populate('pump').populate('salesRep');
            res.json({ pumpTransactions });
            logger.info(`Transactions retrieved for sales rep: ${req.user.id}`);
        } catch (error) {
            logger.error(`Error getting sales rep transactions: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }),

    getRecentPumpTransactions: asyncHandler(async (req, res) => {
        try {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
          const recentPayments = await PumpTransaction.find({
            createdAt: { $gte: oneHourAgo },
            paymentType: "credit",
            status: "completed",
          })
            .populate({
              path: "customer",
              select: "firstName lastName", // ✅ correct fields from Customer model
            })
            .sort({ createdAt: -1 });
      
          const formatted = recentPayments.map((txn) => {
            const fullName = txn.customer
              ? `${txn.customer.firstName} ${txn.customer.lastName}`
              : "Unknown";
      
            return {
              _id: txn._id,
              amount: txn.amount,
              fuelType: txn.fuelType,
              paymentType: txn.paymentType,
              createdAt: txn.createdAt,
              customerName: fullName,
            };
          });
      
          res.status(200).json(formatted);
        } catch (error) {
          console.error("Error fetching recent transactions:", error);
          res.status(500).json({ message: "Server Error" });
        }
      }),
      
      getOwnerPumpSales: asyncHandler(async (req, res) => {
        try {
          const ownerId = req.user.id; // Assuming auth middleware sets this
          const ownerObjectId = new mongoose.Types.ObjectId(ownerId); // Convert ownerId to ObjectId
      
          // Log ownerObjectId to verify
          console.log("Owner ObjectId: ", ownerObjectId);
      
          // Find only approved pumps for the owner
          const pumps = await Pump.find({
            pumpOwner: ownerObjectId,
            status: "approved" // Filter by status
          });
          console.log("Approved Pumps for owner:", pumps); // Log approved pumps for debugging
      
          if (pumps.length === 0) {
            return res.status(404).json({ message: "No approved pumps found." });
          }
      
          const salesData = await Promise.all(
            pumps.map(async (pump) => {
              const sales = await PumpTransaction.aggregate([
                {
                  $match: {
                    pump: pump._id,
                    paymentStatus: "succeeded"
                  }
                },
                {
                  $group: {
                    _id: "$fuelType",
                    totalAmount: { $sum: "$amount" }
                  }
                }
              ]);
      
              const formatted = {
                petrol: 0,
                diesel: 0,
                cng: 0
              };
      
              sales.forEach((s) => {
                formatted[s._id.toLowerCase()] = s.totalAmount;
              });
      
              return {
                pumpId: pump._id,
                pumpName: pump.pumpName, // Use 'pumpName' instead of 'name'
                fuelSales: formatted
              };
            })
          );
      
          res.status(200).json({ salesData });
      
        } catch (error) {
          console.error("Error fetching pump sales:", error);
          res.status(500).json({ message: "Server error" });
        }
      }),

       getAllOwnerPumpSales : asyncHandler(async (req, res) => {
        try {
          const ownerId = req.user.id;
          const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
      
          // Get all approved pumps owned by the user
          const pumps = await Pump.find({
            pumpOwner: ownerObjectId,
            status: "approved"
          });
      
          if (pumps.length === 0) {
            return res.status(404).json({ message: "No approved pumps found." });
          }
      
          const pumpIds = pumps.map((p) => p._id);
          console.log("Pump IDs:", pumpIds);  // Log pump IDs
      
          // Query to get the sales data (no date filtering)
          const sales = await PumpTransaction.aggregate([
            {
              $match: {
                pump: { $in: pumpIds },
                paymentStatus: "succeeded",
              }
            },
            {
              $group: {
                _id: "$fuelType",
                totalAmount: { $sum: "$amount" },
                date: { $first: "$date" },  // Include the date field for filtering on the frontend
              }
            }
          ]);
          
          const grandTotalAmount = sales.reduce((total, item) => total + item.totalAmount, 0);
         
          console.log("Sales Data:", sales);  // Log the sales data
      
          if (sales.length === 0) {
            return res.status(404).json({ message: "No sales data found." });
          }
      
          // Initialize fuel sales object with all fuel types
          const fuelSales = {
            petrol: 0,
            diesel: 0,
            cng: 0
          };
      
          // Loop through the aggregated sales and update fuel sales
          sales.forEach((s) => {
            const fuelType = s._id.toLowerCase();  // Convert fuel type to lowercase for consistency
            if (fuelSales[fuelType] !== undefined) {
              fuelSales[fuelType] = s.totalAmount;
            }
          });
      
          // Return the fuel sales data
          res.status(200).json({ fuelSales, sales ,grandTotalAmount});  // Include the sales array in the response
      
        } catch (error) {
          console.error("Error fetching fuel sales:", error);
          res.status(500).json({ message: "Server error" });
        }
      }),
      
      
};

module.exports = transactionController;