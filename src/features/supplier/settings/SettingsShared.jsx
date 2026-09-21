import { useEffect, useState, useCallback } from 'react';
import { LoaderCircle, Save } from 'lucide-react';

/** Tracks a form's dirty state against the last-saved/loaded baseline (deep-compared via JSON). */
export function useSettingsForm(initial) {
  const [baseline, setBaseline] = useState(initial);
  const [form, setForm] = useState(initial);
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);
  const reset = useCallback((next) => { setBaseline(next); setForm(next); }, []);
  return { form, setForm, dirty, reset, baseline };
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });
}
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Labeled field — same `.field` shell used across the exact-mockup CSS system. */
export function Field({ label, hint, error, full, children }) {
  return (
    <div className={`field${full ? ' full' : ''}${error ? ' invalid' : ''}`}>
      {label && <label>{label}</label>}
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

/** One settings page's outer card: head (title/description/meta) + body + optional save-bar footer. */
export function SectionCard({ title, description, meta, children, footer }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          {description && <div className="sub">{description}</div>}
        </div>
        {meta && <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'end' }}>{meta}</div>}
      </div>
      {children}
      {footer && <div className="panel-foot">{footer}</div>}
    </div>
  );
}

export function MetaLine({ updatedAt, updatedBy }) {
  if (!updatedAt) return 'لم يُعدَّل بعد';
  return `آخر تعديل: ${formatDateTime(updatedAt)}${updatedBy ? ` بواسطة ${updatedBy}` : ''}`;
}

export function SaveButton({ saving, dirty = true, children = 'حفظ التغييرات' }) {
  return (
    <button type="submit" className="btn btn-primary" disabled={saving || !dirty}>
      {saving ? <LoaderCircle size={15} className="spin" /> : <Save size={15} />}
      {children}
    </button>
  );
}

/** Warns on tab close/reload if there are unsaved changes — the in-app "navigate away" warning is handled by each page's own confirm step. */
export function useUnsavedGuard(dirty) {
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}

export function StatusBadge({ status, map }) {
  const info = map[status] ?? { label: status, badge: 'badge-neutral' };
  return <span className={`badge ${info.badge}`}><span className="dot" />{info.label}</span>;
}

export function NoAccess({ label = 'هذه الصفحة' }) {
  return (
    <div className="panel">
      <div className="empty-state">
        <div className="title">ليس لديك صلاحية</div>
        <div className="msg">{label} غير متاحة لدورك الحالي — تواصل مع مالك الحساب إذا كنت تحتاج الوصول إليها.</div>
      </div>
    </div>
  );
}
