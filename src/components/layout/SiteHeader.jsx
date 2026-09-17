import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const NAV_LINKS = [
  { href: '#plans', label: 'الباقات' },
  { href: '#products', label: 'المنتجات' },
  { href: '#contact', label: 'تواصل معنا' },
];

/**
 * Sticky <header>: logo pinned to the inline-start edge (right, RTL),
 * nav links truly centered on the full bar (not just "the leftover
 * space" — `.nav` is a 3-column grid `1fr auto 1fr`, so the two flanking
 * 1fr tracks are always equal width and the auto-sized middle track
 * lands exactly on the bar's midpoint regardless of how wide the logo
 * or the "انضم إلينا" slot are), "انضم إلينا" pinned to the inline-end
 * edge (left) → /open-store. It also appears as the floating circular
 * button (FloatingJoinCta) — that's intentional, not a duplicate to
 * clean up. `isOpen` toggles the mobile dropdown panel, closed on every
 * link click. The scroll-progress bar, header scroll-shadow and
 * scroll-spy active link are page-wide effects handled by their own
 * hooks in PublicLayout.
 */
export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMobile = () => setIsOpen(false);

  return (
    <header>
      <div className="scroll-progress" id="scrollProgress"></div>
      <div className="wrap nav">
        <a href="#hero" className="logo-link" aria-label="مدرار — العودة لأعلى الصفحة">
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
            className={`nav-toggle${isOpen ? ' open' : ''}`}
            id="navToggle"
            aria-label="القائمة"
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
        <Link to="/open-store" onClick={closeMobile}>
          انضم إلينا
        </Link>
      </div>
    </header>
  );
}
