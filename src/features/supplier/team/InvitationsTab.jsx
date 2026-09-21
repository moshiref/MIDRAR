import { useState } from 'react';
import { X } from 'lucide-react';
import { resolveRole, grantsSensitivePermission, INVITATION_STATUS } from './permissions';
import { invitationEffectiveStatus, resendTeamInvitation, cancelTeamInvitation, updateInvitationRole } from '../data/mockSupplierDb';
import { useToast } from '../ui/SupplierToast';
import InviteMemberModal from './InviteMemberModal';

function maskContact(phone, email) {
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    return `${phone.slice(0, 4)}***${digits.slice(-3)}`;
  }
  if (email) {
    const [user, domain] = email.split('@');
    return `${user.slice(0, 1)}***@${domain ?? ''}`;
  }
  return '—';
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });
}

function RoleEditModal({ invitation, teamRoles, actorEmployeeId, onClose, onDone }) {
  const { showToast } = useToast();
  const [roleId, setRoleId] = useState(invitation.roleId);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const role = resolveRole(roleId, teamRoles);
  const sensitive = role ? grantsSensitivePermission(role.permissions) : false;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateInvitationRole({ invitationId: invitation.id, actorEmployeeId, confirmPassword, roleId });
      showToast('تم تحديث دور الدعوة');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.02rem' }}>تعديل دور الدعوة — {invitation.fullName}</h3>
          <button type="button" className="drawer-close" onClick={onClose}><X size={16} strokeWidth={2} /></button>
        </div>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>الدور</label>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {teamRoles.filter((r) => r.id !== 'owner').map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        {sensitive && (
          <div className="field" style={{ marginBottom: 10 }}>
            <label>أعد إدخال كلمة المرور للتأكيد (صلاحيات حساسة)</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        )}
        {error && <span className="field-error">{error}</span>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? '...' : 'حفظ'}</button>
        </div>
      </div>
    </div>
  );
}

export default function InvitationsTab({ supplier, employee, teamRoles, hasPermission, invitations, locations, reload }) {
  const { showToast } = useToast();
  const [roleEditTarget, setRoleEditTarget] = useState(null);
  const [reinviteSeed, setReinviteSeed] = useState(null);
  const locationName = (id) => locations.find((l) => l.id === id)?.name;

  const handleResend = async (inv) => {
    try {
      await resendTeamInvitation({ invitationId: inv.id, actorEmployeeId: employee.id });
      showToast('تم إعادة إرسال الدعوة — أصبح الرابط السابق غير صالح');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancel = async (inv) => {
    try {
      await cancelTeamInvitation({ invitationId: inv.id, actorEmployeeId: employee.id });
      showToast('تم إلغاء الدعوة');
      await reload();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>الدعوات المعلّقة</h3><div className="sub">{invitations.length} دعوة بإجمالي تاريخ هذا الحساب</div></div></div>

      {invitations.length === 0 ? (
        <div className="empty-state">
          <div className="title">لا توجد دعوات بعد</div>
          <div className="msg">ادعُ أول عضو من تبويب «أعضاء الفريق».</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>المدعو</th><th>الهاتف / البريد</th><th>الدور</th><th>المواقع</th>
                <th>مرسل الدعوة</th><th>تاريخ الإرسال</th><th>تاريخ الانتهاء</th><th>الحالة</th><th />
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => {
                const status = invitationEffectiveStatus(inv);
                const statusInfo = INVITATION_STATUS[status] ?? { label: status, badge: 'badge-neutral' };
                const role = resolveRole(inv.roleId, teamRoles);
                return (
                  <tr key={inv.id}>
                    <td className="cell-main">{inv.fullName}{inv.internalNote && <div className="cell-sub">{inv.internalNote}</div>}</td>
                    <td style={{ fontSize: '0.82rem' }}>{maskContact(inv.phone, inv.email)}</td>
                    <td><span className="badge" style={{ background: `${role?.color ?? '#4C5E71'}1A`, color: role?.color ?? 'var(--text-secondary)' }}><span className="role-dot" style={{ background: role?.color ?? '#4C5E71' }} />{role?.name ?? inv.roleId}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{inv.locationIds?.length ? inv.locationIds.map(locationName).filter(Boolean).join('، ') : 'كل المواقع'}</td>
                    <td style={{ fontSize: '0.82rem' }}>{inv.invitedByName}</td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDateTime(inv.createdAt)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDateTime(inv.expiresAt)}</td>
                    <td><span className={`badge ${statusInfo.badge}`}><span className="dot" />{statusInfo.label}</span></td>
                    <td className="row-actions" style={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 6 }}>
                      {status === 'pending' && hasPermission('team.resend_invite') && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => handleResend(inv)}>إعادة إرسال</button>
                      )}
                      {status === 'pending' && hasPermission('team.invite') && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setRoleEditTarget(inv)}>تعديل الدور</button>
                      )}
                      {status === 'pending' && hasPermission('team.invite') && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', color: 'var(--danger)' }} onClick={() => handleCancel(inv)}>إلغاء</button>
                      )}
                      {(status === 'expired' || status === 'cancelled') && hasPermission('team.invite') && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setReinviteSeed(inv)}>دعوة بديلة</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {roleEditTarget && (
        <RoleEditModal
          invitation={roleEditTarget}
          teamRoles={teamRoles}
          actorEmployeeId={employee.id}
          onClose={() => setRoleEditTarget(null)}
          onDone={async () => { setRoleEditTarget(null); await reload(); }}
        />
      )}
      {reinviteSeed && (
        <InviteMemberModal
          supplierId={supplier.id}
          teamRoles={teamRoles}
          locations={locations}
          actorEmployeeId={employee.id}
          initialData={{
            fullName: reinviteSeed.fullName, phone: reinviteSeed.phone, email: reinviteSeed.email,
            jobTitle: reinviteSeed.jobTitle, preferredLanguage: reinviteSeed.preferredLanguage,
            internalNote: reinviteSeed.internalNote, roleId: reinviteSeed.roleId,
            locationIds: reinviteSeed.locationIds, productScope: reinviteSeed.productScope,
            accessExpiresAt: reinviteSeed.accessExpiresAt ?? '', mustChangePassword: true,
          }}
          onClose={() => setReinviteSeed(null)}
          onDone={async () => { setReinviteSeed(null); await reload(); }}
        />
      )}
    </div>
  );
}
