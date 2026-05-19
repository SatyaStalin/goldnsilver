import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Zerodha app redirect URL is often the site root (e.g. https://goldnsilver.shop).
 * Kite appends ?request_token=…&action=login&status=success — forward to /zerodha-integration
 * so existing OAuth handling can run.
 */
const ZerodhaOAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/zerodha-integration') return;

    const params = new URLSearchParams(location.search);
    const requestToken = params.get('request_token');
    const status = params.get('status');
    const action = params.get('action');

    if (
      requestToken &&
      (status === 'success' || action === 'login')
    ) {
      navigate(`/zerodha-integration${location.search}`, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return null;
};

export default ZerodhaOAuthRedirect;
