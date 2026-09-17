import { useEffect } from 'react';

/**
 * Faithful port of:
 *   const header = document.querySelector('header');
 *   window.addEventListener('scroll', ()=>{
 *     header.classList.toggle('scrolled', window.scrollY > 8);
 *   }, { passive:true });
 */
export default function useHeaderScrollShadow() {
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
