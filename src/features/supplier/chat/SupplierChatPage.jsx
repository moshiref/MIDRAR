import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../ui/PageHeader';
import { SkeletonRows } from '../ui/Skeleton';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getOrders, getOrderMessages, addOrderMessage, markOrderMessagesRead, getUnreadOrderMessageCounts } from '../data/mockSupplierDb';

/**
 * Spec: no phone numbers or personal names in this thread, for either
 * side — every message is attributed to a functional role
 * ("فريق العمليات", "مسؤول الطلب", "فريق التوصيل", ...), never a person's
 * name, so the supplier's own outgoing messages are always sent as the
 * generic "فريق المورد" regardless of which employee is signed in.
 */
const SUPPLIER_SENDER = { from: 'فريق المورد', role: 'supplier' };

function formatTime(iso) {
  return new Date(iso).toLocaleString('ar-SY', { dateStyle: 'short', timeStyle: 'short' });
}

export default function SupplierChatPage() {
  const { supplier } = useSupplierSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(searchParams.get('order'));
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [text, setText] = useState('');

  const reloadUnread = () => getUnreadOrderMessageCounts(supplier.id).then(setUnreadCounts);

  useEffect(() => {
    getOrders(supplier.id).then((list) => {
      setOrders(list);
      if (!selectedOrderId && list.length) setSelectedOrderId(list[0].id);
    });
    reloadUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  useEffect(() => {
    if (!selectedOrderId) return;
    getOrderMessages(selectedOrderId).then(setMessages).then(() => markOrderMessagesRead(selectedOrderId)).then(reloadUnread);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderId]);

  const selectedOrder = useMemo(() => orders?.find((o) => o.id === selectedOrderId) ?? null, [orders, selectedOrderId]);

  const handleSelectOrder = (id) => {
    setSelectedOrderId(id);
    setSearchParams({ order: id });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedOrderId) return;
    const message = await addOrderMessage({ orderId: selectedOrderId, ...SUPPLIER_SENDER, text: text.trim() });
    setMessages((prev) => [...prev, message]);
    setText('');
  };

  if (orders === null) {
    return (
      <div>
        <PageHeader title="المحادثات" />
        <SkeletonRows rows={4} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="المحادثات" subtitle="محادثة تشغيلية مرتبطة بكل طلب — بدون أرقام هواتف أو أسماء شخصية." />

      {orders.length === 0 ? (
        <EmptyState title="لا توجد طلبات بعد" message="ستظهر الطلبات هنا لفتح محادثة تشغيلية خاصة بكل واحد." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <Card className="h-fit p-2">
            <ul className="flex flex-col gap-1">
              {orders.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectOrder(o.id)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-start text-sm font-bold ${
                      o.id === selectedOrderId ? 'bg-brand-navy text-white' : 'text-text-secondary hover:bg-surface-subtle'
                    }`}
                  >
                    <span>{o.opRef}</span>
                    {unreadCounts[o.id] > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.62rem] font-extrabold text-white">
                        {unreadCounts[o.id]}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex min-h-[420px] flex-col">
            <div className="mb-3 border-b border-border-default pb-2 text-sm font-extrabold text-text-primary">
              {selectedOrder?.opRef}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-text-secondary">لا رسائل بعد — ابدأ المحادثة إذا احتجت توضيح شيء بخصوص هذا الطلب.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === 'supplier' ? 'me-0 ms-auto bg-brand-navy text-white' : 'bg-surface-subtle text-text-primary'}`}>
                    <div className="mb-0.5 text-xs font-bold opacity-80">{m.from}</div>
                    <div>{m.text}</div>
                    <div className="mt-1 text-[0.65rem] opacity-70">{formatTime(m.at)}</div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSend} className="mt-3 flex gap-2 border-t border-border-default pt-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب رسالة..."
                className="flex-1 rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary"
              />
              <button type="submit" className="flex items-center gap-1.5 rounded-md bg-brand-navy px-4 py-2 text-sm font-bold text-white hover:bg-brand-navy-deep">
                إرسال <Send size={14} strokeWidth={2} />
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
