import Button from '../../../components/ui/Button';

/**
 * "هل لديك شركة توصيل؟" — a single standalone banner built on `.panel`
 * (same shape/padding MerchantSupplierSplit's panels use), with its own
 * `.logistics-panel` background override matching the floating "انضم
 * إلينا" CTA's teal→blue gradient (FloatingJoinCta / `.floating-join
 * -cta`), so the two "join us" touchpoints on the page read as the same
 * visual family. Text/tag colors borrow `.panel-merchant`'s light-on
 * -dark treatment since the gradient is just as saturated as navy.
 * Placed directly before FinalCta on purpose — same visual weight/rhythm
 * as the banner that follows it, not a competing "different template"
 * look.
 *
 * The CTA links to `/logistics-partner`
 * (src/features/logistics-partner/LogisticsPartnerApplicationPage.jsx) —
 * a frontend-only application wizard; there's still no real backend, so
 * the submission just goes through the same applicationsStorage.js
 * contract the /open-store flow already uses.
 */
export default function LogisticsPartnerSection() {
  return (
    <section id="logistics-partner">
      <div className="wrap">
        <div className="panel panel-merchant proximity logistics-panel reveal">
          <div className="icon tile3d glass tile-64">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
              <path d="M3 16V6a1 1 0 011-1h9v11H3z" />
              <path d="M13 9h4l4 4v3h-8z" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
          </div>
          <span className="panel-tag">شريك لوجستي</span>
          <h3>هل لديك شركة توصيل؟</h3>
          <p className="desc">
            هل تمتلك شركة توصيل وتغطي مناطق داخل الجمهورية العربية السورية؟{' '}
            <strong>انضم إلى مدرار كشريك لوجستي</strong> وساهم في توصيل طلبات التجار إلى عملائهم في مختلف المناطق.
          </p>
          <Button href="/logistics-partner" variant="ghost-inverse" size="lg">انضم كشريك لوجستي</Button>
        </div>
      </div>
    </section>
  );
}
