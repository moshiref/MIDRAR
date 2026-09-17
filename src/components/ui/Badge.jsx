const VARIANT_CLASSES = {
  neutral: 'bg-surface-subtle text-text-secondary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  brand: 'bg-brand-teal/10 text-brand-teal-deep',
};

/** Status pill — product approval states, order states, payout states, ticket states all render one of these. */
export default function Badge({ variant = 'neutral', className = '', children }) {
  const toneClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${toneClass} ${className}`.trim()}>
      {children}
    </span>
  );
}
