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

export default function SupplierProductsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('50');
  const [stock, setStock] = useState('10');
  const [desc, setDesc] = useState('');
  const [products, setProducts] = useState([
    { name: 'طقم كنب ٣ قطع', cost: '180', stock: '14', status: 'approved', gradient: 'linear-gradient(135deg,#7BF6DB,#0A7A6C)' },
    { name: 'طاولة طعام خشب', cost: '85', stock: '4', status: 'approved', gradient: 'linear-gradient(135deg,#7FC7FF,#063C8C)' },
    { name: 'كرسي مكتب دوّار', cost: '72', stock: '10', status: 'pending', gradient: 'linear-gradient(135deg,#F4C98B,#9B5E17)' },
  ]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = () => {
    const n = name.trim() || 'منتج جديد';
    const c = cost || '0';
    const s = stock || '0';
    setProducts((prev) => [{ name: n, cost: c, stock: s, status: 'pending', gradient: 'linear-gradient(135deg,#B7C3CE,#3B4A58)' }, ...prev]);
    closeDrawer();
    showToast('تم إرسال المنتج لمراجعة فريق مدرار');
    setName('');
    setDesc('');
  };

  return (
    <>
      <section className="page" id="page-products">
        <div className="page-head">
          <div><h1>المنتجات</h1><div className="sub">منتجاتك المعروضة على شبكة متاجر مدرار</div></div>
          <div className="page-actions"><button className="btn btn-primary" id="newProductBtn" onClick={openDrawer}>+ منتج جديد</button></div>
        </div>
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead><tr><th>المنتج</th><th className="num">التكلفة</th><th className="num">المخزون</th><th>الحالة</th><th /></tr></thead>
              <tbody id="supplierProductsBody">
                {products.map((p, i) => (
                  <tr key={i}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div className="prod-thumb" style={{ background: p.gradient }} /><div className="cell-main">{p.name}</div></div></td>
                    <td className="num">{p.cost}</td>
                    <td className="num">{p.stock}</td>
                    <td>
                      {p.status === 'approved' ? (
                        <span className="badge badge-success"><span className="dot" />معتمد</span>
                      ) : (
                        <span className="badge badge-warning"><span className="dot" />قيد المراجعة</span>
                      )}
                    </td>
                    <td className="row-actions"><button>⋮</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} id="drawerOverlay" onClick={closeDrawer} />
      <div className={`drawer${drawerOpen ? ' open' : ''}`} id="productDrawer">
        <div className="drawer-head"><h3>إضافة منتج جديد</h3><button className="drawer-close" id="drawerClose" onClick={closeDrawer}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button></div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field full"><label>اسم المنتج</label><input type="text" id="spName" placeholder="مثال: كرسي مكتب دوّار" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label>التكلفة</label><input type="text" className="en" id="spCost" value={cost} dir="ltr" onChange={(e) => setCost(e.target.value)} /></div>
            <div className="field"><label>المخزون المتاح</label><input type="text" className="en" id="spStock" value={stock} dir="ltr" onChange={(e) => setStock(e.target.value)} /></div>
            <div className="field full"><label>الوصف</label><textarea rows={3} id="spDesc" placeholder="وصف مختصر للمنتج ومواصفاته" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          </div>
        </div>
        <div className="drawer-foot"><button className="btn btn-secondary" id="cancelProductBtn" onClick={closeDrawer}>إلغاء</button><button className="btn btn-primary" id="submitProductBtn" onClick={handleSubmit}>إرسال للمراجعة</button></div>
      </div>
    </>
  );
}
