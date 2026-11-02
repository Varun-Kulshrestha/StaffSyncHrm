import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'HR':
      return <Navigate to="/hr/dashboard" replace />;
    case 'EMPLOYEE':
    default:
      return <Navigate to="/employee/dashboard" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Role-Based Dashboards */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Root redirector based on authentication state */}
      <Route path="/" element={<RootRedirect />} />

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
