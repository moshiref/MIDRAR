import { useState } from 'react';

const STEPS = [
  { n: '01', title: 'قدّم طلب فتح متجرك', body: 'عبّي معلوماتك الأساسية وفكرة متجرك، ومدرار بتراجع طلبك خلال وقت قصير.' },
  { n: '02', title: 'أنشئ هويتك', body: 'اسم المتجر، الشعار، والألوان الخاصة فيك.' },
  { n: '03', title: 'اختر منتجاتك', body: 'من شبكة موردين معتمدين ضمن قطاعات متعددة.' },
  { n: '04', title: 'حدد أسعارك', body: 'حدد هامش ربحك فوق تكلفة المنتج بكل حرية.' },
  { n: '05', title: 'ابدأ البيع', body: 'انشر متجرك وابدأ استقبال الطلبات فورًا.' },
  { n: '06', title: 'أكد طلبات العملاء', body: 'راجع كل طلب وأكده قبل ما يدخل مرحلة التجهيز.' },
  { n: '07', title: 'التوريد والتنفيذ والتوصيل', body: 'مدرار تتابع كل هالمراحل نيابة عنك لحظة بلحظة.' },
  { n: '08', title: 'تابع أرباحك', body: 'راقب أداء متجرك وأرباحك من لوحة واحدة واضحة.' },
];

/**
 * Faithful port of the interactive `.t-item` timeline: clicking any step
 * focuses it (`.active`), replacing the original's manual
 * classList.remove/add dance across all `.t-item`s with a single
 * `activeIndex` state value. The first step is active by default,
 * exactly like the original markup.
 */
export default function HowItWorksTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="ecosystem" id="how">
      <div className="wrap">
        <div className="section-head center reveal">
          <span className="label">آلية العمل</span>
          <h2 className="h1">من فكرة المتجر إلى أول طلب</h2>
        </div>
        <div className="timeline reveal">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`t-item${activeIndex === i ? ' active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveIndex(i)}
            >
              <div className="node en">{step.n}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
