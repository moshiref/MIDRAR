import { Fragment } from 'react';
import { CheckIcon } from '../../../components/ui/icons';
import Button from '../../../components/ui/Button';
import { MERCHANT_PLANS, PLAN_TILE_COLORS } from '../data/merchantPlans';

/** Generic tier/medal glyph — same icon for every node, only the tile color changes, so the progression reads through color/position rather than five unrelated icons. */
function TierIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
      <circle cx="12" cy="8" r="5" />
      <path d="M9 12.5L7 21l5-3 5 3-2-8.5" />
    </svg>
  );
}

function PlanCard({ plan }) {
  return (
    <article className={`plan-card proximity${plan.isFree ? ' is-free' : ''}`}>
      {plan.badge && <span className="plan-badge">{plan.badge}</span>}
      <h3>{plan.name}</h3>
      <p className="plan-access">{plan.accessLabel}</p>
      <ul className="plan-stats">
        <li><span className="k">العمولة</span><span className="v en">{plan.commissionRate}%</span></li>
        <li><span className="k">القوالب</span><span className="v">{plan.templates}</span></li>
        <li><span className="k">تغطية فشل التسليم</span><span className="v">{plan.failedDeliveryCoverageLabel}</span></li>
      </ul>
      <ul className="plan-features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <CheckIcon size={14} stroke="var(--brand-teal-deep)" strokeWidth={2.4} />
            {feature}
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
        <div className="section-head center reveal">
          <span className="label">باقات التجار</span>
          <h2 className="h1">باقاتك تتطور مع تجارتك</h2>
          <p className="plans-intro body-lg">
            ابدأ مجانًا، ومع نمو مبيعاتك تفتح مستويات ومزايا إضافية تلقائيًا.
          </p>
          <span className="eyebrow plans-note">
            <span className="dot"></span> لا توجد رسوم اشتراك للترقية — مستوى التاجر يعتمد على المبيعات المكتملة.
          </span>
        </div>

        <div className="plans-grid reveal" role="region" aria-label="باقات التجار الخمس" tabIndex={0}>
          {MERCHANT_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <span className="plans-scroll-hint">مرّر لاستكشاف باقي الباقات ←</span>

        <div className="plans-subhead reveal">
          <h3>كيف تنتقل من باقة إلى أخرى؟</h3>
          <p>الانتقال يحدث تلقائيًا مع نمو مبيعاتك المكتملة، وليس بالدفع.</p>
        </div>

        <div className="flow reveal">
          {MERCHANT_PLANS.map((plan, i) => (
            <Fragment key={plan.id}>
              <div className="flow-node">
                <div className={`icon-ring tile3d ${PLAN_TILE_COLORS[i]} tile-64`}>
                  <TierIcon />
                </div>
                <div className="ftitle">{plan.name}</div>
                <div className="fsub">{plan.commissionRate}% عمولة</div>
              </div>
              {i < MERCHANT_PLANS.length - 1 && (
                <div className="flow-connector">
                  <span className="pulse" style={{ animationDelay: `${i * 0.5}s` }}></span>
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <p className="flow-note">مسار النمو: الأهلية ← الأساسية ← الفضية ← الذهبية ← الماسية</p>

        <div className="plan-example reveal" style={{ maxWidth: '480px', marginInline: 'auto' }}>
          <div className="row"><span className="k">مبيعات مكتملة (دولار)</span><span className="v">100$</span></div>
          <div className="row"><span className="k">من هدف الأساسية (200$)</span><span className="v">50%</span></div>
          <div className="row"><span className="k">مبيعات مكتملة (ليرة سورية جديدة)</span><span className="v">13,000</span></div>
          <div className="row"><span className="k">من هدف الأساسية (26,000)</span><span className="v">50%</span></div>
          <div className="row total"><span className="k">إجمالي التقدم نحو الباقة الأساسية</span><span className="v">100%</span></div>
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
            <p>تغطية مدرار تخص رسوم الذهاب والعودة فقط، ولا تشمل ثمن المنتج. الباقة الأهلية: 0 حالات.</p>
            <p>وفي الباقات الأخرى، يتم قبول الحالة بعد:</p>
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
          <p className="body-lg">ابدأ بالباقة المجانية اليوم، ودع مبيعاتك تفتح لك باقي المستويات تلقائيًا.</p>
          <Button href="/open-store" variant="primary" size="lg">ابدأ تجارتك</Button>
        </div>
      </div>
    </section>
  );
}
