import React, { useState, useEffect } from 'react';
import { leaveApi } from '../../services/api';
import { Calendar, Plus, HeartPulse, Coffee, Palmtree, RefreshCw } from 'lucide-react';
import ApplyLeaveModal from './ApplyLeaveModal';
import LeaveHistoryTable from './LeaveHistoryTable';

export default function LeaveBalanceCards() {
  const [balances, setBalances] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const [balRes, histRes] = await Promise.all([
        leaveApi.getBalances(),
        leaveApi.getMyHistory()
      ]);
      if (balRes.status === 'success') {
        setBalances(balRes.data);
      }
      if (histRes.status === 'success') {
        setHistory(histRes.data);
      }
    } catch (err) {
      console.warn('Leave data fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const getBalance = (type) => {
    const bal = balances.find((b) => b.leave_type === type);
    return bal || { allocated_days: 0, consumed_days: 0, locked_days: 0, available_days: 0 };
  };

  const sick = getBalance('SICK');
  const casual = getBalance('CASUAL');
  const privilege = getBalance('PRIVILEGE');

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
      {/* Header and Apply Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
            Statutory Leave Quotas & Balances
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Annual employee allocations, locked days under review, and personal absence records.
          </p>
        </div>

        <button
          data-testid="btn-apply-leave"
          id="btn-apply-leave"
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          <span>Apply Leave</span>
        </button>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid-3">
        {/* Sick Leave Card: card-balance-sick */}
        <div
          data-testid="card-balance-sick"
          id="card-balance-sick"
          className="glass-card stat-card"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div>
            <div className="stat-label">Sick Leave (SL)</div>
            <div className="stat-val" style={{ color: 'var(--accent-rose)' }}>
              {sick.available_days ?? 12} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>Available</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
              Allocated: {sick.allocated_days}d | Consumed: {sick.consumed_days}d | Locked: {sick.locked_days}d
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <HeartPulse size={24} />
          </div>
        </div>

        {/* Casual Leave Card: card-balance-casual */}
        <div
          data-testid="card-balance-casual"
          id="card-balance-casual"
          className="glass-card stat-card"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div>
            <div className="stat-label">Casual Leave (CL)</div>
            <div className="stat-val" style={{ color: 'var(--accent-amber)' }}>
              {casual.available_days ?? 12} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>Available</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
              Allocated: {casual.allocated_days}d | Consumed: {casual.consumed_days}d | Locked: {casual.locked_days}d
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Coffee size={24} />
          </div>
        </div>

        {/* Privilege Leave Card: card-balance-privilege */}
        <div
          data-testid="card-balance-privilege"
          id="card-balance-privilege"
          className="glass-card stat-card"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div>
            <div className="stat-label">Privilege Leave (PL)</div>
            <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>
              {privilege.available_days ?? 15} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>Available</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
              Allocated: {privilege.allocated_days}d | Consumed: {privilege.consumed_days}d | Locked: {privilege.locked_days}d
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Palmtree size={24} />
          </div>
        </div>
      </div>

      {/* Leave Application History Table */}
      <LeaveHistoryTable history={history} loading={loading} />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchLeaveData()}
      />
    </div>
  );
}
