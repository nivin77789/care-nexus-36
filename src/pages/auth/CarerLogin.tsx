import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Loader2, Lock, User, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

export default function CarerLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setRole } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Hardcoded demo check removed to ensure real Firestore UID is used
      // if (username === 'nivin77789' && password === 'Nivin77789@') { ... }

      const carersRef = collection(db, 'carers');
      const q = query(carersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const carerDoc = querySnapshot.docs[0];
        const carerData = carerDoc.data();

        if (carerData.password === password) {
          const mockUser = {
            uid: carerDoc.id,
            email: carerData.email,
            name: carerData.name
          };
          setUser(mockUser);
          setRole('caretaker');
          sessionStorage.setItem('auth-user', JSON.stringify({ user: mockUser, role: 'caretaker' }));
          toast.success(`Welcome back, ${carerData.name}!`);
          navigate('/caretaker/my-day');
        } else {
          toast.error('Invalid password');
        }
      } else {
        toast.error('Carer not found');
      }
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
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/superadmin/login')}
              className="text-xs"
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
              variant="default"
              size="sm"
              className="text-xs shadow-glow"
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

          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Carer Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your carer account
            </p>

            <div className="mt-4 rounded-lg bg-primary/5 p-3 border border-primary/10">
              <p className="text-xs font-semibold text-primary">Demo Credentials</p>
              <p className="text-xs text-muted-foreground">Username: nithin • Password: nithin</p>
            </div>
          </div>

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
                'Sign In as Carer'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
