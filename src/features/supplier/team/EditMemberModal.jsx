import { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { resolveRole, grantsSensitivePermission } from './permissions';
import { updateMemberAccess, suspendTeamMember, reactivateTeamMember, revokeTeamMember, endMemberSessions } from '../data/mockSupplierDb';
import { useToast } from '../ui/SupplierToast';

function Field({ label, full, children }) {
  return (
    <div className={`field${full ? ' full' : ''}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}

export default function EditMemberModal({ member, teamRoles, locations, actorEmployeeId, hasPermission, onClose, onDone }) {
  const { showToast } = useToast();
  const [roleId, setRoleId] = useState(member.roleId);
  const [locationIds, setLocationIds] = useState(member.locationIds ?? []);
  const [productScope, setProductScope] = useState(member.productScope ?? 'all');
  const [accessExpiresAt, setAccessExpiresAt] = useState(member.accessExpiresAt ?? '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');
  const [statusAction, setStatusAction] = useState(null); // 'suspend' | 'revoke' | null
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const currentRole = resolveRole(member.roleId, teamRoles);
  const nextRole = resolveRole(roleId, teamRoles);
  const roleChanged = roleId !== member.roleId;
  const sensitive = roleChanged && nextRole ? grantsSensitivePermission(nextRole.permissions) : false;
  const assignableRoles = teamRoles.filter((r) => r.id !== 'owner');

  const toggleLocation = (id) => setLocationIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const handleSaveAccess = async (e) => {
    e.preventDefault();
    setError('');
    if (sensitive && !confirmPassword) { setError('تغيير الدور لهذا الاختيار يمنح صلاحيات حساسة — يرجى إعادة إدخال كلمة المرور'); return; }
    setSaving(true);
    try {
      await updateMemberAccess({
        employeeId: member.id, actorEmployeeId, confirmPassword,
        patch: { jobTitle: member.jobTitle, roleId, locationIds, productScope, accessExpiresAt: accessExpiresAt || null },
      });
      showToast('تم تحديث وصول العضو بنجاح');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusConfirm = async () => {
    setError('');
    setSaving(true);
    try {
      if (statusAction === 'suspend') {
        await suspendTeamMember({ employeeId: member.id, actorEmployeeId, reason });
        showToast('تم إيقاف العضو مؤقتًا');
      } else if (statusAction === 'revoke') {
        await revokeTeamMember({ employeeId: member.id, actorEmployeeId, reason });
        showToast('تم إلغاء وصول العضو نهائيًا');
      }
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async () => {
    setSaving(true);
    setError('');
    try {
      await reactivateTeamMember({ employeeId: member.id, actorEmployeeId });
      showToast('تم إعادة تفعيل العضو');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEndSessions = async () => {
    setSaving(true);
    try {
      await endMemberSessions({ employeeId: member.id, actorEmployeeId });
      showToast('تم إنهاء جميع جلسات هذا العضو');
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isOwner = member.roleId === 'owner';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>إدارة وصول {member.name}</h3>
          <button type="button" className="drawer-close" onClick={onClose}><X size={16} strokeWidth={2} /></button>
        </div>

        <div className="drawer-body">
          <div className="form-grid">
            <Field label="الدور الحالي">
              <input disabled value={currentRole?.name ?? member.roleId} style={{ opacity: 0.7 }} />
            </Field>
            <Field label="آخر دخول">
              <input disabled value={member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' }) : 'لم يسجّل الدخول بعد'} style={{ opacity: 0.7 }} />
            </Field>

            {isOwner ? (
              <div className="tip-box" style={{ gridColumn: '1/-1' }}>
                <div className="t">هذا العضو هو مالك الحساب</div>
                <div className="s">لا يمكن تعديل دور المالك أو إيقافه من هنا — استخدم مسار نقل الملكية في تبويب «إعدادات الأمان».</div>
              </div>
            ) : (
              <>
                <Field label="الدور الجديد" full>
                  <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                    {assignableRoles.map((r) => <option key={r.id} value={r.id}>{r.name}{!r.isSystem ? ' (مخصص)' : ''}</option>)}
                  </select>
                  {roleChanged && nextRole && <span className="field-hint">{nextRole.description}</span>}
                </Field>

                <Field label="مواقع التجهيز المسموحة" full>
                  {locations.length === 0 ? (
                    <span className="field-hint">لا توجد مواقع بعد.</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {locations.map((l) => (
                        <label key={l.id} className="perm-item">
                          <input type="checkbox" checked={locationIds.includes(l.id)} onChange={() => toggleLocation(l.id)} />
                          {l.name}
                        </label>
                      ))}
                    </div>
                  )}
                  <span className="field-hint">بدون تحديد = وصول لكل المواقع.</span>
                </Field>

                <Field label="نطاق المنتجات">
                  <select value={productScope} onChange={(e) => setProductScope(e.target.value)}>
                    <option value="all">جميع المنتجات</option>
                    <option value="locations">منتجات مواقعه فقط</option>
                  </select>
                </Field>
                <Field label="تاريخ انتهاء الوصول (اختياري)">
                  <input type="date" className="en" dir="ltr" value={accessExpiresAt ?? ''} onChange={(e) => setAccessExpiresAt(e.target.value)} />
                </Field>

                {sensitive && (
                  <div className="tip-box danger" style={{ gridColumn: '1/-1' }}>
                    <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                    <div>
                      <div className="t">هذا التغيير يمنح صلاحيات حساسة</div>
                      <div className="s">يتطلب إعادة إدخال كلمة مرورك، وسيصل إشعار فوري لمالك الحساب.</div>
                    </div>
                  </div>
                )}
                {sensitive && (
                  <Field label="أعد إدخال كلمة المرور للتأكيد" full>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </Field>
                )}

                {error && <div style={{ gridColumn: '1/-1' }}><span className="field-error">{error}</span></div>}

                <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} disabled={saving} onClick={handleSaveAccess}>
                    {saving ? '...' : 'حفظ تعديلات الوصول'}
                  </button>
                </div>

                <div style={{ gridColumn: '1/-1', borderTop: '1px solid var(--border-default)', paddingTop: 16, marginTop: 4 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, marginBottom: 10 }}>حالة الحساب</div>

                  {statusAction ? (
                    <div className="tip-box danger" style={{ marginTop: 0 }}>
                      <div style={{ width: '100%' }}>
                        <div className="t">{statusAction === 'suspend' ? 'تأكيد الإيقاف المؤقت' : 'تأكيد إلغاء الوصول نهائيًا'}</div>
                        <div className="s" style={{ marginBottom: 8 }}>
                          {statusAction === 'suspend'
                            ? 'سيفقد العضو الوصول فورًا وتُلغى جلساته، مع الاحتفاظ بكل سجلاته وأعماله السابقة.'
                            : 'سيُلغى وصول العضو نهائيًا (يمكن دعوته من جديد لاحقًا)، دون حذف أي من أعماله أو سجله.'}
                        </div>
                        <textarea rows={2} placeholder="سبب الإجراء (اختياري)" value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setStatusAction(null)}>تراجع</button>
                          <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto', background: 'var(--danger)' }} disabled={saving} onClick={handleStatusConfirm}>
                            {saving ? '...' : 'تأكيد'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {member.status === 'active' && hasPermission('team.suspend_member') && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setStatusAction('suspend')}>إيقاف مؤقت</button>
                      )}
                      {member.status === 'suspended' && hasPermission('team.suspend_member') && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={handleReactivate}>إعادة تفعيل</button>
                      )}
                      {member.status !== 'revoked' && hasPermission('team.suspend_member') && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', color: 'var(--danger)' }} onClick={() => setStatusAction('revoke')}>إلغاء الوصول نهائيًا</button>
                      )}
                      {hasPermission('team.manage_sessions') && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={handleEndSessions}>
                          إنهاء الجلسات ({member.activeSessionCount ?? 0} نشطة)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="drawer-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
