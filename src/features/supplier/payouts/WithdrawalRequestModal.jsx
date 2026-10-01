import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Wallet, ShieldCheck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export const MIN_WITHDRAWAL = 50;

function fmt(n) {
  return Number(n).toLocaleString('en-US');
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' });
}
function maskNumber(value) {
  const str = String(value ?? '');
  return str.length > 4 ? `${'•'.repeat(str.length - 4)}${str.slice(-4)}` : str;
}

/** Why the payout method can't receive money right now, or null if it can. */
function payoutMethodBlocker(method) {
  if (!method?.number) return 'لم تُضف وسيلة استلام للمستحقات بعد.';
  if (method.status && method.status !== 'approved') return 'وسيلة الاستلام قيد التحقق من فريق مدرار.';
  if (method.securityHoldUntil && new Date(method.securityHoldUntil) > new Date()) {
    return `تم تغيير وسيلة الاستلام مؤخرًا — السحب معلّق حتى ${formatDate(method.securityHoldUntil)} لحماية حسابك.`;
  }
  return null;
}

/**
 * Full withdrawal board: pick which available settlements to cash out,
 * review the payout method and totals, then confirm. `onSubmit` receives
 * `{ entryIds, amount, note }` and returns the created withdrawal.
 */
export default function WithdrawalRequestModal({ entries, payoutMethod, onSubmit, onClose }) {
  const [selected, setSelected] = useState(() => new Set(entries.map((e) => e.id)));
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const overlayPressRef = useRef(false);

  const chosen = entries.filter((e) => selected.has(e.id));
  const gross = chosen.reduce((s, e) => s + e.gross, 0);
  const commission = chosen.reduce((s, e) => s + e.commission, 0);
  const amount = gross - commission;
  const availableTotal = entries.reduce((s, e) => s + e.net, 0);
  const blocker = payoutMethodBlocker(payoutMethod);
  const belowMin = chosen.length > 0 && amount < MIN_WITHDRAWAL;
  const canSubmit = !blocker && chosen.length > 0 && !belowMin && confirmed && !submitting;
  const allSelected = entries.length > 0 && selected.size === entries.length;

  const toggle = (id) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(entries.map((e) => e.id)));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      setResult(await onSubmit({ entryIds: chosen.map((e) => e.id), amount, note: note.trim() }));
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => { if (!submitting) onClose(); };
  const handleOverlayMouseDown = (e) => { overlayPressRef.current = e.target === e.currentTarget; };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && overlayPressRef.current) close();
    overlayPressRef.current = false;
  };

  const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', padding: '6px 0' };
  const sectionTitle = { fontSize: '0.9rem', fontWeight: 800, marginBottom: 10 };

  if (result) {
    return (
      <div className="modal-overlay" onMouseDown={handleOverlayMouseDown} onClick={handleOverlayClick}>
        <div className="modal-box" style={{ maxWidth: 440, textAlign: 'center' }}>
          <CheckCircle2 size={48} strokeWidth={1.8} color="var(--success)" style={{ margin: '4px auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>تم إرسال طلب السحب</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16 }}>سيتم تحويل المبلغ إلى وسيلة الاستلام خلال 1 - 3 أيام عمل، وستصلك رسالة عند التنفيذ.</p>
          <div className="panel" style={{ padding: '12px 16px', marginBottom: 18, textAlign: 'start' }}>
            <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>رقم الطلب</span><span className="en" style={{ fontWeight: 800 }}>{result.ref}</span></div>
            <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>المبلغ</span><span className="en" style={{ fontWeight: 800 }}>{fmt(result.amount)}</span></div>
            <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>الحالة</span><span className="badge badge-info"><span className="dot" />قيد التحويل</span></div>
          </div>
          <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>تم</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown} onClick={handleOverlayClick}>
      <div className="modal-box form-modal" style={{ maxWidth: 720 }}>
        <div className="drawer-head">
          <h3>طلب سحب المستحقات</h3>
          <button type="button" className="drawer-close" onClick={close}><X size={16} strokeWidth={2} /></button>
        </div>

        <div className="drawer-body" style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--success-bg)' }}>
            <Wallet size={28} strokeWidth={2} color="var(--success)" />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>الرصيد المتاح للسحب</div>
              <div className="en" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', direction: 'ltr', textAlign: 'start' }}>{fmt(availableTotal)}</div>
            </div>
          </div>

          {blocker && (
            <div className="tip-box danger" style={{ marginTop: 0 }}>
              <AlertTriangle size={18} strokeWidth={2} color="var(--danger)" style={{ flexShrink: 0 }} />
              <div>
                <div className="t">لا يمكن السحب حاليًا</div>
                <div className="s">{blocker} <Link to="/supplier/settings" style={{ fontWeight: 700, textDecoration: 'underline' }}>الذهاب إلى الإعدادات المالية</Link></div>
              </div>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={sectionTitle}>اختر الطلبات المراد سحب مستحقاتها</div>
              {entries.length > 0 && (
                <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={toggleAll}>{allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}</button>
              )}
            </div>
            {entries.length === 0 ? (
              <div className="empty-state" style={{ padding: 20 }}>
                <div className="title">لا يوجد رصيد متاح للسحب</div>
                <div className="msg">تنتقل المستحقات إلى «متاح للسحب» بعد انتهاء فترة الإرجاع.</div>
              </div>
            ) : (
              <div className="table-wrap" style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                <table>
                  <thead><tr><th style={{ width: 36 }} /><th>رقم الطلب</th><th>المتجر</th><th>التاريخ</th><th className="num">الصافي</th></tr></thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} className="clickable" onClick={() => toggle(e.id)}>
                        <td><input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)} onClick={(ev) => ev.stopPropagation()} style={{ width: 16, height: 16 }} /></td>
                        <td><div className="cell-main en">{e.orderRef}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.product}</div></td>
                        <td>{e.store}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(e.date)}</td>
                        <td className="num en" style={{ fontWeight: 800 }}>{fmt(e.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
            <div className="panel" style={{ padding: 16 }}>
              <div style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={16} strokeWidth={2} color="var(--brand-blue)" />وسيلة الاستلام</div>
              {payoutMethod?.number ? (
                <>
                  <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>النوع</span><span style={{ fontWeight: 700 }}>{payoutMethod.walletProvider ?? 'تحويل بنكي'}</span></div>
                  <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>صاحب الحساب</span><span style={{ fontWeight: 700 }}>{payoutMethod.holderName}</span></div>
                  <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>الرقم</span><span className="en" style={{ fontWeight: 700, direction: 'ltr' }}>{maskNumber(payoutMethod.number)}</span></div>
                  <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>عملة الاستلام</span><span className="en" style={{ fontWeight: 700 }}>{payoutMethod.currency}</span></div>
                </>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>غير محددة</div>
              )}
              <Link to="/supplier/settings" style={{ display: 'inline-block', marginTop: 8, fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-blue)' }}>تغيير وسيلة الاستلام</Link>
            </div>

            <div className="panel" style={{ padding: 16 }}>
              <div style={sectionTitle}>ملخص السحب</div>
              <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>عدد الطلبات</span><span className="en" style={{ fontWeight: 700 }}>{chosen.length}</span></div>
              <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>إجمالي المبيعات</span><span className="en" style={{ fontWeight: 700 }}>{fmt(gross)}</span></div>
              <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>عمولة مدرار (مخصومة)</span><span className="en" style={{ fontWeight: 700, color: 'var(--danger)' }}>-{fmt(commission)}</span></div>
              <div style={rowStyle}><span style={{ color: 'var(--text-muted)' }}>رسوم التحويل</span><span className="en" style={{ fontWeight: 700 }}>0</span></div>
              <div style={{ ...rowStyle, borderTop: '1px solid var(--border-default)', marginTop: 6, paddingTop: 10 }}>
                <span style={{ fontWeight: 800 }}>ستستلم</span>
                <span className="en" style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--success)' }}>{fmt(amount)}</span>
              </div>
              {belowMin && <div className="field-error" style={{ marginTop: 6 }}>الحد الأدنى للسحب {MIN_WITHDRAWAL}.</div>}
            </div>
          </div>

          <div className="field full">
            <label>ملاحظة لفريق المالية <span className="field-hint">(اختياري)</span></label>
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="أي تفاصيل إضافية بخصوص التحويل" />
          </div>

          <div className="tip-box" style={{ marginTop: 0 }}>
            <Clock size={18} strokeWidth={2} color="var(--brand-blue)" style={{ flexShrink: 0 }} />
            <div>
              <div className="t">مدة التنفيذ</div>
              <div className="s">تتم مراجعة الطلب وتحويل المبلغ خلال 1 - 3 أيام عمل. يمكنك متابعة حالة الطلب من «سجل طلبات السحب».</div>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} style={{ width: 16, height: 16, marginTop: 2 }} />
            <span>أؤكد صحة بيانات وسيلة الاستلام، وأن المبلغ سيُحوَّل إليها.</span>
          </label>
        </div>

        <div className="drawer-foot">
          <button type="button" className="btn btn-secondary" onClick={close} disabled={submitting}>إلغاء</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? 'جارٍ الإرسال...' : `تأكيد سحب ${fmt(amount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
