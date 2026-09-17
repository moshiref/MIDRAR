import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Logo from '../../../components/ui/Logo';
import { loadApplications } from '../../../lib/applicationsStorage';

/**
 * Closes the loop with src/features/open-store/OpenStorePage.jsx's
 * supplier registration wizard: a supplier account isn't activated until
 * mدرار's team approves the application (spec §2 — "لا يُفعّل حساب
 * المورد إلا بعد موافقة إدارة مدرار"), and there's no admin portal in
 * this project yet to do that approval. So for now this just looks the
 * submission up by its reference number and shows the (always-pending)
 * status, rather than pretending sign-in is possible before approval.
 */
export default function SupplierApplicationStatusPage() {
  const [ref, setRef] = useState('');
  const [searched, setSearched] = useState(false);
  const [application, setApplication] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalized = ref.trim().toUpperCase();
    const found = loadApplications().find((app) => app.type === 'supplier' && app.ref.toUpperCase() === normalized);
    setApplication(found ?? null);
    setSearched(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6" dir="rtl">
      <Card className="w-full max-w-sm">
        <div className="mb-6"><Logo /></div>
        <h1 className="mb-1 text-lg font-extrabold text-text-primary">حالة طلب الانضمام كمورد</h1>
        <p className="mb-6 text-sm text-text-secondary">
          أدخل الرقم المرجعي اللي وصلك بعد إرسال طلبك (يبدأ بـ MD-SUP).
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="MD-SUP-123456"
            className="rounded-md border border-border-default px-3 py-2 text-sm text-text-primary en"
            dir="ltr"
          />
          <button type="submit" className="rounded-md bg-brand-navy px-4 py-2.5 text-sm font-bold text-white">
            تحقق من الحالة
          </button>
        </form>

        {searched && (
          <div className="mt-5 rounded-md border border-border-default p-4">
            {application ? (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary en" dir="ltr">{application.ref}</span>
                  <Badge variant="warning">قيد المراجعة</Badge>
                </div>
                <p className="text-sm text-text-secondary">
                  لا يُفعّل حساب المورد إلا بعد موافقة إدارة مدرار. رح نتواصل معك على الرقم اللي سجّلته فور اعتماد الطلب.
                </p>
              </>
            ) : (
              <p className="text-sm text-danger">ما لقينا طلب بهاد الرقم المرجعي. تأكد من الرقم وحاول مرة ثانية.</p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-between text-xs font-bold">
          <Link to="/supplier/sign-in" className="text-brand-blue">عندي حساب مفعّل</Link>
          <Link to="/open-store" className="text-brand-blue">ما قدّمت طلب بعد</Link>
        </div>
      </Card>
    </div>
  );
}
