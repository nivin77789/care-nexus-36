import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  UserCheck,
  GraduationCap,
  Settings,
  FileText,
  MessageSquare,
  DollarSign,
  ShieldCheck,
  MapPin,
  UserCog,
} from 'lucide-react';
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Clients', path: '/admin/clients' },
  { icon: UserCog, label: 'Manage Client Accounts', path: '/admin/manage-clients' },
  { icon: Calendar, label: 'Scheduling', path: '/admin/scheduling' },
  { icon: MapPin, label: 'Client Tracking', path: '/admin/client-tracking' },
  { icon: ClipboardList, label: 'My Actions', path: '/admin/actions' },
  { icon: UserCheck, label: 'Carers', path: '/admin/carers' },
  { icon: GraduationCap, label: 'Training', path: '/admin/training' },
  { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
  { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback' },
  { icon: FileText, label: 'Reports', path: '/admin/reports' },
  { icon: DollarSign, label: 'Finance', path: '/admin/finance' },
  { icon: ShieldCheck, label: 'Policies', path: '/admin/policies' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarUI collapsible="icon" className="border-r bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <SidebarContent className="py-4">
        {/* Logo/Brand Section */}
        <div className={`px-4 mb-6 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">CareAdmin</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Management Portal</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${isCollapsed ? 'text-center' : 'px-4'}`}>
            {!isCollapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className={`space-y-1 px-2 ${isCollapsed ? 'mr-2' : ''}`}>
              {adminMenuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      className={`
                        group relative rounded-lg transition-all duration-200
                        ${active 
                          ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 dark:bg-blue-600' 
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                        }
                        ${isCollapsed ? 'justify-center pr-3' : 'px-3'}
                      `}
                    >
                      <NavLink to={item.path} className="flex items-center gap-3 w-full py-2.5">
                        <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                        {!isCollapsed && (
                          <span className="font-medium text-sm truncate">{item.label}</span>
                        )}
                        {active && !isCollapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile Section (optional - at bottom) */}
        {!isCollapsed && (
          <div className="mt-auto px-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Admin User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@care.com</p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </SidebarUI>
  );
};