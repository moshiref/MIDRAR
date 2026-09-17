import { Link } from 'react-router-dom';

/**
 * Reusable Button — wraps the MIDRAR `.btn` design-system classes
 * (`.btn-primary`, `.btn-secondary`, `.btn-ghost-inverse`, `.btn-lg`)
 * defined verbatim in src/styles/global.css. Renders a react-router
 * `<Link>` when `href` is an internal path (starts with "/") so those
 * CTAs get real SPA navigation, a plain `<a>` for in-page anchors
 * (`#section`) or external URLs (matching the original landing page's
 * anchor-tag CTAs), or a `<button>` when no `href` is given.
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

  if (!as && href && href.startsWith('/')) {
    return (
      <Link to={href} className={classes} style={style} {...rest}>
        {children}
      </Link>
    );
  }

  const Tag = as || (href ? 'a' : 'button');

  return (
    <Tag className={classes} href={href} style={style} {...rest}>
      {children}
    </Tag>
  );
}
