import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Field, SectionCard, SaveButton, MetaLine, useUnsavedGuard, useSettingsForm, formatDate, NoAccess } from '../SettingsShared';
import { WEEKDAYS, TIMEZONES } from '../settingsCatalog';
import { updateBusinessHours, getHolidays, addHoliday, cancelHoliday, getLocations } from '../../data/mockSupplierDb';
import { useToast } from '../../ui/SupplierToast';
import { useSupplierSession } from '../../session/SupplierSessionContext';

const EMPTY_HOLIDAY = { title: '', startDate: '', endDate: '', locationIds: [], reason: '', stopOrders: true, extendPrepDays: 0, notifyMidrar: false };

function HolidayModal({ locations, actorEmployeeId, supplierId, onClose, onDone }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_HOLIDAY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleLocation = (id) => setForm((f) => ({ ...f, locationIds: f.locationIds.includes(id) ? f.locationIds.filter((x) => x !== id) : [...f.locationIds, id] }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.startDate || !form.endDate) { setError('العنوان وتاريخ البداية والنهاية مطلوبة'); return; }
    setSaving(true);
    try {
      await addHoliday({ supplierId, actorEmployeeId, data: form });
      showToast('تمت إضافة الإجازة');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.02rem' }}>إضافة إجازة / إغلاق مؤقت</h3>
          <button type="button" className="drawer-close" onClick={onClose}><X size={16} strokeWidth={2} /></button>
        </div>
        <div className="form-grid" style={{ padding: 0 }}>
          <Field label="العنوان" full><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
          <Field label="من تاريخ"><input type="date" className="en" dir="ltr" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></Field>
          <Field label="إلى تاريخ"><input type="date" className="en" dir="ltr" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} /></Field>
          <Field label="المواقع المتأثرة" full>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {locations.map((l) => (
                <label key={l.id} className="perm-item"><input type="checkbox" checked={form.locationIds.includes(l.id)} onChange={() => toggleLocation(l.id)} /> {l.name}</label>
              ))}
            </div>
            <span className="field-hint">بدون تحديد = يشمل كل المواقع.</span>
          </Field>
          <Field label="سبب داخلي" full><textarea rows={2} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /></Field>
          <Field label="">
            <label className="perm-item"><input type="radio" name="mode" checked={form.stopOrders} onChange={() => setForm((f) => ({ ...f, stopOrders: true }))} /> إيقاف استقبال الطلبات خلال الإجازة</label>
          </Field>
          <Field label="">
            <label className="perm-item"><input type="radio" name="mode" checked={!form.stopOrders} onChange={() => setForm((f) => ({ ...f, stopOrders: false }))} /> الاستمرار مع تمديد مدة التجهيز</label>
          </Field>
          {!form.stopOrders && (
            <Field label="أيام التمديد على مدة التجهيز">
              <input type="number" min="0" className="en" dir="ltr" value={form.extendPrepDays} onChange={(e) => setForm((f) => ({ ...f, extendPrepDays: Number(e.target.value) }))} />
            </Field>
          )}
          <Field label="">
            <label className="perm-item"><input type="checkbox" checked={form.notifyMidrar} onChange={(e) => setForm((f) => ({ ...f, notifyMidrar: e.target.checked }))} /> إشعار إدارة مدرار بهذا التوقف (للإجازات الطويلة)</label>
          </Field>
          {error && <div style={{ gridColumn: '1/-1' }}><span className="field-error">{error}</span></div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>إلغاء</button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? '...' : 'إضافة'}</button>
        </div>
      </div>
    </div>
  );
}

function toForm(supplier) {
  const bh = supplier.businessHours;
  return { schedule: bh.schedule, acceptOrdersOutsideHours: bh.acceptOrdersOutsideHours, processOutsideHoursNextDay: bh.processOutsideHoursNextDay, courierPickupWindow: bh.courierPickupWindow, timezone: bh.timezone, updatedAt: bh.updatedAt };
}

