import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, tokenExpiryMs } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'gs_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((nextToken, nextUser, nextRefresh) => {
    if (nextToken && nextUser) {
      let refreshToken = nextRefresh || null;
      if (!refreshToken) {
        try {
          refreshToken = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').refreshToken || null;
        } catch {
          refreshToken = null;
        }
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: nextToken, refreshToken, user: nextUser })
      );
      setToken(nextToken);
      setUser(nextUser);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }
    try {
      const { token: savedToken, user: savedUser } = JSON.parse(raw);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        if (tokenExpiryMs(savedToken) <= Date.now()) {
          window.dispatchEvent(new CustomEvent('gs-session-expired', { detail: { code: 'TOKEN_EXPIRED' } }));
          return;
        }
        authService
          .getMe(savedToken)
          .then((res) => {
            if (res.data?.user) persist(savedToken, res.data.user);
          })
          .catch((err) => {
            const code = err.response?.data?.code;
            if (code === 'TOKEN_EXPIRED') {
              window.dispatchEvent(new CustomEvent('gs-session-expired', { detail: { code } }));
            } else {
              persist(null, null);
            }
          });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    persist(res.data.token, res.data.user, res.data.refreshToken);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    persist(res.data.token, res.data.user, res.data.refreshToken);
    return { user: res.data.user, safegold: res.data.safegold || null };
  };

  const logout = () => persist(null, null);

  const updateUser = (nextUser) => {
    if (token && nextUser) persist(token, nextUser);
  };

  const isAdmin = user?.userType === 'admin' || user?.role === 'admin';
  const isGeneral = user && !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        isGeneral,
        isAuthenticated: Boolean(user && token)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
