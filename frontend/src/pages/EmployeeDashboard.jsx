import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { User, ShieldAlert, AlertTriangle, CheckCircle, Clock, CalendarCheck } from 'lucide-react';
import ReadOnlyProfileCard from '../components/employees/ReadOnlyProfileCard';
import LeaveBalanceCards from '../components/leaves/LeaveBalanceCards';
import ClockWidget from '../components/attendance/ClockWidget';
import TimesheetCalendar from '../components/attendance/TimesheetCalendar';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testingPrivilege, setTestingPrivilege] = useState(false);
  const [attendanceRefresh, setAttendanceRefresh] = useState(0);

  // Test calling admin-only endpoint with Employee credentials (DEFECT-003)
  const testAdminEndpointAccess = async () => {
    setTestingPrivilege(true);
    setTestResult(null);
    try {
      const data = await authApi.getAdminStats();
      setTestResult({
        status: 200,
        data,
        isBypass: true
      });
    } catch (err) {
      setTestResult({
        status: err.status || 'Rejected',
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
          {/* Standard Locator: data-testid="dashboard-title" */}
          <h1
            data-testid="dashboard-title"
            id="dashboard-title"
            className="dashboard-title"
          >
            <User color="var(--accent-emerald)" size={36} />
            Employee Logged In Successfully
          </h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong style={{ color: '#fff' }}>{user?.email}</strong>. Individual staff workspace and self-service portal.
          </p>
        </header>

        {/* Status Highlights */}
        <div className="grid-3">
          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Shift Status</div>
              <div className="stat-val" style={{ color: 'var(--accent-emerald)', fontSize: '1.4rem', marginTop: '0.4rem' }}>
                Active Session
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Clock size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Statutory Leave Entitlement</div>
              <div className="stat-val" style={{ color: 'var(--accent-cyan)' }}>39 Total Days</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <CalendarCheck size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Assigned Role</div>
              <div className="stat-val" style={{ color: '#a78bfa', fontSize: '1.4rem', marginTop: '0.4rem' }}>
                {user?.role}
              </div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <User size={24} />
            </div>
          </div>
        </div>

        {/* Account Details & QA Tooling */}
        <div className="grid-3" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--accent-emerald)" /> Authenticated Profile Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Unique User Identifier</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{user?.id}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Corporate Email</span>
                <span style={{ fontWeight: 600 }}>{user?.email}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Assigned RBAC Permission</span>
                <span className="role-tag employee" style={{ marginTop: '0.35rem', display: 'inline-block' }}>{user?.role}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Account Status</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem' }}>
                  <CheckCircle size={14} /> Active Personnel
                </span>
              </div>
            </div>
          </div>

          {/* QA RBAC Privilege Test Widget (DEFECT-003 Demonstration) */}
          <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldAlert size={20} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '1.15rem' }}>RBAC Endpoint Audit Box</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Dispatch a call to <code style={{ color: 'var(--accent-cyan)' }}>GET /api/v1/admin/stats</code> with current Employee token to verify DEFECT-003.
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
                  <span>Status: HTTP {testResult.status}</span>
                </div>
                {testResult.isBypass ? (
                  <p>
                    <strong>DEFECT-003 Flagged:</strong> Employee token succeeded in retrieving confidential admin metrics (Status 200).
                  </p>
                ) : (
                  <p>Correctly forbidden: Status 403 Access Denied.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sprint 2: Verified Personal Personnel Profile */}
        <ReadOnlyProfileCard />

        {/* Sprint 3: Statutory Leave Quotas & Balances */}
        <LeaveBalanceCards />

        {/* Sprint 4: Attendance Punch & Working Hours */}
        <ClockWidget onSessionChange={() => setAttendanceRefresh((prev) => prev + 1)} />
        <TimesheetCalendar refreshTrigger={attendanceRefresh} />
      </main>
    </div>
  );
}
