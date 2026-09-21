import { useEffect, useState } from 'react';
import { Field, formatDate, NoAccess } from '../SettingsShared';
import {
  pauseOrderIntake, cancelOrderPause, pauseSupplierAccount, resumeSupplierAccount,
  requestAccountClosure, cancelAccountClosureRequest, getLocations,
} from '../../data/mockSupplierDb';
import { useSupplierSession } from '../../session/SupplierSessionContext';

export default function AccountManagementPage({ supplier, employee, hasPermission, reloadOverview }) {
  const { refreshSupplier } = useSupplierSession();
  const [locations, setLocations] = useState([]);
  const canPause = hasPermission('settings.pause_orders');
  const canClose = hasPermission('settings.request_account_closure');

  useEffect(() => { getLocations(supplier.id).then(setLocations); }, [supplier.id]);

  const refresh = async () => { await refreshSupplier(); reloadOverview(); };

  if (!canPause && !canClose) return <NoAccess label="صفحة إدارة الحساب" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {canPause && <PauseOrdersSection supplier={supplier} employee={employee} locations={locations} onDone={refresh} />}
      {canPause && <PauseAccountSection supplier={supplier} employee={employee} onDone={refresh} />}
      {canClose && <ClosureSection supplier={supplier} employee={employee} onDone={refresh} />}
    </div>
  );
}

