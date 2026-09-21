import { useMemo, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { PERMISSION_GROUPS, checkRoleConflicts } from './permissions';
import { createCustomRole, updateCustomRole } from '../data/mockSupplierDb';
import { useToast } from '../ui/SupplierToast';

const COLOR_PRESETS = ['#0B2C52', '#0A63D6', '#10B7A0', '#B8791A', '#2E8CF5', '#7A5CFA', '#C4402E', '#4C5E71'];

function RoleFormModal({ role, actorEmployeeId, supplierId, onClose, onDone }) {
  const { showToast } = useToast();
  const isEdit = Boolean(role);
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [color, setColor] = useState(role?.color ?? COLOR_PRESETS[4]);
  const [permissions, setPermissions] = useState(role?.permissions ?? []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const conflicts = useMemo(() => checkRoleConflicts(permissions), [permissions]);

  const togglePermission = (id) => setPermissions((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const handleSave = async () => {
    setError('');
    if (!name.trim()) { setError('اسم الدور مطلوب'); return; }
    if (permissions.length === 0) { setError('اختر صلاحية واحدة على الأقل'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await updateCustomRole({ roleId: role.id, actorEmployeeId, patch: { name: name.trim(), description: description.trim(), color, permissions } });
        showToast('تم تحديث الدور');
      } else {
        await createCustomRole({ supplierId, actorEmployeeId, name: name.trim(), description: description.trim(), color, permissions });
        showToast('تم إنشاء الدور المخصص');
      }
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>{isEdit ? `تعديل دور «${role.name}»` : 'إنشاء دور مخصص'}</h3>
          <button type="button" className="drawer-close" onClick={onClose}><X size={16} strokeWidth={2} /></button>
        </div>
        <div className="drawer-body">
          <div className="form-grid">
            <div className="field">
              <label>اسم الدور</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>اللون المميز</label>
              <div style={{ display: 'flex', gap: 8, paddingTop: 6 }}>
                {COLOR_PRESETS.map((c) => (
                  <button key={c} type="button" className={`color-swatch${color === c ? ' active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />
                ))}
              </div>
            </div>
            <div className="field full">
              <label>الوصف</label>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثال: يمكنه تعديل المخزون ومتابعة الطلبات لموقع واحد فقط" />
            </div>
          </div>

          <div className="perm-groups">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.id}>
                <div className="perm-group-title">{group.label}</div>
                <div className="perm-list">
                  {group.permissions.map((p) => (
                    <label key={p.id} className={`perm-item${p.sensitive ? ' sensitive' : ''}`}>
                      <input type="checkbox" checked={permissions.includes(p.id)} onChange={() => togglePermission(p.id)} />
                      {p.label}{p.sensitive ? ' (حساسة)' : ''}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {conflicts.length > 0 && (
            <div className="tip-box danger" style={{ margin: '0 22px 16px' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <div className="t">تعارض محتمل في الصلاحيات</div>
                {conflicts.map((c) => <div key={c} className="s">{c}</div>)}
              </div>
            </div>
          )}
          {error && <div style={{ padding: '0 22px 12px' }}><span className="field-error">{error}</span></div>}
        </div>
        <div className="drawer-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>إلغاء</button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? '...' : 'حفظ الدور'}</button>
        </div>
      </div>
    </div>
  );
}

export default function RolesTab({ supplier, employee, teamRoles, hasPermission, members, reload }) {
  const [formTarget, setFormTarget] = useState(null); // null closed, 'new', or role object
  const [expanded, setExpanded] = useState(null);

  const memberCount = (roleId) => members.filter((m) => m.roleId === roleId).length;

  return (
    <div className="panel">
      <div className="panel-head">
        <div><h3>الأدوار والصلاحيات</h3><div className="sub">7 أدوار جاهزة بصلاحيات ثابتة، بالإضافة لأي أدوار مخصصة تنشئها</div></div>
        {hasPermission('team.create_role') && (
          <button type="button" className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setFormTarget('new')}>+ إنشاء دور مخصص</button>
        )}
      </div>

      <div className="role-grid">
        {teamRoles.map((role) => (
          <div key={role.id} className="role-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="role-dot" style={{ background: role.color }} />
              <strong style={{ fontSize: '0.94rem' }}>{role.name}</strong>
              {role.isSystem ? (
                <span className="badge badge-neutral" style={{ marginInlineStart: 'auto' }}>نظام</span>
              ) : (
                <span className="badge badge-info" style={{ marginInlineStart: 'auto' }}>مخصص</span>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{role.description}</p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              {role.permissions.length} صلاحية · {memberCount(role.id)} عضو
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setExpanded(expanded === role.id ? null : role.id)}>
                {expanded === role.id ? 'إخفاء الصلاحيات' : 'عرض الصلاحيات'}
              </button>
              {!role.isSystem && hasPermission('team.edit_roles') && (
                <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} onClick={() => setFormTarget(role)}>تعديل</button>
              )}
            </div>
            {expanded === role.id && (
              <ul style={{ marginTop: 8, paddingInlineStart: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {role.permissions.map((pId) => {
                  const group = PERMISSION_GROUPS.find((g) => g.permissions.some((p) => p.id === pId));
                  const perm = group?.permissions.find((p) => p.id === pId);
                  return <li key={pId} style={{ fontSize: '0.78rem', color: perm?.sensitive ? 'var(--danger)' : 'var(--text-secondary)' }}>{perm?.label ?? pId}</li>;
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      {formTarget && (
        <RoleFormModal
          role={formTarget === 'new' ? null : formTarget}
          actorEmployeeId={employee.id}
          supplierId={supplier.id}
          onClose={() => setFormTarget(null)}
          onDone={async () => { setFormTarget(null); await reload(); }}
        />
      )}
    </div>
  );
}
