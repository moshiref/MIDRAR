/**
 * Merchant plan tiers, shown in the landing page's "باقات التجار" section
 * (src/features/landing/components/MerchantPlansSection.jsx). These are
 * free performance tiers that unlock automatically as a merchant's net
 * completed sales grow — never a paid subscription. Kept as one data
 * array, separate from the UI, so it can later be swapped for data
 * fetched from a real backend/admin panel without touching the section's
 * JSX — only this file's shape needs to stay the same:
 * name, salesTargetUsd, salesTargetSyp, commissionRate, templates,
 * failedDeliveryCoverage, features, description.
 */

export const MERCHANT_PLANS = [
  {
    id: 'eligibility',
    name: 'الأهلية',
    isFree: true,
    badge: 'مجانية',
    accessLabel: 'من انضمام التاجر وحتى بلوغ الهدف الأول',
    salesTargetUsd: 0,
    salesTargetSyp: 0,
    commissionRate: 0,
    templates: '20 قالبًا أساسيًا',
    failedDeliveryCoverage: 0,
    failedDeliveryCoverageLabel: '0 حالات',
    description: 'نقطة البداية لكل تاجر ينضم إلى مدرار.',
    features: [
      'متجر مستقل باسم وهوية التاجر.',
      'الوصول إلى المنتجات المعتمدة ونشرها ضمن حدود الأسعار.',
      '20 قالب متجر أساسيًا، كلها متاحة دون قيد.',
      'إدارة الطلبات والتوصيل والأرباح الأساسية.',
      'عمولة صفر من ربح التاجر حتى بلوغ هدف الباقة الأساسية.',
      'لا تغطي مدرار أي حالة من رسوم فشل التسليم في هذه الباقة.',
    ],
  },
  {
    id: 'basic',
    name: 'الأساسية',
    isFree: false,
    accessLabel: '200 دولار أو 26,000 ليرة سورية جديدة',
    salesTargetUsd: 200,
    salesTargetSyp: 26000,
    commissionRate: 10,
    templates: '20 قالبًا أساسيًا',
    failedDeliveryCoverage: 3,
    failedDeliveryCoverageLabel: '3 حالات شهريًا',
    description: 'أول مستوى يفتح تلقائيًا بعد أول مبيعات مكتملة.',
    features: [
      'جميع مزايا الأهلية.',
      'تقارير مبيعات وأرباح أساسية.',
      'تغطية رسوم 3 حالات فشل تسليم مؤهلة شهريًا.',
      'عمولة 10% من ربح التاجر على الطلبات اللاحقة.',
    ],
  },
  {
    id: 'silver',
    name: 'الفضية',
    isFree: false,
    accessLabel: '500 دولار أو 65,000 ليرة سورية جديدة',
    salesTargetUsd: 500,
    salesTargetSyp: 65000,
    commissionRate: 12,
    templates: '25 قالبًا',
    failedDeliveryCoverage: 5,
    failedDeliveryCoverageLabel: '5 حالات شهريًا',
    description: 'قوالب إضافية وأدوات عروض أكثر تقدمًا.',
    features: [
      'جميع مزايا الأساسية.',
      '5 قوالب إضافية، ليصبح الإجمالي 25 قالبًا.',
      'أدوات عروض وكوبونات أكثر تقدمًا ضمن سياسة الحد الأدنى للبيع.',
      'أولوية دعم أعلى من الباقات السابقة.',
      'تغطية رسوم 5 حالات فشل تسليم مؤهلة شهريًا.',
      'عمولة 12% من ربح التاجر.',
    ],
  },
  {
    id: 'gold',
    name: 'الذهبية',
    isFree: false,
    accessLabel: '1,500 دولار أو 195,000 ليرة سورية جديدة',
    salesTargetUsd: 1500,
    salesTargetSyp: 195000,
    commissionRate: 15,
    templates: '30 قالبًا',
    failedDeliveryCoverage: 8,
    failedDeliveryCoverageLabel: '8 حالات شهريًا',
    description: 'تحليلات أعمق وفرص إبراز داخل المنصة.',
    features: [
      'جميع مزايا الفضية.',
      '5 قوالب إضافية، ليصبح الإجمالي 30 قالبًا.',
      'تحليلات أداء ومبيعات أكثر تفصيلًا.',
      'أهلية للترشيح في فرص إبراز المتجر التي تديرها مدرار؛ الإبراز ليس مضمونًا تلقائيًا.',
      'تغطية رسوم 8 حالات فشل تسليم مؤهلة شهريًا.',
      'عمولة 15% من ربح التاجر.',
    ],
  },
  {
    id: 'diamond',
    name: 'الماسية',
    isFree: false,
    accessLabel: '3,000 دولار أو 390,000 ليرة سورية جديدة',
    salesTargetUsd: 3000,
    salesTargetSyp: 390000,
    commissionRate: 20,
    templates: 'جميع القوالب المميزة المعتمدة',
    failedDeliveryCoverage: 12,
    failedDeliveryCoverageLabel: '12 حالة شهريًا',
    description: 'أعلى مستوى، بأولوية دعم وتجربة مزايا جديدة.',
    features: [
      'جميع مزايا الذهبية.',
      'الوصول إلى جميع القوالب المميزة المعتمدة.',
      'أولوية أعلى للدعم والحملات الاختيارية وتجربة المزايا الجديدة.',
      'تغطية رسوم 12 حالة فشل تسليم مؤهلة شهريًا.',
      'عمولة 20% من ربح التاجر.',
    ],
  },
];

/** Visual tile-color progression for the growth-path nodes — src/styles/global.css's `.tile3d` variants, one per tier. */
export const PLAN_TILE_COLORS = ['glass', 'teal', 'blue', 'navy', 'mint'];
