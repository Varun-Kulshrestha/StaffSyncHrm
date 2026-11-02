import React, { useState } from 'react';
import { leaveApi } from '../../services/api';
import { Calendar, AlertCircle, X, CheckCircle } from 'lucide-react';

export default function ApplyLeaveModal({ isOpen, onClose, onSuccess }) {
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await leaveApi.apply({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason
      });

      if (res.status === 'success') {
        onSuccess && onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div data-testid="modal-apply-leave" id="modal-apply-leave" className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--primary)" /> Apply For Leave
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fecdd3', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Statutory Leave Policy Category *</label>
            <select
              data-testid="select-leave-type"
              id="select-leave-type"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="SICK">Sick Leave (Medical & Health Emergency)</option>
              <option value="CASUAL">Casual Leave (Urgent Personal Obligations)</option>
              <option value="PRIVILEGE">Privilege Leave (Vacation & Extended Time Off)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Commencement Date *</label>
              <input
                type="date"
                required
                data-testid="input-leave-start"
                id="input-leave-start"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Conclusion Date *</label>
              <input
                type="date"
                required
                data-testid="input-leave-end"
                id="input-leave-end"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Purpose for Absence *</label>
            <textarea
              required
              rows={3}
              className="form-input"
              style={{ padding: '0.75rem 1rem', resize: 'vertical' }}
              placeholder="Provide context for manager review..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              data-testid="btn-submit-leave"
              id="btn-submit-leave"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
