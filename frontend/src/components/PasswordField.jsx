import { useState } from 'react';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z"
      />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18M10.5 10.7a2.6 2.6 0 003.8 3.6M9.9 5.6A10 10 0 0112 5.2c6 0 9.5 6.8 9.5 6.8a17 17 0 01-3.1 4.1M6.2 6.4C3.8 8.1 2.5 12 2.5 12s1.4 2.7 4 4.6"
      />
    </svg>
  );
}

const PasswordField = ({ ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-field">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-field-toggle"
        onClick={() => setVisible((open) => !open)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </span>
  );
};

export default PasswordField;
