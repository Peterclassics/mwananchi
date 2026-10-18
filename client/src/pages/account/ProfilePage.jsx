import { Mail, CalendarDays, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeading from '../../components/ui/PageHeading';
import PersonalDetailsForm from '../../components/account/PersonalDetailsForm';
import ChangePasswordForm from '../../components/account/ChangePasswordForm';
export default function ProfilePage() {
  const { user } = useAuth();
  const initials = user.full_name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  return (
    <>
      <PageHeading
        breadcrumb="MY ACCOUNT"
        title="Your profile"
        description="Manage your personal details and keep your account secure."
      />
      <div className="profile-grid">
        <aside className="profile-summary panel">
          <div className="profile-cover" />
          <div className="profile-summary-body">
            <span className="profile-avatar">{initials}</span>
            <h2>{user.full_name}</h2>
            <span className="profile-role">
              <ShieldCheck size={14} />
              {user.role === 'admin' ? 'Administrator' : 'Citizen account'}
            </span>
            <div className="profile-summary-meta">
              <span>
                <Mail size={17} />
                <span>{user.email}</span>
              </span>
              <span>
                <CalendarDays size={17} />
                <span>
                  Joined{' '}
                  {new Intl.DateTimeFormat('en-KE', {
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Africa/Nairobi',
                  }).format(new Date(user.created_at))}
                </span>
              </span>
            </div>
            <div className="profile-tip">
              <ShieldCheck size={20} />
              <strong>Your account, your control.</strong>
              <p>
                Update your contact details and password here. Your email stays
                linked to your account.
              </p>
            </div>
          </div>
        </aside>
        <div className="profile-forms">
          <PersonalDetailsForm />
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
}
