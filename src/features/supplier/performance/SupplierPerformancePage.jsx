export default function SupplierPerformancePage() {
  return (
    <section className="page" id="page-performance">
      <div className="page-head"><div><h1>الأداء</h1><div className="sub">دقة المخزون وسرعة التجهيز</div></div></div>
      <div className="kpi-grid">
        <div className="kpi-card"><span className="label">دقة المخزون</span><div className="value en">97%</div></div>
        <div className="kpi-card"><span className="label">متوسط وقت التجهيز</span><div className="value en">1.4 يوم</div></div>
        <div className="kpi-card"><span className="label">نسبة الإرجاع</span><div className="value en">2.1%</div></div>
        <div className="kpi-card"><span className="label">تقييم الأداء</span><div className="value en" style={{ color: 'var(--success)' }}>ممتاز</div></div>
      </div>
    </section>
  );
}
