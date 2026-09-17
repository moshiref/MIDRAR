/** Placeholder for a list/table with nothing to show yet, with an optional action (e.g. "add a product"). */
export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-subtle p-10 text-center">
      <div className="text-base font-bold text-text-primary">{title}</div>
      {message && <p className="max-w-sm text-sm text-text-secondary">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
