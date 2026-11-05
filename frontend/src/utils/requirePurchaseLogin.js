import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';

let lastPromptAt = 0;

export function promptPurchaseLogin(navigate, showToast, from, replace = false) {
  const now = Date.now();
  if (now - lastPromptAt > 1200) {
    lastPromptAt = now;
    showToast('Please login to buy', 'error');
  }
  const next = typeof from === 'string' && from.startsWith('/') ? from : '/';
  navigate('/login', { replace, state: { from: next } });
}

/** Returns true when the shopper is signed in and may add or buy. */
export default function useRequirePurchaseLogin() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  return useCallback(
    (fromPath) => {
      if (loading) return false;
      if (isAuthenticated) return true;
      const from =
        fromPath || `${location.pathname}${location.search || ''}`;
      promptPurchaseLogin(navigate, showToast, from);
      return false;
    },
    [isAuthenticated, loading, location.pathname, location.search, navigate, showToast]
  );
}
