import { useNavigate } from 'react-router-dom';
import { useSupplierSession } from '../session/SupplierSessionContext';

export default function SupplierDashboardHome() {
  const { supplier, employee } = useSupplierSession();
  const navigate = useNavigate();
  const firstName = employee?.name?.split(' ')[0] ?? supplier?.fullName?.split(' ')[0] ?? 'فادي';

  return (
    <section className="page" id="page-overview">
      <div className="page-head">
        <div>
          <h1>أهلًا {firstName} 👋</h1>
          <div className="sub">ملخص أداء {supplier?.companyName ?? 'مصنع الأناقة'} اليوم</div>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi-card"><span className="label">طلبات تحتاج تجهيز</span><div className="value en">3</div></div>
        <div className="kpi-card"><span className="label">منتجات منخفضة المخزون</span><div className="value en">2</div></div>
        <div className="kpi-card"><span className="label">مبيعات هالشهر</span><div className="value en">6,840</div></div>
        <div className="kpi-card"><span className="label">مستحقات متاحة</span><div className="value en">2,110</div></div>
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><h3>طلبات تحتاج تجهيز</h3><a href="#" onClick={(e) => { e.preventDefault(); navigate('/supplier/orders'); }} style={{ fontSize: '0.84rem', color: 'var(--brand-blue)', fontWeight: 700 }}>الكل</a></div>
          <div className="simple-list">
            <div className="simple-row">
              <div className="ic" style={{ background: 'var(--warning-bg)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></svg></div>
              <div className="txt"><div className="t">#MD-20481 · متجر لمسة</div><div className="s">طقم كنب ٣ قطع × 1</div></div>
              <span className="cta" onClick={() => navigate('/supplier/orders')}>تجهيز</span>
            </div>
            <div className="simple-row">
              <div className="ic" style={{ background: 'var(--warning-bg)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></svg></div>
              <div className="txt"><div className="t">#MD-20479 · متجر لمسة</div><div className="s">مصباح أرضي × 2</div></div>
              <span className="cta" onClick={() => navigate('/supplier/orders')}>تجهيز</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h3>تنبيهات المخزون</h3></div>
          <div className="simple-list">
            <div className="simple-row"><div className="ic" style={{ background: 'var(--danger-bg)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><path d="M12 9v4M12 17h.01" /></svg></div><div className="txt"><div className="t">طاولة طعام خشب</div><div className="s">4 قطع متبقية</div></div></div>
            <div className="simple-row"><div className="ic" style={{ background: 'var(--warning-bg)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><path d="M12 9v4M12 17h.01" /></svg></div><div className="txt"><div className="t">سجادة صالون ٢×٣</div><div className="s">2 قطعة متبقية</div></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
