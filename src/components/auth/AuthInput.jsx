/**
 * Labeled text/email/tel input for the auth forms, with an inline
 * Arabic error message below it instead of alert()/toast-style errors.
 */
export default function AuthInput({ id, label, error, className = '', ...inputProps }) {
  return (
    <div className={`auth-field${error ? ' invalid' : ''} ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && <span id={`${id}-error`} className="auth-error" role="alert">{error}</span>}
    </div>
  );
}
