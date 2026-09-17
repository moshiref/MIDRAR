import { useState } from 'react';
import { CheckIcon } from '../../../components/ui/icons';

const TABS = [
  { key: 'merchant', label: 'لوحة التاجر' },
  { key: 'supplier', label: 'بوابة المورد' },
  { key: 'delivery', label: 'عمليات التوصيل' },
];

/**
 * Faithful port of the original `.ptab-btn` / `.ptab-panel` tab switcher —
 * a single `activeTab` piece of React state replaces the manual
 * classList.add/remove('active') dance from the original script.
 */
export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('merchant');

  return (
    <section id="products">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="label">داخل المنظومة</span>
          <h2 className="h1">كل سطح، مصمم لمهمته</h2>
        </div>
        <div className="ptabs-head reveal">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`ptab-btn${activeTab === tab.key ? ' active' : ''}`}
              data-tab={tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`ptab-panel${activeTab === 'merchant' ? ' active' : ''} reveal`} data-panel="merchant">
          <div className="ptab-copy">
            <span className="tagline">لوحة التاجر</span>
            <h3>غرفة تحكم كاملة بمتجرك.</h3>
            <p>مبيعاتك، أرباحك، طلباتك، ومخزونك — كل شي بمكان واحد، بدون ما تفتح عشر تبويبات مختلفة.</p>
            <ul className="feature-list">
              <li><CheckIcon size={15} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> عمليات مباشرة</li>
              <li><CheckIcon size={15} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> تنبيهات مخزون</li>
              <li><CheckIcon size={15} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> تقارير مبيعات</li>
              <li><CheckIcon size={15} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> إدارة فريق العمل</li>
            </ul>
          </div>
          <div className="ptab-mock proximity">
            <div className="hero-panel-head">
              <div className="store-id"><div className="avatar"></div><div className="store-name">متجر لمسة<span>نظرة عامة</span></div></div>
              <span className="live-pill"><span className="dot"></span> متصل</span>
            </div>
            <div className="hero-kpis">
              <div className="kpi"><div className="kpi-label">إجمالي المبيعات</div><div className="kpi-value en">12,480<small>+8%</small></div></div>
              <div className="kpi"><div className="kpi-label">صافي الربح</div><div className="kpi-value en">3,110<small>+5%</small></div></div>
              <div className="kpi"><div className="kpi-label">الطلبات</div><div className="kpi-value en">214</div></div>
              <div className="kpi"><div className="kpi-label">الرصيد المتاح</div><div className="kpi-value en">1,860</div></div>
            </div>
            <div className="mini-chart">
              <svg viewBox="0 0 400 72" preserveAspectRatio="none">
                <path
                  d="M0 52 L40 48 L80 55 L120 34 L160 40 L200 22 L240 30 L280 16 L320 24 L360 10 L400 18"
                  fill="none"
                  stroke="#10B7A0"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className={`ptab-panel${activeTab === 'supplier' ? ' active' : ''}`} data-panel="supplier">
          <div className="ptab-copy">
            <span className="tagline">بوابة المورد</span>
            <h3>مخزونك ومنتجاتك تحت السيطرة.</h3>
            <p>حدّث مخزونك، تابع طلبات التجهيز، وراقب أداء منتجاتك عبر شبكة متاجر مدرار كلها من مكان واحد.</p>
            <ul className="feature-list">
              <li><CheckIcon size={15} stroke="var(--brand-blue)" strokeWidth={2.4} /> طلبات تحتاج تجهيز</li>
              <li><CheckIcon size={15} stroke="var(--brand-blue)" strokeWidth={2.4} /> مخزون منخفض</li>
              <li><CheckIcon size={15} stroke="var(--brand-blue)" strokeWidth={2.4} /> تسويات واضحة</li>
              <li><CheckIcon size={15} stroke="var(--brand-blue)" strokeWidth={2.4} /> تقارير أداء</li>
            </ul>
          </div>
          <div className="ptab-mock proximity">
            <div className="hero-panel-head">
              <div className="store-id">
                <div className="avatar" style={{ background: 'linear-gradient(135deg,#2E8CF5,#063C8C)' }}></div>
                <div className="store-name">مصنع الأناقة<span>بوابة المورد</span></div>
              </div>
              <span className="live-pill" style={{ color: '#B8791A', background: 'rgba(184,121,26,0.1)' }}>
                <span className="dot" style={{ background: '#B8791A' }}></span> 6 طلبات تجهيز
              </span>
            </div>
            <div className="order-row">
              <div className="icon tile3d blue tile-38">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                  <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              </div>
              <div className="info"><div className="t">طقم كنب ٣ قطع</div><div className="s">مخزون: 4 قطع متبقية</div></div>
              <div className="amt en">low</div>
            </div>
            <div className="order-divider"></div>
            <div className="order-row">
              <div className="icon tile3d navy tile-38">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 10h18" />
                </svg>
              </div>
              <div className="info"><div className="t">طاولة طعام خشب</div><div className="s">جاهزة للشحن</div></div>
              <div className="amt en">Ok</div>
            </div>
          </div>
        </div>

        <div className={`ptab-panel${activeTab === 'delivery' ? ' active' : ''}`} data-panel="delivery">
          <div className="ptab-copy">
            <span className="tagline">عمليات التوصيل</span>
            <h3>من التجهيز للتسليم، بخطوة بخطوة.</h3>
            <p>تابع كل طلب من لحظة التجهيز، مرورًا بالاستلام والتوصيل، وحتى تسوية المبالغ المحصّلة نقدًا.</p>
            <ul className="feature-list">
              <li><CheckIcon size={15} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> مسارات توصيل</li>
              <li><CheckIcon size={15} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> تحصيل عند الاستلام</li>
              <li><CheckIcon size={15} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> إثبات تسليم</li>
              <li><CheckIcon size={15} stroke="var(--brand-teal-deep)" strokeWidth={2.4} /> تسويات دورية</li>
            </ul>
          </div>
          <div className="ptab-mock proximity">
            <div className="hero-panel-head">
              <div className="store-id">
                <div className="avatar" style={{ background: 'linear-gradient(135deg,#3EE6C4,#0A7A6C)' }}></div>
                <div className="store-name">فريق التوصيل<span>دمشق · اليوم</span></div>
              </div>
              <span className="live-pill"><span className="dot"></span> 12 قيد التنفيذ</span>
            </div>
            <div className="order-row">
              <div className="icon tile3d teal tile-38">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <div className="info"><div className="t">تسليم ناجح · #MD-20430</div><div className="s">المزة · قبل 10 د</div></div>
              <div className="amt en">115</div>
            </div>
            <div className="order-divider"></div>
            <div className="order-row">
              <div className="icon tile3d navy tile-38">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                  <path d="M3 16V6a1 1 0 011-1h9v11H3z" /><path d="M13 9h4l4 4v3h-8z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
                </svg>
              </div>
              <div className="info"><div className="t">خرج للتوصيل · #MD-20477</div><div className="s">كفرسوسة</div></div>
              <div className="amt en">115</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
