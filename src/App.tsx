import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import EditProfilePage from './pages/EditProfilePage';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import StaffManagement from './pages/admin/StaffManagement';
import EventCreation from './pages/admin/EventCreation';
import EventCalendar from './pages/EventCalendar';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="edit-profile" element={<EditProfilePage />} />
            <Route path="calendar" element={<EventCalendar isAdmin={false} />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
            <Route path="staff" element={<StaffManagement />} />
            <Route path="events" element={<EventCreation />} />
            <Route path="calendar" element={<EventCalendar isAdmin={true} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
