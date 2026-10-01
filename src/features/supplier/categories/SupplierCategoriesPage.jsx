import { useEffect, useMemo, useState } from 'react';
import { X, Search, LayoutGrid, Package, Boxes } from 'lucide-react';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getCategories, getProducts, addCategory, updateCategory, deleteCategory } from '../data/mockSupplierDb';
import { exportToCsv } from '../lib/csv';
import { printTablePdf } from '../lib/printPdf';
import ExportMenu from '../components/ExportMenu';

function showToast(message) {
  if (typeof window.showToast === 'function') window.showToast(message);
}

const STATUS_BADGE = { draft: 'badge-neutral', pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
const STATUS_LABEL = { draft: 'مسودة', pending: 'قيد المراجعة', approved: 'معتمد', rejected: 'مرفوض' };
const UNCATEGORIZED_ID = '__none__';
const SORT_OPTIONS = [
  { value: 'default', label: 'الترتيب الافتراضي' },
  { value: 'most', label: 'الأكثر منتجات' },
  { value: 'least', label: 'الأقل منتجات' },
  { value: 'stock', label: 'الأعلى مخزونًا' },
  { value: 'name', label: 'الاسم (أ - ي)' },
];
const EMPTY_FILTERS = { search: '', sortBy: 'default', hideEmpty: false };

function totalStock(product) {
  return product.variants.reduce((sum, v) => sum + v.stock.actual, 0);
}
function firstCost(product) {
  return product.variants[0]?.supplyPrice?.amount ?? 0;
}
function fmt(n) {
  return Number(n).toLocaleString('en-US');
}
export default function SupplierCategoriesPage() {
  const { supplier, employee } = useSupplierSession();
  const [categories, setCategories] = useState(null);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [detailsCategory, setDetailsCategory] = useState(null); // row from categoryRows
  const [modal, setModal] = useState(null); // { mode: 'add' | 'edit', category? }
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // category being confirmed for deletion
  const [deleteError, setDeleteError] = useState('');
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    const [list, productList] = await Promise.all([
      getCategories(supplier.id),
      getProducts(supplier.id),
    ]);
    setCategories(list);
    setProducts(productList);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  // One summary row per category (plus an "uncategorized" bucket for the chart).
  const categoryRows = useMemo(() => {
    const build = (id, label, items) => ({
      id,
      name: label,
      products: items,
      count: items.length,
      stock: items.reduce((sum, p) => sum + totalStock(p), 0),
      approved: items.filter((p) => p.status === 'approved').length,
    });
    const rows = (categories ?? []).map((c) => build(c.id, c.name, products.filter((p) => p.categoryId === c.id)));
    const known = new Set((categories ?? []).map((c) => c.id));
    const orphans = products.filter((p) => !p.categoryId || !known.has(p.categoryId));
    return { rows, uncategorized: orphans.length ? build(UNCATEGORIZED_ID, 'بدون قسم', orphans) : null };
  }, [categories, products]);

  const filteredRows = useMemo(() => {
    let list = categoryRows.rows;
    const q = filters.search.trim().toLowerCase();
    if (q) list = list.filter((r) => r.name.toLowerCase().includes(q));
    if (filters.hideEmpty) list = list.filter((r) => r.count > 0);
    const sorted = [...list];
    if (filters.sortBy === 'most') sorted.sort((a, b) => b.count - a.count);
    else if (filters.sortBy === 'least') sorted.sort((a, b) => a.count - b.count);
    else if (filters.sortBy === 'stock') sorted.sort((a, b) => b.stock - a.stock);
    else if (filters.sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    return sorted;
  }, [categoryRows, filters]);

  const chartRows = useMemo(() => {
    const all = categoryRows.uncategorized ? [...categoryRows.rows, categoryRows.uncategorized] : categoryRows.rows;
    return [...all].sort((a, b) => b.count - a.count);
  }, [categoryRows]);
  const chartMax = Math.max(1, ...chartRows.map((r) => r.count));
  const totalProductsStock = products.reduce((sum, p) => sum + totalStock(p), 0);

  const hasActiveFilters = filters.search.trim() !== '' || filters.sortBy !== 'default' || filters.hideEmpty;
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const handleExport = (kind) => {
    if (filteredRows.length === 0) { showToast('لا توجد بيانات للتصدير'); return; }
    const columns = [
      { key: 'name', header: 'القسم' },
      { key: 'count', header: 'عدد المنتجات', num: true },
      { key: 'stock', header: 'المخزون', num: true },
      { key: 'approved', header: 'المنتجات المعتمدة', num: true },
    ];
    if (kind === 'excel') {
      exportToCsv('categories.csv', filteredRows, columns);
      showToast('تم تصدير ملف Excel');
    } else if (!printTablePdf('تقرير الأقسام', filteredRows, columns)) {
      showToast('اسمح بالنوافذ المنبثقة لتصدير PDF');
    }
  };

  const openAdd = () => { setModal({ mode: 'add' }); setName(''); setFormError(''); };
  const openEdit = (category) => { setModal({ mode: 'edit', category }); setName(category.name); setFormError(''); };
  const closeModal = () => { if (!saving) setModal(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (modal.mode === 'add') {
        await addCategory({ supplierId: supplier.id, name, actorName: employee.name });
        showToast('تم إضافة القسم بنجاح');
      } else {
        await updateCategory({ categoryId: modal.category.id, name, actorName: employee.name });
        showToast('تم حفظ التعديل بنجاح');
      }
      setModal(null);
      await reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    try {
      await deleteCategory({ categoryId: deleteTarget.id, actorName: employee.name });
      showToast('تم حذف القسم');
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  if (categories === null) {
    return (
      <section className="page">
        <div className="page-head"><div><h1>الأقسام</h1></div></div>
        <div className="skeleton" style={{ height: 220 }} />
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>الأقسام</h1>
          <div className="sub">أنشئ ونظّم أقسام منتجاتك بسهولة</div>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <ExportMenu onExport={handleExport} />
          <button type="button" className="btn btn-primary" onClick={openAdd}>+ إضافة قسم</button>
        </div>
      </div>

      <div className="kpi-grid cols-3">
        <div className="kpi-card">
          <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><LayoutGrid size={16} strokeWidth={2} color="var(--brand-blue)" />عدد الأقسام</span>
          <div className="value en">{fmt(categories.length)}</div>
        </div>
        <div className="kpi-card">
          <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Package size={16} strokeWidth={2} color="var(--brand-blue)" />المنتجات المعروضة</span>
          <div className="value en">{fmt(products.length)}</div>
        </div>
        <div className="kpi-card">
          <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Boxes size={16} strokeWidth={2} color="var(--brand-blue)" />المخزون العام</span>
          <div className="value en">{fmt(totalProductsStock)}</div>
        </div>
      </div>

      {chartRows.length > 0 && (
        <div className="panel" style={{ marginBottom: 24 }}>
          <div className="panel-head">
            <div>
              <h3>توزيع المنتجات على الأقسام</h3>
              <div className="sub">اضغط على أي قسم لعرض منتجاته</div>
            </div>
          </div>
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chartRows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDetailsCategory(r)}
                title={`${r.name}: ${r.count} منتج`}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(90px,160px) 1fr 48px', alignItems: 'center', gap: 12, background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'start', font: 'inherit', color: 'inherit' }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: r.id === UNCATEGORIZED_ID ? 'var(--text-muted)' : 'inherit' }}>{r.name}</span>
                <span style={{ height: 14, background: 'var(--surface-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: `${(r.count / chartMax) * 100}%`, minWidth: r.count ? 4 : 0, background: r.id === UNCATEGORIZED_ID ? 'var(--text-muted)' : 'var(--brand-blue)', borderRadius: 4, transition: 'width .3s ease' }} />
                </span>
                <span className="en" style={{ fontSize: '0.85rem', fontWeight: 800, direction: 'ltr', textAlign: 'end' }}>{fmt(r.count)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="title">لا توجد أقسام بعد</div>
            <div className="msg">أنشئ أول قسم لتنظيم منتجاتك.</div>
            <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={openAdd}>إضافة قسم</button>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="filters-bar">
            <div className="field filters-search">
              <label>بحث باسم القسم</label>
              <div className="search-box">
                <Search size={16} strokeWidth={2} />
                <input type="text" placeholder="ابحث عن قسم..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
              </div>
            </div>
            <div className="field filters-sort">
              <label>ترتيب حسب</label>
              <select value={filters.sortBy} onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}>
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="field filters-sort">
              <label>الأقسام الفارغة</label>
              <select value={filters.hideEmpty ? 'hide' : 'show'} onChange={(e) => setFilters((f) => ({ ...f, hideEmpty: e.target.value === 'hide' }))}>
                <option value="show">إظهار الكل</option>
                <option value="hide">إخفاء الفارغة</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button type="button" className="btn btn-secondary btn-sm filters-reset" onClick={clearFilters}>إعادة تعيين</button>
            )}
          </div>
          {hasActiveFilters && (
            <div className="filters-summary">
              عرض {filteredRows.length} من {categoryRows.rows.length} قسم
            </div>
          )}
          {filteredRows.length === 0 ? (
            <div className="empty-state">
              <div className="title">لا توجد نتائج مطابقة</div>
              <div className="msg">جرّب تعديل كلمة البحث أو الفلاتر.</div>
              <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={clearFilters}>إعادة تعيين الفلاتر</button>
            </div>
          ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>القسم</th>
                  <th className="num">عدد المنتجات</th>
                  <th className="num">المخزون</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id} className="clickable" onClick={() => setDetailsCategory(r)}>
                    <td className="cell-main">{r.name}</td>
                    <td className="num en">{fmt(r.count)}</td>
                    <td className="num en">{fmt(r.stock)}</td>
                    <td className="row-actions" style={{ justifyContent: 'flex-end', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => openEdit(categories.find((c) => c.id === r.id))}>تعديل</button>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', color: 'var(--danger)' }} onClick={() => { setDeleteTarget(categories.find((c) => c.id === r.id)); setDeleteError(''); }}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {detailsCategory && (
        <div className="modal-overlay" onClick={() => setDetailsCategory(null)}>
          <div className="modal-box form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h3>منتجات قسم «{detailsCategory.name}»</h3>
              <button type="button" className="drawer-close" onClick={() => setDetailsCategory(null)}><X size={16} strokeWidth={2} /></button>
            </div>
            <div className="drawer-body">
              <div className="kpi-grid cols-3" style={{ marginBottom: 18 }}>
                <div className="kpi-card"><span className="label">عدد المنتجات</span><div className="value en">{fmt(detailsCategory.count)}</div></div>
                <div className="kpi-card"><span className="label">المخزون</span><div className="value en">{fmt(detailsCategory.stock)}</div></div>
                <div className="kpi-card"><span className="label">المعتمدة</span><div className="value en" style={{ color: 'var(--success)' }}>{fmt(detailsCategory.approved)}</div></div>
              </div>
              {detailsCategory.products.length === 0 ? (
                <div className="empty-state">
                  <div className="title">لا توجد منتجات في هذا القسم</div>
                  <div className="msg">أضف منتجات واختر هذا القسم لها من صفحة المنتجات.</div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>المنتج</th><th className="num">التكلفة</th><th className="num">المخزون</th><th>الحالة</th></tr></thead>
                    <tbody>
                      {detailsCategory.products.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {p.images?.[0]?.url
                                ? <img src={p.images[0].url} alt="" className="prod-thumb" style={{ objectFit: 'cover' }} />
                                : <div className="prod-thumb" style={{ background: 'var(--surface-subtle)' }} />}
                              <div className="cell-main">{p.name}</div>
                            </div>
                          </td>
                          <td className="num en">{fmt(firstCost(p))}</td>
                          <td className="num en">{fmt(totalStock(p))}</td>
                          <td><span className={`badge ${STATUS_BADGE[p.status] ?? 'badge-neutral'}`}><span className="dot" />{STATUS_LABEL[p.status] ?? p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="drawer-foot">
              <button type="button" className="btn btn-secondary" onClick={() => setDetailsCategory(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.02rem' }}>{modal.mode === 'add' ? 'إضافة قسم' : 'تعديل القسم'}</h3>
              <button type="button" className="drawer-close" onClick={closeModal}><X size={16} strokeWidth={2} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label>اسم القسم</label>
                <input type="text" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: غرف نوم" />
                {formError && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--danger)' }}>{formError}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'جارٍ الحفظ...' : modal.mode === 'add' ? 'إضافة القسم' : 'حفظ التعديل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.02rem' }}>حذف القسم</h3>
              <button type="button" className="drawer-close" onClick={() => setDeleteTarget(null)}><X size={16} strokeWidth={2} /></button>
            </div>
            {deleteError ? (
              <>
                <p style={{ fontSize: '0.88rem', color: 'var(--danger)', marginBottom: 16 }}>{deleteError}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>حسنًا</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: '0.88rem', marginBottom: 16 }}>هل أنت متأكد من حذف قسم «{deleteTarget.name}»؟</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>إلغاء</button>
                  <button type="button" className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={handleDelete}>حذف</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
