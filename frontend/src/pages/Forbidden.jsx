import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Forbidden() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturnHome = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    switch (user.role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'HR':
        navigate('/hr/dashboard');
        break;
      case 'EMPLOYEE':
      default:
        navigate('/employee/dashboard');
        break;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          margin: '0 auto 1.5rem',
          borderRadius: '20px',
          background: 'rgba(244, 63, 94, 0.15)',
          color: '#fb7185',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldAlert size={40} />
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          color: '#ffffff',
          marginBottom: '0.75rem'
        }}>
          403 Forbidden - Access Denied
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '1.75rem'
        }}>
          Your current role (<strong style={{ color: 'var(--accent-cyan)' }}>{user?.role || 'GUEST'}</strong>) does not have authorization to view this protected resource. RBAC privileges strictly prohibit cross-role navigation.
        </p>

        <button
          onClick={handleReturnHome}
          className="btn-primary"
          style={{ width: '100%' }}
        >
          <ArrowLeft size={16} /> Return to Authorized Dashboard
        </button>
      </div>
    </div>
  );
}
