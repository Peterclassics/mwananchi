import { NavLink } from 'react-router-dom';
import { BookOpen, ArrowUpRight } from 'lucide-react';

export default function SidebarGuide() {
  return (
    <NavLink to="/guide" className="sidebar-guide">
      <span className="sidebar-guide-icon">
        <BookOpen size={20} aria-hidden="true" />
      </span>
      <span className="sidebar-guide-copy">
        <strong>How it works</strong>
        <small>View the quick guide</small>
      </span>
      <ArrowUpRight
        className="sidebar-guide-arrow"
        size={17}
        aria-hidden="true"
      />
    </NavLink>
  );
}
