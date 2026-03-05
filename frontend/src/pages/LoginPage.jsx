import { useToast } from '../state/ToastContext';

const LoginPage = () => {
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Login successful!', 'success');
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">User Login</h1>
        <p className="page-hero-desc">Welcome back! Sign in to your account.</p>
      </div>

      <section className="panel page-feature">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" required />
          </label>
          <button className="btn-primary" type="submit">
            Login
          </button>
        </form>
      </section>
    </div>
  );
};

export default LoginPage;

