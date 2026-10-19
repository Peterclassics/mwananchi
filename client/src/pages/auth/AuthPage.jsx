import AuthField from '../../components/auth/AuthField';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Brand from '../../components/branding/Brand';
import { useAuth } from '../../context/AuthContext';
import { message } from '../../services/api';
import ErrorAlert from '../../components/ui/ErrorAlert';
export default function AuthPage({ register = false }) {
  const { authenticate, error: sessionError } = useAuth(),
    navigate = useNavigate();
  const [error, setError] = useState(''),
    [fields, setFields] = useState({}),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setError('');
    setFields({});
    if (register && new TextEncoder().encode(data.password).length > 72) {
      setFields({ password: 'Password must fit within 72 UTF-8 bytes.' });
      return;
    }
    if (register && data.password !== data.confirm_password) {
      setFields({ confirm_password: 'Passwords do not match' });
      return;
    }
    setBusy(true);
    try {
      const user = await authenticate(register ? 'register' : 'login', data);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e) {
      setError(message(e));
      setFields(e.response?.data?.fields || {});
    } finally {
      setBusy(false);
    }
  }
  const input = (name, label, type = 'text', required = true) => (
    <AuthField
      key={name}
      name={name}
      label={label}
      type={type}
      required={required}
      register={register}
      show={show}
      onToggle={() => setShow(!show)}
      error={fields[name]}
    />
  );

  return (
    <div className="auth-page">
      <section className="auth-story">
        <Brand />
        <div>
          <span className="eyebrow">YOUR COMMUNITY. YOUR VOICE.</span>
          <h1>
            Better public services
            <br />
            start with you.
          </h1>
          <p>
            Report an issue. Follow its progress. See the difference your voice
            can make.
          </p>
          <div className="auth-assurance">
            <ShieldCheck />
            One account. A clear path from report to resolution.
          </div>
        </div>
      </section>
      <main id="main-content" className="auth-form">
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
        <h1>{register ? 'Join your community' : 'Welcome back'}</h1>
        <p>
          {register
            ? 'Create an account to report and track local issues.'
            : 'Sign in to keep your community moving forward.'}
        </p>
        <ErrorAlert message={error || sessionError} />
        <form onSubmit={submit}>
          {register && input('full_name', 'Full name')}
          {input('email', 'Email address', 'email')}
          {register && input('phone', 'Phone number (optional)', 'tel', false)}
          {input('password', 'Password', 'password')}
          {register && (
            <small className="d-block text-secondary mb-3">
              Use at least 8 characters.
            </small>
          )}
          {register &&
            input('confirm_password', 'Confirm password', 'password')}
          <button className="btn btn-primary w-100 py-3" disabled={busy}>
            {busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="mt-4 text-center">
          {register ? 'Already have an account?' : 'New to Mwananchi?'}{' '}
          <Link to={register ? '/login' : '/register'}>
            {register ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </main>
    </div>
  );
}
