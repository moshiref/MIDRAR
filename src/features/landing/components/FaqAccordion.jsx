import { useState } from 'react';

const FAQS = [
  {
    q: 'شو الفرق بين مدرار وسوق إلكتروني عادي؟',
    a: 'مدرار مش سوق وسيط بيعرض منتجات لأصحابه — هي بنية تشغيلية بتخليك تفتح متجرك المستقل بهويتك، وبتتولى التوريد والتخزين والتوصيل من خلفك.',
  },
  {
    q: 'هل لازم يكون عندي مخزون قبل ما ابدأ؟',
    a: 'لا. بتقدر تبدأ البيع مباشرة من منتجات شبكة الموردين المعتمدين على مدرار دون ما تشتري أو تخزن شي مسبقًا.',
  },
  {
    q: 'كيف بتم عملية التوصيل والتحصيل؟',
    a: 'مدرار بتربط طلبك بشبكة توصيل متكاملة من لحظة تأكيد الطلب وحتى تسليمه للعميل، مع متابعة واضحة لحالة كل طلب.',
  },
  {
    q: 'إيمتى بقدر اسحب أرباحي؟',
    a: 'الأرباح بتصير متاحة للسحب بعد إتمام التوصيل وانتهاء فترة الإرجاع المحددة، وبتقدر تراقب رصيدك أول بأول من لوحة التاجر.',
  },
  {
    q: 'هل بقدر أنضم كمورد إذا كان عندي مخزون جاهز؟',
    a: 'أكيد. سجّل كمورد وقدّم معلومات نشاطك ومنتجاتك، وفريق مدرار بيراجع طلبك ويتواصل معك لاستكمال باقي الخطوات.',
  },
];

/**
 * Faithful port of the single-open FAQ accordion: clicking an already-open
 * question closes it; clicking any other question closes all and opens
 * only that one. `openIndex` (defaulting to 0, matching the original's
 * first `.faq-item.open`) replaces the original's classList dance.
 */
export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => {
    setOpenIndex((current) => (current === i ? -1 : i));
  };

  return (
    <section id="faq">
      <div className="wrap">
        <div className="section-head center reveal">
          <span className="label">الأسئلة الشائعة</span>
          <h2 className="h1">كل شي حابب تعرفه عن مدرار</h2>
        </div>
        <div className="faq-list reveal">
          {FAQS.map((faq, i) => (
            <div className={`faq-item proximity${openIndex === i ? ' open' : ''}`} key={faq.q}>
              <button className="faq-q" onClick={() => toggle(i)}>
                <span>{faq.q}</span>
                <span className="plus"></span>
              </button>
              <div className="faq-a"><p>{faq.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
