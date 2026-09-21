import { useEffect, useState } from 'react';
import { Field, SectionCard, SaveButton, MetaLine, useUnsavedGuard, useSettingsForm, NoAccess } from '../SettingsShared';
import { updateFulfillmentSettings, getLocations } from '../../data/mockSupplierDb';
import { useToast } from '../../ui/SupplierToast';
import { useSupplierSession } from '../../session/SupplierSessionContext';

function toForm(supplier) {
  return { ...supplier.fulfillmentSettings };
}

export default function FulfillmentSettingsPage({ supplier, employee, hasPermission }) {
  const { showToast } = useToast();
  const { refreshSupplier } = useSupplierSession();
  const { form, setForm, dirty, reset } = useSettingsForm(toForm(supplier));
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const canEdit = hasPermission('settings.manage_fulfillment');

  useEffect(() => { reset(toForm(supplier)); }, [supplier, reset]);
  useEffect(() => { getLocations(supplier.id).then(setLocations); }, [supplier.id]);
  useUnsavedGuard(dirty);

  if (!canEdit) return <NoAccess label="صفحة إعدادات الطلبات والتجهيز" />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFulfillmentSettings({ supplierId: supplier.id, actorEmployeeId: employee.id, patch: form, expectedUpdatedAt: form.updatedAt });
      showToast('تم حفظ إعدادات الطلبات والتجهيز — تُطبَّق على الطلبات الجديدة فقط');
      await refreshSupplier();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard
        title="إعدادات الطلبات والتجهيز"
        description="لا تسمح هذه الإعدادات بتجاوز مدة التجهيز التي تعتمدها إدارة مدرار، ولا بتغيير حالة طلب خارج الانتقالات المسموحة"
        meta={<MetaLine updatedAt={form.updatedAt} updatedBy={supplier.fulfillmentSettings?.updatedBy} />}
        footer={<SaveButton saving={saving} dirty={dirty} />}
      >
        <div className="form-grid">
          <Field label="مدة التجهيز الافتراضية (أيام)" hint="تُستخدم عند عدم تحديد مدة خاصة للمنتج">
            <input type="number" min="0" className="en" dir="ltr" value={form.defaultPrepDays} onChange={(e) => setForm((f) => ({ ...f, defaultPrepDays: Number(e.target.value) }))} />
          </Field>
          <Field label="الموقع الافتراضي للطلبات الجديدة">
            <select value={form.defaultLocationId} onChange={(e) => setForm((f) => ({ ...f, defaultLocationId: e.target.value }))}>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </Field>
          <Field label="دقائق التنبيه المبكر قبل انتهاء مهلة التجهيز" hint="متى يصلك تنبيه قبل الموعد">
            <input type="number" min="0" className="en" dir="ltr" value={form.earlyWarningMinutes} onChange={(e) => setForm((f) => ({ ...f, earlyWarningMinutes: Number(e.target.value) }))} />
          </Field>

          <Field label="تعليمات التغليف الافتراضية" full hint="تظهر كملاحظة قياسية عند تجهيز أي طلب">
            <textarea rows={2} value={form.defaultPackagingInstructions} onChange={(e) => setForm((f) => ({ ...f, defaultPackagingInstructions: e.target.value }))} />
          </Field>
          <Field label="ملاحظات الاستلام لشركة التوصيل" full>
            <textarea rows={2} value={form.deliveryNotes} onChange={(e) => setForm((f) => ({ ...f, deliveryNotes: e.target.value }))} />
          </Field>

          <Field label="" full hint="إسناد الطلبات الجديدة تلقائيًا لأقرب موقع فيه مخزون كافٍ">
            <label className="perm-item"><input type="checkbox" checked={form.autoAssignByStock} onChange={set('autoAssignByStock')} /> إسناد الطلبات إلى المواقع تلقائيًا حسب المخزون</label>
          </Field>
          <Field label="" full hint="بدلها، يبقى إسناد المهام بيد مالك الحساب أو مدير الحساب فقط">
            <label className="perm-item"><input type="checkbox" checked={form.allowEmployeeSelfAccept} onChange={set('allowEmployeeSelfAccept')} /> السماح للموظفين بقبول مهام التجهيز بأنفسهم</label>
          </Field>
          <Field label="" full hint="يوثّق سبب التعذر لحماية الطرفين عند النزاع">
            <label className="perm-item"><input type="checkbox" checked={form.requireReasonOnUnfulfillable} onChange={set('requireReasonOnUnfulfillable')} /> طلب سبب عند الإبلاغ عن تعذر التجهيز</label>
          </Field>
          <Field label="" full hint="اختياري وليس إلزاميًا — لكنه يحمي المورد عند أي نزاع لاحق">
            <label className="perm-item"><input type="checkbox" checked={form.proofVideoEnabled} onChange={set('proofVideoEnabled')} /> تفعيل فيديو إثبات التجهيز الاختياري</label>
          </Field>
          <Field label="" full>
            <label className="perm-item"><input type="checkbox" checked={form.allowPhotosInsteadOfVideo} onChange={set('allowPhotosInsteadOfVideo')} /> السماح برفع صور بدل الفيديو</label>
          </Field>
          <Field label="" full>
            <label className="perm-item"><input type="checkbox" checked={form.remindProofUpload} onChange={set('remindProofUpload')} /> تذكيري برفع دليل التجهيز قبل التسليم</label>
          </Field>
          <Field label="" full>
            <label className="perm-item"><input type="checkbox" checked={form.returnsReady} onChange={set('returnsReady')} /> تفعيل الاستعداد لاستلام المرتجعات</label>
          </Field>
        </div>
      </SectionCard>
    </form>
  );
}
