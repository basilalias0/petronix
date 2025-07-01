const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
  profilePicture: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    required: true,
    default: 'customer',
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  deletedAt: Date,
  isBlacklisted: {
    type: Boolean,
    default: false,
  },
  credit: {
    type: Number,
    default: 0,
  },
  creditLimit: {
    type: Number,
    default: 5000,
  },
  paymentCycle: {
    type: String,
    enum: ['weekly', 'monthly'],
    default: 'monthly',
  },
  pin: {
    type: String,
    required: true,
  },
  consecutivePayments: {
    type: Number,
    default: 0,
  },
  lastPaymentDate: {
    type: Date,
  },
  isCreditSuspended: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  alternatePhoneNumber: {
    type: String,
  },
  aadharNumber: {
    type: String,
    required: true,
    length: 12,
  },
  idProofPhoto: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0], // [longitude, latitude]
    },
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

customerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Customer', customerSchema);
