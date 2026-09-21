import { Plug } from 'lucide-react';
import { NoAccess } from '../SettingsShared';

const INTEGRATIONS = [
  { id: 'external_inventory', label: 'ربط نظام مخزون خارجي' },
  { id: 'api_keys', label: 'مفاتيح API' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'product_sync', label: 'مزامنة المنتجات' },
  { id: 'file_import_export', label: 'استيراد وتصدير الملفات' },
  { id: 'accounting', label: 'تكاملات محاسبية' },
  { id: 'notifications', label: 'تكاملات إشعارات' },
];

export default function IntegrationsPage({ hasPermission }) {
  if (!hasPermission('settings.manage_integrations')) return <NoAccess label="صفحة التكاملات" />;

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>التكاملات</h3><div className="sub">في النسخة الحالية، يعتمد تحديث المخزون على الإدخال اليدوي ورفع الملفات</div></div></div>
      <div className="role-grid">
        {INTEGRATIONS.map((i) => (
          <div key={i.id} className="role-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plug size={16} style={{ color: 'var(--text-muted)' }} />
              <strong style={{ fontSize: '0.9rem' }}>{i.label}</strong>
              <span className="badge badge-neutral" style={{ marginInlineStart: 'auto' }}>قريبًا</span>
            </div>
            <button type="button" className="toggle-switch" disabled aria-disabled><span className="knob" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
