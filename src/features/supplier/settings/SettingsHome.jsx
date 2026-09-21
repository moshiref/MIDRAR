import { ArrowLeft } from 'lucide-react';
import { PAYOUT_METHOD_STATUS } from './settingsCatalog';
import { formatDateTime } from './SettingsShared';

const ACTION_PAGE = {
  add_location: 'locations', complete_contact: 'contact', add_payout: 'financial',
  set_hours: 'hours', upload_doc: 'documents',
};

export default function SettingsHome({ supplier, overview, goTo }) {
  const payoutStatus = PAYOUT_METHOD_STATUS[overview.payoutMethodStatus] ?? { label: overview.payoutMethodStatus, badge: 'badge-neutral' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="kpi-grid">
        <div className="kpi-card"><span className="label">مواقع التجهيز النشطة</span><div className="value en">{overview.activeLocationsCount}</div></div>
        <div className="kpi-card">
          <span className="label">حالة وسيلة استلام الأموال</span>
          <div style={{ marginTop: 8 }}><span className={`badge ${payoutStatus.badge}`}><span className="dot" />{payoutStatus.label}</span></div>
        </div>
        <div className="kpi-card"><span className="label">وثائق قاربت على الانتهاء</span><div className="value en" style={{ color: overview.expiringDocuments > 0 ? 'var(--danger)' : undefined }}>{overview.expiringDocuments}</div></div>
        <div className="kpi-card"><span className="label">أعضاء الفريق النشطون</span><div className="value en">{overview.activeTeamMembers}</div></div>
      </div>
      <div className="kpi-grid" style={{ marginTop: -8 }}>
        <div className="kpi-card">
          <span className="label">حالة التحقق من الحساب</span>
          <div style={{ marginTop: 8 }}><span className={`badge ${supplier.status === 'approved' ? 'badge-success' : 'badge-warning'}`}><span className="dot" />{supplier.status === 'approved' ? 'موثّق' : supplier.status}</span></div>
        </div>
        <div className="kpi-card"><span className="label">الدعوات المعلّقة</span><div className="value en">{overview.pendingInvitations}</div></div>
        <div className="kpi-card" style={{ gridColumn: 'span 2' }}>
          <span className="label">آخر تغيير أمني أو مالي</span>
          {overview.lastSecurityOrFinancialChange ? (
            <div style={{ fontSize: '0.84rem', fontWeight: 700, marginTop: 6 }}>
              {overview.lastSecurityOrFinancialChange.detail}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{formatDateTime(overview.lastSecurityOrFinancialChange.at)}</div>
            </div>
          ) : <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6 }}>لا يوجد بعد</div>}
        </div>
      </div>

      {overview.restrictions?.length > 0 && (
        <div className="tip-box danger">
          <div>
            <div className="t">قيود مفروضة على الحساب</div>
            {overview.restrictions.map((r, i) => <div key={i} className="s">{r}</div>)}
          </div>
        </div>
      )}

      {overview.accountStatus !== 'active' && (
        <div className="tip-box danger">
          <div className="t">الحساب متوقف مؤقتًا حاليًا</div>
          <div className="s">راجع «إدارة الحساب» لإعادة تفعيله.</div>
        </div>
      )}

      <div className="panel">
        <div className="panel-head"><div><h3>إجراءات مطلوبة</h3><div className="sub">مرتبة حسب الأولوية</div></div></div>
        {overview.actionsNeeded.length === 0 ? (
          <div className="empty-state"><div className="title">كل شي جاهز</div><div className="msg">لا توجد إجراءات مطلوبة حاليًا.</div></div>
        ) : (
          <div className="simple-list">
            {overview.actionsNeeded.map((a) => (
              <div key={a.id} className="simple-row">
                <div className="ic" style={{ background: a.priority === 1 ? 'var(--danger-bg)' : 'var(--warning-bg)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={a.priority === 1 ? 'var(--danger)' : 'var(--warning)'} strokeWidth="2"><path d="M12 9v4M12 17h.01" /></svg>
                </div>
                <div className="txt"><div className="t">{a.label}</div></div>
                {ACTION_PAGE[a.id] && (
                  <span className="cta" onClick={() => goTo(ACTION_PAGE[a.id])} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    الانتقال <ArrowLeft size={13} />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
