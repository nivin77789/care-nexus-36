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
  useSidebar,
} from '@/components/ui/sidebar';

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
    icon: UserCog,
    label: 'Carers',
    path: '/superadmin/carers',
  },
  {
    icon: Users,
    label: 'Clients',
    path: '/superadmin/clients',
  },
  {
    icon: Users,
    label: 'Manage Client Accounts',
    path: '/superadmin/manage-clients',
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
  const collapsed = state === 'collapsed';

  return (
    <SidebarUI className="border-r border-border bg-gradient-to-b from-card to-card/50">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              {!collapsed && (
                <span className="font-bold text-lg text-foreground">SuperAdmin</span>
              )}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {superAdminMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    className="w-full justify-start hover:bg-accent/50 transition-colors"
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto px-4 py-4 border-t border-border">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Super Admin</p>
                <p className="text-xs text-muted-foreground truncate">Master Access</p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </SidebarUI>
  );
}
