import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { kycService } from '../services/api';
import './PageShell.css';
import './KycPage.css';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
let digilockerFinishKey = '';

const statusLabel = {
  not_submitted: 'Not submitted',
  pending: 'Under review',
  approved: 'Approved',
  rejected: 'Rejected'
};

const KycPage = () => {
  const { user, isAuthenticated, loading: authLoading, updateUser, acceptSession } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromCheckout = searchParams.get('from') === 'checkout';

  const [method, setMethod] = useState('digilocker');
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(
    () => !new URLSearchParams(window.location.search).get('code')
  );
  const [finishing, setFinishing] = useState(
    () => Boolean(new URLSearchParams(window.location.search).get('code') && new URLSearchParams(window.location.search).get('state'))
  );
  const skipKycReload = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    panNumber: '',
    aadhaarLast4: '',
    dateOfBirth: '',
    consentAccepted: false
  });
  const [files, setFiles] = useState({
    panFront: null,
    aadhaarFront: null,
    aadhaarBack: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('code') || params.get('state') || params.get('error')) return;
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: fromCheckout ? '/kyc?from=checkout' : '/kyc' } });
    }
  }, [authLoading, isAuthenticated, navigate, fromCheckout]);

  useEffect(() => {
    if (user?.name && !form.fullName) {
      setForm((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [user?.name]);

  const digilockerResult = searchParams.get('digilocker');
  const oauthCode = searchParams.get('code');
  const oauthState = searchParams.get('state');
  const oauthError = searchParams.get('error');
  const oauthErrorDescription = searchParams.get('error_description');

  const loadKyc = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await kycService.getMe();
      setKyc(data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not load KYC status', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    if (oauthCode && oauthState) return;
    if (skipKycReload.current) {
      skipKycReload.current = false;
      setLoading(false);
      return;
    }
    loadKyc();
  }, [loadKyc, oauthCode, oauthState]);

  useEffect(() => {
    if (!oauthCode || !oauthState) return;
    const key = `${oauthCode}:${oauthState}`;
    if (digilockerFinishKey === key) return;
    digilockerFinishKey = key;
    (async () => {
      let signedIn = false;
      try {
        const { data } = await kycService.finishDigilocker({
          code: oauthCode,
          state: oauthState
        });
        if (data?.resetToken) {
          signedIn = true;
          showToast(data.message || 'DigiLocker verified. Set your new password.', 'success');
          window.dispatchEvent(new CustomEvent('gs-open-auth', {
            detail: { panel: 'reset-password', resetToken: data.resetToken }
          }));
          navigate('/', { replace: true });
          return;
        }
        if (data?.token) {
          signedIn = true;
          acceptSession(data);
          showToast(data.message || 'Signed in with DigiLocker.', 'success');
          const nextPath = typeof data.redirectTo === 'string' && data.redirectTo.startsWith('/')
            ? data.redirectTo
            : '/dashboard';
          navigate(nextPath, { replace: true });
          return;
        }
        showToast(data?.message || 'DigiLocker KYC verified. Your account is approved.', 'success');
        if (data?.kyc) setKyc(data.kyc);
        updateUser(data?.user || { kycStatus: 'approved', kycMethod: 'digilocker' });
        skipKycReload.current = true;
      } catch (err) {
        showToast(err.response?.data?.message || 'DigiLocker verification failed', 'error');
      } finally {
        setFinishing(false);
        if (signedIn) return;
        const next = new URLSearchParams(window.location.search);
        ['code', 'state', 'error', 'error_description'].forEach((item) => next.delete(item));
        const search = next.toString();
        navigate({ pathname: '/kyc', search: search ? `?${search}` : '' }, { replace: true });
      }
    })();
  }, [oauthCode, oauthState, navigate, showToast, updateUser, acceptSession]);
  useEffect(() => {
    if (oauthCode || !oauthError) return;
    showToast(oauthErrorDescription || 'DigiLocker could not be opened. Please try again.', 'error');
    const next = new URLSearchParams(window.location.search);
    ['error', 'error_description', 'state'].forEach((item) => next.delete(item));
    const search = next.toString();
    navigate({ pathname: '/kyc', search: search ? `?${search}` : '' }, { replace: true });
  }, [oauthCode, oauthError, oauthErrorDescription, navigate, showToast]);

  useEffect(() => {
    if (!digilockerResult || !isAuthenticated) return;
    const message = searchParams.get('message');
    if (digilockerResult === 'success') {
      showToast(message || 'DigiLocker KYC verified. Your account is approved.', 'success');
      updateUser({ kycStatus: 'approved', kycMethod: 'digilocker' });
      loadKyc();
    } else if (digilockerResult === 'error') {
      showToast(message || 'DigiLocker verification failed', 'error');
    }
    const next = new URLSearchParams(searchParams);
    next.delete('digilocker');
    next.delete('message');
    const search = next.toString();
    navigate({ pathname: '/kyc', search: search ? `?${search}` : '' }, { replace: true });
  }, [digilockerResult, isAuthenticated, loadKyc, navigate, searchParams, showToast, updateUser]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateCommon = () => {
    const next = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      next.fullName = 'Enter full name as on PAN';
    }
    const pan = form.panNumber.trim().toUpperCase();
    if (!PAN_REGEX.test(pan)) {
      next.panNumber = 'Enter valid PAN (e.g. ABCDE1234F)';
    }
    if (!form.consentAccepted) {
      next.consentAccepted = 'Consent is required';
    }
    return next;
  };

  const handleDigilockerSubmit = async (e) => {
    e.preventDefault();
    if (!form.consentAccepted) {
      setErrors({ consentAccepted: 'Consent is required' });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await kycService.startDigilocker({
        consentAccepted: true,
        fromCheckout
      });
      if (!data?.url) {
        showToast('DigiLocker did not return a sign-in link.', 'error');
        setSubmitting(false);
        return;
      }
      window.location.assign(data.url);
    } catch (err) {
      showToast(err.response?.data?.message || 'DigiLocker KYC failed', 'error');
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const next = validateCommon();
    if (!files.panFront) next.panFront = 'PAN front is required';
    if (!files.aadhaarFront) next.aadhaarFront = 'Aadhaar front is required';
    if (!files.aadhaarBack) next.aadhaarBack = 'Aadhaar back is required';
    const last4 = form.aadhaarLast4.replace(/\D/g, '');
    if (last4 && last4.length !== 4) {
      next.aadhaarLast4 = 'Must be exactly 4 digits';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const fd = new FormData();
    fd.append('fullName', form.fullName.trim());
    fd.append('panNumber', form.panNumber.trim().toUpperCase());
    if (last4) fd.append('aadhaarLast4', last4);
    if (form.dateOfBirth) fd.append('dateOfBirth', form.dateOfBirth);
    fd.append('consentAccepted', 'true');
    fd.append('panFront', files.panFront);
    fd.append('aadhaarFront', files.aadhaarFront);
    fd.append('aadhaarBack', files.aadhaarBack);

    setSubmitting(true);
    try {
      const { data } = await kycService.submitManual(fd);
      setKyc(data.kyc);
      if (user) {
        updateUser({
          ...user,
          kycStatus: data.kyc.status,
          kycMethod: data.kyc.method
        });
      }
      showToast(data.message || 'KYC submitted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'KYC upload failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if ((authLoading || loading) && !finishing) {
    return (
      <div className="gs-page kyc-page">
        <section className="gs-section">
          <p className="kyc-loading">Loading KYC…</p>
        </section>
      </div>
    );
  }

  const status = kyc?.status || 'not_submitted';
  const canSubmit = status === 'not_submitted' || status === 'rejected';

  return (
    <div className="gs-page kyc-page">
      <section className="gs-hero gs-hero--gradient kyc-hero" aria-label="KYC verification">
        <div className="gs-hero-inner">
          <p className="gs-hero-kicker">GoldnSilver.shop</p>
          <h1>KYC Verification</h1>
          <p className="gs-hero-copy">
            One-time Aadhaar &amp; PAN verification for product purchases. Submit once and reuse
            every time.
          </p>
        </div>
      </section>

      <section className="gs-section">
        <div className="gs-panel kyc-panel">
          {finishing ? (
            <div className="kyc-status-banner kyc-status-banner--pending">
              <strong>Confirming DigiLocker verification…</strong>
              <p>This usually takes a few seconds. Your KYC will show as approved as soon as DigiLocker responds.</p>
            </div>
          ) : (
          <div className={`kyc-status-banner kyc-status-banner--${status}`}>
            <strong>Status: {statusLabel[status] || status}</strong>
            {kyc?.panMasked && <span>PAN: {kyc.panMasked}</span>}
            {kyc?.aadhaarLast4 && <span>Aadhaar: ****{kyc.aadhaarLast4}</span>}
            {status === 'rejected' && kyc?.rejectionReason && (
              <p className="kyc-reject-reason">Reason: {kyc.rejectionReason}</p>
            )}
            {status === 'pending' && (
              <p>Your documents are under review. Product checkout unlocks after approval.</p>
            )}
            {status === 'approved' && (
              <p>KYC approved. You can buy physical products without submitting again.</p>
            )}
          </div>
          )}

          {!finishing && fromCheckout && status !== 'approved' && (
            <p className="kyc-checkout-note">
              Complete KYC to continue your cart checkout.
              {status === 'pending' ? ' Please wait for admin approval.' : ''}
            </p>
          )}

          {!finishing && canSubmit && (
            <>
              <div className="kyc-method-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  className={`kyc-method-tab${method === 'digilocker' ? ' kyc-method-tab--active' : ''}`}
                  onClick={() => setMethod('digilocker')}
                >
                  DigiLocker (Recommended)
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`kyc-method-tab${method === 'manual' ? ' kyc-method-tab--active' : ''}`}
                  onClick={() => setMethod('manual')}
                >
                  Upload Documents
                </button>
              </div>

              {method === 'digilocker' && (
                <form className="kyc-form" onSubmit={handleDigilockerSubmit}>
                  <p className="kyc-form-hint">
                    You will sign in on DigiLocker and allow sharing of Aadhaar and PAN.
                    A successful DigiLocker check is approved immediately.
                  </p>
                  <label className="kyc-consent">
                    <input
                      type="checkbox"
                      checked={form.consentAccepted}
                      onChange={(e) => updateField('consentAccepted', e.target.checked)}
                    />
                    <span>
                      I confirm these details are mine and authorize GoldnSilver.shop to verify KYC
                      for bullion purchase.
                    </span>
                  </label>
                  {errors.consentAccepted && (
                    <span className="kyc-error">{errors.consentAccepted}</span>
                  )}
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Opening DigiLocker…' : 'Verify with DigiLocker'}
                  </button>
                </form>
              )}

              {method === 'manual' && (
                <form className="kyc-form" onSubmit={handleManualSubmit}>
                  <p className="kyc-form-hint">
                    Upload clear JPG/PNG/PDF scans (max 5MB each). Manual KYC stays under review
                    until admin approval.
                  </p>
                  <label>
                    Full name (as on PAN)
                    <input
                      value={form.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      required
                    />
                    {errors.fullName && <span className="kyc-error">{errors.fullName}</span>}
                  </label>
                  <label>
                    PAN number
                    <input
                      value={form.panNumber}
                      onChange={(e) => updateField('panNumber', e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      required
                    />
                    {errors.panNumber && <span className="kyc-error">{errors.panNumber}</span>}
                  </label>
                  <label>
                    Aadhaar last 4 digits (optional)
                    <input
                      value={form.aadhaarLast4}
                      onChange={(e) =>
                        updateField('aadhaarLast4', e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      inputMode="numeric"
                      maxLength={4}
                    />
                    {errors.aadhaarLast4 && (
                      <span className="kyc-error">{errors.aadhaarLast4}</span>
                    )}
                  </label>
                  <label>
                    PAN front
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.webp,image/*,application/pdf"
                      onChange={(e) =>
                        setFiles((prev) => ({ ...prev, panFront: e.target.files?.[0] || null }))
                      }
                    />
                    {errors.panFront && <span className="kyc-error">{errors.panFront}</span>}
                  </label>
                  <label>
                    Aadhaar front
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.webp,image/*,application/pdf"
                      onChange={(e) =>
                        setFiles((prev) => ({ ...prev, aadhaarFront: e.target.files?.[0] || null }))
                      }
                    />
                    {errors.aadhaarFront && (
                      <span className="kyc-error">{errors.aadhaarFront}</span>
                    )}
                  </label>
                  <label>
                    Aadhaar back
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.webp,image/*,application/pdf"
                      onChange={(e) =>
                        setFiles((prev) => ({ ...prev, aadhaarBack: e.target.files?.[0] || null }))
                      }
                    />
                    {errors.aadhaarBack && (
                      <span className="kyc-error">{errors.aadhaarBack}</span>
                    )}
                  </label>
                  <label className="kyc-consent">
                    <input
                      type="checkbox"
                      checked={form.consentAccepted}
                      onChange={(e) => updateField('consentAccepted', e.target.checked)}
                    />
                    <span>
                      I confirm these documents are mine and authorize GoldnSilver.shop to verify
                      KYC for bullion purchase.
                    </span>
                  </label>
                  {errors.consentAccepted && (
                    <span className="kyc-error">{errors.consentAccepted}</span>
                  )}
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Uploading…' : 'Submit KYC documents'}
                  </button>
                </form>
              )}
            </>
          )}

          <div className="kyc-actions">
            {fromCheckout && status === 'approved' && (
              <Link to="/cart" className="btn-primary">
                Continue to Cart
              </Link>
            )}
            <Link to="/dashboard" className="btn-secondary">
              Go to Dashboard
            </Link>
            {!fromCheckout && (
              <Link to="/cart" className="btn-secondary">
                View Cart
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default KycPage;
