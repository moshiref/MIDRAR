/**
 * Minimal data table. `columns` is `[{ key, header, render? }]` — `render(row)`
 * overrides the default `row[key]` cell content (used for badges, links,
 * currency amounts, etc.). Every dashboard list view (products, orders,
 * payouts, tickets, ...) is expected to share this rather than hand-roll
 * its own `<table>`.
 */
export default function Table({ columns, rows, rowKey = (row) => row.id, emptyMessage = 'لا توجد بيانات' }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-border-default bg-surface-subtle p-8 text-center text-text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-default">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-default bg-surface-subtle">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-start font-bold text-text-secondary">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border-default last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-start text-text-primary">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
