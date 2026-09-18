/**
 * Central package config for MIDRAR's merchant tiers, shown in the
 * landing page's "باقات التجار" section
 * (src/features/landing/components/MerchantPlansSection.jsx). These are
 * free performance tiers that unlock automatically as a merchant's net
 * completed sales grow — never a paid subscription, no downgrade, no
 * monthly reset.
 *
 * Kept as one data array, separate from both the UI and the business
 * logic (see packageLogic.js in this folder), so it can later be
 * swapped for data fetched from a real backend/admin panel without
 * touching either. Field shape is deliberately close to what an
 * eventual `packageConfig` API resource would return:
 *   id, name, order, usdTarget, sypTarget, commissionRate,
 *   templateCount, failedDeliveryQuota, benefits
 * `templateCount` is a number for basic/silver/gold, but a descriptive
 * string for diamond ("جميع القوالب المميزة المعتمدة") — that's the
 * actual spec, not a bug; render code should treat it as display text,
 * not assume it's always numeric.
 *
 * When a future admin panel can edit these values, each entry here is
 * the *current* value only — an audit trail (effective date, previous
 * value, new value, changed by, reason) would live alongside this array
 * as separate history records keyed by package id, never overwriting or
 * deleting prior entries. Not built yet since no admin UI exists to
 * drive it.
 */

export const PACKAGES = [
  {
    id: 'basic',
    name: 'الأساسية',
    order: 1,
    usdTarget: 200,
    sypTarget: 26000,
    commissionRate: 10,
    templateCount: 20,
    failedDeliveryQuota: 3,
    benefits: [
      'متجر مستقل باسم وهوية التاجر.',
      'الوصول إلى المنتجات المعتمدة ونشرها ضمن حدود الأسعار.',
      '20 قالب متجر أساسيًا.',
      'إدارة الطلبات والتوصيل والأرباح الأساسية.',
      'تقارير مبيعات وأرباح أساسية.',
      '3 حالات فشل تسليم مؤهلة شهريًا.',
      'عمولة 10% من ربح التاجر على الطلبات اللاحقة.',
    ],
  },
  {
    id: 'silver',
    name: 'الفضية',
    order: 2,
    usdTarget: 500,
    sypTarget: 65000,
    commissionRate: 12,
    templateCount: 25,
    failedDeliveryQuota: 5,
    benefits: [
      'جميع مزايا الأساسية.',
      '5 قوالب إضافية = 25 قالبًا.',
      'عروض وكوبونات أكثر تقدمًا ضمن سياسة الحد الأدنى للبيع.',
      'أولوية دعم أعلى.',
      '5 حالات فشل تسليم مؤهلة شهريًا.',
      'عمولة 12%.',
    ],
  },
  {
    id: 'gold',
    name: 'الذهبية',
    order: 3,
    usdTarget: 1500,
    sypTarget: 195000,
    commissionRate: 15,
    templateCount: 30,
    failedDeliveryQuota: 8,
    benefits: [
      'جميع مزايا الفضية.',
      '5 قوالب إضافية = 30 قالبًا.',
      'تحليلات أداء ومبيعات أكثر تفصيلًا.',
      'أهلية للترشيح في فرص إبراز المتجر، بدون ضمان.',
      '8 حالات فشل تسليم مؤهلة شهريًا.',
      'عمولة 15%.',
    ],
  },
  {
    id: 'diamond',
    name: 'الماسية',
    order: 4,
    usdTarget: 3000,
    sypTarget: 390000,
    commissionRate: 20,
    templateCount: 'جميع القوالب المميزة المعتمدة',
    failedDeliveryQuota: 12,
    benefits: [
      'جميع مزايا الذهبية.',
      'جميع القوالب المميزة المعتمدة.',
      'أولوية أعلى للدعم.',
      'حملات اختيارية.',
      'تجربة المزايا الجديدة.',
      '12 حالة فشل تسليم مؤهلة شهريًا.',
      'عمولة 20%.',
    ],
  },
];

/** Visual tile-color progression for the growth-path nodes — src/styles/global.css's `.tile3d` variants, one per tier. */
export const PLAN_TILE_COLORS = ['teal', 'blue', 'navy', 'mint'];
