import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import OTPVerification from './pages/Auth/OTPVerification';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

import {
  AdminDashboard, AdminSites, AdminSiteDetail, AdminMaterials, 
  AdminWorkers, AdminSupervisors, AdminContactDetails, AdminChangePassword,
  AdminMessages, AdminBilling, AdminDocumentCenter
} from './pages/Admin/AdminPages';
import { AdminAttendance } from './pages/Admin/AdminAttendance';

import {
  SupervisorDashboard, SupervisorSiteOverview, SupervisorWorkers,
  SupervisorMaterials, SupervisorBilling, SupervisorProgress, 
  SupervisorContactAdmin, SupervisorSettings, SupervisorAttendance
} from './pages/Supervisor/SupervisorPages';

import {
  WorkerDashboard, WorkerTasks, WorkerAttendance, WorkerSettings, WorkerMessages
} from './pages/Worker/WorkerPages';

import './index.css';
import Layout from './components/Layout';

const PrivateRoute = ({ children, role }) => {
  const { currentUser, isAuthenticated } = useStore();
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (role && currentUser.role !== role) {
    return <Navigate to="/" replace />; // Or unauthorized
  }
  return <Layout>{children}</Layout>;
};

const RootRedirect = () => {
  const { currentUser, isAuthenticated } = useStore();
  if (!isAuthenticated || !currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'Admin') return <Navigate to="/admin" replace />;
  if (currentUser.role === 'Supervisor') return <Navigate to="/supervisor" replace />;
  if (currentUser.role === 'Worker') return <Navigate to="/worker" replace />;
  return <Navigate to="/login" replace />;
};

import { useEffect } from 'react';

function App() {
  const initializeData = useStore(state => state.initializeData);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute role="Admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/sites" element={<PrivateRoute role="Admin"><AdminSites /></PrivateRoute>} />
        <Route path="/admin/sites/:id" element={<PrivateRoute role="Admin"><AdminSiteDetail /></PrivateRoute>} />
        <Route path="/admin/materials" element={<PrivateRoute role="Admin"><AdminMaterials /></PrivateRoute>} />
        <Route path="/admin/workers" element={<PrivateRoute role="Admin"><AdminWorkers /></PrivateRoute>} />
        <Route path="/admin/supervisors" element={<PrivateRoute role="Admin"><AdminSupervisors /></PrivateRoute>} />
        <Route path="/admin/contact-details" element={<PrivateRoute role="Admin"><AdminContactDetails /></PrivateRoute>} />
        <Route path="/admin/change-password" element={<PrivateRoute role="Admin"><AdminChangePassword /></PrivateRoute>} />
        <Route path="/admin/reports" element={<PrivateRoute role="Admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/billing" element={<PrivateRoute role="Admin"><AdminBilling /></PrivateRoute>} />
        <Route path="/admin/messages" element={<PrivateRoute role="Admin"><AdminMessages /></PrivateRoute>} />
        <Route path="/admin/attendance" element={<PrivateRoute role="Admin"><AdminAttendance /></PrivateRoute>} />
        <Route path="/admin/document-center" element={<PrivateRoute role="Admin"><AdminDocumentCenter /></PrivateRoute>} />
        
        {/* Supervisor Routes */}
        <Route path="/supervisor" element={<PrivateRoute role="Supervisor"><SupervisorDashboard /></PrivateRoute>} />
        <Route path="/supervisor/site-overview" element={<PrivateRoute role="Supervisor"><SupervisorSiteOverview /></PrivateRoute>} />
        <Route path="/supervisor/workers" element={<PrivateRoute role="Supervisor"><SupervisorWorkers /></PrivateRoute>} />
        <Route path="/supervisor/materials" element={<PrivateRoute role="Supervisor"><SupervisorMaterials /></PrivateRoute>} />
        <Route path="/supervisor/billing" element={<PrivateRoute role="Supervisor"><SupervisorBilling /></PrivateRoute>} />
        <Route path="/supervisor/progress" element={<PrivateRoute role="Supervisor"><SupervisorProgress /></PrivateRoute>} />
        <Route path="/supervisor/contact-admin" element={<PrivateRoute role="Supervisor"><SupervisorContactAdmin /></PrivateRoute>} />
        <Route path="/supervisor/attendance" element={<PrivateRoute role="Supervisor"><SupervisorAttendance /></PrivateRoute>} />
        <Route path="/supervisor/change-password" element={<PrivateRoute role="Supervisor"><SupervisorSettings /></PrivateRoute>} />
        
        {/* Worker Routes */}
        <Route path="/worker" element={<PrivateRoute role="Worker"><WorkerDashboard /></PrivateRoute>} />
        <Route path="/worker/tasks" element={<PrivateRoute role="Worker"><WorkerTasks /></PrivateRoute>} />
        <Route path="/worker/attendance" element={<PrivateRoute role="Worker"><WorkerAttendance /></PrivateRoute>} />
        <Route path="/worker/change-password" element={<PrivateRoute role="Worker"><WorkerSettings /></PrivateRoute>} />
        <Route path="/worker/messages" element={<PrivateRoute role="Worker"><WorkerMessages /></PrivateRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
