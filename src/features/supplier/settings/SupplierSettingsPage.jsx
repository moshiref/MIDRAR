export default function SupplierSettingsPage() {
  return (
    <section className="page" id="page-settings">
      <div className="page-head"><div><h1>الإعدادات</h1><div className="sub">معلومات النشاط والتواصل</div></div></div>
      <div className="panel">
        <div className="form-grid">
          <div className="field"><label>اسم النشاط</label><input type="text" defaultValue="مصنع الأناقة" /></div>
          <div className="field"><label>رقم التواصل</label><input type="tel" className="en" defaultValue="+963 999 111 222" dir="ltr" /></div>
        </div>
      </div>
    </section>
  );
}
