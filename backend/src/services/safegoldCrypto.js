const crypto = require('crypto');

function getAccessToken() {
  return (
    process.env.SAFEGOLD_ENCRYPTION_KEY?.trim() ||
    process.env.SAFEGOLD_API_KEY?.trim() ||
    ''
  );
}

/**
 * SafeGold partner crypto (per API overview):
 * - Algorithm: AES/CBC/PKCS7Padding → aes-256-cbc in Node
 * - Key: MD5(access token) as 32-char hex string (UTF-8 bytes)
 * - IV: random 16 bytes prepended to ciphertext (SafeGold generates on response;
 *       distributor generates on request)
 */
function deriveAesKey(accessToken) {
  const md5Hex = crypto.createHash('md5').update(accessToken).digest('hex');
  return Buffer.from(md5Hex, 'utf8');
}

function decryptPayload(ciphertextB64, accessToken) {
  if (!ciphertextB64 || !accessToken) return null;
  try {
    const key = deriveAesKey(accessToken);
    const buf = Buffer.from(ciphertextB64, 'base64');
    if (buf.length < 32 || buf.length % 16 !== 0) return null;

    const iv = buf.slice(0, 16);
    const encrypted = buf.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    const parsed = JSON.parse(plain);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function encryptPayload(payload, accessToken) {
  const key = deriveAesKey(accessToken);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString('base64');
}

function wrapEncryptedRequest(body, accessToken) {
  return { data: encryptPayload(body, accessToken) };
}

/** Response shape: `{ data: "<base64 iv+ciphertext>" }` without plain price fields. */
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

function unwrapSafeGoldResponse(raw, accessToken) {
  if (!isEncryptedEnvelope(raw)) return raw;
  const token = accessToken || getAccessToken();
  if (!token) return raw;
  return decryptPayload(raw.data, token) || raw;
}

module.exports = {
  getAccessToken,
  deriveAesKey,
  decryptPayload,
  encryptPayload,
  wrapEncryptedRequest,
  isEncryptedEnvelope,
  unwrapSafeGoldResponse
};
