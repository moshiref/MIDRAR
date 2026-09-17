/**
 * Base surface for dashboard content — the supplier portal's equivalent
 * of the marketing site's `.form-card` (src/features/open-store/OpenStorePage.css),
 * but built with Tailwind utilities against the shared `@theme` tokens
 * (src/index.css) instead of a new scoped CSS file, per the Phase 0
 * supplier-portal plan.
 */
export default function Card({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-lg border border-border-default bg-surface p-5 shadow-sm ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
