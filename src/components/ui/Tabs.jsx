/** Controlled tab strip. `tabs` is `[{ value, label }]`. */
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-border-default">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
            active === tab.value
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
