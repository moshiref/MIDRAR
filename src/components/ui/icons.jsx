/**
 * Small inline SVG icons repeated verbatim throughout the original markup
 * (trust strip, compare lists, feature lists, FAQ, ...). Extracted here
 * only to avoid retyping identical markup dozens of times — attributes
 * and paths are copied exactly from the source file.
 */
export function CheckIcon({ size = 16, stroke = 'currentColor', strokeWidth = 2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function XIcon({ size = 16, stroke = 'currentColor', strokeWidth = 2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
