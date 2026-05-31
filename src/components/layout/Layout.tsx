import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import LibrarySidebar from './LibrarySidebar';
import { useApp } from '../../context/AppContext';

export default function Layout() {
  const { state } = useApp();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <LibrarySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-6">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" theme={state.darkMode ? 'dark' : 'light'} />
    </div>
  );
}
