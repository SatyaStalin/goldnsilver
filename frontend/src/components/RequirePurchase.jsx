import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { promptPurchaseLogin } from '../utils/requirePurchaseLogin';

/** Cart and checkout stay closed until the shopper is signed in. */
export default function RequirePurchase({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (loading || isAuthenticated) return;
    promptPurchaseLogin(
      navigate,
      showToast,
      `${location.pathname}${location.search || ''}`,
      true
    );
  }, [isAuthenticated, loading, location.pathname, location.search, navigate, showToast]);

  if (loading || !isAuthenticated) return null;
  return children;
}
