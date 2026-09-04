const path = require('path');
const fs = require('fs');
const KycDocument = require('../models/KycDocument');
const User = require('../models/User');
const { kycUploadDir } = require('../middleware/kycUpload');

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function normalizePan(pan) {
  return String(pan || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function normalizeAadhaarLast4(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-4);
  return digits;
}

function validatePan(pan) {
  const normalized = normalizePan(pan);
  if (!PAN_REGEX.test(normalized)) {
    const err = new Error('Enter a valid PAN (e.g. ABCDE1234F)');
    err.code = 'INVALID_PAN';
    err.statusCode = 400;
    throw err;
  }
  return normalized;
}

function fileMetaFromMulter(file) {
  if (!file) return null;
  const userId = path.basename(path.dirname(file.path));
  return {
    fileKey: path.join(userId, file.filename).replace(/\\/g, '/'),
    originalName: file.originalname || '',
    mimeType: file.mimetype || '',
    size: file.size || 0,
    uploadedAt: new Date()
  };
}

function maskPan(pan) {
  const p = normalizePan(pan);
  if (p.length < 10) return '**********';
  return `${'*'.repeat(5)}${p.slice(5, 9)}${p.slice(9)}`;
}

function toClientKyc(doc, user) {
  if (!doc && !user) {
    return {
      status: 'not_submitted',
      method: null,
      canCheckout: false
    };
  }

  const status = user?.kycStatus || doc?.status || 'not_submitted';
  return {
    status,
    method: user?.kycMethod || doc?.method || null,
    fullName: doc?.fullName || null,
    panMasked: doc?.panNumber ? maskPan(doc.panNumber) : null,
    aadhaarLast4: doc?.aadhaarLast4 || null,
    submittedAt: user?.kycSubmittedAt || doc?.createdAt || null,
    verifiedAt: user?.kycVerifiedAt || doc?.reviewedAt || null,
    rejectionReason: user?.kycRejectedReason || doc?.rejectionReason || null,
    hasDocuments: Boolean(
      doc?.documents?.panFront?.fileKey ||
        doc?.documents?.aadhaarFront?.fileKey ||
        doc?.documents?.aadhaarBack?.fileKey
    ),
    canCheckout: status === 'approved',
    consentAccepted: Boolean(doc?.consentAccepted)
  };
}

async function getKycForUser(userId) {
  const [user, doc] = await Promise.all([
    User.findById(userId).select(
      'kycStatus kycMethod kycSubmittedAt kycVerifiedAt kycRejectedReason name email'
    ),
    KycDocument.findOne({ user: userId })
  ]);
  return { user, doc, client: toClientKyc(doc, user) };
}

async function assertCanSubmit(user) {
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.kycStatus === 'approved') {
    const err = new Error('KYC is already approved. No need to submit again.');
    err.code = 'KYC_ALREADY_APPROVED';
    err.statusCode = 400;
    throw err;
  }
  if (user.kycStatus === 'pending') {
    const err = new Error('KYC is already under review. Please wait for approval.');
    err.code = 'KYC_ALREADY_PENDING';
    err.statusCode = 400;
    throw err;
  }
}

async function syncUserKycFields(userId, patch) {
  return User.findByIdAndUpdate(userId, { $set: patch }, { new: true });
}

function resolveKycFilePath(fileKey) {
  const safe = String(fileKey || '').replace(/\.\./g, '').replace(/^\/+/, '');
  const full = path.join(kycUploadDir, safe);
  if (!full.startsWith(kycUploadDir)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

module.exports = {
  PAN_REGEX,
  normalizePan,
  normalizeAadhaarLast4,
  validatePan,
  fileMetaFromMulter,
  maskPan,
  toClientKyc,
  getKycForUser,
  assertCanSubmit,
  syncUserKycFields,
  resolveKycFilePath
};
