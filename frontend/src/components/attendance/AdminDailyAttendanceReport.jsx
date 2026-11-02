import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../services/api';
import { Users, Clock, CheckCircle, AlertTriangle, XCircle, RefreshCw, Calendar } from 'lucide-react';

export default function AdminDailyAttendanceReport() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getAdminDailyReport(selectedDate);
      if (res.status === 'success') {
        setReportData(res.data);
      }
    } catch (err) {
      console.warn('Admin attendance report fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReport();
  }, [selectedDate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--accent-emerald)',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px'
          }}>
            <CheckCircle size={13} /> Present
          </span>
        );
      case 'HALF_DAY':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--accent-amber)',
            background: 'rgba(245, 158, 11, 0.12)',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px'
          }}>
            <AlertTriangle size={13} /> Half-Day
          </span>
        );
      case 'ABSENT':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--accent-rose)',
            background: 'rgba(244, 63, 94, 0.12)',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px'
          }}>
            <XCircle size={13} /> Absent
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--accent-cyan)',
            background: 'rgba(6, 182, 212, 0.12)',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px'
          }}>
            <Clock size={13} className="spin" /> In Progress
          </span>
        );
    }
  };

  const metrics = reportData?.metrics;

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
      {/* Header and Date Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
            Organization Daily Attendance Roster
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Executive oversight, real-time clock-in distribution, and active personnel shifts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={18} color="var(--text-subtle)" />
            <input
              type="date"
              className="form-input"
              style={{ padding: '0.65rem 1rem' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button onClick={fetchDailyReport} className="btn-outline" title="Refresh Attendance Roster">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        <div className="glass-card stat-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div className="stat-label">Total Active Workforce</div>
            <div className="stat-val">{metrics?.totalHeadcount ?? 10}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div className="stat-label">Clocked In / Present</div>
            <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>
              {metrics?.clockedInCount ?? 0}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div className="stat-label">Half-Day Sessions</div>
            <div className="stat-val" style={{ color: 'var(--accent-amber)' }}>
              {metrics?.halfDayCount ?? 0}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="glass-card stat-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div className="stat-label">Absent / Unreported</div>
            <div className="stat-val" style={{ color: 'var(--accent-rose)' }}>
              {metrics?.absentCount ?? 0}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Admin Organization-Wide Daily Roster Table: table-admin-attendance-roster */}
      <div className="table-container">
        <table data-testid="table-admin-attendance-roster" id="table-admin-attendance-roster" className="custom-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Personnel Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Clock In Time</th>
              <th>Clock Out Time</th>
              <th>Logged Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} className="spin" />
                    <span>Loading daily organizational roster...</span>
                  </div>
                </td>
              </tr>
            ) : !reportData?.roster || reportData.roster.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No attendance activity logged for date: {selectedDate}.
                </td>
              </tr>
            ) : (
              reportData.roster.map((r) => {
                const inFormatted = r.clockInTime ? new Date(r.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
                const outFormatted = r.clockOutTime ? new Date(r.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (r.status === 'IN_PROGRESS' ? 'Active Shift' : '—');
                const hours = Math.floor(r.durationMinutes / 60);
                const mins = r.durationMinutes % 60;

                return (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-cyan)' }}>{r.employeeId}</td>
                    <td style={{ fontWeight: 600 }}>{r.fullName}</td>
                    <td>
                      <span className="role-tag hr" style={{ fontSize: '0.75rem' }}>{r.department}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.designation}</td>
                    <td>{inFormatted}</td>
                    <td>{outFormatted}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      {r.durationMinutes > 0 ? `${hours}h ${mins}m (${r.durationMinutes} mins)` : (r.status === 'IN_PROGRESS' ? 'In Progress' : '—')}
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
