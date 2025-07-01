const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const upload = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: folder,
        allowed_formats: ['jpg', 'png', 'jpeg'],
        resource_type: 'image',
        public_id: `${Date.now()}-${file.originalname}`,
      };
    },
  });

  return multer({ storage }).fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'idProofPhoto', maxCount: 1 },
    { name: 'proofOfLicense', maxCount: 1 },
    { name: 'managerIdProof', maxCount: 1 },
    { name: 'idProof', maxCount: 1 }
  ]);
};

module.exports = upload;

