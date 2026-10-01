/**
 * Print-to-PDF export. There is no PDF dependency in the project, and Arabic
 * shaping in client-side PDF libs is unreliable — so this renders a
 * print-ready RTL page in a new window and lets the browser's "Save as PDF"
 * produce the file. Returns false if the popup was blocked.
 *
 * `rows` is an array of objects; `columns` is `[{ key, header, num? }]`.
 */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

export function printTablePdf(title, rows, columns) {
  const win = window.open('', '_blank');
  if (!win) return false;
  const date = new Date().toLocaleDateString('ar-EG-u-nu-latn');
  const head = columns.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('');
  const body = rows.map((row) => `<tr>${columns.map((c) => `<td${c.num ? ' class="n"' : ''}>${escapeHtml(row[c.key])}</td>`).join('')}</tr>`).join('');
  win.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(title)} - ${date}</title>
<style>
  body{ font-family:Tahoma,Arial,sans-serif; color:#0F1B2D; padding:32px; }
  h1{ font-size:20px; margin:0 0 4px; } .sub{ color:#6B7A8C; font-size:12px; margin-bottom:20px; }
  table{ width:100%; border-collapse:collapse; font-size:13px; }
  th{ background:#F3F6F9; text-align:right; padding:10px; color:#6B7A8C; font-weight:600; }
  td{ padding:10px; border-bottom:1px solid #E3E8EE; } .n{ direction:ltr; text-align:right; }
  @media print{ th{ -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
<h1>${escapeHtml(title)}</h1><div class="sub">تاريخ التصدير: ${date} · عدد السجلات: ${rows.length}</div>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
<script>window.onload=function(){window.print();}</script></body></html>`);
  win.document.close();
  return true;
}
