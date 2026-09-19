import Modal from '../../../components/ui/Modal';

/** Confirmation gate for destructive/sensitive actions (delete, cancel, disable, ...). */
export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'تأكيد', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-5 text-sm text-text-secondary">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border-default px-4 py-2 text-sm font-bold text-text-primary"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={() => { onConfirm(); onClose(); }}
          className={`rounded-md px-4 py-2 text-sm font-bold text-white ${danger ? 'bg-danger' : 'bg-brand-navy'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
