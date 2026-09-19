import { Link } from 'react-router-dom';
import { PackagePlus, Layers, ShoppingCart, Video } from 'lucide-react';

const VARIANT_CLASS = {
  primary: 'bg-brand-navy text-white hover:bg-brand-navy-deep',
  secondary: 'border border-border-default bg-surface text-text-primary hover:border-brand-teal hover:text-brand-teal-deep',
  ghost: 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
};

function ActionButton({ to, Icon, children, variant = 'secondary' }) {
  return (
    <Link to={to} className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors ${VARIANT_CLASS[variant]}`}>
      <Icon size={15} strokeWidth={1.8} /> {children}
    </Link>
  );
}

/** Real buttons with a clear hierarchy (one primary action, the rest secondary/ghost) — not a grid of decorative cards. */
export default function QuickActions() {
  return (
    <div>
      <h2 className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-wide text-text-muted">إجراءات سريعة</h2>
      <div className="flex flex-wrap gap-2">
        <ActionButton to="/supplier/products/new" Icon={PackagePlus} variant="primary">إضافة منتج</ActionButton>
        <ActionButton to="/supplier/inventory" Icon={Layers} variant="secondary">إدارة المخزون</ActionButton>
        <ActionButton to="/supplier/orders" Icon={ShoppingCart} variant="secondary">عرض الطلبات</ActionButton>
        <ActionButton to="/supplier/fulfillment-proof" Icon={Video} variant="ghost">رفع إثبات تجهيز</ActionButton>
      </div>
    </div>
  );
}
