import { useEffect } from 'react';

/**
 * Faithful port of the hero visual mouse-tilt effect (desktop/pointer-fine only).
 *
 * Original:
 *   const heroVisual = document.querySelector('.hero-visual');
 *   if(heroVisual && matchMedia('(hover: hover) and (pointer: fine)').matches){
 *     const cards = heroVisual.querySelectorAll('.float-card');
 *     heroVisual.addEventListener('mousemove', (e)=>{ ... rotateX/rotateY per card, depth=(i+1)*4 ... });
 *     heroVisual.addEventListener('mouseleave', ()=>{ cards.forEach(card=>{ card.style.transform=''; }); });
 *   }
 */
export default function useHeroTilt() {
  useEffect(() => {
    const heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const cards = heroVisual.querySelectorAll('.float-card');

    const onMouseMove = (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cards.forEach((card, i) => {
        const depth = (i + 1) * 4;
        card.style.transform = `rotateX(${(-y * depth).toFixed(2)}deg) rotateY(${(x * depth).toFixed(2)}deg)`;
      });
    };

    const onMouseLeave = () => {
      cards.forEach((card) => {
        card.style.transform = '';
      });
    };

    heroVisual.addEventListener('mousemove', onMouseMove);
    heroVisual.addEventListener('mouseleave', onMouseLeave);

    return () => {
      heroVisual.removeEventListener('mousemove', onMouseMove);
      heroVisual.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);
}
