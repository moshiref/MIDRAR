import { useCallback, useEffect, useState } from 'react';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getTeamMembers, getTeamInvitations, getTeamStats, getLocations } from '../data/mockSupplierDb';
import { SkeletonRows } from '../ui/Skeleton';
import MembersTab from './MembersTab';
import InvitationsTab from './InvitationsTab';
import RolesTab from './RolesTab';
import ActivityTab from './ActivityTab';
import SecurityTab from './SecurityTab';

const TABS = [
  { id: 'members', label: 'أعضاء الفريق' },
  { id: 'invitations', label: 'الدعوات المعلّقة' },
  { id: 'roles', label: 'الأدوار والصلاحيات' },
  { id: 'activity', label: 'سجل النشاط' },
  { id: 'security', label: 'إعدادات الأمان' },
];

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-SY', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function SupplierTeamPage() {
  const { supplier, employee, teamRoles, hasPermission, refreshTeam, refreshSupplier } = useSupplierSession();
  const [tab, setTab] = useState('members');
  const [members, setMembers] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState(null);

  const reload = useCallback(async () => {
    const [m, inv, locs, s] = await Promise.all([
      getTeamMembers(supplier.id), getTeamInvitations(supplier.id), getLocations(supplier.id), getTeamStats(supplier.id),
    ]);
    setMembers(m);
    setInvitations(inv);
    setLocations(locs);
    setStats(s);
    await Promise.all([refreshTeam(), refreshSupplier()]);
  }, [supplier.id, refreshTeam, refreshSupplier]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  if (!hasPermission('team.view')) {
    return (
      <section className="page">
        <div className="page-head"><div><h1>ليس لديك صلاحية</h1></div></div>
        <div className="panel">
          <div className="empty-state">
            <div className="title">هذا القسم غير متاح لدورك الحالي</div>
            <div className="msg">تواصل مع مالك الحساب إذا كنت تحتاج الوصول إلى فريق العمل.</div>
          </div>
        </div>
      </section>
    );
  }

  if (!members || !stats) {
    return (
      <section className="page" id="page-team">
        <div className="page-head"><div><h1>فريق العمل</h1></div></div>
        <SkeletonRows rows={8} />
      </section>
    );
  }

  const sharedProps = { supplier, employee, teamRoles, hasPermission, members, invitations, locations, stats, reload };

  return (
    <section className="page" id="page-team">
      <div className="page-head">
        <div><h1>فريق العمل</h1><div className="sub">ادعُ من يساعدك بإدارة الحساب، وحدّد صلاحيات كل عضو بدقة</div></div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><span className="label">إجمالي أعضاء الفريق</span><div className="value en">{stats.total}</div></div>
        <div className="kpi-card"><span className="label">الأعضاء النشطون</span><div className="value en">{stats.active}</div></div>
        <div className="kpi-card"><span className="label">الدعوات المعلّقة</span><div className="value en">{stats.pendingInvites}</div></div>
        <div className="kpi-card"><span className="label">الحسابات الموقوفة</span><div className="value en">{stats.suspended}</div></div>
      </div>
      <div className="kpi-grid" style={{ marginTop: -8 }}>
        <div className="kpi-card"><span className="label">الأدوار المخصصة</span><div className="value en">{stats.customRoles}</div></div>
        <div className="kpi-card" style={{ gridColumn: 'span 3' }}>
          <span className="label">آخر نشاط أمني مهم</span>
          {stats.lastSecurityEvent ? (
            <div style={{ fontSize: '0.86rem', fontWeight: 700, marginTop: 6 }}>
              {stats.lastSecurityEvent.detail}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{formatDateTime(stats.lastSecurityEvent.at)}</div>
            </div>
          ) : (
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 6 }}>لا يوجد نشاط أمني بعد</div>
          )}
        </div>
      </div>

      <div className="chip-tabs" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`chip-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === 'invitations' && stats.pendingInvites > 0 && <span className="badge-count en" style={{ marginInlineStart: 6 }}>{stats.pendingInvites}</span>}
          </button>
        ))}
      </div>

      {tab === 'members' && <MembersTab {...sharedProps} />}
      {tab === 'invitations' && <InvitationsTab {...sharedProps} />}
      {tab === 'roles' && <RolesTab {...sharedProps} />}
      {tab === 'activity' && <ActivityTab {...sharedProps} />}
      {tab === 'security' && <SecurityTab {...sharedProps} />}
    </section>
  );
}
