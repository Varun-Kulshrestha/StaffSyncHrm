import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  UserPlus,
  Edit2,
  UserX,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';

export default function EmployeeDirectory() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  // Add Form state
  const [addForm, setAddForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: 'Engineering',
    designation: '',
    phone: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    password: 'Emp@123'
  });

  const fetchEmployees = async (pageToFetch = meta.page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.list({
        search,
        department: department === 'ALL' ? '' : department,
        page: pageToFetch,
        limit: 5,
        include_inactive: includeInactive
      });
      if (res.status === 'success') {
        setEmployees(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
  }, [search, department, includeInactive]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchEmployees(newPage);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await employeeApi.create(addForm);
      if (res.status === 'success') {
        const pwd = res.data?.default_password || addForm.password || 'Emp@123';
        setMessage(`Employee ${res.data.first_name} ${res.data.last_name} onboarded! Login: ${res.data.email} | Password: ${pwd}`);
        setIsAddOpen(false);
        setAddForm({
          first_name: '',
          last_name: '',
          email: '',
          department: 'Engineering',
          designation: '',
          phone: '',
          date_of_joining: new Date().toISOString().split('T')[0],
          password: 'Emp@123'
        });
        fetchEmployees(1);
      }
    } catch (err) {
      setError(err.message || 'Error onboarding employee');
    }
  };

  const openEdit = (emp) => {
    setEditEmployee({ ...emp });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await employeeApi.update(editEmployee.id, {
        department: editEmployee.department,
        designation: editEmployee.designation,
        phone: editEmployee.phone
      });
      if (res.status === 'success') {
        setMessage('Employee profile updated successfully.');
        setIsEditOpen(false);
        setEditEmployee(null);
        fetchEmployees(meta.page);
      }
    } catch (err) {
      setError(err.message || 'Error updating employee');
    }
  };

  const handleDeactivate = async (id, name) => {
    if (window.confirm(`Are you sure you want to offboard/deactivate ${name}?`)) {
      try {
        const res = await employeeApi.deactivate(id);
        if (res.status === 'success') {
          setMessage(`Employee ${name} (${id}) has been deactivated.`);
          fetchEmployees(meta.page);
        }
      } catch (err) {
        setError(err.message || 'Error deactivating employee');
      }
    }
  };

  const canMutate = user && (user.role === 'ADMIN' || user.role === 'HR');

  return (
    <div data-testid="container-employee-directory" className="glass-card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
            Workforce Directory & Lifecycle
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Central personnel registry, search filtration, and role assignments.
          </p>
        </div>

        {canMutate && (
          <button
            data-testid="btn-add-employee"
            id="btn-add-employee"
            className="btn-primary"
            onClick={() => setIsAddOpen(true)}
          >
            <UserPlus size={18} />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#6ee7b7', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fecdd3', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#fecdd3', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {/* Search Bar */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            data-testid="input-search-employee"
            id="input-search-employee"
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search by name or corporate email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Department Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--text-subtle)" />
          <select
            data-testid="select-department-filter"
            id="select-department-filter"
            className="form-input"
            style={{ padding: '0.85rem 1rem', minWidth: '180px' }}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        {/* Include Inactive Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          <span>Include Inactive</span>
        </label>
      </div>

      {/* Employees Table */}
      <div className="table-container">
        <table data-testid="table-employees" id="table-employees" className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Corporate Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Phone</th>
              <th>Status</th>
              {canMutate && <th style={{ textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={canMutate ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} className="spin" />
                    <span>Loading directory records...</span>
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={canMutate ? 8 : 7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No employees found matching the search or department criteria.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} data-testid={`row-employee-${emp.id}`} id={`row-employee-${emp.id}`}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-cyan)' }}>{emp.id}</td>
                  <td style={{ fontWeight: 600 }}>{emp.first_name} {emp.last_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                  <td>
                    <span className="role-tag hr" style={{ fontSize: '0.75rem' }}>{emp.department}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{emp.designation}</td>
                  <td style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>{emp.phone}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: emp.is_active ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      background: emp.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px'
                    }}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canMutate && (
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          data-testid={`btn-edit-${emp.id}`}
                          id={`btn-edit-${emp.id}`}
                          className="btn-outline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          title="Edit Profile"
                          onClick={() => openEdit(emp)}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        {emp.is_active && (
                          <button
                            data-testid={`btn-deactivate-${emp.id}`}
                            id={`btn-deactivate-${emp.id}`}
                            className="btn-outline"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fb7185' }}
                            title="Deactivate Employee"
                            onClick={() => handleDeactivate(emp.id, `${emp.first_name} ${emp.last_name}`)}
                          >
                            <UserX size={13} />
                            <span>Offboard</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Showing Page <strong data-testid="label-pagination-page" style={{ color: '#fff' }}>{meta.page}</strong> of <strong style={{ color: '#fff' }}>{meta.totalPages}</strong> (Total Records: {meta.total})
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            data-testid="btn-pagination-prev"
            id="btn-pagination-prev"
            className="btn-outline"
            disabled={meta.page <= 1}
            onClick={() => handlePageChange(meta.page - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            data-testid="btn-pagination-next"
            id="btn-pagination-next"
            className="btn-outline"
            disabled={meta.page >= meta.totalPages}
            onClick={() => handlePageChange(meta.page + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal: Add Employee */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} color="var(--primary)" /> Onboard New Employee
              </h3>
              <button onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={addForm.first_name}
                    onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={addForm.last_name}
                    onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Designation *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={addForm.designation}
                    onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Joining *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={addForm.date_of_joining}
                    onChange={(e) => setAddForm({ ...addForm, date_of_joining: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Account Login Password (Optional, Default: Emp@123)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Default: Emp@123"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="btn-save-employee"
                  id="btn-save-employee"
                  className="btn-primary"
                >
                  Save & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Employee */}
      {isEditOpen && editEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={20} color="var(--accent-cyan)" /> Update Profile: {editEmployee.first_name} {editEmployee.last_name}
              </h3>
              <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Corporate Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  className="form-input"
                  style={{ paddingLeft: '1rem', opacity: 0.6 }}
                  value={editEmployee.email}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={editEmployee.department}
                  onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={editEmployee.designation}
                  onChange={(e) => setEditEmployee({ ...editEmployee, designation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Contact *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={editEmployee.phone}
                  onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="btn-update-employee"
                  id="btn-update-employee"
                  className="btn-primary"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
