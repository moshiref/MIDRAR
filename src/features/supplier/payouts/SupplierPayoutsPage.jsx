import { useMemo, useState } from 'react';
import { X, Clock, Wallet, CheckCircle2, Percent } from 'lucide-react';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { exportToCsv } from '../lib/csv';
import { printTablePdf } from '../lib/printPdf';
import ExportMenu from '../components/ExportMenu';
import WithdrawalRequestModal from './WithdrawalRequestModal';

function showToast(message) {
  if (typeof window.showToast === 'function') window.showToast(message);
}

const COMMISSION_RATE = 0.08;
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString();
const MONTH_START = Date.now() - 30 * DAY;

// Mock ledger until the settlements backend exists — every number on this
// page (cards, tables, exports) is derived from these two lists.
function entry(id, orderRef, store, product, gross, status, date) {
  const commission = Math.round(gross * COMMISSION_RATE);
  return { id, orderRef, store, product, gross, commission, net: gross - commission, status, date };
}
const LEDGER = [
  entry('st_1', 'ORD-10482', 'متجر الريّان', 'كنبة زاوية قماش', 340, 'pending', daysAgo(1)),
  entry('st_2', 'ORD-10477', 'بيت الأناقة', 'طاولة طعام خشبية', 180, 'pending', daysAgo(2)),
  entry('st_3', 'ORD-10455', 'متجر الريّان', 'كنبة زاوية قماش', 680, 'available', daysAgo(9)),
  entry('st_4', 'ORD-10431', 'دار الفخامة', 'كنبة زاوية قماش', 1020, 'available', daysAgo(12)),
  entry('st_5', 'ORD-10420', 'بيت الأناقة', 'طاولة طعام خشبية', 540, 'available', daysAgo(14)),
  entry('st_6', 'ORD-10388', 'دار الفخامة', 'كنبة زاوية قماش', 1700, 'paid', daysAgo(20)),
  entry('st_7', 'ORD-10361', 'متجر الريّان', 'طاولة طعام خشبية', 900, 'paid', daysAgo(23)),
  entry('st_8', 'ORD-10340', 'بيت الأناقة', 'كنبة زاوية قماش', 1640, 'paid', daysAgo(26)),
];
const WITHDRAWALS = [
  { id: 'wd_1', ref: 'WD-2291', amount: 2400, date: daysAgo(18), orderRefs: ['ORD-10388', 'ORD-10361'], status: 'executed', note: '' },
  { id: 'wd_2', ref: 'WD-2268', amount: 1509, date: daysAgo(25), orderRefs: ['ORD-10340'], status: 'executed', note: '' },
];

const STATUS = {
  pending: { label: 'قيد الانتظار', badge: 'badge-warning' },
  available: { label: 'متاح للسحب', badge: 'badge-success' },
  requested: { label: 'قيد التحويل', badge: 'badge-info' },
  paid: { label: 'تم صرفه', badge: 'badge-neutral' },
};
const WITHDRAWAL_STATUS = {
  processing: { label: 'قيد التحويل', badge: 'badge-info' },
  executed: { label: 'تم التحويل', badge: 'badge-success' },
};

function fmt(n) {
  return Number(n).toLocaleString('en-US');
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' });
}

const LEDGER_COLUMNS = [
  { key: 'orderRef', header: 'رقم الطلب' },
  { key: 'store', header: 'المتجر' },
  { key: 'product', header: 'المنتج' },
  { key: 'date', header: 'التاريخ' },
  { key: 'gross', header: 'قيمة البيع', num: true },
  { key: 'commission', header: 'عمولة مدرار', num: true },
  { key: 'net', header: 'صافي المستحق', num: true },
  { key: 'status', header: 'الحالة' },
];
const WITHDRAWAL_COLUMNS = [
  { key: 'ref', header: 'رقم العملية' },
  { key: 'date', header: 'تاريخ الصرف' },
  { key: 'method', header: 'وسيلة الاستلام' },
  { key: 'orders', header: 'الطلبات' },
  { key: 'amount', header: 'المبلغ', num: true },
  { key: 'statusLabel', header: 'الحالة' },
];

