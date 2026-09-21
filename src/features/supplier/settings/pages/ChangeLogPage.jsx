import { useEffect, useMemo, useState } from 'react';
import { getSettingsChangeLog, SETTINGS_LOG_SECTIONS, getTeamMembers } from '../../data/mockSupplierDb';
import { formatDateTime, NoAccess } from '../SettingsShared';

function summarizeDetails(entry) {
  if (!entry.details || Object.keys(entry.details).length === 0) return '—';
  try {
    return Object.entries(entry.details).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('، ');
  } catch {
    return '—';
  }
}

const EMPTY_FILTERS = { actorName: '', section: '', dateFrom: '', dateTo: '' };

export default function ChangeLogPage({ supplier, hasPermission }) {
  const [entries, setEntries] = useState(null);
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const canView = hasPermission('settings.view_change_log');

  useEffect(() => { getTeamMembers(supplier.id).then(setMembers); }, [supplier.id]);
  useEffect(() => {
    getSettingsChangeLog(supplier.id, {
      actorName: filters.actorName || undefined, section: filters.section || undefined,
      dateFrom: filters.dateFrom || undefined, dateTo: filters.dateTo || undefined,
    }).then(setEntries);
  }, [supplier.id, filters]);

  const actorNames = useMemo(() => [...new Set(members.map((m) => m.name))], [members]);
  const hasActiveFilters = Object.values(filters).some(Boolean);

  if (!canView) return <NoAccess label="صفحة سجل التغييرات" />;

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>سجل التغييرات</h3><div className="sub">سجل غير قابل للتعديل أو الحذف — لا يعرض كلمات المرور أو رموز التحقق</div></div></div>

      <div className="filters-bar">
        <div className="field" style={{ width: 170 }}>
          <label>المستخدم</label>
          <select value={filters.actorName} onChange={(e) => setFilters((f) => ({ ...f, actorName: e.target.value }))}>
            <option value="">الكل</option>
            {actorNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="field" style={{ width: 190 }}>
          <label>القسم</label>
          <select value={filters.section} onChange={(e) => setFilters((f) => ({ ...f, section: e.target.value }))}>
            <option value="">كل الأقسام</option>
            {SETTINGS_LOG_SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="field" style={{ width: 150 }}><label>من تاريخ</label><input type="date" className="en" dir="ltr" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} /></div>
        <div className="field" style={{ width: 150 }}><label>إلى تاريخ</label><input type="date" className="en" dir="ltr" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} /></div>
        {hasActiveFilters && <button type="button" className="btn btn-secondary btn-sm filters-reset" onClick={() => setFilters(EMPTY_FILTERS)}>إعادة تعيين</button>}
      </div>

      {!entries ? (
        <div className="skeleton" style={{ height: 200, margin: '0 22px 22px' }} />
      ) : entries.length === 0 ? (
        <div className="empty-state"><div className="title">لا يوجد تغييرات مطابقة</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>التاريخ والوقت</th><th>المستخدم</th><th>الإجراء</th><th>التفاصيل</th><th>النتيجة</th></tr></thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontSize: '0.8rem' }}>{formatDateTime(e.at)}</td>
                  <td className="cell-main">{e.actorName ?? '—'}</td>
                  <td>{e.action}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 320 }}>{summarizeDetails(e)}</td>
                  <td>{e.result === 'rejected' ? <span className="badge badge-danger"><span className="dot" />مرفوض</span> : <span className="badge badge-success"><span className="dot" />ناجح</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
