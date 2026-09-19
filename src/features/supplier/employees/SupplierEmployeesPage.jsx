export default function SupplierEmployeesPage() {
  return (
    <section className="page" id="page-team">
      <div className="page-head"><div><h1>الفريق</h1><div className="sub">أدر صلاحيات فريقك</div></div>
        <div className="page-actions"><button className="btn btn-primary">+ دعوة عضو</button></div></div>
      <div className="panel">
        <div className="simple-list">
          <div className="simple-row"><div className="ic" style={{ background: 'var(--info-bg)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg></div><div className="txt"><div className="t">فادي حداد</div><div className="s">مسؤول المورد</div></div><span className="badge badge-success"><span className="dot" />نشط</span></div>
        </div>
      </div>
    </section>
  );
}
