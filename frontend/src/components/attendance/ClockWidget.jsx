import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../services/api';
import ActiveTimer from './ActiveTimer';
import { Clock, Play, Square, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ClockWidget({ onSessionChange }) {
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchTodayStatus = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getToday();
      if (res.status === 'success') {
        setTodayData(res.data);
      }
    } catch (err) {
      console.warn('Today attendance fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleClockIn = async () => {
    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await attendanceApi.clockIn();
      if (res.status === 'success') {
        setMessage('Clock-in session recorded successfully.');
        await fetchTodayStatus();
        onSessionChange && onSessionChange();
      }
    } catch (err) {
      setError(err.message || 'Failed to clock in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await attendanceApi.clockOut();
      if (res.status === 'success') {
        const status = res.record?.status || 'COMPLETED';
        const duration = res.record?.durationMinutes || 0;
        setMessage(`Clock-out recorded. Total: ${duration} mins. Status: ${status}.`);
        await fetchTodayStatus();
        onSessionChange && onSessionChange();
      }
    } catch (err) {
      setError(err.message || 'Failed to clock out');
    } finally {
      setActionLoading(false);
    }
  };

  const hasActive = todayData?.hasActiveSession;
  const activeSession = todayData?.activeSession;

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={24} color="var(--accent-emerald)" /> Attendance Punch & Live Session
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time shift timer, statutory threshold categorization, and single-click biometric punch.
          </p>
        </div>

        <button onClick={fetchTodayStatus} className="btn-outline" title="Refresh Session Status">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Sync Clock</span>
        </button>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#6ee7b7', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fecdd3', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
        {/* Timer Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {hasActive ? 'Active Shift Elapsed Time' : 'No Active Session In Progress'}
          </div>

          <div style={{ margin: '0.5rem 0' }}>
            <ActiveTimer clockInTime={hasActive ? activeSession?.clockInTime : null} />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
            {hasActive ? (
              <span>Clocked in at: {new Date(activeSession?.clockInTime).toLocaleTimeString()}</span>
            ) : (
              <span>Punch in below to begin recording work hours</span>
            )}
          </div>
        </div>

        {/* Action Button & Threshold Rules Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {!hasActive ? (
              <button
                data-testid="btn-clock-in"
                id="btn-clock-in"
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  justifyContent: 'center'
                }}
                disabled={actionLoading}
                onClick={handleClockIn}
              >
                <Play size={20} />
                <span>{actionLoading ? 'Clocking In...' : 'Clock In Now'}</span>
              </button>
            ) : (
              <button
                data-testid="btn-clock-out"
                id="btn-clock-out"
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  justifyContent: 'center'
                }}
                disabled={actionLoading}
                onClick={handleClockOut}
              >
                <Square size={20} />
                <span>{actionLoading ? 'Clocking Out...' : 'Clock Out (End Shift)'}</span>
              </button>
            )}
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>Statutory Shift Rules:</div>
            <div>• <strong style={{ color: 'var(--accent-emerald)' }}>PRESENT:</strong> $\ge$ 480 mins (8.0 hours)</div>
            <div>• <strong style={{ color: 'var(--accent-amber)' }}>HALF_DAY:</strong> $\ge$ 240 mins (4.0 hours)</div>
            <div>• <strong style={{ color: 'var(--accent-rose)' }}>ABSENT:</strong> &lt; 240 mins (&lt; 4.0 hours)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