function ledgerExportRows(list) {
  return list.map((e) => ({ ...e, date: formatDate(e.date), status: STATUS[e.status].label }));
}

function runExport(kind, filename, title, rows, columns) {
  if (rows.length === 0) { showToast('لا توجد بيانات للتصدير'); return; }
  if (kind === 'excel') {
    exportToCsv(`${filename}.csv`, rows, columns);
    showToast('تم تصدير ملف Excel');
  } else if (!printTablePdf(title, rows, columns)) {
    showToast('اسمح بالنوافذ المنبثقة لتصدير PDF');
  }
}

function LedgerTable({ rows, showStatus = true }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>رقم الطلب</th><th>المتجر</th><th>التاريخ</th>
            <th className="num">قيمة البيع</th><th className="num">العمولة</th><th className="num">الصافي</th>
            {showStatus && <th>الحالة</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td><div className="cell-main en">{e.orderRef}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.product}</div></td>
              <td>{e.store}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(e.date)}</td>
              <td className="num en">{fmt(e.gross)}</td>
              <td className="num en" style={{ color: 'var(--danger)' }}>-{fmt(e.commission)}</td>
              <td className="num en" style={{ fontWeight: 800 }}>{fmt(e.net)}</td>
              {showStatus && <td><span className={`badge ${STATUS[e.status].badge}`}><span className="dot" />{STATUS[e.status].label}</span></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SupplierPayoutsPage() {
  const { supplier, hasPermission } = useSupplierSession();
  const [ledger, setLedger] = useState(LEDGER);
  const [withdrawals, setWithdrawals] = useState(WITHDRAWALS);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const canRequestPayout = hasPermission ? hasPermission('finance.request_payout') : true;
  const [details, setDetails] = useState(null); // 'pending' | 'available' | 'paid' | 'commission'
  const [statusFilter, setStatusFilter] = useState('all');

  const payoutMethodLabel = supplier?.payoutMethod
    ? `${supplier.payoutMethod.walletProvider ?? 'تحويل'} • ${supplier.payoutMethod.number ?? ''}`
    : 'غير محددة';

  const summary = useMemo(() => {
    const byStatus = (s) => ledger.filter((e) => e.status === s);
    const sum = (list, key) => list.reduce((acc, x) => acc + x[key], 0);
    const withdrawalsThisMonth = withdrawals.filter((w) => new Date(w.date).getTime() >= MONTH_START);
    return {
      pending: byStatus('pending'),
      available: byStatus('available'),
      withdrawalsThisMonth,
      pendingTotal: sum(byStatus('pending'), 'net'),
      availableTotal: sum(byStatus('available'), 'net'),
      requestedTotal: sum(withdrawals.filter((w) => w.status === 'processing'), 'amount'),
      paidThisMonth: sum(withdrawalsThisMonth.filter((w) => w.status === 'executed'), 'amount'),
      grossTotal: sum(ledger, 'gross'),
      commissionTotal: sum(ledger, 'commission'),
    };
  }, [ledger, withdrawals]);

  const openWithdraw = () => {
    if (!canRequestPayout) { showToast('ليست لديك صلاحية طلب سحب'); return; }
    setDetails(null);
    setWithdrawOpen(true);
  };

  // Mock submit — moves the chosen settlements to "قيد التحويل" and logs a
  // processing withdrawal until the payouts API exists.
  const submitWithdrawal = async ({ entryIds, amount, note }) => {
    const ids = new Set(entryIds);
    const withdrawal = {
      id: `wd_${Date.now()}`,
      ref: `WD-${2300 + withdrawals.length}`,
      amount,
      date: new Date().toISOString(),
      orderRefs: ledger.filter((e) => ids.has(e.id)).map((e) => e.orderRef),
      status: 'processing',
      note,
    };
    setLedger((prev) => prev.map((e) => (ids.has(e.id) ? { ...e, status: 'requested' } : e)));
    setWithdrawals((prev) => [withdrawal, ...prev]);
    showToast('تم إرسال طلب السحب');
    return withdrawal;
  };

  const filteredLedger = statusFilter === 'all' ? ledger : ledger.filter((e) => e.status === statusFilter);
  const toWithdrawalRow = (w) => ({
    ...w, date: formatDate(w.date), method: payoutMethodLabel, orders: w.orderRefs.join(' ، '), statusLabel: WITHDRAWAL_STATUS[w.status].label,
  });
  const withdrawalRows = summary.withdrawalsThisMonth.map(toWithdrawalRow);
  const allWithdrawalRows = withdrawals.map(toWithdrawalRow);

  const cards = [
    { key: 'pending', label: 'قيد الانتظار', value: fmt(summary.pendingTotal), Icon: Clock, color: 'var(--warning)' },
    { key: 'available', label: 'متاح للسحب', value: fmt(summary.availableTotal), Icon: Wallet, color: 'var(--success)', valueColor: 'var(--success)' },
    { key: 'paid', label: 'تم صرفه هالشهر', value: fmt(summary.paidThisMonth), Icon: CheckCircle2, color: 'var(--brand-blue)' },
    { key: 'commission', label: 'عمولة مدرار', value: `${COMMISSION_RATE * 100}%`, Icon: Percent, color: 'var(--text-muted)' },
  ];

  const DETAILS = {
    pending: {
      title: 'المستحقات قيد الانتظار',
      note: 'مبالغ طلبات تم تسليمها وما زالت ضمن فترة الإرجاع (7 أيام). تنتقل تلقائيًا إلى «متاح للسحب» بعد انتهاء الفترة.',
      total: summary.pendingTotal,
      exportFn: (kind) => runExport(kind, 'payouts-pending', 'المستحقات قيد الانتظار', ledgerExportRows(summary.pending), LEDGER_COLUMNS),
      body: <LedgerTable rows={summary.pending} showStatus={false} />,
    },
    available: {
      title: 'المبالغ المتاحة للسحب',
      note: `مبالغ جاهزة للتحويل إلى وسيلة الاستلام المعتمدة: ${payoutMethodLabel}`,
      total: summary.availableTotal,
      exportFn: (kind) => runExport(kind, 'payouts-available', 'المبالغ المتاحة للسحب', ledgerExportRows(summary.available), LEDGER_COLUMNS),
      body: <LedgerTable rows={summary.available} showStatus={false} />,
    },
    paid: {
      title: 'عمليات السحب خلال آخر 30 يومًا',
      note: 'الإجمالي يشمل العمليات التي تم تحويلها فعلًا إلى حسابك.',
      total: summary.paidThisMonth,
      exportFn: (kind) => runExport(kind, 'payouts-withdrawals', 'المبالغ المصروفة', withdrawalRows, WITHDRAWAL_COLUMNS),
      body: (
        <div className="table-wrap">
          <table>
            <thead><tr><th>رقم العملية</th><th>تاريخ الصرف</th><th>وسيلة الاستلام</th><th>الطلبات</th><th className="num">المبلغ</th><th>الحالة</th></tr></thead>
            <tbody>
              {withdrawalRows.map((w) => (
                <tr key={w.id}>
                  <td className="cell-main en">{w.ref}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{w.date}</td>
                  <td>{w.method}</td>
                  <td className="en" style={{ fontSize: '0.8rem' }}>{w.orders}</td>
                  <td className="num en" style={{ fontWeight: 800 }}>{fmt(w.amount)}</td>
                  <td><span className={`badge ${WITHDRAWAL_STATUS[w.status].badge}`}><span className="dot" />{w.statusLabel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    commission: {
      title: 'عمولة مدرار',
      note: `تُقتطع عمولة ثابتة بنسبة ${COMMISSION_RATE * 100}% من قيمة البيع لكل طلب مكتمل، ويُحوَّل لك الصافي.`,
      total: summary.commissionTotal,
      exportFn: (kind) => runExport(kind, 'payouts-commission', 'تفاصيل عمولة مدرار', ledgerExportRows(ledger), LEDGER_COLUMNS),
      body: (
        <>
          <div className="kpi-grid cols-3" style={{ marginBottom: 16 }}>
            <div className="kpi-card"><span className="label">إجمالي المبيعات</span><div className="value en">{fmt(summary.grossTotal)}</div></div>
            <div className="kpi-card"><span className="label">إجمالي العمولة</span><div className="value en" style={{ color: 'var(--danger)' }}>{fmt(summary.commissionTotal)}</div></div>
            <div className="kpi-card"><span className="label">صافي أرباحك</span><div className="value en" style={{ color: 'var(--success)' }}>{fmt(summary.grossTotal - summary.commissionTotal)}</div></div>
          </div>
          <LedgerTable rows={ledger} />
        </>
      ),
    },
  };
  const active = details ? DETAILS[details] : null;

  return (
    <section className="page" id="page-dues">
      <div className="page-head"><div><h1>المستحقات</h1><div className="sub">أرباحك من كل تسوية</div></div>
        <div className="page-actions" style={{ display: 'flex', gap: 8 }}>
          <ExportMenu onExport={(kind) => runExport(kind, 'payouts', 'سجل المستحقات', ledgerExportRows(filteredLedger), LEDGER_COLUMNS)} />
          <button type="button" className="btn btn-primary" onClick={openWithdraw}>طلب سحب</button>
        </div>
      </div>

      <div className="kpi-grid">
        {cards.map(({ key, label, value, Icon, color, valueColor }) => (
          <button
            key={key}
            type="button"
            className="kpi-card kpi-card-link"
            style={{ textAlign: 'start', cursor: 'pointer', font: 'inherit', color: 'inherit', width: '100%' }}
            onClick={() => setDetails(key)}
          >
            <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon size={16} strokeWidth={2} color={color} />{label}</span>
            <div className="value en" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', fontWeight: 700, marginTop: 8 }}>عرض التفاصيل ←</div>
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>سجل المستحقات</h3>
            <div className="sub">كل الطلبات المحتسبة في مستحقاتك</div>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">كل الحالات</option>
            {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </div>
        <LedgerTable rows={filteredLedger} />
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-head">
          <div>
            <h3>سجل طلبات السحب</h3>
            <div className="sub">{summary.requestedTotal > 0 ? `مبالغ قيد التحويل: ${fmt(summary.requestedTotal)}` : 'كل عمليات السحب السابقة وحالتها'}</div>
          </div>
          <ExportMenu onExport={(kind) => runExport(kind, 'withdrawals', 'سجل طلبات السحب', allWithdrawalRows, WITHDRAWAL_COLUMNS)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>رقم العملية</th><th>التاريخ</th><th>الطلبات</th><th className="num">المبلغ</th><th>الحالة</th></tr></thead>
            <tbody>
              {allWithdrawalRows.map((w) => (
                <tr key={w.id}>
                  <td className="cell-main en">{w.ref}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{w.date}</td>
                  <td className="en" style={{ fontSize: '0.8rem' }}>{w.orders}</td>
                  <td className="num en" style={{ fontWeight: 800 }}>{fmt(w.amount)}</td>
                  <td><span className={`badge ${WITHDRAWAL_STATUS[w.status].badge}`}><span className="dot" />{w.statusLabel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {withdrawOpen && (
        <WithdrawalRequestModal
          entries={summary.available}
          payoutMethod={supplier?.payoutMethod}
          onSubmit={submitWithdrawal}
          onClose={() => setWithdrawOpen(false)}
        />
      )}

      {active && (
        <div className="modal-overlay" onClick={() => setDetails(null)}>
          <div className="modal-box form-modal" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h3>{active.title}</h3>
              <button type="button" className="drawer-close" onClick={() => setDetails(null)}><X size={16} strokeWidth={2} /></button>
            </div>
            <div className="drawer-body" style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>الإجمالي</div>
                  <div className="en" style={{ fontSize: '1.5rem', fontWeight: 800, direction: 'ltr', textAlign: 'start' }}>{fmt(active.total)}</div>
                </div>
                <ExportMenu onExport={active.exportFn} />
              </div>
              <div className="tip-box" style={{ marginTop: 0, marginBottom: 16 }}><div className="s">{active.note}</div></div>
              {active.body}
            </div>
            <div className="drawer-foot">
              <button type="button" className="btn btn-secondary" onClick={() => setDetails(null)}>إغلاق</button>
              {details === 'available' && summary.available.length > 0 && <button type="button" className="btn btn-primary" onClick={openWithdraw}>طلب سحب {fmt(summary.availableTotal)}</button>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
