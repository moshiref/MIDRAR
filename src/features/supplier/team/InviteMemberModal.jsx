import { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { resolveRole, grantsSensitivePermission } from './permissions';
import { inviteTeamMember } from '../data/mockSupplierDb';
import { useToast } from '../ui/SupplierToast';

const EMPTY = {
  fullName: '', phone: '', email: '', jobTitle: '', preferredLanguage: 'ar', internalNote: '',
  roleId: '', locationIds: [], productScope: 'all', accessExpiresAt: '', mustChangePassword: true,
};

export default function InviteMemberModal({ supplierId, teamRoles, locations, actorEmployeeId, initialData, onClose, onDone }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(() => (initialData ? { ...EMPTY, ...initialData } : EMPTY));
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const invitableRoles = teamRoles.filter((r) => r.id !== 'owner');
  const selectedRole = resolveRole(form.roleId, teamRoles);
  const sensitive = selectedRole ? grantsSensitivePermission(selectedRole.permissions) : false;

  const toggleLocation = (id) => {
    setForm((f) => ({
      ...f,
      locationIds: f.locationIds.includes(id) ? f.locationIds.filter((x) => x !== id) : [...f.locationIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim()) { setError('الاسم الكامل مطلوب'); return; }
    if (!form.phone.trim() && !form.email.trim()) { setError('يجب إدخال رقم هاتف أو بريد إلكتروني'); return; }
    if (!form.roleId) { setError('يرجى اختيار دور للعضو'); return; }
    if (sensitive && !confirmPassword) { setError('هذا الدور يتضمن صلاحيات حساسة — يرجى إعادة إدخال كلمة المرور للتأكيد'); return; }

    setSaving(true);
    try {
      await inviteTeamMember({
        supplierId,
        actorEmployeeId,
        confirmPassword,
        data: form,
      });
      showToast('تم إرسال الدعوة بنجاح');
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
          <h3>دعوة عضو جديد</h3>
          <button type="button" className="drawer-close" onClick={onClose}><X size={16} strokeWidth={2} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="drawer-body">
            <div className="form-grid">
              <Field label="الاسم الكامل" full>
                <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
              </Field>
              <Field label="رقم الهاتف">
                <input type="tel" className="en" dir="ltr" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </Field>
              <Field label="البريد الإلكتروني (إن وجد)">
                <input type="email" className="en" dir="ltr" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </Field>
              <Field label="المسمى الوظيفي">
                <input value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} />
              </Field>
              <Field label="اللغة المفضلة">
                <select value={form.preferredLanguage} onChange={(e) => setForm((f) => ({ ...f, preferredLanguage: e.target.value }))}>
                  <option value="ar">العربية</option>
                  <option value="en">الإنجليزية</option>
                </select>
              </Field>
              <Field label="ملاحظة داخلية (لا يراها الموظف)" full>
                <textarea rows={2} value={form.internalNote} onChange={(e) => setForm((f) => ({ ...f, internalNote: e.target.value }))} />
              </Field>

              <Field label="الدور" full>
                <select value={form.roleId} onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}>
                  <option value="">اختر دورًا...</option>
                  {invitableRoles.map((r) => <option key={r.id} value={r.id}>{r.name}{!r.isSystem ? ' (مخصص)' : ''}</option>)}
                </select>
                {selectedRole && <span className="field-hint">{selectedRole.description}</span>}
              </Field>

              <Field label="مواقع التجهيز المسموحة" full>
                {locations.length === 0 ? (
                  <span className="field-hint">لا توجد مواقع بعد — سيصل العضو لكل المواقع افتراضيًا.</span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {locations.map((l) => (
                      <label key={l.id} className="perm-item">
                        <input type="checkbox" checked={form.locationIds.includes(l.id)} onChange={() => toggleLocation(l.id)} />
                        {l.name}
                      </label>
                    ))}
                  </div>
                )}
                <span className="field-hint">بدون تحديد = وصول لكل المواقع.</span>
              </Field>

              <Field label="نطاق المنتجات">
                <select value={form.productScope} onChange={(e) => setForm((f) => ({ ...f, productScope: e.target.value }))}>
                  <option value="all">جميع المنتجات</option>
                  <option value="locations">منتجات مواقعه فقط</option>
                </select>
              </Field>
              <Field label="تاريخ انتهاء الوصول (اختياري)">
                <input type="date" className="en" dir="ltr" value={form.accessExpiresAt} onChange={(e) => setForm((f) => ({ ...f, accessExpiresAt: e.target.value }))} />
              </Field>

              <Field label="" full>
                <label className="perm-item">
                  <input type="checkbox" checked={form.mustChangePassword} onChange={(e) => setForm((f) => ({ ...f, mustChangePassword: e.target.checked }))} />
                  إجبار العضو على تعيين كلمة مرور خاصة به عند أول دخول
                </label>
              </Field>

              {form.roleId && (
                <div className="tip-box" style={{ gridColumn: '1/-1' }}>
                  <div>
                    <div className="t">ملخص الدعوة</div>
                    <div className="s">
                      <strong>{form.fullName || 'العضو'}</strong> سيحصل على دور <strong>«{selectedRole?.name}»</strong>
                      {' '}ووصول إلى {form.locationIds.length ? `${form.locationIds.length} موقع تجهيز محدد` : 'كل مواقع التجهيز'}.
                      تنتهي صلاحية رابط الدعوة خلال 72 ساعة إن لم يتم قبولها.
                    </div>
                  </div>
                </div>
              )}

              {sensitive && (
                <div className="tip-box danger" style={{ gridColumn: '1/-1' }}>
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <div className="t">هذا الدور يتضمن صلاحيات حساسة</div>
                    <div className="s">يتطلب هذا الإجراء إعادة إدخال كلمة مرورك لتأكيده، وسيصلك إشعار فوري به.</div>
                  </div>
                </div>
              )}
              {sensitive && (
                <Field label="أعد إدخال كلمة المرور للتأكيد" full>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </Field>
              )}

              {error && <div style={{ gridColumn: '1/-1' }}><span className="field-error">{error}</span></div>}
            </div>
          </div>
          <div className="drawer-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>إلغاء</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '...' : 'إرسال الدعوة'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <div className={`field${full ? ' full' : ''}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
}
