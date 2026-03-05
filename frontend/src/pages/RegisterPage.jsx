import { useToast } from '../state/ToastContext';

const RegisterPage = () => {
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Account created successfully!', 'success');
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Create Account</h1>
        <p className="page-hero-desc">Create your account and start investing in gold & silver today.</p>
      </div>

      <section className="panel page-feature">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input type="text" placeholder="Your Name" required />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" required />
          </label>
          <button className="btn-primary" type="submit">
            Create Account
          </button>
        </form>
      </section>
    </div>
  );
};

export default RegisterPage;

