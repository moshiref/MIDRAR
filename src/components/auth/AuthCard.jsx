import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

/**
 * Shared shell for the auth pages (Login/Register/ForgotPassword):
 * MIDRAR logo + a "back to site" link up top, a centered white card with
 * a title/subtitle, then whatever form the page passes as `children`,
 * then an optional `footer` (the "ليس لديك حساب؟" / "لديك حساب بالفعل؟"
 * row) below the card. Kept out of PublicLayout deliberately — like
 * src/features/open-store/OpenStorePage.jsx, this is a focused flow
 * page, not a marketing page with the full nav.
 */
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-topbar wrap">
        <Link to="/" aria-label="مدرار — الصفحة الرئيسية">
          <Logo />
        </Link>
        <Link to="/" className="auth-back-link">رجوع للموقع</Link>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="auth-footer-note">{footer}</div>}
      </div>
    </div>
  );
}
