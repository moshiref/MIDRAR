import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import PageHeader from '../ui/PageHeader';
import { Skeleton } from '../ui/Skeleton';
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

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold text-text-primary">
      {label}
      {children}
    </label>
  );
}

const inputClass = 'rounded-md border border-border-default bg-surface px-3 py-2 text-sm font-normal text-text-primary';

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
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'تعديل المنتج' : 'إضافة منتج'} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="اسم المنتج">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              {errors.name && <span className="text-xs font-bold text-danger">هذا الحقل مطلوب</span>}
            </Field>
            <Field label="التصنيف">
              <select value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass}>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="الوصف">
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
            </Field>
            <Field label="المواصفات">
              <textarea rows={3} value={specs} onChange={(e) => setSpecs(e.target.value)} placeholder="مثال: الخامة، الأبعاد، الوزن..." className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-extrabold text-text-primary">الصور</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center text-sm ${dragOver ? 'border-brand-teal bg-brand-teal/5' : 'border-border-strong'}`}
          >
            <p className="text-text-secondary">اسحب الصور هنا أو</p>
            <label className="cursor-pointer rounded-md border border-border-default px-3 py-1.5 text-xs font-bold text-text-primary">
              اختر ملفات
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
            </label>
          </div>
          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={img.url} className="relative">
                  <img src={img.url} alt="" className="h-20 w-20 rounded-md object-cover" />
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <button type="button" onClick={() => moveImage(i, -1)} className="text-xs text-text-muted">◀</button>
                    <button type="button" onClick={() => removeImage(i)} className="text-xs font-bold text-danger">إزالة</button>
                    <button type="button" onClick={() => moveImage(i, 1)} className="text-xs text-text-muted">▶</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-text-primary">المتغيرات (اللون / المقاس / السعر / المخزون)</h2>
            <button type="button" onClick={addVariant} className="text-xs font-bold text-brand-blue">+ إضافة متغيّر</button>
          </div>
          <div className="flex flex-col gap-4">
            {variants.map((v, i) => (
              <div key={i} className="rounded-lg border border-border-default p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="اللون"><input value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} className={inputClass} /></Field>
                  <Field label="المقاس"><input value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} className={inputClass} /></Field>
                  <Field label="سعر التوريد ($)"><input type="number" min="0" value={v.supplyPrice} onChange={(e) => updateVariant(i, { supplyPrice: e.target.value })} className={inputClass} /></Field>
                  <Field label="الحد الأدنى للبيع ($)"><input type="number" min="0" value={v.minPrice} onChange={(e) => updateVariant(i, { minPrice: e.target.value })} className={inputClass} /></Field>
                  <Field label="السعر المقترح ($)"><input type="number" min="0" value={v.suggestedPrice} onChange={(e) => updateVariant(i, { suggestedPrice: e.target.value })} className={inputClass} /></Field>
                  <Field label="مدة التجهيز (أيام)"><input type="number" min="0" value={v.prepDays} onChange={(e) => updateVariant(i, { prepDays: e.target.value })} className={inputClass} /></Field>
                  <Field label="موقع المخزون">
                    <select value={v.location} onChange={(e) => updateVariant(i, { location: e.target.value })} className={inputClass}>
                      <option value="">اختر موقعًا</option>
                      {locations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
                    </select>
                  </Field>
                  <Field label="الكمية الابتدائية"><input type="number" min="0" value={v.stock} onChange={(e) => updateVariant(i, { stock: e.target.value })} className={inputClass} /></Field>
                </div>
                {errors[`variant-${i}`] && <p className="mt-2 text-xs font-bold text-danger">الرجاء تعبئة أسعار هذا المتغيّر (توريد / حد أدنى / مقترح)</p>}
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="mt-3 text-xs font-bold text-danger">إزالة هذا المتغيّر</button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Field label="حالة المنتج">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} max-w-xs`}>
              <option value="draft">مسودة (غير مرسلة بعد)</option>
              <option value="pending">إرسال للمراجعة</option>
            </select>
          </Field>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {!isEdit && <span className="me-auto text-xs text-text-muted">يُحفظ كمسودة محليًا تلقائيًا أثناء الكتابة</span>}
          <button type="button" onClick={handleCancel} className="rounded-md border border-border-default px-4 py-2 text-sm font-bold text-text-primary">
            إلغاء
          </button>
          <button type="submit" className="rounded-md bg-brand-navy px-5 py-2.5 text-sm font-bold text-white">
            {isEdit ? 'حفظ التعديلات' : 'إرسال المنتج'}
          </button>
        </div>
      </form>
    </div>
  );
}
