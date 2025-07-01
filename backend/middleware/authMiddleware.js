const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/adminModel');
const Customer = require('../models/customerModel');
const PumpOwner = require('../models/pumpOwnerModel');
const SalesRep = require('../models/salesRepModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            let user;

            switch (decoded.role) {
                case 'admin':
                    user = await Admin.findById(decoded.id).select('-password');
                    break;
                case 'customer':
                    user = await Customer.findById(decoded.id).select('-password');
                    break;
                case 'pumpOwner':
                    user = await PumpOwner.findById(decoded.id).select('-password');
                    break;
                case 'salesRep':
                    user = await SalesRep.findById(decoded.id).select('-password');
                    break;
                default:
                    return res.status(401).json({ message: `Invalid role in token: ${decoded.role}` });
            }

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user; // Set the user data

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`User role ${req.user.role} is not authorized to access this route`)
        }
        next();
    };
}

module.exports = { protect, authorize };