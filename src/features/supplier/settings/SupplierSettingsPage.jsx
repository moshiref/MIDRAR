import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getSettingsOverview } from '../data/mockSupplierDb';
import { SkeletonRows } from '../ui/Skeleton';

import SettingsHome from './SettingsHome';
import GeneralProfilePage from './pages/GeneralProfilePage';
import ContactInfoPage from './pages/ContactInfoPage';
import LocationsPage from './pages/LocationsPage';
import BusinessHoursPage from './pages/BusinessHoursPage';
import FulfillmentSettingsPage from './pages/FulfillmentSettingsPage';
import CatalogInventorySettingsPage from './pages/CatalogInventorySettingsPage';
import FinancialSettingsPage from './pages/FinancialSettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import DisplayPreferencesPage from './pages/DisplayPreferencesPage';
import DocumentsPage from './pages/DocumentsPage';
import TeamSummaryPage from './pages/TeamSummaryPage';
import SecurityPage from './pages/SecurityPage';
import PrivacyDataPage from './pages/PrivacyDataPage';
import IntegrationsPage from './pages/IntegrationsPage';
import ChangeLogPage from './pages/ChangeLogPage';
import AccountManagementPage from './pages/AccountManagementPage';

const PAGES = [
  { id: 'home', label: 'نظرة عامة', permission: 'settings.view', Component: SettingsHome },
  { id: 'general', label: 'الملف العام', permission: 'settings.edit_general', Component: GeneralProfilePage },
  { id: 'contact', label: 'بيانات التواصل', permission: 'settings.edit_contact', Component: ContactInfoPage },
  { id: 'locations', label: 'مواقع التجهيز', permission: 'settings.manage_locations', Component: LocationsPage },
  { id: 'hours', label: 'أوقات العمل والإجازات', permission: 'settings.manage_hours', Component: BusinessHoursPage },
  { id: 'fulfillment', label: 'إعدادات الطلبات والتجهيز', permission: 'settings.manage_fulfillment', Component: FulfillmentSettingsPage },
  { id: 'catalog', label: 'إعدادات المنتجات والمخزون', permission: 'settings.manage_catalog', Component: CatalogInventorySettingsPage },
  { id: 'financial', label: 'الإعدادات المالية', permission: 'settings.view_financial', Component: FinancialSettingsPage },
  { id: 'notifications', label: 'الإشعارات', permission: 'settings.manage_notifications', Component: NotificationsPage },
  { id: 'display', label: 'اللغة والعرض', permission: null, Component: DisplayPreferencesPage },
  { id: 'documents', label: 'الوثائق والتحقق', permission: 'settings.manage_documents', Component: DocumentsPage },
  { id: 'team', label: 'فريق العمل والصلاحيات', permission: 'team.view', Component: TeamSummaryPage },
  { id: 'security', label: 'الأمان والجلسات', permission: 'settings.manage_sessions', Component: SecurityPage },
  { id: 'privacy', label: 'الخصوصية والبيانات', permission: 'settings.export_data', Component: PrivacyDataPage },
  { id: 'integrations', label: 'التكاملات', permission: 'settings.manage_integrations', Component: IntegrationsPage },
  { id: 'changelog', label: 'سجل التغييرات', permission: 'settings.view_change_log', Component: ChangeLogPage },
  { id: 'account', label: 'إدارة الحساب', permission: null, Component: AccountManagementPage },
];

export default function SupplierSettingsPage() {
  const { supplier, employee, hasPermission } = useSupplierSession();
  const [activeId, setActiveId] = useState('home');
  const [search, setSearch] = useState('');
  const [overview, setOverview] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  // getSettingsOverview() is itself permission-gated (settings.view) — a
  // member without it (e.g. one who can only reach "اللغة والعرض") still
  // needs the rest of this shell to render, just without the completion
  // bar / overview page, so a denial falls back to an empty overview
  // instead of leaving the whole section stuck on a loading skeleton.
  const reloadOverview = () => getSettingsOverview(supplier.id, employee.id).then(setOverview).catch(() => setOverview({}));
  useEffect(() => {
    reloadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id, reloadTick]);

  const visiblePages = useMemo(
    () => PAGES.filter((p) => !p.permission || hasPermission(p.permission)),
    [hasPermission],
  );
  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? visiblePages.filter((p) => p.label.toLowerCase().includes(q)) : visiblePages;
  }, [visiblePages, search]);

  const active = visiblePages.find((p) => p.id === activeId) ?? visiblePages[0];

  if (!overview) {
    return (
      <section className="page" id="page-settings">
        <div className="page-head"><div><h1>الإعدادات</h1></div></div>
        <SkeletonRows rows={8} />
      </section>
    );
  }

  const pageProps = {
    supplier, employee, hasPermission,
    overview, reloadOverview: () => setReloadTick((t) => t + 1),
    goTo: setActiveId,
  };

  return (
    <section className="page" id="page-settings">
      <div className="page-head">
        <div><h1>الإعدادات</h1><div className="sub">إدارة بيانات مؤسستك، مواقعك، ماليتك، وتفضيلات حسابك</div></div>
      </div>

      {overview.completionPercent !== undefined && (
        <div className="panel" style={{ marginBottom: 22, padding: '16px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700 }}>نسبة اكتمال الملف</span>
            <span className="en" style={{ fontSize: '0.86rem', fontWeight: 800 }}>{overview.completionPercent}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-subtle)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${overview.completionPercent}%`, background: overview.completionPercent >= 80 ? 'var(--success)' : 'var(--warning)', transition: 'width .3s ease' }} />
          </div>
        </div>
      )}

      <div className="split-panel">
        <div className="panel" style={{ position: 'sticky', top: 90 }}>
          <div style={{ padding: '10px 10px 0' }}>
            <div className="search-box" style={{ maxWidth: 'none' }}>
              <Search size={14} strokeWidth={2} />
              <input type="text" placeholder="بحث في الإعدادات..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="split-list">
            {filteredPages.map((p) => (
              <button key={p.id} type="button" className={`split-list-item${active?.id === p.id ? ' active' : ''}`} onClick={() => setActiveId(p.id)}>
                {p.label}
              </button>
            ))}
            {filteredPages.length === 0 && <div style={{ padding: 12, fontSize: '0.82rem', color: 'var(--text-muted)' }}>لا توجد نتائج</div>}
          </div>
        </div>

        <div>
          {active ? <active.Component {...pageProps} /> : null}
        </div>
      </div>
    </section>
  );
}
