import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/ui/ErrorAlert';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import MobileSidebar from '../components/navigation/MobileSidebar';

export default function AppLayout() {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const mobile = useMediaQuery('(max-width: 800px)');
  const location = useLocation();
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search, mobile, closeMenu]);
  return (
    <div className="app-shell">
      {mobile ? (
        <MobileSidebar
          open={menuOpen}
          onClose={closeMenu}
          admin={user.role === 'admin'}
        />
      ) : (
        <Sidebar admin={user.role === 'admin'} />
      )}
      <div className="main-shell">
        <Navbar
          onError={setError}
          mobile={mobile}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((value) => !value)}
        />
        <main id="main-content" className="page-container">
          <ErrorAlert message={error} />
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
