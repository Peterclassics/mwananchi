import { Eye, EyeOff } from 'lucide-react';
export default function AuthField({
  name,
  label,
  type = 'text',
  required = true,
  register = false,
  show = false,
  onToggle,
  error,
}) {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <div className="password-wrap">
        <input
          id={name}
          name={name}
          type={type === 'password' && show ? 'text' : type}
          required={required}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          minLength={
            name.includes('password') && register
              ? 8
              : name === 'full_name'
                ? 2
                : undefined
          }
          pattern={name === 'phone' ? '[+0-9\\s\\(\\)\\-]*' : undefined}
          maxLength={
            name.includes('password')
              ? 72
              : name === 'full_name'
                ? 100
                : name === 'phone'
                  ? 25
                  : 254
          }
          autoComplete={
            name === 'password'
              ? register
                ? 'new-password'
                : 'current-password'
              : name === 'confirm_password'
                ? 'new-password'
                : name === 'email'
                  ? 'email'
                  : name === 'full_name'
                    ? 'name'
                    : 'tel'
          }
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {name === 'password' && (
          <button
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={onToggle}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <small id={`${name}-error`} className="text-danger">
          {error}
        </small>
      )}
    </div>
  );
}
