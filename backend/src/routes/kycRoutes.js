const express = require('express');
const path = require('path');
const KycDocument = require('../models/KycDocument');
const User = require('../models/User');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { kycUpload } = require('../middleware/kycUpload');
const {
  validatePan,
  normalizeAadhaarLast4,
  fileMetaFromMulter,
  getKycForUser,
  assertCanSubmit,
  syncUserKycFields,
  resolveKycFilePath,
  toClientKyc
} = require('../services/kycService');

const router = express.Router();

function parseConsent(value) {
  return value === true || value === 'true' || value === '1' || value === 'on';
}

// GET /api/kyc/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const { client } = await getKycForUser(req.user._id);
    res.json(client);
  } catch (err) {
    next(err);
  }
});

// POST /api/kyc/manual — multipart
router.post(
  '/manual',
  authMiddleware,
  kycUpload.fields([
    { name: 'panFront', maxCount: 1 },
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      await assertCanSubmit(req.user);

      const fullName = String(req.body.fullName || '').trim();
      if (fullName.length < 2) {
        return res.status(400).json({ message: 'Enter full name as on PAN', code: 'INVALID_NAME' });
      }

      let panNumber;
      try {
        panNumber = validatePan(req.body.panNumber);
      } catch (e) {
        return res.status(400).json({ message: e.message, code: e.code || 'INVALID_PAN' });
      }

      const aadhaarLast4 = normalizeAadhaarLast4(req.body.aadhaarLast4);
      if (aadhaarLast4 && aadhaarLast4.length !== 4) {
        return res.status(400).json({
          message: 'Aadhaar last 4 digits must be exactly 4 numbers',
          code: 'INVALID_AADHAAR'
        });
      }

      if (!parseConsent(req.body.consentAccepted)) {
        return res.status(400).json({
          message: 'Please accept the KYC consent to continue',
          code: 'CONSENT_REQUIRED'
        });
      }

      const panFront = fileMetaFromMulter(req.files?.panFront?.[0]);
      const aadhaarFront = fileMetaFromMulter(req.files?.aadhaarFront?.[0]);
      const aadhaarBack = fileMetaFromMulter(req.files?.aadhaarBack?.[0]);

      if (!panFront || !aadhaarFront || !aadhaarBack) {
        return res.status(400).json({
          message: 'Upload PAN front, Aadhaar front, and Aadhaar back (JPG/PNG/PDF, max 5MB each)',
          code: 'DOCUMENTS_REQUIRED'
        });
      }

      const now = new Date();
      const payload = {
        user: req.user._id,
        method: 'manual',
        fullName,
        panNumber,
        aadhaarLast4: aadhaarLast4 || '',
        dateOfBirth: String(req.body.dateOfBirth || '').trim(),
        address: {
          line1: String(req.body.addressLine1 || '').trim(),
          line2: String(req.body.addressLine2 || '').trim(),
          city: String(req.body.city || '').trim(),
          state: String(req.body.state || '').trim(),
          pincode: String(req.body.pincode || '').replace(/\D/g, '').slice(0, 6)
        },
        documents: { panFront, aadhaarFront, aadhaarBack },
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        consentAccepted: true,
        consentAt: now
      };

      const doc = await KycDocument.findOneAndUpdate(
        { user: req.user._id },
        { $set: payload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const user = await syncUserKycFields(req.user._id, {
        kycStatus: 'pending',
        kycMethod: 'manual',
        kycSubmittedAt: now,
        kycVerifiedAt: null,
        kycRejectedReason: null
      });

      res.status(201).json({
        message: 'KYC submitted successfully. Status: Under review. Admin will approve or reject shortly.',
        kyc: toClientKyc(doc, user)
      });
    } catch (err) {
      if (err.code === 'KYC_ALREADY_APPROVED' || err.code === 'KYC_ALREADY_PENDING') {
        return res.status(err.statusCode || 400).json({ message: err.message, code: err.code });
      }
      if (err instanceof Error && err.message.includes('Only JPG')) {
        return res.status(400).json({ message: err.message, code: 'INVALID_FILE' });
      }
      next(err);
    }
  }
);

/**
 * DigiLocker stub (Phase 1):
 * Accepts Digi-style fields, then status = pending (UNDER_REVIEW) until admin approves.
 * Replace with real DigiLocker provider init/callback later.
 */
router.post('/digilocker/complete', authMiddleware, async (req, res, next) => {
  try {
    await assertCanSubmit(req.user);

    const fullName = String(req.body.fullName || '').trim();
    if (fullName.length < 2) {
      return res.status(400).json({ message: 'Enter full name as verified on DigiLocker', code: 'INVALID_NAME' });
    }

    let panNumber;
    try {
      panNumber = validatePan(req.body.panNumber);
    } catch (e) {
      return res.status(400).json({ message: e.message, code: e.code || 'INVALID_PAN' });
    }

    const aadhaarLast4 = normalizeAadhaarLast4(req.body.aadhaarLast4);
    if (!aadhaarLast4 || aadhaarLast4.length !== 4) {
      return res.status(400).json({
        message: 'Enter last 4 digits of Aadhaar from DigiLocker',
        code: 'INVALID_AADHAAR'
      });
    }

    if (!parseConsent(req.body.consentAccepted)) {
      return res.status(400).json({
        message: 'Please accept the KYC consent to continue',
        code: 'CONSENT_REQUIRED'
      });
    }

    const now = new Date();
    const requestId = `digi_stub_${Date.now()}`;
    const payload = {
      user: req.user._id,
      method: 'digilocker',
      fullName,
      panNumber,
      aadhaarLast4,
      dateOfBirth: String(req.body.dateOfBirth || '').trim(),
      digilocker: {
        requestId,
        status: 'completed',
        verifiedName: fullName,
        verifiedPan: panNumber,
        verifiedAadhaarLast4: aadhaarLast4
      },
      documents: {},
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      consentAccepted: true,
      consentAt: now
    };

    const doc = await KycDocument.findOneAndUpdate(
      { user: req.user._id },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const user = await syncUserKycFields(req.user._id, {
      kycStatus: 'pending',
      kycMethod: 'digilocker',
      kycSubmittedAt: now,
      kycVerifiedAt: null,
      kycRejectedReason: null
    });

    res.status(201).json({
      message: 'KYC submitted successfully. Status: Under review. Admin will approve or reject shortly.',
      kyc: toClientKyc(doc, user)
    });
  } catch (err) {
    if (err.code === 'KYC_ALREADY_APPROVED' || err.code === 'KYC_ALREADY_PENDING') {
      return res.status(err.statusCode || 400).json({ message: err.message, code: err.code });
    }
    next(err);
  }
});

// GET /api/kyc/documents/:type — own document only
router.get('/documents/:type', authMiddleware, async (req, res, next) => {
  try {
    const type = String(req.params.type || '');
    const allowed = { panFront: true, aadhaarFront: true, aadhaarBack: true };
    if (!allowed[type]) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const doc = await KycDocument.findOne({ user: req.user._id });
    const meta = doc?.documents?.[type];
    if (!meta?.fileKey) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const fullPath = resolveKycFilePath(meta.fileKey);
    if (!fullPath) {
      return res.status(404).json({ message: 'Document file missing' });
    }

    res.setHeader('Content-Type', meta.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${path.basename(meta.originalName || meta.fileKey)}"`
    );
    res.sendFile(fullPath);
  } catch (err) {
    next(err);
  }
});

// Admin: list KYC submissions
router.get('/admin/list', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const status = String(req.query.status || '').trim();
    const filter = {};
    if (['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      KycDocument.countDocuments(filter),
      KycDocument.find(filter)
        .populate('user', 'name email mobile kycStatus')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    res.json({
      items: docs.map((d) => ({
        id: d._id,
        user: d.user,
        method: d.method,
        fullName: d.fullName,
        panMasked: d.panNumber
          ? `${'*'.repeat(5)}${d.panNumber.slice(5, 9)}${d.panNumber.slice(9)}`
          : null,
        aadhaarLast4: d.aadhaarLast4,
        status: d.status,
        rejectionReason: d.rejectionReason,
        submittedAt: d.createdAt,
        reviewedAt: d.reviewedAt
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
    });
  } catch (err) {
    next(err);
  }
});

// Admin: approve / reject
router.put('/admin/:kycId/review', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be approved or rejected' });
    }
    if (status === 'rejected' && !String(rejectionReason || '').trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const doc = await KycDocument.findById(req.params.kycId);
    if (!doc) {
      return res.status(404).json({ message: 'KYC record not found' });
    }

    const now = new Date();
    doc.status = status;
    doc.reviewedBy = req.user._id;
    doc.reviewedAt = now;
    doc.rejectionReason = status === 'rejected' ? String(rejectionReason).trim() : null;
    await doc.save();

    const user = await syncUserKycFields(doc.user, {
      kycStatus: status,
      kycMethod: doc.method,
      kycVerifiedAt: status === 'approved' ? now : null,
      kycRejectedReason: status === 'rejected' ? doc.rejectionReason : null
    });

    res.json({
      message: status === 'approved' ? 'KYC approved' : 'KYC rejected',
      kyc: toClientKyc(doc, user)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
