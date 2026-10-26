import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Clock,
  Briefcase,
  CheckCircle,
  Calendar,
  FileCheck,
  Building2
} from 'lucide-react';

export default function HrDashboard() {
  const { user } = useAuth();

  const departmentData = [
    { name: 'Engineering', count: 42, lead: 'Alex Mercer', openPositions: 3 },
    { name: 'Human Resources', count: 8, lead: 'Sarah Jenkins', openPositions: 1 },
    { name: 'Marketing & Sales', count: 18, lead: 'Elena Rostova', openPositions: 2 },
    { name: 'Customer Support', count: 24, lead: 'David Chen', openPositions: 4 }
  ];

  const pendingRequests = [
    { id: 'LR-101', name: 'John Employee', type: 'Annual Leave', dates: 'Nov 02 - Nov 06', status: 'Pending Approval' },
    { id: 'LR-102', name: 'Maria Garcia', type: 'Sick Leave', dates: 'Oct 28 - Oct 29', status: 'Pending Approval' },
    { id: 'LR-103', name: 'Sam Wilson', type: 'Paternity Leave', dates: 'Nov 10 - Nov 24', status: 'Under Review' },
  ];

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <header className="dashboard-header">
          {/* PRD US-02 AC 2: data-testid="dashboard-title" rendering "HR Logged In Successfully" */}
          <h1
            data-testid="dashboard-title"
            id="dashboard-title"
            className="dashboard-title"
          >
            <Users color="var(--accent-cyan)" size={36} />
            HR Logged In Successfully
          </h1>
          <p className="dashboard-subtitle">
            Welcome back, <strong style={{ color: '#fff' }}>{user?.name || user?.email}</strong>. Human Resources talent pipeline & employee relations portal.
          </p>
        </header>

        {/* HR KPI Cards */}
        <div className="grid-4">
          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Total Workforce</div>
              <div className="stat-val">92</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <Users size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Pending Leave Requests</div>
              <div className="stat-val" style={{ color: 'var(--accent-amber)' }}>7</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Onboarding Pipeline</div>
              <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>4</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <UserPlus size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <div className="stat-label">Active Departments</div>
              <div className="stat-val">6</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Building2 size={24} />
            </div>
          </div>
        </div>

        {/* HR Operations Grid */}
        <div className="grid-3" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          {/* Department Structure */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} color="var(--accent-cyan)" /> Departmental Workforce Allocation
            </h3>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Staff Count</th>
                    <th>Department Lead</th>
                    <th>Open Requisitions</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{dept.name}</td>
                      <td>{dept.count} Members</td>
                      <td style={{ color: 'var(--text-muted)' }}>{dept.lead}</td>
                      <td>
                        <span style={{
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: '#67e8f9',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          {dept.openPositions} Open
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Leave Approvals */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--accent-amber)" /> Leave Approvals Queue
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{req.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {req.type} • {req.dates}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#fbbf24',
                    background: 'rgba(245, 158, 11, 0.15)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px'
                  }}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
