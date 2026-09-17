import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import { validateEmail } from './validators';
import './auth.css';

/**
 * Placeholder so /forgot-password (linked from LoginPage) isn't a
 * broken link. Frontend-only, same as Login/Register — no reset email
 * is actually sent.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | done

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;
    setStatus('done');
  };

  return (
    <AuthCard
      title="استعادة كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور."
      footer={<>تذكّرت كلمة المرور؟ <Link to="/login">تسجيل الدخول</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          id="forgot-email"
          label="البريد الإلكتروني"
          type="email"
          className="en"
          dir="ltr"
          placeholder="أدخل بريدك الإلكتروني"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoComplete="email"
        />

        <button type="submit" className="btn btn-primary btn-block">إرسال رابط الاستعادة</button>

        {status === 'done' && (
          <p className="auth-status" role="status">سيتم تفعيل استعادة كلمة المرور عند ربط النظام بالخادم.</p>
        )}
      </form>
    </AuthCard>
  );
}
