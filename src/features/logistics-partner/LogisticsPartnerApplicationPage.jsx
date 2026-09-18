import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import { useWizardForm } from '../../components/forms/useWizardForm';
import {
  ProgressBar, TextField, SelectField, ChoiceGroup, TagSelect, FileField, StepActions, SuccessCard,
} from '../../components/forms/WizardFields';
import PartnerTermsSection, { PARTNER_TERMS_VERSION } from '../../components/forms/PartnerTermsSection';
import { genRef, saveApplication } from '../../lib/applicationsStorage';
import '../../components/forms/wizardPage.css';

/**
 * /logistics-partner — application wizard for delivery companies that
 * want to become a MIDRAR logistics partner. Same architecture as
 * /open-store (useWizardForm + the shared WizardFields kit + the exact
 * same PartnerTermsSection used there), on the shared `.wizard-page`
 * scope so it looks like the same product without duplicating any CSS.
 *
 * No backend exists yet: there's no real phone/email OTP verification,
 * no real file upload (FileField just keeps the picked File's name/size
 * for display and gets serialized down before saving), and submissions
 * go to the same localStorage contract src/lib/applicationsStorage.js
 * already defines, just with `type: 'logistics-partner'` and a
 * `MD-LOG-######` reference prefix.
 */

const CITY_OPTIONS = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'درعا', 'السويداء', 'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'القنيطرة',
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'company', label: 'شركة توصيل' },
  { value: 'office', label: 'مؤسسة أو مكتب توصيل' },
  { value: 'individual', label: 'نشاط مزاولة فردي مرخّص' },
  { value: 'other', label: 'أخرى' },
];

const CONTACT_ROLE_OPTIONS = [
  { value: 'owner', label: 'مالك' },
  { value: 'manager', label: 'مدير' },
  { value: 'operations', label: 'مسؤول عمليات' },
  { value: 'signatory', label: 'مفوض بالتوقيع' },
  { value: 'other', label: 'أخرى' },
];

const PREFERRED_CONTACT_OPTIONS = [
  { value: 'call', label: 'اتصال هاتفي' },
  { value: 'sms', label: 'رسالة نصية' },
  { value: 'email', label: 'بريد إلكتروني' },
];

const SERVICE_TYPE_OPTIONS = ['داخل المدينة', 'بين المدن', 'بين المحافظات'];
const WORKING_DAY_OPTIONS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const SHIPMENT_SIZE_OPTIONS = ['صغيرة', 'متوسطة', 'كبيرة'];
const YES_NO_OPTIONS = [{ value: 'yes', label: 'نعم' }, { value: 'no', label: 'لا' }];
const CURRENCY_OPTIONS = ['الليرة السورية الجديدة', 'الدولار الأمريكي'];

const STEP_LABELS = ['الشركة', 'المسؤول', 'التغطية', 'الأسعار', 'التحصيل', 'الإقرارات', 'الموافقات'];
const TOTAL_STEPS = 7;

const REQUIRED_BY_STEP = {
  1: ['legalName', 'entityType', 'city', 'address', 'proofDocument'],
  2: ['contactName', 'contactRole', 'phone', 'email'],
  3: [
    'provinces', 'coverageAreas', 'serviceTypes', 'workingDays', 'workingHoursFrom', 'workingHoursTo',
    'pickupAvailable', 'dailyCapacity', 'deliveryDuration', 'shipmentSizes', 'returnToSupplier',
  ],
  4: ['currency', 'deliveryFeeExample', 'returnFeeExample'],
  5: [
    'collectSyp', 'collectUsd', 'separateCurrencyRecords', 'dailySettlementCommitment',
    'collectionOfficerName', 'collectionOfficerPhone',
  ],
  6: [],
  7: [],
};

const ACK_FIELDS = ['ackDataAccuracy', 'ackDriverAccounts', 'ackDocumentation', 'ackDataPrivacy', 'ackNoGuarantee'];
const REQUIRED_CONSENT_FIELDS = ['termsAccepted', 'privacyAccepted', 'operationalMessagesConsent'];

