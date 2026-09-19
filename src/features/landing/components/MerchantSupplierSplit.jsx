import { CheckIcon } from '../../../components/ui/icons';
import Button from '../../../components/ui/Button';

const MERCHANT_ITEMS = ['متجر إلكتروني مستقل', 'علامتك التجارية', 'اختيار المنتجات', 'إدارة الأسعار', 'إدارة الطلبات', 'تقارير المبيعات'];
const SUPPLIER_ITEMS = ['قنوات بيع إضافية', 'شبكة متاجر', 'إدارة المخزون', 'طلبات منظمة', 'تقارير الأداء', 'تسويات واضحة'];

export default function MerchantSupplierSplit() {
  return (
    <section id="merchants">
      <div className="wrap">
        <div className="split reveal">
          <div className="panel panel-merchant proximity">
            <div className="glow-blob"></div>
            <span className="panel-tag">للتجار</span>
            <h3>متجرك أنت. <br /> والبنية علينا.</h3>
            <p className="desc">مدرار تمنحك الأدوات والبنية التشغيلية التي تساعدك على بناء متجر إلكتروني مستقل وإدارته وتنميته من مكان واحد.</p>
            <ul className="feature-list">
              {MERCHANT_ITEMS.map((item) => (
                <li key={item}><CheckIcon size={15} stroke="var(--brand-teal-bright)" strokeWidth={2.4} /> {item}</li>
              ))}
            </ul>
            <Button href="/open-store" variant="ghost-inverse">انضم إلينا</Button>
          </div>
          <div className="panel panel-supplier proximity" id="suppliers">
            <span className="panel-tag">للموردين</span>
            <h3>منتجاتك أمام فرص بيع أكبر.</h3>
            <p className="desc">انضم إلى شبكة موردي مدرار، أدر منتجاتك ومخزونك من مكان واحد، ووصّل منتجاتك إلى شبكة من المتاجر دون الحاجة إلى إدارة كل متجر بشكل منفصل.</p>
            <ul className="feature-list">
              {SUPPLIER_ITEMS.map((item) => (
                <li key={item}><CheckIcon size={15} stroke="var(--brand-blue)" strokeWidth={2.4} /> {item}</li>
              ))}
            </ul>
            {/* TEMP routing while Supplier Dashboard is under review: sends
                to /supplier instead of the registration flow. Registration
                itself (SupplierWizard inside OpenStorePage.jsx) is untouched
                — point this back at it when asked to restore. */}
            <Button href="/supplier" variant="secondary">سجّل كمورد</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
