export default function SupplierInventoryPage() {
  return (
    <section className="page" id="page-inventory">
      <div className="page-head"><div><h1>المخزون</h1><div className="sub">حدّث كميات مخزونك أول بأول</div></div></div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>المنتج</th><th className="num">الكمية الحالية</th><th>تحديث</th></tr></thead>
            <tbody>
              <tr><td className="cell-main">طقم كنب ٣ قطع</td><td className="num">14</td><td><input type="text" className="en" defaultValue="14" style={{ width: '70px', padding: '6px 10px', border: '1.5px solid var(--border-default)', borderRadius: '7px' }} /></td></tr>
              <tr><td className="cell-main">طاولة طعام خشب</td><td className="num">4</td><td><input type="text" className="en" defaultValue="4" style={{ width: '70px', padding: '6px 10px', border: '1.5px solid var(--border-default)', borderRadius: '7px' }} /></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