const INITIAL_DATA = {
  // 1. بيانات الشركة
  legalName: '', tradeName: '', entityType: '', city: '', address: '',
  proofDocument: null, licenseNumber: '', website: '',
  // 2. المسؤول المعتمد
  contactName: '', contactRole: '', phone: '', altPhone: '', email: '', preferredContact: '',
  // 3. التغطية والقدرة التشغيلية
  provinces: [], coverageAreas: '', serviceTypes: [], workingDays: [], workingHoursFrom: '', workingHoursTo: '',
  pickupAvailable: '', pickupAreas: '', dailyCapacity: '', deliveryDuration: '', shipmentSizes: [],
  maxWeight: '', excludedCategories: '', returnToSupplier: '', returnAreas: '',
  // 4. الأسعار المقترحة
  priceListFile: null, currency: '', deliveryFeeExample: '', returnFeeExample: '',
  extraFeesNotes: '', pricingDetails: '',
  // 5. التحصيل والتسوية
  collectSyp: '', collectUsd: '', separateCurrencyRecords: '', dailySettlementCommitment: '',
  collectionOfficerName: '', collectionOfficerPhone: '',
  // 6. إقرارات التشغيل
  ackDataAccuracy: false, ackDriverAccounts: false, ackDocumentation: false,
  ackDataPrivacy: false, ackNoGuarantee: false,
  // 7. الموافقات القانونية
  termsAccepted: false, privacyAccepted: false, operationalMessagesConsent: false, marketingConsent: false,
};

function AckCheckbox({ id, checked, onChange, children }) {
  return (
    <div className="consent-row">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>{children}</label>
    </div>
  );
}

