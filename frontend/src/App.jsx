import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { ReviewerDashboard } from './pages/ReviewerDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CustomerProfile } from './pages/CustomerProfile';
import { LoanApplicationForm } from './pages/LoanApplicationForm';
import { ApplicationDetailsPage } from './pages/ApplicationDetailsPage';
import { ApplicationsQueuePage } from './pages/ApplicationsQueuePage';
import { CustomersPage } from './pages/CustomersPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { RulesManagementPage } from './pages/RulesManagementPage';
import { ReportsPage } from './pages/ReportsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UnauthorizedPage, NotFoundPage } from './pages/UnauthorizedPage';

export const App = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar/navbar on landing, login, and register pages
  const isAuthPage = ['/', '/login', '/register', '/unauthorized'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex-1 flex w-full">
        {/* Render Sidebar only when authenticated and not on landing/login page */}
        {isAuthenticated && !isAuthPage && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className={`flex-1 ${!isAuthPage ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : 'w-full'}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<CustomerProfile />} />
              <Route path="/apply" element={<LoanApplicationForm />} />
              <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
              <Route path="/my-applications" element={<ApplicationsQueuePage />} />
              <Route path="/applications" element={<ApplicationsQueuePage />} />

              {/* Customer Portal */}
              <Route element={<RoleProtectedRoute allowedRoles={['CUSTOMER', 'ADMINISTRATOR']} />}>
                <Route path="/dashboard/customer" element={<CustomerDashboard />} />
              </Route>

              {/* Staff Portal */}
              <Route element={<RoleProtectedRoute allowedRoles={['STAFF', 'ADMINISTRATOR']} />}>
                <Route path="/dashboard/staff" element={<StaffDashboard />} />
                <Route path="/documents" element={<DocumentsPage />} />
              </Route>

              {/* Reviewer Portal */}
              <Route element={<RoleProtectedRoute allowedRoles={['REVIEWER', 'ADMINISTRATOR']} />}>
                <Route path="/dashboard/reviewer" element={<ReviewerDashboard />} />
              </Route>

              {/* Admin Portal */}
              <Route element={<RoleProtectedRoute allowedRoles={['ADMINISTRATOR']} />}>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/rules" element={<RulesManagementPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
