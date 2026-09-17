import { Outlet } from 'react-router-dom';
import AmbientBackground from '../common/AmbientBackground';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import useScrollReveal from '../../hooks/useScrollReveal';
import useHeaderScrollShadow from '../../hooks/useHeaderScrollShadow';
import useScrollSpy from '../../hooks/useScrollSpy';
import useAnimatedCounters from '../../hooks/useAnimatedCounters';
import useScrollProgress from '../../hooks/useScrollProgress';
import useProximityGlow from '../../hooks/useProximityGlow';
import useMagneticButtons from '../../hooks/useMagneticButtons';

/**
 * Shell for every public-facing page (landing page today; storefront pages
 * later). Owns the page-wide effects that, in the original single HTML
 * file, ran once against the whole document after it finished parsing:
 * scroll-reveal, header shadow, scroll-spy, animated counters, the top
 * scroll-progress bar, proximity glow and magnetic buttons. Because these
 * hooks run here (the parent), React has already committed the header,
 * the routed page content and the footer by the time their effects fire —
 * exactly mirroring the original script running after the full body was
 * in the DOM.
 */
export default function PublicLayout() {
  useScrollReveal();
  useHeaderScrollShadow();
  useScrollSpy();
  useAnimatedCounters();
  useScrollProgress();
  useProximityGlow();
  useMagneticButtons();

  return (
    <>
      <AmbientBackground />
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
