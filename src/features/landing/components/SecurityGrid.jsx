const CARDS = [
  { title: 'تشفير كامل للبيانات', body: 'كل جلسة وكل طلب API محمي بتشفير حديث من طرف لطرف.' },
  { title: 'صلاحيات دقيقة (RBAC)', body: 'كل مستخدم يشوف ويعدّل بس الصلاحيات المخصصة له بالضبط.' },
  { title: 'سجل تدقيق كامل', body: 'كل إجراء حساس موثّق بمن نفّذه ومتى وليش، بشكل غير قابل للتعديل.' },
  { title: 'عزل بيانات كامل', body: 'بيانات كل متجر ومورد معزولة تمامًا عن غيرها ضمن المنظومة.' },
  { title: 'مراقبة على مدار الساعة', body: 'فريق العمليات يراقب صحة الشبكة والتنبيهات الحرجة 24/7.' },
  { title: 'نسخ احتياطي وتعافي', body: 'بنية جاهزة للاسترجاع السريع بأي طارئ يحصل بالنظام.' },
];

export default function SecurityGrid() {
  return (
    <section id="security">
      <div className="wrap">
        <div className="section-head center reveal">
          <span className="label">الأمان والموثوقية</span>
          <h2 className="h1">بنية مبنية على معايير حماية حقيقية</h2>
        </div>
        <div className="sec-grid reveal">
          {CARDS.map((card) => (
            <div className="sec-card proximity" key={card.title}>
              <h4>{card.title}</h4>
              <p>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
