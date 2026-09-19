import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getCategories, getCategoryProductCounts, addCategory, updateCategory, deleteCategory } from '../data/mockSupplierDb';

function showToast(message) {
  if (typeof window.showToast === 'function') window.showToast(message);
}

export default function SupplierCategoriesPage() {
  const { supplier, employee } = useSupplierSession();
  const [categories, setCategories] = useState(null);
  const [counts, setCounts] = useState({});
  const [modal, setModal] = useState(null); // { mode: 'add' | 'edit', category? }
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // category being confirmed for deletion
  const [deleteError, setDeleteError] = useState('');
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    const [list, productCounts] = await Promise.all([
      getCategories(supplier.id),
      getCategoryProductCounts(supplier.id),
    ]);
    setCategories(list);
    setCounts(productCounts);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

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
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={openAdd}>+ إضافة قسم</button>
        </div>
      </div>

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
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>القسم</th>
                  <th className="num">عدد المنتجات</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-main">{c.name}</td>
                    <td className="num en">{counts[c.id] ?? 0}</td>
                    <td className="row-actions" style={{ justifyContent: 'flex-end', gap: 8 }}>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => openEdit(c)}>تعديل</button>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', color: 'var(--danger)' }} onClick={() => { setDeleteTarget(c); setDeleteError(''); }}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
