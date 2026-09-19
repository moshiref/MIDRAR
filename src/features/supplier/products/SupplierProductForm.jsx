import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '../ui/SupplierToast';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getProduct, addProduct, updateProduct, getLocations } from '../data/mockSupplierDb';

const SECTORS = ['أثاث وديكور منزلي', 'إلكترونيات', 'أزياء وإكسسوارات', 'مستلزمات أطفال', 'مستلزمات منزلية', 'أخرى'];

// Autosave only applies to the "new product" flow — editing an existing
// product already loads its real saved state, so a stale local draft
// there would be confusing rather than helpful. Images are excluded:
// their object URLs die on reload, so there's nothing meaningful to
// restore for them.
const DRAFT_KEY = 'midrar_supplier_product_draft_v1';

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY));
  } catch {
    return null;
  }
}

const EMPTY_VARIANT = () => ({
  color: '', size: '',
  supplyPrice: '', minPrice: '', suggestedPrice: '',
  prepDays: '', location: '', stock: '',
});

export default function SupplierProductForm() {
  const { supplier } = useSupplierSession();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEdit = Boolean(productId);

  const [loading, setLoading] = useState(isEdit);
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState(SECTORS[0]);
  const [specs, setSpecs] = useState('');
  const [status, setStatus] = useState('draft');
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([EMPTY_VARIANT()]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getLocations(supplier.id).then(setLocations);
  }, [supplier.id]);

  useEffect(() => {
    if (isEdit) return;
    const draft = readDraft();
    if (!draft) return;
    setName(draft.name ?? '');
    setDescription(draft.description ?? '');
    setSector(draft.sector ?? SECTORS[0]);
    setSpecs(draft.specs ?? '');
    setStatus(draft.status ?? 'draft');
    setVariants(draft.variants?.length ? draft.variants : [EMPTY_VARIANT()]);
    showToast('تم استرجاع مسودة محفوظة تلقائيًا', 'info');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) return;
    const timer = setTimeout(() => {
      const isEmpty = !name.trim() && !description.trim() && variants.every((v) => !v.color && !v.size && !v.supplyPrice);
      if (isEmpty) return;
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ name, description, sector, specs, status, variants }));
      } catch {
        /* storage unavailable — autosave just won't persist this run */
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isEdit, name, description, sector, specs, status, variants]);

  useEffect(() => {
    if (!isEdit) return;
    getProduct(productId).then((p) => {
      if (!p) return;
      setName(p.name);
      setDescription(p.description ?? '');
      setSector(p.sector ?? SECTORS[0]);
      setSpecs(p.specs ?? '');
      setStatus(p.status);
      setImages(p.images ?? []);
      setVariants(p.variants.map((v) => ({
        color: v.color ?? '', size: v.size ?? v.label ?? '',
        supplyPrice: v.supplyPrice?.amount ?? '', minPrice: v.minPrice?.amount ?? '', suggestedPrice: v.suggestedPrice?.amount ?? '',
        prepDays: v.prepDays ?? '', location: v.location ?? '', stock: v.stock?.actual ?? '',
      })));
      setLoading(false);
    });
  }, [isEdit, productId]);

  const addImages = (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    const next = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...next]);
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

  const updateVariant = (index, patch) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };
  const addVariant = () => setVariants((prev) => [...prev, EMPTY_VARIANT()]);
  const removeVariant = (index) => setVariants((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = true;
    variants.forEach((v, i) => {
      if (!v.supplyPrice || !v.minPrice || !v.suggestedPrice) next[`variant-${i}`] = true;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      supplierId: supplier.id,
      name: name.trim(),
      description: description.trim(),
      sector,
      specs: specs.trim(),
      images,
      status,
      variants: variants.map((v) => ({
        color: v.color.trim(),
        size: v.size.trim(),
        label: [v.color, v.size].filter(Boolean).join(' - ') || undefined,
        supplyPrice: { amount: Number(v.supplyPrice), currency: 'USD' },
        minPrice: { amount: Number(v.minPrice), currency: 'USD' },
        suggestedPrice: { amount: Number(v.suggestedPrice), currency: 'USD' },
        prepDays: Number(v.prepDays) || 0,
        location: v.location || locations[0]?.name || '',
        stock: { actual: Number(v.stock) || 0, reserved: 0 },
      })),
      actorName: supplier.companyName,
    };

    if (isEdit) {
      await updateProduct({ productId, patch: payload, actorName: supplier.companyName });
      showToast('تم حفظ تعديلات المنتج');
    } else {
      await addProduct(payload);
      localStorage.removeItem(DRAFT_KEY);
      showToast('تم إرسال المنتج، بانتظار اعتماد إدارة مدرار');
    }
    navigate('/supplier/products');
  };

  const handleCancel = () => {
    if (!isEdit) localStorage.removeItem(DRAFT_KEY);
    navigate('/supplier/products');
  };

  if (loading) {
    return (
      <section className="page">
        <div className="page-head"><div><h1>تعديل المنتج</h1></div></div>
        <div className="skeleton" style={{ height: 320 }} />
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head"><div><h1>{isEdit ? 'تعديل المنتج' : 'إضافة منتج'}</h1></div></div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="panel">
          <div className="form-grid">
            <div className="field">
              <label>اسم المنتج</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--danger)' }}>هذا الحقل مطلوب</span>}
            </div>
            <div className="field">
              <label>التصنيف</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)}>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>الوصف</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label>المواصفات</label>
              <textarea rows={3} value={specs} onChange={(e) => setSpecs(e.target.value)} placeholder="مثال: الخامة، الأبعاد، الوزن..." />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3>الصور</h3></div>
          <div style={{ padding: 20 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}
              className={`dropzone${dragOver ? ' drag' : ''}`}
            >
              <p>اسحب الصور هنا أو</p>
              <label className="pick">
                اختر ملفات
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => addImages(e.target.files)} />
              </label>
            </div>
            {images.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {images.map((img, i) => (
                  <div key={img.url} className="img-thumb">
                    <img src={img.url} alt="" />
                    <div className="ctrls">
                      <button type="button" onClick={() => moveImage(i, -1)} style={{ color: 'var(--text-muted)' }}><ChevronRight size={13} strokeWidth={2} /></button>
                      <button type="button" onClick={() => removeImage(i)} style={{ fontWeight: 700, color: 'var(--danger)' }}>إزالة</button>
                      <button type="button" onClick={() => moveImage(i, 1)} style={{ color: 'var(--text-muted)' }}><ChevronLeft size={13} strokeWidth={2} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>المتغيرات (اللون / المقاس / السعر / المخزون)</h3>
            <button type="button" onClick={addVariant} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-blue)' }}>+ إضافة متغيّر</button>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {variants.map((v, i) => (
              <div key={i} className="variant-card">
                <div className="form-grid grid-4" style={{ padding: 0 }}>
                  <div className="field"><label>اللون</label><input value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} /></div>
                  <div className="field"><label>المقاس</label><input value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} /></div>
                  <div className="field"><label>سعر التوريد ($)</label><input type="number" min="0" className="en" dir="ltr" value={v.supplyPrice} onChange={(e) => updateVariant(i, { supplyPrice: e.target.value })} /></div>
                  <div className="field"><label>الحد الأدنى للبيع ($)</label><input type="number" min="0" className="en" dir="ltr" value={v.minPrice} onChange={(e) => updateVariant(i, { minPrice: e.target.value })} /></div>
                  <div className="field"><label>السعر المقترح ($)</label><input type="number" min="0" className="en" dir="ltr" value={v.suggestedPrice} onChange={(e) => updateVariant(i, { suggestedPrice: e.target.value })} /></div>
                  <div className="field"><label>مدة التجهيز (أيام)</label><input type="number" min="0" className="en" dir="ltr" value={v.prepDays} onChange={(e) => updateVariant(i, { prepDays: e.target.value })} /></div>
                  <div className="field">
                    <label>موقع المخزون</label>
                    <select value={v.location} onChange={(e) => updateVariant(i, { location: e.target.value })}>
                      <option value="">اختر موقعًا</option>
                      {locations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>الكمية الابتدائية</label><input type="number" min="0" className="en" dir="ltr" value={v.stock} onChange={(e) => updateVariant(i, { stock: e.target.value })} /></div>
                </div>
                {errors[`variant-${i}`] && <p style={{ marginTop: 8, fontSize: '0.76rem', fontWeight: 700, color: 'var(--danger)' }}>الرجاء تعبئة أسعار هذا المتغيّر (توريد / حد أدنى / مقترح)</p>}
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} style={{ marginTop: 10, fontSize: '0.78rem', fontWeight: 700, color: 'var(--danger)' }}>إزالة هذا المتغيّر</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field" style={{ maxWidth: 280 }}>
              <label>حالة المنتج</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">مسودة (غير مرسلة بعد)</option>
                <option value="pending">إرسال للمراجعة</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          {!isEdit && <span style={{ marginInlineEnd: 'auto', fontSize: '0.76rem', color: 'var(--text-muted)' }}>يُحفظ كمسودة محليًا تلقائيًا أثناء الكتابة</span>}
          <button type="button" onClick={handleCancel} className="btn btn-secondary">إلغاء</button>
          <button type="submit" className="btn btn-primary">{isEdit ? 'حفظ التعديلات' : 'إرسال المنتج'}</button>
        </div>
      </form>
    </section>
  );
}
