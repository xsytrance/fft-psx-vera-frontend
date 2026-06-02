import { Outlet, Link, useLocation } from 'react-router';

export default function Layout() {
  const { pathname } = useLocation();

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
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
