import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EventManagement } from './components/admin/EventManagement';
import { MemberManagement } from './components/admin/MemberManagement';
import { PaymentManagement } from './components/admin/PaymentManagement';
import { SettingsManagement } from './components/admin/SettingsManagement';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Redirect root to admin login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<EventManagement />} />
        <Route path="/admin/members" element={<MemberManagement />} />
        <Route path="/admin/payments" element={<PaymentManagement />} />
        <Route path="/admin/settings" element={<SettingsManagement />} />

        {/* Catch all - redirect to admin login */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}
