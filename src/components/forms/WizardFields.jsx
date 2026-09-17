import { Link } from 'react-router-dom';

/**
 * Presentational building blocks for `useWizardForm`-driven multi-step
 * forms: step progress, text/select inputs, radio-card and tag-chip
 * groups, prev/next/submit controls, and a generic success screen.
 *
 * Extracted from src/features/open-store/OpenStorePage.jsx. They render
 * against class names defined in OpenStorePage.css (`.field`, `.choice-
 * card`, `.tag-chip`, `.progress-*`, `.step-actions`, `.success-card`,
 * ...), scoped under `.open-store-page` — so today they only look right
 * inside that page's DOM subtree. A dashboard consumer styled with
 * Tailwind utilities (per the Phase 0 supplier-portal plan) will need
 * either that same class vocabulary in scope or a restyle; that's a
 * later-phase concern, not addressed by this extraction.
 */

export function ProgressBar({ labels, total, step }) {
  return (
    <>
      <div className="progress-labels">
        {labels.map((label, i) => (
          <span key={label} className={i + 1 === step ? 'current' : ''}>{label}</span>
        ))}
      </div>
      <div className="progress-wrap">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <div key={n} className={`progress-step${n === step ? ' active' : n < step ? ' done' : ''}`} />
        ))}
      </div>
    </>
  );
}

export function TextField({ label, optional, name, value, onChange, invalid, required, full, ...inputProps }) {
  return (
    <div className={`field${full ? ' full' : ''}${invalid ? ' invalid' : ''}`}>
      <label>{label}{optional && <span className="opt"> {optional}</span>}</label>
      <input name={name} value={value} onChange={(e) => onChange(e.target.value)} {...inputProps} />
      {required && <span className="err">هاد الحقل مطلوب</span>}
    </div>
  );
}

export function SelectField({ label, name, value, onChange, options, invalid, required, errorText, full, placeholder }) {
  return (
    <div className={`field${full ? ' full' : ''}${invalid ? ' invalid' : ''}`}>
      <label>{label}</label>
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => <option key={opt}>{opt}</option>)}
      </select>
      {required && <span className="err">{errorText}</span>}
    </div>
  );
}

export function ChoiceGroup({ name, options, value, onChange }) {
  return (
    <div className="choice-grid">
      {options.map((opt) => (
        <label key={opt.value} className="choice-card">
          <input type="radio" name={name} checked={value === opt.value} onChange={() => onChange(opt.value)} />
          <div className="cm" />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export function TagSelect({ name, options, values, onToggle }) {
  return (
    <div className="tag-select">
      {options.map((opt) => (
        <label key={opt} className="tag-chip">
          <input type="checkbox" name={name} checked={values.includes(opt)} onChange={() => onToggle(opt)} />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

export function StepActions({ onPrev, onNext, nextLabel = 'التالي', submitLabel, submitDisabled }) {
  return (
    <div className="step-actions">
      {onPrev ? <button type="button" className="btn btn-secondary" onClick={onPrev}>السابق</button> : <span />}
      {submitLabel
        ? <button type="submit" className="btn btn-primary" disabled={submitDisabled}>{submitLabel}</button>
        : <button type="button" className="btn btn-primary" onClick={onNext}>{nextLabel}</button>}
    </div>
  );
}

export function SuccessCard({ title, message, refLabel, reference }) {
  return (
    <div className="success-card">
      <div className="ic">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="ref-box"><span className="lbl">{refLabel}</span><span className="val en">{reference}</span></div>
      <div><Link to="/" className="btn btn-secondary">عودة للصفحة الرئيسية</Link></div>
    </div>
  );
}
