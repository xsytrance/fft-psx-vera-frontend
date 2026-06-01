import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  Settings,
  Users,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/save/upload', icon: Upload, label: 'Upload' },
  { to: '/project/1/characters', icon: Users, label: 'Party' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to ||
            (item.to === '/' && location.pathname === '/') ||
            (item.to !== '/' && location.pathname.startsWith(item.to));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
