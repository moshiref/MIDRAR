import { useEffect } from 'react';

/**
 * Faithful port of the magnetic-button hover effect on primary/secondary/
 * ghost-inverse buttons (desktop pointer-fine only, skipped under
 * prefers-reduced-motion).
 */
export default function useMagneticButtons() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (
      prefersReducedMotion ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }

    const buttons = document.querySelectorAll(
      '.btn-primary, .btn-secondary, .btn-ghost-inverse'
    );

    const handlers = [];

    buttons.forEach((btn) => {
      const onMouseMove = (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${(x * 0.18).toFixed(1)}px, ${(y * 0.28).toFixed(1)}px)`;
      };
      const onMouseLeave = () => {
        btn.style.transform = '';
      };
      btn.addEventListener('mousemove', onMouseMove);
      btn.addEventListener('mouseleave', onMouseLeave);
      handlers.push({ btn, onMouseMove, onMouseLeave });
    });

    return () => {
      handlers.forEach(({ btn, onMouseMove, onMouseLeave }) => {
        btn.removeEventListener('mousemove', onMouseMove);
        btn.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);
}
