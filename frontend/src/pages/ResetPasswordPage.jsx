import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../state/ToastContext';
import { authService } from '../services/api';
import PasswordField from '../components/PasswordField';
import { normalizeIndianPhone, validateCheckoutCustomer } from '../utils/checkoutValidation';

const PASSWORD_MAX = 64;

function validateReset({ email, mobile, password, confirmPassword }) {
  const customer = validateCheckoutCustomer({
    name: 'Account Holder',
    email,
    phone: mobile
  });
  const errors = {
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
      email: customer.normalized.email,
      mobile: normalizeIndianPhone(mobile) || ''
    }
  };
}

const ResetPasswordPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleBlur = (field) => {
    const message = validateReset(form).errors[field] || '';
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const check = validateReset(form);
    if (!check.valid) {
      setFieldErrors(check.errors);
      showToast(Object.values(check.errors)[0], 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.resetPassword({
        email: check.normalized.email,
        mobile: check.normalized.mobile,
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      showToast(res.data?.message || 'Password reset successfully. Please sign in.', 'success');
      navigate('/login', { state: location.state });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        setFieldErrors(apiErrors);
      }
      showToast(err.response?.data?.message || 'Could not reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Reset Password</h1>
        <p className="page-hero-desc">
          Enter the email and mobile number on your account, then choose a new password.
        </p>
      </div>

      <section className="panel page-feature auth-form-panel auth-form-panel--register">
        <form className="form" onSubmit={handleSubmit} noValidate>
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
            New Password
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
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              autoComplete="new-password"
              maxLength={PASSWORD_MAX}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              required
            />
            {fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
          </label>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Resetting…' : 'Reset password'}
          </button>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Remembered it? <Link to="/login" state={location.state}>Back to login</Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default ResetPasswordPage;