export default function BusinessHoursPage({ supplier, employee, hasPermission }) {
  const { showToast } = useToast();
  const { refreshSupplier } = useSupplierSession();
  const { form, setForm, dirty, reset } = useSettingsForm(toForm(supplier));
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [holidays, setHolidaysState] = useState([]);
  const [addingHoliday, setAddingHoliday] = useState(false);
  const canEdit = hasPermission('settings.manage_hours');

  useEffect(() => { reset(toForm(supplier)); }, [supplier, reset]);
  useUnsavedGuard(dirty);

  const reloadHolidays = () => getHolidays(supplier.id).then(setHolidaysState);
  useEffect(() => {
    getLocations(supplier.id).then(setLocations);
    reloadHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  if (!canEdit) return <NoAccess label="صفحة أوقات العمل" />;

  const updateDay = (day, patch) => setForm((f) => ({ ...f, schedule: { ...f.schedule, [day]: { ...f.schedule[day], ...patch } } }));
  const updatePeriod = (day, idx, patch) => updateDay(day, { periods: form.schedule[day].periods.map((p, i) => (i === idx ? { ...p, ...patch } : p)) });
  const addPeriod = (day) => updateDay(day, { periods: [...form.schedule[day].periods, { start: '09:00', end: '18:00' }] });
  const removePeriod = (day, idx) => updateDay(day, { periods: form.schedule[day].periods.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBusinessHours({ supplierId: supplier.id, actorEmployeeId: employee.id, field: 'businessHours', patch: form, expectedUpdatedAt: form.updatedAt });
      showToast('تم حفظ أوقات العمل — تؤثر على الطلبات الجديدة دون تغيير طلب مؤكد سابقًا');
      await refreshSupplier();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelHoliday = async (h) => {
    await cancelHoliday({ holidayId: h.id, actorEmployeeId: employee.id });
    showToast('تم إلغاء الإجازة');
    reloadHolidays();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <form onSubmit={handleSubmit}>
        <SectionCard
          title="أوقات العمل"
          description="تؤثر على احتساب مهلة التجهيز والتنبيهات، دون تغيير طلب مؤكد سابقًا"
          meta={<MetaLine updatedAt={form.updatedAt} updatedBy={supplier.businessHours?.updatedBy} />}
          footer={<SaveButton saving={saving} dirty={dirty} />}
        >
          <div style={{ padding: '4px 22px 0' }}>
            {WEEKDAYS.map((d) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-default)', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, width: 100, fontWeight: 700, fontSize: '0.86rem' }}>
                  <input type="checkbox" checked={form.schedule[d.id].enabled} onChange={(e) => updateDay(d.id, { enabled: e.target.checked })} /> {d.label}
                </label>
                {form.schedule[d.id].enabled ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                    {form.schedule[d.id].periods.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="time" className="en" value={p.start} onChange={(e) => updatePeriod(d.id, i, { start: e.target.value })} style={{ padding: '6px 8px', border: '1.5px solid var(--border-default)', borderRadius: 7 }} />
                        <span>—</span>
                        <input type="time" className="en" value={p.end} onChange={(e) => updatePeriod(d.id, i, { end: e.target.value })} style={{ padding: '6px 8px', border: '1.5px solid var(--border-default)', borderRadius: 7 }} />
                        {form.schedule[d.id].periods.length > 1 && <button type="button" onClick={() => removePeriod(d.id, i)} style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>إزالة</button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => addPeriod(d.id)} style={{ fontSize: '0.78rem', color: 'var(--brand-blue)', fontWeight: 700 }}>+ فترة أخرى</button>
                  </div>
                ) : <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>غير عامل</span>}
              </div>
            ))}
          </div>
          <div className="form-grid">
            <Field label="المنطقة الزمنية">
              <select value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}>
                {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="مواعيد استلام شركات التوصيل">
              <input value={form.courierPickupWindow} onChange={(e) => setForm((f) => ({ ...f, courierPickupWindow: e.target.value }))} />
            </Field>
            <Field label="" full>
              <label className="perm-item"><input type="checkbox" checked={form.acceptOrdersOutsideHours} onChange={(e) => setForm((f) => ({ ...f, acceptOrdersOutsideHours: e.target.checked }))} /> قبول الطلبات خارج الدوام</label>
            </Field>
            <Field label="" full>
              <label className="perm-item"><input type="checkbox" checked={form.processOutsideHoursNextDay} onChange={(e) => setForm((f) => ({ ...f, processOutsideHoursNextDay: e.target.checked }))} /> معالجة الطلبات خارج الدوام في اليوم التالي</label>
            </Field>
          </div>
        </SectionCard>
      </form>

      <div className="panel">
        <div className="panel-head">
          <div><h3>الإجازات والاستثناءات</h3></div>
          <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setAddingHoliday(true)}>+ إضافة إجازة</button>
        </div>
        {holidays.length === 0 ? (
          <div className="empty-state"><div className="msg">لا توجد إجازات مضافة.</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>العنوان</th><th>من</th><th>إلى</th><th>التأثير</th><th>الحالة</th><th /></tr></thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h.id}>
                    <td className="cell-main">{h.title}</td>
                    <td>{formatDate(h.startDate)}</td>
                    <td>{formatDate(h.endDate)}</td>
                    <td style={{ fontSize: '0.82rem' }}>{h.stopOrders ? 'إيقاف استقبال الطلبات' : `تمديد ${h.extendPrepDays} يوم`}</td>
                    <td><span className={`badge ${h.status === 'cancelled' ? 'badge-neutral' : 'badge-info'}`}><span className="dot" />{h.status === 'cancelled' ? 'ملغاة' : 'قادمة'}</span></td>
                    <td className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      {h.status !== 'cancelled' && <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => handleCancelHoliday(h)}>إلغاء</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {addingHoliday && (
        <HolidayModal locations={locations} supplierId={supplier.id} actorEmployeeId={employee.id} onClose={() => setAddingHoliday(false)} onDone={() => { setAddingHoliday(false); reloadHolidays(); }} />
      )}
    </div>
  );
}
