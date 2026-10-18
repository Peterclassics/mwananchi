import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
export default function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <Activity size={25} />
      </span>
      <span>
        Mwa<span className="brand-light">nanchi</span>
        <small>BETTER SERVICES. TOGETHER.</small>
      </span>
    </Link>
  );
}
