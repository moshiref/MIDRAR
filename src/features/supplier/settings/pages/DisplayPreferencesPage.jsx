import { useEffect, useState } from 'react';
import { Field, SectionCard, SaveButton, useUnsavedGuard, useSettingsForm } from '../SettingsShared';
import { defaultUserPreferences, updateUserPreferences } from '../../data/mockSupplierDb';
import { TIMEZONES } from '../settingsCatalog';
import { useToast } from '../../ui/SupplierToast';
import { useSupplierSession } from '../../session/SupplierSessionContext';

const LANDING_PAGES = [
  { value: '/supplier', label: 'نظرة عامة' }, { value: '/supplier/orders', label: 'طلبات التجهيز' },
  { value: '/supplier/products', label: 'المنتجات' }, { value: '/supplier/inventory', label: 'المخزون' },
];

function toForm(employee) {
  return { language: employee.preferredLanguage ?? 'ar', ...defaultUserPreferences(), ...(employee.preferences ?? {}) };
}

// preferredLanguage already lives on the employee record from the Team
// module; everything else here is the `preferences` bag. Both are
// personal to this member and never touch team-permission checks.

export default function DisplayPreferencesPage({ employee }) {
  const { showToast } = useToast();
  const { refreshTeam } = useSupplierSession();
  const { form, setForm, dirty, reset } = useSettingsForm(toForm(employee));
  const [saving, setSaving] = useState(false);

  useEffect(() => { reset(toForm(employee)); }, [employee, reset]);
  useUnsavedGuard(dirty);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserPreferences({ employeeId: employee.id, patch: form });
      showToast('تم حفظ تفضيلاتك الشخصية');
      await refreshTeam();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard
        title="اللغة والعرض"
        description="تفضيلات شخصية لحسابك فقط — لا تغيّر إعدادات باقي أعضاء الفريق"
        footer={<SaveButton saving={saving} dirty={dirty} />}
      >
        <div className="form-grid">
          <Field label="اللغة">
            <select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}>
              <option value="ar">العربية</option>
              <option value="en">الإنجليزية</option>
            </select>
          </Field>
          <Field label="المنطقة الزمنية">
            <select value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}>
              {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="تنسيق التاريخ">
            <select value={form.dateFormat} onChange={(e) => setForm((f) => ({ ...f, dateFormat: e.target.value }))}>
              <option value="DD/MM/YYYY">31/12/2026</option>
              <option value="YYYY-MM-DD">2026-12-31</option>
            </select>
          </Field>
          <Field label="تنسيق الأرقام">
            <select value={form.numberFormat} onChange={(e) => setForm((f) => ({ ...f, numberFormat: e.target.value }))}>
              <option value="ar">١٢٣٤ (عربي)</option>
              <option value="en">1234 (إنجليزي)</option>
            </select>
          </Field>
          <Field label="طريقة عرض العملة">
            <select value={form.currencyDisplay} onChange={(e) => setForm((f) => ({ ...f, currencyDisplay: e.target.value }))}>
              <option value="symbol">رمز ($)</option>
              <option value="code">رمز الدولة (USD)</option>
            </select>
          </Field>
          <Field label="كثافة الجداول">
            <select value={form.density} onChange={(e) => setForm((f) => ({ ...f, density: e.target.value }))}>
              <option value="comfortable">مريحة</option>
              <option value="compact">مضغوطة</option>
            </select>
          </Field>
          <Field label="عدد الصفوف في الصفحة">
            <input type="number" min="5" className="en" dir="ltr" value={form.rowsPerPage} onChange={(e) => setForm((f) => ({ ...f, rowsPerPage: Number(e.target.value) }))} />
          </Field>
          <Field label="الصفحة الافتراضية بعد تسجيل الدخول">
            <select value={form.landingPage} onChange={(e) => setForm((f) => ({ ...f, landingPage: e.target.value }))}>
              {LANDING_PAGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="" full>
            <label className="perm-item"><input type="checkbox" checked={form.rememberFilters} onChange={(e) => setForm((f) => ({ ...f, rememberFilters: e.target.checked }))} /> حفظ الفلاتر الأخيرة</label>
          </Field>
        </div>
      </SectionCard>
    </form>
  );
}
