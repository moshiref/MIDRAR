import { useEffect, useMemo, useState } from 'react';
import { getTeamActivityLog, ACTIVITY_CATEGORIES } from '../data/mockSupplierDb';

const ACTION_LABELS = {
  'invitation.send': 'إرسال دعوة', 'invitation.resend': 'إعادة إرسال دعوة', 'invitation.cancel': 'إلغاء دعوة',
  'invitation.accept': 'قبول دعوة', 'invitation.roleChange': 'تعديل دور دعوة',
  'role.create': 'إنشاء دور مخصص', 'role.update': 'تعديل دور',
  'member.updateAccess': 'تعديل وصول عضو', 'member.suspend': 'إيقاف عضو', 'member.reactivate': 'إعادة تفعيل عضو',
  'member.revoke': 'إلغاء وصول عضو', 'member.endSessions': 'إنهاء جلسات عضو',
  'team.endAllSessions': 'إنهاء جميع الجلسات', 'access.denied': 'محاولة وصول مرفوضة',
  'ownership.transferInitiate': 'بدء نقل الملكية', 'ownership.transferConfirm': 'تأكيد نقل الملكية', 'ownership.transferCancel': 'إلغاء نقل الملكية',
  'product.add': 'إضافة منتج', 'product.update': 'تعديل منتج', 'product.delete': 'حذف منتج', 'product.statusChange': 'تغيير حالة منتج',
  'inventory.adjust': 'تعديل مخزون', 'order.statusChange': 'تغيير حالة طلب',
  'supplier.settingsUpdate': 'تعديل بيانات المؤسسة', 'location.add': 'إضافة موقع', 'location.update': 'تعديل موقع',
  'category.add': 'إضافة قسم', 'category.update': 'تعديل قسم', 'category.delete': 'حذف قسم',
};

function actionLabel(action) {
  return ACTION_LABELS[action] ?? action;
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });
}

function summarizeDetails(entry) {
  if (!entry.details || Object.keys(entry.details).length === 0) return '—';
  try {
    return Object.entries(entry.details).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('، ');
  } catch {
    return '—';
  }
}

const EMPTY_FILTERS = { actorName: '', category: '', dateFrom: '', dateTo: '' };

export default function ActivityTab({ supplier, members }) {
  const [entries, setEntries] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    getTeamActivityLog(supplier.id, {
      actorName: filters.actorName || undefined,
      category: filters.category || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }).then(setEntries);
  }, [supplier.id, filters]);

  const actorNames = useMemo(() => [...new Set(members.map((m) => m.name))], [members]);
  const hasActiveFilters = Object.values(filters).some(Boolean);
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>سجل النشاط</h3><div className="sub">سجل غير قابل للتعديل أو الحذف من قِبل الموظفين</div></div></div>

      <div className="filters-bar">
        <div className="field" style={{ width: 170 }}>
          <label>العضو</label>
          <select value={filters.actorName} onChange={(e) => setFilters((f) => ({ ...f, actorName: e.target.value }))}>
            <option value="">كل الأعضاء</option>
            {actorNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="field" style={{ width: 190 }}>
          <label>النشاط</label>
          <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
            <option value="">كل الأنشطة</option>
            {ACTIVITY_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="field" style={{ width: 150 }}>
          <label>من تاريخ</label>
          <input type="date" className="en" dir="ltr" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
        </div>
        <div className="field" style={{ width: 150 }}>
          <label>إلى تاريخ</label>
          <input type="date" className="en" dir="ltr" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
        </div>
        {hasActiveFilters && <button type="button" className="btn btn-secondary btn-sm filters-reset" onClick={clearFilters}>إعادة تعيين</button>}
      </div>

      {!entries ? (
        <div className="skeleton" style={{ height: 200, margin: '0 22px 22px' }} />
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <div className="title">لا يوجد نشاط مطابق</div>
          <div className="msg">جرّب تعديل الفلاتر.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>التاريخ والوقت</th><th>المستخدم</th><th>الإجراء</th><th>العنصر المتأثر</th><th>التفاصيل</th><th>النتيجة</th></tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontSize: '0.8rem' }}>{formatDateTime(e.at)}</td>
                  <td className="cell-main">{e.actorName ?? '—'}</td>
                  <td>{actionLabel(e.action)}</td>
                  <td style={{ fontSize: '0.82rem', fontFamily: 'var(--font-en)', direction: 'ltr', textAlign: 'end' }}>{e.target ?? '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 280 }}>{summarizeDetails(e)}</td>
                  <td>
                    {e.result === 'rejected'
                      ? <span className="badge badge-danger"><span className="dot" />مرفوض</span>
                      : <span className="badge badge-success"><span className="dot" />ناجح</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
