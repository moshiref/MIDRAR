/**
 * Permission catalog + default role matrix for the supplier "فريق العمل"
 * (Team) module. This is the single source of truth both the UI and the
 * mock data layer (mockSupplierDb.js) read from — so "does this member
 * have permission X" is answered the same way everywhere, never by
 * checking a role *name* string.
 *
 * IMPORTANT — this is a frontend-only prototype. mockSupplierDb.js calls
 * `requirePermission()` before every sensitive mutation, which is the
 * closest a browser-only, localStorage-backed app can get to "server-side"
 * enforcement — but it still runs in the user's own browser. There is no
 * real backend in this project, so this does not (and cannot) stop
 * someone from editing localStorage directly via devtools. Real
 * enforcement requires an actual server + database.
 */

export const PERMISSION_GROUPS = [
  {
    id: 'dashboard',
    label: 'لوحة المعلومات',
    permissions: [
      { id: 'dashboard.view_operational', label: 'عرض الملخص التشغيلي' },
      { id: 'dashboard.view_financial', label: 'عرض الملخص المالي', sensitive: true },
      { id: 'dashboard.view_alerts', label: 'عرض تنبيهات المؤسسة' },
      { id: 'dashboard.view_performance', label: 'عرض مؤشرات الأداء والتقييم' },
    ],
  },
  {
    id: 'products',
    label: 'المنتجات',
    permissions: [
      { id: 'products.view', label: 'عرض المنتجات' },
      { id: 'products.create', label: 'إنشاء منتج' },
      { id: 'products.edit', label: 'تعديل بيانات المنتج' },
      { id: 'products.edit_supply_price', label: 'تعديل سعر التوريد' },
      { id: 'products.edit_min_price', label: 'تعديل الحد الأدنى للبيع' },
      { id: 'products.edit_prep_time', label: 'تعديل مدة التجهيز' },
      { id: 'products.submit_review', label: 'إرسال المنتج للمراجعة' },
      { id: 'products.suspend', label: 'إيقاف المنتج' },
      { id: 'products.upload_media', label: 'رفع الصور والملفات' },
      { id: 'products.export', label: 'تصدير المنتجات' },
    ],
  },
  {
    id: 'inventory',
    label: 'المخزون',
    permissions: [
      { id: 'inventory.view', label: 'عرض المخزون' },
      { id: 'inventory.edit_quantities', label: 'تعديل الكميات' },
      { id: 'inventory.bulk_edit', label: 'تنفيذ تعديل جماعي' },
      { id: 'inventory.upload_file', label: 'رفع ملف مخزون' },
      { id: 'inventory.view_movements', label: 'عرض سجل الحركات' },
      { id: 'inventory.manage_thresholds', label: 'إدارة حدود انخفاض المخزون' },
    ],
  },
  {
    id: 'orders',
    label: 'الطلبات والتجهيز',
    permissions: [
      { id: 'orders.view', label: 'عرض الطلبات' },
      { id: 'orders.confirm_fulfillable', label: 'تأكيد إمكانية التجهيز' },
      { id: 'orders.report_unfulfillable', label: 'الإبلاغ عن تعذر التجهيز' },
      { id: 'orders.change_status', label: 'تغيير حالة التجهيز' },
      { id: 'orders.upload_proof', label: 'رفع إثبات التجهيز' },
      { id: 'orders.mark_ready', label: 'وضع الطلب «جاهز للاستلام»' },
      { id: 'orders.chat', label: 'التواصل التشغيلي' },
      { id: 'orders.view_delivery_proof', label: 'عرض إثبات استلام شركة التوصيل' },
      { id: 'orders.export', label: 'تصدير الطلبات' },
    ],
  },
  {
    id: 'disputes',
    label: 'المرتجعات والنزاعات',
    permissions: [
      { id: 'disputes.view', label: 'عرض قضايا المورد' },
      { id: 'disputes.upload_evidence', label: 'رفع الأدلة' },
      { id: 'disputes.reply', label: 'الرد على النزاع' },
      { id: 'disputes.accept_resolution', label: 'قبول تسوية مقترحة' },
      { id: 'disputes.object', label: 'تقديم اعتراض' },
      { id: 'disputes.view_decision', label: 'عرض القرار النهائي' },
    ],
  },
  {
    id: 'finance',
    label: 'المالية',
    permissions: [
      { id: 'finance.view_balance', label: 'عرض الرصيد', sensitive: true },
      { id: 'finance.view_statements', label: 'عرض كشوف المستحقات', sensitive: true },
      { id: 'finance.view_commissions', label: 'عرض العمولات والخصومات', sensitive: true },
      { id: 'finance.download_reports', label: 'تنزيل التقارير المالية', sensitive: true },
      { id: 'finance.request_payout', label: 'تقديم طلب صرف', sensitive: true },
      { id: 'finance.cancel_payout', label: 'إلغاء طلب صرف قبل تنفيذه' },
      { id: 'finance.edit_payout_method', label: 'تعديل وسيلة استلام الأموال', sensitive: true },
      { id: 'finance.view_payment_proofs', label: 'عرض إثباتات الدفع' },
      { id: 'finance.object', label: 'تقديم اعتراض مالي' },
    ],
  },
  {
    id: 'team',
    label: 'الفريق والصلاحيات',
    permissions: [
      { id: 'team.view', label: 'عرض أعضاء الفريق' },
      { id: 'team.invite', label: 'دعوة عضو' },
      { id: 'team.resend_invite', label: 'إعادة إرسال دعوة' },
      { id: 'team.edit_role', label: 'تعديل دور عضو', sensitive: true },
      { id: 'team.suspend_member', label: 'إيقاف عضو', sensitive: true },
      { id: 'team.create_role', label: 'إنشاء دور مخصص' },
      { id: 'team.edit_roles', label: 'تعديل الأدوار' },
      { id: 'team.view_activity_log', label: 'عرض سجل النشاط' },
      { id: 'team.manage_sessions', label: 'إدارة الجلسات', sensitive: true },
    ],
  },
  {
    id: 'settings',
    label: 'إعدادات المؤسسة',
    permissions: [
      { id: 'settings.view', label: 'عرض الإعدادات' },
      { id: 'settings.edit_general', label: 'تعديل الملف العام' },
      { id: 'settings.edit_contact', label: 'تعديل بيانات التواصل', sensitive: true },
      { id: 'settings.manage_locations', label: 'إدارة مواقع التجهيز' },
      { id: 'settings.manage_hours', label: 'إدارة ساعات العمل والإجازات' },
      { id: 'settings.manage_fulfillment', label: 'إدارة إعدادات الطلبات والتجهيز' },
      { id: 'settings.manage_catalog', label: 'إدارة إعدادات المنتجات' },
      { id: 'settings.manage_inventory_settings', label: 'إدارة إعدادات المخزون' },
      { id: 'settings.view_financial', label: 'عرض الإعدادات المالية', sensitive: true },
      { id: 'settings.manage_notifications', label: 'إدارة الإشعارات' },
      { id: 'settings.manage_documents', label: 'إدارة الوثائق والتحقق' },
      { id: 'settings.view_change_log', label: 'عرض سجل التغييرات' },
      { id: 'settings.manage_sessions', label: 'إدارة الجلسات', sensitive: true },
      { id: 'settings.export_data', label: 'تصدير بيانات المؤسسة', sensitive: true },
      { id: 'settings.manage_integrations', label: 'إدارة التكاملات المستقبلية' },
      { id: 'settings.pause_orders', label: 'إيقاف استقبال الطلبات مؤقتًا', sensitive: true },
      { id: 'settings.request_account_closure', label: 'طلب إغلاق الحساب', sensitive: true },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => ({ ...p, groupId: g.id, groupLabel: g.label })));
const PERMISSION_MAP = new Map(ALL_PERMISSIONS.map((p) => [p.id, p]));

export function permissionLabel(id) {
  return PERMISSION_MAP.get(id)?.label ?? id;
}

export function isSensitivePermission(id) {
  return Boolean(PERMISSION_MAP.get(id)?.sensitive);
}

/** True if granting this permission set would give the member any sensitive/financial power — used to decide when an invite/role-change needs owner re-authentication. */
export function grantsSensitivePermission(permissionIds = []) {
  return permissionIds.some((id) => isSensitivePermission(id));
}

const PRODUCTS_ALL = PERMISSION_GROUPS.find((g) => g.id === 'products').permissions.map((p) => p.id);
const INVENTORY_ALL = PERMISSION_GROUPS.find((g) => g.id === 'inventory').permissions.map((p) => p.id);
const ORDERS_ALL = PERMISSION_GROUPS.find((g) => g.id === 'orders').permissions.map((p) => p.id);
const DISPUTES_ALL = PERMISSION_GROUPS.find((g) => g.id === 'disputes').permissions.map((p) => p.id);
const FINANCE_ALL = PERMISSION_GROUPS.find((g) => g.id === 'finance').permissions.map((p) => p.id);
const DASHBOARD_ALL = PERMISSION_GROUPS.find((g) => g.id === 'dashboard').permissions.map((p) => p.id);

/**
 * Seven system roles, matching the spec exactly. `isSystem` roles can't be
 * deleted or have their permission set edited (only their assigned members
 * change) — `owner` additionally can never be reassigned except through
 * transferSupplierOwnership().
 */
export const DEFAULT_ROLES = [
  {
    id: 'owner', name: 'مالك حساب المورد', color: '#0B2C52', isSystem: true, isOwner: true,
    description: 'يملك كامل الصلاحيات، ويدير الفريق والأدوار ومواقع التجهيز ووسيلة استلام الأموال. يوجد مالك أساسي واحد للحساب.',
    permissions: ALL_PERMISSIONS.map((p) => p.id),
  },
  {
    id: 'manager', name: 'مدير الحساب', color: '#0A63D6', isSystem: true,
    description: 'يدير العمليات اليومية: المنتجات، المخزون، الطلبات، التجهيز، والتقارير التشغيلية. لا يدير وسيلة استلام الأموال ولا يغلق الحساب.',
    permissions: [
      ...DASHBOARD_ALL.filter((p) => p !== 'dashboard.view_financial'),
      ...PRODUCTS_ALL, ...INVENTORY_ALL, ...ORDERS_ALL, ...DISPUTES_ALL,
      'team.view',
      'settings.view', 'settings.manage_locations', 'settings.manage_hours', 'settings.manage_fulfillment',
      'settings.manage_catalog', 'settings.manage_inventory_settings', 'settings.manage_notifications',
      'settings.manage_documents', 'settings.view_change_log',
    ],
  },
  {
    id: 'products_manager', name: 'مسؤول المنتجات', color: '#10B7A0', isSystem: true,
    description: 'يضيف المنتجات ويعدّلها ويرسلها للمراجعة، ويقترح الأسعار ومدة التجهيز. لا يرى الأرصدة أو الدفعات ولا يدير الفريق.',
    permissions: ['dashboard.view_operational', ...PRODUCTS_ALL],
  },
  {
    id: 'inventory_manager', name: 'مسؤول المخزون', color: '#B8791A', isSystem: true,
    description: 'يعرض المخزون بمواقعه المسموحة ويعدّل الكميات ويرفع ملفات مخزون جماعية. لا يعدّل الأسعار ولا البيانات المالية.',
    permissions: ['dashboard.view_operational', ...INVENTORY_ALL],
  },
  {
    id: 'fulfillment_manager', name: 'مسؤول التجهيز والطلبات', color: '#2E8CF5', isSystem: true,
    description: 'يرى طلبات مواقعه المسموحة ويجهّزها. لا يرى اسم التاجر أو العميل أو أي بيانات مالية — هوية الطرفين محجوبة دائمًا بغض النظر عن الصلاحيات.',
    permissions: ['dashboard.view_operational', ...ORDERS_ALL],
  },
  {
    id: 'accountant', name: 'المحاسب', color: '#7A5CFA', isSystem: true,
    description: 'يعرض المستحقات والأرصدة والكشوف والدفعات وينزّل التقارير المالية. لا يعدّل المنتجات أو المخزون أو حالات التجهيز.',
    permissions: [
      'dashboard.view_financial', 'settings.view', 'settings.view_financial',
      ...FINANCE_ALL.filter((p) => p !== 'finance.edit_payout_method'),
    ],
  },
  {
    id: 'analyst', name: 'محلل التقارير', color: '#4C5E71', isSystem: true,
    description: 'وصول للقراءة فقط إلى التقارير المسموحة، مع إمكانية تصفيتها وتصديرها. لا يعدّل أي منتج أو طلب أو مخزون أو إعداد.',
    permissions: ['dashboard.view_operational', 'dashboard.view_performance', 'finance.view_statements', 'products.export', 'orders.export'],
  },
];

const DEFAULT_ROLE_MAP = new Map(DEFAULT_ROLES.map((r) => [r.id, r]));

/** Resolves a membership's effective role — checks system roles first, then the supplier's custom roles. */
export function resolveRole(roleId, customRoles = []) {
  return DEFAULT_ROLE_MAP.get(roleId) ?? customRoles.find((r) => r.id === roleId) ?? null;
}

export function getEffectivePermissions(roleId, customRoles = []) {
  return resolveRole(roleId, customRoles)?.permissions ?? [];
}

export function membershipHasPermission(membership, permissionId, customRoles = []) {
  if (!membership || membership.status !== 'active') return false;
  return getEffectivePermissions(membership.roleId, customRoles).includes(permissionId);
}

/** Permission combinations that are individually reasonable but dangerous together on one custom role — surfaced as a warning, never blocked outright (the owner can still choose to proceed). */
const CONFLICT_RULES = [
  {
    ids: ['finance.edit_payout_method', 'finance.request_payout'],
    message: 'هذا الدور يجمع بين تعديل وسيلة استلام الأموال وتقديم طلبات الصرف — قد يسمح لعضو واحد بتغيير الوجهة ثم صرف الأموال إليها دون رقابة.',
  },
  {
    ids: ['finance.edit_payout_method', 'team.invite'],
    message: 'هذا الدور يجمع بين تعديل وسيلة استلام الأموال وإدارة دعوات الفريق — قد يسمح لعضو واحد بمنح نفسه أو غيره صلاحيات مالية إضافية.',
  },
  {
    ids: ['team.edit_role', 'team.suspend_member', 'finance.edit_payout_method'],
    message: 'هذا الدور يجمع بين إدارة صلاحيات الأعضاء ووسيلة استلام الأموال — تركيز صلاحيات حساسة بيد عضو واحد.',
  },
];

export function checkRoleConflicts(permissionIds = []) {
  const set = new Set(permissionIds);
  return CONFLICT_RULES.filter((rule) => rule.ids.every((id) => set.has(id))).map((rule) => rule.message);
}

export const MEMBER_STATUS = {
  pending_invite: { label: 'دعوة معلّقة', badge: 'badge-warning' },
  active: { label: 'نشط', badge: 'badge-success' },
  suspended: { label: 'موقوف مؤقتًا', badge: 'badge-danger' },
  pending_verification: { label: 'بانتظار التحقق', badge: 'badge-info' },
  invite_expired: { label: 'انتهت الدعوة', badge: 'badge-neutral' },
  revoked: { label: 'ملغي', badge: 'badge-neutral' },
};

export const INVITATION_STATUS = {
  pending: { label: 'قيد الانتظار', badge: 'badge-warning' },
  accepted: { label: 'مقبولة', badge: 'badge-success' },
  expired: { label: 'منتهية', badge: 'badge-neutral' },
  cancelled: { label: 'ملغاة', badge: 'badge-neutral' },
};
