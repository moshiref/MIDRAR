/**
 * Thin wrapper around the original `.tile3d` glossy icon-tile system
 * (`.teal/.blue/.navy/.mint/.glass` gradient variants × `.tile-38/56/64`
 * sizes) defined verbatim in global.css. `ring` renders the larger
 * `.icon-ring` variant used in the ecosystem flow nodes.
 */
export default function Tile3D({ color, size = 38, ring = false, style, children }) {
  const classes = [
    ring ? 'icon-ring' : 'icon',
    'tile3d',
    color || '',
    `tile-${size}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
