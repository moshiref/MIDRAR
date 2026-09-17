import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import { useWizardForm } from '../../components/forms/useWizardForm';
import { ProgressBar, TextField, SelectField, ChoiceGroup, TagSelect, StepActions, SuccessCard } from '../../components/forms/WizardFields';
import PartnerTermsSection, { PARTNER_TERMS_VERSION } from '../../components/forms/PartnerTermsSection';
import { genRef, saveApplication } from '../../lib/applicationsStorage';
import './OpenStorePage.css';

/**
 * The /open-store flow: a merchant "open your store" application wizard
 * and a supplier registration wizard, toggled by the pill switch at the
 * top. Ported from the standalone midrar-open-store.html mockup — same
 * steps, same validation rules (only fields wrapped as "required" in the
 * original are enforced; a couple of asterisked fields, like supplier
 * "sectors", were visual-only in the source and stay that way here),
 * same localStorage submission format, so anything already reading
 * `midrar_applications_v1` keeps working.
 */

const CITY_OPTIONS = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'درعا', 'السويداء', 'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'القنيطرة',
];
const SUPPLIER_CITY_OPTIONS = ['دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس'];
const SECTOR_OPTIONS = ['أثاث وديكور منزلي', 'أزياء وإكسسوارات', 'إلكترونيات', 'عناية وجمال', 'مستلزمات أطفال', 'مواد غذائية', 'أخرى'];
const CHANNEL_OPTIONS = ['Facebook', 'Instagram', 'TikTok', 'Google', 'WhatsApp', 'عملاء حاليون', 'أخرى'];
const CURRENT_ACTIVITY_OPTIONS = [
  { value: 'none', label: 'أبدأ من الصفر' },
  { value: 'social', label: 'أبيع عبر وسائل التواصل' },
  { value: 'online', label: 'لدي متجر إلكتروني' },
  { value: 'physical', label: 'لدي محل / نشاط قائم' },
];
const EXPERIENCE_OPTIONS = [
  { value: 'none', label: 'لا توجد' },
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
];
const ACTIVITY_TYPE_OPTIONS = [
  { value: 'factory', label: 'مصنع' },
  { value: 'importer', label: 'مستورد' },
  { value: 'distributor', label: 'موزع' },
  { value: 'wholesaler', label: 'تاجر جملة' },
  { value: 'local', label: 'منتج محلي' },
  { value: 'other', label: 'أخرى' },
];
const SUPPLIER_SECTOR_OPTIONS = ['أثاث', 'أزياء', 'إلكترونيات', 'عناية وجمال', 'مستلزمات أطفال', 'مواد غذائية'];
const ASSET_OPTIONS = ['صور منتجات', 'فيديوهات', 'قائمة أسعار'];

const ROUTE_COPY = {
  merchant: {
    eyebrow: 'ابدأ رحلتك',
    title: 'ابدأ رحلتك التجارية مع مدرار',
    sub: 'أرسل لنا معلوماتك الأساسية وفكرة متجرك، وسيقوم فريق مدرار بمراجعة طلبك والتواصل معك لاستكمال خطوات الانضمام.',
  },
  supplier: {
    eyebrow: 'ابدأ رحلتك',
    title: 'وسّع قنوات بيع منتجاتك مع مدرار',
    sub: 'إذا كنت مصنعًا أو مستوردًا أو موزعًا أو تاجر جملة، قدّم طلبك للانضمام إلى شبكة موردي مدرار.',
  },
};

const MERCHANT_REQUIRED = { 1: ['fullName', 'phone', 'city'], 2: ['storeName', 'sector'], 3: [], 4: [] };
const MERCHANT_INITIAL = {
  fullName: '', phone: '', whatsapp: '', email: '', city: '',
  storeName: '', sector: '', currentActivity: 'none',
  experience: 'none', channels: [],
  links: '', notes: '', consent: false, termsAccepted: false,
};

