import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('staffsync_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staffsync_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate session on app initialization
  useEffect(() => {
    async function initSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (res.status === 'success' && res.user) {
          setUser(res.user);
          localStorage.setItem('staffsync_user', JSON.stringify(res.user));
        } else {
          clearSession();
        }
      } catch (err) {
        console.warn('Session verification error:', err.message);
        clearSession();
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, [token]);

  function clearSession() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('staffsync_token');
    localStorage.removeItem('staffsync_user');
  }

  async function login(rawEmail, password) {
    // Client-side trimming as per PRD US-01 AC 3
    const trimmedEmail = rawEmail ? rawEmail.trim() : '';

    try {
      const res = await authApi.login(trimmedEmail, password);
      if (res.status === 'success' && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('staffsync_token', res.token);
        localStorage.setItem('staffsync_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, message: 'Invalid credentials response format' };
    } catch (err) {
      return {
        success: false,
        status: err.status || 500,
        message: err.message || 'Authentication failed'
      };
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API warning:', err.message);
    } finally {
      clearSession();
    }
  }

  const value = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
