/** Numbered ranking with a mini inline progress bar — reads as a product feature, not a generic bar chart. `series` is `[{ label, value }]`, best first. */
export default function RankingList({ series = [], unit = 'طلب' }) {
  if (!series.length) return null;
  const max = Math.max(...series.map((s) => s.value), 1);

  return (
    <ol className="flex flex-col gap-4">
      {series.map((s, i) => (
        <li key={s.label} className="flex items-center gap-3">
          <span className="w-5 shrink-0 font-mono text-xs font-extrabold text-text-muted">{String(i + 1).padStart(2, '0')}</span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-bold text-text-primary">{s.label}</span>
              <span className="shrink-0 text-xs font-bold text-text-muted">{s.value} {unit}</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-subtle">
              <div className="h-full rounded-full bg-brand-teal" style={{ width: `${Math.max((s.value / max) * 100, 6)}%`, opacity: 0.8 }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
