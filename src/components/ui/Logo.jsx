import logoMark from '../../assets/logo-mark.png';

/**
 * The MIDRAR ribbon mark, extracted once from the original page's inline
 * base64 image (it was repeated 5× across header / hero watermark /
 * ecosystem watermark / ecosystem flow-node / final CTA watermark).
 * `variant="mark"` renders just the icon (for watermarks / flow nodes),
 * `variant="full"` renders the icon + the "MIDRAR" wordmark, matching the
 * original header `.logo-mark`.
 */
export default function Logo({ variant = 'full', className = '', imgClassName = '', style, ...rest }) {
  if (variant === 'mark') {
    return <img src={logoMark} alt="مدرار" className={imgClassName} style={style} {...rest} />;
  }

  return (
    <div className={`logo-mark ${className}`.trim()} {...rest}>
      <img src={logoMark} alt="مدرار" />
      <span className="logo-word en">MIDRAR</span>
    </div>
  );
}
