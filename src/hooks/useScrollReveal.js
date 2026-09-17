import { useEffect } from 'react';

/**
 * Faithful port of the original inline script's "reveal on scroll" behavior.
 * Any element carrying the `.reveal` class (and not yet `.in`) fades/slides
 * into place once it crosses the viewport threshold, then is left alone.
 *
 * Original:
 *   const revealEls = document.querySelectorAll('.reveal:not(.in)');
 *   const io = new IntersectionObserver((entries)=>{
 *     entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
 *   }, {threshold:0.12});
 *   revealEls.forEach(el=>io.observe(el));
 */
export default function useScrollReveal() {
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal:not(.in)');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);
}
