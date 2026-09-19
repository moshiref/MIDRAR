import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
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
      <section className="page">
        <div className="page-head"><div><h1>المحادثات</h1></div></div>
        <div className="skeleton" style={{ height: 220 }} />
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>المحادثات</h1>
          <div className="sub">محادثة تشغيلية مرتبطة بكل طلب — بدون أرقام هواتف أو أسماء شخصية.</div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="title">لا توجد طلبات بعد</div>
            <div className="msg">ستظهر الطلبات هنا لفتح محادثة تشغيلية خاصة بكل واحد.</div>
          </div>
        </div>
      ) : (
        <div className="split-panel">
          <div className="panel">
            <div className="split-list">
              {orders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`split-list-item${o.id === selectedOrderId ? ' active' : ''}`}
                  onClick={() => handleSelectOrder(o.id)}
                >
                  <span className="en">{o.opRef}</span>
                  {unreadCounts[o.id] > 0 && <span className="count en">{unreadCounts[o.id]}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="panel chat-pane">
            <div className="chat-head">{selectedOrder?.opRef}</div>
            <div className="chat-body">
              {messages.length === 0 ? (
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>لا رسائل بعد — ابدأ المحادثة إذا احتجت توضيح شيء بخصوص هذا الطلب.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`chat-bubble ${m.role === 'supplier' ? 'mine' : 'theirs'}`}>
                    <div className="from">{m.from}</div>
                    <div>{m.text}</div>
                    <div className="time">{formatTime(m.at)}</div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSend} className="chat-foot">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب رسالة..." />
              <button type="submit" className="btn btn-primary btn-sm">
                إرسال <Send size={14} strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
