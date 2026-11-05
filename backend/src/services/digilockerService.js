const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const DEFAULT_BASE = 'https://digilocker.meripehchaan.gov.in';

function digilockerConfig() {
  const clientId = String(process.env.DIGILOCKER_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.DIGILOCKER_CLIENT_SECRET || '').trim();
  const redirectUri = String(process.env.DIGILOCKER_REDIRECT_URI || '').trim();
  const baseUrl = String(process.env.DIGILOCKER_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');
  return { clientId, clientSecret, redirectUri, baseUrl };
}

function assertConfigured(config) {
  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    const err = new Error(
      'DigiLocker is not configured. Set DIGILOCKER_CLIENT_ID, DIGILOCKER_CLIENT_SECRET, and DIGILOCKER_REDIRECT_URI in the backend env.'
    );
    err.statusCode = 503;
    err.code = 'DIGILOCKER_NOT_CONFIGURED';
    throw err;
  }
}

function createCodeVerifier() {
  return crypto.randomBytes(48).toString('base64url');
}

function codeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function signState({ userId, verifier, fromCheckout }) {
  return jwt.sign(
    {
      purpose: 'digilocker',
      uid: String(userId),
      v: verifier,
      fromCheckout: Boolean(fromCheckout)
    },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: '15m' }
  );
}

function readState(state) {
  const decoded = jwt.verify(state, process.env.JWT_SECRET || 'devsecret');
  if (decoded?.purpose !== 'digilocker' || !decoded.uid || !decoded.v) {
    const err = new Error('DigiLocker session expired. Please start again.');
    err.statusCode = 400;
    throw err;
  }
  return decoded;
}

function buildAuthorizeUrl({ userId, fromCheckout }) {
  const config = digilockerConfig();
  assertConfigured(config);
  const verifier = createCodeVerifier();
  const state = signState({ userId, verifier, fromCheckout });
  const consentTill = Math.floor(Date.now() / 1000) + 60 * 60;
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    code_challenge: codeChallenge(verifier),
    code_challenge_method: 'S256',
    purpose: 'kyc',
    req_doctype: 'PANCR,ADHAR',
    consent_valid_till: String(consentTill)
  });
  return {
    url: `${config.baseUrl}/public/oauth2/1/authorize?${params.toString()}`
  };
}

async function readResponse(res) {
  const text = await res.text();
  const trimmed = text.trim();
  let json = null;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      json = JSON.parse(trimmed);
    } catch {
      json = null;
    }
  }
  return { ok: res.ok, status: res.status, json, text, hmac: res.headers.get('hmac') };
}

async function exchangeCode(code, verifier) {
  const config = digilockerConfig();
  assertConfigured(config);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: String(code || ''),
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code_verifier: verifier
  });
  const res = await fetch(`${config.baseUrl}/public/oauth2/1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const parsed = await readResponse(res);
  if (!parsed.ok || !parsed.json?.access_token) {
    const err = new Error(
      parsed.json?.error_description || 'DigiLocker did not return an access token.'
    );
    err.statusCode = 502;
    throw err;
  }
  return parsed.json;
}

async function authorizedGet(path, accessToken) {
  const { baseUrl } = digilockerConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const parsed = await readResponse(res);
  if (!parsed.ok) {
    const err = new Error(parsed.json?.error_description || 'DigiLocker request failed.');
    err.statusCode = parsed.status || 502;
    throw err;
  }
  return parsed;
}

function attr(xml, tag, name) {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${name}="([^"]*)"`, 'i');
  const match = String(xml || '').match(re);
  return match ? match[1] : '';
}

function formatDob(raw) {
  const value = String(raw || '').trim();
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 8) return value;
  const head = Number(digits.slice(0, 4));
  if (head >= 1900 && head <= 2100) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function last4FromUid(uid) {
  const digits = String(uid || '').replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : '';
}

function panFromText(text) {
  const match = String(text || '').toUpperCase().match(/[A-Z]{5}[0-9]{4}[A-Z]/);
  return match ? match[0] : '';
}

function claimsFromIdToken(idToken) {
  const parts = String(idToken || '').split('.');
  if (parts.length < 2) return {};
  try {
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return claims && typeof claims === 'object' ? claims : {};
  } catch {
    return {};
  }
}

