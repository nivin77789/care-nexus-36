import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const SUPER_ADMIN_USER = {
  username: 'superadmin',
  password: 'superadmin',
  role: 'superadmin' as const,
};

export default function SuperAdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setRole } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (username === SUPER_ADMIN_USER.username && password === SUPER_ADMIN_USER.password) {
        const user = { username: SUPER_ADMIN_USER.username, role: SUPER_ADMIN_USER.role };
        setUser(user);
        setRole(SUPER_ADMIN_USER.role);
        localStorage.setItem('auth-user', JSON.stringify(user));
        toast.success('Welcome, Super Admin!');
        navigate('/superadmin/dashboard');
      } else {
        toast.error('Invalid super admin credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg shadow-lg p-8">
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="text-xs shadow-glow"
            >
              Super Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/login')}
              className="text-xs"
            >
              Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/carer/login')}
              className="text-xs"
            >
              Carer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/client/login')}
              className="text-xs"
            >
              Client
            </Button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Super Admin Login</h1>
            <p className="text-muted-foreground text-sm mt-2">Access master control panel</p>

            <div className="mt-4 rounded-lg bg-primary/5 p-3 border border-primary/10 w-full text-center">
              <p className="text-xs font-semibold text-primary">Demo Credentials</p>
              <p className="text-xs text-muted-foreground">Username: superadmin • Password: superadmin</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter super admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter super admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In as Super Admin
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
