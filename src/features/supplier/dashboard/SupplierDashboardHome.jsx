import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getOrders, getProducts, getPayouts } from '../data/mockSupplierDb';

const PREP_STATUSES = ['new', 'preparing'];

export default function SupplierDashboardHome() {
  const { supplier, employee } = useSupplierSession();
  const navigate = useNavigate();
  const firstName = employee?.name?.split(' ')[0] ?? supplier?.fullName?.split(' ')[0] ?? 'فادي';

  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState(null);
  const [payouts, setPayouts] = useState(null);

  useEffect(() => {
    if (!supplier) return undefined;
    let cancelled = false;
    Promise.all([getOrders(supplier.id), getProducts(supplier.id), getPayouts(supplier.id)]).then(([o, p, pay]) => {
      if (cancelled) return;
      setOrders(o);
      setProducts(p);
      setPayouts(pay);
    });
    return () => { cancelled = true; };
  }, [supplier?.id]);

  const loading = !orders || !products || !payouts;

  const productIndex = useMemo(() => {
    const map = new Map();
    (products ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);
  const variantIndex = useMemo(() => {
    const map = new Map();
    (products ?? []).forEach((p) => p.variants.forEach((v) => map.set(v.id, v)));
    return map;
  }, [products]);

  const ordersNeedingPrep = useMemo(() => (orders ?? []).filter((o) => PREP_STATUSES.includes(o.status)), [orders]);

  const lowStockThreshold = supplier?.inventorySettings?.lowStockThreshold ?? 5;
  const lowStockVariants = useMemo(() => {
    const list = [];
    (products ?? []).forEach((p) => p.variants.forEach((v) => {
      if (v.stock.actual <= lowStockThreshold) list.push({ key: v.id, productName: p.name, variantLabel: v.label, actual: v.stock.actual });
    }));
    return list.sort((a, b) => a.actual - b.actual);
  }, [products, lowStockThreshold]);

  // Revenue at supply price (what the supplier is actually paid), summed
  // across every order placed this month — regardless of fulfillment
  // status, since "مبيعات" means orders received, not just paid-out ones.
  const salesThisMonth = useMemo(() => {
    const now = new Date();
    return (orders ?? [])
      .filter((o) => {
        const created = new Date(o.createdAt);
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
      })
      .reduce((sum, o) => sum + o.items.reduce((s, it) => {
        const variant = variantIndex.get(it.variantId);
        return s + (variant ? variant.supplyPrice.amount * it.qty : 0);
      }, 0), 0);
  }, [orders, variantIndex]);

  const availablePayout = useMemo(
    () => (payouts ?? []).filter((p) => p.status === 'eligible' && p.currency === 'USD').reduce((s, p) => s + p.netAmount, 0),
    [payouts],
  );

  const topProducts = useMemo(() => {
    const counts = new Map();
    (orders ?? []).forEach((o) => o.items.forEach((it) => {
      const label = productIndex.get(it.productId)?.name ?? it.name;
      counts.set(label, (counts.get(label) ?? 0) + it.qty);
    }));
    return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [orders, productIndex]);

  return (
    <section className="page" id="page-overview">
      <div className="page-head">
        <div>
          <h1>أهلًا {firstName} 👋</h1>
          <div className="sub">ملخص أداء {supplier?.companyName ?? 'مصنع الأناقة'} اليوم</div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-card-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/supplier/orders')}>
          <span className="label">طلبات تحتاج تجهيز</span>
          <div className="value en">{loading ? '—' : ordersNeedingPrep.length}</div>
        </div>
        <div className="kpi-card kpi-card-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/supplier/inventory')}>
          <span className="label">منتجات منخفضة المخزون</span>
          <div className="value en">{loading ? '—' : lowStockVariants.length}</div>
        </div>
        <div className="kpi-card kpi-card-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/supplier/orders')}>
          <span className="label">مبيعات الشهر الحالي</span>
          <div className="value en">{loading ? '—' : salesThisMonth.toLocaleString()}</div>
        </div>
        <div className="kpi-card kpi-card-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/supplier/payouts')}>
          <span className="label">مستحقات متاحة</span>
          <div className="value en">{loading ? '—' : availablePayout.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h3>طلبات تحتاج تجهيز</h3>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/supplier/orders'); }} style={{ fontSize: '0.84rem', color: 'var(--brand-blue)', fontWeight: 700 }}>الكل</a>
          </div>
          <div className="simple-list">
            {loading ? (
              <div className="simple-row"><div className="txt"><div className="s">جارِ التحميل...</div></div></div>
            ) : ordersNeedingPrep.length === 0 ? (
              <div className="simple-row"><div className="txt"><div className="s">لا توجد طلبات تحتاج تجهيز حاليًا</div></div></div>
            ) : ordersNeedingPrep.slice(0, 4).map((o) => (
              <div className="simple-row" key={o.id}>
                <div className="ic" style={{ background: 'var(--warning-bg)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></svg>
                </div>
                <div className="txt">
                  <div className="t">#{o.opRef}</div>
                  <div className="s">{o.items.map((it) => `${it.name} × ${it.qty}`).join('، ')}</div>
                </div>
                <span className="cta" onClick={() => navigate('/supplier/orders')}>تجهيز</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>تنبيهات المخزون</h3></div>
          <div className="simple-list">
            {loading ? (
              <div className="simple-row"><div className="txt"><div className="s">جارِ التحميل...</div></div></div>
            ) : lowStockVariants.length === 0 ? (
              <div className="simple-row"><div className="txt"><div className="s">لا توجد تنبيهات مخزون حاليًا</div></div></div>
            ) : lowStockVariants.slice(0, 4).map((v) => (
              <div className="simple-row" key={v.key}>
                <div className="ic" style={{ background: v.actual === 0 ? 'var(--danger-bg)' : 'var(--warning-bg)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v.actual === 0 ? 'var(--danger)' : 'var(--warning)'} strokeWidth="2"><path d="M12 9v4M12 17h.01" /></svg>
                </div>
                <div className="txt">
                  <div className="t">{v.productName}{v.variantLabel ? ` - ${v.variantLabel}` : ''}</div>
                  <div className="s">{v.actual} قطعة متبقية</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <div>
            <h3>المنتجات الأكثر طلبًا</h3>
            <div className="sub">أكثر المنتجات طلبًا بناءً على الطلبات المسجلة</div>
          </div>
        </div>
        <div className="chart-hbar-wrap">
          {loading ? (
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>جارِ التحميل...</p>
          ) : topProducts.length === 0 ? (
            <div className="empty-state">
              <div className="title">لا توجد بيانات كافية بعد</div>
              <div className="msg">سيظهر هنا ترتيب المنتجات الأكثر طلبًا بمجرد تسجيل طلبات على حسابك.</div>
            </div>
          ) : (
            <TopProductsChart data={topProducts} />
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Horizontal bar chart — the right form for ranked magnitude with
 * long text labels (see the dataviz skill's choosing-a-form guidance).
 * One series, so one hue and no legend; each bar carries its own
 * hover/focus tooltip since the mark itself is the hit target.
 */
function TopProductsChart({ data }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const max = data[0]?.value || 1;

  return (
    <div className="chart-hbar" role="img" aria-label={`مخطط المنتجات الأكثر طلبًا: ${data.map((d) => `${d.label} ${d.value}`).join('، ')}`}>
      {data.map((d, i) => (
        <div
          key={d.label}
          className="chart-hbar-row"
          tabIndex={0}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex((cur) => (cur === i ? null : cur))}
          onFocus={() => setHoveredIndex(i)}
          onBlur={() => setHoveredIndex((cur) => (cur === i ? null : cur))}
        >
          <span className="chart-hbar-label">{d.label}</span>
          <div className="chart-hbar-track">
            <div className="chart-hbar-fill" style={{ width: `${Math.max((d.value / max) * 100, 5)}%` }} />
            {hoveredIndex === i && (
              <div className="chart-tooltip"><b>{d.value}</b> طلب — {d.label}</div>
            )}
          </div>
          <span className="chart-hbar-value en">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
