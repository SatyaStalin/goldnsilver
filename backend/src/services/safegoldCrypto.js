const crypto = require('crypto');

function getEncryptionSecret() {
  return (
    process.env.SAFEGOLD_ENCRYPTION_KEY?.trim() ||
    process.env.SAFEGOLD_API_KEY?.trim() ||
    ''
  );
}

/** SafeGold staging often returns `{ data: "<base64 ciphertext>" }` instead of plain JSON. */
function isEncryptedEnvelope(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  if (typeof raw.data !== 'string' || raw.data.length < 24) return false;
  const hasPlainFields =
    raw.current_price != null ||
    raw.currentPrice != null ||
    raw.rate_id != null ||
    raw.rateId != null;
  return !hasPlainFields;
}

function deriveKeyVariants(secret) {
  const variants = [];
  if (!secret) return variants;

  const utf8 = Buffer.from(secret, 'utf8');
  variants.push({ name: 'utf8-32', key: utf8.slice(0, 32) });
  variants.push({ name: 'utf8-16', key: utf8.slice(0, 16) });
  if (/^[0-9a-fA-F]{32}$/.test(secret)) {
    variants.push({ name: 'hex-16', key: Buffer.from(secret, 'hex') });
    variants.push({
      name: 'sha256-hex',
      key: crypto.createHash('sha256').update(Buffer.from(secret, 'hex')).digest()
    });
  }
  variants.push({ name: 'sha256', key: crypto.createHash('sha256').update(secret).digest() });
  variants.push({ name: 'md5-16', key: crypto.createHash('md5').update(secret).digest() });
  return variants;
}

function tryDecryptPayload(ciphertextB64, secret) {
  let buf;
  try {
    buf = Buffer.from(ciphertextB64, 'base64');
  } catch {
    return null;
  }
  if (buf.length < 32 || buf.length % 16 !== 0) return null;

  const strategies = [
    { alg: 'aes-256-cbc', iv: buf.slice(0, 16), data: buf.slice(16), keyLen: 32 },
    { alg: 'aes-128-cbc', iv: buf.slice(0, 16), data: buf.slice(16), keyLen: 16 },
    { alg: 'aes-256-cbc', iv: Buffer.alloc(16), data: buf, keyLen: 32 },
    { alg: 'aes-128-cbc', iv: Buffer.alloc(16), data: buf, keyLen: 16 }
  ];

  for (const { key } of deriveKeyVariants(secret)) {
    for (const strat of strategies) {
      if (key.length < strat.keyLen) continue;
      const keySlice = key.slice(0, strat.keyLen);
      for (const padding of [true, false]) {
        try {
          const decipher = crypto.createDecipheriv(strat.alg, keySlice, strat.iv);
          decipher.setAutoPadding(padding);
          const plain = Buffer.concat([decipher.update(strat.data), decipher.final()]).toString(
            'utf8'
          );
          const parsed = JSON.parse(plain);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          /* try next strategy */
        }
      }
    }
  }

  return null;
}

function unwrapSafeGoldResponse(raw) {
  if (!isEncryptedEnvelope(raw)) return raw;

  const secret = getEncryptionSecret();
  if (!secret) return raw;

  const decrypted = tryDecryptPayload(raw.data, secret);
  return decrypted || raw;
}

module.exports = {
  getEncryptionSecret,
  isEncryptedEnvelope,
  tryDecryptPayload,
  unwrapSafeGoldResponse
};
