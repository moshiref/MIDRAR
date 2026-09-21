import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getLocations, addLocation, updateLocation } from '../../data/mockSupplierDb';
import { PROVINCES } from '../settingsCatalog';
import { useToast } from '../../ui/SupplierToast';
import { Field, MetaLine, NoAccess } from '../SettingsShared';

const EMPTY = { name: '', code: '', province: PROVINCES[0], city: '', district: '', address: '', landmark: '', mapUrl: '', managerPhone: '', accessInstructions: '', defaultPrepDays: 3, acceptsReturns: true, notes: '' };

function LocationModal({ location, supplierId, actorEmployeeId, onClose, onDone }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(location ? { ...EMPTY, ...location } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim()) { setError('اسم الموقع والمدينة مطلوبان'); return; }
    setSaving(true);
    setError('');
    try {
      if (location) await updateLocation({ locationId: location.id, actorEmployeeId, patch: form });
      else await addLocation({ supplierId, actorEmployeeId, data: form });
      showToast(location ? 'تم تحديث الموقع' : 'تم إضافة الموقع');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>{location ? `تعديل «${location.name}»` : 'إضافة موقع تجهيز'}</h3>
          <button type="button" className="drawer-close" onClick={onClose}><X size={16} strokeWidth={2} /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <Field label="اسم الموقع (داخلي)"><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="رمز مختصر"><input className="en" dir="ltr" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} /></Field>
            <Field label="المحافظة">
              <select value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="المدينة"><input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} /></Field>
            <Field label="المنطقة / الحي"><input value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} /></Field>
            <Field label="نقطة دالة"><input value={form.landmark} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))} /></Field>
            <Field label="العنوان التفصيلي" full><input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></Field>
            <Field label="الموقع على الخريطة (رابط، اختياري)"><input className="en" dir="ltr" value={form.mapUrl} onChange={(e) => setForm((f) => ({ ...f, mapUrl: e.target.value }))} /></Field>
            <Field label="هاتف مسؤول الموقع"><input className="en" dir="ltr" value={form.managerPhone} onChange={(e) => setForm((f) => ({ ...f, managerPhone: e.target.value }))} /></Field>
            <Field label="مدة التجهيز الافتراضية (أيام)"><input type="number" min="0" className="en" dir="ltr" value={form.defaultPrepDays} onChange={(e) => setForm((f) => ({ ...f, defaultPrepDays: Number(e.target.value) }))} /></Field>
            <Field label="تعليمات وصول داخلية لشركة التوصيل" full>
              <textarea rows={2} value={form.accessInstructions} onChange={(e) => setForm((f) => ({ ...f, accessInstructions: e.target.value }))} />
            </Field>
            <Field label="ملاحظات تشغيلية" full>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </Field>
            <Field label="">
              <label className="perm-item"><input type="checkbox" checked={form.acceptsReturns} onChange={(e) => setForm((f) => ({ ...f, acceptsReturns: e.target.checked }))} /> يستقبل مرتجعات</label>
            </Field>
            {error && <div style={{ gridColumn: '1/-1' }}><span className="field-error">{error}</span></div>}
          </div>
        </div>
        <div className="drawer-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>إلغاء</button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? '...' : 'حفظ'}</button>
        </div>
      </div>
    </div>
  );
}

export default function LocationsPage({ supplier, employee, hasPermission }) {
  const { showToast } = useToast();
  const [locations, setLocations] = useState(null);
  const [modalTarget, setModalTarget] = useState(null); // null | 'new' | location
  const [statusConfirm, setStatusConfirm] = useState(null); // { location, nextStatus, forceMessage }
  const canEdit = hasPermission('settings.manage_locations');

  const reload = () => getLocations(supplier.id).then(setLocations);
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  if (!canEdit) return <NoAccess label="صفحة مواقع التجهيز" />;
  if (!locations) return <div className="panel"><div className="skeleton" style={{ height: 200, margin: 22 }} /></div>;

  const handleToggleStatus = async (loc, force = false) => {
    const nextStatus = loc.status === 'active' ? 'paused' : 'active';
    try {
      await updateLocation({ locationId: loc.id, actorEmployeeId: employee.id, patch: { status: nextStatus, confirmDespiteOpenActivity: force } });
      showToast(nextStatus === 'active' ? 'تم تفعيل الموقع' : 'تم إيقاف الموقع مؤقتًا');
      setStatusConfirm(null);
      reload();
    } catch (err) {
      setStatusConfirm({ location: loc, nextStatus, forceMessage: err.message });
    }
  };

  const handleSetDefault = async (loc) => {
    await updateLocation({ locationId: loc.id, actorEmployeeId: employee.id, patch: { isDefault: true } });
    showToast('تم تعيينه كموقع افتراضي');
    reload();
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div><h3>مواقع التجهيز</h3><div className="sub">العنوان لا يظهر للتاجر أو العميل — يصل لشركة التوصيل فقط عند إسناد شحنة</div></div>
        <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setModalTarget('new')}>+ إضافة موقع</button>
      </div>

      {locations.length === 0 ? (
        <div className="empty-state"><div className="title">لا توجد مواقع بعد</div><div className="msg">أضف أول موقع تجهيز لمؤسستك.</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>الموقع</th><th>المحافظة/المدينة</th><th>هاتف المسؤول</th><th className="num">مدة التجهيز</th><th>الحالة</th><th /></tr></thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div className="cell-main">{l.name} {l.isDefault && <span className="badge badge-info" style={{ marginInlineStart: 6 }}>افتراضي</span>}</div>
                    <div className="cell-sub">{l.code}</div>
                  </td>
                  <td>{l.province} — {l.city}</td>
                  <td className="num">{l.managerPhone || '—'}</td>
                  <td className="num">{l.defaultPrepDays} يوم</td>
                  <td><span className={`badge ${l.status === 'active' ? 'badge-success' : 'badge-neutral'}`}><span className="dot" />{l.status === 'active' ? 'نشط' : l.status === 'paused' ? 'متوقف مؤقتًا' : 'مغلق'}</span></td>
                  <td className="row-actions" style={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 6 }}>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setModalTarget(l)}>تعديل</button>
                    {!l.isDefault && <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => handleSetDefault(l)}>جعله افتراضيًا</button>}
                    <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => handleToggleStatus(l)}>{l.status === 'active' ? 'إيقاف مؤقت' : 'تفعيل'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="panel-foot" style={{ justifyContent: 'flex-start' }}>
        <MetaLine updatedAt={locations[0]?.updatedAt} updatedBy={locations[0]?.updatedBy} />
      </div>

      {modalTarget && (
        <LocationModal
          location={modalTarget === 'new' ? null : modalTarget}
          supplierId={supplier.id}
          actorEmployeeId={employee.id}
          onClose={() => setModalTarget(null)}
          onDone={() => { setModalTarget(null); reload(); }}
        />
      )}

      {statusConfirm && (
        <div className="modal-overlay" onClick={() => setStatusConfirm(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.02rem' }}>تأكيد إيقاف الموقع</h3>
              <button type="button" className="drawer-close" onClick={() => setStatusConfirm(null)}><X size={16} strokeWidth={2} /></button>
            </div>
            <p style={{ fontSize: '0.88rem', marginBottom: 16 }}>{statusConfirm.forceMessage}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStatusConfirm(null)}>تراجع</button>
              <button type="button" className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={() => handleToggleStatus(statusConfirm.location, true)}>إيقاف رغم ذلك</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
