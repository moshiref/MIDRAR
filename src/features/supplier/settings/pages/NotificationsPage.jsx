import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { SectionCard, SaveButton, useUnsavedGuard, useSettingsForm, NoAccess } from '../SettingsShared';
import { NOTIFICATION_CATEGORIES, CHANNELS } from '../settingsCatalog';
import { getNotificationPreferences, updateNotificationPreferences, getTeamMembers } from '../../data/mockSupplierDb';
import { useToast } from '../../ui/SupplierToast';

export default function NotificationsPage({ supplier, employee, hasPermission }) {
  const { showToast } = useToast();
  const [members, setMembers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(false);
  const { form, setForm, dirty, reset } = useSettingsForm(null);
  const canEdit = hasPermission('settings.manage_notifications');

  useEffect(() => {
    getNotificationPreferences(supplier.id).then(reset);
    getTeamMembers(supplier.id).then((list) => setMembers(list.filter((m) => m.status === 'active')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);
  useUnsavedGuard(dirty);

  if (!canEdit) return <NoAccess label="صفحة الإشعارات" />;
  if (!form) return <div className="panel"><div className="skeleton" style={{ height: 200, margin: 22 }} /></div>;

  const toggleChannel = (categoryId, channelId) => {
    setForm((f) => ({ ...f, [categoryId]: { ...f[categoryId], channels: { ...f[categoryId].channels, [channelId]: !f[categoryId].channels[channelId] } } }));
  };
  const toggleRecipient = (categoryId, memberId) => {
    setForm((f) => {
      const current = f[categoryId].recipientIds ?? [];
      const next = current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId];
      return { ...f, [categoryId]: { ...f[categoryId], recipientIds: next } };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const next = await updateNotificationPreferences({ supplierId: supplier.id, actorEmployeeId: employee.id, patch: form });
      showToast('تم حفظ تفضيلات الإشعارات');
      reset(next);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard
        title="الإشعارات"
        description="لا يمكن تعطيل الإشعارات الأمنية والمالية الحرجة، ويمكنك تحديد مستلمين من فريقك حسب نوع الإشعار"
        footer={<SaveButton saving={saving} dirty={dirty} />}
      >
        <div style={{ padding: '4px 22px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {NOTIFICATION_CATEGORIES.map((cat) => (
            <div key={cat.id} className="variant-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: '0.9rem' }}>{cat.label}</strong>
                  {cat.critical && <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Lock size={11} /> لا يمكن التعطيل</span>}
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {CHANNELS.map((ch) => (
                    <label key={ch.id} className="perm-item">
                      <input type="checkbox" checked={form[cat.id].channels[ch.id]} disabled={cat.critical && ch.id === 'inApp'} onChange={() => toggleChannel(cat.id, ch.id)} /> {ch.label}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{cat.events.join(' · ')}</div>
              <button type="button" onClick={() => setExpanded(expanded === cat.id ? null : cat.id)} style={{ fontSize: '0.78rem', color: 'var(--brand-blue)', fontWeight: 700, marginTop: 8 }}>
                {expanded === cat.id ? 'إخفاء المستلمين' : `المستلمون (${form[cat.id].recipientIds?.length || 'الجميع'})`}
              </button>
              {expanded === cat.id && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                  {members.map((m) => (
                    <label key={m.id} className="perm-item">
                      <input type="checkbox" checked={form[cat.id].recipientIds?.includes(m.id) ?? false} onChange={() => toggleRecipient(cat.id, m.id)} /> {m.name}
                    </label>
                  ))}
                  <span className="field-hint">بدون تحديد = يصل لكل من يملك صلاحية الاطلاع المرتبطة بهذا النوع.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </form>
  );
}
