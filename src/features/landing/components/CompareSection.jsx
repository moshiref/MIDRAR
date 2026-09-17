import { CheckIcon, XIcon } from '../../../components/ui/icons';

const BAD_ITEMS = [
  'بدون متجر مستقل بهويتك',
  'تخزين وتوريد على مسؤوليتك بالكامل',
  'متابعة الطلبات يدويًا',
  'بدون تقارير أو أرقام واضحة',
];

const GOOD_ITEMS = [
  'متجر إلكتروني مستقل بهويتك أنت',
  'توريد ومخزون تدار خلف الكواليس',
  'تأكيد وتتبع الطلبات من لوحة واحدة',
  'تقارير مبيعات وأرباح لحظية',
];

export default function CompareSection() {
  return (
    <section id="compare">
      <div className="wrap">
        <div className="section-head center reveal">
          <span className="label">ليش هذا الفرق</span>
          <h2 className="h1">وقف تبني تجارتك بأدوات متفرقة</h2>
        </div>
        <div className="compare-grid reveal">
          <div className="compare-card old proximity">
            <h4>البيع التقليدي عبر السوشال ميديا</h4>
            <ul className="compare-list bad">
              {BAD_ITEMS.map((item) => (
                <li key={item}><XIcon strokeWidth={2.2} /> {item}</li>
              ))}
            </ul>
          </div>
          <div className="compare-card win proximity">
            <span className="win-badge">مدرار</span>
            <h4>مدرار</h4>
            <ul className="compare-list good">
              {GOOD_ITEMS.map((item) => (
                <li key={item}><CheckIcon strokeWidth={2.2} /> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
