import { useEffect, useState } from 'react';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';
import Modal from '../../../components/ui/Modal';
import EmptyState from '../../../components/ui/EmptyState';
import { useSupplierSession } from '../session/SupplierSessionContext';
import { getEmployees, addEmployee } from '../data/mockSupplierDb';

/** Sub-account capabilities a supplier can grant (spec §2: "إدارة المنتجات، المخزون، التجهيز، والمحاسبة"). */
const PERMISSION_OPTIONS = [
  { value: 'products', label: 'المنتجات' },
  { value: 'inventory', label: 'المخزون' },
  { value: 'fulfillment', label: 'التجهيز' },
  { value: 'accounting', label: 'المحاسبة' },
];

function permissionLabels(permissions) {
  return permissions.map((p) => PERMISSION_OPTIONS.find((o) => o.value === p)?.label ?? p).join('، ') || '—';
}

const EMPTY_FORM = { name: '', role: '', permissions: [] };

/**
 * Spec §2 / §14 page #11: sub-accounts for a supplier's staff, each with
 * a scoped set of permissions. Sensitive actions elsewhere in the portal
 * are meant to be attributed to the employee who performed them
 * (mockSupplierDb's `actorName` on every mutating call feeds that).
 */
export default function SupplierEmployeesPage() {
  const { supplier, employee: currentEmployee } = useSupplierSession();
  const [employees, setEmployees] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const reload = () => getEmployees(supplier.id).then(setEmployees);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id]);

  const togglePermission = (value) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(value) ? f.permissions.filter((p) => p !== value) : [...f.permissions, value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    await addEmployee({
      supplierId: supplier.id,
      name: form.name.trim(),
      role: form.role.trim(),
      permissions: form.permissions,
      actorName: currentEmployee.name,
    });
    setForm(EMPTY_FORM);
    setModalOpen(false);
    reload();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-text-primary">الموظفون والصلاحيات</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-bold text-white"
        >
          إضافة موظف
        </button>
      </div>

      {employees === null ? null : employees.length === 0 ? (
        <EmptyState title="لا يوجد موظفون بعد" message="أضف موظفين لمنحهم صلاحيات محددة على المنتجات، المخزون، التجهيز، أو المحاسبة." />
      ) : (
        <Table
          columns={[
            {
              key: 'name',
              header: 'الاسم',
              render: (row) => (
                <span className="flex items-center gap-2 font-bold">
                  {row.name}
                  {row.id === currentEmployee.id && <Badge variant="brand">أنت</Badge>}
                </span>
              ),
            },
            { key: 'role', header: 'المسمى الوظيفي' },
            { key: 'permissions', header: 'الصلاحيات', render: (row) => permissionLabels(row.permissions) },
          ]}
          rows={employees}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="إضافة موظف">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-bold text-text-primary">
            الاسم
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-md border border-border-default px-3 py-2 text-sm font-normal text-text-primary"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold text-text-primary">
            المسمى الوظيفي
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="مثال: مسؤول تجهيز"
              className="rounded-md border border-border-default px-3 py-2 text-sm font-normal text-text-primary"
            />
          </label>
          <div>
            <div className="mb-2 text-sm font-bold text-text-primary">الصلاحيات</div>
            <div className="flex flex-wrap gap-2">
              {PERMISSION_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold ${
                    form.permissions.includes(opt.value)
                      ? 'border-brand-navy bg-brand-navy text-white'
                      : 'border-border-default text-text-secondary'
                  }`}
                >
                  <input type="checkbox" className="hidden" checked={form.permissions.includes(opt.value)} onChange={() => togglePermission(opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="rounded-md bg-brand-navy px-4 py-2.5 text-sm font-bold text-white">حفظ</button>
        </form>
      </Modal>
    </div>
  );
}
