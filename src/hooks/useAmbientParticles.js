import { useEffect } from 'react';

/**
 * Faithful port of the #bgCanvas particle background: scattered,
 * brand-colored dots that drift, gently repel from the cursor, and draw
 * connecting lines when close to one another. Draws a single static frame
 * under prefers-reduced-motion instead of animating.
 */
export default function useAmbientParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particlesArr = [];
    const colors = ['16,183,160', '10,99,214', '62,230,196', '46,140,245'];
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.round((w * h) / 22000));
      particlesArr = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 2 + 0.6,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * 0.35 + 0.15,
      }));
    }

    let pmx = -9999;
    let pmy = -9999;
    const onMouseMove = (e) => {
      pmx = e.clientX;
      pmy = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let rafId = null;

    function step() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particlesArr.length; i++) {
        const p = particlesArr[i];
        p.x += p.vx;
        p.y += p.vy;
        const dx = p.x - pmx;
        const dy = p.y - pmy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) {
          const d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * 0.12;
          p.y += (dy / d) * 0.12;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        for (let j = i + 1; j < particlesArr.length; j++) {
          const q = particlesArr[j];
          const ddx = p.x - q.x;
          const ddy = p.y - q.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(${p.c},${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (const p of particlesArr) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!prefersReducedMotion) rafId = requestAnimationFrame(step);
    }

    let resizeTO;
    const onResize = () => {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(resize, 150);
    };
    window.addEventListener('resize', onResize);

    const onVisibilityChange = () => {
      if (!document.hidden && !prefersReducedMotion) {
        rafId = requestAnimationFrame(step);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    resize();
    if (prefersReducedMotion) {
      step(); // draw one static frame, no animation loop
    } else {
      rafId = requestAnimationFrame(step);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearTimeout(resizeTO);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [canvasRef]);
}
