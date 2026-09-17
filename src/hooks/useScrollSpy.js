import { useEffect } from 'react';

/**
 * Faithful port of the original scroll-spy behavior: whichever section is
 * currently centered in the viewport gets its matching [data-nav] link
 * marked `.active`.
 *
 * Original:
 *   const navAnchors = document.querySelectorAll('[data-nav]');
 *   const spySections = Array.from(navAnchors).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
 *   const spyIO = new IntersectionObserver((entries)=>{
 *     entries.forEach(entry=>{
 *       const id = '#' + entry.target.id;
 *       const link = document.querySelector(`[data-nav][href="${id}"]`);
 *       if(!link) return;
 *       if(entry.isIntersecting){
 *         navAnchors.forEach(a=>a.classList.remove('active'));
 *         link.classList.add('active');
 *       }
 *     });
 *   }, { rootMargin: '-45% 0px -50% 0px' });
 *   spySections.forEach(sec=>spyIO.observe(sec));
 */
export default function useScrollSpy() {
  useEffect(() => {
    const navAnchors = document.querySelectorAll('[data-nav]');
    const spySections = Array.from(navAnchors)
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    const spyIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = '#' + entry.target.id;
          const link = document.querySelector(`[data-nav][href="${id}"]`);
          if (!link) return;
          if (entry.isIntersecting) {
            navAnchors.forEach((a) => a.classList.remove('active'));
            link.classList.add('active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    spySections.forEach((sec) => spyIO.observe(sec));

    return () => spyIO.disconnect();
  }, []);
}
