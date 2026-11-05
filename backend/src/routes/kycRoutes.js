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
const {
  buildAuthorizeUrl,
  readState,
  exchangeCode,
  fetchVerifiedIdentity
} = require('../services/digilockerService');

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
 * Start DigiLocker sign-in. The browser is sent to DigiLocker and returns on
 * GET /api/kyc/digilocker/callback.
 */
router.post('/digilocker/start', authMiddleware, async (req, res, next) => {
  try {
    await assertCanSubmit(req.user);
    if (!parseConsent(req.body.consentAccepted)) {
      return res.status(400).json({
        message: 'Please accept the KYC consent to continue',
        code: 'CONSENT_REQUIRED'
      });
    }
    const { url } = buildAuthorizeUrl({
      userId: req.user._id,
      fromCheckout: req.body.fromCheckout === true || req.body.fromCheckout === 'true'
    });
    res.json({ url });
  } catch (err) {
    if (err.code === 'KYC_ALREADY_APPROVED' || err.code === 'KYC_ALREADY_PENDING') {
      return res.status(err.statusCode || 400).json({ message: err.message, code: err.code });
    }
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message, code: err.code || 'DIGILOCKER_ERROR' });
    }
    next(err);
  }
});

function kycReturnUrl(query) {
  const frontend = String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const params = new URLSearchParams(query);
  return `${frontend}/kyc?${params.toString()}`;
}

const DIGILOCKER_SUCCESS =
  'DigiLocker KYC verified. Your account is approved. No admin review is required.';

async function completeDigilockerLogin({ code, state }) {
  if (!code || !state) {
    const err = new Error('DigiLocker did not return an authorization code.');
    err.statusCode = 400;
    throw err;
  }

  const session = readState(state);
  const user = await User.findById(session.uid);
  await assertCanSubmit(user);

  const token = await exchangeCode(code, session.v);
  const identity = await fetchVerifiedIdentity(token);
  if (!identity.name || identity.name.length < 2) {
    const err = new Error('DigiLocker did not return a verified name.');
    err.statusCode = 502;
    throw err;
  }

  let panNumber;
  try {
    panNumber = validatePan(identity.panNumber);
  } catch {
    const err = new Error(
      'PAN was not found in DigiLocker. Add PAN in DigiLocker, or use Upload Documents.'
    );
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const payload = {
    user: user._id,
    method: 'digilocker',
    fullName: identity.name,
    panNumber,
    aadhaarLast4: identity.aadhaarLast4 || '',
    aadhaarNumber: identity.aadhaarNumber || '',
    dateOfBirth: identity.dob || '',
    address: {
      line1: identity.address.line1 || '',
      line2: identity.address.line2 || '',
      city: identity.address.city || '',
      state: identity.address.state || '',
      pincode: String(identity.address.pincode || '').replace(/\D/g, '').slice(0, 6)
    },
    digilocker: {
      requestId: identity.digilockerId || `digi_${Date.now()}`,
      status: 'completed',
      verifiedName: identity.name,
      verifiedPan: panNumber,
      verifiedAadhaarLast4: identity.aadhaarLast4 || '',
      panUri: identity.panUri || '',
      referenceKey: identity.referenceKey || ''
    },
    documents: {},
    status: 'approved',
    reviewedBy: null,
    reviewedAt: now,
    rejectionReason: null,
    consentAccepted: true,
    consentAt: now
  };

  await KycDocument.findOneAndUpdate(
    { user: user._id },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await syncUserKycFields(user._id, {
    kycStatus: 'approved',
    kycMethod: 'digilocker',
    kycSubmittedAt: now,
    kycVerifiedAt: now,
    kycRejectedReason: null
  });

  return {
    fromCheckout: Boolean(session.fromCheckout),
    message: DIGILOCKER_SUCCESS
  };
}

router.get('/digilocker/callback', async (req, res) => {
  const fail = (message, fromCheckout) => {
    const query = { digilocker: 'error', message };
    if (fromCheckout) query.from = 'checkout';
    return res.redirect(kycReturnUrl(query));
  };

  try {
    if (req.query.error) {
      return fail(String(req.query.error_description || req.query.error || 'DigiLocker sign-in was cancelled'));
    }
    const result = await completeDigilockerLogin({
      code: String(req.query.code || ''),
      state: String(req.query.state || '')
    });
    const query = { digilocker: 'success', message: result.message };
    if (result.fromCheckout) query.from = 'checkout';
    return res.redirect(kycReturnUrl(query));
  } catch (err) {
    return fail(err.message || 'DigiLocker verification failed.');
  }
});

/** Browser lands on the portal Call Back URL (/kyc) and the page posts code + state here. */
router.post('/digilocker/finish', async (req, res) => {
  try {
    const result = await completeDigilockerLogin({
      code: String(req.body?.code || ''),
      state: String(req.body?.state || '')
    });
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 400).json({
      message: err.message || 'DigiLocker verification failed.'
    });
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
    const filter = { method: 'manual' };
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
    if (doc.method === 'digilocker') {
      return res.status(400).json({
        message: 'DigiLocker KYC is approved automatically and is not reviewed here.'
      });
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
