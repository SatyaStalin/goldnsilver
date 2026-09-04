const multer = require('multer');
const path = require('path');
const fs = require('fs');

const kycUploadDir = path.join(__dirname, '../../uploads/kyc');
if (!fs.existsSync(kycUploadDir)) {
  fs.mkdirSync(kycUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = String(req.user?._id || 'unknown');
    const userDir = path.join(kycUploadDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const field = file.fieldname || 'doc';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    cb(null, `${field}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|pdf|webp/;
  const allowedMime = /^(image\/(jpeg|jpg|png|webp)|application\/pdf)$/i;
  const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMime.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only JPG, PNG, WEBP, or PDF files are allowed for KYC (max 5MB each)'));
};

const kycUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

module.exports = { kycUpload, kycUploadDir };
