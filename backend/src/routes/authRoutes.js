const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const {
  formatUserResponse,
  normalizeMobile,
  roleFromUserType
} = require('../services/userOrderService');

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      userType: user.userType || (user.role === 'admin' ? 'admin' : 'general')
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

router.get('/check', async (req, res, next) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    const mobile = normalizeMobile(req.query.mobile);
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (mobile) orConditions.push({ mobile });
    if (!orConditions.length) {
      return res.json({ exists: false });
    }
    const user = await User.findOne({ $or: orConditions }).select('_id email mobile');
    res.json({ exists: Boolean(user), userId: user?._id });
  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, mobile, userType: rawType } = req.body;
    const emailNorm = String(email || '').trim().toLowerCase();
    const mobileNorm = normalizeMobile(mobile);
    const userType = rawType === 'admin' ? 'admin' : 'general';

    const existing = await User.findOne({
      $or: [{ email: emailNorm }, ...(mobileNorm ? [{ mobile: mobileNorm }] : [])]
    });
    if (existing) {
      return res.status(400).json({ message: 'Email or mobile already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: emailNorm,
      mobile: mobileNorm || undefined,
      passwordHash,
      userType,
      role: roleFromUserType(userType)
    });
    const token = signToken(user);
    res.json({ token, user: formatUserResponse(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const emailNorm = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({ token, user: formatUserResponse(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: formatUserResponse(req.user) });
});

router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name, mobile } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (mobile !== undefined) {
      const mobileNorm = normalizeMobile(mobile);
      if (mobileNorm) {
        const clash = await User.findOne({
          mobile: mobileNorm,
          _id: { $ne: user._id }
        });
        if (clash) {
          return res.status(400).json({ message: 'Mobile number already in use' });
        }
        user.mobile = mobileNorm;
      }
    }
    await user.save();

    if (user.name && normalizeMobile(user.mobile).length === 10) {
      const { ensureSafeGoldCustomer } = require('../services/safegoldCustomerService');
      ensureSafeGoldCustomer(user).catch((err) => {
        console.warn('[SafeGold] customer link on profile update:', err.message);
      });
    }

    res.json({ user: formatUserResponse(user) });
  } catch (err) {
    next(err);
  }
});

router.put('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
