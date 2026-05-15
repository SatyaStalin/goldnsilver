/** Indian mobile: 10 digits starting 6–9; optional +91 / 0 prefix. */
const PHONE_DIGITS = /^[6-9]\d{9}$/;

const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const NAME = /^[a-zA-Z\s.'-]{2,100}$/;

/**
 * Strip phone to digits; return 10-digit Indian mobile or null.
 */
export function normalizeIndianPhone(raw) {
  if (raw == null) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (PHONE_DIGITS.test(digits)) return digits;
  return null;
}

/**
 * @param {{ name: string, email: string, phone: string }} customer
 * @returns {{ valid: boolean, errors: { name?: string, email?: string, phone?: string }, normalized: { name: string, email: string, phone: string } }}
 */
export function validateCheckoutCustomer(customer) {
  const errors = {};
  const name = String(customer?.name ?? '').trim();
  const email = String(customer?.email ?? '').trim();
  const phoneRaw = String(customer?.phone ?? '').trim();

  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (!NAME.test(name)) {
    errors.name = 'Enter a valid name (letters, spaces, hyphens only).';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (email.length > 254) {
    errors.email = 'Email is too long.';
  } else if (!EMAIL.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!phoneRaw) {
    errors.phone = 'Phone number is required.';
  } else {
    const normalizedPhone = normalizeIndianPhone(phoneRaw);
    if (!normalizedPhone) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }
  }

  const normalizedPhone = normalizeIndianPhone(phoneRaw);

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      name,
      email: email.toLowerCase(),
      phone: normalizedPhone || phoneRaw
    }
  };
}

/**
 * @param {Array<{ productId?: string, id?: string, quantity?: number, price?: number }>} items
 */
export function validateCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, message: 'Your cart is empty.' };
  }
  for (const item of items) {
    const pid = item.productId || item.id;
    if (!pid || !/^[a-f\d]{24}$/i.test(String(pid))) {
      return { valid: false, message: 'Some cart items are invalid. Refresh the page and try again.' };
    }
    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return { valid: false, message: 'Invalid quantity in cart.' };
    }
    const price = Number(item.price);
    if (!Number.isFinite(price) || price < 0) {
      return { valid: false, message: 'Invalid price in cart. Refresh and try again.' };
    }
  }
  return { valid: true };
}
