export default function ValueBentoGrid() {
  return (
    <section id="value">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="label">لماذا مدرار</span>
          <h2 className="h1">كل ما تحتاجه لتبدأ تجارتك من مكان واحد</h2>
        </div>
        <div className="bento reveal">
          <div className="card card-feature proximity">
            <div>
              <div className="icon tile3d glass tile-56">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
                  <path d="M3 9l9-6 9 6v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
                </svg>
              </div>
              <h3>متجرك باسمك</h3>
              <p>أنشئ متجرًا مستقلًا بهويتك وشعارك، واجعل العميل يتعامل مع علامتك مباشرة من أول لحظة يفتح فيها الرابط.</p>
            </div>
            <div className="ribbon-accent">
              <svg viewBox="0 0 260 60" fill="none">
                <path
                  d="M4 40C24 12 44 12 62 32C80 52 100 52 118 30C136 8 156 8 174 26C192 44 212 44 230 22C240 11 248 8 256 8"
                  stroke="url(#ribbonGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="ribbonGrad" x1="4" y1="20" x2="256" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3EE6C4" /><stop offset="1" stopColor="#2E8CF5" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="card area-a proximity">
            <div className="icon tile3d blue tile-56">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
              </svg>
            </div>
            <h3>ابدأ بمخاطر أقل</h3>
            <p>ابدأ البيع من مجموعة منتجات متاحة دون الحاجة إلى بناء مخزون ضخم قبل اختبار السوق.</p>
          </div>

          <div className="card area-b proximity">
            <div className="icon tile3d teal tile-56">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
                <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
            <h3>منتجات وتوريد</h3>
            <p>اختر منتجات معتمدة ضمن شبكة مدرار، بينما تتم إدارة التوريد والمخزون خلف الكواليس.</p>
          </div>

          <div className="card area-c proximity">
            <div className="icon tile3d navy tile-56">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
                <rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 10h18" />
              </svg>
            </div>
            <h3>إدارة واضحة</h3>
            <p>طلباتك ومبيعاتك وأرباحك ومنتجاتك وتنبيهاتك في لوحة واحدة.</p>
          </div>

          <div className="card area-d proximity">
            <div className="icon tile3d mint tile-56">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
                <path d="M3 16V6a1 1 0 011-1h9v11H3z" /><path d="M13 9h4l4 4v3h-8z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" />
              </svg>
            </div>
            <h3>توصيل متكامل</h3>
            <p>تابع رحلة الطلب من التأكيد وحتى التسليم للعميل مباشرة.</p>
          </div>

          <div className="card area-e proximity">
            <div className="icon tile3d blue tile-56">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
                <path d="M3 3v18h18" /><path d="M7 16l4-5 3 3 5-7" />
              </svg>
            </div>
            <div className="txt">
              <h3>قابل للنمو</h3>
              <p>ابدأ بمتجر صغير ثم توسع مع نمو تجارتك — نفس البنية تكبر معك من أول طلب لآلاف الطلبات.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
