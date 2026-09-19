import { Link } from 'react-router-dom';
import Card from '../../../../components/ui/Card';

function SubMetric({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-text-secondary">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-surface-subtle">
        <div className="h-full rounded-full bg-brand-teal" style={{ width: `${value}%`, opacity: 0.8 }} />
      </div>
      <span className="w-9 shrink-0 text-end text-xs font-extrabold text-text-primary">{value}%</span>
    </div>
  );
}

/** Headline % + three thin inline bars — a real summary, not a giant gauge or a duplicate of the dedicated /performance page. */
export default function PerformanceOverview({ overall, prepTimeAdherence, fulfillmentAccuracy, stockAccuracy }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[0.78rem] font-extrabold uppercase tracking-wide text-text-muted">الأداء</h2>
        <Link to="/supplier/performance" className="text-xs font-bold text-brand-blue">التفاصيل</Link>
      </div>
      <Card>
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-text-primary">{overall !== null ? `${overall}%` : '—'}</span>
          <span className="text-xs font-bold text-text-muted">هذا الشهر</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <SubMetric label="دقة التجهيز" value={Math.round((fulfillmentAccuracy ?? 0) * 100)} />
          <SubMetric label="جودة المنتج" value={Math.round((stockAccuracy ?? 0) * 100)} />
          <SubMetric label="الالتزام بالمواعيد" value={Math.round((prepTimeAdherence ?? 0) * 100)} />
        </div>
      </Card>
    </div>
  );
}
