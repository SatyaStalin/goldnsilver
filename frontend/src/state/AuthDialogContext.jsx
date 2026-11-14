import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { authService } from '../services/api';
import '../pages/AuthWelcomePage.css';

const AuthDialogContext = createContext(null);

const METHODS = [
  { id: 'email', label: 'Email' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'digilocker', label: 'DigiLocker' }
];

function indianMobile(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : '';
}

function emailLooksValid(raw) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(raw || '').trim());
}

function contactError(method, raw) {
  const value = String(raw || '').trim();
  if (method === 'email') {
    if (!value) return 'Enter your email address.';
    if (!emailLooksValid(value)) return 'Enter a valid email, such as name@example.com.';
    return '';
  }
  if (!value) return 'Enter your mobile number.';
  if (!indianMobile(value)) return 'Enter a 10-digit mobile number starting with 6, 7, 8, or 9.';
  return '';
}

function loginIdError(raw) {
  const value = String(raw || '').trim();
  if (!value) return 'Enter your mobile number or email.';
  if (value.includes('@')) {
    return emailLooksValid(value) ? '' : 'Enter a valid email, such as name@example.com.';
  }
  return indianMobile(value) ? '' : 'Enter a valid email, or a 10-digit mobile number.';
}

function friendlyAuthMessage(message, fallback) {
  const text = String(message || '').trim();
  if (!text) return fallback;
  if (/invalid credentials/i.test(text)) {
    return 'Those sign-in details do not match. Check the email or mobile and the password.';
  }
  return text;
}

