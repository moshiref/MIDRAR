/**
 * Small hand-rolled charts — no charting library exists in this project
 * yet (checked package.json) and the landing page already draws its own
 * inline-SVG chart (HeroSection.jsx's mini-chart), so this follows the
 * same house style instead of adding a dependency. Bar charts are plain
 * HTML/CSS (flex + percentage heights/widths) rather than SVG `<text>` —
 * simpler, crisper, and naturally RTL-correct for Arabic labels, which
 * SVG's own text layout doesn't always shape as reliably.
 */

const WIDTH = 400;
const HEIGHT = 160;
const PAD_X = 8;
const PAD_Y = 16;

// Tailwind's scanner needs full class-name literals in source to generate
// them — a template-built `bg-${color}` string would silently produce no
// CSS. This map keeps every class name static and discoverable.
const BAR_COLOR_CLASS = {
  'brand-blue': 'bg-brand-blue',
  'brand-teal': 'bg-brand-teal',
};

function scalePoints(values) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = (WIDTH - PAD_X * 2) / Math.max(values.length - 1, 1);
  return values.map((v, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_Y + (HEIGHT - PAD_Y * 2) * (1 - (v - min) / range),
  }));
}

/** `series` is `[{ label, value }]`. `label` names the series for assistive tech (e.g. "الطلبات خلال الفترة"). */
export function LineChart({ series = [], color = 'var(--color-brand-teal)', formatValue = (v) => v, label = 'مخطط' }) {
  if (!series.length) return null;
  const points = scalePoints(series.map((s) => s.value));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)} ${HEIGHT - PAD_Y} L${points[0].x.toFixed(1)} ${HEIGHT - PAD_Y} Z`;
  const gridLines = [0.25, 0.5, 0.75].map((f) => PAD_Y + (HEIGHT - PAD_Y * 2) * f);

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={label}>
        {gridLines.map((y) => (
          <line key={y} x1={PAD_X} x2={WIDTH - PAD_X} y1={y} y2={y} stroke="var(--color-border-default)" strokeWidth="1" />
        ))}
        <path d={areaPath} fill={color} opacity="0.1" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--color-surface)" stroke={color} strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between border-t border-border-default pt-2 text-[0.68rem] font-bold text-text-muted">
        <span>{series[0].label}</span>
        <span className="text-text-primary">{formatValue(series[series.length - 1].value)}</span>
        <span>{series[series.length - 1].label}</span>
      </div>
    </div>
  );
}

/** `series` is `[{ label, value }]`. Vertical bars, HTML/CSS-based. */
export function BarChart({ series = [], color = 'brand-blue' }) {
  if (!series.length) return null;
  const max = Math.max(...series.map((s) => s.value), 1);
  const colorClass = BAR_COLOR_CLASS[color] ?? BAR_COLOR_CLASS['brand-blue'];

  return (
    <div className="flex h-36 items-end gap-3">
      {series.map((s) => (
        <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-extrabold text-text-primary">{s.value}</span>
          <div className="flex h-full w-full items-end rounded-md bg-surface-subtle">
            <div
              className={`w-full rounded-md ${colorClass}`}
              style={{ height: `${Math.max((s.value / max) * 100, 4)}%`, opacity: 0.85 }}
            />
          </div>
          <span className="text-center text-[0.7rem] font-bold text-text-muted">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/** `series` is `[{ label, value }]`, sorted best-first. Horizontal bars for ranked lists like "top products". */
export function HorizontalBarChart({ series = [], color = 'brand-teal' }) {
  if (!series.length) return null;
  const max = Math.max(...series.map((s) => s.value), 1);
  const colorClass = BAR_COLOR_CLASS[color] ?? BAR_COLOR_CLASS['brand-teal'];

  return (
    <div className="flex flex-col gap-3">
      {series.map((s) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs font-bold text-text-secondary">{s.label}</span>
          <div className="h-2.5 flex-1 rounded-full bg-surface-subtle">
            <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${Math.max((s.value / max) * 100, 4)}%`, opacity: 0.85 }} />
          </div>
          <span className="w-8 shrink-0 text-end text-xs font-extrabold text-text-primary">{s.value}</span>
        </div>
      ))}
    </div>
  );
}
