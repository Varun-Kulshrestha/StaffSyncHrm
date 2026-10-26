import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Clock,
  CalendarCheck,
  CreditCard,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  FileText,
  Briefcase
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user, token } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testingPrivilege, setTestingPrivilege] = useState(false);

  // QA Tool: Test calling admin-only endpoint with Employee credentials (Defect 3)
  const testAdminEndpointAccess = async () => {
    setTestingPrivilege(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      setTestResult({
        status: res.status,
        data: data,
        isBypass: res.status === 200
      });
    } catch (err) {
      setTestResult({
        status: 'Error',
        data: { message: err.message },
        isBypass: false
      });
    } finally {
      setTestingPrivilege(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <header className="dashboard-header">
          {/* PRD US-02 AC 3: data-testid="dashboard-title" rendering "Employee Logged In Successfully" */}
          <h1
            data-testid="dashboard-title"
            id="dashboard-title"
            className="dashboard-title"
          >
            <User color="var(--accent-emerald)" size={36} />
            Employee Logged In Successfully
          </h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong style={{ color: '#fff' }}>{user?.name || user?.email}</strong>. Individual staff workspace, attendance tracker, and leave portal.
          </p>
        </header>

        {/* Employee Status Grid */}
        <div className="grid-4">
          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Shift Status</div>
              <div className="stat-val" style={{ color: 'var(--accent-emerald)', fontSize: '1.4rem', marginTop: '0.4rem' }}>
                Clocked In (09:02 AM)
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Clock size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Annual Leave Balance</div>
              <div className="stat-val" style={{ color: 'var(--accent-cyan)' }}>18 Days</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <CalendarCheck size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Latest Payslip</div>
              <div className="stat-val" style={{ fontSize: '1.25rem', marginTop: '0.4rem' }}>
                Sep 2026 (Paid)
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <CreditCard size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Assigned Department</div>
              <div className="stat-val" style={{ fontSize: '1.25rem', marginTop: '0.4rem', color: '#c4b5fd' }}>
                Engineering
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Briefcase size={24} />
            </div>
          </div>
        </div>

        {/* Main Panels */}
        <div className="grid-3" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          {/* Staff Profile & Today's Schedule */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--accent-emerald)" /> Employee Information & Account Context
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.9rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Full Name</span>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.name || 'John Employee'}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Email Address</span>
                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.email}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Role Privilege</span>
                <span className="role-tag employee" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                  {user?.role}
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Account Status</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                  <CheckCircle size={14} /> Active Staff Member
                </span>
              </div>
            </div>
          </div>

          {/* QA RBAC Privilege Test Widget (Seeded Defect 3 Demonstration) */}
          <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldAlert size={20} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '1.15rem' }}>QA RBAC Verification Box</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Verify whether Employee token is correctly denied access to <code style={{ color: 'var(--accent-cyan)' }}>GET /api/v1/admin/stats</code>.
            </p>

            <button
              onClick={testAdminEndpointAccess}
              className="btn-outline"
              style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              disabled={testingPrivilege}
            >
              {testingPrivilege ? 'Dispatching Request...' : 'Trigger Admin Stats Request'}
            </button>

            {testResult && (
              <div style={{
                marginTop: '1rem',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                background: testResult.isBypass ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${testResult.isBypass ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                color: testResult.isBypass ? '#fecdd3' : '#a7f3d0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  {testResult.isBypass ? <AlertTriangle size={16} color="#fb7185" /> : <CheckCircle size={16} />}
                  <span>Response: HTTP {testResult.status}</span>
                </div>
                {testResult.isBypass ? (
                  <p>
                    <strong>🚨 Defect 3 Detected:</strong> Endpoint returned <code>200 OK</code>! Non-admin employee was able to read administrative statistics.
                  </p>
                ) : (
                  <p>Properly restricted: 403 Forbidden returned.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
