import { Save, UserRound, LockKeyhole } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccountForm } from '../../hooks/useAccountForm';
import { validatePersonalDetails } from '../../utils/validation';
import AccountField from './AccountField';
import ErrorAlert from '../ui/ErrorAlert';
export default function PersonalDetailsForm() {
  const { user, updateUser } = useAuth();
  const state = useAccountForm(validatePersonalDetails);
  return (
    <section
      className="panel form-panel account-panel"
      aria-labelledby="personal-heading"
    >
      <div className="account-section-heading">
        <span>
          <UserRound size={22} />
        </span>
        <div>
          <h2 id="personal-heading">Personal details</h2>
          <p>Keep your name and contact information up to date.</p>
        </div>
      </div>
      <ErrorAlert message={state.error} />
      {state.success && (
        <div className="alert alert-success" role="status">
          {state.success}
        </div>
      )}
      <form
        noValidate
        onSubmit={(event) =>
          state.submit(event, {
            method: 'patch',
            url: '/account/profile',
            onSaved: (data) => updateUser(data.user),
          })
        }
      >
        <fieldset disabled={state.busy}>
          <div className="account-fields">
            <AccountField
              name="full_name"
              label="Full name"
              defaultValue={user.full_name}
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              error={state.fields.full_name}
            />
            <AccountField
              name="phone"
              label="Phone number (optional)"
              type="tel"
              defaultValue={user.phone || ''}
              maxLength={25}
              autoComplete="tel"
              error={state.fields.phone}
              help="Include your country code, for example +254712345678."
            />
          </div>
          <div className="account-email">
            <label className="form-label" htmlFor="profile-email">
              Email address
            </label>
            <div>
              <input
                id="profile-email"
                type="email"
                className="form-control"
                readOnly
                value={user.email}
                aria-describedby="email-help"
              />
              <LockKeyhole size={16} />
            </div>
            <small id="email-help">Your sign-in email cannot be changed.</small>
          </div>
          <div className="account-form-footer">
            <span>Changes apply to your account immediately.</span>
            <button className="btn btn-primary" disabled={state.busy}>
              <Save size={17} />
              {state.busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
