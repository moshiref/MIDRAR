import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getProducts, getCategories, adjustInventory } from '../data/mockSupplierDb';
import { useToast } from '../ui/SupplierToast';

const EMPTY_FILTERS = { search: '', categoryId: '', priceMin: '', priceMax: '', qtyMin: '', qtyMax: '', dateFrom: '', dateTo: '' };

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function SupplierInventoryPage() {
  const { supplier, employee } = useSupplierSession();
  const { showToast } = useToast();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [edits, setEdits] = useState({});
  const [savingKey, setSavingKey] = useState(null);

  const reload = async () => {
    const [productList, categoryList] = await Promise.all([getProducts(supplier.id), getCategories(supplier.id)]);
    setProducts(productList);
    setCategories(categoryList);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name;

  // Inventory is tracked per variant (color/size), so each row here is one
  // variant, not one product — a product with 3 variants shows 3 rows.
  const rows = useMemo(() => {
    if (!products) return [];
    const list = [];
    products.forEach((p) => {
      p.variants.forEach((v) => {
        list.push({
          key: `${p.id}__${v.id}`,
          productId: p.id,
          variantId: v.id,
          name: p.name,
          variantLabel: v.label || [v.color, v.size].filter(Boolean).join(' - '),
          categoryId: p.categoryId ?? null,
          price: v.suggestedPrice?.amount ?? 0,
          qty: v.stock.actual,
          createdAt: p.createdAt,
        });
      });
    });
    return list;
  }, [products]);

  const filteredRows = useMemo(() => {
    let list = rows;
    const q = filters.search.trim().toLowerCase();
    if (q) list = list.filter((r) => r.name.toLowerCase().includes(q));
    if (filters.categoryId) list = list.filter((r) => r.categoryId === filters.categoryId);

    const priceMin = filters.priceMin !== '' ? Number(filters.priceMin) : null;
    const priceMax = filters.priceMax !== '' ? Number(filters.priceMax) : null;
    if (priceMin !== null && !Number.isNaN(priceMin)) list = list.filter((r) => r.price >= priceMin);
    if (priceMax !== null && !Number.isNaN(priceMax)) list = list.filter((r) => r.price <= priceMax);

    const qtyMin = filters.qtyMin !== '' ? Number(filters.qtyMin) : null;
    const qtyMax = filters.qtyMax !== '' ? Number(filters.qtyMax) : null;
    if (qtyMin !== null && !Number.isNaN(qtyMin)) list = list.filter((r) => r.qty >= qtyMin);
    if (qtyMax !== null && !Number.isNaN(qtyMax)) list = list.filter((r) => r.qty <= qtyMax);

    // createdAt is a full ISO timestamp and the date inputs give "YYYY-MM-DD" —
    // that's a string prefix of the timestamp, so plain string comparison
    // already gives the right >=/<= ordering without parsing Date objects.
    if (filters.dateFrom) list = list.filter((r) => r.createdAt >= filters.dateFrom);
    if (filters.dateTo) list = list.filter((r) => r.createdAt <= `${filters.dateTo}T23:59:59.999Z`);

    return list;
  }, [rows, filters]);

  const hasActiveFilters = Object.keys(EMPTY_FILTERS).some((k) => filters[k] !== EMPTY_FILTERS[k]);
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const handleQtyChange = (key, value) => setEdits((e) => ({ ...e, [key]: value }));

  const handleSaveQty = async (row) => {
    const raw = edits[row.key];
    if (raw === undefined) return;
    const next = Number(raw);
    if (!Number.isFinite(next) || next < 0) {
      showToast('كمية غير صحيحة', 'error');
      return;
    }
    const delta = next - row.qty;
    if (delta === 0) return;
    setSavingKey(row.key);
    try {
      await adjustInventory({ productId: row.productId, variantId: row.variantId, delta, reason: 'تحديث يدوي', actorName: employee?.name });
      setEdits((e) => {
        const next2 = { ...e };
        delete next2[row.key];
        return next2;
      });
      showToast('تم تحديث الكمية');
      await reload();
    } finally {
      setSavingKey(null);
    }
  };

  if (products === null) {
    return (
      <section className="page" id="page-inventory">
        <div className="page-head"><div><h1>المخزون</h1></div></div>
        <div className="skeleton" style={{ height: 220 }} />
      </section>
    );
  }

  return (
    <section className="page" id="page-inventory">
      <div className="page-head"><div><h1>المخزون</h1><div className="sub">حدّث كميات مخزونك أول بأول</div></div></div>

      <div className="panel">
        <div className="filters-bar">
          <div className="field filters-search">
            <label>بحث بالاسم</label>
            <div className="search-box">
              <Search size={16} strokeWidth={2} />
              <input type="text" placeholder="ابحث عن منتج..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
            </div>
          </div>
          <div className="field" style={{ width: 160 }}>
            <label>القسم</label>
            <select value={filters.categoryId} onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}>
              <option value="">كل الأقسام</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field filters-price">
            <label>السعر من</label>
            <input type="text" className="en" dir="ltr" placeholder="0" value={filters.priceMin} onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))} />
          </div>
          <div className="field filters-price">
            <label>إلى</label>
            <input type="text" className="en" dir="ltr" placeholder="∞" value={filters.priceMax} onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))} />
          </div>
          <div className="field filters-price">
            <label>الكمية من</label>
            <input type="text" className="en" dir="ltr" placeholder="0" value={filters.qtyMin} onChange={(e) => setFilters((f) => ({ ...f, qtyMin: e.target.value }))} />
          </div>
          <div className="field filters-price">
            <label>إلى</label>
            <input type="text" className="en" dir="ltr" placeholder="∞" value={filters.qtyMax} onChange={(e) => setFilters((f) => ({ ...f, qtyMax: e.target.value }))} />
          </div>
          <div className="field" style={{ width: 150 }}>
            <label>تاريخ الإضافة من</label>
            <input type="date" className="en" dir="ltr" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
          </div>
          <div className="field" style={{ width: 150 }}>
            <label>إلى</label>
            <input type="date" className="en" dir="ltr" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
          </div>
          {hasActiveFilters && (
            <button type="button" className="btn btn-secondary btn-sm filters-reset" onClick={clearFilters}>إعادة تعيين</button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="filters-summary">عرض {filteredRows.length} من {rows.length} صنف</div>
        )}

        {filteredRows.length === 0 ? (
          <div className="empty-state">
            <div className="title">لا توجد نتائج مطابقة</div>
            <div className="msg">جرّب تعديل كلمة البحث أو الفلاتر.</div>
            {hasActiveFilters && <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={clearFilters}>إعادة تعيين الفلاتر</button>}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>القسم</th>
                  <th className="num">السعر</th>
                  <th>تاريخ الإضافة</th>
                  <th className="num">الكمية الحالية</th>
                  <th>تحديث</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const pendingValue = edits[row.key];
                  const hasChange = pendingValue !== undefined && Number(pendingValue) !== row.qty;
                  return (
                    <tr key={row.key}>
                      <td>
                        <div className="cell-main">{row.name}</div>
                        {row.variantLabel && <div className="cell-sub">{row.variantLabel}</div>}
                      </td>
                      <td>
                        {categoryName(row.categoryId) ? (
                          <span className="badge badge-info">{categoryName(row.categoryId)}</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>بدون قسم</span>
                        )}
                      </td>
                      <td className="num">{row.price}</td>
                      <td>{formatDate(row.createdAt)}</td>
                      <td className="num">{row.qty}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            type="text"
                            className="en"
                            value={pendingValue ?? row.qty}
                            onChange={(e) => handleQtyChange(row.key, e.target.value)}
                            style={{ width: '70px', padding: '6px 10px', border: '1.5px solid var(--border-default)', borderRadius: '7px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ width: 'auto' }}
                            disabled={!hasChange || savingKey === row.key}
                            onClick={() => handleSaveQty(row)}
                          >
                            {savingKey === row.key ? '...' : 'حفظ'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
