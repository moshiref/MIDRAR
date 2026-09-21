import { useMemo, useState } from 'react';
import { Search, Download } from 'lucide-react';
import { resolveRole, MEMBER_STATUS } from './permissions';
import { exportToCsv } from '../lib/csv';
import InviteMemberModal from './InviteMemberModal';
import EditMemberModal from './EditMemberModal';

function initialsOf(name) {
  return (name ?? '').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('') || '؟';
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });
}
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
}

const EMPTY_FILTERS = { search: '', roleId: '', status: '', locationId: '', sortBy: 'name' };

export default function MembersTab({ supplier, employee, teamRoles, hasPermission, members, locations, reload }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const locationName = (id) => locations.find((l) => l.id === id)?.name;

  const filtered = useMemo(() => {
    let list = members;
    const q = filters.search.trim().toLowerCase();
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q) || m.jobTitle?.toLowerCase().includes(q));
    if (filters.roleId) list = list.filter((m) => m.roleId === filters.roleId);
    if (filters.status) list = list.filter((m) => m.status === filters.status);
    if (filters.locationId) list = list.filter((m) => m.locationIds?.includes(filters.locationId));
    const sorted = [...list];
    if (filters.sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    else if (filters.sortBy === 'newest') sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (filters.sortBy === 'lastLogin') sorted.sort((a, b) => new Date(b.lastLoginAt ?? 0) - new Date(a.lastLoginAt ?? 0));
    return sorted;
  }, [members, filters]);

  const hasActiveFilters = Object.keys(EMPTY_FILTERS).some((k) => filters[k] !== EMPTY_FILTERS[k] && k !== 'sortBy');
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const handleExport = () => {
    exportToCsv(
      'team-members.csv',
      filtered.map((m) => ({
        name: m.name,
        jobTitle: m.jobTitle,
        phone: m.phone,
        email: m.email,
        role: resolveRole(m.roleId, teamRoles)?.name ?? m.roleId,
        locations: (m.locationIds ?? []).map(locationName).filter(Boolean).join(' / ') || 'كل المواقع',
        status: MEMBER_STATUS[m.status]?.label ?? m.status,
        lastLogin: formatDateTime(m.lastLoginAt),
        joinedAt: formatDate(m.acceptedAt ?? m.createdAt),
      })),
      [
        { key: 'name', header: 'الاسم' }, { key: 'jobTitle', header: 'المسمى الوظيفي' },
        { key: 'phone', header: 'الهاتف' }, { key: 'email', header: 'البريد' },
        { key: 'role', header: 'الدور' }, { key: 'locations', header: 'المواقع' },
        { key: 'status', header: 'الحالة' }, { key: 'lastLogin', header: 'آخر دخول' }, { key: 'joinedAt', header: 'تاريخ الانضمام' },
      ],
    );
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div><h3>أعضاء الفريق</h3><div className="sub">{members.length} عضو مسجّل بهذا الحساب</div></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={handleExport}>
            <Download size={14} strokeWidth={2} /> تصدير القائمة
          </button>
          {hasPermission('team.invite') && (
            <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setInviteOpen(true)}>
              + دعوة عضو جديد
            </button>
          )}
        </div>
      </div>

      <div className="filters-bar">
        <div className="field filters-search">
          <label>بحث بالاسم</label>
          <div className="search-box">
            <Search size={16} strokeWidth={2} />
            <input type="text" placeholder="ابحث عن عضو..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </div>
        </div>
        <div className="field" style={{ width: 170 }}>
          <label>الدور</label>
          <select value={filters.roleId} onChange={(e) => setFilters((f) => ({ ...f, roleId: e.target.value }))}>
            <option value="">كل الأدوار</option>
            {teamRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="field" style={{ width: 150 }}>
          <label>الحالة</label>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">كل الحالات</option>
            {Object.entries(MEMBER_STATUS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
          </select>
        </div>
        <div className="field" style={{ width: 160 }}>
          <label>موقع التجهيز</label>
          <select value={filters.locationId} onChange={(e) => setFilters((f) => ({ ...f, locationId: e.target.value }))}>
            <option value="">كل المواقع</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="field" style={{ width: 150 }}>
          <label>ترتيب حسب</label>
          <select value={filters.sortBy} onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}>
            <option value="name">الاسم</option>
            <option value="newest">الأحدث انضمامًا</option>
            <option value="lastLogin">آخر دخول</option>
          </select>
        </div>
        {hasActiveFilters && <button type="button" className="btn btn-secondary btn-sm filters-reset" onClick={clearFilters}>إعادة تعيين</button>}
      </div>
      {hasActiveFilters && <div className="filters-summary">عرض {filtered.length} من {members.length} عضو</div>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="title">لا يوجد أعضاء مطابقون</div>
          <div className="msg">جرّب تعديل كلمة البحث أو الفلاتر.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>العضو</th><th>الهاتف</th><th>البريد</th><th>الدور</th><th>المواقع</th>
                <th>الحالة</th><th>آخر دخول</th><th>تاريخ الانضمام</th><th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const role = resolveRole(m.roleId, teamRoles);
                const statusInfo = MEMBER_STATUS[m.status] ?? { label: m.status, badge: 'badge-neutral' };
                const isSelf = m.id === employee.id;
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar-chip">{initialsOf(m.name)}</div>
                        <div>
                          <div className="cell-main">{m.name}{isSelf && <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}> (أنت)</span>}</div>
                          <div className="cell-sub">{m.jobTitle || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="num">{m.phone || '—'}</td>
                    <td>{m.email || '—'}</td>
                    <td>
                      <span className="badge" style={{ background: `${role?.color ?? '#4C5E71'}1A`, color: role?.color ?? 'var(--text-secondary)' }}>
                        <span className="role-dot" style={{ background: role?.color ?? '#4C5E71' }} />{role?.name ?? m.roleId}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {m.locationIds?.length ? m.locationIds.map(locationName).filter(Boolean).join('، ') : 'كل المواقع'}
                    </td>
                    <td><span className={`badge ${statusInfo.badge}`}><span className="dot" />{statusInfo.label}</span></td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDateTime(m.lastLoginAt)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDate(m.acceptedAt ?? m.createdAt)}</td>
                    <td className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      {hasPermission('team.edit_role') && (
                        <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setEditing(m)}>إدارة الوصول</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {inviteOpen && (
        <InviteMemberModal
          supplierId={supplier.id}
          teamRoles={teamRoles}
          locations={locations}
          actorEmployeeId={employee.id}
          onClose={() => setInviteOpen(false)}
          onDone={async () => { setInviteOpen(false); await reload(); }}
        />
      )}
      {editing && (
        <EditMemberModal
          member={editing}
          teamRoles={teamRoles}
          locations={locations}
          actorEmployeeId={employee.id}
          hasPermission={hasPermission}
          onClose={() => setEditing(null)}
          onDone={async () => { setEditing(null); await reload(); }}
        />
      )}
    </div>
  );
}
