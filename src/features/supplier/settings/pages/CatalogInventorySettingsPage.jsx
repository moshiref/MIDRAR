import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Field, SectionCard, SaveButton, MetaLine, useUnsavedGuard, useSettingsForm, NoAccess } from '../SettingsShared';
import { updateCatalogSettings, updateInventorySettings, getLocations, getCategories } from '../../data/mockSupplierDb';
import { exportToCsv } from '../../lib/csv';
import { useToast } from '../../ui/SupplierToast';
import { useSupplierSession } from '../../session/SupplierSessionContext';

export default function CatalogInventorySettingsPage({ supplier, employee, hasPermission }) {
  const { showToast } = useToast();
  const { refreshSupplier } = useSupplierSession();
  const catalog = useSettingsForm({ ...supplier.catalogSettings });
  const inventory = useSettingsForm({ ...supplier.inventorySettings });
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const canEditCatalog = hasPermission('settings.manage_catalog');
  const canEditInventory = hasPermission('settings.manage_inventory_settings');

  useEffect(() => { catalog.reset({ ...supplier.catalogSettings }); inventory.reset({ ...supplier.inventorySettings }); }, [supplier]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    getLocations(supplier.id).then(setLocations);
    getCategories(supplier.id).then(setCategories);
  }, [supplier.id]);
  useUnsavedGuard(catalog.dirty || inventory.dirty);

  if (!canEditCatalog && !canEditInventory) return <NoAccess label="صفحة إعدادات المنتجات والمخزون" />;

  const saveCatalog = async (e) => {
    e.preventDefault();
    setSavingCatalog(true);
    try {
      await updateCatalogSettings({ supplierId: supplier.id, actorEmployeeId: employee.id, patch: catalog.form, expectedUpdatedAt: catalog.form.updatedAt });
      showToast('تم حفظ إعدادات المنتجات — لا تغيّر منتجات موجودة مسبقًا');
      await refreshSupplier();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingCatalog(false);
    }
  };

  const saveInventory = async (e) => {
    e.preventDefault();
    setSavingInventory(true);
    try {
      await updateInventorySettings({ supplierId: supplier.id, actorEmployeeId: employee.id, patch: inventory.form, expectedUpdatedAt: inventory.form.updatedAt });
      showToast('تم حفظ إعدادات المخزون');
      await refreshSupplier();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingInventory(false);
    }
  };

  const downloadTemplate = () => {
    exportToCsv('نموذج-استيراد-المخزون.csv', [{ sku: 'مثال-1', location: locations[0]?.name ?? '', quantity: 0 }], [
      { key: 'sku', header: 'رمز المنتج/المتغير' }, { key: 'location', header: 'الموقع' }, { key: 'quantity', header: 'الكمية' },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <form onSubmit={saveCatalog}>
        <SectionCard
          title="إعدادات المنتجات"
          description="القيم الافتراضية عند إضافة منتج جديد — لا تغيّر المنتجات القائمة، وتبقى المنتجات والأسعار الجديدة خاضعة لاعتماد إدارة مدرار"
          meta={<MetaLine updatedAt={catalog.form.updatedAt} updatedBy={supplier.catalogSettings?.updatedBy} />}
          footer={canEditCatalog && <SaveButton saving={savingCatalog} dirty={catalog.dirty} />}
        >
          <div className="form-grid">
            <Field label="العملة الافتراضية للمنتجات الجديدة" hint="لا يغيّر عملة المنتجات الموجودة">
              <select value={catalog.form.defaultCurrency} onChange={(e) => catalog.setForm((f) => ({ ...f, defaultCurrency: e.target.value }))} disabled={!canEditCatalog}>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="SYP">ليرة سورية جديدة (SYP)</option>
              </select>
            </Field>
            <Field label="القسم الافتراضي">
              <select value={catalog.form.defaultCategoryId ?? ''} onChange={(e) => catalog.setForm((f) => ({ ...f, defaultCategoryId: e.target.value || null }))} disabled={!canEditCatalog}>
                <option value="">بدون قسم</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="مدة التجهيز الافتراضية (أيام)">
              <input type="number" min="0" className="en" dir="ltr" value={catalog.form.defaultPrepDays} onChange={(e) => catalog.setForm((f) => ({ ...f, defaultPrepDays: Number(e.target.value) }))} disabled={!canEditCatalog} />
            </Field>
            <Field label="موقع التخزين الافتراضي">
              <select value={catalog.form.defaultLocationId} onChange={(e) => catalog.setForm((f) => ({ ...f, defaultLocationId: e.target.value }))} disabled={!canEditCatalog}>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
            <Field label="وحدة القياس الافتراضية">
              <input value={catalog.form.defaultUnit} onChange={(e) => catalog.setForm((f) => ({ ...f, defaultUnit: e.target.value }))} disabled={!canEditCatalog} />
            </Field>
            <Field label="قالب وصف افتراضي (اختياري)" full>
              <textarea rows={2} value={catalog.form.descriptionTemplate} onChange={(e) => catalog.setForm((f) => ({ ...f, descriptionTemplate: e.target.value }))} disabled={!canEditCatalog} />
            </Field>
            <Field label="" full hint="حفظ العمل تلقائيًا كمسودة أثناء تعبئة نموذج منتج جديد">
              <label className="perm-item"><input type="checkbox" checked={catalog.form.autosaveDrafts} disabled /> تفعيل حفظ المنتج كمسودة تلقائيًا (مفعّل دائمًا في نموذج المنتج)</label>
            </Field>
            <Field label="" full>
              <label className="perm-item"><input type="checkbox" checked={catalog.form.remindIncompleteProducts} onChange={(e) => catalog.setForm((f) => ({ ...f, remindIncompleteProducts: e.target.checked }))} disabled={!canEditCatalog} /> تذكيري عند وجود منتجات غير مكتملة</label>
            </Field>
            <Field label="" full>
              <label className="perm-item"><input type="checkbox" checked={catalog.form.notifyOnApprovalDecision} onChange={(e) => catalog.setForm((f) => ({ ...f, notifyOnApprovalDecision: e.target.checked }))} disabled={!canEditCatalog} /> إشعاري عند اعتماد أو رفض منتج</label>
            </Field>
          </div>
        </SectionCard>
      </form>

      <form onSubmit={saveInventory}>
        <SectionCard
          title="إعدادات المخزون"
          description="لا يمكن لأي إعداد هنا تجاوز منع البيع الزائد، ولا تعديل الكمية المحجوزة مباشرة"
          meta={<MetaLine updatedAt={inventory.form.updatedAt} updatedBy={supplier.inventorySettings?.updatedBy} />}
          footer={canEditInventory && <SaveButton saving={savingInventory} dirty={inventory.dirty} />}
        >
          <div className="form-grid">
            <Field label="حد التنبيه الافتراضي لانخفاض المخزون">
              <input type="number" min="0" className="en" dir="ltr" value={inventory.form.lowStockThreshold} onChange={(e) => inventory.setForm((f) => ({ ...f, lowStockThreshold: Number(e.target.value) }))} disabled={!canEditInventory} />
            </Field>
            <Field label="تنبيه وجود حجز طويل بعد (أيام)">
              <input type="number" min="0" className="en" dir="ltr" value={inventory.form.longReservationAlertDays} onChange={(e) => inventory.setForm((f) => ({ ...f, longReservationAlertDays: Number(e.target.value) }))} disabled={!canEditInventory} />
            </Field>
            <Field label="" full>
              <label className="perm-item"><input type="checkbox" checked={inventory.form.outOfStockAlert} onChange={(e) => inventory.setForm((f) => ({ ...f, outOfStockAlert: e.target.checked }))} disabled={!canEditInventory} /> تنبيه عند نفاد المخزون</label>
            </Field>
            <Field label="" full>
              <label className="perm-item"><input type="checkbox" checked={inventory.form.allowBulkEdit} onChange={(e) => inventory.setForm((f) => ({ ...f, allowBulkEdit: e.target.checked }))} disabled={!canEditInventory} /> السماح بالتعديل الجماعي للكميات</label>
            </Field>
            <Field label="" full hint="كل تعديل يدوي يولّد حركة مخزون وسجل تدقيق بغض النظر عن هذا الخيار">
              <label className="perm-item"><input type="checkbox" checked={inventory.form.requireReasonOnManualAdjust} onChange={(e) => inventory.setForm((f) => ({ ...f, requireReasonOnManualAdjust: e.target.checked }))} disabled={!canEditInventory} /> اشتراط سبب عند تعديل الكمية يدويًا</label>
            </Field>
          </div>
        </SectionCard>
      </form>

      <div className="panel">
        <div className="panel-head"><div><h3>الاستيراد الجماعي</h3><div className="sub">تنزيل نموذج ملف الاستيراد — معالجة الصفوف الخاطئة تتم قبل تنفيذ الاستيراد</div></div></div>
        <div style={{ padding: '4px 22px 20px' }}>
          <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={downloadTemplate}><Download size={14} /> تنزيل نموذج ملف الاستيراد</button>
        </div>
      </div>
    </div>
  );
}
