import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { SuperAdminSidebar } from '@/components/layout/SuperAdminSidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Auth
import AdminLogin from '@/pages/auth/AdminLogin';
import SuperAdminLogin from '@/pages/auth/SuperAdminLogin';
import CarerLogin from '@/pages/auth/CarerLogin';
import ClientLogin from '@/pages/auth/ClientLogin';
import ClientSignup from '@/pages/auth/ClientSignup';

// Caretaker pages
import Index from '@/pages/Index';
import MyDay from '@/pages/caretaker/MyDay';
import Visits from '@/pages/caretaker/Visits';
import CaretakerMessages from '@/pages/caretaker/Messages';
import CaretakerFeedback from '@/pages/caretaker/Feedback';
import Profile from '@/pages/caretaker/Profile';

// Admin pages
import Dashboard from '@/pages/admin/Dashboard';
import Clients from '@/pages/admin/Clients';
import Scheduling from '@/pages/admin/Scheduling';
import ClientTracking from '@/pages/admin/ClientTracking';
import Carers from '@/pages/admin/Carers';
import AdminMessages from '@/pages/admin/Messages';
import AdminFeedback from '@/pages/admin/Feedback';
import ManageClients from '@/pages/admin/ManageClients';

// Super Admin pages
import SuperAdminDashboard from '@/pages/superadmin/Dashboard';
import ManageAdmins from '@/pages/superadmin/ManageAdmins';
import SuperAdminManageClients from '@/pages/superadmin/ManageClients';
import SuperAdminCarers from '@/pages/superadmin/Carers';
import SuperAdminClients from '@/pages/superadmin/Clients';
import SuperAdminScheduling from '@/pages/superadmin/Scheduling';
import SuperAdminClientTracking from '@/pages/superadmin/ClientTracking';
import SuperAdminMessages from '@/pages/superadmin/Messages';
import SuperAdminFeedback from '@/pages/superadmin/Feedback';

// Client pages
import ClientDashboard from '@/pages/client/Dashboard';

const App = () => {
  const { setUser, setRole, setLoading } = useAuthStore();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    const savedTheme = localStorage.getItem('theme-storage');
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      setTheme(parsed.state.theme);
    }
  }, [setTheme]);

  useEffect(() => {
    // Check sessionStorage for saved auth
    const savedAuth = sessionStorage.getItem('auth-user');
    if (savedAuth) {
      const { user, role } = JSON.parse(savedAuth);
      setUser(user);
      setRole(role);
    }
    setLoading(false);
  }, [setUser, setRole, setLoading]);

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/carer/login" element={<CarerLogin />} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/signup" element={<ClientSignup />} />

        {/* Super Admin Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SidebarProvider defaultOpen={true}>
                <div className="flex min-h-screen w-full flex-col">
                  <Navbar />
                  <div className="flex flex-1 w-full">
                    <SuperAdminSidebar />
                    <main className="flex-1 overflow-y-auto bg-background">
                      <Outlet />
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/manage-admins" element={<ManageAdmins />} />
          <Route path="/superadmin/manage-clients" element={<SuperAdminManageClients />} />
          <Route path="/superadmin/carers" element={<SuperAdminCarers />} />
          <Route path="/superadmin/clients" element={<SuperAdminClients />} />
          <Route path="/superadmin/scheduling" element={<SuperAdminScheduling />} />
          <Route path="/superadmin/client-tracking" element={<SuperAdminClientTracking />} />
          <Route path="/superadmin/messages" element={<SuperAdminMessages />} />
          <Route path="/superadmin/feedback" element={<SuperAdminFeedback />} />
        </Route>

        {/* Admin/Manager Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <SidebarProvider defaultOpen={true}>
                <div className="flex min-h-screen w-full flex-col">
                  <Navbar />
                  <div className="flex flex-1 w-full">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto bg-background">
                      <Outlet />
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/clients" element={<Clients />} />
          <Route path="/admin/manage-clients" element={<ManageClients />} />
          <Route path="/admin/scheduling" element={<Scheduling />} />
          <Route path="/admin/client-tracking" element={<ClientTracking />} />
          <Route path="/admin/actions" element={<div className="p-6">My Actions - Coming Soon</div>} />
          <Route path="/admin/carers" element={<Carers />} />
          <Route path="/admin/training" element={<div className="p-6">Training - Coming Soon</div>} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="/admin/reports" element={<div className="p-6">Reports - Coming Soon</div>} />
          <Route path="/admin/finance" element={<div className="p-6">Finance - Coming Soon</div>} />
          <Route path="/admin/policies" element={<div className="p-6">Policies - Coming Soon</div>} />
          <Route path="/admin/settings" element={<div className="p-6">Settings - Coming Soon</div>} />
        </Route>

        {/* Client Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/client/dashboard" element={<ClientDashboard />} />
        </Route>

        {/* Caretaker Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['caretaker']}>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 overflow-y-auto bg-background">
                  <Outlet />
                </main>
                <BottomNav />
              </div>
            </ProtectedRoute>
          }
        >
          <Route path="/caretaker/my-day" element={<MyDay />} />
          <Route path="/caretaker/visits" element={<Visits />} />
          <Route path="/caretaker/messages" element={<CaretakerMessages />} />
          <Route path="/caretaker/feedback" element={<CaretakerFeedback />} />
          <Route path="/caretaker/profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
