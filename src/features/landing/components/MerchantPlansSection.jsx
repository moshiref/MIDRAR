import { Fragment } from 'react';
import { CheckIcon } from '../../../components/ui/icons';
import Button from '../../../components/ui/Button';
import { PACKAGES, PLAN_TILE_COLORS } from '../data/merchantPlans';
import { getPackageById, getNextPackage, sumQualifyingSales, calculateCurrencyProgress } from '../data/packageLogic';
import { MOCK_CURRENT_PACKAGE_ID, MOCK_MERCHANT_ORDERS } from '../data/mockMerchantProgress';

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

/**
 * "باقتك الحالية" — a demo panel, not a real per-user account view (the
 * landing page has no auth/merchant session). Reads MOCK_CURRENT_PACKAGE_ID
 * + MOCK_MERCHANT_ORDERS (mockMerchantProgress.js) through the exact same
 * packageLogic.js functions a real API-backed version would use later, so
 * only the data source changes when that exists — not this component.
 */
function CurrentPackagePanel() {
  const currentPackage = getPackageById(MOCK_CURRENT_PACKAGE_ID);
  if (!currentPackage) return null;

  const nextPackage = getNextPackage(currentPackage.id);
  const { usd, syp } = sumQualifyingSales(MOCK_MERCHANT_ORDERS);
  const progress = nextPackage
    ? calculateCurrencyProgress({ usdSales: usd, sypSales: syp, pkg: currentPackage })
    : null;
  const progressPercent = progress ? Math.min(100, progress.combinedProgressPercent) : 100;

  return (
    <div className="current-package-panel reveal">
      <span className="current-package-tag">باقتك الحالية</span>
      <div className="current-package-head">
        <h3>{currentPackage.name}</h3>
        <span className="current-package-status">متاحة حاليًا · مفتوحة</span>
      </div>

      <ul className="plan-stats">
        <li><span className="k">العمولة</span><span className="v en">{currentPackage.commissionRate}%</span></li>
        <li><span className="k">القوالب</span><span className="v">{formatTemplatesLabel(currentPackage)}</span></li>
        <li><span className="k">تغطية فشل التسليم</span><span className="v">{formatDeliveryCoverageLabel(currentPackage.failedDeliveryQuota)}</span></li>
      </ul>

      <div className="plan-example current-package-sales">
        <div className="row"><span className="k">المبيعات المؤهلة (دولار)</span><span className="v en">${usd.toLocaleString('en-US')}</span></div>
        <div className="row"><span className="k">المبيعات المؤهلة (ليرة سورية جديدة)</span><span className="v en">{syp.toLocaleString('en-US')}</span></div>
      </div>

      {nextPackage && progress ? (
        <div className="current-package-progress">
          <div className="progress-label-row">
            <span>تقدمك نحو باقة {nextPackage.name}</span>
            <span className="en">{progressPercent}%</span>
          </div>
          <div className="plan-progress-track">
            <div className="plan-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="current-package-remaining">
            متبقي للوصول: <span className="en">${progress.remainingUsd.toLocaleString('en-US')}</span> أو{' '}
            <span className="en">{progress.remainingSyp.toLocaleString('en-US')}</span> ليرة سورية جديدة (أو مزيج من العملتين).
          </p>
        </div>
      ) : (
        <p className="current-package-remaining">أنت في أعلى مستوى متاح حاليًا — لا توجد باقة أعلى من الماسية.</p>
      )}

      <div className="current-package-benefits">
        <h4>المزايا المفتوحة</h4>
        <ul className="plan-features">
          {currentPackage.benefits.map((benefit) => (
            <li key={benefit}>
              <CheckIcon size={14} stroke="var(--brand-teal-deep)" strokeWidth={2.4} />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function MerchantPlansSection() {
  return (
    <section id="plans">
      <div className="wrap">
        <div className="section-head center reveal">
          <span className="label">باقات التجار</span>
          <h2 className="h1">باقاتك تتطور مع تجارتك</h2>
          <p className="plans-intro body-lg">
            ابدأ بالباقة الأساسية، ومع نمو مبيعاتك تفتح مستويات ومزايا إضافية تلقائيًا.
          </p>
          <span className="eyebrow plans-note">
            <span className="dot"></span> لا توجد رسوم اشتراك للترقية — مستوى التاجر يعتمد على المبيعات المكتملة.
          </span>
        </div>

        <CurrentPackagePanel />

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

        <div className="plan-example reveal" style={{ maxWidth: '480px', marginInline: 'auto' }}>
          <div className="row"><span className="k">مبيعات مكتملة (دولار)</span><span className="v">100$</span></div>
          <div className="row"><span className="k">من هدف الأساسية (200$)</span><span className="v">50%</span></div>
          <div className="row"><span className="k">مبيعات مكتملة (ليرة سورية جديدة)</span><span className="v">13,000</span></div>
          <div className="row"><span className="k">من هدف الأساسية (26,000)</span><span className="v">50%</span></div>
          <div className="row total"><span className="k">إجمالي التقدم نحو الباقة الفضية</span><span className="v">100%</span></div>
        </div>
        <p className="plans-intro body" style={{ marginTop: '18px' }}>
          يتم احتساب المبيعات المكتملة الصافية فقط — لا تُحتسب الطلبات الملغاة ولا الطلبات المرتجعة. يدعم النظام
          عملتين معًا (الدولار والليرة السورية الجديدة)، ويُجمع تقدّمك بجمع نسبة مبيعات كل عملة إلى هدفها كما بالمثال
          أعلاه. وعند بلوغ الحد، تُفتح الباقة الجديدة فورًا للطلبات اللاحقة، ولا تُعاد عمولات الطلبات السابقة.
        </p>

        <div className="plan-info-grid">
          <div className="plan-info-card reveal">
            <h4>كيف تُحسب العمولة؟</h4>
            <p>عمولة مدرار تُحسب من ربح التاجر فوق سعر التوريد فقط، وليس من كامل سعر المنتج أو رسوم التوصيل.</p>
            <div className="plan-example">
              <div className="row"><span className="k">سعر التوريد</span><span className="v">100$</span></div>
              <div className="row"><span className="k">سعر بيع التاجر</span><span className="v">130$</span></div>
              <div className="row"><span className="k">ربح التاجر</span><span className="v">30$</span></div>
              <div className="row"><span className="k">نسبة العمولة (مثال)</span><span className="v">10%</span></div>
              <div className="row total"><span className="k">عمولة مدرار</span><span className="v">3$</span></div>
            </div>
            <p style={{ marginTop: '10px', fontSize: '0.78rem' }}>
              هذا المثال فقط لتوضيح طريقة الحساب. عمولة المورد منفصلة عن هذا النظام.
            </p>
          </div>

          <div className="plan-info-card reveal">
            <h4>تغطية فشل التسليم</h4>
            <p>تغطية مدرار تخص رسوم الذهاب والعودة فقط، ولا تشمل ثمن المنتج. تختلف الحصة الشهرية حسب باقتك (3 - 5 - 8 - 12 حالة).</p>
            <p>وفي كل الباقات، يتم قبول الحالة بعد:</p>
            <ul>
              <li><CheckIcon size={14} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> توثيق محاولات التسليم.</li>
              <li><CheckIcon size={14} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> التحقق من عدم وجود خطأ من التاجر.</li>
              <li><CheckIcon size={14} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> التحقق من عدم وجود خطأ من المورد.</li>
              <li><CheckIcon size={14} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> التحقق من عدم وجود خطأ من شركة التوصيل.</li>
              <li><CheckIcon size={14} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> التأكد من عدم وجود إساءة استخدام.</li>
            </ul>
            <p style={{ marginTop: '10px', fontSize: '0.78rem' }}>الحالات غير المستخدمة لا تنتقل إلى الشهر التالي.</p>
          </div>
        </div>

        <div className="plans-cta reveal">
          <p className="body-lg">ابدأ بالباقة الأساسية اليوم، ودع مبيعاتك تفتح لك باقي المستويات تلقائيًا.</p>
          <Button href="/open-store" variant="primary" size="lg">ابدأ تجارتك</Button>
        </div>
      </div>
    </section>
  );
}
