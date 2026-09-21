/** Static dropdown/reference data for the Settings section — UI-facing constants, not persisted data. */

export const SUPPLIER_TYPES = [
  { id: 'individual', label: 'فرد' },
  { id: 'establishment', label: 'مؤسسة' },
  { id: 'company', label: 'شركة' },
  { id: 'workshop', label: 'ورشة' },
  { id: 'factory', label: 'مصنع' },
  { id: 'distributor', label: 'موزع' },
  { id: 'other', label: 'أخرى' },
];

export const SECTORS = ['أثاث وديكور منزلي', 'إلكترونيات', 'أزياء وإكسسوارات', 'مستلزمات أطفال', 'مستلزمات منزلية', 'أخرى'];

export const PROVINCES = ['دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس', 'إدلب', 'درعا', 'السويداء', 'القنيطرة', 'دير الزور', 'الرقة', 'الحسكة'];

export const REVIEW_REQUIRED_FIELDS = ['legalName', 'supplierType', 'commercialRegister', 'taxNumber', 'licenseNumber'];

export const REVIEW_FIELD_LABELS = {
  legalName: 'الاسم القانوني', supplierType: 'نوع المورد', commercialRegister: 'السجل التجاري',
  taxNumber: 'الرقم الضريبي', licenseNumber: 'رقم الترخيص',
};

export const DOCUMENT_TYPES = [
  { id: 'national_id', label: 'الهوية الشخصية' },
  { id: 'address_proof', label: 'إثبات العنوان' },
  { id: 'license', label: 'وثيقة المزاولة' },
  { id: 'commercial_register', label: 'السجل التجاري' },
  { id: 'tax_registration', label: 'التسجيل الضريبي' },
  { id: 'category_license', label: 'ترخيص فئة منتجات' },
  { id: 'other', label: 'مستند آخر' },
];

export const DOCUMENT_STATUS = {
  not_uploaded: { label: 'غير مرفوعة', badge: 'badge-neutral' },
  pending_review: { label: 'بانتظار المراجعة', badge: 'badge-warning' },
  approved: { label: 'معتمدة', badge: 'badge-success' },
  needs_correction: { label: 'تحتاج تعديلًا', badge: 'badge-warning' },
  rejected: { label: 'مرفوضة', badge: 'badge-danger' },
  expiring_soon: { label: 'قاربت على الانتهاء', badge: 'badge-warning' },
  expired: { label: 'منتهية', badge: 'badge-danger' },
  archived: { label: 'مؤرشفة', badge: 'badge-neutral' },
};

export const PAYOUT_METHOD_STATUS = {
  pending: { label: 'بانتظار التحقق', badge: 'badge-warning' },
  approved: { label: 'معتمدة', badge: 'badge-success' },
  rejected: { label: 'مرفوضة', badge: 'badge-danger' },
  suspended: { label: 'موقوفة', badge: 'badge-neutral' },
};

export const WEEKDAYS = [
  { id: 'sat', label: 'السبت' }, { id: 'sun', label: 'الأحد' }, { id: 'mon', label: 'الاثنين' },
  { id: 'tue', label: 'الثلاثاء' }, { id: 'wed', label: 'الأربعاء' }, { id: 'thu', label: 'الخميس' }, { id: 'fri', label: 'الجمعة' },
];

export const TIMEZONES = ['Asia/Damascus'];

export const NOTIFICATION_CATEGORIES = [
  {
    id: 'orders', label: 'الطلبات', critical: false,
    events: ['وصول طلب جديد', 'اقتراب انتهاء مهلة التجهيز', 'تأخر طلب', 'إلغاء طلب', 'استلام شركة التوصيل للشحنة', 'تسليم الطلب للعميل', 'فشل التسليم'],
  },
  {
    id: 'catalog', label: 'المنتجات والمخزون', critical: false,
    events: ['اعتماد أو رفض منتج', 'طلب تعديل منتج', 'انخفاض المخزون', 'نفاد المخزون', 'انتهاء حجز', 'فشل استيراد ملف'],
  },
  {
    id: 'financial', label: 'المالية', critical: true,
    events: ['إضافة مبلغ مستحق', 'تأهيل دفعة', 'جدولة دفعة', 'تنفيذ دفعة', 'تعليق دفعة', 'وجود فرق أو اعتراض مالي', 'تغيير وسيلة استلام الأموال'],
  },
  {
    id: 'disputes', label: 'النزاعات والدعم', critical: false,
    events: ['فتح مرتجع أو نزاع', 'طلب أدلة', 'صدور قرار', 'وصول رد على تذكرة', 'تصعيد تذكرة'],
  },
  {
    id: 'team_security', label: 'الفريق والأمان', critical: true,
    events: ['قبول دعوة عضو', 'تعديل صلاحية', 'إيقاف عضو', 'تسجيل الدخول من جهاز جديد', 'تغيير هاتف أو بريد', 'تغيير وسيلة دفع'],
  },
];

export const CHANNELS = [
  { id: 'inApp', label: 'داخل لوحة المورد' },
  { id: 'sms', label: 'رسالة نصية' },
  { id: 'email', label: 'بريد إلكتروني' },
  { id: 'dailyDigest', label: 'ملخص يومي' },
];
