import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarCheck,
  MessageSquare,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Settings,
  LogOut,
  Bell,
  CreditCard
} from 'lucide-react';
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const superAdminMenuItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/superadmin/dashboard',
  },
  {
    icon: ShieldCheck,
    label: 'Manage Admins',
    path: '/superadmin/manage-admins',
  },
  {
    icon: Users,
    label: 'Manage Clients',
    path: '/superadmin/manage-clients',
  },
  {
    icon: UserCog,
    label: 'Carers',
    path: '/superadmin/carers',
  },
  {
    icon: Users,
    label: 'All Clients', // Renamed for clarity vs Manage Clients
    path: '/superadmin/clients',
  },
  {
    icon: CalendarCheck,
    label: 'Scheduling',
    path: '/superadmin/scheduling',
  },
  {
    icon: MapPin,
    label: 'Client Tracking',
    path: '/superadmin/client-tracking',
  },
  {
    icon: MessageSquare,
    label: 'Messages',
    path: '/superadmin/messages',
  },
  {
    icon: MessageCircle,
    label: 'Feedback',
    path: '/superadmin/feedback',
  },
];

export function SuperAdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { logout, user } = useAuthStore();
  const collapsed = state === 'collapsed';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/superadmin/login';
  };

  return (
    <SidebarUI collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="p-4 pb-2">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden transition-all duration-300">
              <span className="truncate font-bold text-lg leading-none tracking-tight">CareNexus</span>
              <span className="truncate text-xs font-semibold text-primary/80 mt-1 uppercase tracking-wider">Super Admin</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <div className="px-4 my-2">
        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-3 px-2">Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {superAdminMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                      className={`
                        w-full justify-start h-10 transition-all duration-200 group
                        ${isActive
                          ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold shadow-sm border border-primary/10'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1'
                        }
                      `}
                    >
                      <NavLink to={item.path} className="flex items-center gap-3 w-full">
                        <item.icon className={`
                            w-5 h-5 transition-colors
                            ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}
                        `} />
                        <span>{item.label}</span>
                        {isActive && !collapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        {!collapsed && (
          <div className="rounded-xl border border-border bg-gradient-to-b from-card to-background p-3 shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-background ring-2 ring-border/50 transition-all group-hover:ring-primary/20">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">SA</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-semibold text-foreground">{user?.displayName || 'Super Admin'}</p>
                <p className="truncate text-xs text-muted-foreground font-medium">{user?.email || 'admin@carenexus.com'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full h-8 text-xs font-medium gap-1.5 bg-background hover:bg-accent border-border/50">
                <Settings className="w-3.5 h-3.5" />
                Options
              </Button>
              <Button variant="outline" size="sm" className="w-full h-8 text-xs font-medium gap-1.5 bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 border-border/50" onClick={handleLogout}>
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </Button>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex flex-col items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl" title="Settings">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl" title="Logout" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </SidebarUI>
  );
}
