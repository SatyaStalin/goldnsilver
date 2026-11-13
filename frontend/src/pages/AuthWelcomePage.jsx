import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useAuthDialog } from '../state/AuthDialogContext';
import './AuthWelcomePage.css';

const AuthWelcomePage = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { openAuth } = useAuthDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const intent = location.pathname === '/register' ? 'register' : 'login';
  const redirectTo = typeof location.state?.from === 'string' && location.state.from.startsWith('/')
    ? location.state.from
    : '/dashboard';

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : redirectTo, { replace: true });
      return;
    }
    openAuth(intent, redirectTo);
  }, [loading, isAuthenticated, isAdmin, intent, navigate, openAuth, redirectTo]);

  return (
    <div className="auth-welcome-quiet">
      <h1>{intent === 'register' ? 'Create your account' : 'Sign in'}</h1>
      <p>Choose email, phone, or DigiLocker.</p>
      <button type="button" className="btn-primary" onClick={() => openAuth(intent, redirectTo)}>
        {intent === 'register' ? 'Open signup' : 'Open sign in'}
      </button>
    </div>
  );
};

export default AuthWelcomePage;
