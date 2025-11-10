import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Visit {
  id: string;
  clientName: string;
  clientAddress: string;
  clientId: string;
  scheduledTime: Date;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  tasks: string[];
}

export default function MyDay() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const visitsQuery = query(
      collection(db, 'visits'),
      where('carerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      visitsQuery, 
      (snapshot) => {
        const visitsData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const scheduledTime = data.scheduledDate.toDate();
            return {
              id: doc.id,
              clientName: data.clientName,
              clientAddress: data.clientAddress,
              clientId: data.clientId,
              scheduledTime,
              duration: data.duration,
              status: data.status,
              tasks: data.tasks || [],
            };
          })
          .filter((visit) => {
            return visit.scheduledTime >= today && visit.scheduledTime < tomorrow;
          })
          .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
        
        setVisits(visitsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching visits:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-hero p-6 text-primary-foreground">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-2xl font-bold">My Day</h1>
          <p className="mt-1 text-sm opacity-90">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <div className="mt-4 flex gap-4">
            <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-xs opacity-80">Total Visits</p>
              <p className="text-xl font-bold">{visits.length}</p>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-xs opacity-80">Completed</p>
              <p className="text-xl font-bold">
                {visits.filter((v) => v.status === 'completed').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Visits List */}
      <div className="p-4 space-y-4">
        {visits.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl bg-card p-8 text-center shadow-soft"
          >
            <CheckCircle className="mx-auto h-12 w-12 text-secondary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No visits scheduled
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Enjoy your day off or check back later for updates!
            </p>
          </motion.div>
        ) : (
          visits.map((visit, index) => (
            <motion.div
              key={visit.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-gradient-card p-4 shadow-soft"
            >
              {/* Status Badge */}
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    visit.status === 'completed'
                      ? 'bg-secondary/10 text-secondary'
                      : visit.status === 'in-progress'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {visit.status === 'completed'
                    ? 'Completed'
                    : visit.status === 'in-progress'
                    ? 'In Progress'
                    : 'Scheduled'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {visit.duration} mins
                </span>
              </div>

              {/* Client Info */}
              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{visit.clientName}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(visit.scheduledTime, 'h:mm a')}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {visit.clientAddress}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              {visit.tasks.length > 0 && (
                <div className="mb-4 rounded-lg bg-background/50 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Tasks:</p>
                  <ul className="space-y-1">
                    {visit.tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-3 w-3 text-secondary" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-none"
                  onClick={() => {
                    // Open Google Maps with directions
                    const address = encodeURIComponent(visit.clientAddress);
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                  }}
                >
                  <Navigation className="h-4 w-4" />
                </Button>
                {visit.status === 'scheduled' && (
                  <Button className="flex-1 bg-gradient-primary shadow-glow">
                    Start Visit
                  </Button>
                )}
                {visit.status === 'in-progress' && (
                  <Button className="flex-1" variant="secondary">
                    Complete Visit
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
