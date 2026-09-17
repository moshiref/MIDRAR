import { Link } from 'react-router-dom';

const TONE_CLASSES = {
  neutral: 'text-text-primary',
  danger: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
};

/**
 * A dashboard summary tile that links to a filtered list — never a bare
 * number. The supplier portal spec is explicit that every home-screen
 * card must lead somewhere actionable ("يجب أن تقود كل بطاقة إلى قائمة
 * مفصّلة قابلة للتصفية, لا أن تكون أرقامًا للعرض فقط"), so `to` is required.
 */
export default function StatCard({ to, label, value, hint, tone = 'neutral' }) {
  return (
    <Link to={to} className="block rounded-lg border border-border-default bg-surface p-5 transition-shadow hover:shadow-md">
      <div className="text-xs font-bold text-text-muted">{label}</div>
      <div className={`mt-2 text-2xl font-extrabold ${TONE_CLASSES[tone] ?? TONE_CLASSES.neutral}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-text-secondary">{hint}</div>}
    </Link>
  );
}