function MerchantWizard() {
  const w = useWizardForm({
    totalSteps: 4,
    requiredByStep: MERCHANT_REQUIRED,
    initialData: MERCHANT_INITIAL,
    canSubmit: (d) => d.consent && d.termsAccepted,
    onSubmit: (data) => {
      const ref = genRef('MD-APP');
      saveApplication({
        id: Date.now(),
        type: 'merchant',
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        ref,
        fields: { ...data, termsVersion: PARTNER_TERMS_VERSION, termsAcceptedAt: new Date().toISOString() },
      });
      return { ref };
    },
  });
  const { step, data, invalidFields, submitted, result, setField, toggleListField, goNext, goPrev, submit } = w;
  const invalid = (name) => invalidFields.has(name);
  const [termsError, setTermsError] = useState('');

  const handleSubmit = (e) => {
    if (!data.termsAccepted) {
      e.preventDefault();
      setTermsError('يرجى الموافقة على شروط وأحكام شركاء منصة مدرار للمتابعة.');
      return;
    }
    setTermsError('');
    submit(e);
  };

  if (submitted) {
    return (
      <SuccessCard
        title="تم استلام طلبك بنجاح"
        message="رح يراجع فريق مدرار طلبك ويتواصل معك قريبًا لاستكمال باقي خطوات الانضمام."
        refLabel="رقم مرجعي"
        reference={result?.ref}
      />
    );
  }

  return (
    <>
      <ProgressBar labels={['معلوماتك', 'مشروعك', 'خبرتك', 'تفاصيل إضافية']} total={4} step={step} />
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step active">
            <h3>معلوماتك</h3>
            <div className="step-sub">خلينا نتعرف عليك أول شي</div>
            <div className="field-grid">
              <TextField label="الاسم الكامل *" name="fullName" type="text" value={data.fullName} onChange={(v) => setField('fullName', v)} invalid={invalid('fullName')} required />
              <TextField label="رقم الهاتف *" name="phone" type="tel" className="en" dir="ltr" value={data.phone} onChange={(v) => setField('phone', v)} invalid={invalid('phone')} required />
              <TextField label="واتساب" optional="(إذا مختلف)" name="whatsapp" type="tel" className="en" dir="ltr" value={data.whatsapp} onChange={(v) => setField('whatsapp', v)} />
              <TextField label="البريد الإلكتروني" name="email" type="email" className="en" dir="ltr" value={data.email} onChange={(v) => setField('email', v)} />
              <SelectField label="المحافظة / المدينة *" name="city" value={data.city} onChange={(v) => setField('city', v)} options={CITY_OPTIONS} placeholder="اختر المحافظة" invalid={invalid('city')} required errorText="اختر محافظتك" full />
            </div>
            <StepActions onNext={goNext} />
          </div>
        )}

        {step === 2 && (
          <div className="form-step active">
            <h3>مشروعك</h3>
            <div className="step-sub">احكيلنا عن المتجر يلي حابب تفتحه</div>
            <div className="field-grid">
              <TextField label="اسم المتجر المقترح *" name="storeName" type="text" full value={data.storeName} onChange={(v) => setField('storeName', v)} invalid={invalid('storeName')} required />
              <SelectField label="القطاع الذي ترغب بالعمل فيه *" name="sector" value={data.sector} onChange={(v) => setField('sector', v)} options={SECTOR_OPTIONS} placeholder="اختر القطاع" invalid={invalid('sector')} required errorText="اختر القطاع" full />
            </div>
            <label className="step-label">هل لديك نشاط حالي؟</label>
            <ChoiceGroup name="currentActivity" options={CURRENT_ACTIVITY_OPTIONS} value={data.currentActivity} onChange={(v) => setField('currentActivity', v)} />
            <StepActions onPrev={goPrev} onNext={goNext} />
          </div>
        )}

        {step === 3 && (
          <div className="form-step active">
            <h3>خبرتك</h3>
            <div className="step-sub">هاد بيساعدنا نجهز لك الدعم المناسب</div>
            <label className="step-label">خبرتك بالتجارة الإلكترونية</label>
            <ChoiceGroup name="experience" options={EXPERIENCE_OPTIONS} value={data.experience} onChange={(v) => setField('experience', v)} />
            <label className="step-label">كيف تخطط لجذب العملاء؟</label>
            <TagSelect name="channels" options={CHANNEL_OPTIONS} values={data.channels} onToggle={(v) => toggleListField('channels', v)} />
            <StepActions onPrev={goPrev} onNext={goNext} />
          </div>
        )}

        {step === 4 && (
          <div className="form-step active">
            <h3>تفاصيل إضافية</h3>
            <div className="step-sub">آخر خطوة قبل الإرسال</div>
            <TextField label="روابط صفحاتك الحالية" optional="(اختياري)" name="links" type="text" className="en" dir="ltr" placeholder="instagram.com/yourstore" value={data.links} onChange={(v) => setField('links', v)} />
            <div className="field">
              <label>ملاحظات <span className="opt">(اختياري)</span></label>
              <textarea rows={3} name="notes" value={data.notes} onChange={(e) => setField('notes', e.target.value)} />
            </div>
            <PartnerTermsSection
              accepted={data.termsAccepted}
              onAcceptedChange={(v) => { setField('termsAccepted', v); setTermsError(''); }}
              error={termsError}
              checkboxId="merchantTerms"
            />
            <div className="consent-row">
              <input type="checkbox" id="merchantConsent" checked={data.consent} onChange={(e) => setField('consent', e.target.checked)} />
              <label htmlFor="merchantConsent">أوافق على مشاركة معلوماتي مع فريق مدرار للتواصل معي بخصوص طلب فتح المتجر.</label>
            </div>
            <StepActions onPrev={goPrev} submitLabel="إرسال طلب فتح المتجر" submitDisabled={!data.consent || !data.termsAccepted} />
          </div>
        )}
      </form>
    </>
  );
}

