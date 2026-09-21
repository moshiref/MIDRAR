import { useEffect, useMemo, useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { Field, MetaLine, NoAccess, formatDateTime } from '../SettingsShared';
import { PAYOUT_METHOD_STATUS } from '../settingsCatalog';
import { getPayouts, updatePayoutMethod, createTicket } from '../../data/mockSupplierDb';
import { useToast } from '../../ui/SupplierToast';
import { useSupplierSession } from '../../session/SupplierSessionContext';

function maskNumber(number) {
  if (!number) return '—';
  const str = String(number);
  return str.length <= 4 ? str : `${'*'.repeat(str.length - 4)}${str.slice(-4)}`;
}

function PayoutMethodModal({ current, supplierId, actorEmployeeId, onClose, onDone }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ type: current?.type ?? 'wallet', walletProvider: current?.walletProvider ?? '', holderName: current?.holderName ?? '', number: '', currency: current?.currency ?? 'SYP', note: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.holderName.trim() || !form.number.trim()) { setError('اسم صاحب المحفظة ورقمها مطلوبان'); return; }
    if (!confirmPassword) { setError('يرجى إعادة إدخال كلمة المرور لتأكيد التغيير'); return; }
    setSaving(true);
    try {
      await updatePayoutMethod({ supplierId, actorEmployeeId, confirmPassword, patch: form });
      showToast('تم تحديث وسيلة استلام الأموال — بانتظار التحقق، وسريان تنفيذ الدفعات إليها معلّق 24 ساعة');
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
          <h3 style={{ fontSize: '1.02rem' }}>تعديل وسيلة استلام الأموال</h3>
          <button type="button" className="drawer-close" onClick={onClose}><X size={16} strokeWidth={2} /></button>
        </div>
        <div className="tip-box danger" style={{ marginTop: 0, marginBottom: 14 }}>
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <div className="s">يتطلب هذا الإجراء إعادة إدخال كلمة المرور، ويصل إشعار فوري لمالك الحساب ولوسيلة التواصل السابقة، وتُطبَّق فترة أمان 24 ساعة قبل تنفيذ أي دفعة للوسيلة الجديدة.</div>
        </div>
        <div className="form-grid" style={{ padding: 0 }}>
          <Field label="نوع الوسيلة" full>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="wallet">محفظة إلكترونية خارجية</option>
              <option value="cash">استلام نقدي من مدرار</option>
            </select>
          </Field>
          {form.type === 'wallet' && (
            <Field label="اسم المحفظة"><input value={form.walletProvider} onChange={(e) => setForm((f) => ({ ...f, walletProvider: e.target.value }))} /></Field>
          )}
          <Field label="اسم صاحبها"><input value={form.holderName} onChange={(e) => setForm((f) => ({ ...f, holderName: e.target.value }))} /></Field>
          <Field label="رقم المحفظة"><input className="en" dir="ltr" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} /></Field>
          <Field label="العملة المدعومة">
            <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
              <option value="SYP">ليرة سورية جديدة</option>
              <option value="USD">دولار أمريكي</option>
            </select>
          </Field>
          <Field label="ملاحظة (اختياري)"><input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} /></Field>
          <Field label="أعد إدخال كلمة المرور" full><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></Field>
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

