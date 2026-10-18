import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { message } from '../services/api';
export default function Navbar({
  onError,
  mobile = false,
  menuOpen = false,
  onMenuToggle,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const admin = user.role === 'admin';
  return (
    <header className="topbar">
      <div className="topbar-navigation">
        {mobile && (
          <button
            type="button"
            className="menu-toggle"
            aria-label="Open navigation menu"
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            onClick={onMenuToggle}
          >
            <Menu size={23} aria-hidden="true" />
          </button>
        )}
        <span className="workspace-label">
          <ShieldCheck size={17} />
          {admin ? 'Administrator portal' : 'Citizen portal'}
        </span>
      </div>
      <div className="user-menu">
        <span className="avatar">
          {user.full_name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')}
        </span>
        <span>
          <strong>{user.full_name}</strong>
          <small>{admin ? 'Administrator' : 'Citizen account'}</small>
        </span>
        <button
          title="Sign out"
          aria-label="Sign out"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await logout();
              navigate('/login');
            } catch (e) {
              onError(message(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}
