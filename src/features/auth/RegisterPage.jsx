import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import PasswordInput from '../../components/auth/PasswordInput';
import { validateEmail, validateRequired, validatePhone, validatePassword, validateConfirmPassword } from './validators';
import { registerRequest } from './authService';
import './auth.css';

const PASSWORD_MIN_LENGTH = 6;

const EMPTY_FORM = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' };

/**
 * Frontend-only, like LoginPage: `handleRegister` validates, then calls
 * the `registerRequest` stub from authService.js. No account is actually
 * created — swap that one function for a real
 * `POST /api/auth/register` later and this page doesn't need to change.
 */
export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [message, setMessage] = useState('');

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const nextErrors = {
      fullName: validateRequired(form.fullName, 'يرجى إدخال الاسم الكامل'),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: validatePassword(form.password, { minLength: PASSWORD_MIN_LENGTH }),
      confirmPassword: validateConfirmPassword(form.confirmPassword, form.password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setStatus('loading');
    const result = await registerRequest({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    setStatus('done');
    setMessage(result.message);
  };

  return (
    <AuthCard
      title="أنشئ حسابك في مدرار"
      subtitle="أنشئ حسابًا لإدارة متجرك أو نشاطك كمورد على منصة مدرار."
      footer={<>لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link></>}
    >
      <form className="auth-form" onSubmit={handleRegister} noValidate>
        <AuthInput
          id="register-name"
          label="الاسم الكامل"
          type="text"
          placeholder="أدخل اسمك الكامل"
          value={form.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
          error={errors.fullName}
          autoComplete="name"
        />

        <div className="auth-form-grid">
          <AuthInput
            id="register-email"
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
          <AuthInput
            id="register-phone"
            label="رقم الهاتف"
            type="tel"
            className="en"
            dir="ltr"
            placeholder="أدخل رقم هاتفك"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            error={errors.phone}
            autoComplete="tel"
          />
        </div>

        <div className="auth-form-grid">
          <PasswordInput
            id="register-password"
            label="كلمة المرور"
            placeholder="أدخل كلمة المرور"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordInput
            id="register-confirm-password"
            label="تأكيد كلمة المرور"
            placeholder="أعد إدخال كلمة المرور"
            value={form.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <span className="auth-spinner" aria-hidden="true" />
              جارٍ إنشاء الحساب...
            </>
          ) : (
            'إنشاء الحساب'
          )}
        </button>

        {status === 'done' && (
          <p className="auth-status" role="status">{message}</p>
        )}
      </form>
    </AuthCard>
  );
}
