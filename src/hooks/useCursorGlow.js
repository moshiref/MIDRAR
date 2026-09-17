import { useEffect } from 'react';

/**
 * Faithful port of the cursor-following ambient glow (#cursorGlow):
 * lerps smoothly toward the cursor position and stops its own rAF loop
 * once it settles, restarting on the next mousemove. Disabled under
 * prefers-reduced-motion or on touch/coarse-pointer devices.
 */
export default function useCursorGlow(glowRef) {
  useEffect(() => {
    const glow = glowRef.current;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (
      !glow ||
      prefersReducedMotion ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }

    let tx = -9999,
      ty = -9999,
      cx = -9999,
      cy = -9999;
    let active = false;
    let rafId = null;

    function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px)`;
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
        rafId = requestAnimationFrame(loop);
      } else {
        active = false;
      }
    }

    const onMouseMove = (e) => {
      tx = e.clientX - 260;
      ty = e.clientY - 260;
      if (!active) {
        active = true;
        rafId = requestAnimationFrame(loop);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [glowRef]);
}