const SUPPLIER_REQUIRED = { 1: ['fullName', 'phone', 'companyName', 'city'], 2: [], 3: [] };
const SUPPLIER_INITIAL = {
  fullName: '', phone: '', whatsapp: '', email: '', companyName: '', city: '', activityType: 'factory',
  sectors: [], productTypes: '', productCount: '', prepTime: 'أقل من يوم',
  hasStock: 'نعم', hasWarehouse: 'نعم', canUpdateStock: 'نعم', canPrepDaily: 'نعم',
  assets: [], notes: '', consent: false, termsAccepted: false,
};

function SupplierWizard() {
  const w = useWizardForm({
    totalSteps: 3,
    requiredByStep: SUPPLIER_REQUIRED,
    initialData: SUPPLIER_INITIAL,
    canSubmit: (d) => d.consent && d.termsAccepted,
    onSubmit: (data) => {
      const ref = genRef('MD-SUP');
      saveApplication({
        id: Date.now(),
        type: 'supplier',
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        ref,
        fields: { ...data, termsVersion: PARTNER_TERMS_VERSION, termsAcceptedAt: new Date().toISOString() },
      });
      return { ref };
    },
  });
  const { step, data, invalidFields, submitted, result, setField, toggleListField, goNext, goPrev, submit } = w;
  const invalid = (name) => invalidFields.has(name);
  const [termsError, setTermsError] = useState('');

  const handleSubmit = (e) => {
    if (!data.termsAccepted) {
      e.preventDefault();
      setTermsError('يرجى الموافقة على شروط وأحكام شركاء منصة مدرار للمتابعة.');
      return;
    }
    setTermsError('');
    submit(e);
  };

  if (submitted) {
    return (
      <SuccessCard
        title="تم استلام طلبك بنجاح"
        message="رح يراجع فريق مدرار طلبك ويتواصل معك قريبًا لاستكمال باقي خطوات الانضمام كمورد."
        refLabel="رقم مرجعي"
        reference={result?.ref}
      />
    );
  }

  return (
    <>
      <ProgressBar labels={['النشاط', 'المنتجات', 'التشغيل']} total={3} step={step} />
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step active">
            <h3>معلومات النشاط</h3>
            <div className="step-sub">عرّفنا على نشاطك التجاري</div>
            <div className="field-grid">
              <TextField label="الاسم الكامل *" name="fullName" type="text" value={data.fullName} onChange={(v) => setField('fullName', v)} invalid={invalid('fullName')} required />
              <TextField label="الهاتف *" name="phone" type="tel" className="en" dir="ltr" value={data.phone} onChange={(v) => setField('phone', v)} invalid={invalid('phone')} required />
              <TextField label="واتساب" name="whatsapp" type="tel" className="en" dir="ltr" value={data.whatsapp} onChange={(v) => setField('whatsapp', v)} />
              <TextField label="البريد الإلكتروني" name="email" type="email" className="en" dir="ltr" value={data.email} onChange={(v) => setField('email', v)} />
              <TextField label="اسم الشركة / النشاط *" name="companyName" type="text" value={data.companyName} onChange={(v) => setField('companyName', v)} invalid={invalid('companyName')} required />
              <SelectField label="المحافظة / المدينة *" name="city" value={data.city} onChange={(v) => setField('city', v)} options={SUPPLIER_CITY_OPTIONS} placeholder="اختر المحافظة" invalid={invalid('city')} required errorText="اختر محافظتك" />
            </div>
            <label className="step-label">نوع النشاط *</label>
            <ChoiceGroup name="activityType" options={ACTIVITY_TYPE_OPTIONS} value={data.activityType} onChange={(v) => setField('activityType', v)} />
            <StepActions onNext={goNext} />
          </div>
        )}

        {step === 2 && (
          <div className="form-step active">
            <h3>منتجاتك</h3>
            <div className="step-sub">شو نوعية المنتجات يلي بدك تعرضها؟</div>
            <label className="step-label">القطاعات *</label>
            <TagSelect name="sectors" options={SUPPLIER_SECTOR_OPTIONS} values={data.sectors} onToggle={(v) => toggleListField('sectors', v)} />
            <div className="field-grid">
              <TextField label="أنواع المنتجات" name="productTypes" type="text" full placeholder="مثال: كنب، طاولات، إضاءة" value={data.productTypes} onChange={(v) => setField('productTypes', v)} />
              <TextField label="عدد المنتجات التقريبي" name="productCount" type="text" className="en" dir="ltr" value={data.productCount} onChange={(v) => setField('productCount', v)} />
              <SelectField label="متوسط مدة التجهيز" name="prepTime" value={data.prepTime} onChange={(v) => setField('prepTime', v)} options={['أقل من يوم', '1-2 يوم', '3-5 أيام', 'أكثر من أسبوع']} />
            </div>
            <StepActions onPrev={goPrev} onNext={goNext} />
          </div>
        )}

        {step === 3 && (
          <div className="form-step active">
            <h3>جاهزية التشغيل</h3>
            <div className="step-sub">آخر خطوة قبل الإرسال</div>
            <div className="field-grid">
              <SelectField label="هل لديك مخزون جاهز؟" name="hasStock" value={data.hasStock} onChange={(v) => setField('hasStock', v)} options={['نعم', 'لا', 'جزئيًا']} />
              <SelectField label="هل لديك مستودع؟" name="hasWarehouse" value={data.hasWarehouse} onChange={(v) => setField('hasWarehouse', v)} options={['نعم', 'لا']} />
              <SelectField label="هل تستطيع تحديث المخزون يوميًا؟" name="canUpdateStock" value={data.canUpdateStock} onChange={(v) => setField('canUpdateStock', v)} options={['نعم', 'لا']} />
              <SelectField label="هل تستطيع تجهيز الطلبات يوميًا؟" name="canPrepDaily" value={data.canPrepDaily} onChange={(v) => setField('canPrepDaily', v)} options={['نعم', 'لا']} />
            </div>
            <label className="step-label">هل لديك:</label>
            <TagSelect name="assets" options={ASSET_OPTIONS} values={data.assets} onToggle={(v) => toggleListField('assets', v)} />
            <div className="field">
              <label>ملاحظات <span className="opt">(اختياري)</span></label>
              <textarea rows={3} name="notes" value={data.notes} onChange={(e) => setField('notes', e.target.value)} />
            </div>
            <PartnerTermsSection
              accepted={data.termsAccepted}
              onAcceptedChange={(v) => { setField('termsAccepted', v); setTermsError(''); }}
              error={termsError}
              checkboxId="supplierTerms"
            />
            <div className="consent-row">
              <input type="checkbox" id="supplierConsent" checked={data.consent} onChange={(e) => setField('consent', e.target.checked)} />
              <label htmlFor="supplierConsent">أوافق على مشاركة معلوماتي مع فريق مدرار للتواصل معي بخصوص طلب الانضمام كمورد.</label>
            </div>
            <StepActions onPrev={goPrev} submitLabel="إرسال طلب الانضمام كمورد" submitDisabled={!data.consent || !data.termsAccepted} />
          </div>
        )}
      </form>
    </>
  );
}

export default function OpenStorePage() {
  const [route, setRoute] = useState('merchant');
  const navigate = useNavigate();
  const copy = ROUTE_COPY[route];

  return (
    <div className="open-store-page">
      <header>
        <div className="nav">
          <Logo />
          <a className="back-link" href="/" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l-6 6 6 6M3 12h18" transform="scale(-1,1) translate(-24,0)" /></svg>
            رجوع للموقع
          </a>
        </div>
      </header>

      <div className="wrap">
        <div className="route-hero">
          <span className="eyebrow"><span className="en">MIDRAR</span> · {copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.sub}</p>
          <div className="route-toggle">
            <button type="button" className={route === 'merchant' ? 'active' : ''} onClick={() => setRoute('merchant')}>افتح متجرك</button>
            <button type="button" className={route === 'supplier' ? 'active' : ''} onClick={() => setRoute('supplier')}>سجّل كمورد</button>
          </div>
        </div>

        <div className="form-card">
          {route === 'merchant' ? <MerchantWizard /> : <SupplierWizard />}
        </div>
      </div>

      <footer>© 2026 مدرار — <span className="en">MIDRAR</span></footer>
    </div>
  );
}
