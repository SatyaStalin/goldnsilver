import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import {
  authService,
  fetchAppToken,
  getAdminRefreshToken,
  setAdminAccessToken,
  tokenExpiryMs
} from '../services/api';
import './SessionGate.css';

const STORAGE_KEY = 'gs_auth';

const SessionGate = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    const onConfig = (event) => {
      setConfigError(event.detail?.message || 'Superadmin configuration error.');
    };
    const onClear = () => setConfigError('');
    window.addEventListener('gs-gate-config-error', onConfig);
    window.addEventListener('gs-gate-config-clear', onClear);
    return () => {
      window.removeEventListener('gs-gate-config-error', onConfig);
      window.removeEventListener('gs-gate-config-clear', onClear);
    };
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setNote('');
      setOpen(true);
    };
    window.addEventListener('gs-session-expired', onExpired);

    const watch = window.setInterval(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const token = raw ? JSON.parse(raw).token : null;
        if (token && tokenExpiryMs(token) <= Date.now()) onExpired();
      } catch {
        /* ignore */
      }
    }, 30000);

    return () => {
      window.removeEventListener('gs-session-expired', onExpired);
      window.clearInterval(watch);
    };
  }, []);

  const refreshSession = async () => {
    setBusy(true);
    setNote('');
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.refreshToken) {
        const res = await authService.refresh(parsed.refreshToken);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            token: res.data.token,
            refreshToken: res.data.refreshToken,
            user: res.data.user || parsed.user
          })
        );
      } else if (getAdminRefreshToken()) {
        const res = await authService.refresh(getAdminRefreshToken());
        setAdminAccessToken(res.data.token, res.data.refreshToken);
      } else {
        await fetchAppToken(true);
      }
      window.location.reload();
    } catch {
      setNote('This session could not be refreshed. Please log in again.');
      setBusy(false);
    }
  };

  const onLogout = async () => {
    setBusy(true);
    logout();
    setAdminAccessToken(null);
    try {
      await fetchAppToken(true);
    } catch {
      /* home can retry */
    }
    setOpen(false);
    setBusy(false);
    navigate('/');
  };

  const onLogin = () => {
    setOpen(false);
    navigate('/login');
  };

  if (configError) {
    return (
      <div className="sg-session" role="alertdialog" aria-modal="true" aria-labelledby="sg-gate-title">
        <div className="sg-session-card">
          <div className="sg-session-mark" aria-hidden="true">
            ✦
          </div>
          <p className="sg-session-kicker">Superadmin setup</p>
          <h2 id="sg-gate-title">Credentials could not be used</h2>
          <p className="sg-session-copy">{configError}</p>
          <p className="sg-session-note">
            The backend env is the source of truth. The frontend env must use the same username and password.
          </p>
          <div className="sg-session-actions">
            <button
              type="button"
              className="sg-session-primary"
              onClick={() => {
                setConfigError('');
                fetchAppToken(true).catch(() => {});
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!open) return null;

  return (
    <div className="sg-session" role="dialog" aria-modal="true" aria-labelledby="sg-session-title">
      <div className="sg-session-card">
        <div className="sg-session-mark" aria-hidden="true">
          ✦
        </div>
        <p className="sg-session-kicker">Session ended</p>
        <h2 id="sg-session-title">Your secure session has expired</h2>
        <p className="sg-session-copy">
          For your security, access lasts 15 minutes. Refresh this session, log out, or sign in again to continue.
        </p>
        {note ? <p className="sg-session-note">{note}</p> : null}
        <div className="sg-session-actions">
          <button type="button" className="sg-session-primary" onClick={refreshSession} disabled={busy}>
            {busy ? 'Please wait…' : 'Refresh session'}
          </button>
          <button type="button" className="sg-session-ghost" onClick={onLogin} disabled={busy}>
            Go to login
          </button>
          <button type="button" className="sg-session-quiet" onClick={onLogout} disabled={busy}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionGate;
