export default function SupplierPayoutsPage() {
  return (
    <section className="page" id="page-dues">
      <div className="page-head"><div><h1>المستحقات</h1><div className="sub">أرباحك من كل تسوية</div></div>
        <div className="page-actions"><button className="btn btn-primary">طلب سحب</button></div></div>
      <div className="kpi-grid">
        <div className="kpi-card"><span className="label">قيد الانتظار</span><div className="value en">480</div></div>
        <div className="kpi-card"><span className="label">متاح للسحب</span><div className="value en" style={{ color: 'var(--success)' }}>2,110</div></div>
        <div className="kpi-card"><span className="label">تم صرفه هالشهر</span><div className="value en">3,900</div></div>
        <div className="kpi-card"><span className="label">عمولة مدرار</span><div className="value en">8%</div></div>
      </div>
    </section>
  );
}
