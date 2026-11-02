import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function LeaveHistoryTable({ history, loading }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
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
            <CheckCircle size={13} /> Approved
          </span>
        );
      case 'REJECTED':
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
            <XCircle size={13} /> Rejected
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
            color: 'var(--accent-amber)',
            background: 'rgba(245, 158, 11, 0.12)',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px'
          }}>
            <Clock size={13} /> Pending
          </span>
        );
    }
  };

  return (
    <div style={{ marginTop: '1.75rem' }}>
      <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar size={18} color="var(--primary)" /> Personal Leave Applications History
      </h3>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Policy Category</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total Days</th>
              <th>Absence Reason</th>
              <th>Status</th>
              <th>Review Comment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  Loading leave history...
                </td>
              </tr>
            ) : !history || history.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  No past leave applications recorded.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="role-tag hr" style={{ fontSize: '0.75rem' }}>
                      {item.leave_type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.start_date}</td>
                  <td style={{ fontWeight: 600 }}>{item.end_date}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{item.days_count} {item.days_count === 1 ? 'day' : 'days'}</td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.reason}
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                    {item.review_comment || '—'}
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
