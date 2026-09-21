import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { Field, SectionCard, SaveButton, MetaLine, useUnsavedGuard, useSettingsForm, formatDateTime } from '../SettingsShared';
import { SUPPLIER_TYPES, SECTORS, PROVINCES, REVIEW_FIELD_LABELS } from '../settingsCatalog';
import { updateGeneralProfile, simulateReviewDecision } from '../../data/mockSupplierDb';
import { useToast } from '../../ui/SupplierToast';
import { useSupplierSession } from '../../session/SupplierSessionContext';

const FIELDS = ['legalName', 'companyName', 'logo', 'coverImage', 'activityType', 'description', 'sectors', 'startYear', 'commercialRegister', 'taxNumber', 'licenseNumber', 'province', 'city', 'address', 'website', 'socialLinks', 'preferredLanguage', 'timezone'];

function toForm(supplier) {
  return Object.fromEntries(FIELDS.map((f) => [f, supplier[f] ?? (f === 'sectors' || f === 'socialLinks' ? [] : '')]));
}

export default function GeneralProfilePage({ supplier, employee, hasPermission, reloadOverview }) {
  const { showToast } = useToast();
  const { refreshSupplier } = useSupplierSession();
  const { form, setForm, dirty, reset } = useSettingsForm(toForm(supplier));
  const [saving, setSaving] = useState(false);
  const canEdit = hasPermission('settings.edit_general');

  useEffect(() => { reset(toForm(supplier)); }, [supplier, reset]);
  useUnsavedGuard(dirty);

  const pendingChanges = (supplier.pendingChanges ?? []).filter((c) => c.status === 'pending');

  const toggleSector = (s) => setForm((f) => ({ ...f, sectors: f.sectors.includes(s) ? f.sectors.filter((x) => x !== s) : [...f.sectors, s] }));

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  const addSocialLink = () => setForm((f) => ({ ...f, socialLinks: [...f.socialLinks, { platform: '', url: '' }] }));
  const updateSocialLink = (i, patch) => setForm((f) => ({ ...f, socialLinks: f.socialLinks.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) }));
  const removeSocialLink = (i) => setForm((f) => ({ ...f, socialLinks: f.socialLinks.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { queuedCount } = await updateGeneralProfile({ supplierId: supplier.id, actorEmployeeId: employee.id, patch: form });
      showToast(queuedCount > 0 ? `تم الحفظ — ${queuedCount} حقل قانوني بانتظار مراجعة إدارة مدرار` : 'تم حفظ الملف العام بنجاح');
      await refreshSupplier();
      reloadOverview();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReviewDecision = async (changeId, decision) => {
    await simulateReviewDecision({ supplierId: supplier.id, changeId, decision, note: '' });
    showToast(decision === 'approved' ? 'تمت محاكاة اعتماد التعديل' : 'تمت محاكاة رفض التعديل');
    await refreshSupplier();
    reloadOverview();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="tip-box">
        <div>
          <div className="t">لا يظهر الاسم القانوني أو بيانات التواصل للتجار</div>
          <div className="s">يرى التاجر بطاقة مورد مجهولة الهوية مع مؤشرات الأداء فقط. تغيير الحقول القانونية الأساسية (الاسم القانوني، نوع المورد، السجل التجاري، الرقم الضريبي، رقم الترخيص) يحتاج مراجعة إدارة مدرار قبل التطبيق.</div>
        </div>
      </div>

      {pendingChanges.length > 0 && (
        <div className="panel">
          <div className="panel-head"><div><h3>تعديلات بانتظار المراجعة</h3></div></div>
          <div className="simple-list">
            {pendingChanges.map((c) => (
              <div key={c.id} className="simple-row">
                <div className="ic" style={{ background: 'var(--warning-bg)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></svg></div>
                <div className="txt">
                  <div className="t">{REVIEW_FIELD_LABELS[c.field] ?? c.field}: «{String(c.oldValue) || '—'}» ← «{String(c.newValue)}»</div>
                  <div className="s">أُرسل بواسطة {c.requestedByName} في {formatDateTime(c.requestedAt)}</div>
                </div>
                <span className="badge badge-warning"><span className="dot" />بانتظار المراجعة</span>
              </div>
            ))}
          </div>
          <div className="panel-foot" style={{ justifyContent: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>أداة تجريبية (لا يوجد لوحة إدارة حقيقية):</span>
            {pendingChanges.map((c) => (
              <span key={c.id} style={{ display: 'inline-flex', gap: 6 }}>
                <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => handleReviewDecision(c.id, 'approved')}>اعتماد «{REVIEW_FIELD_LABELS[c.field]}»</button>
                <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto', color: 'var(--danger)' }} onClick={() => handleReviewDecision(c.id, 'rejected')}>رفض</button>
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <SectionCard
          title="الملف العام"
          description="بيانات مؤسستك كما تُستخدم داخليًا وفي مراسلات مدرار"
          meta={<MetaLine updatedAt={supplier.updatedAt} updatedBy={supplier.updatedBy} />}
          footer={canEdit && <SaveButton saving={saving} dirty={dirty} />}
        >
          <div className="form-grid">
            <Field label="اللوجو" full>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {form.logo ? <img src={form.logo} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} /> : <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--surface-subtle)' }} />}
                <label className="btn btn-secondary btn-sm" style={{ width: 'auto', cursor: 'pointer' }}>
                  <Camera size={14} /> تغيير اللوجو
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} disabled={!canEdit} />
                </label>
              </div>
            </Field>

            <Field label="الاسم القانوني" hint="يحتاج مراجعة إدارة مدرار عند التعديل">
              <input value={form.legalName} onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))} disabled={!canEdit} />
            </Field>
            <Field label="الاسم التجاري">
              <input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} disabled={!canEdit} />
            </Field>

            <Field label="نوع المورد" hint="يحتاج مراجعة إدارة مدرار عند التعديل">
              <select value={form.activityType} onChange={(e) => setForm((f) => ({ ...f, activityType: e.target.value }))} disabled={!canEdit}>
                {SUPPLIER_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="سنة بدء النشاط">
              <input type="number" className="en" dir="ltr" value={form.startYear} onChange={(e) => setForm((f) => ({ ...f, startYear: Number(e.target.value) }))} disabled={!canEdit} />
            </Field>

            <Field label="نبذة داخلية عن النشاط" full>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} disabled={!canEdit} />
            </Field>

            <Field label="القطاعات / فئات المنتجات" full>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {SECTORS.map((s) => (
                  <label key={s} className="perm-item">
                    <input type="checkbox" checked={form.sectors.includes(s)} onChange={() => toggleSector(s)} disabled={!canEdit} /> {s}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="السجل التجاري" hint="يحتاج مراجعة إدارة مدرار عند التعديل">
              <input className="en" dir="ltr" value={form.commercialRegister} onChange={(e) => setForm((f) => ({ ...f, commercialRegister: e.target.value }))} disabled={!canEdit} />
            </Field>
            <Field label="الرقم الضريبي" hint="يحتاج مراجعة إدارة مدرار عند التعديل">
              <input className="en" dir="ltr" value={form.taxNumber} onChange={(e) => setForm((f) => ({ ...f, taxNumber: e.target.value }))} disabled={!canEdit} />
            </Field>
            <Field label="رقم الترخيص / وثيقة المزاولة" hint="يحتاج مراجعة إدارة مدرار عند التعديل">
              <input className="en" dir="ltr" value={form.licenseNumber} onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))} disabled={!canEdit} />
            </Field>

            <Field label="المحافظة">
              <select value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} disabled={!canEdit}>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="المدينة">
              <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} disabled={!canEdit} />
            </Field>
            <Field label="العنوان الإداري" full>
              <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} disabled={!canEdit} />
            </Field>

            <Field label="الموقع الإلكتروني (اختياري)">
              <input className="en" dir="ltr" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} disabled={!canEdit} placeholder="https://" />
            </Field>
            <Field label="اللغة المفضلة">
              <select value={form.preferredLanguage} onChange={(e) => setForm((f) => ({ ...f, preferredLanguage: e.target.value }))} disabled={!canEdit}>
                <option value="ar">العربية</option>
                <option value="en">الإنجليزية</option>
              </select>
            </Field>

            <Field label="روابط صفحات العمل (اختياري)" full>
              {form.socialLinks.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input placeholder="المنصة" value={l.platform} onChange={(e) => updateSocialLink(i, { platform: e.target.value })} disabled={!canEdit} style={{ maxWidth: 140 }} />
                  <input className="en" dir="ltr" placeholder="https://" value={l.url} onChange={(e) => updateSocialLink(i, { url: e.target.value })} disabled={!canEdit} style={{ flex: 1 }} />
                  {canEdit && <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => removeSocialLink(i)}>إزالة</button>}
                </div>
              ))}
              {canEdit && <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={addSocialLink}>+ إضافة رابط</button>}
            </Field>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
