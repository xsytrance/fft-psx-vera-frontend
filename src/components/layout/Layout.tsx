import { Outlet, Link, useLocation } from 'react-router';
import { Home, Library, Users, Landmark, Swords } from 'lucide-react';
import Sigil from '../ui/Sigil';

export default function Layout() {
  const { pathname } = useLocation();

  // Show project-scoped links only when on a project page
  const isOnProject = pathname.startsWith('/project/');
  const projectId = isOnProject ? pathname.split('/')[2] : null;

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <Link to="/">
            <Sigil size={34} className="brand-mark" />
            <span className="brand-text">
              <strong>FFT PSX Vera</strong>
              <small>Save Companion</small>
            </span>
          </Link>
        </div>

        <div className="sidebar-section-label">Archive</div>
        <div className="sidebar-nav">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>
            <span className="nav-icon"><Home size={16} /></span> Home
          </Link>
          <Link to="/dashboard" className={pathname.startsWith('/dashboard') ? 'active' : ''}>
            <span className="nav-icon"><Library size={16} /></span> Campaigns
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
              <Link to={`/project/${projectId}/group-chat`} className={pathname.includes('/group-chat') ? 'active' : ''}>
                <span className="nav-icon"><Landmark size={16} /></span> War Council
              </Link>
              <Link to={`/project/${projectId}/dream-team`} className={pathname.includes('/dream-team') ? 'active' : ''}>
                <span className="nav-icon"><Swords size={16} /></span> Dream Team
              </Link>
            </div>
          </>
        )}
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
