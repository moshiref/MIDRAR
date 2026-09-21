import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { SectionCard, SaveButton, Field, formatDateTime, NoAccess } from '../SettingsShared';
import { changeAccountPassword, endMemberSessions, endAllSessionsExceptOwner, getTeamMembers } from '../../data/mockSupplierDb';
import { validatePassword, validateConfirmPassword } from '../../../auth/validators';
import { useToast } from '../../ui/SupplierToast';
import { useSupplierSession } from '../../session/SupplierSessionContext';

// There's no real failed-login tracker in this prototype (no server to
// observe failed attempts against) — shown as an explicit empty/demo
// state rather than fabricated numbers.
const FAILED_LOGIN_LOG = [];

export default function SecurityPage({ supplier, employee, hasPermission, overview }) {
  const { showToast } = useToast();
  const { refreshSupplier, refreshTeam } = useSupplierSession();
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);
  const [confirmingEndAll, setConfirmingEndAll] = useState(false);
  const [endAllPassword, setEndAllPassword] = useState('');
  const [members, setMembers] = useState([]);
  const canManage = hasPermission('settings.manage_sessions');

  const reloadMembers = () => getTeamMembers(supplier.id).then((list) => setMembers(list.filter((m) => m.status === 'active')));
  useEffect(() => {
    reloadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  if (!canManage) return <NoAccess label="صفحة الأمان والجلسات" />;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {
      current: pwForm.current !== supplier.password ? 'كلمة المرور الحالية غير صحيحة' : '',
      next: validatePassword(pwForm.next, { minLength: 8 }),
      confirm: validateConfirmPassword(pwForm.confirm, pwForm.next),
    };
    setPwErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setSavingPw(true);
    try {
      await changeAccountPassword({ supplierId: supplier.id, actorEmployeeId: employee.id, currentPassword: pwForm.current, newPassword: pwForm.next });
      showToast('تم تغيير كلمة المرور بنجاح');
      setPwForm({ current: '', next: '', confirm: '' });
      setPwErrors({});
      await refreshSupplier();
    } catch (err) {
      setPwErrors((er) => ({ ...er, current: err.message }));
    } finally {
      setSavingPw(false);
    }
  };

  const handleEndSessions = async (memberId) => {
    await endMemberSessions({ employeeId: memberId, actorEmployeeId: employee.id });
    showToast('تم إنهاء جلسات هذا العضو');
    await Promise.all([refreshTeam(), reloadMembers()]);
  };

  const handleEndAll = async () => {
    try {
      await endAllSessionsExceptOwner({ supplierId: supplier.id, actorEmployeeId: employee.id, confirmPassword: endAllPassword });
      showToast('تم إنهاء جميع الجلسات عدا جلستك');
      setConfirmingEndAll(false);
      setEndAllPassword('');
      await refreshTeam();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <form onSubmit={handleChangePassword}>
        <SectionCard title="تغيير كلمة المرور" description="سياسة قوة كلمة المرور: 8 أحرف على الأقل" footer={<SaveButton saving={savingPw} dirty>تحديث كلمة المرور</SaveButton>}>
          <div className="form-grid">
            <Field label="كلمة المرور الحالية" error={pwErrors.current}><input type="password" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} /></Field>
            <Field label="كلمة المرور الجديدة" error={pwErrors.next}><input type="password" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} /></Field>
            <Field label="تأكيد كلمة المرور الجديدة" error={pwErrors.confirm}><input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} /></Field>
          </div>
          <p style={{ padding: '0 22px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {supplier.lastPasswordChange ? `آخر تغيير: ${formatDateTime(supplier.lastPasswordChange)}` : 'لم يتم تغيير كلمة المرور بعد'}
          </p>
        </SectionCard>
      </form>

      <div className="panel">
        <div className="panel-head"><div><h3>الأجهزة والجلسات النشطة</h3></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>العضو</th><th className="num">الجلسات النشطة</th><th /></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="cell-main">{m.name}{m.id === employee.id && ' (أنت)'}</td>
                  <td className="num">{m.activeSessionCount ?? 0}</td>
                  <td className="row-actions" style={{ justifyContent: 'flex-end' }}>
                    {m.id !== employee.id && (m.activeSessionCount ?? 0) > 0 && (
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => handleEndSessions(m.id)}>إنهاء الجلسة</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-foot" style={{ justifyContent: 'flex-start' }}>
          {!confirmingEndAll ? (
            <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', color: 'var(--danger)' }} onClick={() => setConfirmingEndAll(true)}>إنهاء جميع الجلسات الأخرى</button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="password" placeholder="كلمة المرور للتأكيد" value={endAllPassword} onChange={(e) => setEndAllPassword(e.target.value)} style={{ padding: '8px 12px', border: '1.5px solid var(--border-default)', borderRadius: 8 }} />
              <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto', background: 'var(--danger)' }} onClick={handleEndAll}>تأكيد</button>
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => { setConfirmingEndAll(false); setEndAllPassword(''); }}>تراجع</button>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><div><h3>محاولات الدخول الفاشلة</h3><div className="sub">قفل مؤقت تلقائي بعد محاولات متكررة</div></div></div>
        {FAILED_LOGIN_LOG.length === 0 ? (
          <div className="empty-state"><div className="msg">لا توجد محاولات دخول فاشلة مسجّلة.</div></div>
        ) : null}
      </div>

      <div className="panel">
        <div className="panel-head"><div><h3>آخر التغييرات الأمنية</h3></div></div>
        {overview.lastSecurityOrFinancialChange ? (
          <div className="simple-list">
            <div className="simple-row">
              <div className="ic" style={{ background: 'var(--warning-bg)' }}><ShieldAlert size={16} color="var(--warning)" /></div>
              <div className="txt"><div className="t">{overview.lastSecurityOrFinancialChange.detail}</div><div className="s">{formatDateTime(overview.lastSecurityOrFinancialChange.at)}</div></div>
            </div>
          </div>
        ) : <div className="empty-state"><div className="msg">لا يوجد بعد.</div></div>}
      </div>
    </div>
  );
}
