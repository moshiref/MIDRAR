import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import {
  endMemberSessions, endAllSessionsExceptOwner,
  transferSupplierOwnership, confirmSupplierOwnershipTransfer, cancelSupplierOwnershipTransfer,
  updateSupplierSettings,
} from '../data/mockSupplierDb';
import { useToast } from '../ui/SupplierToast';

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });
}

function Toggle({ on, onToggle, disabled }) {
  return (
    <button type="button" className={`toggle-switch${on ? ' on' : ''}`} disabled={disabled} onClick={onToggle} aria-pressed={on}>
      <span className="knob" />
    </button>
  );
}

export default function SecurityTab({ supplier, employee, hasPermission, members, stats, reload }) {
  const { showToast } = useToast();
  const [endAllPassword, setEndAllPassword] = useState('');
  const [confirmingEndAll, setConfirmingEndAll] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [transferTarget, setTransferTarget] = useState('');
  const [transferPassword, setTransferPassword] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');

  const isOwner = employee.roleId === 'owner';
  const pending = supplier.pendingOwnershipTransfer;
  const security = supplier.securitySettings ?? {
    sessionHours: 12, alertNewDevice: true, alertSensitiveChange: true, requireOwnerApproval: false,
  };

  const activeMembers = members.filter((m) => m.id !== employee.id && m.status === 'active');

  const handleEndSessions = async (memberId) => {
    try {
      await endMemberSessions({ employeeId: memberId, actorEmployeeId: employee.id });
      showToast('تم إنهاء جلسات هذا العضو');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEndAll = async () => {
    try {
      await endAllSessionsExceptOwner({ supplierId: supplier.id, actorEmployeeId: employee.id, confirmPassword: endAllPassword });
      showToast('تم إنهاء جميع الجلسات عدا جلستك');
      setConfirmingEndAll(false);
      setEndAllPassword('');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const updatePref = async (patch) => {
    setSavingPrefs(true);
    try {
      await updateSupplierSettings({ supplierId: supplier.id, patch: { securitySettings: { ...security, ...patch } }, actorName: employee.name });
      await reload();
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleStartTransfer = async () => {
    setTransferError('');
    if (!transferTarget) { setTransferError('اختر عضوًا نشطًا لنقل الملكية إليه'); return; }
    setTransferring(true);
    try {
      await transferSupplierOwnership({ supplierId: supplier.id, actorEmployeeId: employee.id, confirmPassword: transferPassword, newOwnerEmployeeId: transferTarget });
      showToast('تم بدء نقل الملكية — بانتظار تأكيد العضو الجديد');
      setTransferPassword('');
      await reload();
    } catch (err) {
      setTransferError(err.message);
    } finally {
      setTransferring(false);
    }
  };

  const handleConfirmTransfer = async () => {
    try {
      await confirmSupplierOwnershipTransfer({ supplierId: supplier.id, employeeId: pending.toEmployeeId });
      showToast('تم نقل ملكية الحساب بنجاح');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelTransfer = async () => {
    try {
      await cancelSupplierOwnershipTransfer({ supplierId: supplier.id, actorEmployeeId: employee.id });
      showToast('تم إلغاء نقل الملكية');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="panel">
        <div className="panel-head"><div><h3>الجلسات</h3><div className="sub">إدارة الجلسات النشطة لأعضاء الفريق</div></div></div>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="field">
            <label>مدة الجلسة قبل تسجيل خروج تلقائي (ساعات)</label>
            <input
              type="number" min="1" className="en" dir="ltr" value={security.sessionHours}
              onChange={(e) => updatePref({ sessionHours: Number(e.target.value) || 1 })}
              disabled={savingPrefs || !hasPermission('team.manage_sessions')}
              style={{ maxWidth: 160 }}
            />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>العضو</th><th className="num">الجلسات النشطة</th><th /></tr></thead>
            <tbody>
              {members.filter((m) => m.status === 'active').map((m) => (
                <tr key={m.id}>
                  <td className="cell-main">{m.name}</td>
                  <td className="num">{m.activeSessionCount ?? 0}</td>
                  <td className="row-actions" style={{ justifyContent: 'flex-end' }}>
                    {hasPermission('team.manage_sessions') && (m.activeSessionCount ?? 0) > 0 && (
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => handleEndSessions(m.id)}>إنهاء الجلسات</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasPermission('team.manage_sessions') && (
          <div className="panel-foot" style={{ justifyContent: 'flex-start' }}>
            {!confirmingEndAll ? (
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', color: 'var(--danger)' }} onClick={() => setConfirmingEndAll(true)}>
                إنهاء جميع الجلسات عدا جلستي
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="password" placeholder="كلمة المرور للتأكيد" value={endAllPassword} onChange={(e) => setEndAllPassword(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid var(--border-default)', borderRadius: 8 }} />
                <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto', background: 'var(--danger)' }} onClick={handleEndAll}>تأكيد</button>
                <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => { setConfirmingEndAll(false); setEndAllPassword(''); }}>تراجع</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-head"><div><h3>تنبيهات الأمان</h3><div className="sub">تصلك هذه التنبيهات حتى لو عطّلت إشعارات أخرى</div></div></div>
        <div style={{ padding: '4px 22px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="toggle-row">
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>تنبيه عند تسجيل الدخول من جهاز جديد</div>
            </div>
            <Toggle on={security.alertNewDevice} disabled={savingPrefs} onToggle={() => updatePref({ alertNewDevice: !security.alertNewDevice })} />
          </div>
          <div className="toggle-row">
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>تنبيه عند تغيير صلاحية حساسة</div>
            </div>
            <Toggle on={security.alertSensitiveChange} disabled={savingPrefs} onToggle={() => updatePref({ alertSensitiveChange: !security.alertSensitiveChange })} />
          </div>
          <div className="toggle-row">
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>اشتراط موافقتي على العمليات المالية الحساسة قبل تنفيذها من عضو آخر</div>
            </div>
            <Toggle on={security.requireOwnerApproval} disabled={savingPrefs || !isOwner} onToggle={() => updatePref({ requireOwnerApproval: !security.requireOwnerApproval })} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><div><h3>الأحداث الأمنية</h3><div className="sub">أحدث الأحداث الحساسة على هذا الحساب</div></div></div>
        {stats.lastSecurityEvent ? (
          <div className="simple-list">
            <div className="simple-row">
              <div className="ic" style={{ background: 'var(--warning-bg)' }}><ShieldAlert size={16} strokeWidth={2} color="var(--warning)" /></div>
              <div className="txt"><div className="t">{stats.lastSecurityEvent.detail}</div><div className="s">{formatDateTime(stats.lastSecurityEvent.at)}</div></div>
            </div>
          </div>
        ) : (
          <div className="empty-state"><div className="msg">لا توجد أحداث أمنية بعد</div></div>
        )}
      </div>

      {isOwner && (
        <div className="panel">
          <div className="panel-head"><div><h3>نقل ملكية الحساب</h3><div className="sub">مسار منفصل وآمن — لا يمكن حذف آخر مالك للمؤسسة</div></div></div>
          <div style={{ padding: '4px 22px 20px' }}>
            {pending ? (
              <div className="tip-box danger">
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <div>
                  <div className="t">نقل ملكية معلّق إلى {pending.toName}</div>
                  <div className="s">بدأ في {formatDateTime(pending.initiatedAt)} — بانتظار تأكيد العضو الجديد من حسابه.</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={handleCancelTransfer}>إلغاء النقل</button>
                    <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={handleConfirmTransfer}>محاكاة تأكيد العضو الجديد (تجريبي)</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-grid" style={{ padding: 0, gridTemplateColumns: '1fr' }}>
                <div className="field">
                  <label>العضو الجديد المرشّح للملكية</label>
                  <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)}>
                    <option value="">اختر عضوًا نشطًا...</option>
                    {activeMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>أعد إدخال كلمة المرور للتأكيد</label>
                  <input type="password" value={transferPassword} onChange={(e) => setTransferPassword(e.target.value)} />
                </div>
                {transferError && <span className="field-error">{transferError}</span>}
                <div>
                  <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={transferring} onClick={handleStartTransfer}>
                    {transferring ? '...' : 'بدء نقل الملكية'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
