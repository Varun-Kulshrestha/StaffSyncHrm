import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../services/api';
import { User, Mail, Briefcase, Phone, Calendar, CheckCircle, RefreshCw } from 'lucide-react';

export default function ReadOnlyProfileCard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await employeeApi.getById('me');
        if (res.status === 'success') {
          setProfile(res.data);
        }
      } catch (err) {
        console.warn('Profile fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
        <p>Loading personal personnel profile...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="var(--accent-emerald)" /> Verified Personnel Profile
        </h3>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--accent-emerald)',
          background: 'rgba(16, 185, 129, 0.15)',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px'
        }}>
          <CheckCircle size={14} /> Official Record
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Full Legal Name</span>
          <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>{profile.first_name} {profile.last_name}</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Employee ID</span>
          <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{profile.id}</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Department</span>
          <span className="role-tag hr" style={{ marginTop: '0.25rem', display: 'inline-block' }}>{profile.department}</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Designation</span>
          <span style={{ fontWeight: 600 }}>{profile.designation}</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Corporate Email</span>
          <span style={{ fontWeight: 600 }}>{profile.email}</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Phone Contact</span>
          <span style={{ fontWeight: 600 }}>{profile.phone}</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Date of Joining</span>
          <span style={{ fontWeight: 600 }}>{profile.date_of_joining}</span>
        </div>
      </div>
    </div>
  );
}