export default function FinancialSettingsPage({ supplier, employee, hasPermission }) {
  const { showToast } = useToast();
  const { refreshSupplier } = useSupplierSession();
  const [payouts, setPayouts] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [requestingRuleChange, setRequestingRuleChange] = useState(false);
  const canView = hasPermission('settings.view_financial');
  const canEditPayout = hasPermission('finance.edit_payout_method');

  useEffect(() => { getPayouts(supplier.id).then(setPayouts); }, [supplier.id]);

  const totals = useMemo(() => {
    if (!payouts) return {};
    const byCurrency = {};
    payouts.forEach((p) => {
      byCurrency[p.currency] ??= { eligible: 0, executed: 0 };
      if (p.status === 'eligible') byCurrency[p.currency].eligible += p.netAmount;
      else if (p.status === 'executed') byCurrency[p.currency].executed += p.netAmount;
    });
    return byCurrency;
  }, [payouts]);

  if (!canView) return <NoAccess label="صفحة الإعدادات المالية" />;

  const method = supplier.payoutMethod;
  const statusInfo = PAYOUT_METHOD_STATUS[method?.status] ?? { label: '—', badge: 'badge-neutral' };
  const lastExecuted = payouts?.filter((p) => p.status === 'executed').sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt))[0];

  const handleRequestRuleChange = async () => {
    setRequestingRuleChange(true);
    try {
      await createTicket({ supplierId: supplier.id, subject: 'طلب تعديل قواعد الدفع', relatedType: 'settings', relatedId: supplier.id, reason: 'مراجعة قواعد الدفع', message: 'أطلب من إدارة مدرار مراجعة قواعد الدفع الحالية لحسابي.', actorName: employee.name });
      showToast('تم إرسال طلب مراجعة قواعد الدفع إلى إدارة مدرار');
    } finally {
      setRequestingRuleChange(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="kpi-grid" style={{ gridTemplateColumns: `repeat(${Math.max(Object.keys(totals).length * 2, 2)},1fr)` }}>
        {Object.entries(totals).map(([currency, t]) => (
          <div key={currency} className="kpi-card"><span className="label">مستحق ({currency})</span><div className="value en">{t.eligible.toLocaleString()}</div></div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head"><div><h3>وسيلة استلام الأموال</h3><div className="sub">لا يظهر رقم المحفظة كاملًا إلا للمستخدم المخوّل</div></div></div>
        <div className="simple-list">
          <div className="simple-row">
            <div className="ic" style={{ background: 'var(--info-bg)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2"><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /></svg></div>
            <div className="txt">
              <div className="t">{method?.type === 'cash' ? 'استلام نقدي من مدرار' : method?.walletProvider} — {maskNumber(method?.number)}</div>
              <div className="s">{method?.holderName} · <MetaLine updatedAt={method?.updatedAt} updatedBy={method?.updatedBy} /></div>
            </div>
            <span className={`badge ${statusInfo.badge}`}><span className="dot" />{statusInfo.label}</span>
          </div>
        </div>
        {method?.securityHoldUntil && new Date(method.securityHoldUntil) > new Date() && (
          <div style={{ padding: '0 22px 16px' }}>
            <div className="tip-box danger" style={{ marginTop: 0 }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <div className="s">فترة أمان سارية حتى {formatDateTime(method.securityHoldUntil)} — لن تُنفَّذ دفعات لهذه الوسيلة قبل انتهائها.</div>
            </div>
          </div>
        )}
        {canEditPayout && (
          <div className="panel-foot"><button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setModalOpen(true)}>تعديل وسيلة الاستلام</button></div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head"><div><h3>دورة الدفع</h3><div className="sub">قواعد يحددها فريق مدرار — لا يمكن للمورد تعديلها مباشرة</div></div></div>
        <div style={{ padding: '4px 22px 20px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.86rem' }}>
          <div>آخر دفعة منفذة: {lastExecuted ? `${lastExecuted.netAmount.toLocaleString()} ${lastExecuted.currency} — ${formatDateTime(lastExecuted.executedAt)}` : '—'}</div>
          <div>الشرط التالي لاستحقاق الدفعة: عند بلوغ الرصيد الحد الأدنى المعتمد أو حسب الدورة الدورية المحددة من الإدارة.</div>
        </div>
        <div className="panel-foot" style={{ justifyContent: 'flex-start' }}>
          <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} disabled={requestingRuleChange} onClick={handleRequestRuleChange}>
            {requestingRuleChange ? '...' : 'إرسال طلب تعديل قواعد الدفع للمراجعة'}
          </button>
        </div>
      </div>

      {modalOpen && (
        <PayoutMethodModal current={method} supplierId={supplier.id} actorEmployeeId={employee.id} onClose={() => setModalOpen(false)} onDone={async () => { setModalOpen(false); await refreshSupplier(); }} />
      )}
    </div>
  );
}
