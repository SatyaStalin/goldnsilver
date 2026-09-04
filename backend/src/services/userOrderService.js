const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const { getLiveMetalRates } = require('./metalRatesService');

const normalizeMobile = (mobile) => String(mobile || '').replace(/\D/g, '').slice(-10);

const roleFromUserType = (userType) => (userType === 'admin' ? 'admin' : 'user');

/**
 * Find user by email or mobile; create general user if missing (password required).
 */
async function resolveOrCreateUser({ name, email, mobile, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedMobile = normalizeMobile(mobile);

  if (!normalizedEmail && !normalizedMobile) {
    throw new Error('Email or mobile is required');
  }

  const orConditions = [];
  if (normalizedEmail) orConditions.push({ email: normalizedEmail });
  if (normalizedMobile) orConditions.push({ mobile: normalizedMobile });

  let user = await User.findOne({ $or: orConditions });
  let created = false;

  if (!user) {
    if (!password || String(password).length < 6) {
      const err = new Error('Password is required (min 6 characters) to create your account');
      err.statusCode = 400;
      err.code = 'PASSWORD_REQUIRED';
      throw err;
    }
    if (!normalizedEmail) {
      const err = new Error('Email is required to create a new account');
      err.statusCode = 400;
      throw err;
    }
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      user = existingEmail;
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({
        name: name || 'Customer',
        email: normalizedEmail,
        mobile: normalizedMobile || undefined,
        passwordHash,
        userType: 'general',
        role: 'user'
      });
      created = true;
    }
  } else if (name && !user.name) {
    user.name = name;
    await user.save();
  }

  return { user, created };
}

async function enrichOrderItems(items) {
  const rates = await getLiveMetalRates();
  const enriched = [];

  for (const item of items) {
    const product = await Product.findById(item.productId || item.product).lean();
    const metal = product?.metal || 'gold';
    const gramsPerUnit = product?.metalGrams > 0 ? product.metalGrams : 1;
    const qty = item.quantity || 1;
    let purchaseRatePerGram = rates.goldPerGram;
    if (metal === 'silver') purchaseRatePerGram = rates.silverPerGram;
    else if (metal === 'gold+silver') {
      purchaseRatePerGram = (rates.goldPerGram + rates.silverPerGram) / 2;
    }

    enriched.push({
      product: item.productId || item.product,
      name: item.name || product?.name,
      price: item.price,
      quantity: qty,
      metal,
      metalGrams: gramsPerUnit * qty,
      purchaseRatePerGram
    });
  }

  return { items: enriched, liveRatesAtPurchase: rates };
}

function formatUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile || '',
    userType: user.userType || (user.role === 'admin' ? 'admin' : 'general'),
    role: user.role,
    kycStatus: user.kycStatus || 'not_submitted',
    kycMethod: user.kycMethod || null
  };
}

module.exports = {
  resolveOrCreateUser,
  enrichOrderItems,
  formatUserResponse,
  normalizeMobile,
  roleFromUserType
};
