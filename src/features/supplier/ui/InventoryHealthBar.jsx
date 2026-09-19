const TONE_CLASS = {
  success: { bar: 'bg-success', dot: 'bg-success' },
  brand: { bar: 'bg-brand-blue', dot: 'bg-brand-blue' },
  warning: { bar: 'bg-warning', dot: 'bg-warning' },
  danger: { bar: 'bg-danger', dot: 'bg-danger' },
};

/** One stacked bar (percentages of total) + a legend — reads as inventory composition, not four disconnected numbers. `segments` is `[{ label, value, tone }]`, values should sum to ~100. */
export default function InventoryHealthBar({ segments = [] }) {
  if (!segments.length) return null;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-subtle">
        {segments.map((s) => (
          <div key={s.label} className={TONE_CLASS[s.tone]?.bar ?? 'bg-text-muted'} style={{ width: `${s.value}%` }} title={`${s.label}: ${s.value}%`} />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 shrink-0 rounded-full ${TONE_CLASS[s.tone]?.dot ?? 'bg-text-muted'}`} />
            <span className="flex-1 text-text-secondary">{s.label}</span>
            <span className="font-extrabold text-text-primary">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
