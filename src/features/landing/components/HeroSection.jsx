import logoMark from '../../../assets/logo-mark.png';
import Button from '../../../components/ui/Button';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="mesh"></div>
      <img className="logo-watermark wm-hero" src={logoMark} alt="" />
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy reveal in">
            <span className="eyebrow"><span className="dot"></span> بنية تشغيلية جاهزة للتجارة الإلكترونية</span>
            <h1 className="display">
              ابدأ تجارتك، <br /> و<span className="accent">مدرار</span> تتولى البنية.
            </h1>
            <p className="body-lg">
              أنشئ متجرك الإلكتروني المستقل، اختر منتجاتك من شبكة الموردين، وابدأ البيع دون الحاجة إلى بناء مخزون كبير
              مسبقًا. مدرار تجمع لك التقنية والتوريد والتشغيل والتوصيل ضمن منظومة واحدة.
            </p>
            <div className="hero-actions">
              <Button href="/open-store" variant="primary" size="lg">انضم إلينا</Button>
              <Button href="#how" variant="secondary" size="lg">اكتشف كيف تعمل مدرار</Button>
            </div>
            <div className="hero-proof">
              <div className="hero-proof-stat"><div className="num en">+40</div><div className="cap">قطاع نشاط مدعوم</div></div>
              <div className="hero-proof-div"></div>
              <div className="hero-proof-stat"><div className="num en">24/7</div><div className="cap">متابعة الطلبات</div></div>
              <div className="hero-proof-div"></div>
              <div className="hero-proof-stat"><div className="num en">0</div><div className="cap">حاجة لمخزون مسبق</div></div>
            </div>
          </div>

          <div className="hero-visual reveal in" style={{ transitionDelay: '.15s' }}>
            <div className="float-card proximity hero-panel-main">
              <div className="hero-panel-head">
                <div className="store-id">
                  <div className="avatar"></div>
                  <div className="store-name">متجر لمسة<span>لوحة التاجر</span></div>
                </div>
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
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#10B7A0" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#10B7A0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 52 L40 48 L80 55 L120 34 L160 40 L200 22 L240 30 L280 16 L320 24 L360 10 L400 18 L400 72 L0 72 Z"
                    fill="url(#chartFill)"
                  />
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

            <div className="float-card proximity float-card-order">
              <div className="order-row">
                <div className="icon tile3d teal tile-38">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div className="info"><div className="t">طلب جديد مؤكد</div><div className="s">#MD-20481 · قيد التجهيز</div></div>
                <div className="amt en">240</div>
              </div>
              <div className="order-divider"></div>
              <div className="order-row">
                <div className="icon tile3d blue tile-38">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M3 16V6a1 1 0 011-1h9v11H3z" /><path d="M13 9h4l4 4v3h-8z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>
                </div>
                <div className="info"><div className="t">خرج للتوصيل</div><div className="s">#MD-20477 · دمشق</div></div>
                <div className="amt en">115</div>
              </div>
            </div>

            <div className="float-card proximity float-badge">
              <div className="big en">+18%</div>
              <div className="small">نمو الطلبات هالشهر</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
