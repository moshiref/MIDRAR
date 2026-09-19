import { Link } from 'react-router-dom';
import Card from '../../../../components/ui/Card';

/** One metric, no icon, no box — the divider between items does the separating. Deliberately the lightest-weight block on the page. */
function Metric({ to, label, value }) {
  return (
    <Link to={to} className="flex flex-1 flex-col gap-1 px-5 py-4 transition-colors hover:bg-surface-subtle">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-base font-extrabold text-text-primary">{value}</span>
    </Link>
  );
}

/**
 * Compact metric strip — intentionally the lightest-weight block on the
 * page so it never competes with ActionCenter above it. Divided
 * horizontally on desktop (a real "strip"); stacks with horizontal
 * dividers on narrow screens instead of wrapping mid-row, which would
 * otherwise put dividers in the wrong places.
 */
export default function AccountSummary({ items }) {
  return (
    <div>
      <h2 className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-wide text-text-muted">ملخص الحساب</h2>
      <Card className="flex flex-col divide-y divide-border-default overflow-hidden p-0 md:flex-row md:divide-x md:divide-y-0 rtl:md:divide-x-reverse">
        {items.map((item) => (
          <Metric key={item.label} {...item} />
        ))}
      </Card>
    </div>
  );
}
