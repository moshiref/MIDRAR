import { Link } from 'react-router-dom';
import { ShoppingCart, Clock, Layers, ChevronLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';

const TONE = {
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  quiet: 'bg-surface-subtle text-text-muted',
};

function ActionRow({ to, Icon, tone, title, value, hint, cta, isLast }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-subtle ${!isLast ? 'border-b border-border-default' : ''}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TONE[tone]}`}>
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-text-primary">{value}</span>
          <span className="text-sm font-bold text-text-primary">{title}</span>
        </span>
        <span className="mt-0.5 block text-xs text-text-muted">{hint}</span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 text-xs font-bold text-brand-blue sm:flex">
        {cta} <ChevronLeft size={12} strokeWidth={2.5} />
      </span>
    </Link>
  );
}

/** The single highest-priority block on the dashboard — one panel, three action rows, not three competing cards. */
export default function ActionCenter({ newOrders, lateOrders, lowStockCount }) {
  const itemsNeedingAttention = [newOrders > 0, lateOrders > 0, lowStockCount > 0].filter(Boolean).length;

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-[0.78rem] font-extrabold uppercase tracking-wide text-text-muted">يحتاج إجراء منك</h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          {itemsNeedingAttention > 0 ? `هناك ${itemsNeedingAttention} ${itemsNeedingAttention === 1 ? 'عنصر يحتاج' : 'عناصر تحتاج'} إلى انتباهك.` : 'لا يوجد ما يحتاج إجراء فوري حاليًا.'}
        </p>
      </div>
      <Card className="overflow-hidden p-0">
        <ActionRow
          to="/supplier/orders?status=new"
          Icon={ShoppingCart}
          tone={newOrders > 0 ? 'warning' : 'quiet'}
          value={newOrders}
          title="طلبات جديدة"
          hint="طلب بانتظار التأكيد"
          cta="عرض الطلبات"
        />
        <ActionRow
          to="/supplier/orders?filter=late"
          Icon={Clock}
          tone={lateOrders > 0 ? 'danger' : 'quiet'}
          value={lateOrders}
          title="طلبات متأخرة"
          hint="تحتاج إلى متابعة"
          cta="متابعة"
        />
        <ActionRow
          to="/supplier/inventory?filter=low-stock"
          Icon={Layers}
          tone={lowStockCount > 0 ? 'danger' : 'quiet'}
          value={lowStockCount}
          title="مخزون منخفض"
          hint="منتج يحتاج إلى إعادة تزويد"
          cta="عرض المخزون"
          isLast
        />
      </Card>
    </div>
  );
}
