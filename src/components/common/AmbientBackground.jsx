import { useRef } from 'react';
import useAmbientParticles from '../../hooks/useAmbientParticles';
import useCursorGlow from '../../hooks/useCursorGlow';

/**
 * The two fixed, page-wide ambient effects from the original markup:
 *   <canvas id="bgCanvas"></canvas>
 *   <div id="cursorGlow"></div>
 * Mounted once at the layout root, exactly like the original (they sit
 * right at the top of <body>, before <header>).
 */
export default function AmbientBackground() {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useAmbientParticles(canvasRef);
  useCursorGlow(glowRef);

  return (
    <>
      <canvas id="bgCanvas" ref={canvasRef}></canvas>
      <div id="cursorGlow" ref={glowRef}></div>
    </>
  );
}
