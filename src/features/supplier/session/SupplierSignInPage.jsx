import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getSuppliers, getEmployees } from '../data/mockSupplierDb';
import { useSupplierSession } from './SupplierSessionContext';
import Card from '../../../components/ui/Card';
import Logo from '../../../components/ui/Logo';

/**
 * Mock sign-in: there's no real auth yet, so this just lets you pick one
 * of the seeded suppliers and one of its employees, then calls
 * SupplierSessionContext's `signIn`. Redirects back to whatever
 * `/supplier/*` route the guard bounced the user from.
 */
export default function SupplierSignInPage() {
  const { status, signIn } = useSupplierSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [employeesBySupplier, setEmployeesBySupplier] = useState({});
  const [supplierId, setSupplierId] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSuppliers().then(async (list) => {
      const map = {};
      await Promise.all(list.map(async (s) => {
        map[s.id] = await getEmployees(s.id);
      }));
      if (cancelled) return;
      setSuppliers(list);
      setEmployeesBySupplier(map);
      setSupplierId(list[0]?.id ?? '');
      setEmployeeId(map[list[0]?.id]?.[0]?.id ?? '');
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (status === 'signed-in') {
      navigate(location.state?.from?.pathname ?? '/supplier', { replace: true });
    }
  }, [status, navigate, location.state]);

  const employees = employeesBySupplier[supplierId] ?? [];

  const handleSupplierChange = (id) => {
    setSupplierId(id);
    setEmployeeId(employeesBySupplier[id]?.[0]?.id ?? '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (supplierId && employeeId) signIn(supplierId, employeeId);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6" dir="rtl">
      <Card className="w-full max-w-sm">
        <div className="mb-6"><Logo /></div>
        <h1 className="mb-1 text-lg font-extrabold text-text-primary">دخول لوحة المورد</h1>
        <p className="mb-6 text-sm text-text-secondary">
          لا يوجد نظام مصادقة حقيقي بعد — هاد دخول تجريبي يسمح لك تختار حساب مورد وموظف من البيانات التجريبية.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-bold text-text-primary">
            المورد
            <select
              value={supplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="rounded-md border border-border-default px-3 py-2 text-sm text-text-primary"
            >
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold text-text-primary">
            الموظف
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="rounded-md border border-border-default px-3 py-2 text-sm text-text-primary"
            >
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} — {emp.role}</option>)}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            disabled={!supplierId || !employeeId}
          >
            دخول
          </button>
        </form>
        <div className="mt-6 text-center text-xs font-bold">
          <Link to="/supplier/application-status" className="text-brand-blue">قدّمت طلب انضمام ولسا ما فعّلنا حسابك؟ تحقق من الحالة</Link>
        </div>
      </Card>
    </div>
  );
}