function PauseOrdersSection({ supplier, employee, locations, onDone }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ dateFrom: '', dateTo: '', locationIds: [], reason: '' });
  const [saving, setSaving] = useState(false);
  const windows = supplier.orderPauseWindows ?? [];

  const toggleLocation = (id) => setForm((f) => ({ ...f, locationIds: f.locationIds.includes(id) ? f.locationIds.filter((x) => x !== id) : [...f.locationIds, id] }));

  const handleAdd = async () => {
    if (!form.dateFrom || !form.dateTo) { showToast('تاريخ البداية والنهاية مطلوبان', 'error'); return; }
    setSaving(true);
    try {
      await pauseOrderIntake({ supplierId: supplier.id, actorEmployeeId: employee.id, ...form });
      showToast('تم جدولة إيقاف استقبال الطلبات — لن تُلغى الطلبات المؤكدة حاليًا تلقائيًا');
      setForm({ dateFrom: '', dateTo: '', locationIds: [], reason: '' });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (windowId) => {
    await cancelOrderPause({ supplierId: supplier.id, actorEmployeeId: employee.id, windowId });
    showToast('تم إلغاء فترة الإيقاف');
    onDone();
  };

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>إيقاف استقبال الطلبات مؤقتًا</h3><div className="sub">لا يؤثر على الطلبات المؤكدة سابقًا</div></div></div>
      <div className="form-grid">
        <Field label="من تاريخ"><input type="date" className="en" dir="ltr" value={form.dateFrom} onChange={(e) => setForm((f) => ({ ...f, dateFrom: e.target.value }))} /></Field>
        <Field label="إلى تاريخ"><input type="date" className="en" dir="ltr" value={form.dateTo} onChange={(e) => setForm((f) => ({ ...f, dateTo: e.target.value }))} /></Field>
        <Field label="المواقع المتأثرة" full>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {locations.map((l) => <label key={l.id} className="perm-item"><input type="checkbox" checked={form.locationIds.includes(l.id)} onChange={() => toggleLocation(l.id)} /> {l.name}</label>)}
          </div>
          <span className="field-hint">بدون تحديد = كل المواقع.</span>
        </Field>
        <Field label="السبب" full><textarea rows={2} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /></Field>
      </div>
      <div className="panel-foot" style={{ justifyContent: 'flex-start' }}>
        <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={saving} onClick={handleAdd}>{saving ? '...' : 'جدولة الإيقاف'}</button>
      </div>
      {windows.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>من</th><th>إلى</th><th>السبب</th><th /></tr></thead>
            <tbody>
              {windows.map((w) => (
                <tr key={w.id}>
                  <td>{formatDate(w.dateFrom)}</td><td>{formatDate(w.dateTo)}</td><td>{w.reason || '—'}</td>
                  <td className="row-actions" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => handleCancel(w.id)}>إلغاء</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PauseAccountSection({ supplier, employee, onDone }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const isPaused = supplier.accountStatus === 'paused';

  const handlePause = async () => {
    if (!password) { setError('يرجى إعادة إدخال كلمة المرور'); return; }
    try {
      await pauseSupplierAccount({ supplierId: supplier.id, actorEmployeeId: employee.id, confirmPassword: password, reason });
      showToast('تم إيقاف الحساب مؤقتًا');
      setConfirming(false);
      setPassword('');
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResume = async () => {
    await resumeSupplierAccount({ supplierId: supplier.id, actorEmployeeId: employee.id });
    showToast('تم تفعيل الحساب مجددًا');
    onDone();
  };

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>إيقاف الحساب مؤقتًا</h3></div></div>
      <div style={{ padding: '4px 22px 20px' }}>
        {isPaused ? (
          <div className="tip-box danger" style={{ marginTop: 0 }}>
            <div>
              <div className="t">الحساب متوقف مؤقتًا</div>
              <div className="s">{supplier.pausedReason || '—'}</div>
              <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto', marginTop: 8 }} onClick={handleResume}>إعادة تفعيل الحساب</button>
            </div>
          </div>
        ) : confirming ? (
          <div className="form-grid" style={{ padding: 0, gridTemplateColumns: '1fr' }}>
            <Field label="السبب"><textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
            <Field label="أعد إدخال كلمة المرور" error={error}><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setConfirming(false)}>تراجع</button>
              <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto', background: 'var(--danger)' }} onClick={handlePause}>تأكيد الإيقاف</button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setConfirming(true)}>إيقاف الحساب مؤقتًا</button>
        )}
      </div>
    </div>
  );
}

function ClosureSection({ supplier, employee, onDone }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const request = supplier.closureRequest;

  const handleSubmit = async () => {
    if (!reason.trim()) { setError('يرجى ذكر سبب الإغلاق'); return; }
    if (!password) { setError('يرجى إعادة إدخال كلمة المرور'); return; }
    try {
      await requestAccountClosure({ supplierId: supplier.id, actorEmployeeId: employee.id, confirmPassword: password, reason });
      showToast('تم إرسال طلب إغلاق الحساب إلى إدارة مدرار');
      setConfirming(false);
      setPassword('');
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async () => {
    await cancelAccountClosureRequest({ supplierId: supplier.id, actorEmployeeId: employee.id });
    showToast('تم إلغاء طلب الإغلاق');
    onDone();
  };

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>طلب إغلاق الحساب</h3><div className="sub">لا يوجد حذف فوري للحساب أو السجلات المالية</div></div></div>
      <div style={{ padding: '4px 22px 20px' }}>
        {request ? (
          <div className="tip-box danger" style={{ marginTop: 0 }}>
            <div>
              <div className="t">طلب إغلاق قيد المراجعة</div>
              <div className="s">{request.reason}</div>
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', marginTop: 8 }} onClick={handleCancel}>إلغاء الطلب</button>
            </div>
          </div>
        ) : confirming ? (
          <div className="form-grid" style={{ padding: 0, gridTemplateColumns: '1fr' }}>
            <div className="tip-box" style={{ marginTop: 0 }}>
              <div className="s">لن يكتمل الطلب إذا وُجدت طلبات مفتوحة أو مستحقات لم تُصرف أو نزاعات قائمة — سيُصدر كشف ختامي بعد اعتماد الإدارة.</div>
            </div>
            <Field label="سبب الإغلاق" error={error && !password ? undefined : undefined}><textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
            <Field label="أعد إدخال كلمة المرور" error={error}><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setConfirming(false)}>تراجع</button>
              <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto', background: 'var(--danger)' }} onClick={handleSubmit}>إرسال طلب الإغلاق</button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', color: 'var(--danger)' }} onClick={() => setConfirming(true)}>طلب إغلاق الحساب</button>
        )}
      </div>
    </div>
  );
}