export default function LogisticsPartnerApplicationPage() {
  const navigate = useNavigate();

  const w = useWizardForm({
    totalSteps: TOTAL_STEPS,
    requiredByStep: REQUIRED_BY_STEP,
    initialData: INITIAL_DATA,
    canSubmit: (d) => [...ACK_FIELDS, ...REQUIRED_CONSENT_FIELDS].every((key) => d[key]),
    onSubmit: (data) => {
      const ref = genRef('MD-LOG');
      const { proofDocument, priceListFile, ...rest } = data;
      saveApplication({
        id: Date.now(),
        type: 'logistics-partner',
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        ref,
        fields: {
          ...rest,
          proofDocument: proofDocument ? { name: proofDocument.name, size: proofDocument.size } : null,
          priceListFile: priceListFile ? { name: priceListFile.name, size: priceListFile.size } : null,
          termsVersion: PARTNER_TERMS_VERSION,
          termsAcceptedAt: new Date().toISOString(),
        },
      });
      return { ref };
    },
  });
  const { step, data, invalidFields, submitted, result, setField, toggleListField, goNext, goPrev, submit } = w;
  const invalid = (name) => invalidFields.has(name);

  const [ackError, setAckError] = useState('');

  const handleSubmit = (e) => {
    const missingAck = [...ACK_FIELDS, ...REQUIRED_CONSENT_FIELDS].some((key) => !data[key]);
    if (missingAck) {
      e.preventDefault();
      setAckError('يرجى الموافقة على كل الإقرارات والموافقات الإلزامية قبل الإرسال.');
      return;
    }
    setAckError('');
    submit(e);
  };

  if (submitted) {
    return (
      <div className="wizard-page">
        <PageHeader navigate={navigate} />
        <div className="wrap">
          <div className="form-card">
            <SuccessCard
              title="وصل طلبكم بنجاح"
              message={`رقم المتابعة: ${result?.ref}. سيراجعه فريق مدرار، وسنبلغ المسؤول المعتمد بالقرار أو بأي معلومات إضافية مطلوبة.`}
              refLabel="رقم المتابعة"
              reference={result?.ref}
            />
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="wizard-page">
      <PageHeader navigate={navigate} />

      <div className="wrap">
        <div className="route-hero">
          <span className="eyebrow"><span className="en">MIDRAR</span> · شريك لوجستي</span>
          <h1>طلب الانضمام إلى مدرار كشريك لوجستي</h1>
          <p>
            انضم إلى شبكة التوصيل في مدرار. راجع فريقنا الطلب، ثم يتواصل معكم لاستكمال إعداد مناطق الخدمة والأسعار
            واتفاقية التحصيل. الحقول المعلّمة بـ (*) إلزامية.
          </p>
        </div>

        <div className="form-card">
          <ProgressBar labels={STEP_LABELS} total={TOTAL_STEPS} step={step} />
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-step active">
                <h3>بيانات الشركة</h3>
                <div className="step-sub">عرّفنا على جهتكم</div>
                <div className="field-grid">
                  <TextField label="الاسم القانوني للشركة أو جهة المزاولة *" name="legalName" type="text" full value={data.legalName} onChange={(v) => setField('legalName', v)} invalid={invalid('legalName')} required />
                  <TextField label="الاسم التجاري الظاهر في التعاملات مع مدرار" optional="(إن اختلف)" name="tradeName" type="text" full value={data.tradeName} onChange={(v) => setField('tradeName', v)} />
                  <SelectField label="المحافظة التي يقع فيها المقر الرئيسي *" name="city" value={data.city} onChange={(v) => setField('city', v)} options={CITY_OPTIONS} placeholder="اختر المحافظة" invalid={invalid('city')} required errorText="اختر المحافظة" />
                  <TextField label="عنوان المقر *" name="address" type="text" value={data.address} onChange={(v) => setField('address', v)} invalid={invalid('address')} required />
                  <TextField label="رقم السجل أو الترخيص" optional="(إن وجد)" name="licenseNumber" type="text" className="en" dir="ltr" value={data.licenseNumber} onChange={(v) => setField('licenseNumber', v)} />
                  <TextField label="الموقع الإلكتروني أو صفحة العمل" optional="(إن وجدت)" name="website" type="text" className="en" dir="ltr" value={data.website} onChange={(v) => setField('website', v)} />
                </div>
                <label className="step-label">نوع الجهة *</label>
                <ChoiceGroup name="entityType" options={ENTITY_TYPE_OPTIONS} value={data.entityType} onChange={(v) => setField('entityType', v)} />
                <FileField
                  label="إثبات الشركة أو مزاولة العمل *"
                  name="proofDocument"
                  value={data.proofDocument}
                  onChange={(file) => setField('proofDocument', file)}
                  invalid={invalid('proofDocument')}
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  hint="PDF أو صورة (JPG/PNG)، بحجم أقصى 10 ميغابايت."
                />
                <StepActions onNext={goNext} />
              </div>
            )}

            {step === 2 && (
              <div className="form-step active">
                <h3>المسؤول المعتمد للتواصل</h3>
                <div className="step-sub">الشخص اللي رح يتواصل معه فريق مدرار بخصوص الطلب</div>
                <div className="field-grid">
                  <TextField label="الاسم الكامل للمسؤول *" name="contactName" type="text" value={data.contactName} onChange={(v) => setField('contactName', v)} invalid={invalid('contactName')} required />
                  <TextField label="رقم الهاتف السوري *" name="phone" type="tel" className="en" dir="ltr" value={data.phone} onChange={(v) => setField('phone', v)} invalid={invalid('phone')} required />
                  <TextField label="رقم هاتف بديل" optional="(اختياري)" name="altPhone" type="tel" className="en" dir="ltr" value={data.altPhone} onChange={(v) => setField('altPhone', v)} />
                  <TextField label="البريد الإلكتروني *" name="email" type="email" className="en" dir="ltr" value={data.email} onChange={(v) => setField('email', v)} invalid={invalid('email')} required />
                </div>
                <label className="step-label">الصفة الوظيفية *</label>
                <ChoiceGroup name="contactRole" options={CONTACT_ROLE_OPTIONS} value={data.contactRole} onChange={(v) => setField('contactRole', v)} />
                <label className="step-label">وسيلة التواصل المفضلة <span className="opt">(اختياري)</span></label>
                <ChoiceGroup name="preferredContact" options={PREFERRED_CONTACT_OPTIONS} value={data.preferredContact} onChange={(v) => setField('preferredContact', v)} />
                <div className="note-callout">
                  لا تُطلب هويات السائقين في نموذج الانضمام. بعد قبول الشركة، تُنشئ الشركة حسابات سائقيها بأسمائهم
                  وأرقام هواتفهم من لوحتها الخاصة وتبقى مسؤولة عن إدارتهم.
                </div>
                <StepActions onPrev={goPrev} onNext={goNext} />
              </div>
            )}

            {step === 3 && (
              <div className="form-step active">
                <h3>التغطية والقدرة التشغيلية</h3>
                <div className="step-sub">وين وكيف بتقدروا تشتغلوا</div>
                <label className="step-label">المحافظات التي تخدمونها حاليًا *</label>
                <TagSelect name="provinces" options={CITY_OPTIONS} values={data.provinces} onToggle={(v) => toggleListField('provinces', v)} />
                <div className="field">
                  <label>المدن والمناطق المخدومة داخل كل محافظة *</label>
                  <textarea rows={3} placeholder="اذكر أهم المدن/المناطق ضمن كل محافظة، أو أرفق قائمة لاحقًا إذا كانت التغطية واسعة." value={data.coverageAreas} onChange={(e) => setField('coverageAreas', e.target.value)} />
                  {invalid('coverageAreas') && <span className="err" style={{ display: 'block' }}>هاد الحقل مطلوب</span>}
                </div>
                <label className="step-label">نوع الخدمة *</label>
                <TagSelect name="serviceTypes" options={SERVICE_TYPE_OPTIONS} values={data.serviceTypes} onToggle={(v) => toggleListField('serviceTypes', v)} />
                <label className="step-label">أيام العمل *</label>
                <TagSelect name="workingDays" options={WORKING_DAY_OPTIONS} values={data.workingDays} onToggle={(v) => toggleListField('workingDays', v)} />
                <div className="field-grid">
                  <TextField label="ساعات العمل — من *" name="workingHoursFrom" type="time" className="en" dir="ltr" value={data.workingHoursFrom} onChange={(v) => setField('workingHoursFrom', v)} invalid={invalid('workingHoursFrom')} required />
                  <TextField label="ساعات العمل — إلى *" name="workingHoursTo" type="time" className="en" dir="ltr" value={data.workingHoursTo} onChange={(v) => setField('workingHoursTo', v)} invalid={invalid('workingHoursTo')} required />
                  <TextField label="متوسط عدد الشحنات يوميًا *" name="dailyCapacity" type="text" className="en" dir="ltr" placeholder="مثال: 40" value={data.dailyCapacity} onChange={(v) => setField('dailyCapacity', v)} invalid={invalid('dailyCapacity')} required />
                  <TextField label="الحد الأقصى للوزن" optional="(إن وجد)" name="maxWeight" type="text" className="en" dir="ltr" placeholder="مثال: 20 كغ" value={data.maxWeight} onChange={(v) => setField('maxWeight', v)} />
                </div>
                <label className="step-label">هل تتوفر خدمة استلام الشحنات من مواقع الموردين؟ *</label>
                <ChoiceGroup name="pickupAvailable" options={YES_NO_OPTIONS} value={data.pickupAvailable} onChange={(v) => setField('pickupAvailable', v)} />
                <TextField label="مناطق خدمة الاستلام" optional="(إن كانت متوفرة)" name="pickupAreas" type="text" full value={data.pickupAreas} onChange={(v) => setField('pickupAreas', v)} />
                <div className="field full">
                  <label>مدة التوصيل المعتادة حسب المنطقة *</label>
                  <textarea rows={3} placeholder="مثال: دمشق ومحيطها 1-2 يوم، باقي المحافظات 2-4 أيام..." value={data.deliveryDuration} onChange={(e) => setField('deliveryDuration', e.target.value)} />
                  {invalid('deliveryDuration') && <span className="err" style={{ display: 'block' }}>هاد الحقل مطلوب</span>}
                </div>
                <label className="step-label">أحجام الشحنات المقبولة *</label>
                <TagSelect name="shipmentSizes" options={SHIPMENT_SIZE_OPTIONS} values={data.shipmentSizes} onToggle={(v) => toggleListField('shipmentSizes', v)} />
                <TextField label="فئات المنتجات التي لا تنقلونها" optional="(اختياري)" name="excludedCategories" type="text" full value={data.excludedCategories} onChange={(v) => setField('excludedCategories', v)} />
                <label className="step-label">هل تتوفر خدمة إعادة الشحنات إلى المورد عند فشل التسليم أو قبول الإرجاع؟ *</label>
                <ChoiceGroup name="returnToSupplier" options={YES_NO_OPTIONS} value={data.returnToSupplier} onChange={(v) => setField('returnToSupplier', v)} />
                <TextField label="مناطق خدمة الإعادة" optional="(إن كانت مختلفة)" name="returnAreas" type="text" full value={data.returnAreas} onChange={(v) => setField('returnAreas', v)} />
                <StepActions onPrev={goPrev} onNext={goNext} />
              </div>
            )}

            {step === 4 && (
              <div className="form-step active">
                <h3>الأسعار المقترحة</h3>
                <div className="step-sub">ارفع لائحة أسعار أولية أو عبّي الحقول التالية</div>
                <FileField
                  label="لائحة أسعار أولية"
                  optional="(اختياري إذا عبّيت الحقول تحت)"
                  name="priceListFile"
                  value={data.priceListFile}
                  onChange={(file) => setField('priceListFile', file)}
                  accept=".pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png"
                  hint="PDF أو Excel أو صورة، بحجم أقصى 10 ميغابايت."
                />
                <div className="field-grid">
                  <SelectField label="العملة *" name="currency" value={data.currency} onChange={(v) => setField('currency', v)} options={CURRENCY_OPTIONS} placeholder="اختر العملة" invalid={invalid('currency')} required errorText="اختر العملة" />
                  <TextField label="أجرة التوصيل إلى العميل (مثال) *" name="deliveryFeeExample" type="text" value={data.deliveryFeeExample} onChange={(v) => setField('deliveryFeeExample', v)} invalid={invalid('deliveryFeeExample')} required />
                  <TextField label="أجرة إعادة الشحنة عند فشل التسليم *" name="returnFeeExample" type="text" full value={data.returnFeeExample} onChange={(v) => setField('returnFeeExample', v)} invalid={invalid('returnFeeExample')} required />
                </div>
                <div className="field full">
                  <label>رسوم إضافية وشروط تطبيقها <span className="opt">(اختياري)</span></label>
                  <textarea rows={2} value={data.extraFeesNotes} onChange={(e) => setField('extraFeesNotes', e.target.value)} />
                </div>
                <div className="field full">
                  <label>تفاصيل الأسعار حسب المحافظة/المنطقة والوزن أو الحجم <span className="opt">(اختياري إذا رفعت لائحة الأسعار)</span></label>
                  <textarea rows={3} value={data.pricingDetails} onChange={(e) => setField('pricingDetails', e.target.value)} />
                </div>
                <div className="note-callout">
                  <strong>ملاحظة:</strong> الأسعار المقترحة لا تصبح نافذة تلقائيًا؛ تراجعها إدارة مدرار وتعتمدها قبل
                  إسناد الطلبات. لا يجوز تحصيل أي مبلغ من العميل غير ظاهر في تفاصيل الطلب المعتمد.
                </div>
                <StepActions onPrev={goPrev} onNext={goNext} />
              </div>
            )}

            {step === 5 && (
              <div className="form-step active">
                <h3>التحصيل والتسوية</h3>
                <div className="step-sub">آلية تحصيل وتسليم مستحقات الطلبات المحصّلة نقدًا</div>
                <label className="step-label">هل تستطيع الشركة تحصيل ثمن الطلب نقدًا عند التسليم بالليرة السورية الجديدة؟ *</label>
                <ChoiceGroup name="collectSyp" options={YES_NO_OPTIONS} value={data.collectSyp} onChange={(v) => setField('collectSyp', v)} />
                <label className="step-label">هل تستطيع التحصيل نقدًا بالدولار الأمريكي عند إسناد طلب بهذه العملة؟ *</label>
                <ChoiceGroup name="collectUsd" options={YES_NO_OPTIONS} value={data.collectUsd} onChange={(v) => setField('collectUsd', v)} />
                <label className="step-label">هل تستطيع فصل سجلات التحصيل والمبالغ المسلّمة لكل عملة؟ *</label>
                <ChoiceGroup name="separateCurrencyRecords" options={YES_NO_OPTIONS} value={data.separateCurrencyRecords} onChange={(v) => setField('separateCurrencyRecords', v)} />
                <label className="step-label">هل تلتزم بإغلاق كشف تحصيل يومي وتسليم النقد حضوريًا إلى موظف مدرار المخوّل خلال يوم العمل التالي، مقابل إيصال مؤكد من الطرفين؟ *</label>
                <ChoiceGroup name="dailySettlementCommitment" options={YES_NO_OPTIONS} value={data.dailySettlementCommitment} onChange={(v) => setField('dailySettlementCommitment', v)} />
                <div className="field-grid">
                  <TextField label="اسم مسؤول التحصيل لدى الشركة *" name="collectionOfficerName" type="text" value={data.collectionOfficerName} onChange={(v) => setField('collectionOfficerName', v)} invalid={invalid('collectionOfficerName')} required />
                  <TextField label="رقم هاتف مسؤول التحصيل *" name="collectionOfficerPhone" type="tel" className="en" dir="ltr" value={data.collectionOfficerPhone} onChange={(v) => setField('collectionOfficerPhone', v)} invalid={invalid('collectionOfficerPhone')} required />
                </div>
                <div className="note-callout">
                  لا تُطلب بيانات مصرفية أو أرقام محافظ من السائقين. يمكن استكمال أي بيانات مالية إضافية للشركة بعد
                  الموافقة الأولية وبقناة آمنة.
                </div>
                <StepActions onPrev={goPrev} onNext={goNext} />
              </div>
            )}

            {step === 6 && (
              <div className="form-step active">
                <h3>إقرارات التشغيل</h3>
                <div className="step-sub">كل إقرار لازم توافق عليه صراحة</div>
                <AckCheckbox id="ackDataAccuracy" checked={data.ackDataAccuracy} onChange={(v) => setField('ackDataAccuracy', v)}>
                  أقرّ بصحة البيانات والوثائق المقدمة، وبأنني مخوّل بتقديم الطلب باسم الجهة المذكورة.
                </AckCheckbox>
                <AckCheckbox id="ackDriverAccounts" checked={data.ackDriverAccounts} onChange={(v) => setField('ackDriverAccounts', v)}>
                  أوافق على أن تنشئ شركتنا حسابات سائقيها وتديرها من لوحة الشركة، وتتحمل مسؤولية أعمالهم أثناء تنفيذ الشحنات.
                </AckCheckbox>
                <AckCheckbox id="ackDocumentation" checked={data.ackDocumentation} onChange={(v) => setField('ackDocumentation', v)}>
                  ألتزم بتوثيق استلام الشحنة من المورد، ومحاولات التسليم، وتسليمها للعميل برمز التأكيد أو البديل المعتمد.
                </AckCheckbox>
                <AckCheckbox id="ackDataPrivacy" checked={data.ackDataPrivacy} onChange={(v) => setField('ackDataPrivacy', v)}>
                  ألتزم بالمحافظة على سرية بيانات العميل واستخدامها لغرض التوصيل فقط، وعدم الاحتفاظ بها أو استغلالها خارج الخدمة.
                </AckCheckbox>
                <AckCheckbox id="ackNoGuarantee" checked={data.ackNoGuarantee} onChange={(v) => setField('ackNoGuarantee', v)}>
                  أقرّ بأن تقديم الطلب لا يعني قبول الشركة أو ضمان إسناد عدد محدد من الشحنات.
                </AckCheckbox>
                <StepActions onPrev={goPrev} onNext={goNext} />
              </div>
            )}

            {step === 7 && (
              <div className="form-step active">
                <h3>الموافقات القانونية</h3>
                <div className="step-sub">آخر خطوة قبل الإرسال</div>
                <PartnerTermsSection
                  accepted={data.termsAccepted}
                  onAcceptedChange={(v) => { setField('termsAccepted', v); setAckError(''); }}
                  error={!data.termsAccepted && ackError ? 'يرجى الموافقة على شروط وأحكام شركاء مدرار.' : ''}
                  checkboxId="logisticsTerms"
                />
                <AckCheckbox id="privacyAccepted" checked={data.privacyAccepted} onChange={(v) => setField('privacyAccepted', v)}>
                  اطلعت على سياسة الخصوصية الخاصة بالشركاء.
                </AckCheckbox>
                <AckCheckbox id="operationalMessagesConsent" checked={data.operationalMessagesConsent} onChange={(v) => setField('operationalMessagesConsent', v)}>
                  أوافق على تلقي رسائل تشغيلية تتعلق بطلب الانضمام والحساب والطلبات.
                </AckCheckbox>
                <AckCheckbox id="marketingConsent" checked={data.marketingConsent} onChange={(v) => setField('marketingConsent', v)}>
                  أوافق على تلقي رسائل تسويقية من مدرار. <span className="opt">(اختياري)</span>
                </AckCheckbox>
                {ackError && <span className="err" style={{ display: 'block', marginTop: '-14px', marginBottom: '20px' }}>{ackError}</span>}
                <StepActions onPrev={goPrev} submitLabel="إرسال طلب الشراكة اللوجستية" submitDisabled={![...ACK_FIELDS, ...REQUIRED_CONSENT_FIELDS].every((key) => data[key])} />
              </div>
            )}
          </form>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}

function PageHeader({ navigate }) {
  return (
    <header>
      <div className="nav">
        <Logo />
        <a href="/" className="back-link" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l-6 6 6 6M3 12h18" transform="scale(-1,1) translate(-24,0)" /></svg>
          رجوع للموقع
        </a>
      </div>
    </header>
  );
}

function PageFooter() {
  return <footer>© 2026 مدرار — <span className="en">MIDRAR</span></footer>;
}
