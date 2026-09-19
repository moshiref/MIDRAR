import { useState } from 'react';

function showToast(message) {
  let holder = document.getElementById('toastHolder');
  if (!holder) { holder = document.createElement('div'); holder.id = 'toastHolder'; holder.style.cssText = 'position:fixed; bottom:24px; left:50%; transform:translateX(-50%); z-index:200; display:flex; flex-direction:column; gap:8px; align-items:center;'; document.body.appendChild(holder); }
  const t = document.createElement('div'); t.textContent = message;
  t.style.cssText = 'background:var(--brand-navy-deep); color:#fff; padding:12px 22px; border-radius:999px; font-size:0.86rem; font-weight:700; box-shadow:0 10px 30px -8px rgba(9,25,46,0.4); opacity:0; transform:translateY(10px); transition:all .25s ease;';
  holder.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'none'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2400);
}

export default function SupplierOrdersPage() {
  const [filter, setFilter] = useState('all');
  const [rows, setRows] = useState([
    { id: 'MD-20481', store: 'متجر لمسة', product: 'طقم كنب ٣ قطع', qty: 1, status: 'pending' },
    { id: 'MD-20479', store: 'متجر لمسة', product: 'مصباح أرضي × 2', qty: 2, status: 'pending' },
    { id: 'MD-20470', store: 'متجر لمسة', product: 'طقم كنب ٣ قطع', qty: 1, status: 'ready' },
  ]);

  const handleReady = (idx) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, status: 'ready' } : r)));
    showToast('تم وضع الطلب كجاهز للاستلام');
  };

  return (
    <section className="page" id="page-fulfillment">
      <div className="page-head"><div><h1>طلبات التجهيز</h1><div className="sub">جهّز الطلبات الواردة من متاجر مدرار</div></div></div>
      <div className="filters-bar">
        <div className="chip-tabs" id="fulfillChipTabs">
          <button className={`chip-tab${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>الكل</button>
          <button className={`chip-tab${filter === 'pending' ? ' active' : ''}`} onClick={() => setFilter('pending')}>بانتظار التجهيز</button>
          <button className={`chip-tab${filter === 'ready' ? ' active' : ''}`} onClick={() => setFilter('ready')}>جاهز للاستلام</button>
        </div>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>الطلب</th><th>المتجر</th><th>المنتج</th><th className="num">الكمية</th><th>الحالة</th><th /></tr></thead>
            <tbody id="fulfillTableBody">
              {rows.filter((r) => filter === 'all' || r.status === filter).map((r, idx) => {
                const originalIdx = rows.findIndex((x) => x.id === r.id);
                return (
                  <tr key={r.id} data-status={r.status}>
                    <td className="en cell-main">#{r.id}</td>
                    <td>{r.store}</td>
                    <td>{r.product}</td>
                    <td className="num">{r.qty}</td>
                    <td>
                      {r.status === 'pending' ? (
                        <span className="badge badge-warning"><span className="dot" />بانتظار التجهيز</span>
                      ) : (
                        <span className="badge badge-info"><span className="dot" />جاهز للاستلام</span>
                      )}
                    </td>
                    <td>
                      {r.status === 'pending' ? (
                        <button className="btn btn-secondary btn-sm ready-btn" onClick={() => handleReady(originalIdx)}>جاهز للاستلام</button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
