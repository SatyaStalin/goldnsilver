import { useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useToast } from '../state/ToastContext';
import { useAuth } from '../state/AuthContext';
import { authService } from '../services/api';
import PasswordField from '../components/PasswordField';
import { normalizeIndianPhone, validateCheckoutCustomer } from '../utils/checkoutValidation';

const PASSWORD_MAX = 64;

function validateRegister({ name, email, mobile, password, confirmPassword }) {
  const customer = validateCheckoutCustomer({ name, email, phone: mobile });
  const errors = {
    name: customer.errors.name,
    email: customer.errors.email,
    mobile: customer.errors.phone
  };

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  } else if (password.length > PASSWORD_MAX) {
    errors.password = `Password must be at most ${PASSWORD_MAX} characters.`;
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Password must include at least one letter and one number.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please retype your password.';
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  Object.keys(errors).forEach((key) => {
    if (!errors[key]) delete errors[key];
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      ...customer.normalized,
      mobile: normalizeIndianPhone(mobile) || ''
    }
  };
}

const RegisterPage = () => {
  const { showToast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    pinCode: '',
    userType: 'general'
  });
  const latestRef = useRef({ form, confirmPassword });
  latestRef.current = { form, confirmPassword };

  const applyFieldError = (field, message) => {
    setFieldErrors((prev) => {
      if (!message && !prev[field]) return prev;
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleBlur = async (field) => {
    const values = { ...form, confirmPassword };
    const message = validateRegister(values).errors[field] || '';
    applyFieldError(field, message);

    if (field === 'password' && confirmPassword) {
      applyFieldError('confirmPassword', validateRegister(values).errors.confirmPassword || '');
    }

    if (message || (field !== 'email' && field !== 'mobile')) return;

    const check = validateRegister(values);
    const emailAtBlur = check.normalized.email;
    const mobileAtBlur = check.normalized.mobile;
    try {
      const exists = await authService.checkExists({
        email: field === 'email' ? emailAtBlur : undefined,
        mobile: field === 'mobile' ? mobileAtBlur : undefined
      });
      const latest = latestRef.current;
      if (field === 'email') {
        const stillSame = String(latest.form.email || '').trim().toLowerCase() === emailAtBlur;
        if (stillSame && exists.data?.emailExists) {
          applyFieldError('email', 'This email is already registered. Please log in or use a different email.');
        }
      }
      if (field === 'mobile') {
        const stillSame = (normalizeIndianPhone(latest.form.mobile) || '') === mobileAtBlur;
        if (stillSame && exists.data?.mobileExists) {
          applyFieldError('mobile', 'This mobile number is already registered with another account.');
        }
      }
    } catch {
      /* the register request still checks uniqueness */
    }
  };

  const redirectTo =
    typeof location.state?.from === 'string' && location.state.from.startsWith('/')
      ? location.state.from
      : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const check = validateRegister({ ...form, confirmPassword });
    if (!check.valid) {
      setFieldErrors(check.errors);
      showToast(Object.values(check.errors)[0], 'error');
      return;
    }

    setSubmitting(true);
    try {
      try {
        const exists = await authService.checkExists({
          email: check.normalized.email,
          mobile: check.normalized.mobile
        });
        const taken = {};
        if (exists.data?.emailExists) {
          taken.email = 'This email is already registered. Please log in or use a different email.';
        }
        if (exists.data?.mobileExists) {
          taken.mobile = 'This mobile number is already registered with another account.';
        }
        if (Object.keys(taken).length) {
          setFieldErrors(taken);
          showToast(Object.values(taken)[0], 'error');
          setSubmitting(false);
          return;
        }
      } catch {
        /* the register request still checks uniqueness */
      }

      const result = await register({
        ...form,
        name: check.normalized.name,
        email: check.normalized.email,
        mobile: check.normalized.mobile
      });
      showToast('Account created successfully!', 'success');
      if (result.safegold?.linked === false && result.safegold?.error) {
        showToast(
          'Account created, but SafeGold vault link is pending. You can retry from Invest Gold.',
          'error'
        );
      }
      const user = result.user;
      if (user.userType === 'admin') {
        navigate('/admin');
      } else if (redirectTo === '/cart' || redirectTo.includes('checkout') || location.state?.from === '/cart') {
        navigate('/kyc?from=checkout');
      } else {
        navigate('/kyc', { state: { fromSignup: true } });
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.message || 'Registration failed';
      if (code === 'EMAIL_EXISTS') {
        setFieldErrors({ email: message });
      } else if (code === 'MOBILE_EXISTS') {
        setFieldErrors({ mobile: message });
      }
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Create Account</h1>
        <p className="page-hero-desc">Create your account and start investing in gold & silver today.</p>
      </div>

      <section className="panel page-feature auth-form-panel auth-form-panel--register">
        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className={fieldErrors.name ? 'has-error' : ''}>
            Full Name
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              autoComplete="name"
              maxLength={100}
              aria-invalid={Boolean(fieldErrors.name)}
              required
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </label>
          <label className={fieldErrors.email ? 'has-error' : ''}>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="email"
              maxLength={254}
              aria-invalid={Boolean(fieldErrors.email)}
              required
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </label>
          <label className={fieldErrors.mobile ? 'has-error' : ''}>
            Mobile Number
            <input
              type="tel"
              placeholder="10-digit mobile"
              value={form.mobile}
              onChange={(e) => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={() => handleBlur('mobile')}
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              aria-invalid={Boolean(fieldErrors.mobile)}
              required
            />
            {fieldErrors.mobile && <span className="field-error">{fieldErrors.mobile}</span>}
          </label>
          <label className={fieldErrors.password ? 'has-error' : ''}>
            Password
            <PasswordField
              placeholder="Min. 6 characters, with a letter and a number"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="new-password"
              minLength={6}
              maxLength={PASSWORD_MAX}
              aria-invalid={Boolean(fieldErrors.password)}
              required
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </label>
          <label className={fieldErrors.confirmPassword ? 'has-error' : ''}>
            Retype Password
            <PasswordField
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((prev) => {
                  if (!prev.confirmPassword) return prev;
                  const next = { ...prev };
                  delete next.confirmPassword;
                  return next;
                });
              }}
              onBlur={() => handleBlur('confirmPassword')}
              autoComplete="new-password"
              minLength={6}
              maxLength={PASSWORD_MAX}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              required
            />
            {fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
          </label>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" state={location.state?.from ? { from: location.state.from } : undefined}>
              Login
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default RegisterPage;
