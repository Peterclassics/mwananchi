import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
export default function AccountField({
  name,
  label,
  error,
  help,
  type = 'text',
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return (
    <div className="account-field">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <div className={password ? 'password-wrap' : ''}>
        <input
          id={name}
          name={name}
          type={password && visible ? 'text' : type}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          aria-invalid={!!error}
          aria-describedby={`${name}-feedback`}
          {...props}
        />
        {password && (
          <button
            type="button"
            aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <small
        id={`${name}-feedback`}
        className={error ? 'text-danger' : 'text-secondary'}
      >
        {error || help}
      </small>
    </div>
  );
}
