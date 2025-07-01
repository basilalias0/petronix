const mongoose = require('mongoose')

const pumpSchema = mongoose.Schema({
    pumpOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PumpOwner',
    },
    pumpName: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending_approval', 'approved', 'rejected'], // changed status name
        default: 'pending_approval',
    },
    location: {
        type: {
          type: String,
          enum: ['Point'],
          required: true,
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
      locationName: {
        type: String,
        required: true,
      },
    licenseNumber: {
        type: String,
        required: true,
        unique: true, // Make sure this exists
        trim: true,
    },
    proofOfLicense: {
        type: String,
    },
    managerName: {
        type: String,
    },
    managerPhone: {
        type: String,
    },
    managerIdProof: {
        type: String,
    },
    city:{
        type: String,
    },
    district:{
        type: String,
    },
    isSubscribed:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

pumpSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Pump', pumpSchema);