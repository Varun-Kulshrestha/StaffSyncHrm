import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../services/api';
import { Calendar, Clock, CheckCircle, AlertTriangle, XCircle, Filter, RefreshCw } from 'lucide-react';

export default function TimesheetCalendar({ refreshTrigger }) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getHistory(selectedMonth, selectedYear);
      if (res.status === 'success') {
        setHistoryData(res.data);
      }
    } catch (err) {
      console.warn('History fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedMonth, selectedYear, refreshTrigger]);

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

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
      {/* Header and Month Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
            Monthly Timesheet & Working Hours
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Detailed breakdown of shift punches, accumulated hours, and statutory compliance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--text-subtle)" />
          <select
            data-testid="select-month-filter"
            id="select-month-filter"
            className="form-input"
            style={{ padding: '0.65rem 1rem', minWidth: '150px' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} {selectedYear}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards: card-monthly-present, card-monthly-absent, card-total-hours */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div data-testid="card-monthly-present" id="card-monthly-present" className="glass-card stat-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div className="stat-label">Days Present (Full Shift)</div>
            <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>
              {historyData?.daysPresent ?? 0} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>days</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
              Plus {historyData?.daysHalfDay ?? 0} half-day shifts
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div data-testid="card-monthly-absent" id="card-monthly-absent" className="glass-card stat-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div className="stat-label">Days Absent (&lt; 4 Hours)</div>
            <div className="stat-val" style={{ color: 'var(--accent-rose)' }}>
              {historyData?.daysAbsent ?? 0} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>days</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
              Requires explanation / regularization
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <XCircle size={24} />
          </div>
        </div>

        <div data-testid="card-total-hours" id="card-total-hours" className="glass-card stat-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div className="stat-label">Total Logged Time</div>
            <div className="stat-val" style={{ color: 'var(--accent-cyan)' }}>
              {historyData?.totalHoursLogged ?? 0} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>hrs</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
              Statutory target: 160 hrs / month
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Timesheet Historical Table: table-timesheet-history */}
      <div className="table-container">
        <table data-testid="table-timesheet-history" id="table-timesheet-history" className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In Timestamp</th>
              <th>Clock Out Timestamp</th>
              <th>Total Duration</th>
              <th>Compliance Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} className="spin" />
                    <span>Loading monthly timesheet logs...</span>
                  </div>
                </td>
              </tr>
            ) : !historyData?.records || historyData.records.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No attendance records logged for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
                </td>
              </tr>
            ) : (
              historyData.records.map((r) => {
                const inFormatted = r.clock_in_time ? new Date(r.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
                const outFormatted = r.clock_out_time ? new Date(r.clock_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (r.status === 'IN_PROGRESS' ? 'Currently Active' : '—');
                const hours = Math.floor(r.duration_minutes / 60);
                const mins = r.duration_minutes % 60;

                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.date}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{inFormatted}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{outFormatted}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      {r.duration_minutes > 0 ? `${hours}h ${mins}m (${r.duration_minutes} mins)` : 'In Progress'}
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
