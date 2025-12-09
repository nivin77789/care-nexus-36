import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Loader2, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

// Temporary credentials
const DEMO_USERS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' },
  caretaker: { username: 'carer', password: 'carer123', role: 'caretaker' },
} as const;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setRole } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check credentials
      const user = Object.values(DEMO_USERS).find(
        u => u.username === username && u.password === password
      );

      if (!user) {
        toast.error('Invalid username or password');
        return;
      }

      // Set mock user object
      const mockUser = { uid: user.username, email: `${user.username}@care.com` } as any;

      setUser(mockUser);
      setRole(user.role);
      localStorage.setItem('auth-user', JSON.stringify({ user: mockUser, role: user.role }));

      toast.success('Welcome back!');

      // Navigate based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/caretaker/my-day');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl bg-card p-8 shadow-strong">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <span className="text-2xl font-bold text-primary-foreground">C</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your CareConnect account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
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
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary shadow-glow hover:shadow-strong"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo Accounts:</p>
            <p className="mt-1">Admin: admin / admin123</p>
            <p>Caretaker: carer / carer123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
