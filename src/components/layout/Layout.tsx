import { Outlet, Link, useLocation } from 'react-router';

export default function Layout() {
  const { pathname } = useLocation();

  // Show group chat link only when on a project page
  const isOnProject = pathname.startsWith('/project/');
  const projectId = isOnProject ? pathname.split('/')[2] : null;

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <Link to="/">
            <span className="brand-icon">⚔️</span>
            <span className="brand-text">FFT Vera</span>
          </Link>
        </div>
        <div className="sidebar-nav">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>
            <span className="nav-icon">🏠</span> Home
          </Link>
          <Link to="/dashboard" className={pathname.startsWith('/dashboard') ? 'active' : ''}>
            <span className="nav-icon">📂</span> Projects
          </Link>
          {isOnProject && projectId && (
            <>
              <div className="nav-divider" />
              <Link to={`/project/${projectId}`} className={pathname === `/project/${projectId}` ? 'active' : ''}>
                <span className="nav-icon">👥</span> Party
              </Link>
              <Link to={`/project/${projectId}/group-chat`} className={pathname.includes('/group-chat') ? 'active' : ''}>
                <span className="nav-icon">🏛️</span> Council
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
