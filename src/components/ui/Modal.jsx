import { useEffect } from 'react';

/** Centered dialog overlay. Closes on Escape or backdrop click. */
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy-deep/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="mb-4 text-lg font-extrabold text-text-primary">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
