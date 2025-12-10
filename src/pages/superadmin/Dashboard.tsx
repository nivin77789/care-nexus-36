import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { StatCard } from '@/components/ui/stat-card';
import {
    Users,
    ShieldCheck,
    UserCog,
    DollarSign,
    Activity,
    Server,
    Database,
    Bell,
    Search,
    Filter,
    Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { format } from 'date-fns';

// --- Types ---

interface DashboardStats {
    totalAdmins: number;
    totalCarers: number;
    totalClients: number;
    totalRevenue: number; // Mocked or calculated
    activeVisits: number;
    systemHealth: number; // 0-100
}

interface VisitData {
    date: string;
    completed: number;
    scheduled: number;
}

interface UserDistribution {
    name: string;
    value: number;
}

interface SystemLog {
    id: string;
    action: string;
    user: string;
    role: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'error';
}

// --- Components ---

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalAdmins: 0,
        totalCarers: 0,
        totalClients: 0,
        totalRevenue: 0,
        activeVisits: 0,
        systemHealth: 98,
    });
    const [visitData, setVisitData] = useState<VisitData[]>([]);
    const [userDistribution, setUserDistribution] = useState<UserDistribution[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Users Counts
                const usersRef = collection(db, 'users');
                const adminsQuery = query(usersRef, where('role', '==', 'admin'));
                const carersQuery = query(usersRef, where('role', '==', 'caretaker'));

                const [adminsSnapshot, carersSnapshot] = await Promise.all([
                    getDocs(adminsQuery),
                    getDocs(carersQuery)
                ]);

                const clientsSnapshot = await getDocs(collection(db, 'clients'));

                // 2. Fetch Visits for Charts (Last 7 days)
                // Note: In a real app, we might need a more optimized aggregation query or function
                const visitsRef = collection(db, 'visits');
                const recentVisitsQuery = query(
                    visitsRef,
                    orderBy('scheduledDate', 'desc'),
                    limit(50) // Limit to avoid reading too many docs for this demo
                );
                const visitsSnapshot = await getDocs(recentVisitsQuery);

                // Process visit data for chart
                const visitsByDate: Record<string, { completed: number; scheduled: number }> = {};
                let activeVisitsCount = 0;
                let revenue = 0;

                visitsSnapshot.forEach(doc => {
                    const data = doc.data();
                    const date = data.scheduledDate?.toDate();
                    if (!date) return;
                    const key = format(date, 'MMM dd');

                    if (!visitsByDate[key]) {
                        visitsByDate[key] = { completed: 0, scheduled: 0 };
                    }

                    if (data.status === 'completed') {
                        visitsByDate[key].completed++;
                        revenue += 25; // Assumption: $25 per visit avg
                    } else {
                        visitsByDate[key].scheduled++;
                    }

                    if (data.status === 'in-progress') {
                        activeVisitsCount++;
                    }
                });

                // Fill in last 7 days if missing
                const chartData: VisitData[] = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = format(d, 'MMM dd');
                    chartData.push({
                        date: key,
                        completed: visitsByDate[key]?.completed || 0,
                        scheduled: visitsByDate[key]?.scheduled || 0,
                    });
                }

                setVisitData(chartData);

                // 3. Update Stats
                setStats({
                    totalAdmins: adminsSnapshot.size,
                    totalCarers: carersSnapshot.size,
                    totalClients: clientsSnapshot.size,
                    totalRevenue: revenue, // Display calculated revenue from fetched visits (subset)
                    activeVisits: activeVisitsCount,
                    systemHealth: 98
                });

                setUserDistribution([
                    { name: 'Admins', value: adminsSnapshot.size },
                    { name: 'Carers', value: carersSnapshot.size },
                    { name: 'Clients', value: clientsSnapshot.size },
                ]);

                // 4. Mock Logs (as we likely don't have a system log collection yet)
                setLogs([
                    { id: '1', action: 'New Admin Added', user: 'System', role: 'System', timestamp: new Date(), status: 'success' },
                    { id: '2', action: 'Database Backup', user: 'System', role: 'System', timestamp: new Date(Date.now() - 3600000), status: 'success' },
                    { id: '3', action: 'Failed Login Attempt', user: 'Unknown', role: 'Visitor', timestamp: new Date(Date.now() - 7200000), status: 'warning' },
                    { id: '4', action: 'Carer Verified', user: 'Sarah J.', role: 'Admin', timestamp: new Date(Date.now() - 10800000), status: 'success' },
                ]);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Loading Super Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 animate-in fade-in zoom-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Super Admin Overview</h1>
                    <p className="text-muted-foreground mt-1">
                        Global system monitoring and administrative controls.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent transition-colors">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                        <Activity className="w-4 h-4" />
                        System Status: Healthy
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue (Est.)"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="+12% this month"
                    trendUp={true}
                    delay={0.1}
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalAdmins + stats.totalCarers + stats.totalClients}
                    icon={Users}
                    trend={`${stats.totalClients} Clients`}
                    trendUp={true}
                    delay={0.2}
                />
                <StatCard
                    title="Active Shifts"
                    value={stats.activeVisits}
                    icon={Activity}
                    trend="Currently in progress"
                    trendUp={true}
                    delay={0.3}
                />
                <StatCard
                    title="System Health"
                    value={`${stats.systemHealth}%`}
                    icon={Server}
                    trend="All systems operational"
                    trendUp={true}
                    delay={0.4}
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Visit Trends</h3>
                            <p className="text-sm text-muted-foreground">Scheduled vs Completed visits over the last 7 days</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={visitData}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCompleted)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="scheduled"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScheduled)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* User Distribution Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col"
                >
                    <h3 className="text-lg font-semibold mb-2">User Distribution</h3>
                    <p className="text-sm text-muted-foreground mb-6">Breakdown of user roles</p>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section: Operations & Logs */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* System Logs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">System Logs</h3>
                        </div>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' :
                                        log.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">by {log.user} ({log.role})</p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {format(log.timestamp, 'HH:mm')}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions / Admin Management Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">Admin Shortcuts</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            onClick={() => navigate('/superadmin/manage-admins')}
                            className="p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <UserCog className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="font-medium text-sm">Manage Admins</h4>
                            <p className="text-xs text-muted-foreground mt-1">Add or remove system administrators</p>
                        </div>
                        <div
                            onClick={() => navigate('/superadmin/messages')}
                            className="p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Bell className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="font-medium text-sm">Broadcast Alert</h4>
                            <p className="text-xs text-muted-foreground mt-1">Send system-wide notifications</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Server className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="font-medium text-sm">Server Maintenance</h4>
                            <p className="text-xs text-muted-foreground mt-1">Schedule downtime or backups</p>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Search className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="font-medium text-sm">Audit Log</h4>
                            <p className="text-xs text-muted-foreground mt-1">View detailed system trails</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
