import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

/** "تصدير" button with an Excel / PDF dropdown. Calls `onExport('excel' | 'pdf')`. */
export default function ExportMenu({ onExport }) {
  const [open, setOpen] = useState(false);
  const pick = (kind) => { setOpen(false); onExport(kind); };
  const itemStyle = { border: 0, justifyContent: 'flex-start', gap: 8, display: 'flex' };

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setOpen((o) => !o)}>
        <Download size={15} strokeWidth={2} /> تصدير
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setOpen(false)} />
          <div className="panel" style={{ position: 'absolute', top: 'calc(100% + 6px)', insetInlineEnd: 0, zIndex: 21, minWidth: 180, padding: 6, display: 'flex', flexDirection: 'column' }}>
            <button type="button" className="btn btn-secondary btn-sm" style={itemStyle} onClick={() => pick('excel')}>
              <FileSpreadsheet size={15} strokeWidth={2} color="var(--success)" /> Excel
            </button>
            <button type="button" className="btn btn-secondary btn-sm" style={itemStyle} onClick={() => pick('pdf')}>
              <FileText size={15} strokeWidth={2} color="var(--danger)" /> PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
