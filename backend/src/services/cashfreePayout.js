const axios = require('axios');

function payoutConfig() {
  const clientId = String(process.env.CASHFREE_PAYOUT_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.CASHFREE_PAYOUT_CLIENT_SECRET || '').trim();
  const baseUrl = String(process.env.CASHFREE_PAYOUT_BASE_URL || 'https://sandbox.cashfree.com/payout')
    .trim()
    .replace(/\/$/, '');
  const apiVersion = String(process.env.CASHFREE_PAYOUT_API_VERSION || '2024-01-01').trim();
  return { clientId, clientSecret, baseUrl, apiVersion };
}

function assertPayoutConfigured() {
  const config = payoutConfig();
  if (!config.clientId || !config.clientSecret || !config.baseUrl) {
    const err = new Error(
      'Bank payout is not configured yet. Please try the sale again later.'
    );
    err.statusCode = 503;
    err.code = 'PAYOUT_NOT_CONFIGURED';
    throw err;
  }
  return config;
}

function safePayoutText(value) {
  return String(value || '')
    .replace(/\d{6,}/g, '••••')
    .slice(0, 240);
}

function payoutError(error) {
  const data = error.response?.data || {};
  const err = new Error(safePayoutText(data.message || error.message || 'Cashfree payout request failed'));
  err.statusCode = error.response?.status || 502;
  err.code = data.code || 'PAYOUT_REQUEST_FAILED';
  return err;
}

async function payoutRequest(method, path, { body, params } = {}) {
  const config = assertPayoutConfigured();
  try {
    const response = await axios({
      method,
      url: `${config.baseUrl}${path}`,
      data: body,
      params,
      timeout: 20000,
      headers: {
        'x-client-id': config.clientId,
        'x-client-secret': config.clientSecret,
        'x-api-version': config.apiVersion,
        'Content-Type': 'application/json'
      }
    });
    return response.data || {};
  } catch (error) {
    throw payoutError(error);
  }
}

async function getBeneficiary({ beneficiaryId, accountNumber, ifsc }) {
  const params = {};
  if (beneficiaryId) params.beneficiary_id = beneficiaryId;
  if (accountNumber && ifsc) {
    params.bank_account_number = accountNumber;
    params.bank_ifsc = ifsc;
  }
  return payoutRequest('GET', '/beneficiary', { params });
}

async function createBeneficiary({ beneficiaryId, name, accountNumber, ifsc, email, phone }) {
  const body = {
    beneficiary_id: beneficiaryId,
    beneficiary_name: name,
    beneficiary_instrument_details: {
      bank_account_number: accountNumber,
      bank_ifsc: ifsc
    },
    beneficiary_contact_details: {
      beneficiary_phone: phone,
      beneficiary_country_code: '+91',
      ...(email ? { beneficiary_email: email } : {})
    }
  };

  try {
    return await payoutRequest('POST', '/beneficiary', { body });
  } catch (err) {
    if (err.statusCode !== 409) throw err;
    try {
      const byId = await getBeneficiary({ beneficiaryId });
      if (byId?.beneficiary_id) return byId;
    } catch {
      /* try the account lookup */
    }
    const byAccount = await getBeneficiary({ accountNumber, ifsc });
    if (byAccount?.beneficiary_id) return byAccount;
    throw err;
  }
}

async function createTransfer({ transferId, amount, beneficiaryId, transferMode }) {
  return payoutRequest('POST', '/transfers', {
    body: {
      transfer_id: transferId,
      transfer_amount: amount,
      transfer_currency: 'INR',
      transfer_mode: transferMode,
      beneficiary_details: {
        beneficiary_id: beneficiaryId
      }
    }
  });
}

async function getTransfer(transferId) {
  return payoutRequest('GET', '/transfers', { params: { transfer_id: transferId } });
}

module.exports = {
  payoutConfig,
  assertPayoutConfigured,
  safePayoutText,
  createBeneficiary,
  createTransfer,
  getTransfer
};
