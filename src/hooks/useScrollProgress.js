import { useEffect } from 'react';

/**
 * Faithful port of the top scroll-progress bar:
 *   const scrollProgress = document.getElementById('scrollProgress');
 *   function updateScrollProgress(){
 *     const h = document.documentElement;
 *     const scrolled = h.scrollTop;
 *     const max = h.scrollHeight - h.clientHeight;
 *     const pct = max > 0 ? (scrolled / max) * 100 : 0;
 *     scrollProgress.style.width = pct + '%';
 *   }
 *   window.addEventListener('scroll', updateScrollProgress, { passive:true });
 *   updateScrollProgress();
 */
export default function useScrollProgress() {
  useEffect(() => {
    const scrollProgress = document.getElementById('scrollProgress');
    if (!scrollProgress) return;

    function updateScrollProgress() {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);
}
