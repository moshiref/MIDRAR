import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router's client-side navigation doesn't reset scroll position
 * the way a full page load does — without this, clicking an internal
 * link (e.g. "ابدأ تجارتك" → /open-store) from partway down a scrolled
 * page lands the new route at that same scroll offset instead of its
 * own top. Mounted once inside <BrowserRouter>, above <Routes>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
