const Pump = require('../models/pumpModel');
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationService');
const logger = require('../utils/logger');
const SalesRep = require('../models/salesRepModel');
const geocode = require('../utils/geocodeService');
const reverseGeocode = require('../utils/reverseGeocode ');

const pumpController = {
    getAllPumps: asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: 'Page and limit must be positive integers' });
        }

        const pumps = await Pump.find({})
            .populate('pumpOwner')
            .skip(skip)
            .limit(limit);

        const total = await Pump.countDocuments({});

        res.json({ pumps, page, limit, total });
        logger.info(`All pumps retrieved, page: ${page}, limit: ${limit}`);
    }),
    requestNewPump: asyncHandler(async (req, res) => {
      const {
        pumpName,
        location,
        licenseNumber,
        managerName,
        managerPhone,
        city,
        district,
      } = req.body;
    
      const proofOfLicense = req.files?.proofOfLicense[0]?.path
      const managerIdProof = req.files?.managerIdProof[0]?.path
    
      if (
        !pumpName ||
        !location ||
        !licenseNumber ||
        !proofOfLicense ||
        !managerName ||
        !managerPhone ||
        !managerIdProof ||
        !city ||
        !district
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
    
      const normalizedLicenseNumber = licenseNumber.trim().toUpperCase();
    
      try {
        // Check for duplicate license number
        const existingPump = await Pump.findOne({ licenseNumber: normalizedLicenseNumber });
        if (existingPump) {
          return res.status(400).json({ message: "A pump with this license number already exists" });
        }
    
        // Geocode the address
        const fullAddress = `${location}, ${city}, ${district}, Kerala, India`;
        console.log("📍 Full address for geocoding:", fullAddress);
    
        const { latitude, longitude } = await geocode(fullAddress);
    
        // Reverse geocode to get human-readable location name
        const locationName = await reverseGeocode(latitude, longitude);
        if (!locationName) {
          return res.status(400).json({ message: "Failed to fetch location name from coordinates" });
        }
   
    
        const pump = await Pump.create({
          pumpOwner: req.user.id,
          pumpName,
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          locationName, // ✅ Store readable name
          licenseNumber: normalizedLicenseNumber,
          proofOfLicense,
          managerName,
          managerPhone,
          managerIdProof,
          city,
          district,
        });
    
        if (pump) {
          await createNotification(
            [{ userId: req.user.id, userType: "pumpOwner" }],
            `Your pump request for ${pumpName} at ${location} has been submitted.`,
            "pumpRequest",
            "Pump Request Submitted"
          );
    
          await sendEmail(
            req.user.email,
            "Pump Request Submitted",
            `Your pump request for ${pumpName} at ${location} has been submitted and is pending approval.`
          );
    
          res.status(201).json(pump);
          logger.info(`Pump request submitted for ${pumpName} at ${location}`);
        } else {
          logger.error("Invalid pump data");
          res.status(400).json({ message: "Invalid pump data" });
        }
      } catch (error) {
        if (error.code === 11000 && error.keyPattern?.licenseNumber) {
          return res.status(400).json({ message: "License number already exists" });
        }
    
        logger.error(`Error submitting pump request: ${error.message}`);
        res.status(400).json({ message: "Something went wrong. Please try again." });
      }
    }),
    
  

    getPumpDetails: asyncHandler(async (req, res) => {
      const { pumpId } = req.params;
  
      if (!pumpId) {
          return res.status(400).json({ message: 'Pump ID is required' });
      }
  
      const pump = await Pump.findById(pumpId).populate('pumpOwner');
  
      if (!pump) {
          logger.warn(`Pump not found: ${pumpId}`);
          return res.status(404).json({ message: 'Pump not found' });
      }
  
      const salesReps = await SalesRep.find({ pump: pumpId });
  
      res.json({
          ...pump.toObject(),
          salesReps: salesReps,
      });
  
      logger.info(`Pump details retrieved for ${pumpId}`);
  }),
  

    approvePump: asyncHandler(async (req, res) => {
      const { id } = req.params;
    
      if (!id) {
        return res.status(400).json({ message: 'Pump ID is required' });
      }
    
      const pump = await Pump.findByIdAndUpdate(
        id,
        { status: 'approved' },
        { new: true }
      ).populate('pumpOwner');
    
      if (!pump) {
        logger.warn(`Pump not found: ${id}`);
        return res.status(404).json({ message: 'Pump not found' });
      }
    
      // Safety: Check if pumpOwner is populated
      if (!pump.pumpOwner || !pump.pumpOwner.email) {
        logger.error(`Pump owner not found or missing email for pump ${id}`);
        return res.status(500).json({ message: 'Pump owner data is missing or incomplete' });
      }
    
      // Create notification
      await createNotification(
        [{ userId: pump.pumpOwner._id, userType: 'pumpOwner' }],
        `Your pump ${pump.pumpName} has been approved.`,
        'pumpApproval',
        'Pump Approved'
      );
    
      // Send email
      await sendEmail(
        pump.pumpOwner.email,
        'Pump Approved',
        `Your pump ${pump.pumpName} has been approved.`
      );
    
      logger.info(`Pump ${id} approved`);
      res.json({ message: 'Pump approved', pump });
    }),
    

    rejectPump: asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { rejectionReason } = req.body;
    
      if (!id?.trim() || !rejectionReason?.trim()) {
        return res.status(400).json({ message: 'Pump ID and rejection reason are required' });
      }
    
      const pump = await Pump.findById(id).populate('pumpOwner');
    
      if (!pump) {
        logger.warn(`Pump not found: ${id}`);
        return res.status(404).json({ message: 'Pump not found' });
      }
    
      if (pump.status === 'rejected') {
        return res.status(400).json({ message: 'Pump is already rejected' });
      }
    
      pump.status = 'rejected';
      pump.rejectionReason = rejectionReason;
      await pump.save();
    
      const pumpOwner = pump.pumpOwner;
    
      // Notify pump owner via app notification
      await createNotification(
        [{ userId: pumpOwner._id, userType: 'pumpOwner' }],
        `Your pump "${pump.pumpName}" has been rejected. Reason: ${rejectionReason}`,
        'pumpRejection',
        'Pump Rejected'
      );
    
      // Email notification
      await sendEmail(
        pumpOwner.email,
        'Pump Rejected',
        `Hello ${pumpOwner.firstName},\n\nWe're sorry to inform you that your pump "${pump.pumpName}" has been rejected.\n\nReason: ${rejectionReason}\n\nPlease contact support if you need further assistance.`
      );
    
      logger.info(`Pump ${id} rejected. Reason: ${rejectionReason}`);
    
      return res.status(200).json({ message: 'Pump rejected successfully', pump });
    }),
    

    getPumpOwnerPumps: asyncHandler(async (req, res) => {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 10);
      const skip = (page - 1) * limit;
  
      // Retrieve pumps for the logged-in pump owner with pagination
      const [pumps, total] = await Promise.all([
          Pump.find({ pumpOwner: req.user.id }).skip(skip).limit(limit),
          Pump.countDocuments({ pumpOwner: req.user.id }),
      ]);
  
      const totalPages = Math.ceil(total / limit);
  
      res.status(200).json({
          success: true,
          data: pumps,
          pagination: {
              page,
              limit,
              total,
              totalPages,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
          },
      });
  
      logger.info(`Pumps retrieved for pump owner ${req.user.id}, page: ${page}, limit: ${limit}`);
  }),

  getNearbyPumps : asyncHandler(async (req, res) => {
    try {
      const { lat, lng, radius = 5 } = req.query;
  
      if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }
  
      const pumps = await Pump.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: parseFloat(radius) * 1000, // in meters
          },
        },
        status: "approved", // Only show approved pumps
      });
  
      res.status(200).json({ pumps });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch nearby pumps" });
    }
  }),
  
};

module.exports = pumpController;