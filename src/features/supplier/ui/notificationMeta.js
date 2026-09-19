import { ShoppingCart, Layers, Package, Wallet, Flag, Bell } from 'lucide-react';

/** Shared between the topbar notification dropdown and the dashboard's notification panel — one source of truth for icon/tone/destination per notification type. */
export const NOTIFICATION_META = {
  order: { Icon: ShoppingCart, tone: 'text-brand-blue bg-brand-blue/10', dest: '/supplier/orders' },
  stock: { Icon: Layers, tone: 'text-warning bg-warning/10', dest: '/supplier/inventory' },
  product: { Icon: Package, tone: 'text-brand-teal-deep bg-brand-teal/10', dest: '/supplier/products' },
  payout: { Icon: Wallet, tone: 'text-success bg-success/10', dest: '/supplier/payouts' },
  dispute: { Icon: Flag, tone: 'text-danger bg-danger/10', dest: '/supplier/disputes' },
};

export function notificationMeta(type) {
  return NOTIFICATION_META[type] ?? { Icon: Bell, tone: 'text-text-secondary bg-surface-subtle', dest: '/supplier' };
}

export function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return 'الآن';
  if (min < 60) return `منذ ${min} دقيقة`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `منذ ${hr} ساعة`;
  return `منذ ${Math.round(hr / 24)} يوم`;
}
