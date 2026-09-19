import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

/** Desktop center nav — unchanged, still the trimmed 3-link set. */
const DESKTOP_NAV_LINKS = [
  { href: '#plans', label: 'الباقات' },
  { href: '#products', label: 'المنتجات' },
  { href: '#contact', label: 'تواصل معنا' },
];

/**
 * Mobile menu — deliberately a separate, fuller list from
 * DESKTOP_NAV_LINKS (same hrefs/labels the desktop bar used to show
 * before it was trimmed down, plus "تسجيل الدخول"). Only the *display*
 * differs between breakpoints, not a shared source of truth — the
 * product ask here was explicitly "mobile shows every nav link", not
 * "mobile mirrors whatever desktop currently shows".
 */
const MOBILE_NAV_LINKS = [
  { href: '#plans', label: 'الباقات' },
  { href: '#products', label: 'المنتجات' },
  { href: '#how', label: 'كيف تعمل مدرار' },
  { href: '#merchants', label: 'للتجار' },
  { href: '#suppliers', label: 'للموردين' },
  { href: '#faq', label: 'الأسئلة الشائعة' },
  { href: '#contact', label: 'تواصل معنا' },
];

/**
 * Sticky <header>. Desktop: logo pinned right (`.logo-link{justify-self:
 * start}`, right in RTL), DESKTOP_NAV_LINKS truly centered (`.nav` is a
 * 3-column grid `1fr auto 1fr`, so the flanking tracks are always equal
 * width and the middle track lands exactly on the bar's midpoint
 * regardless of side content width), "انضم إلينا" pinned left. None of
 * that changes on mobile — only `.nav-toggle` (the hamburger, pinned to
 * the phone's physical left edge via `position:absolute; left:28px` on
 * `header`, not grid/RTL inference) and the dropdown it opens, which
 * lists MOBILE_NAV_LINKS + "تسجيل الدخول" — not "انضم إلينا", which stays
 * exclusively the floating circular CTA (FloatingJoinCta) on mobile.
 * `isOpen` toggles that dropdown, closed on every link click. The
 * scroll-progress bar, header scroll-shadow and scroll-spy active link
 * are page-wide effects handled by their own hooks in PublicLayout.
 */
export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMobile = () => setIsOpen(false);

  return (
    <header>
      <div className="scroll-progress" id="scrollProgress"></div>
      <div className="wrap nav">
        <a
          href="#hero"
          className="logo-link"
          aria-label="مدرار — العودة لأعلى الصفحة"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Logo />
        </a>
        <nav className="nav-links" id="navLinks">
          {DESKTOP_NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} data-nav="">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <Link className="nav-join" to="/open-store">انضم إلينا</Link>
          <button
            type="button"
            className={`nav-toggle${isOpen ? ' open' : ''}`}
            id="navToggle"
            aria-label="القائمة"
            aria-expanded={isOpen}
            aria-controls="mobilePanel"
            onClick={() => setIsOpen((v) => !v)}
          >
            <span></span>
          </button>
        </div>
      </div>
      <div className={`mobile-panel${isOpen ? ' open' : ''}`} id="mobilePanel">
        {MOBILE_NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMobile}>
            {link.label}
          </a>
        ))}
        <Link to="/login" onClick={closeMobile}>
          تسجيل الدخول
        </Link>
      </div>
    </header>
  );
}
