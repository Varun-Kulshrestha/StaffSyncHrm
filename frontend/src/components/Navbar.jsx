import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Users, Briefcase } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={14} />;
      case 'HR':
        return <Users size={14} />;
      default:
        return <Briefcase size={14} />;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'admin';
      case 'HR':
        return 'hr';
      default:
        return 'employee';
    }
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">
          <Shield size={20} />
        </div>
        <span>StaffSync <span style={{ color: 'var(--accent-cyan)' }}>HRM</span></span>
      </div>

      {user && (
        <div className="nav-user-section">
          <div className="user-pill">
            <span className={`role-tag ${getRoleClass(user.role)}`}>
              {getRoleIcon(user.role)} {user.role}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{user.email}</span>
          </div>

          <button
            data-testid="btn-logout"
            id="btn-logout"
            className="btn-logout"
            onClick={handleLogout}
            title="End authenticated session"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
