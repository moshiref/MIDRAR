import logoFull from '../../assets/logo-full.png';

export default function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <img src={logoFull} alt="مدرار" />
            <p>البنية التشغيلية التي تجمع التجار والموردين وشركات التوصيل ضمن منظومة تجارة إلكترونية واحدة.</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <h4>الشركة</h4>
              <a href="#">عن مدرار</a>
              <a href="#how">كيف تعمل</a>
              <a href="#faq">الأسئلة الشائعة</a>
              <a href="#contact">تواصل معنا</a>
            </div>
            <div className="footer-col">
              <h4>الانضمام</h4>
              <a href="#merchants">للتجار</a>
              <a href="#suppliers">للموردين</a>
              <a href="#">القطاعات</a>
            </div>
            <div className="footer-col">
              <h4>قانوني</h4>
              <a href="#">سياسة الخصوصية</a>
              <a href="#">الشروط والأحكام</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 مدرار. جميع الحقوق محفوظة.</span>
          <span className="en">MIDRAR</span>
        </div>
      </div>
    </footer>
  );
}
