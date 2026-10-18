import { KeyRound, ShieldCheck } from 'lucide-react';
import { useAccountForm } from '../../hooks/useAccountForm';
import { validatePasswordChange } from '../../utils/validation';
import AccountField from './AccountField';
import ErrorAlert from '../ui/ErrorAlert';
export default function ChangePasswordForm() {
  const state = useAccountForm(validatePasswordChange);
  return (
    <section
      className="panel form-panel account-panel"
      aria-labelledby="password-heading"
    >
      <div className="account-section-heading">
        <span>
          <ShieldCheck size={22} />
        </span>
        <div>
          <h2 id="password-heading">Password & security</h2>
          <p>Choose a password you don’t use on another account.</p>
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
            method: 'post',
            url: '/account/password',
            onSaved: (_data, form) => form.reset(),
          })
        }
      >
        <fieldset disabled={state.busy}>
          <AccountField
            name="current_password"
            label="Current password"
            type="password"
            required
            maxLength={72}
            autoComplete="current-password"
            error={state.fields.current_password}
          />
          <div className="account-fields">
            <AccountField
              name="new_password"
              label="New password"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              error={state.fields.new_password}
              help="At least 8 characters; maximum 72 UTF-8 bytes."
            />
            <AccountField
              name="confirm_password"
              label="Confirm new password"
              type="password"
              required
              maxLength={72}
              autoComplete="new-password"
              error={state.fields.confirm_password}
            />
          </div>
          <div className="account-security-note">
            <ShieldCheck size={17} />
            <span>
              Changing your password signs out your other sessions. This session
              stays signed in.
            </span>
          </div>
          <div className="account-form-footer">
            <button className="btn btn-primary" disabled={state.busy}>
              <KeyRound size={17} />
              {state.busy ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
