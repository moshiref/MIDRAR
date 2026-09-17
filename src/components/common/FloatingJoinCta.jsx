import { Link } from 'react-router-dom';
import useFloatingCtaFooterAvoidance from '../../hooks/useFloatingCtaFooterAvoidance';

/**
 * Persistent floating "انضم إلينا" CTA for the landing page only (mounted
 * in PublicLayout, which never renders on /open-store, /login, /supplier,
 * ...). Distinct from the Hero's own CTAs on purpose: Hero → "تسجيل
 * الدخول", floating CTA → "انضم إلينا" → /open-store. Deliberately
 * doesn't use the `.btn*` classes so it isn't picked up by
 * useMagneticButtons' mousemove-follow effect, which would fight with
 * this button's own pulse animation.
 *
 * Each bubble gets its own size/position/animation-variant/duration/
 * delay/peak-opacity so the cloud around the button reads as organic
 * rather than a single repeated shape. A handful of shared @keyframes
 * (drift up / up-left / up-right / wobble) in global.css supply the
 * motion "direction"; everything else is per-bubble inline style. The
 * last few entries are hidden on mobile via `.floating-join-bubble:nth-child(n+9)`
 * in global.css, so mobile still gets a calmer, smaller cloud.
 */
const BUBBLES = [
  { size: 6, top: -10, left: 8, anim: 'bubbleUp', duration: 5.2, delay: 0, opacity: 0.8 },
  { size: 4, top: -18, left: 34, anim: 'bubbleUpRight', duration: 6.8, delay: 0.6, opacity: 0.6 },
  { size: 8, top: -4, right: -14, anim: 'bubbleUpLeft', duration: 5.8, delay: 1.1, opacity: 0.75 },
  { size: 5, top: 20, right: -20, anim: 'bubbleDrift', duration: 7.4, delay: 1.8, opacity: 0.55 },
  { size: 9, bottom: -16, right: 10, anim: 'bubbleUp', duration: 6.2, delay: 0.3, opacity: 0.7 },
  { size: 4, bottom: -10, left: 16, anim: 'bubbleUpRight', duration: 5.5, delay: 2.2, opacity: 0.65 },
  { size: 7, top: 38, left: -18, anim: 'bubbleUpLeft', duration: 6.6, delay: 1.4, opacity: 0.6 },
  { size: 5, top: -24, left: -6, anim: 'bubbleDrift', duration: 7.9, delay: 0.9, opacity: 0.5 },
  { size: 6, bottom: 6, left: -22, anim: 'bubbleUp', duration: 5.9, delay: 2.6, opacity: 0.7 },
  { size: 4, top: 8, right: -26, anim: 'bubbleUpRight', duration: 6.1, delay: 0.2, opacity: 0.55 },
  { size: 8, bottom: -22, right: -8, anim: 'bubbleUpLeft', duration: 7.1, delay: 1.7, opacity: 0.68 },
  { size: 3, top: -30, left: 50, anim: 'bubbleDrift', duration: 5.4, delay: 2.9, opacity: 0.5 },
  { size: 7, bottom: 26, left: -30, anim: 'bubbleUp', duration: 6.9, delay: 0.5, opacity: 0.62 },
  { size: 5, top: 46, right: -30, anim: 'bubbleUpRight', duration: 7.6, delay: 1.2, opacity: 0.58 },
];

export default function FloatingJoinCta() {
  const nearFooter = useFloatingCtaFooterAvoidance();

  return (
    <div className={`floating-join-wrap${nearFooter ? ' is-hidden' : ''}`} aria-hidden={nearFooter}>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="floating-join-bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            top: b.top !== undefined ? `${b.top}px` : undefined,
            bottom: b.bottom !== undefined ? `${b.bottom}px` : undefined,
            left: b.left !== undefined ? `${b.left}px` : undefined,
            right: b.right !== undefined ? `${b.right}px` : undefined,
            animationName: b.anim,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            '--bubble-opacity': b.opacity,
          }}
        />
      ))}
      <span className="floating-join-ring"></span>
      <Link
        to="/open-store"
        className="floating-join-cta"
        aria-label="انضم إلينا — سجّل طلب فتح متجرك على مدرار"
        tabIndex={nearFooter ? -1 : 0}
      >
        انضم إلينا
      </Link>
    </div>
  );
}
