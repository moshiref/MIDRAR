import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Field, StatusBadge, formatDate, NoAccess } from '../SettingsShared';
import { DOCUMENT_TYPES, DOCUMENT_STATUS } from '../settingsCatalog';
import { getDocuments, upsertDocument, archiveDocument, documentEffectiveStatus } from '../../data/mockSupplierDb';
import { useToast } from '../../ui/SupplierToast';

const EMPTY = { type: DOCUMENT_TYPES[0].id, number: '', issuer: '', issueDate: '', expiryDate: '', file: null };

function DocumentModal({ document, supplierId, actorEmployeeId, onClose, onDone }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(document ? { ...EMPTY, ...document } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, file: reader.result, fileName: f.name }));
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    if (!form.number.trim()) { setError('رقم الوثيقة مطلوب'); return; }
    setSaving(true);
    try {
      await upsertDocument({ supplierId, actorEmployeeId, document: form });
      showToast(document ? 'تم تحديث الوثيقة — بانتظار المراجعة' : 'تم رفع الوثيقة — بانتظار المراجعة');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.02rem' }}>{document ? 'تعديل وثيقة' : 'رفع وثيقة جديدة'}</h3>
          <button type="button" className="drawer-close" onClick={onClose}><X size={16} strokeWidth={2} /></button>
        </div>
        <div className="form-grid" style={{ padding: 0 }}>
          <Field label="نوع الوثيقة" full>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {DOCUMENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="رقم الوثيقة"><input className="en" dir="ltr" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} /></Field>
          <Field label="جهة الإصدار"><input value={form.issuer} onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))} /></Field>
          <Field label="تاريخ الإصدار"><input type="date" className="en" dir="ltr" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} /></Field>
          <Field label="تاريخ الانتهاء (إن وجد)"><input type="date" className="en" dir="ltr" value={form.expiryDate ?? ''} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value || null }))} /></Field>
          <Field label="الملف" full>
            <input type="file" accept="image/*,application/pdf" onChange={handleFile} />
            {form.fileName && <span className="field-hint">{form.fileName}</span>}
          </Field>
          {error && <div style={{ gridColumn: '1/-1' }}><span className="field-error">{error}</span></div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>إلغاء</button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? '...' : 'حفظ'}</button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage({ supplier, employee, hasPermission }) {
  const { showToast } = useToast();
  const [docs, setDocs] = useState(null);
  const [modalTarget, setModalTarget] = useState(null);
  const canEdit = hasPermission('settings.manage_documents');

  const reload = () => getDocuments(supplier.id).then(setDocs);
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  if (!canEdit) return <NoAccess label="صفحة الوثائق والتحقق" />;
  if (!docs) return <div className="panel"><div className="skeleton" style={{ height: 200, margin: 22 }} /></div>;

  const expiring = docs.filter((d) => ['expiring_soon', 'expired'].includes(documentEffectiveStatus(d)));

  const handleArchive = async (doc) => {
    await archiveDocument({ documentId: doc.id, actorEmployeeId: employee.id });
    showToast('تم أرشفة الوثيقة');
    reload();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {expiring.length > 0 && (
        <div className="tip-box danger">
          <div>
            <div className="t">وثائق تحتاج انتباهك</div>
            {expiring.map((d) => <div key={d.id} className="s">{DOCUMENT_TYPES.find((t) => t.id === d.type)?.label} — {DOCUMENT_STATUS[documentEffectiveStatus(d)]?.label}</div>)}
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <div><h3>الوثائق والتحقق</h3><div className="sub">لا تُحذف وثيقة سابقة مطلوبة قانونيًا — تُؤرشف مع سجل تعديلاتها</div></div>
          <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setModalTarget('new')}>+ رفع وثيقة</button>
        </div>
        {docs.filter((d) => documentEffectiveStatus(d) !== 'archived').length === 0 ? (
          <div className="empty-state"><div className="title">لا توجد وثائق مرفوعة بعد</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>النوع</th><th>الرقم</th><th>جهة الإصدار</th><th>تاريخ الانتهاء</th><th>الحالة</th><th /></tr></thead>
              <tbody>
                {docs.filter((d) => documentEffectiveStatus(d) !== 'archived').map((d) => (
                  <tr key={d.id}>
                    <td className="cell-main">{DOCUMENT_TYPES.find((t) => t.id === d.type)?.label ?? d.type}</td>
                    <td className="num">{d.number}</td>
                    <td>{d.issuer || '—'}</td>
                    <td>{formatDate(d.expiryDate)}</td>
                    <td><StatusBadge status={documentEffectiveStatus(d)} map={DOCUMENT_STATUS} /></td>
                    <td className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setModalTarget(d)}>تعديل</button>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => handleArchive(d)}>أرشفة</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalTarget && (
        <DocumentModal document={modalTarget === 'new' ? null : modalTarget} supplierId={supplier.id} actorEmployeeId={employee.id} onClose={() => setModalTarget(null)} onDone={() => { setModalTarget(null); reload(); }} />
      )}
    </div>
  );
}
