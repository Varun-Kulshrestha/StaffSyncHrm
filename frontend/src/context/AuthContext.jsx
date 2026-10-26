import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Validate session on mount
  useEffect(() => {
    async function checkSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('staffsync_user', JSON.stringify(data.user));
        } else {
          // Token invalid or expired
          logoutLocally();
        }
      } catch (err) {
        console.warn('Session verification error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [token]);

  function logoutLocally() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('staffsync_token');
    localStorage.removeItem('staffsync_user');
  }

  async function login(rawEmail, password) {
    try {
      // NOTE: Frontend trims leading/trailing spaces as per US-01 AC 3
      const trimmedEmail = rawEmail ? rawEmail.trim() : '';

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: trimmedEmail, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: data.message || 'Authentication failed'
        };
      }

      // Login success
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('staffsync_token', data.token);
      localStorage.setItem('staffsync_user', JSON.stringify(data.user));

      return {
        success: true,
        user: data.user
      };
    } catch (err) {
      return {
        success: false,
        status: 500,
        message: err.message || 'Unable to connect to server'
      };
    }
  }

  async function logout() {
    if (token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    logoutLocally();
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
