const mongoose = require('mongoose');

const FileMetaSchema = new mongoose.Schema(
  {
    fileKey: { type: String, required: true },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const KycDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    method: {
      type: String,
      enum: ['digilocker', 'manual'],
      required: true
    },
    fullName: { type: String, required: true, trim: true },
    panNumber: { type: String, required: true, uppercase: true, trim: true },
    aadhaarLast4: { type: String, default: '', trim: true },
    dateOfBirth: { type: String, default: '' },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' }
    },
    digilocker: {
      requestId: { type: String, default: '' },
      status: {
        type: String,
        enum: ['initiated', 'completed', 'failed', ''],
        default: ''
      },
      verifiedName: { type: String, default: '' },
      verifiedPan: { type: String, default: '' },
      verifiedAadhaarLast4: { type: String, default: '' }
    },
    documents: {
      panFront: { type: FileMetaSchema, default: undefined },
      aadhaarFront: { type: FileMetaSchema, default: undefined },
      aadhaarBack: { type: FileMetaSchema, default: undefined }
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    consentAccepted: { type: Boolean, required: true, default: false },
    consentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('KycDocument', KycDocumentSchema);
