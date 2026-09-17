import { useEffect, useState } from 'react';
import StatCard from '../../../components/ui/StatCard';
import CurrencyAmount from '../../../components/ui/CurrencyAmount';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getProducts, getOrders, getPayouts, getNotifications, getTickets } from '../data/mockSupplierDb';

const LOW_STOCK_THRESHOLD = 5;

function availableStock(variant) {
  return variant.stock.actual - variant.stock.reserved;
}

/**
 * Spec §3: every card here must lead to a real filtered list, not just
 * show a number — see StatCard. The list pages themselves (orders,
 * inventory, products, payouts, performance, disputes, notifications)
 * are later phases of the delivery plan; until each is built its route
 * renders SupplierPagePlaceholder, so these links resolve today, they
 * just don't apply the query-string filter yet.
 */
export default function SupplierDashboardHome() {
  const { supplier } = useSupplierSession();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProducts(supplier.id),
      getOrders(supplier.id),
      getPayouts(supplier.id),
      getNotifications(supplier.id),
      getTickets(), // not yet scoped by supplierId in the mock schema — harmless while only one supplier is seeded
    ]).then(([products, orders, payouts, notifications, tickets]) => {
      if (cancelled) return;

      const newOrders = orders.filter((o) => o.status === 'new').length;
      const preparingOrders = orders.filter((o) => o.status === 'preparing').length;

      let lowStockCount = 0;
      let pendingProductsCount = 0;
      products.forEach((product) => {
        if (product.status === 'pending') pendingProductsCount += 1;
        product.variants.forEach((variant) => {
          if (availableStock(variant) <= LOW_STOCK_THRESHOLD) lowStockCount += 1;
        });
      });

      const dueByCurrency = { USD: 0, SYP: 0 };
      payouts.forEach((p) => {
        if (p.status === 'eligible' || p.status === 'collecting') dueByCurrency[p.currency] += p.netAmount;
      });

      const openTickets = tickets.filter((t) => t.status !== 'resolved').length;
      const unreadNotifications = notifications.filter((n) => !n.read).length;

      const ratingValues = Object.values(supplier.ratingSummary ?? {});
      const ratingAvg = ratingValues.length ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length : null;

      setStats({ newOrders, preparingOrders, lowStockCount, pendingProductsCount, dueByCurrency, openTickets, unreadNotifications, ratingAvg });
    });
    return () => { cancelled = true; };
  }, [supplier.id, supplier.ratingSummary]);

  if (!stats) return null;

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-text-primary">أهلًا، {supplier.companyName}</h1>
      <p className="mb-6 text-sm text-text-secondary">نظرة سريعة على ما يحتاج إجراء منك الآن.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          to="/supplier/orders?status=new"
          label="طلبات جديدة تحتاج إجراء"
          value={stats.newOrders}
          tone={stats.newOrders > 0 ? 'warning' : 'neutral'}
        />
        <StatCard
          to="/supplier/orders?status=preparing"
          label="طلبات قيد التجهيز"
          value={stats.preparingOrders}
          hint="تابع المواعيد لتفادي التأخير"
        />
        <StatCard
          to="/supplier/inventory?filter=low-stock"
          label="نسخ منتجات بمخزون منخفض"
          value={stats.lowStockCount}
          tone={stats.lowStockCount > 0 ? 'danger' : 'neutral'}
        />
        <StatCard
          to="/supplier/products?status=pending"
          label="منتجات بانتظار موافقة الإدارة"
          value={stats.pendingProductsCount}
        />
        <StatCard
          to="/supplier/payouts?currency=USD"
          label="الرصيد المستحق (دولار)"
          value={<CurrencyAmount amount={stats.dueByCurrency.USD} currency="USD" />}
        />
        <StatCard
          to="/supplier/payouts?currency=SYP"
          label="الرصيد المستحق (ليرة سورية)"
          value={<CurrencyAmount amount={stats.dueByCurrency.SYP} currency="SYP" />}
        />
        <StatCard
          to="/supplier/performance"
          label="مؤشر الأداء العام"
          value={stats.ratingAvg !== null ? `${Math.round(stats.ratingAvg * 100)}%` : '—'}
          hint="دقة التجهيز، جودة المنتج، الالتزام بالمواعيد"
        />
        <StatCard to="/supplier/disputes" label="تذاكر ونزاعات مفتوحة" value={stats.openTickets} />
        <StatCard to="/supplier/notifications" label="تنبيهات غير مقروءة" value={stats.unreadNotifications} />
      </div>
    </div>
  );
}
