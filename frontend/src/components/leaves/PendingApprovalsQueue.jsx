import React, { useState, useEffect } from 'react';
import { leaveApi } from '../../services/api';
import { CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function PendingApprovalsQueue() {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leaveApi.getPendingQueue();
      if (res.status === 'success') {
        setPendingLeaves(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending leave queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  const handleDecision = async (id, status) => {
    setActionLoading(id);
    setMessage(null);
    setError(null);
    try {
      const res = await leaveApi.updateStatus(id, {
        status,
        comment: `Processed by supervisor as ${status}.`
      });
      if (res.status === 'success') {
        setMessage(`Leave request ${id} successfully marked as ${status}.`);
        fetchPendingQueue();
      }
    } catch (err) {
      setError(err.message || `Failed to update leave status to ${status}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
            Pending Leave Authorization Queue
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Organization-wide time off requests pending managerial decision and balance adjustment.
          </p>
        </div>

        <button onClick={fetchPendingQueue} className="btn-outline" title="Refresh Authorization Queue">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#6ee7b7', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fecdd3', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="table-container">
        <table data-testid="table-leave-queue" id="table-leave-queue" className="custom-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Leave Type</th>
              <th>Period</th>
              <th>Total Days</th>
              <th>Reason</th>
              <th style={{ textAlign: 'center' }}>Manager Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} className="spin" />
                    <span>Loading pending authorization requests...</span>
                  </div>
                </td>
              </tr>
            ) : pendingLeaves.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No pending leave requests in authorization queue.
                </td>
              </tr>
            ) : (
              pendingLeaves.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>
                    {req.first_name} {req.last_name}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{req.email}</div>
                  </td>
                  <td>
                    <span className="role-tag hr" style={{ fontSize: '0.75rem' }}>
                      {req.department}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#c4b5fd' }}>{req.leave_type}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {req.start_date} <span style={{ color: 'var(--text-muted)' }}>to</span> {req.end_date}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {req.days_count} {req.days_count === 1 ? 'day' : 'days'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {req.reason}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        data-testid={`btn-approve-leave-${req.id}`}
                        id={`btn-approve-leave-${req.id}`}
                        className="btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
                        disabled={actionLoading === req.id}
                        onClick={() => handleDecision(req.id, 'APPROVED')}
                      >
                        <CheckCircle size={14} />
                        <span>Approve</span>
                      </button>
                      <button
                        data-testid={`btn-reject-leave-${req.id}`}
                        id={`btn-reject-leave-${req.id}`}
                        className="btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
                        disabled={actionLoading === req.id}
                        onClick={() => handleDecision(req.id, 'REJECTED')}
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
