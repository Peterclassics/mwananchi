import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Files,
  Plus,
  UserCircle,
  ChevronRight,
  X,
} from 'lucide-react';
import Brand from '../components/branding/Brand';
import SidebarGuide from '../components/navigation/SidebarGuide';

export default function Sidebar({
  admin,
  mobile = false,
  onClose,
  onNavigate,
}) {
  const links = [
    {
      to: admin ? '/admin' : '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: admin ? '/admin/requests' : '/requests',
      label: admin ? 'Manage requests' : 'My requests',
      icon: Files,
    },
    ...(!admin
      ? [{ to: '/submit', label: 'Submit a request', icon: Plus }]
      : []),
    { to: '/profile', label: 'My profile', icon: UserCircle },
  ];
  return (
    <aside
      className={`sidebar ${mobile ? 'sidebar-drawer' : ''}`}
      onClick={(event) => {
        if (event.target.closest('a')) onNavigate?.();
      }}
    >
      <div className="sidebar-heading">
        <Brand />
        {mobile && (
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation menu"
            autoFocus
            onClick={onClose}
          >
            <X size={22} aria-hidden="true" />
          </button>
        )}
      </div>
      <span className="nav-caption">
        {admin ? 'ADMINISTRATION' : 'CITIZEN WORKSPACE'}
      </span>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <span className="nav-link-icon">
              <Icon size={19} aria-hidden="true" />
            </span>
            <span>{label}</span>
            <ChevronRight
              className="nav-link-chevron"
              size={15}
              aria-hidden="true"
            />
          </NavLink>
        ))}
      </nav>
      <SidebarGuide />
    </aside>
  );
}
