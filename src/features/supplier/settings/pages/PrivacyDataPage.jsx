import { useState } from 'react';
import { Download } from 'lucide-react';
import { NoAccess, formatDateTime } from '../SettingsShared';
import { exportSupplierData, updateSupplierSettings, createTicket } from '../../data/mockSupplierDb';
import { useToast } from '../../ui/SupplierToast';

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PrivacyDataPage({ supplier, employee, hasPermission }) {
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [requesting, setRequesting] = useState(null);
  const canExport = hasPermission('settings.export_data');

  if (!canExport) return <NoAccess label="صفحة الخصوصية والبيانات" />;

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportSupplierData({ supplierId: supplier.id, actorEmployeeId: employee.id });
      downloadJson(`بيانات-${supplier.companyName}.json`, data);
      showToast('لا يتضمن هذا التصدير أي بيانات تاجر أو عميل محجوبة');
    } finally {
      setExporting(false);
    }
  };

  const handleConsentToggle = async () => {
    await updateSupplierSettings({ supplierId: supplier.id, patch: { dataDisclosureConsent: !supplier.dataDisclosureConsent }, actorName: employee.name });
    showToast('تم تحديث موافقتك على الرسائل غير التشغيلية');
  };

  const handleRequest = async (kind) => {
    setRequesting(kind);
    try {
      await createTicket({
        supplierId: supplier.id, subject: kind === 'correction' ? 'طلب تصحيح بيانات' : 'طلب حذف بيانات',
        relatedType: 'privacy', relatedId: supplier.id, reason: kind, message: `طلب ${kind === 'correction' ? 'تصحيح' : 'حذف'} بيانات من صفحة الخصوصية`, actorName: employee.name,
      });
      showToast('تم إرسال طلبك إلى إدارة مدرار');
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="panel">
        <div className="panel-head"><div><h3>البيانات التي تحتفظ بها مدرار</h3></div></div>
        <p style={{ padding: '0 22px 20px', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          تحتفظ مدرار ببيانات ملفك العام وبيانات التواصل ومواقع التجهيز والوثائق والسجلات المالية والتشغيلية الخاصة بمؤسستك،
          وسجل نشاط فريقك، للمدة اللازمة تشغيليًا وقانونيًا. لا تُحذف السجلات المالية أو الوثائق المطلوبة قانونيًا حتى بعد إغلاق الحساب.
        </p>
        <div className="panel-foot" style={{ justifyContent: 'flex-start' }}>
          <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} disabled={exporting} onClick={handleExport}>
            <Download size={14} /> {exporting ? '...' : 'تنزيل نسخة من بيانات مؤسستي'}
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><div><h3>الموافقات</h3></div></div>
        <div className="toggle-row" style={{ margin: '0 22px 20px' }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>استقبال رسائل غير تشغيلية (عروض، تحديثات المنصة)</div>
          <button type="button" className={`toggle-switch${supplier.dataDisclosureConsent ? ' on' : ''}`} onClick={handleConsentToggle} aria-pressed={supplier.dataDisclosureConsent}><span className="knob" /></button>
        </div>
        <div className="simple-list">
          {(supplier.termsAcceptances ?? []).map((t) => (
            <div key={t.id} className="simple-row">
              <div className="txt"><div className="t">{t.label} — الإصدار {t.version}</div><div className="s">تمت الموافقة في {formatDateTime(t.acceptedAt)}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><div><h3>طلبات البيانات</h3></div></div>
        <div className="panel-foot" style={{ justifyContent: 'flex-start', gap: 8 }}>
          <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} disabled={requesting === 'correction'} onClick={() => handleRequest('correction')}>طلب تصحيح بيانات قانونية</button>
          <button type="button" className="btn btn-secondary btn-sm" style={{ width: 'auto' }} disabled={requesting === 'deletion'} onClick={() => handleRequest('deletion')}>طلب حذف بيانات غير ملزمة بالحفظ</button>
        </div>
      </div>
    </div>
  );
}
