import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronRight, ChevronLeft, Search, Package, Boxes, CheckCircle2, Clock } from 'lucide-react';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories, addCategory, getOrders } from '../data/mockSupplierDb';
import { exportToCsv } from '../lib/csv';
import { printTablePdf } from '../lib/printPdf';
import ExportMenu from '../components/ExportMenu';

const SORT_OPTIONS = [
  { value: 'default', label: 'الأحدث' },
  { value: 'price-desc', label: 'السعر: من الأعلى للأقل' },
  { value: 'price-asc', label: 'السعر: من الأقل للأعلى' },
  { value: 'most-ordered', label: 'الأكثر طلبًا' },
  { value: 'least-ordered', label: 'الأقل طلبًا' },
];
const EMPTY_FILTERS = { search: '', priceMin: '', priceMax: '', sortBy: 'default' };

function showToast(message) {
  if (typeof window.showToast === 'function') window.showToast(message);
}

const STATUS_BADGE = { draft: 'badge-neutral', pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
const STATUS_LABEL = { draft: 'مسودة', pending: 'قيد المراجعة', approved: 'معتمد', rejected: 'مرفوض' };
const THUMB_GRADIENTS = ['linear-gradient(135deg,#7BF6DB,#0A7A6C)', 'linear-gradient(135deg,#7FC7FF,#063C8C)', 'linear-gradient(135deg,#F4C98B,#9B5E17)', 'linear-gradient(135deg,#B7C3CE,#3B4A58)'];
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;
const REQUIRED_IMAGE_MSG = 'يجب إضافة صورة واحدة على الأقل للمنتج.';

function totalStock(product) {
  return product.variants.reduce((sum, v) => sum + v.stock.actual, 0);
}
function firstCost(product) {
  return product.variants[0]?.supplyPrice?.amount ?? 0;
}
function firstSuggestedPrice(product) {
  return product.variants[0]?.suggestedPrice?.amount ?? firstCost(product);
}
function firstMinPrice(product) {
  return product.variants[0]?.minPrice?.amount ?? firstCost(product);
}
function thumbGradient(productId) {
  let hash = 0;
  for (let i = 0; i < productId.length; i += 1) hash = (hash + productId.charCodeAt(i)) % THUMB_GRADIENTS.length;
  return THUMB_GRADIENTS[hash];
}

const EMPTY_FORM = { name: '', description: '', cost: '50', suggestedPrice: '', stock: '10', minPrice: '', categoryId: '' };

export default function SupplierProductsPage() {
  const { supplier, employee } = useSupplierSession();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [drawerMode, setDrawerMode] = useState(null); // 'add' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailsProduct, setDetailsProduct] = useState(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const overlayPressRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [imageDrag, setImageDrag] = useState(false);
  const [videoDrag, setVideoDrag] = useState(false);
  const [imageFileError, setImageFileError] = useState('');
  const [videoFileError, setVideoFileError] = useState('');
  const [missingImageError, setMissingImageError] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const reload = async () => {
    const [productList, categoryList, orderList] = await Promise.all([getProducts(supplier.id), getCategories(supplier.id), getOrders(supplier.id)]);
    setProducts(productList);
    setCategories(categoryList);
    setOrders(orderList);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  const resetUploadState = () => {
    setImages([]);
    setVideo(null);
    setImageDrag(false);
    setVideoDrag(false);
    setImageFileError('');
    setVideoFileError('');
    setMissingImageError('');
    setAddingCategory(false);
    setNewCategoryName('');
    setCategoryError('');
  };

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) { setCategoryError('اسم القسم مطلوب'); return; }
    setCategorySaving(true);
    setCategoryError('');
    try {
      const category = await addCategory({ supplierId: supplier.id, name: trimmed, actorName: employee.name });
      setCategories((prev) => [...prev, category]);
      setForm((f) => ({ ...f, categoryId: category.id }));
      setAddingCategory(false);
      setNewCategoryName('');
      showToast('تم إنشاء القسم — تابع تعبئة بيانات المنتج');
    } catch (err) {
      setCategoryError(err.message);
    } finally {
      setCategorySaving(false);
    }
  };

  const openAddDrawer = () => { setDrawerMode('add'); setEditingProduct(null); setForm(EMPTY_FORM); resetUploadState(); };
  const openEditDrawer = (product) => {
    setDrawerMode('edit');
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? '',
      cost: String(firstCost(product)),
      suggestedPrice: String(firstSuggestedPrice(product)),
      stock: String(totalStock(product)),
      minPrice: String(firstMinPrice(product)),
      categoryId: product.categoryId ?? '',
    });
    resetUploadState();
    setImages(product.images ?? []);
    setVideo(product.video ?? null);
  };
  const closeDrawer = () => { if (!saving) { setConfirmExit(false); setDrawerMode(null); } };
  // A click on the backdrop asks before discarding the form. Only counts when
  // the press also started on the backdrop, so a text selection dragged out
  // of the form doesn't trigger it.
  const handleOverlayMouseDown = (e) => { overlayPressRef.current = e.target === e.currentTarget; };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && overlayPressRef.current && !saving) setConfirmExit(true);
    overlayPressRef.current = false;
  };

  const addImages = (fileList) => {
    const files = Array.from(fileList);
    const accepted = [];
    let error = '';
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) { error = 'نوع الملف غير مدعوم. الرجاء اختيار صور فقط.'; return; }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) { error = `حجم الصورة "${file.name}" أكبر من ${MAX_IMAGE_MB} ميجابايت.`; return; }
      accepted.push({ name: file.name, url: URL.createObjectURL(file), type: 'image' });
    });
    if (accepted.length) {
      setImages((prev) => [...prev, ...accepted]);
      setMissingImageError('');
    }
    setImageFileError(error);
  };
  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
  const moveImage = (index, dir) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addVideo = (fileList) => {
    const file = fileList[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { setVideoFileError('نوع الملف غير مدعوم. الرجاء اختيار ملف فيديو.'); return; }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) { setVideoFileError(`حجم الفيديو أكبر من ${MAX_VIDEO_MB} ميجابايت.`); return; }
    setVideoFileError('');
    setVideo({ name: file.name, url: URL.createObjectURL(file), type: 'video' });
  };
  const removeVideo = () => setVideo(null);

  const handleSubmit = async () => {
    const name = form.name.trim();
    if (!name) return;
    // Image is only mandatory when adding — existing products (some seeded
    // with no images) must stay editable/saveable without being blocked.
    if (drawerMode === 'add' && images.length === 0) {
      setMissingImageError(REQUIRED_IMAGE_MSG);
      showToast(REQUIRED_IMAGE_MSG);
      return;
    }
    const cost = Number(form.cost) || 0;
    const suggestedPrice = Number(form.suggestedPrice) || cost;
    const stock = Number(form.stock) || 0;
    const minPrice = Number(form.minPrice) || cost;
    setSaving(true);
    try {
      if (drawerMode === 'add') {
        await addProduct({
          supplierId: supplier.id,
          name,
          description: form.description.trim(),
          sector: 'أخرى',
          categoryId: form.categoryId || null,
          specs: '',
          images,
          video,
          status: 'pending',
          variants: [{
            supplyPrice: { amount: cost, currency: 'USD' },
            minPrice: { amount: minPrice, currency: 'USD' },
            suggestedPrice: { amount: suggestedPrice, currency: 'USD' },
            prepDays: 0,
            location: '',
            stock: { actual: stock, reserved: 0 },
          }],
          actorName: employee.name,
        });
        showToast('تم إرسال المنتج لمراجعة فريق مدرار');
      } else {
        const updatedVariants = editingProduct.variants.map((v, i) => (
          i === 0
            ? { ...v, supplyPrice: { amount: cost, currency: 'USD' }, suggestedPrice: { amount: suggestedPrice, currency: 'USD' }, minPrice: { amount: minPrice, currency: 'USD' }, stock: { ...v.stock, actual: stock } }
            : v
        ));
        await updateProduct({
          productId: editingProduct.id,
          patch: { name, description: form.description.trim(), categoryId: form.categoryId || null, images, video, variants: updatedVariants },
          actorName: employee.name,
        });
        showToast('تم حفظ تعديلات المنتج');
      }
      setDrawerMode(null);
      await reload();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteProduct({ productId: deleteTarget.id, actorName: employee.name });
    showToast('تم حذف المنتج');
    setDeleteTarget(null);
    reload();
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name;

  const orderCounts = useMemo(() => {
    const counts = {};
    orders.forEach((o) => (o.items ?? []).forEach((it) => { counts[it.productId] = (counts[it.productId] ?? 0) + (it.qty ?? 0); }));
    return counts;
  }, [orders]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let list = products;
    const q = filters.search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
    const min = filters.priceMin !== '' ? Number(filters.priceMin) : null;
    const max = filters.priceMax !== '' ? Number(filters.priceMax) : null;
    if (min !== null && !Number.isNaN(min)) list = list.filter((p) => firstCost(p) >= min);
    if (max !== null && !Number.isNaN(max)) list = list.filter((p) => firstCost(p) <= max);
    const sorted = [...list];
    if (filters.sortBy === 'price-desc') sorted.sort((a, b) => firstCost(b) - firstCost(a));
    else if (filters.sortBy === 'price-asc') sorted.sort((a, b) => firstCost(a) - firstCost(b));
    else if (filters.sortBy === 'most-ordered') sorted.sort((a, b) => (orderCounts[b.id] ?? 0) - (orderCounts[a.id] ?? 0));
    else if (filters.sortBy === 'least-ordered') sorted.sort((a, b) => (orderCounts[a.id] ?? 0) - (orderCounts[b.id] ?? 0));
    return sorted;
  }, [products, filters, orderCounts]);

  const stats = useMemo(() => {
    const list = products ?? [];
    return {
      count: list.length,
      stock: list.reduce((sum, p) => sum + totalStock(p), 0),
      approved: list.filter((p) => p.status === 'approved').length,
      pending: list.filter((p) => p.status === 'pending').length,
    };
  }, [products]);

  const handleExport = (kind) => {
    if (filteredProducts.length === 0) { showToast('لا توجد بيانات للتصدير'); return; }
    const rows = filteredProducts.map((p) => ({
      name: p.name,
      category: categoryName(p.categoryId) ?? 'بدون قسم',
      cost: firstCost(p),
      suggestedPrice: firstSuggestedPrice(p),
      minPrice: firstMinPrice(p),
      stock: totalStock(p),
      ordered: orderCounts[p.id] ?? 0,
      status: STATUS_LABEL[p.status] ?? p.status,
    }));
    const columns = [
      { key: 'name', header: 'المنتج' },
      { key: 'category', header: 'القسم' },
      { key: 'cost', header: 'سعر الجملة', num: true },
      { key: 'suggestedPrice', header: 'السعر المقترح', num: true },
      { key: 'minPrice', header: 'الحد الأدنى للمبيع', num: true },
      { key: 'stock', header: 'المخزون', num: true },
      { key: 'ordered', header: 'القطع المطلوبة', num: true },
      { key: 'status', header: 'الحالة' },
    ];
    if (kind === 'excel') {
      exportToCsv('products.csv', rows, columns);
      showToast('تم تصدير ملف Excel');
    } else if (!printTablePdf('تقرير المنتجات', rows, columns)) {
      showToast('اسمح بالنوافذ المنبثقة لتصدير PDF');
    }
  };

  const hasActiveFilters = filters.search.trim() !== '' || filters.priceMin !== '' || filters.priceMax !== '' || filters.sortBy !== 'default';
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  if (products === null) {
    return (
      <section className="page">
        <div className="page-head"><div><h1>المنتجات</h1></div></div>
        <div className="skeleton" style={{ height: 220 }} />
      </section>
    );
  }

  return (
    <>
      <section className="page">
        <div className="page-head">
          <div><h1>المنتجات</h1><div className="sub">منتجاتك المعروضة على شبكة متاجر مدرار</div></div>
          <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
            <ExportMenu onExport={handleExport} />
            <button type="button" className="btn btn-primary" onClick={openAddDrawer}>+ منتج جديد</button>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Package size={16} strokeWidth={2} color="var(--brand-blue)" />عدد المنتجات</span>
            <div className="value en">{stats.count.toLocaleString('en-US')}</div>
          </div>
          <div className="kpi-card">
            <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Boxes size={16} strokeWidth={2} color="var(--brand-blue)" />المخزون العام</span>
            <div className="value en">{stats.stock.toLocaleString('en-US')}</div>
          </div>
          <div className="kpi-card">
            <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} strokeWidth={2} color="var(--success)" />منتجات معتمدة</span>
            <div className="value en" style={{ color: 'var(--success)' }}>{stats.approved.toLocaleString('en-US')}</div>
          </div>
          <div className="kpi-card">
            <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} strokeWidth={2} color="var(--warning)" />قيد المراجعة</span>
            <div className="value en" style={{ color: 'var(--warning)' }}>{stats.pending.toLocaleString('en-US')}</div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="panel">
            <div className="empty-state">
              <div className="title">لا توجد منتجات حتى الآن</div>
              <div className="msg">ابدأ بإضافة أول منتج إلى الكتالوج.</div>
              <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={openAddDrawer}>إضافة منتج</button>
            </div>
          </div>
        ) : (
          <div className="panel">
            <div className="filters-bar">
              <div className="field filters-search">
                <label>بحث بالاسم</label>
                <div className="search-box">
                  <Search size={16} strokeWidth={2} />
                  <input type="text" placeholder="ابحث عن منتج..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
                </div>
              </div>
              <div className="field filters-price">
                <label>التكلفة من</label>
                <input type="text" className="en" dir="ltr" placeholder="0" value={filters.priceMin} onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))} />
              </div>
              <div className="field filters-price">
                <label>إلى</label>
                <input type="text" className="en" dir="ltr" placeholder="∞" value={filters.priceMax} onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))} />
              </div>
              <div className="field filters-sort">
                <label>ترتيب حسب</label>
                <select value={filters.sortBy} onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}>
                  {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              {hasActiveFilters && (
                <button type="button" className="btn btn-secondary btn-sm filters-reset" onClick={clearFilters}>إعادة تعيين</button>
              )}
            </div>
            {hasActiveFilters && (
              <div className="filters-summary">
                عرض {filteredProducts.length} من {products.length} منتج
              </div>
            )}
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="title">لا توجد نتائج مطابقة</div>
                <div className="msg">جرّب تعديل كلمة البحث أو نطاق السعر.</div>
                <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={clearFilters}>إعادة تعيين الفلاتر</button>
              </div>
            ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>المنتج</th><th>القسم</th><th className="num">التكلفة</th><th className="num">المخزون</th><th>الحالة</th><th /></tr></thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="clickable" onClick={() => setDetailsProduct(p)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt="" className="prod-thumb" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="prod-thumb" style={{ background: thumbGradient(p.id) }} />
                )}
                          <div className="cell-main">{p.name}</div>
                        </div>
                      </td>
                      <td>
                        {categoryName(p.categoryId) ? (
                          <span className="badge badge-info">{categoryName(p.categoryId)}</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>بدون قسم</span>
                        )}
                      </td>
                      <td className="num">{firstCost(p)}</td>
                      <td className="num">{totalStock(p)}</td>
                      <td><span className={`badge ${STATUS_BADGE[p.status] ?? 'badge-neutral'}`}><span className="dot" />{STATUS_LABEL[p.status] ?? p.status}</span></td>
                      <td className="row-actions" style={{ justifyContent: 'flex-end', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => openEditDrawer(p)}>تعديل</button>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', color: 'var(--danger)' }} onClick={() => setDeleteTarget(p)}>حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}
      </section>

      {drawerMode && (
      <div className="modal-overlay" onMouseDown={handleOverlayMouseDown} onClick={handleOverlayClick}>
      <div className="modal-box form-modal">
        <div className="drawer-head">
          <h3>{drawerMode === 'edit' ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
          <button type="button" className="drawer-close" onClick={closeDrawer}><X size={16} strokeWidth={2} /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field full">
              <label>اسم المنتج</label>
              <input type="text" placeholder="مثال: كرسي مكتب دوّار" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="field full">
              <label>سعر الجملة</label>
              <input type="text" className="en" dir="ltr" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} />
            </div>
            <div className="field full">
              <label>السعر المقترح للمبيع (المفرق)</label>
              <input type="text" className="en" dir="ltr" placeholder={form.cost} value={form.suggestedPrice} onChange={(e) => setForm((f) => ({ ...f, suggestedPrice: e.target.value }))} />
            </div>
            <div className="field full">
              <label>الحد الأدنى للمبيع (المفرق)</label>
              <input type="text" className="en" dir="ltr" placeholder={form.cost} value={form.minPrice} onChange={(e) => setForm((f) => ({ ...f, minPrice: e.target.value }))} />
            </div>
            <div className="field full">
              <label>المخزون المتاح</label>
              <input type="text" className="en" dir="ltr" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
            </div>
            <div className="field full">
              <label>القسم</label>
              {addingCategory ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    style={{ flex: '1 1 160px' }}
                    placeholder="اسم القسم الجديد"
                    value={newCategoryName}
                    onChange={(e) => { setNewCategoryName(e.target.value); setCategoryError(''); }}
                    autoFocus
                  />
                  <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={handleCreateCategory} disabled={categorySaving}>
                    {categorySaving ? '...' : 'إضافة'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ width: 'auto' }}
                    onClick={() => { setAddingCategory(false); setNewCategoryName(''); setCategoryError(''); }}
                    disabled={categorySaving}
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <select
                  value={form.categoryId}
                  onChange={(e) => {
                    if (e.target.value === '__add__') { setAddingCategory(true); return; }
                    setForm((f) => ({ ...f, categoryId: e.target.value }));
                  }}
                >
                  <option value="">بدون قسم</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__add__">+ إضافة قسم جديد</option>
                </select>
              )}
              {categoryError && <span className="field-error">{categoryError}</span>}
            </div>
            <div className="field full">
              <label>الوصف</label>
              <textarea rows={3} placeholder="وصف مختصر للمنتج ومواصفاته" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="tip-box" style={{ gridColumn: '1/-1' }}>
              <div>
                <div className="t">نصيحة لعرض المنتج</div>
                <div className="s">أبرز المنتج بشكل واضح دون أي مشتتات خارجية، وأبرز التفاصيل المهمة. وإذا كان المنتج صغيرًا، يُفضّل تصويره على خلفية بيضاء ومن عدة جهات.</div>
              </div>
            </div>

            <div className="tip-box danger" style={{ gridColumn: '1/-1' }}>
              <div>
                <div className="t">تنبيه</div>
                <div className="s">يمنع اظهار وسائل التواصل بجميع أنواعها داخل الصور أو الفيديوهات. احرص على عدم اظهار رقم تواصل أو الأسم التجاري أو شعار أو عنوان أو أي دلالات قد تعرض الحساب للتوقيف.</div>
              </div>
            </div>

            <div className="field full">
              <label>صور المنتج <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div
                className={`dropzone${imageDrag ? ' drag' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setImageDrag(true); }}
                onDragLeave={() => setImageDrag(false)}
                onDrop={(e) => { e.preventDefault(); setImageDrag(false); addImages(e.dataTransfer.files); }}
              >
                <p>اسحب الصور هنا أو اضغط لاختيارها</p>
                <label className="pick">
                  اختيار الصور
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} />
                </label>
                <span className="field-hint">يمكنك إضافة أكثر من صورة للمنتج</span>
              </div>
              {imageFileError && <span className="field-error">{imageFileError}</span>}
              {images.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {images.map((img, i) => (
                    <div key={img.url} className={`img-thumb${i === 0 ? ' primary' : ''}`}>
                      <img src={img.url} alt="" />
                      {i === 0 && <span className="primary-tag">رئيسية</span>}
                      <div className="ctrls">
                        <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} style={{ color: 'var(--text-muted)' }}><ChevronRight size={13} strokeWidth={2} /></button>
                        <button type="button" onClick={() => removeImage(i)} style={{ fontWeight: 700, color: 'var(--danger)' }}>إزالة</button>
                        <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} style={{ color: 'var(--text-muted)' }}><ChevronLeft size={13} strokeWidth={2} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {missingImageError && <span className="field-error">{missingImageError}</span>}
            </div>

            <div className="field full">
              <label>فيديو المنتج <span className="field-hint">(اختياري)</span></label>
              {!video ? (
                <div
                  className={`dropzone${videoDrag ? ' drag' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setVideoDrag(true); }}
                  onDragLeave={() => setVideoDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setVideoDrag(false); addVideo(e.dataTransfer.files); }}
                >
                  <p>اسحب الفيديو هنا أو اضغط لاختياره</p>
                  <label className="pick">
                    اختيار فيديو
                    <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => { addVideo(e.target.files); e.target.value = ''; }} />
                  </label>
                </div>
              ) : (
                <div className="video-preview">
                  <video src={video.url} controls />
                  <button type="button" className="remove-btn" onClick={removeVideo} aria-label="إزالة الفيديو"><X size={12} strokeWidth={2.5} /></button>
                </div>
              )}
              {videoFileError && <span className="field-error">{videoFileError}</span>}
            </div>
          </div>
        </div>
        <div className="drawer-foot">
          <button type="button" className="btn btn-secondary" onClick={closeDrawer} disabled={saving}>إلغاء</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {drawerMode === 'edit' ? 'حفظ التعديلات' : 'إرسال للمراجعة'}
          </button>
        </div>
      </div>
      </div>
      )}

      {drawerMode && confirmExit && (
        <div className="modal-overlay" onClick={() => setConfirmExit(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 style={{ fontSize: '1.02rem', marginBottom: 10 }}>{drawerMode === 'edit' ? 'الخروج من تعديل المنتج؟' : 'الخروج من إضافة المنتج؟'}</h3>
            <p style={{ fontSize: '0.88rem', marginBottom: 16, color: 'var(--text-muted)' }}>هل أنت متأكد من الخروج؟ لن يتم حفظ البيانات التي أدخلتها.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" autoFocus onClick={() => setConfirmExit(false)}>لا</button>
              <button type="button" className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={closeDrawer}>نعم، خروج</button>
            </div>
          </div>
        </div>
      )}

      {detailsProduct && (
        <div className="modal-overlay" onClick={() => setDetailsProduct(null)}>
          <div className="modal-box form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h3>تفاصيل المنتج</h3>
              <button type="button" className="drawer-close" onClick={() => setDetailsProduct(null)}><X size={16} strokeWidth={2} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                {detailsProduct.images?.[0]?.url ? (
                  <img src={detailsProduct.images[0].url} alt="" className="prod-thumb" style={{ objectFit: 'cover', width: 64, height: 64 }} />
                ) : (
                  <div className="prod-thumb" style={{ background: thumbGradient(detailsProduct.id), width: 64, height: 64 }} />
                )}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 6 }}>{detailsProduct.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={`badge ${STATUS_BADGE[detailsProduct.status] ?? 'badge-neutral'}`}><span className="dot" />{STATUS_LABEL[detailsProduct.status] ?? detailsProduct.status}</span>
                    {categoryName(detailsProduct.categoryId)
                      ? <span className="badge badge-info">{categoryName(detailsProduct.categoryId)}</span>
                      : <span className="badge badge-neutral">بدون قسم</span>}
                  </div>
                </div>
              </div>

              <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)', marginBottom: 18 }}>
                <div className="kpi-card"><span className="label">سعر الجملة</span><div className="value en">{firstCost(detailsProduct)}</div></div>
                <div className="kpi-card"><span className="label">السعر المقترح للمبيع</span><div className="value en">{firstSuggestedPrice(detailsProduct)}</div></div>
                <div className="kpi-card"><span className="label">الحد الأدنى للمبيع</span><div className="value en">{firstMinPrice(detailsProduct)}</div></div>
                <div className="kpi-card"><span className="label">المخزون المتاح</span><div className="value en">{totalStock(detailsProduct)}</div></div>
                <div className="kpi-card"><span className="label">عدد القطع المطلوبة</span><div className="value en">{orderCounts[detailsProduct.id] ?? 0}</div></div>
                <div className="kpi-card"><span className="label">عدد الخيارات</span><div className="value en">{detailsProduct.variants.length}</div></div>
              </div>

              <div className="field full" style={{ marginBottom: 18 }}>
                <label>الوصف</label>
                <p style={{ fontSize: '0.88rem', color: detailsProduct.description ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                  {detailsProduct.description || 'لا يوجد وصف لهذا المنتج.'}
                </p>
              </div>

              {detailsProduct.images?.length > 1 && (
                <div className="field full" style={{ marginBottom: 18 }}>
                  <label>الصور</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {detailsProduct.images.map((img) => (
                      <img key={img.url} src={img.url} alt="" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-default)' }} />
                    ))}
                  </div>
                </div>
              )}

              {detailsProduct.video?.url && (
                <div className="field full">
                  <label>الفيديو</label>
                  <div className="video-preview"><video src={detailsProduct.video.url} controls /></div>
                </div>
              )}
            </div>
            <div className="drawer-foot">
              <button type="button" className="btn btn-secondary" onClick={() => setDetailsProduct(null)}>إغلاق</button>
              <button type="button" className="btn btn-primary" onClick={() => { const p = detailsProduct; setDetailsProduct(null); openEditDrawer(p); }}>تعديل المنتج</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.02rem' }}>حذف المنتج</h3>
              <button type="button" className="drawer-close" onClick={() => setDeleteTarget(null)}><X size={16} strokeWidth={2} /></button>
            </div>
            <p style={{ fontSize: '0.88rem', marginBottom: 16 }}>هل أنت متأكد من حذف «{deleteTarget.name}»؟</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>إلغاء</button>
              <button type="button" className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={handleDelete}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
