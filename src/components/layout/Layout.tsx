import { useState } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import LibrarySidebar from './LibrarySidebar';
import MobileBottomNav from './MobileBottomNav';
import { useApp } from '../../context/AppContext';
import { Menu, X } from 'lucide-react';

export default function Layout() {
  const { state } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden md:block">
        <LibrarySidebar />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl">
            <LibrarySidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-serif text-lg font-semibold tracking-tight">FFT PSX Vera</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-4 md:p-6 pb-20 md:pb-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </div>

      <Toaster position="top-right" theme={state.darkMode ? 'dark' : 'light'} />
    </div>
  );
}
