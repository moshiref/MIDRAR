import { useEffect, useState } from 'react';
import Card from '../../../../components/ui/Card';
import { timeAgo } from '../../ui/notificationMeta';
import { useSupplierSession } from '../../session/SupplierSessionContext';
import { getAuditLog, getOrders, getProducts } from '../../data/mockSupplierDb';

const STATUS_LABEL_AR = { new: 'جديدة', preparing: 'قيد التجهيز', ready: 'جاهزة للاستلام', completed: 'مكتملة', cancelled: 'ملغية' };

/** Turns a raw audit-log entry (action code + target id + details) into one readable Arabic sentence, resolving order/product ids to their display names where possible. */
function describeEntry(entry, orderById, productById) {
  const { action, target, details = {}, actorName } = entry;
  switch (action) {
    case 'order.statusChange': {
      const order = orderById.get(target);
      const status = STATUS_LABEL_AR[details.status] ?? details.status;
      return order ? `${actorName} حدّث حالة الطلب ${order.opRef} إلى «${status}»` : `${actorName} حدّث حالة طلب إلى «${status}»`;
    }
    case 'inventory.adjust': {
      const [productId] = String(target).split('/');
      const product = productById.get(productId);
      const sign = details.delta > 0 ? '+' : '';
      return `${actorName} عدّل مخزون ${product?.name ?? 'منتج'} (${sign}${details.delta})`;
    }
    case 'product.add':
      return `${actorName} أضاف منتجًا جديدًا: ${details.name ?? productById.get(target)?.name ?? ''}`;
    case 'product.update':
      return `${actorName} حدّث بيانات منتج`;
    case 'product.delete':
      return `${actorName} حذف منتجًا`;
    case 'product.duplicate':
      return `${actorName} أنشأ نسخة من منتج`;
    case 'employee.add':
      return `${actorName} أضاف موظفًا: ${details.name ?? ''}`;
    case 'ticket.create':
      return `${actorName} فتح نزاعًا: ${details.subject ?? ''}`;
    case 'ticket.reply':
      return `${actorName} أضاف ردًا على نزاع`;
    case 'fulfillment.proofUpload':
      return `${actorName} رفع إثبات تجهيز`;
    default:
      return `${actorName} نفّذ إجراءً`;
  }
}

/** Real activity history (mockSupplierDb's audit log — every mutating action across the portal writes here), not a decorative placeholder list. */
export default function ActivityFeed() {
  const { supplier } = useSupplierSession();
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    Promise.all([getAuditLog(), getOrders(supplier.id), getProducts(supplier.id)]).then(([log, orders, products]) => {
      const orderById = new Map(orders.map((o) => [o.id, o]));
      const productById = new Map(products.map((p) => [p.id, p]));
      setEntries(log.slice(0, 5).map((e) => ({ id: e.id, text: describeEntry(e, orderById, productById), at: e.at })));
    });
  }, [supplier.id]);

  return (
    <div>
      <h2 className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-wide text-text-muted">آخر النشاطات</h2>
      <Card>
        {entries === null ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-4 w-full animate-pulse rounded bg-surface-subtle" />)}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-text-secondary">لا يوجد نشاط مسجّل بعد.</p>
        ) : (
          <ul className="flex flex-col">
            {entries.map((e, i) => (
              <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
                <span className="relative flex w-2.5 shrink-0 flex-col items-center">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-teal" />
                  {i < entries.length - 1 && <span className="mt-1 w-px flex-1 bg-border-default" />}
                </span>
                <span className="min-w-0 flex-1 pb-0.5">
                  <span className="block text-sm text-text-primary">{e.text}</span>
                  <span className="mt-0.5 block text-xs text-text-muted">{timeAgo(e.at)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