function issuedItems(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  const list = json.items || json.documents || json.files;
  if (Array.isArray(list)) return list;
  if (list && typeof list === 'object') return [list];
  if (json.uri || json.doctype) return [json];
  return [];
}

function isPanDocument(item) {
  const blob = [
    item?.doctype,
    item?.docType,
    item?.doc_type,
    item?.uri,
    item?.name,
    item?.description,
    item?.issuerid,
    item?.issuerId,
    item?.issuer
  ]
    .join(' ')
    .toUpperCase();
  return blob.includes('PANCR') || blob.includes('PAN CARD') || blob.includes('PERMANENT ACCOUNT');
}

async function readIssuedXml(uri, accessToken) {
  const clean = String(uri || '').trim();
  if (!clean) return '';
  const paths = [
    `/public/oauth2/1/xml/uri?uri=${encodeURIComponent(clean)}`,
    `/public/oauth2/1/xml/${encodeURIComponent(clean)}`
  ];
  for (const path of paths) {
    try {
      const doc = await authorizedGet(path, accessToken);
      const text = doc.text || '';
      if (panFromText(text) || text.includes('<')) return text;
    } catch {
      /* Try the other DigiLocker XML URL shape. */
    }
  }
  return '';
}

async function panFromIssuedDocuments(accessToken) {
  let items = [];
  try {
    const issued = await authorizedGet('/public/oauth2/2/files/issued', accessToken);
    items = issuedItems(issued.json);
  } catch {
    items = [];
  }

  const panDocs = items.filter(isPanDocument);
  for (const doc of panDocs) {
    const fromUri = panFromText(doc?.uri);
    if (fromUri) return fromUri;
  }
  for (const doc of panDocs) {
    const xml = await readIssuedXml(doc?.uri, accessToken);
    const fromXml = panFromText(xml);
    if (fromXml) return fromXml;
  }
  for (const doc of items) {
    const uri = String(doc?.uri || '');
    if (!uri.toUpperCase().includes('PAN')) continue;
    const fromUri = panFromText(uri);
    if (fromUri) return fromUri;
  }
  return '';
}

async function fetchVerifiedIdentity(token) {
  const claims = claimsFromIdToken(token.id_token);
  const profile = await authorizedGet('/public/oauth2/1/user', token.access_token);
  const user = profile.json || {};
  let aadhaarXml = '';
  if (String(token.eaadhaar || user.eaadhaar || '').toUpperCase() === 'Y' || !user.eaadhaar) {
    try {
      const aadhaar = await authorizedGet('/public/oauth2/3/xml/eaadhaar', token.access_token);
      aadhaarXml = aadhaar.text || '';
    } catch {
      aadhaarXml = '';
    }
  }

  const panNumber =
    panFromText(claims.pan_number || claims.pan || '') ||
    panFromText(token.scope) ||
    (await panFromIssuedDocuments(token.access_token)) ||
    panFromText(aadhaarXml);

  const name = String(
    user.name || claims.name || claims.given_name || attr(aadhaarXml, 'Poi', 'name') || token.name || ''
  ).trim();
  const dob = formatDob(
    user.dob || claims.birthdate || attr(aadhaarXml, 'Poi', 'dob') || token.dob || ''
  );
  const aadhaarLast4 = last4FromUid(
    attr(aadhaarXml, 'UidData', 'uid') ||
      attr(aadhaarXml, 'Poi', 'uid') ||
      claims.masked_aadhaar ||
      ''
  );

  return {
    name,
    dob,
    aadhaarLast4,
    panNumber,
    digilockerId: String(user.digilockerid || token.digilockerid || ''),
    address: {
      line1: attr(aadhaarXml, 'Poa', 'loc') || attr(aadhaarXml, 'Poa', 'vtc') || '',
      line2: attr(aadhaarXml, 'Poa', 'street') || attr(aadhaarXml, 'Poa', 'lm') || '',
      city: attr(aadhaarXml, 'Poa', 'dist') || '',
      state: attr(aadhaarXml, 'Poa', 'state') || '',
      pincode: attr(aadhaarXml, 'Poa', 'pc') || ''
    }
  };
}

module.exports = {
  digilockerConfig,
  buildAuthorizeUrl,
  readState,
  exchangeCode,
  fetchVerifiedIdentity
};