function AuthDialog() {
  const { open, intent, from, closeAuth, setIntent, consumePreset } = useAuthDialog();
  const { acceptSession } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [method, setMethod] = useState('email');
  const [step, setStep] = useState('contact');
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [panel, setPanel] = useState('home');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpChooser, setOtpChooser] = useState(false);
  const [formError, setFormError] = useState('');
  const flowRef = useRef('login');
  const accountRef = useRef({ email: '', mobile: '' });
  const [resetToken, setResetToken] = useState('');
  const [otpAccessToken, setOtpAccessToken] = useState('');
  const [passwordReady, setPasswordReady] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setMethod('email');
    setStep('contact');
    setValue('');
    setCode('');
    flowRef.current = 'login';
    accountRef.current = { email: '', mobile: '' };
    setPanel('home');
    setLoginId('');
    setLoginPassword('');
    setShowPassword(false);
    setOtpChooser(false);
    setFormError('');
    const preset = consumePreset();
    if (preset?.panel === 'reset-password' && preset.resetToken) {
      setPanel('reset-password');
      setResetToken(preset.resetToken);
      setOtpAccessToken('');
      setPasswordReady(true);
      setNewPassword('');
      setConfirmPassword('');
      return;
    }
    setResetToken('');
    setOtpAccessToken('');
    setPasswordReady(false);
    setNewPassword('');
    setConfirmPassword('');
  }, [open, consumePreset]);

  if (!open) return null;

  const chooseMethod = (next) => {
    if (METHODS.find((item) => item.id === next)?.disabled) return;
    setMethod(next);
    setStep('contact');
    setValue('');
    setCode('');
    setFormError('');
  };

  const finishSession = (data, message) => {
    const user = acceptSession(data);
    closeAuth();
    showToast(message || 'Verified successfully', 'success');
    const next = user?.userType === 'admin' || user?.role === 'admin' ? '/admin' : from || '/dashboard';
    navigate(next);
  };

  const sendCode = async (event) => {
    event.preventDefault();
    const problem = contactError(method, value);
    if (problem) {
      setFormError(problem);
      showToast(problem, 'error');
      return;
    }
    setFormError('');
    setBusy(true);
    try {
      await authService.sendOtp({
        channel: method,
        value,
        intent: flowRef.current === 'reset' ? 'reset' : intent
      });
      setStep('code');
      showToast(method === 'email' ? 'Code sent to your email' : 'Code sent to your mobile', 'success');
    } catch (err) {
      const message = friendlyAuthMessage(err.response?.data?.message, 'We could not send the code. Please try again.');
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    const digits = String(code || '').replace(/\D/g, '');
    if (digits.length !== 6) {
      const problem = 'Enter the 6-digit code we sent you.';
      setFormError(problem);
      showToast(problem, 'error');
      return;
    }
    setFormError('');
    setBusy(true);
    try {
      const res = await authService.verifyOtp({
        channel: method,
        value,
        code: digits,
        intent: flowRef.current === 'reset' ? 'reset' : intent
      });
      if (flowRef.current === 'reset') {
        const account = res.data?.user || {};
        const typed = String(value || '').trim();
        accountRef.current = {
          email: emailLooksValid(account.email)
            ? String(account.email).trim().toLowerCase()
            : method === 'email' && emailLooksValid(typed)
              ? typed.toLowerCase()
              : '',
          mobile: indianMobile(account.mobile) || (method === 'mobile' ? indianMobile(typed) : '')
        };
        if (res.data?.resetToken) {
          setResetToken(res.data.resetToken);
          setOtpAccessToken('');
        } else if (res.data?.token) {
          setResetToken('');
          setOtpAccessToken(res.data.token);
        } else {
          throw new Error('The code was accepted, but the password step did not open. Please try again.');
        }
        setPasswordReady(true);
        setFormError('');
        showToast('Code verified. Set your new password.', 'success');
        return;
      }
      finishSession(res.data);
    } catch (err) {
      const message = friendlyAuthMessage(
        err.response?.data?.message || err.message,
        'That code could not be checked. Please try again.'
      );
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const loginWithPassword = async (event) => {
    event.preventDefault();
    const idProblem = loginIdError(loginId);
    if (idProblem) {
      setFormError(idProblem);
      showToast(idProblem, 'error');
      return;
    }
    if (!String(loginPassword || '').trim()) {
      const problem = 'Enter your password.';
      setFormError(problem);
      showToast(problem, 'error');
      return;
    }
    setFormError('');
    setBusy(true);
    try {
      const res = await authService.login({ email: loginId.trim(), password: loginPassword });
      finishSession(res.data);
    } catch (err) {
      const message = friendlyAuthMessage(err.response?.data?.message, 'We could not sign you in. Please try again.');
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const beginSignup = (nextMethod) => {
    if (METHODS.find((item) => item.id === nextMethod)?.disabled) return;
    flowRef.current = 'register';
    setIntent('register');
    setMethod(nextMethod);
    setValue('');
    setCode('');
    setStep('contact');
    setOtpChooser(false);
    setFormError('');
    if (nextMethod === 'digilocker') {
      startDigilocker();
      return;
    }
    setPanel('contact');
  };

  const beginOtpLogin = () => {
    flowRef.current = 'login';
    setIntent('login');
    setMethod('email');
    setValue('');
    setCode('');
    setStep('contact');
    setOtpChooser(true);
    setFormError('');
    setPanel('contact');
  };

  const passwordProblem = (password, again) => {
    if (!password) return 'Enter a new password.';
    if (password.length < 6 || password.length > 64) return 'Use 6 to 64 characters for the password.';
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return 'Use at least one letter and one number in the password.';
    }
    if (!again) return 'Retype the new password.';
    if (again !== password) return 'Retype the same password in both fields.';
    return '';
  };

  const saveNewPassword = async (event) => {
    event.preventDefault();
    if (!passwordReady || (!resetToken && !otpAccessToken)) {
      const problem = 'Verify with Email, Mobile, or DigiLocker before setting a password.';
      setFormError(problem);
      showToast(problem, 'error');
      return;
    }
    const form = event.currentTarget;
    const password = String(form?.elements?.namedItem('gs-new-password')?.value ?? newPassword ?? '');
    const again = String(form?.elements?.namedItem('gs-confirm-password')?.value ?? confirmPassword ?? '');
    const problem = passwordProblem(password, again);
    if (problem) {
      setFormError(problem);
      showToast(problem, 'error');
      return;
    }
    setFormError('');
    setBusy(true);
    try {
      const account = accountRef.current;
      const res = await authService.resetPassword({
        ...(resetToken ? { resetToken } : {}),
        ...(otpAccessToken ? { accessToken: otpAccessToken } : {}),
        ...(account.email ? { email: account.email } : {}),
        ...(account.mobile ? { mobile: account.mobile } : {}),
        newPassword: password,
        password,
        confirmPassword: again
      });
      if (!res.data?.passwordUpdated) {
        throw new Error('The new password was not saved. Please try again.');
      }
      const identifier = account.email || account.mobile || res.data?.user?.email || res.data?.user?.mobile;
      if (!identifier) {
        throw new Error('The new password was saved, but sign-in details are missing. Sign in with the new password.');
      }
      const loginRes = await authService.login({ email: identifier, password });
      if (!loginRes.data?.token || !loginRes.data?.user) {
        throw new Error('The new password was not saved. Please try again.');
      }
      finishSession(loginRes.data, 'Password updated. You are signed in.');
    } catch (err) {
      const raw = err.response?.data?.message || err.message;
      const message = /invalid credentials/i.test(String(raw || ''))
        ? 'The new password was not saved. Your previous password is still active.'
        : friendlyAuthMessage(raw, 'We could not save the password. Please try again.');
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const backHome = () => {
    flowRef.current = 'login';
    setPanel('home');
    setFormError('');
  };

  const beginForgot = () => {
    flowRef.current = 'reset';
    accountRef.current = { email: '', mobile: '' };
    setPanel('forgot');
    setMethod('email');
    setStep('contact');
    setValue('');
    setCode('');
    setResetToken('');
    setOtpAccessToken('');
    setPasswordReady(false);
    setNewPassword('');
    setConfirmPassword('');
    setFormError('');
    setOtpChooser(true);
  };

  const startDigilocker = async (event, forReset) => {
    if (event?.preventDefault) event.preventDefault();
    setBusy(true);
    try {
      const res = await authService.startDigilockerAccount({ from, reset: Boolean(forReset) });
      if (!res.data?.url) throw new Error('DigiLocker did not return a sign-in link');
      window.location.assign(res.data.url);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Could not open DigiLocker', 'error');
      setBusy(false);
    }
  };

  const onSubmit = method === 'digilocker' ? startDigilocker : step === 'code' ? verifyCode : sendCode;
  const submitLabel = busy
    ? 'Please wait…'
    : method === 'digilocker'
      ? 'Continue with DigiLocker'
      : step === 'code'
        ? 'Verify'
        : intent === 'register'
          ? 'Send code'
          : 'Continue';

  return (
    <div className="auth-modal-backdrop">
      <div
        className="auth-modal auth-modal--welcome"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
      >
        <button type="button" className="auth-modal-close" onClick={closeAuth} aria-label="Close">×</button>
        <div className="auth-welcome-head">
          <img src="/brand-logo.png" alt="GoldnSilver" />
          <h2 id="auth-dialog-title">Welcome to GoldnSilver.shop</h2>
          <p>Create your account or sign in to continue.</p>
        </div>

        {panel === 'home' ? (
          <>
            <section className="auth-sheet">
              <div className="auth-sheet-title">
                <h3>New Customer</h3>
                <p>Choose one option to create your account.</p>
              </div>
              <div className="auth-choice-row">
                <article className="auth-choice">
                  <span className="auth-choice-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="8" y="3" width="8" height="18" rx="2" />
                      <path d="M11 18h2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <h4>Mobile Number</h4>
                  <p>Register with mobile OTP</p>
                  <button type="button" className="auth-choice-btn" disabled={busy} onClick={() => beginSignup('mobile')}>Use Mobile</button>
                </article>
                <span className="auth-choice-or">OR</span>
                <article className="auth-choice">
                  <span className="auth-choice-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  </span>
                  <h4>Email ID</h4>
                  <p>Register with email OTP</p>
                  <button type="button" className="auth-choice-btn" disabled={busy} onClick={() => beginSignup('email')}>Use Email</button>
                </article>
                <span className="auth-choice-or">OR</span>
                <article className="auth-choice">
                  <span className="auth-choice-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M7 3.5h7l4 4V20.5H7z" />
                      <path d="M14 3.5V8h4" />
                      <rect x="9" y="12" width="6" height="5" rx="1" />
                    </svg>
                  </span>
                  <h4>DigiLocker</h4>
                  <p>Register through DigiLocker</p>
                  <button type="button" className="auth-choice-btn" disabled={busy} onClick={() => beginSignup('digilocker')}>Use DigiLocker</button>
                </article>
              </div>
            </section>

            <section className="auth-sheet">
              <div className="auth-sheet-title">
                <h3>Existing Customer</h3>
                <p>Sign in with your registered details.</p>
              </div>
              <form onSubmit={loginWithPassword}>
                <label>
                  Mobile / Email
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your registered mobile number or email"
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value);
                      if (formError) setFormError('');
                    }}
                  />
                </label>
                <label>
                  Password
                  <span className="auth-pass-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (formError) setFormError('');
                      }}
                    />
                    <button
                      type="button"
                      className="auth-pass-eye"
                      onClick={() => setShowPassword((openEye) => !openEye)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </span>
                </label>
                <button type="button" className="auth-forgot" onClick={beginForgot}>
                  Forgot password?
                </button>
                {formError && panel === 'home' && <p className="auth-inline-error">{formError}</p>}
                <button className="auth-choice-btn auth-login-btn" type="submit" disabled={busy}>
                  {busy ? 'Please wait…' : 'Login'}
                </button>
              </form>
              <div className="auth-otp-divider"><span>or</span></div>
              <button type="button" className="auth-otp-link" onClick={beginOtpLogin}>
                Sign in using OTP
              </button>
            </section>
          </>
        ) : panel === 'forgot' || panel === 'reset-password' ? (
          <section className="auth-sheet">
            <div className="auth-sheet-title">
              <h3>Forgot password</h3>
              <p>
                {passwordReady
                  ? 'Verified. Set a new password.'
                  : 'Verify with Email, Mobile, or DigiLocker. Then set a new password.'}
              </p>
            </div>
            {!passwordReady && (
              <>
                <div className="auth-method-row" role="tablist" aria-label="Reset method">
                  {METHODS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={method === item.id}
                      aria-disabled={item.disabled ? 'true' : undefined}
                      className={method === item.id ? 'is-active' : ''}
                      disabled={item.disabled}
                      onClick={(event) => {
                        event.preventDefault();
                        chooseMethod(item.id);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <form noValidate onSubmit={method === 'digilocker' ? (event) => startDigilocker(event, true) : step === 'code' ? verifyCode : sendCode}>
                  {method !== 'digilocker' && step === 'contact' && (
                    <label>
                      {method === 'email' ? 'Email address' : 'Mobile number'}
                      <input
                        type={method === 'email' ? 'email' : 'tel'}
                        value={value}
                        placeholder={method === 'email' ? 'you@example.com' : '10-digit mobile number'}
                        onChange={(e) => {
                          setValue(e.target.value);
                          if (formError) setFormError('');
                        }}
                      />
                    </label>
                  )}
                  {method !== 'digilocker' && step === 'code' && (
                    <label>
                      Code sent to {value}
                      <input
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                          if (formError) setFormError('');
                        }}
                      />
                    </label>
                  )}
                  {method === 'digilocker' && (
                    <p className="auth-modal-note">DigiLocker confirms this account. You will set the password when you return.</p>
                  )}
                  <button className="auth-choice-btn auth-login-btn" type="submit" disabled={busy}>
                    {busy ? 'Please wait…' : method === 'digilocker' ? 'Use DigiLocker' : step === 'code' ? 'Verify' : 'Send code'}
                  </button>
                  {method !== 'digilocker' && step === 'code' && (
                    <button type="button" className="auth-text-btn" disabled={busy} onClick={sendCode}>
                      Send a new code
                    </button>
                  )}
                </form>
              </>
            )}
            <form noValidate onSubmit={saveNewPassword}>
              <label>
                New password
                <span className="auth-pass-wrap">
                  <input
                    name="gs-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="off"
                    placeholder="New password"
                    value={newPassword}
                    disabled={!passwordReady}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (formError) setFormError('');
                    }}
                  />
                  <button
                    type="button"
                    className="auth-pass-eye"
                    disabled={!passwordReady}
                    onClick={() => setShowNewPassword((openEye) => !openEye)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? 'Hide' : 'Show'}
                  </button>
                </span>
              </label>
              <label>
                Retype password
                <input
                  name="gs-confirm-password"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="off"
                  placeholder="Retype password"
                  value={confirmPassword}
                  disabled={!passwordReady}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                />
              </label>
              {formError && <p className="auth-inline-error">{formError}</p>}
              <button className="auth-choice-btn auth-login-btn" type="submit" disabled={busy || !passwordReady}>
                {busy ? 'Please wait…' : 'Save password'}
              </button>
            </form>
            <button type="button" className="auth-otp-link" onClick={backHome}>
              Back
            </button>
          </section>
        ) : (
          <section className="auth-sheet">
            <div className="auth-sheet-title">
              <h3>{intent === 'register' ? 'Create your account' : 'Sign in with a code'}</h3>
              <p>
                {method === 'digilocker'
                  ? 'DigiLocker confirms your name and signs you in.'
                  : intent === 'register'
                    ? `Register with ${method === 'email' ? 'email' : 'mobile'} OTP.`
                    : 'Use Email, Mobile, or DigiLocker.'}
              </p>
            </div>
            {otpChooser && (
              <div className="auth-method-row" role="tablist" aria-label="Sign-in method">
                {METHODS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={method === item.id}
                    aria-disabled={item.disabled ? 'true' : undefined}
                    className={method === item.id ? 'is-active' : ''}
                    disabled={item.disabled}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      chooseMethod(item.id);
                      setStep('contact');
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={onSubmit}>
              {method !== 'digilocker' && step === 'contact' && (
                <label>
                  {method === 'email' ? 'Email address' : 'Mobile number'}
                  <input
                    type={method === 'email' ? 'email' : 'tel'}
                    inputMode={method === 'email' ? 'email' : 'numeric'}
                    autoComplete={method === 'email' ? 'email' : 'tel'}
                    placeholder={method === 'email' ? 'you@example.com' : '10-digit mobile number'}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (formError) setFormError('');
                    }}
                  />
                </label>
              )}
              {method !== 'digilocker' && step === 'code' && (
                <label>
                  Code sent to {value}
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      if (formError) setFormError('');
                    }}
                  />
                </label>
              )}
              {formError && <p className="auth-inline-error">{formError}</p>}
              {method === 'digilocker' && (
                <p className="auth-modal-note">New and existing customers use the same DigiLocker button.</p>
              )}
              <button className="auth-choice-btn auth-login-btn" type="submit" disabled={busy}>
                {submitLabel}
              </button>
              {method !== 'digilocker' && step === 'code' && (
                <button type="button" className="auth-text-btn" disabled={busy} onClick={sendCode}>
                  Send a new code
                </button>
              )}
            </form>
            <button type="button" className="auth-otp-link" onClick={backHome}>
              Back
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export function AuthDialogProvider({ children }) {
  const location = useLocation();
  const presetRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState('login');
  const [from, setFrom] = useState('/dashboard');
  const consumePreset = useCallback(() => {
    const preset = presetRef.current;
    presetRef.current = null;
    return preset;
  }, []);

  const openAuth = useCallback((nextIntent, fromPath) => {
    setIntent(nextIntent === 'register' ? 'register' : 'login');
    if (typeof fromPath === 'string' && fromPath.startsWith('/')) setFrom(fromPath);
    else {
      const here = `${location.pathname}${location.search || ''}`;
      if (here && here !== '/login' && here !== '/register') setFrom(here);
    }
    setOpen(true);
  }, [location.pathname, location.search]);

  const closeAuth = useCallback(() => setOpen(false), []);

  const openFromEvent = useCallback((event) => {
    const detail = event.detail || {};
    if (detail.panel === 'reset-password' && detail.resetToken) {
      presetRef.current = { panel: 'reset-password', resetToken: detail.resetToken };
    }
    openAuth(detail.intent, detail.from);
  }, [openAuth]);

  useEffect(() => {
    window.addEventListener('gs-open-auth', openFromEvent);
    return () => window.removeEventListener('gs-open-auth', openFromEvent);
  }, [openFromEvent]);

  return (
    <AuthDialogContext.Provider value={{ open, intent, from, openAuth, closeAuth, setIntent, consumePreset }}>
      {children}
      <AuthDialog />
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const value = useContext(AuthDialogContext);
  if (!value) throw new Error('Auth dialog is unavailable');
  return value;
}
