import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const NAV_LINKS = [
  { href: '#products', label: 'المنتجات' },
  { href: '#how', label: 'كيف تعمل مدرار' },
  { href: '#merchants', label: 'للتجار' },
  { href: '#suppliers', label: 'للموردين' },
  { href: '#faq', label: 'الأسئلة الشائعة' },
  { href: '#contact', label: 'تواصل معنا' },
];

/**
 * Faithful port of the original sticky <header>. The original toggled
 * `.open` on #navToggle/#mobilePanel via plain DOM listeners and closed
 * the panel again on every link click — here that becomes a single
 * `isOpen` piece of React state, which is the idiomatic equivalent.
 * The scroll-progress bar, header scroll-shadow and scroll-spy active
 * link are page-wide effects handled by their own hooks in PublicLayout.
 */
export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMobile = () => setIsOpen(false);

  return (
    <header>
      <div className="scroll-progress" id="scrollProgress"></div>
      <div className="wrap nav">
        <Logo />
        <nav className="nav-links" id="navLinks">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} data-nav="">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <Link className="signin" to="/login">تسجيل الدخول</Link>
          <Link className="btn btn-primary" to="/open-store">انضم إلينا</Link>
        </div>
        <button
          className={`nav-toggle${isOpen ? ' open' : ''}`}
          id="navToggle"
          aria-label="القائمة"
          onClick={() => setIsOpen((v) => !v)}
        >
          <span></span>
        </button>
      </div>
      <div className={`mobile-panel${isOpen ? ' open' : ''}`} id="mobilePanel">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMobile}>
            {link.label}
          </a>
        ))}
        <Link className="btn btn-primary" to="/open-store" onClick={closeMobile}>
          انضم إلينا
        </Link>
      </div>
    </header>
  );
}
