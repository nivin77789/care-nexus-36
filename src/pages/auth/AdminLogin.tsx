import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Loader2, Lock, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ADMIN_USER = { username: 'admin', password: 'admin123', role: 'admin' };

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setRole } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check hardcoded admin
      if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        const mockUser = { uid: ADMIN_USER.username, email: `${ADMIN_USER.username}@care.com` };
        setUser(mockUser);
        setRole('admin');
        localStorage.setItem('auth-user', JSON.stringify({ user: mockUser, role: 'admin' }));
        toast.success('Welcome back, Admin!');
        navigate('/admin/dashboard');
        return;
      }

      // Check database for dynamically created admins
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const adminDoc = querySnapshot.docs[0];
        const adminData = adminDoc.data();

        if (adminData.password === password) {
          const mockUser = { uid: adminDoc.id, email: `${username}@care.com` };
          setUser(mockUser);
          setRole('admin');
          localStorage.setItem('auth-user', JSON.stringify({ user: mockUser, role: 'admin' }));
          toast.success('Welcome back, Admin!');
          navigate('/admin/dashboard');
          return;
        }
      }

      toast.error('Invalid admin credentials');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Failed to login');
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
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your admin account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
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
                'Sign In as Admin'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
