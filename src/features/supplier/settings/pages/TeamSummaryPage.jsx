import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeamStats } from '../../data/mockSupplierDb';
import { formatDateTime } from '../SettingsShared';

export default function TeamSummaryPage({ supplier }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { getTeamStats(supplier.id).then(setStats); }, [supplier.id]);

  if (!stats) return <div className="panel"><div className="skeleton" style={{ height: 160, margin: 22 }} /></div>;

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>فريق العمل والصلاحيات</h3><div className="sub">إدارة الفريق كاملة موجودة بقسم مستقل — هنا ملخص فقط</div></div></div>
      <div className="kpi-grid" style={{ padding: '0 22px', margin: '18px 0' }}>
        <div className="kpi-card"><span className="label">أعضاء نشطون</span><div className="value en">{stats.active}</div></div>
        <div className="kpi-card"><span className="label">دعوات معلّقة</span><div className="value en">{stats.pendingInvites}</div></div>
        <div className="kpi-card"><span className="label">أدوار مستخدمة</span><div className="value en">{stats.customRoles + 7}</div></div>
        <div className="kpi-card">
          <span className="label">آخر تغيير صلاحيات</span>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: 6 }}>{stats.lastSecurityEvent ? formatDateTime(stats.lastSecurityEvent.at) : '—'}</div>
        </div>
      </div>
      <div className="panel-foot">
        <Link to="/supplier/team" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>إدارة فريق العمل</Link>
      </div>
    </div>
  );
}
