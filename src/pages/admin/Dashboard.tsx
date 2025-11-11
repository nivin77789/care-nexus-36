import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, where, Timestamp, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { StatCard } from '@/components/ui/stat-card';
import { Users, Calendar, AlertCircle, CheckCircle, Clock, TrendingUp, FileText, Bell, Mail, MailOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';

interface RecentVisit {
  id: string;
  carerName: string;
  clientName: string;
  status: string;
  timestamp: Date;
}

interface HandoverReport {
  id: string;
  carerName: string;
  clientName: string;
  summary: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface SystemUpdate {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
}

interface Message {
  id: string;
  senderName: string;
  subject: string;
  preview: string;
  read: boolean;
  timestamp: Date;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCarers: 0,
    todayVisits: 0,
    completedVisits: 0,
    pendingIncidents: 0,
    upcomingVisits: 0,
  });
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [handoverReports, setHandoverReports] = useState<HandoverReport[]>([]);
  const [systemUpdates, setSystemUpdates] = useState<SystemUpdate[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reportFilter, setReportFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [reportSort, setReportSort] = useState<'newest' | 'oldest' | 'priority'>('newest');

  useEffect(() => {
    // Real-time listeners for dashboard stats
    const unsubscribers: (() => void)[] = [];

    // Listen to clients
    const clientsQuery = query(collection(db, 'clients'));
    unsubscribers.push(
      onSnapshot(clientsQuery, (snapshot) => {
        setStats((prev) => ({ ...prev, totalClients: snapshot.size }));
      })
    );

    // Listen to carers
    const carersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'caretaker')
    );
    unsubscribers.push(
      onSnapshot(carersQuery, (snapshot) => {
        setStats((prev) => ({ ...prev, activeCarers: snapshot.size }));
      })
    );

    // Listen to visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const visitsQuery = query(
      collection(db, 'visits'),
      where('scheduledDate', '>=', Timestamp.fromDate(today)),
      where('scheduledDate', '<', Timestamp.fromDate(tomorrow))
    );

    unsubscribers.push(
      onSnapshot(visitsQuery, (snapshot) => {
        const completed = snapshot.docs.filter((doc) => doc.data().status === 'completed').length;
        const upcoming = snapshot.docs.filter((doc) => doc.data().status === 'scheduled').length;
        setStats((prev) => ({
          ...prev,
          todayVisits: snapshot.size,
          completedVisits: completed,
          upcomingVisits: upcoming,
        }));
      })
    );

    // Listen to incidents
    const incidentsQuery = query(
      collection(db, 'incidents'),
      where('status', '==', 'pending')
    );
    unsubscribers.push(
      onSnapshot(incidentsQuery, (snapshot) => {
        setStats((prev) => ({ ...prev, pendingIncidents: snapshot.size }));
      })
    );

    // Fetch recent visits with carer and client info
    const fetchRecentVisits = async () => {
      const recentVisitsQuery = query(
        collection(db, 'visits'),
        orderBy('scheduledDate', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(recentVisitsQuery);
      const visitsWithDetails = await Promise.all(
        snapshot.docs.map(async (visitDoc) => {
          const visitData = visitDoc.data();
          
          // Fetch carer details
          const carerDoc = await getDoc(doc(db, 'carers', visitData.carerId));
          const carerName = carerDoc.exists() ? carerDoc.data().name : 'Unknown Carer';
          
          // Fetch client details
          const clientDoc = await getDoc(doc(db, 'clients', visitData.clientId));
          const clientName = clientDoc.exists() ? clientDoc.data().name : 'Unknown Client';

          return {
            id: visitDoc.id,
            carerName,
            clientName,
            status: visitData.status || 'scheduled',
            timestamp: visitData.scheduledDate.toDate(),
          };
        })
      );

      setRecentVisits(visitsWithDetails);
    };

    fetchRecentVisits();

    // Fetch handover reports
    const fetchHandoverReports = async () => {
      const reportsQuery = query(
        collection(db, 'handoverReports'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(reportsQuery);
      const reportsWithDetails = await Promise.all(
        snapshot.docs.map(async (reportDoc) => {
          const reportData = reportDoc.data();
          
          const carerDoc = await getDoc(doc(db, 'carers', reportData.carerId));
          const carerName = carerDoc.exists() ? carerDoc.data().name : 'Unknown Carer';
          
          const clientDoc = await getDoc(doc(db, 'clients', reportData.clientId));
          const clientName = clientDoc.exists() ? clientDoc.data().name : 'Unknown Client';

          return {
            id: reportDoc.id,
            carerName,
            clientName,
            summary: reportData.summary || 'No summary available',
            priority: reportData.priority || 'medium',
            timestamp: reportData.timestamp.toDate(),
          };
        })
      );

      setHandoverReports(reportsWithDetails);
    };

    fetchHandoverReports();

    // Fetch system updates
    const fetchSystemUpdates = async () => {
      const updatesQuery = query(
        collection(db, 'systemUpdates'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(updatesQuery);
      const updates = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          timestamp: data.timestamp.toDate(),
        };
      });

      setSystemUpdates(updates);
    };

    fetchSystemUpdates();

    // Fetch messages
    const fetchMessages = async () => {
      const messagesQuery = query(
        collection(db, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(8)
      );

      const snapshot = await getDocs(messagesQuery);
      const messagesWithDetails = await Promise.all(
        snapshot.docs.map(async (msgDoc) => {
          const msgData = msgDoc.data();
          
          const senderDoc = await getDoc(doc(db, 'users', msgData.senderId));
          const senderName = senderDoc.exists() ? senderDoc.data().name : 'Unknown Sender';

          return {
            id: msgDoc.id,
            senderName,
            subject: msgData.subject || 'No subject',
            preview: msgData.preview || msgData.body?.substring(0, 60) || 'No preview',
            read: msgData.read || false,
            timestamp: msgData.timestamp.toDate(),
          };
        })
      );

      setMessages(messagesWithDetails);
    };

    fetchMessages();

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Filter and sort handover reports
  const filteredAndSortedReports = handoverReports
    .filter((report) => reportFilter === 'all' || report.priority === reportFilter)
    .sort((a, b) => {
      if (reportSort === 'newest') return b.timestamp.getTime() - a.timestamp.getTime();
      if (reportSort === 'oldest') return a.timestamp.getTime() - b.timestamp.getTime();
      if (reportSort === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  // Calculate message stats
  const unreadMessages = messages.filter((msg) => !msg.read).length;
  const readMessages = messages.filter((msg) => msg.read).length;

  return (
    <div className="space-y-4 p-4 max-h-screen overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          trend="+12% from last month"
          trendUp={true}
          delay={0}
        />
        <StatCard
          title="Active Carers"
          value={stats.activeCarers}
          icon={CheckCircle}
          trend="+5 new this week"
          trendUp={true}
          delay={0.1}
        />
        <StatCard
          title="Today's Visits"
          value={stats.todayVisits}
          icon={Calendar}
          trend={`${stats.completedVisits} completed`}
          trendUp={true}
          delay={0.2}
        />
        <StatCard
          title="Completed Today"
          value={stats.completedVisits}
          icon={TrendingUp}
          trend={`${stats.upcomingVisits} upcoming`}
          trendUp={true}
          delay={0.3}
        />
        <StatCard
          title="Pending Incidents"
          value={stats.pendingIncidents}
          icon={AlertCircle}
          trend={stats.pendingIncidents > 0 ? 'Requires attention' : 'All clear'}
          trendUp={false}
          delay={0.4}
        />
        <StatCard
          title="Upcoming Visits"
          value={stats.upcomingVisits}
          icon={Clock}
          trend="Next 2 hours"
          trendUp={true}
          delay={0.5}
        />
      </div>

      {/* Grid for Recent Visits and System Updates */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-lg bg-gradient-card p-4 shadow-soft"
        >
          <h2 className="mb-3 text-lg font-semibold text-foreground">Recent Visits</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentVisits.length > 0 ? (
              recentVisits.slice(0, 3).map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    visit.status === 'completed' 
                      ? 'bg-secondary/10 text-secondary' 
                      : visit.status === 'in-progress'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}>
                    {visit.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : visit.status === 'in-progress' ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {visit.status === 'completed' ? 'Completed' : visit.status === 'in-progress' ? 'In Progress' : 'Scheduled'} by {visit.carerName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {visit.clientName} • {formatDistanceToNow(visit.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-muted-foreground py-3">No recent visits</p>
            )}
          </div>
        </motion.div>

        {/* System Updates */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="rounded-lg bg-gradient-card p-4 shadow-soft"
        >
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">System Updates</h2>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {systemUpdates.length > 0 ? (
              systemUpdates.slice(0, 3).map((update) => (
                <div
                  key={update.id}
                  className="rounded-lg border border-border bg-background/50 p-3"
                >
                  <p className="text-xs font-medium text-foreground mb-1">
                    {update.title}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                    {update.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(update.timestamp, 'MMM d')} • {formatDistanceToNow(update.timestamp, { addSuffix: true })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-muted-foreground py-3">No recent updates</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Grid for Handover Reports and Messages */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="rounded-lg bg-gradient-card p-4 shadow-soft"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Handover Reports</h2>
            <div className="flex gap-2">
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value as any)}
                className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={reportSort}
                onChange={(e) => setReportSort(e.target.value as any)}
                className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredAndSortedReports.length > 0 ? (
              filteredAndSortedReports.slice(0, 4).map((report) => (
                <div
                  key={report.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background/50 p-3"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                    report.priority === 'high'
                      ? 'bg-red-500/10 text-red-500'
                      : report.priority === 'medium'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-green-500/10 text-green-500'
                  }`}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {report.carerName} → {report.clientName}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        report.priority === 'high'
                          ? 'bg-red-500/10 text-red-500'
                          : report.priority === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {report.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {report.summary}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(report.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-muted-foreground py-3">No handover reports found</p>
            )}
          </div>
        </motion.div>

        {/* Recent Messages */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="rounded-lg bg-gradient-card p-4 shadow-soft"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Messages</h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MailOpen className="h-3 w-3" />
                {readMessages}
              </span>
              <span className="flex items-center gap-1 font-medium text-primary">
                <Mail className="h-3 w-3" />
                {unreadMessages}
              </span>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {messages.length > 0 ? (
              messages.slice(0, 4).map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 rounded-lg border p-2 ${
                    message.read
                      ? 'border-border bg-background/50'
                      : 'border-primary/50 bg-primary/5'
                  }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 ${
                    message.read
                      ? 'bg-muted-foreground/10 text-muted-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {message.read ? (
                      <MailOpen className="h-3.5 w-3.5" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className={`text-xs font-medium truncate ${
                        message.read ? 'text-foreground' : 'text-foreground font-semibold'
                      }`}>
                        {message.senderName}
                      </p>
                      {!message.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/90 mb-0.5 font-medium truncate">
                      {message.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-muted-foreground py-3">No messages</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}