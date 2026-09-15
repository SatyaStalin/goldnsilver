const PHYSICAL_GOLD_TYPES = ['physical_coin', 'physical_bar', 'gifting'];

function isPhysicalGoldProduct(product) {
  if (!product) return false;
  const metal = String(product.metal || '').toLowerCase();
  const type = String(product.type || '');
  return metal === 'gold' && PHYSICAL_GOLD_TYPES.includes(type);
}

function normalizePinCode(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length !== 6) return null;
  return digits;
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length === 10) return digits;
  return null;
}

function sanitizeShippingAddress(raw = {}) {
  const pinCode = normalizePinCode(raw.pinCode || raw.pincode);
  const authReceiverPhone = normalizePhone(
    raw.authReceiverPhone || raw.phone || raw.auth_receiver_phone
  );
  const consigneeName = String(raw.consigneeName || raw.name || '').trim();
  const line1 = String(raw.line1 || raw.address_line1 || '').trim();
  const line2 = String(raw.line2 || raw.address_line2 || '').trim();
  const city = String(raw.city || '').trim();
  const state = String(raw.state || '').trim();
  const authReceiverName = String(
    raw.authReceiverName || raw.auth_receiver_name || consigneeName
  ).trim();
  const authReceiverEmail = String(
    raw.authReceiverEmail || raw.email || raw.auth_receiver_email || ''
  )
    .trim()
    .toLowerCase();

  const errors = {};
  if (!consigneeName || consigneeName.length < 2) {
    errors.consigneeName = 'Recipient name is required.';
  }
  if (!line1 || line1.length < 5) {
    errors.line1 = 'Address line 1 is required (min 5 characters).';
  }
  if (line1.length > 200) errors.line1 = 'Address line 1 must be at most 200 characters.';
  if (line2.length > 200) errors.line2 = 'Address line 2 must be at most 200 characters.';
  if (!pinCode) errors.pinCode = 'Enter a valid 6-digit pincode.';
  if (!authReceiverName) errors.authReceiverName = 'Authorized receiver name is required.';
  if (!authReceiverPhone) {
    errors.authReceiverPhone = 'Enter a valid 10-digit mobile for the receiver.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    address: {
      consigneeName,
      line1,
      line2,
      city,
      state,
      pinCode: pinCode || String(raw.pinCode || raw.pincode || '').trim(),
      authReceiverName,
      authReceiverPhone: authReceiverPhone || '',
      authReceiverEmail
    }
  };
}

module.exports = {
  PHYSICAL_GOLD_TYPES,
  isPhysicalGoldProduct,
  normalizePinCode,
  normalizePhone,
  sanitizeShippingAddress
};
