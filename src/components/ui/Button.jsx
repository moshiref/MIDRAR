/**
 * Reusable Button — wraps the MIDRAR `.btn` design-system classes
 * (`.btn-primary`, `.btn-secondary`, `.btn-ghost-inverse`, `.btn-lg`)
 * defined verbatim in src/styles/global.css. Renders an <a> when `href`
 * is provided (matching the original landing page, which used anchor
 * tags for every CTA), otherwise a <button>.
 */
const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  'ghost-inverse': 'btn-ghost-inverse',
};

export default function Button({
  as,
  href,
  variant = 'primary',
  size,
  className = '',
  style,
  children,
  ...rest
}) {
  const classes = [
    'btn',
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    size === 'lg' ? 'btn-lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Tag = as || (href ? 'a' : 'button');

  return (
    <Tag className={classes} href={href} style={style} {...rest}>
      {children}
    </Tag>
  );
}
