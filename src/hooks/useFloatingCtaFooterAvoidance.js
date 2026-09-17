import { useEffect, useState } from 'react';

/**
 * Fades the floating "انضم إلينا" CTA out while the footer is in view, so
 * the fixed-position button never sits on top of footer content/links.
 * Same IntersectionObserver approach as the page's other scroll-driven
 * UI toggles (useHeaderScrollShadow, useScrollSpy).
 */
export default function useFloatingCtaFooterAvoidance() {
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setNearFooter(entry.isIntersecting),
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return nearFooter;
}
