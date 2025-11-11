import { NavLink } from 'react-router-dom';
import { Calendar, Home, MessageSquare, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const caretakerMenuItems = [
  { icon: Home, label: 'My Day', path: '/caretaker/my-day' },
  { icon: Calendar, label: 'Visits', path: '/caretaker/visits' },
  { icon: MessageSquare, label: 'Messages', path: '/caretaker/messages' },
  { icon: MessageCircle, label: 'Feedback', path: '/caretaker/feedback' },
  { icon: User, label: 'Profile', path: '/caretaker/profile' },
];

export const BottomNav = () => {
  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-lg lg:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {caretakerMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-5 w-5', isActive && 'scale-110')} />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottomnav-indicator"
                    className="absolute bottom-0 h-1 w-12 rounded-t-full bg-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
};
