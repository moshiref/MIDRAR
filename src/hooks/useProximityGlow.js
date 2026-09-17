import { useEffect } from 'react';

/**
 * Faithful port of the "proximity glow" effect: any `.proximity` element
 * (cards, panels, mockups) glows and gets a `.pulse-near` pulse as the
 * cursor approaches, via the --glow/--mx/--my CSS custom properties
 * consumed by .proximity::before/::after in global.css.
 *
 * Skipped entirely under prefers-reduced-motion, exactly like the original.
 */
const PROX_RANGE = 240;

export default function useProximityGlow() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const proximityEls = Array.from(document.querySelectorAll('.proximity'));
    if (prefersReducedMotion || !proximityEls.length) return;

    let mouseX = -9999;
    let mouseY = -9999;
    let proximityTicking = false;

    function updateProximity() {
      proximityTicking = false;
      proximityEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        const cx = Math.min(Math.max(mouseX, r.left), r.right);
        const cy = Math.min(Math.max(mouseY, r.top), r.bottom);
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const glow = Math.max(0, 1 - dist / PROX_RANGE);
        el.style.setProperty('--glow', glow.toFixed(3));
        el.classList.toggle('pulse-near', dist < 6);
        if (glow > 0) {
          const px = ((mouseX - r.left) / r.width) * 100;
          const py = ((mouseY - r.top) / r.height) * 100;
          el.style.setProperty('--mx', Math.min(100, Math.max(0, px)) + '%');
          el.style.setProperty('--my', Math.min(100, Math.max(0, py)) + '%');
        }
      });
    }

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!proximityTicking) {
        proximityTicking = true;
        requestAnimationFrame(updateProximity);
      }
    };
    const onScroll = () => {
      if (!proximityTicking) {
        proximityTicking = true;
        requestAnimationFrame(updateProximity);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}
