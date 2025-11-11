import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';

// Auth
import AdminLogin from '@/pages/auth/AdminLogin';
import CarerLogin from '@/pages/auth/CarerLogin';

// Caretaker pages
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

const App = () => {
  const { user, role, setUser, setRole, setLoading } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    const savedTheme = localStorage.getItem('theme-storage');
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      setTheme(parsed.state.theme);
    }
  }, [setTheme]);

  useEffect(() => {
    // Check localStorage for saved auth
    const savedAuth = localStorage.getItem('auth-user');
    if (savedAuth) {
      const { user, role } = JSON.parse(savedAuth);
      setUser(user);
      setRole(role);
    }
    setLoading(false);
  }, [setUser, setRole, setLoading]);

  if (!user) {
    return (
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/carer/login" element={<CarerLogin />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Admin/Manager Layout
  if (role === 'admin' || role === 'manager') {
    return (
      <BrowserRouter>
        <Toaster position="top-center" />
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full flex-col">
            <Navbar />
            <div className="flex flex-1 w-full">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-background">
                <Routes>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/clients" element={<Clients />} />
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
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    );
  }

  // Caretaker Layout
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Routes>
            <Route path="/caretaker/my-day" element={<MyDay />} />
            <Route path="/caretaker/visits" element={<Visits />} />
            <Route path="/caretaker/messages" element={<CaretakerMessages />} />
            <Route path="/caretaker/feedback" element={<CaretakerFeedback />} />
            <Route path="/caretaker/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/caretaker/my-day" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
};

export default App;
