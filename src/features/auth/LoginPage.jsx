import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import PasswordInput from '../../components/auth/PasswordInput';
import { validateEmail, validatePassword } from './validators';
import { loginRequest } from './authService';
import './auth.css';

/**
 * There is no backend yet — `handleLogin` validates on the frontend
 * only, then calls the `loginRequest` stub from authService.js (a
 * simulated network delay + a fixed "not wired up yet" message). When a
 * real API exists, only authService.js needs to change; this component
 * already treats the call as async and only cares about the resolved
 * `{ ok, message }` shape.
 */
export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [message, setMessage] = useState('');

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const nextErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setStatus('loading');
    const result = await loginRequest({ email: form.email, password: form.password });
    setStatus('done');
    setMessage(result.message);
  };

  return (
    <AuthCard
      title="أهلًا بك في مدرار"
      subtitle="سجّل الدخول لإدارة متجرك ومتابعة طلباتك ومبيعاتك."
      footer={<>ليس لديك حساب؟ <Link to="/register">انضم إلينا</Link></>}
    >
      <form className="auth-form" onSubmit={handleLogin} noValidate>
        <AuthInput
          id="login-email"
          label="البريد الإلكتروني"
          type="email"
          className="en"
          dir="ltr"
          placeholder="أدخل بريدك الإلكتروني"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          autoComplete="email"
        />

        <PasswordInput
          id="login-password"
          label="كلمة المرور"
          placeholder="أدخل كلمة المرور"
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="auth-options-row">
          <Link to="/forgot-password" className="auth-link">نسيت كلمة المرور؟</Link>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <span className="auth-spinner" aria-hidden="true" />
              جارٍ تسجيل الدخول...
            </>
          ) : (
            'تسجيل الدخول'
          )}
        </button>

        {status === 'done' && (
          <p className="auth-status" role="status">{message}</p>
        )}
      </form>
    </AuthCard>
  );
}
