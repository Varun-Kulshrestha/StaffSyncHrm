import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Client-side validation
    const errors = {};
    if (!email || email.trim() === '') {
      errors.email = 'Email is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // NOTE: Frontend trims leading/trailing spaces (US-01 AC 3)
      const trimmedEmail = email.trim();
      const result = await login(trimmedEmail, password);

      if (!result.success) {
        setApiError(result.message || 'Invalid email or password');
        setIsSubmitting(false);
        return;
      }

      // Redirection based on role (US-02 AC 1, 2, 3)
      const role = result.user.role;
      if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'HR') {
        navigate('/hr/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      setApiError('An unexpected error occurred during login. Please try again.');
      setIsSubmitting(false);
    }
  };

  const fillQuickCredentials = (fillEmail, fillPass) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setFieldErrors({});
    setApiError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 1rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)'
          }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            StaffSync <span style={{ color: 'var(--accent-cyan)' }}>HRM</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Enterprise Authentication & Access Gateway
          </p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-card" style={{ padding: '2.25rem 2rem' }}>
          {/* Error Banner */}
          {apiError && (
            <div data-testid="error-banner" id="error-banner" className="error-banner">
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="input-email" className="form-label">
                Work Email Address
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="text"
                  id="input-email"
                  data-testid="input-email"
                  className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                  placeholder="name@staffsync.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <span className="field-error-text">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="input-password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-password"
                  data-testid="input-password"
                  className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error-text">{fieldErrors.password}</span>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              id="btn-login"
              data-testid="btn-login"
              className="btn-primary"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }}></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Seeded Testing Quick Fills */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.85rem'
            }}>
              <Sparkles size={14} color="var(--accent-cyan)" />
              <span>QA Seeded Test Accounts</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
                onClick={() => fillQuickCredentials('admin@staffsync.com', 'Admin@123')}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
                onClick={() => fillQuickCredentials('hr@staffsync.com', 'Hr@123')}
              >
                HR
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
                onClick={() => fillQuickCredentials('employee@staffsync.com', 'Emp@123')}
              >
                Employee
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.78rem', justifyContent: 'center', color: '#fb7185' }}
                onClick={() => fillQuickCredentials('deactivated@staffsync.com', 'Deact@123')}
              >
                Deactivated
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
