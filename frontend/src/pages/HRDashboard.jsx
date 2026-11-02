import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Clock, Building2 } from 'lucide-react';

export default function HRDashboard() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <header className="dashboard-header">
          {/* Standard Locator: data-testid="dashboard-title" */}
          <h1
            data-testid="dashboard-title"
            id="dashboard-title"
            className="dashboard-title"
          >
            <Users color="var(--accent-cyan)" size={36} />
            HR Logged In Successfully
          </h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong style={{ color: '#fff' }}>{user?.email}</strong>. Human Resources talent pipeline & employee relations portal.
          </p>
        </header>

        {/* HR Key Overview Metrics */}
        <div className="grid-4">
          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Total Workforce</div>
              <div className="stat-val">10</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <Users size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Pending Reviews</div>
              <div className="stat-val" style={{ color: 'var(--accent-amber)' }}>3</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Onboarding Pipeline</div>
              <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>2</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <UserPlus size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Active Departments</div>
              <div className="stat-val">5</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Building2 size={24} />
            </div>
          </div>
        </div>

        {/* Informative placeholder container */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>HR Operations Hub</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            HR management portal authenticated and connected to SQLite datastore. Employee directory controls and leave approvals will activate here.
          </p>
        </div>
      </main>
    </div>
  );
}
