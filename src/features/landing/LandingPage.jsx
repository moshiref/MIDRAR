import HeroSection from './components/HeroSection';
import WaveDivider from '../../components/common/WaveDivider';
import TrustStrip from './components/TrustStrip';
import CompareSection from './components/CompareSection';
import EcosystemFlow from './components/EcosystemFlow';
import LiveOrdersSection from './components/LiveOrdersSection';
import ValueBentoGrid from './components/ValueBentoGrid';
import ProductTabs from './components/ProductTabs';
import HowItWorksTimeline from './components/HowItWorksTimeline';
import MerchantSupplierSplit from './components/MerchantSupplierSplit';
import SecurityGrid from './components/SecurityGrid';
import FaqAccordion from './components/FaqAccordion';
import FinalCta from './components/FinalCta';
import useHeroTilt from '../../hooks/useHeroTilt';

/**
 * The MIDRAR landing page, assembled from the same sections and in the
 * same order as the original single HTML file's <body>: hero, wave
 * divider, trust strip, compare, ecosystem flow, live orders, value
 * bento grid, product tabs, how-it-works timeline, merchant/supplier
 * split, security grid, FAQ, final CTA. Header/footer/ambient background
 * and the page-wide effect hooks live in PublicLayout.
 */
export default function LandingPage() {
  useHeroTilt();

  return (
    <>
      <HeroSection />
      <WaveDivider />
      <TrustStrip />
      <CompareSection />
      <EcosystemFlow />
      <LiveOrdersSection />
      <ValueBentoGrid />
      <ProductTabs />
      <HowItWorksTimeline />
      <MerchantSupplierSplit />
      <SecurityGrid />
      <FaqAccordion />
      <FinalCta />
    </>
  );
}
