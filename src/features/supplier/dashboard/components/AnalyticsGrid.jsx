import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { LineChart } from '../../ui/SupplierChart';
import InventoryHealthBar from '../../ui/InventoryHealthBar';
import RankingList from '../../ui/RankingList';

const RANGE_TABS = [{ value: '7d', label: '7 أيام' }, { value: '30d', label: '30 يوم' }, { value: '90d', label: '90 يوم' }];

/** % change between the first and second half of a series — a self-contained trend signal that doesn't require a separate "previous period" mock dataset. */
function computeTrend(series) {
  if (series.length < 2) return null;
  const mid = Math.ceil(series.length / 2);
  const firstHalf = series.slice(0, mid);
  const secondHalf = series.slice(mid);
  const avg = (list) => list.reduce((s, p) => s + p.value, 0) / list.length;
  const a = avg(firstHalf);
  const b = avg(secondHalf.length ? secondHalf : firstHalf);
  if (a === 0) return null;
  return Math.round(((b - a) / a) * 1000) / 10;
}

function RangeTabs({ value, onChange }) {
  return (
    <div className="flex shrink-0 rounded-md bg-surface-subtle p-0.5 text-xs font-bold">
      {RANGE_TABS.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`rounded px-2.5 py-1 transition-colors ${value === t.value ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function TrendBadge({ value }) {
  if (value === null) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-success' : 'text-danger'}`}>
      <Icon size={13} strokeWidth={2.2} /> {up ? '+' : ''}{value}%
    </span>
  );
}

function AnalyticsCard({ title, description, current, trend, range, onRangeChange, children }) {
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-text-primary">{title}</h3>
            <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[0.6rem] font-bold text-text-muted">بيانات تجريبية</span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">{description}</p>
          {current && (
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-text-primary">{current}</span>
              <TrendBadge value={trend} />
              {trend !== null && <span className="text-xs text-text-muted">مقارنة بالفترة السابقة</span>}
            </div>
          )}
        </div>
        {range && <RangeTabs value={range} onChange={onRangeChange} />}
      </div>
      {children}
    </Card>
  );
}

/**
 * The four analytics blocks — orders/revenue trends (with period tabs and
 * a computed trend badge), inventory composition (a stacked health bar,
 * not four disconnected numbers), and top products (a numbered ranking,
 * not a bare bar chart).
 */
export default function AnalyticsGrid({ ordersSeries = [], revenueSeries = [], ordersRange, onOrdersRangeChange, revenueRange, onRevenueRangeChange, inventoryHealth = [], topProducts = [] }) {
  const ordersTotal = ordersSeries.reduce((s, p) => s + p.value, 0);
  const revenueTotal = revenueSeries.reduce((s, p) => s + p.value, 0);

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-[0.78rem] font-extrabold uppercase tracking-wide text-text-muted">التحليلات</h2>
        <p className="mt-0.5 text-sm text-text-secondary">طلبات وإيرادات المورد</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsCard
          title="الطلبات"
          description="عدد الطلبات المستلمة خلال الفترة"
          current={ordersTotal}
          trend={computeTrend(ordersSeries)}
          range={ordersRange}
          onRangeChange={onOrdersRangeChange}
        >
          <LineChart series={ordersSeries} color="var(--color-brand-teal)" label="الطلبات" />
        </AnalyticsCard>

        <AnalyticsCard
          title="الإيرادات"
          description="الإيرادات المقدّرة بالدولار الأمريكي"
          current={`$${revenueTotal}`}
          trend={computeTrend(revenueSeries)}
          range={revenueRange}
          onRangeChange={onRevenueRangeChange}
        >
          <LineChart series={revenueSeries} color="var(--color-brand-blue)" formatValue={(v) => `$${v}`} label="الإيرادات" />
        </AnalyticsCard>

        <AnalyticsCard title="حالة المخزون" description="توزيع الأصناف حسب الحالة">
          <InventoryHealthBar segments={inventoryHealth} />
        </AnalyticsCard>

        <AnalyticsCard title="أفضل المنتجات مبيعًا" description="الأصناف الأكثر طلبًا هذه الفترة">
          <RankingList series={topProducts} />
        </AnalyticsCard>
      </div>
    </div>
  );
}
