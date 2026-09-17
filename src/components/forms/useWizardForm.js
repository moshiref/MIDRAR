import { useState } from 'react';

/**
 * Drives one multi-step form: current step, field values, per-step
 * "required" validation, and submission. Generic across forms — the
 * caller decides what a successful submit produces via `onSubmit(data)`
 * (its return value is exposed as `result`, e.g. a generated reference
 * number), and can add an extra submit gate beyond the required-field
 * check via `canSubmit(data)` (e.g. a consent checkbox, which a plain
 * non-empty-string check wouldn't catch on a boolean field).
 *
 * Originally built inline for the merchant/supplier application wizards
 * in src/features/open-store/OpenStorePage.jsx; extracted here so later
 * multi-step forms (product creation, employee invites, dispute replies)
 * can reuse the same engine.
 */
export function useWizardForm({ totalSteps, requiredByStep, initialData, canSubmit = () => true, onSubmit }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [invalidFields, setInvalidFields] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (name, value) => {
    setData((d) => ({ ...d, [name]: value }));
    setInvalidFields((prev) => {
      if (!prev.has(name)) return prev;
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  };

  const toggleListField = (name, value) => {
    setData((d) => {
      const list = d[name] || [];
      const nextList = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...d, [name]: nextList };
    });
  };

  const validateStep = (n) => {
    const required = requiredByStep[n] || [];
    const missing = required.filter((name) => !String(data[name] ?? '').trim());
    setInvalidFields(new Set(missing));
    return missing.length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(totalSteps, s + 1));
  };
  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const submit = (e) => {
    e.preventDefault();
    if (!validateStep(totalSteps) || !canSubmit(data)) return;
    setResult(onSubmit(data));
    setSubmitted(true);
  };

  return { step, data, invalidFields, submitted, result, setField, toggleListField, goNext, goPrev, submit };
}
