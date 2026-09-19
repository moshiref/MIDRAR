import { useEffect, useState } from 'react';
import { Paperclip } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../ui/PageHeader';
import { SkeletonRows } from '../ui/Skeleton';
import { useToast } from '../ui/SupplierToast';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getTickets, addTicketReply, updateTicketStatus } from '../data/mockSupplierDb';

const STATUS_LABEL = { open: 'مفتوح', reviewing: 'قيد المراجعة', resolved: 'محلول' };
const STATUS_TONE = { open: 'warning', reviewing: 'brand', resolved: 'success' };

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
      <div>
        <PageHeader title="النزاعات والمرتجعات" />
        <SkeletonRows rows={4} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="النزاعات والمرتجعات" />

      {tickets.length === 0 ? (
        <EmptyState title="لا توجد نزاعات مفتوحة" message="أي نزاع أو طلب مرتجع سيظهر هنا مع كل الأدلة والردود." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-default">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-default bg-surface-subtle">
                <th className="px-4 py-3 text-start font-bold text-text-secondary">الموضوع</th>
                <th className="px-4 py-3 text-start font-bold text-text-secondary">سبب النزاع</th>
                <th className="px-4 py-3 text-start font-bold text-text-secondary">الحالة</th>
                <th className="px-4 py-3 text-start font-bold text-text-secondary">تاريخ الإنشاء</th>
                <th className="px-4 py-3 text-start font-bold text-text-secondary">آخر تحديث</th>
                <th className="px-4 py-3 text-start font-bold text-text-secondary">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-border-default transition-colors last:border-0 hover:bg-surface-subtle">
                  <td className="px-4 py-3 font-bold text-text-primary">{t.subject}</td>
                  <td className="px-4 py-3 text-text-secondary">{t.reason}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status] ?? t.status}</Badge></td>
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(t.createdAt)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(t.updatedAt ?? t.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setOpenTicket(t)} className="text-xs font-bold text-brand-blue">فتح</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(openTicket)} onClose={() => setOpenTicket(null)} title={openTicket?.subject}>
        {openTicket && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1 text-xs font-bold text-text-muted">سبب النزاع</div>
              <p className="text-sm text-text-primary">{openTicket.reason}</p>
            </div>
            {openTicket.evidenceFiles?.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-bold text-text-muted">الأدلة والملفات</div>
                <div className="flex flex-wrap gap-2">
                  {openTicket.evidenceFiles.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-bold text-text-secondary">
                      <Paperclip size={12} strokeWidth={2} /> {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="mb-1 text-xs font-bold text-text-muted">الردود</div>
              <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                {openTicket.messages.map((m, i) => (
                  <li key={i} className="rounded-md border border-border-default p-2 text-sm">
                    <div className="mb-0.5 text-xs font-bold text-text-secondary">{m.from} — {formatDateTime(m.at)}</div>
                    <div className="text-text-primary">{m.text}</div>
                  </li>
                ))}
              </ul>
            </div>
            {canReply && openTicket.status !== 'resolved' && (
              <form onSubmit={handleReply} className="flex flex-col gap-2 border-t border-border-default pt-3">
                <textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="أضف ردًا أو دليلًا إضافيًا..." className="rounded-md border border-border-default px-3 py-2 text-sm text-text-primary" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleResolve} className="rounded-md border border-success/30 px-4 py-2 text-sm font-bold text-success">وضع علامة «محلول»</button>
                  <button type="submit" className="rounded-md bg-brand-navy px-4 py-2 text-sm font-bold text-white">إرسال الرد</button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
