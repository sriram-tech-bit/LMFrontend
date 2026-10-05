import { BookOpen, ChevronDown, CircleUserRound, History, LibraryBig, LogOut, Plus, Search, UserPlus } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/books': { title: 'Book collection', subtitle: 'Explore and manage the library catalogue.' },
  '/issue': { title: 'Issue a book', subtitle: 'Check out a title to a registered member.' },
  '/history': { title: 'Member history', subtitle: 'Review loans and due dates for a member.' },
  '/register': { title: 'Manage librarians', subtitle: 'Create an account for another librarian.' },
};

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageTitles[location.pathname] ?? pageTitles['/books'];

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/books" aria-label="ShelfLife home">
          <span className="brand-mark"><LibraryBig size={22} /></span>
          <span>Shelf<span className="brand-light">Life</span><small>LIBRARY SYSTEM</small></span>
        </NavLink>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <NavLink to="/books" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <BookOpen size={18} /><span>Book collection</span>
          </NavLink>
          <NavLink to="/issue" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Plus size={18} /><span>Issue a book</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <History size={18} /><span>Member history</span>
          </NavLink>
          {user?.role === 'admin' && <NavLink to="/register" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <UserPlus size={18} /><span>Manage librarians</span>
          </NavLink>}
        </nav>
        <div className="sidebar-note">
          <div className="sidebar-note-icon"><BookOpen size={17} /></div>
          <p>A good book is a friend that never lets you down.</p>
          <span>— Thomas Carlyle</span>
        </div>
        <div className="sidebar-footer"><span className="status-dot" /> All systems operational</div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{page.title}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Search catalogue" onClick={() => navigate('/books')}><Search size={18} /></button>
            <div className="user-menu">
              <span className="avatar"><CircleUserRound size={18} /></span>
              <span className="user-name">{user?.name ?? 'Librarian'}<small>LIBRARIAN</small></span>
              <ChevronDown size={15} className="user-chevron" />
              <button className="logout-button" onClick={signOut} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button>
            </div>
          </div>
        </header>
        <section className="page-content">
          <div className="page-heading">
            <div><div className="eyebrow">SHELFLIFE / LIBRARY</div><h1>{page.title}</h1><p>{page.subtitle}</p></div>
            {location.pathname === '/books' && <button className="button button-primary" onClick={() => navigate('/issue')}><Plus size={17} /> Issue book</button>}
          </div>
          <Outlet />
        </section>
        <footer className="main-footer"><span>© 2025 ShelfLife Library</span><span>Made for curious minds <span className="footer-heart">♥</span></span></footer>
      </main>
    </div>
  );
}
