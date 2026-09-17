import logoMark from '../../../assets/logo-mark.png';
import Button from '../../../components/ui/Button';

export default function FinalCta() {
  return (
    <section id="contact">
      <div className="wrap">
        <div className="final-cta reveal">
          <img className="logo-watermark wm-cta" src={logoMark} alt="" />
          <h2 className="h1">جاهز تبدأ تجارتك؟</h2>
          <p>قدّم طلب فتح متجرك على مدرار، وابدأ الخطوة الأولى نحو بناء تجارتك الإلكترونية.</p>
          <div className="hero-actions">
            <Button
              href="#open-store"
              variant="primary"
              size="lg"
              style={{ background: '#fff', color: 'var(--brand-navy)' }}
            >
              افتح متجرك الآن
            </Button>
            <Button href="#supplier-registration" variant="ghost-inverse" size="lg">سجّل كمورد</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
