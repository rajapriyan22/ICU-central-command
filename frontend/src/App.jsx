import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import UserManagement from './pages/UserManagement';
import Forbidden from './pages/Forbidden';

import IcuBedMatrix from './pages/IcuBedMatrix';
import BedAndWards from './pages/BedAndWards';
import PatientDirectory from './pages/PatientDirectory';
import BedAssignmentPage from './pages/BedAssignmentPage';
import LiveVitalMonitor from './pages/LiveVitalMonitor';
import AlertsAndEvents from './pages/AlertsAndEvents';
import AnalyticsAndReports from './pages/AnalyticsAndReports';
import DoctorsAndStaff from './pages/DoctorsAndStaff';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role ? user.role.toUpperCase() : '';
  if (!allowedRoles.includes(userRole)) {
    return <Forbidden />;
  }
  return children;
}

function DefaultHomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role ? user.role.toUpperCase() : '';
  if (role === 'DOCTOR') return <Navigate to="/doctor" replace />;
  if (role === 'NURSE') return <Navigate to="/nurse" replace />;
  if (role === 'ADMIN') return <Dashboard />;
  return <Forbidden />;
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Dynamic Role Landing */}
              <Route index element={<DefaultHomeRedirect />} />
              <Route path="admin" element={<RoleGuard allowedRoles={['ADMIN']}><Dashboard /></RoleGuard>} />
              <Route path="doctor" element={<RoleGuard allowedRoles={['DOCTOR', 'ADMIN']}><DoctorDashboard /></RoleGuard>} />
              <Route path="nurse" element={<RoleGuard allowedRoles={['NURSE', 'ADMIN']}><NurseDashboard /></RoleGuard>} />

              {/* Role-Specific & Shared Routes */}
              <Route path="bed-matrix" element={<IcuBedMatrix />} />
              <Route path="patients" element={<PatientDirectory />} />
              <Route path="bed-assignment" element={<BedAssignmentPage />} />
              <Route path="vitals" element={<LiveVitalMonitor />} />
              <Route path="alerts" element={<AlertsAndEvents />} />

              {/* Admin-Only Restricted Pages */}
              <Route path="wards" element={<RoleGuard allowedRoles={['ADMIN']}><BedAndWards /></RoleGuard>} />
              <Route path="analytics" element={<RoleGuard allowedRoles={['ADMIN']}><AnalyticsAndReports /></RoleGuard>} />
              <Route path="doctors" element={<RoleGuard allowedRoles={['ADMIN']}><DoctorsAndStaff /></RoleGuard>} />
              <Route path="users" element={<RoleGuard allowedRoles={['ADMIN']}><UserManagement /></RoleGuard>} />
              <Route path="settings" element={<Settings />} />

              <Route path="forbidden" element={<Forbidden />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  );
}
