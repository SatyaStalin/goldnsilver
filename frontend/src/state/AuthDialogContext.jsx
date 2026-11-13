import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { authService } from '../services/api';
import '../pages/AuthWelcomePage.css';

const AuthDialogContext = createContext(null);

const METHODS = [
  { id: 'email', label: 'Email' },
  { id: 'mobile', label: 'Phone' },
  { id: 'digilocker', label: 'DigiLocker' }
];

function AuthDialog() {
  const { open, intent, from, closeAuth, setIntent } = useAuthDialog();
  const { acceptSession } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [method, setMethod] = useState('email');
  const [step, setStep] = useState('contact');
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
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
    setMethod('email');
    setStep('contact');
    setValue('');
    setCode('');
  }, [open, intent]);

  if (!open) return null;

  const chooseMethod = (next) => {
    setMethod(next);
    setStep('contact');
    setValue('');
    setCode('');
  };

  const finishSession = (data) => {
    const user = acceptSession(data);
    closeAuth();
    showToast('Verified successfully', 'success');
    const next = user?.userType === 'admin' || user?.role === 'admin' ? '/admin' : from || '/dashboard';
    navigate(next);
  };

  const sendCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await authService.sendOtp({ channel: method, value, intent });
      setStep('code');
      showToast(method === 'email' ? 'Code sent to your email' : 'Code sent to your mobile', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not send the code', 'error');
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const res = await authService.verifyOtp({ channel: method, value, code, intent });
      finishSession(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not verify the code', 'error');
    } finally {
      setBusy(false);
    }
  };

  const startDigilocker = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const res = await authService.startDigilockerAccount({ from });
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
        className="auth-modal auth-modal--simple"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
      >
        <button type="button" className="auth-modal-close" onClick={closeAuth} aria-label="Close">×</button>
        <p className="auth-dialog-kicker">{intent === 'register' ? 'New customer' : 'Welcome back'}</p>
        <h2 id="auth-dialog-title">{intent === 'register' ? 'Create your account' : 'Sign in'}</h2>
        <div className="auth-method-row" role="tablist" aria-label="Sign-in method">
          {METHODS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={method === item.id}
              className={method === item.id ? 'is-active' : ''}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                chooseMethod(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

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
                onChange={(e) => setValue(e.target.value)}
                required
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
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </label>
          )}
          {method === 'digilocker' && (
            <p className="auth-modal-note">DigiLocker confirms your name and signs you in. New and existing customers use the same button.</p>
          )}
          <button className="btn-primary auth-modal-submit" type="submit" disabled={busy}>
            {submitLabel}
          </button>
          {method !== 'digilocker' && step === 'code' && (
            <button type="button" className="auth-text-btn" disabled={busy} onClick={sendCode}>
              Send a new code
            </button>
          )}
        </form>
        <button
          type="button"
          className="auth-switch"
          onClick={() => setIntent(intent === 'register' ? 'login' : 'register')}
        >
          {intent === 'register' ? 'Already registered? Sign in' : 'New here? Create an account'}
        </button>
      </div>
    </div>
  );
}

export function AuthDialogProvider({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState('login');
  const [from, setFrom] = useState('/dashboard');

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

  useEffect(() => {
    const onOpen = (event) => {
      openAuth(event.detail?.intent, event.detail?.from);
    };
    window.addEventListener('gs-open-auth', onOpen);
    return () => window.removeEventListener('gs-open-auth', onOpen);
  }, [openAuth]);

  return (
    <AuthDialogContext.Provider value={{ open, intent, from, openAuth, closeAuth, setIntent }}>
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
