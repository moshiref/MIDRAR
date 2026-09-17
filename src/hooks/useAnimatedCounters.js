import { useEffect } from 'react';

/**
 * Faithful port of the KPI / stat count-up animation.
 * Targets: .kpi-value, .hero-proof-stat .num, .float-badge .big
 * Parses the existing text for a numeric portion, keeps any prefix/suffix
 * (like "+", "%", "<small>" content is untouched since we only rewrite
 * the element's direct text via textContent, exactly like the original),
 * and eases from 0 to that number once the element scrolls into view.
 */
export default function useAnimatedCounters() {
  useEffect(() => {
    function animateCount(el) {
      const raw = el.textContent.trim();
      const match = raw.match(/[\d,.]+/);
      if (!match) return;
      const target = parseFloat(match[0].replace(/,/g, ''));
      if (isNaN(target)) return;
      const suffix = raw.replace(match[0], '');
      const prefix = raw.slice(0, raw.indexOf(match[0]));
      const duration = 1100;
      const start = performance.now();

      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = prefix + val.toLocaleString('en-US') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const counterTargets = document.querySelectorAll(
      '.kpi-value, .hero-proof-stat .num, .float-badge .big'
    );

    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counterTargets.forEach((el) => counterIO.observe(el));

    return () => counterIO.disconnect();
  }, []);
}
