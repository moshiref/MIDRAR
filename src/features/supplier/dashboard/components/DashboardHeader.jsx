import { RefreshCw } from 'lucide-react';
import { timeAgo } from '../../ui/notificationMeta';

/** Page header — never competes with the sections below it (title stays modest, per the design brief: "لا تجعل H1 ضخمًا"). */
export default function DashboardHeader({ firstName, companyName, lastUpdated, onRefresh }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">لوحة المورد</p>
        <h1 className="mt-1 text-lg font-extrabold text-text-primary md:text-xl">أهلًا، {firstName} 👋</h1>
        <p className="mt-0.5 text-sm font-bold text-text-secondary">{companyName}</p>
        <p className="mt-1.5 max-w-md text-sm text-text-secondary">متابعة العمليات والطلبات والمخزون والأداء من مكان واحد.</p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="flex shrink-0 items-center gap-1.5 rounded-md border border-border-default px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary"
      >
        <RefreshCw size={13} strokeWidth={2} />
        {lastUpdated ? `آخر تحديث: ${timeAgo(lastUpdated.toISOString())}` : 'تحديث'}
      </button>
    </div>
  );
}
