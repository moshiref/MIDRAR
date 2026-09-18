import { Fragment } from 'react';
import { CheckIcon } from '../../../components/ui/icons';
import Button from '../../../components/ui/Button';
import { PACKAGES, PLAN_TILE_COLORS } from '../data/merchantPlans';

/** Generic tier/medal glyph — same icon for every node, only the tile color changes, so the progression reads through color/position rather than unrelated icons. */
function TierIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
      <circle cx="12" cy="8" r="5" />
      <path d="M9 12.5L7 21l5-3 5 3-2-8.5" />
    </svg>
  );
}

function formatAccessLabel(pkg) {
  return `${pkg.usdTarget.toLocaleString('en-US')} دولار أو ${pkg.sypTarget.toLocaleString('en-US')} ليرة سورية جديدة`;
}

function formatTemplatesLabel(pkg) {
  if (typeof pkg.templateCount !== 'number') return pkg.templateCount;
  return pkg.id === 'basic' ? `${pkg.templateCount} قالبًا أساسيًا` : `${pkg.templateCount} قالبًا`;
}

function formatDeliveryCoverageLabel(quota) {
  const noun = quota >= 11 ? 'حالة' : 'حالات';
  return `${quota} ${noun} شهريًا`;
}

function PlanCard({ pkg }) {
  return (
    <article className="plan-card proximity">
      <h3>{pkg.name}</h3>
      <p className="plan-access">{formatAccessLabel(pkg)}</p>
      <ul className="plan-stats">
        <li><span className="k">العمولة</span><span className="v en">{pkg.commissionRate}%</span></li>
        <li><span className="k">القوالب</span><span className="v">{formatTemplatesLabel(pkg)}</span></li>
        <li><span className="k">تغطية فشل التسليم</span><span className="v">{formatDeliveryCoverageLabel(pkg.failedDeliveryQuota)}</span></li>
      </ul>
      <ul className="plan-features">
        {pkg.benefits.map((benefit) => (
          <li key={benefit}>
            <CheckIcon size={14} stroke="var(--brand-teal-deep)" strokeWidth={2.4} />
            {benefit}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function MerchantPlansSection() {
  return (
    <section id="plans">
      <div className="wrap">
        <div className="plans-grid reveal" role="region" aria-label="باقات التجار" tabIndex={0}>
          {PACKAGES.map((pkg) => (
            <PlanCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
        <span className="plans-scroll-hint">مرّر لاستكشاف باقي الباقات ←</span>

        <div className="plans-subhead reveal">
          <h3>كيف تنتقل من باقة إلى أخرى؟</h3>
          <p>الانتقال يحدث تلقائيًا مع نمو مبيعاتك المكتملة، وليس بالدفع.</p>
        </div>

        <div className="flow reveal">
          {PACKAGES.map((pkg, i) => (
            <Fragment key={pkg.id}>
              <div className="flow-node">
                <div className={`icon-ring tile3d ${PLAN_TILE_COLORS[i]} tile-64`}>
                  <TierIcon />
                </div>
                <div className="ftitle">{pkg.name}</div>
                <div className="fsub">{pkg.commissionRate}% عمولة</div>
              </div>
              {i < PACKAGES.length - 1 && (
                <div className="flow-connector">
                  <span className="pulse" style={{ animationDelay: `${i * 0.5}s` }}></span>
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <p className="flow-note">مسار النمو: الأساسية ← الفضية ← الذهبية ← الماسية</p>

        <div className="plans-cta reveal">
          <p className="body-lg">ابدأ بالباقة الأساسية اليوم، ودع مبيعاتك تفتح لك باقي المستويات تلقائيًا.</p>
          <Button href="/open-store" variant="primary" size="lg">ابدأ تجارتك</Button>
        </div>
      </div>
    </section>
  );
}
