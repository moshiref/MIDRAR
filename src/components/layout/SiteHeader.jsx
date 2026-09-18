import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

/**
 * Single source of truth for the nav links — both the desktop center bar
 * and the mobile dropdown render this same array, so there is exactly
 * one place to add/remove/rename/reorder a link. Do not fork a second
 * list for mobile; if content ever needs to differ, that's a product
 * decision to revisit here, not a reason to duplicate this array.
 */
const NAV_LINKS = [
  { href: '#plans', label: 'الباقات' },
  { href: '#products', label: 'المنتجات' },
  { href: '#contact', label: 'تواصل معنا' },
];

/**
 * Sticky <header>. Desktop: logo pinned right (`.logo-link{justify-self:
 * start}`, right in RTL), NAV_LINKS truly centered (`.nav` is a 3-column
 * grid `1fr auto 1fr`, so the flanking tracks are always equal width and
 * the middle track lands exactly on the bar's midpoint regardless of
 * side content width), "انضم إلينا" pinned left. The mobile dropdown
 * mirrors the desktop bar exactly — same NAV_LINKS, same order, same
 * "انضم إلينا" → /open-store CTA — nothing added or removed for mobile.
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
          {NAV_LINKS.map((link) => (
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
