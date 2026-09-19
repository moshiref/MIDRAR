/** Loading placeholder blocks. `rows` for a table-shaped skeleton, or a single bar via className. */
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-surface-subtle ${className}`.trim()} />;
}

export function SkeletonRows({ rows = 4, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`.trim()}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
