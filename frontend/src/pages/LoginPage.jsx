import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../state/ToastContext';
import { useAuth } from '../state/AuthContext';

const LoginPage = () => {
  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      showToast('Login successful!', 'success');
      if (user.userType === 'admin' || user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">User Login</h1>
        <p className="page-hero-desc">Welcome back! Sign in to your account.</p>
      </div>

      <section className="panel page-feature auth-form-panel">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Login'}
          </button>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            New here? <Link to="/register">Create account</Link>
          </p>
        </form>
      </section>
    </div>
  );
};

export default LoginPage;
