import { useEffect, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { useToast } from '../ui/SupplierToast';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getTickets, addTicketReply, updateTicketStatus } from '../data/mockSupplierDb';

const STATUS_LABEL = { open: 'مفتوح', reviewing: 'قيد المراجعة', resolved: 'محلول' };
const STATUS_BADGE = { open: 'badge-warning', reviewing: 'badge-info', resolved: 'badge-success' };

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function SupplierDisputesPage() {
  const { supplier, employee, hasPermission } = useSupplierSession();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState(null);
  const [openTicket, setOpenTicket] = useState(null);
  const [reply, setReply] = useState('');

  const canReply = hasPermission('fulfillment') || hasPermission('accounting');

  const reload = () => getTickets(supplier.id).then((list) => {
    setTickets(list);
    setOpenTicket((cur) => (cur ? list.find((t) => t.id === cur.id) ?? null : null));
  });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !openTicket) return;
    await addTicketReply({ ticketId: openTicket.id, text: reply.trim(), actorName: employee.name });
    setReply('');
    showToast('تم إرسال الرد');
    reload();
  };

  const handleResolve = async () => {
    await updateTicketStatus({ ticketId: openTicket.id, status: 'resolved', actorName: employee.name });
    showToast('تم وضع علامة «محلول» على النزاع');
    reload();
  };

  if (tickets === null) {
    return (
      <section className="page">
        <div className="page-head"><div><h1>النزاعات والمرتجعات</h1></div></div>
        <div className="skeleton" style={{ height: 220 }} />
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head"><div><h1>النزاعات والمرتجعات</h1></div></div>

      {tickets.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="title">لا توجد نزاعات مفتوحة</div>
            <div className="msg">أي نزاع أو طلب مرتجع سيظهر هنا مع كل الأدلة والردود.</div>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الموضوع</th>
                  <th>سبب النزاع</th>
                  <th>الحالة</th>
                  <th>تاريخ الإنشاء</th>
                  <th>آخر تحديث</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="clickable" onClick={() => setOpenTicket(t)}>
                    <td className="cell-main">{t.subject}</td>
                    <td>{t.reason}</td>
                    <td><span className={`badge ${STATUS_BADGE[t.status] ?? 'badge-neutral'}`}><span className="dot" />{STATUS_LABEL[t.status] ?? t.status}</span></td>
                    <td>{formatDateTime(t.createdAt)}</td>
                    <td>{formatDateTime(t.updatedAt ?? t.createdAt)}</td>
                    <td style={{ textAlign: 'end' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setOpenTicket(t); }}>فتح</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {openTicket && (
        <div className="modal-overlay" onClick={() => setOpenTicket(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.02rem' }}>{openTicket.subject}</h3>
              <button type="button" className="drawer-close" onClick={() => setOpenTicket(null)}><X size={16} strokeWidth={2} /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>سبب النزاع</div>
              <p style={{ fontSize: '0.88rem' }}>{openTicket.reason}</p>
            </div>

            {openTicket.evidenceFiles?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>الأدلة والملفات</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {openTicket.evidenceFiles.map((f, i) => (
                    <span key={i} className="badge badge-neutral"><Paperclip size={12} strokeWidth={2} /> {f.name}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>الردود</div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {openTicket.messages.map((m, i) => (
                  <li key={i} style={{ border: '1px solid var(--border-default)', borderRadius: 9, padding: 10, fontSize: '0.86rem' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 }}>{m.from} — {formatDateTime(m.at)}</div>
                    <div>{m.text}</div>
                  </li>
                ))}
              </ul>
            </div>

            {canReply && openTicket.status !== 'resolved' && (
              <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-default)', paddingTop: 14 }}>
                <textarea
                  rows={2}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="أضف ردًا أو دليلًا إضافيًا..."
                  style={{ padding: '11px 14px', border: '1.5px solid var(--border-default)', borderRadius: 9, fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleResolve} className="btn btn-secondary btn-sm">وضع علامة «محلول»</button>
                  <button type="submit" className="btn btn-primary btn-sm">إرسال الرد</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
