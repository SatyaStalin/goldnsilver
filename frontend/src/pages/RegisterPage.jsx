import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../state/ToastContext';
import { useAuth } from '../state/AuthContext';

const RegisterPage = () => {
  const { showToast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    userType: 'general'
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await register(form);
      showToast('Account created successfully!', 'success');
      if (user.userType === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
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
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </label>
          <label>
            Mobile Number
            <input
              type="tel"
              placeholder="10-digit mobile"
              value={form.mobile}
              onChange={(e) => update('mobile', e.target.value)}
              inputMode="numeric"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              minLength={6}
              required
            />
          </label>
          <label>
            User Type
            <select value={form.userType} onChange={(e) => update('userType', e.target.value)} required>
              <option value="general">General User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default RegisterPage;
