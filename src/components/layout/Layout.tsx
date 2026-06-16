import { Suspense, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Home, Library, Users, Landmark, Swords, Menu, X, Settings, ScrollText } from 'lucide-react';
import MusicControls from '../music/MusicControls';
import Sigil from '../ui/Sigil';

export default function Layout() {
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile drawer whenever the route changes (adjust state during render).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setNavOpen(false);
  }

  // Show project-scoped links only when on a project page
  const isOnProject = pathname.startsWith('/project/');
  const projectId = isOnProject ? pathname.split('/')[2] : null;

  return (
    <div className="app-layout">
      {/* Mobile top bar — the only way to reach navigation on small screens */}
      <header className="mobile-topbar">
        <button className="nav-toggle" aria-label="Open navigation" onClick={() => setNavOpen(true)}>
          <Menu size={20} />
        </button>
        <Link to="/" className="mobile-brand">
          <Sigil size={26} />
          <strong>FFT PSX Vera</strong>
        </Link>
      </header>

      {navOpen && <div className="nav-backdrop" onClick={() => setNavOpen(false)} aria-hidden="true" />}

      <nav className={`sidebar ${navOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/">
            <Sigil size={34} className="brand-mark" />
            <span className="brand-text">
              <strong>FFT PSX Vera</strong>
              <small>Save Companion</small>
            </span>
          </Link>
          <button className="nav-close" aria-label="Close navigation" onClick={() => setNavOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-label">Archive</div>
        <div className="sidebar-nav">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>
            <span className="nav-icon"><Home size={16} /></span> Home
          </Link>
          <Link to="/dashboard" className={pathname.startsWith('/dashboard') ? 'active' : ''}>
            <span className="nav-icon"><Library size={16} /></span> Campaigns
          </Link>
          <Link to="/settings" className={pathname.startsWith('/settings') ? 'active' : ''}>
            <span className="nav-icon"><Settings size={16} /></span> Settings
          </Link>
        </div>

        {isOnProject && projectId && (
          <>
            <div className="nav-divider" />
            <div className="sidebar-section-label">This Save</div>
            <div className="sidebar-nav">
              <Link to={`/project/${projectId}`} className={pathname === `/project/${projectId}` ? 'active' : ''}>
                <span className="nav-icon"><Users size={16} /></span> Party Ledger
              </Link>
              <Link to={`/project/${projectId}/timeline`} className={pathname.includes('/timeline') ? 'active' : ''}>
                <span className="nav-icon"><ScrollText size={16} /></span> Timeline
              </Link>
              <Link to={`/project/${projectId}/group-chat`} className={pathname.includes('/group-chat') ? 'active' : ''}>
                <span className="nav-icon"><Landmark size={16} /></span> War Council
              </Link>
              <Link to={`/project/${projectId}/dream-team`} className={pathname.includes('/dream-team') ? 'active' : ''}>
                <span className="nav-icon"><Swords size={16} /></span> Dream Team
              </Link>
            </div>
          </>
        )}

        <MusicControls />
      </nav>
      <main className="content">
        <Suspense fallback={<div className="page-loading">Loading…</div>}>
          <div className="page-fade" key={pathname}>
            <Outlet />
          </div>
        </Suspense>
      </main>
    </div>
  );
}
