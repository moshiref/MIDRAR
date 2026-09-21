import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Field, SectionCard, SaveButton, MetaLine, useUnsavedGuard, useSettingsForm } from '../SettingsShared';
import { updateContactInfo, confirmContactVerification } from '../../data/mockSupplierDb';
import { useToast } from '../../ui/SupplierToast';
import { useSupplierSession } from '../../session/SupplierSessionContext';
import { validateEmail, validatePhone } from '../../../auth/validators';

const FIELDS = ['contactPersonTitle', 'fullName', 'phone', 'altPhone', 'email', 'accountingEmail', 'fulfillmentPhone', 'emergencyPhone', 'preferredContactMethod', 'preferredContactHours'];

function toForm(supplier) {
  return Object.fromEntries(FIELDS.map((f) => [f, supplier[f] ?? '']));
}

export default function ContactInfoPage({ supplier, employee, hasPermission }) {
  const { showToast } = useToast();
  const { refreshSupplier } = useSupplierSession();
  const { form, setForm, dirty, reset } = useSettingsForm(toForm(supplier));
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const canEdit = hasPermission('settings.edit_contact');

  useEffect(() => { reset(toForm(supplier)); }, [supplier, reset]);
  useUnsavedGuard(dirty);

  const changingPhone = form.phone !== supplier.phone;
  const changingEmail = form.email !== supplier.email;
  const needsPassword = changingPhone || changingEmail;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = { phone: validatePhone(form.phone), email: validateEmail(form.email) };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    if (needsPassword && !confirmPassword) { setErrors((er) => ({ ...er, password: 'يرجى إعادة إدخال كلمة المرور لتأكيد تغيير الهاتف/البريد الأساسي' })); return; }
    setSaving(true);
    try {
      await updateContactInfo({ supplierId: supplier.id, actorEmployeeId: employee.id, confirmPassword, patch: form });
      showToast(needsPassword ? 'تم الحفظ — بانتظار تحقق القيمة الجديدة، وتم إشعار الوسيلة السابقة' : 'تم حفظ بيانات التواصل بنجاح');
      setConfirmPassword('');
      await refreshSupplier();
    } catch (err) {
      setErrors((er) => ({ ...er, password: err.message }));
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (channel) => {
    try {
      await confirmContactVerification({ supplierId: supplier.id, actorEmployeeId: employee.id, channel });
      showToast('تم تأكيد التحقق (محاكاة — لا يوجد مزوّد SMS/بريد حقيقي)');
      await refreshSupplier();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="tip-box">
        <div className="t">هذه البيانات لا تظهر للتاجر أو العميل أبدًا</div>
        <div className="s">ولا تُستخدم أرقام التواصل هنا داخل المحادثات التشغيلية التي تعتمد إخفاء الهوية.</div>
      </div>

      {supplier.pendingPhoneVerification && (
        <div className="tip-box danger">
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <div>
            <div className="t">تغيير الهاتف الأساسي بانتظار التحقق</div>
            <div className="s">القيمة الجديدة: {supplier.pendingPhoneVerification.value}</div>
            <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', marginTop: 8 }} onClick={() => handleVerify('phone')}>تأكيد التحقق (محاكاة)</button>
          </div>
        </div>
      )}
      {supplier.pendingEmailVerification && (
        <div className="tip-box danger">
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <div>
            <div className="t">تغيير البريد الأساسي بانتظار التحقق</div>
            <div className="s">القيمة الجديدة: {supplier.pendingEmailVerification.value}</div>
            <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', marginTop: 8 }} onClick={() => handleVerify('email')}>تأكيد التحقق (محاكاة)</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <SectionCard
          title="بيانات التواصل"
          description="قنوات التواصل الرسمية بين مدرار ومؤسستك"
          meta={<MetaLine updatedAt={supplier.updatedAt} updatedBy={supplier.updatedBy} />}
          footer={canEdit && <SaveButton saving={saving} dirty={dirty} />}
        >
          <div className="form-grid">
            <Field label="اسم المسؤول الرئيسي">
              <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} disabled={!canEdit} />
            </Field>
            <Field label="صفته الوظيفية">
              <input value={form.contactPersonTitle} onChange={(e) => setForm((f) => ({ ...f, contactPersonTitle: e.target.value }))} disabled={!canEdit} />
            </Field>

            <Field label="رقم الهاتف الأساسي" error={errors.phone} hint="يحتاج تحققًا عند التغيير">
              <input dir="ltr" className="en" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} disabled={!canEdit} />
            </Field>
            <Field label="رقم هاتف بديل">
              <input dir="ltr" className="en" value={form.altPhone} onChange={(e) => setForm((f) => ({ ...f, altPhone: e.target.value }))} disabled={!canEdit} />
            </Field>

            <Field label="البريد الإلكتروني الأساسي" error={errors.email} hint="يحتاج تحققًا عند التغيير">
              <input dir="ltr" className="en" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} disabled={!canEdit} />
            </Field>
            <Field label="بريد المحاسبة">
              <input dir="ltr" className="en" type="email" value={form.accountingEmail} onChange={(e) => setForm((f) => ({ ...f, accountingEmail: e.target.value }))} disabled={!canEdit} />
            </Field>

            <Field label="رقم مسؤول الطلبات والتجهيز">
              <input dir="ltr" className="en" value={form.fulfillmentPhone} onChange={(e) => setForm((f) => ({ ...f, fulfillmentPhone: e.target.value }))} disabled={!canEdit} />
            </Field>
            <Field label="رقم للطوارئ التشغيلية">
              <input dir="ltr" className="en" value={form.emergencyPhone} onChange={(e) => setForm((f) => ({ ...f, emergencyPhone: e.target.value }))} disabled={!canEdit} />
            </Field>

            <Field label="وسيلة التواصل المفضلة">
              <select value={form.preferredContactMethod} onChange={(e) => setForm((f) => ({ ...f, preferredContactMethod: e.target.value }))} disabled={!canEdit}>
                <option value="phone">الهاتف</option>
                <option value="whatsapp">واتساب</option>
                <option value="email">البريد الإلكتروني</option>
              </select>
            </Field>
            <Field label="الأوقات المناسبة للتواصل">
              <input value={form.preferredContactHours} onChange={(e) => setForm((f) => ({ ...f, preferredContactHours: e.target.value }))} disabled={!canEdit} />
            </Field>

            {needsPassword && canEdit && (
              <Field label="أعد إدخال كلمة المرور لتأكيد تغيير الهاتف/البريد الأساسي" error={errors.password} full>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </Field>
            )}
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
