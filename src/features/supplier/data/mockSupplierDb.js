/**
 * Mock data layer for the supplier portal. There is no backend yet (see
 * the Phase 0 supplier-portal plan), so every collection below is
 * localStorage-backed and seeded with fixtures on first read — same
 * pattern already used by the merchant/supplier registration wizard in
 * src/features/open-store/OpenStorePage.jsx.
 *
 * Every exported function is `async` even though it's synchronous under
 * the hood, so call sites already look like real API calls
 * (`await getProducts()`) and swapping this module for real HTTP calls
 * later doesn't touch any UI code.
 *
 * Money amounts are always `{ amount, currency }` pairs — see
 * src/lib/currency.js — never a bare number, since USD and SYP are
 * tracked as fully separate balances throughout the spec.
 */

import { DEFAULT_ROLES, resolveRole, membershipHasPermission, grantsSensitivePermission } from '../team/permissions';
import { REVIEW_REQUIRED_FIELDS, NOTIFICATION_CATEGORIES } from '../settings/settingsCatalog';

const KEY_PREFIX = 'midrar_supplier_';
// Bumped from 1 → 2 when the supplier profile fields (email, password,
// whatsapp, address, commercialRegister, taxNumber, description, logo,
// joinDate, lastPasswordChange, workingHours) were added to the seed —
// browsers with a v1 record cached in localStorage would otherwise keep
// reading the old shape forever, since seeding only runs once per key.
const SCHEMA_VERSION = 2;

function readCollection(name, seedFactory) {
  const key = `${KEY_PREFIX}${name}_v${SCHEMA_VERSION}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { key, items: JSON.parse(raw) };
  } catch {
    /* fall through to reseed */
  }
  const seeded = seedFactory();
  try {
    localStorage.setItem(key, JSON.stringify(seeded));
  } catch {
    /* storage unavailable — the seed still works for this session, just won't persist */
  }
  return { key, items: seeded };
}

function writeCollection(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
  return items;
}

function nextId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// ---- seed data -----------------------------------------------------------

const SEED_SUPPLIER_ID = 'sup_1';

function seedSuppliers() {
  return [
    {
      id: SEED_SUPPLIER_ID,
      companyName: 'مصنع الأمل للأثاث',
      fullName: 'محمود العبد الله',
      phone: '+963944000111',
      whatsapp: '+963944000111',
      email: 'mahmoud@amal-furniture.sy',
      password: '123456',
      address: 'المنطقة الصناعية، شارع 8',
      city: 'دمشق',
      activityType: 'factory',
      status: 'approved',
      logo: null,
      description: 'مصنع متخصص في تصنيع الأثاث المنزلي والمكتبي بخامات محلية عالية الجودة، بخبرة تتجاوز 12 عامًا في السوق السوري.',
      commercialRegister: '30124587',
      taxNumber: 'SY-987654321',
      workingHours: 'الأحد – الخميس، 9ص – 6م',
      ratingSummary: { fulfillmentAccuracy: 0.94, prepTimeAdherence: 0.88, stockAccuracy: 0.97, returnRate: 0.03, prepSpeedScore: 0.86, merchantRating: 0.91 },
      // Illustrative-only "last period" snapshot so the Performance page
      // can show a trend/delta — same demo-data caveat as ratingSummary.
      previousRatingSummary: { fulfillmentAccuracy: 0.90, prepTimeAdherence: 0.85, stockAccuracy: 0.95, returnRate: 0.05, prepSpeedScore: 0.81, merchantRating: 0.88 },
      bankAccount: { bankName: 'بنك سورية والمهجر', holderName: 'محمود العبد الله', iban: 'SY00 0000 0000 0000 0000' },
      wallet: { provider: 'محفظة سيريتيل كاش', number: '0944000111' },
      twoFactorEnabled: false,
      lastPasswordChange: null,

      // ---- Settings section (see src/features/supplier/settings/) ----
      legalName: 'مؤسسة محمود العبد الله للأثاث',
      coverImage: null,
      sectors: ['أثاث وديكور منزلي'],
      startYear: 2013,
      licenseNumber: 'LIC-4471',
      province: 'دمشق',
      website: '',
      socialLinks: [],
      timezone: 'Asia/Damascus',
      preferredLanguage: 'ar',
      contactPersonTitle: 'مالك المصنع',
      altPhone: '',
      accountingEmail: '',
      fulfillmentPhone: '+963944000111',
      emergencyPhone: '',
      preferredContactMethod: 'phone',
      preferredContactHours: 'صباحًا حتى المساء',
      pendingPhoneVerification: null,
      pendingEmailVerification: null,
      pendingChanges: [],

      payoutMethod: {
        type: 'wallet', walletProvider: 'محفظة سيريتيل كاش', holderName: 'محمود العبد الله', number: '0944000111',
        currency: 'SYP', note: '', proofFile: null, status: 'approved', securityHoldUntil: null,
        updatedAt: '2026-06-01T08:00:00.000Z', updatedBy: 'محمود العبد الله',
      },
      fulfillmentSettings: {
        defaultPrepDays: 3, defaultLocationId: 'loc_1', autoAssignByStock: false, allowEmployeeSelfAccept: true,
        requireReasonOnUnfulfillable: true, earlyWarningMinutes: 60, proofVideoEnabled: true, remindProofUpload: true,
        allowPhotosInsteadOfVideo: true, defaultPackagingInstructions: 'تغليف محكم مع حماية الزوايا للأثاث الخشبي.',
        deliveryNotes: 'يرجى التواصل مع مسؤول الموقع قبل نصف ساعة من الاستلام.', returnsReady: true,
        updatedAt: '2026-06-01T08:00:00.000Z', updatedBy: 'محمود العبد الله',
      },
      catalogSettings: {
        defaultCurrency: 'USD', defaultCategoryId: null, defaultPrepDays: 3, defaultLocationId: 'loc_1',
        autosaveDrafts: true, defaultUnit: 'قطعة', descriptionTemplate: '', remindIncompleteProducts: true, notifyOnApprovalDecision: true,
        updatedAt: '2026-06-01T08:00:00.000Z', updatedBy: 'محمود العبد الله',
      },
      inventorySettings: {
        lowStockThreshold: 5, outOfStockAlert: true, longReservationAlertDays: 3, allowBulkEdit: true, requireReasonOnManualAdjust: true,
        updatedAt: '2026-06-01T08:00:00.000Z', updatedBy: 'محمود العبد الله',
      },
      notificationPrefs: null,
      businessHours: {
        timezone: 'Asia/Damascus',
        schedule: {
          sat: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          sun: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          mon: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          tue: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          wed: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          thu: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          fri: { enabled: false, periods: [] },
        },
        acceptOrdersOutsideHours: true, processOutsideHoursNextDay: true, courierPickupWindow: '4م – 7م',
        updatedAt: '2026-06-01T08:00:00.000Z', updatedBy: 'محمود العبد الله',
      },
      restrictions: [],
      accountStatus: 'active',
      orderPauseWindows: [],
      closureRequest: null,
      dataDisclosureConsent: true,
      termsAcceptances: [
        { id: 'tos_1', docType: 'terms', label: 'شروط استخدام حسابات الموظفين', version: '1.0', acceptedAt: '2026-06-01T08:00:00.000Z' },
        { id: 'tos_2', docType: 'privacy', label: 'سياسة الخصوصية', version: '1.0', acceptedAt: '2026-06-01T08:00:00.000Z' },
      ],
      joinDate: '2026-06-01T08:00:00.000Z',
      createdAt: '2026-06-01T08:00:00.000Z',
    },
  ];
}

// Each member is a *membership* — user identity + role + access scope
// inside this one supplier org (see src/features/supplier/team/permissions.js
// for what `roleId` resolves to). `status` never regresses to a hard
// delete anywhere in this file: suspending/revoking access always keeps
// the record (and everything it authored elsewhere — products, orders,
// audit log) intact, per the team-management spec.
function seedEmployees() {
  return [
    {
      id: 'emp_1', supplierId: SEED_SUPPLIER_ID,
      name: 'محمود العبد الله', jobTitle: 'مالك المصنع',
      phone: '+963944000111', email: 'mahmoud@amal-furniture.sy', photo: null, preferredLanguage: 'ar', preferences: null,
      roleId: 'owner', locationIds: [], productScope: 'all',
      accessExpiresAt: null, mustChangePassword: false, internalNote: '',
      status: 'active',
      invitedBy: null, invitedAt: null, acceptedAt: '2026-06-01T08:00:00.000Z',
      lastLoginAt: '2026-09-20T09:12:00.000Z', activeSessionCount: 2,
      suspendedAt: null, suspendedReason: null,
      createdAt: '2026-06-01T08:00:00.000Z',
    },
    {
      id: 'emp_2', supplierId: SEED_SUPPLIER_ID,
      name: 'سارة ديب', jobTitle: 'مسؤولة المستودع',
      phone: '+963988111222', email: 'sara.deeb@example.com', photo: null, preferredLanguage: 'ar', preferences: null,
      roleId: 'inventory_manager', locationIds: ['loc_1'], productScope: 'all',
      accessExpiresAt: null, mustChangePassword: false, internalNote: '',
      status: 'active',
      invitedBy: 'emp_1', invitedAt: '2026-06-09T08:00:00.000Z', acceptedAt: '2026-06-10T08:00:00.000Z',
      lastLoginAt: '2026-09-19T14:30:00.000Z', activeSessionCount: 1,
      suspendedAt: null, suspendedReason: null,
      createdAt: '2026-06-10T08:00:00.000Z',
    },
    {
      id: 'emp_3', supplierId: SEED_SUPPLIER_ID,
      name: 'خالد ناصر', jobTitle: 'مسؤول التجهيز',
      phone: '+963955333444', email: '', photo: null, preferredLanguage: 'ar', preferences: null,
      roleId: 'fulfillment_manager', locationIds: ['loc_2'], productScope: 'locations',
      accessExpiresAt: null, mustChangePassword: false, internalNote: '',
      status: 'active',
      invitedBy: 'emp_1', invitedAt: '2026-07-01T08:00:00.000Z', acceptedAt: '2026-07-02T08:00:00.000Z',
      lastLoginAt: '2026-09-20T07:45:00.000Z', activeSessionCount: 1,
      suspendedAt: null, suspendedReason: null,
      createdAt: '2026-07-02T08:00:00.000Z',
    },
    {
      id: 'emp_4', supplierId: SEED_SUPPLIER_ID,
      name: 'ريم الحلبي', jobTitle: 'محاسبة',
      phone: '+963933555666', email: 'reem.accounting@example.com', photo: null, preferredLanguage: 'ar', preferences: null,
      roleId: 'accountant', locationIds: [], productScope: 'all',
      accessExpiresAt: null, mustChangePassword: false, internalNote: 'أوقفت مؤقتًا لحين مراجعة كشف حساب داخلي.',
      status: 'suspended',
      invitedBy: 'emp_1', invitedAt: '2026-07-15T08:00:00.000Z', acceptedAt: '2026-07-16T08:00:00.000Z',
      lastLoginAt: '2026-09-01T10:00:00.000Z', activeSessionCount: 0,
      suspendedAt: '2026-09-10T09:00:00.000Z', suspendedReason: 'مراجعة داخلية على كشف حساب',
      createdAt: '2026-07-16T08:00:00.000Z',
    },
  ];
}

function seedTeamRoles() {
  return [
    {
      id: 'role_custom_1', supplierId: SEED_SUPPLIER_ID,
      name: 'مشرف نهاري', description: 'يجمع بين متابعة المخزون وتجهيز الطلبات لموقع واحد خلال الدوام النهاري.',
      color: '#7A5CFA', isSystem: false,
      permissions: ['dashboard.view_operational', 'inventory.view', 'inventory.edit_quantities', 'orders.view', 'orders.confirm_fulfillable', 'orders.change_status', 'orders.mark_ready'],
      createdBy: 'emp_1', createdAt: '2026-08-01T08:00:00.000Z',
    },
  ];
}

function seedTeamInvitations() {
  return [
    {
      id: 'inv_1', supplierId: SEED_SUPPLIER_ID,
      fullName: 'يوسف قاسم', phone: '+963977888999', email: '',
      jobTitle: 'مسؤول منتجات', preferredLanguage: 'ar', internalNote: '',
      roleId: 'products_manager', locationIds: [], productScope: 'all',
      accessExpiresAt: null, mustChangePassword: true,
      invitedBy: 'emp_1', invitedByName: 'محمود العبد الله',
      status: 'pending', resentCount: 0, tokenVersion: 1,
      createdAt: '2026-09-18T09:00:00.000Z', expiresAt: '2026-09-21T09:00:00.000Z',
    },
    {
      id: 'inv_2', supplierId: SEED_SUPPLIER_ID,
      fullName: 'لينا حداد', phone: '+963911222333', email: 'lina.h@example.com',
      jobTitle: 'محللة تقارير', preferredLanguage: 'ar', internalNote: 'تجربة لمدة شهر.',
      roleId: 'analyst', locationIds: [], productScope: 'all',
      accessExpiresAt: null, mustChangePassword: true,
      invitedBy: 'emp_1', invitedByName: 'محمود العبد الله',
      status: 'pending', resentCount: 1, tokenVersion: 2,
      createdAt: '2026-09-10T09:00:00.000Z', expiresAt: '2026-09-13T09:00:00.000Z',
    },
  ];
}

function seedSecurityEvents() {
  return [
    { id: 'sec_1', supplierId: SEED_SUPPLIER_ID, type: 'new_device_login', actorName: 'سارة ديب', detail: 'تسجيل دخول من جهاز جديد (Chrome على Windows)', severity: 'info', ownerNotify: true, at: '2026-09-19T14:30:00.000Z' },
    { id: 'sec_2', supplierId: SEED_SUPPLIER_ID, type: 'sensitive_permission_change', actorName: 'محمود العبد الله', detail: 'تم منح ريم الحلبي دور «المحاسب» بصلاحيات مالية', severity: 'warning', ownerNotify: true, at: '2026-07-15T08:05:00.000Z' },
    { id: 'sec_3', supplierId: SEED_SUPPLIER_ID, type: 'member_suspended', actorName: 'محمود العبد الله', detail: 'تم إيقاف ريم الحلبي مؤقتًا — مراجعة داخلية على كشف حساب', severity: 'warning', ownerNotify: true, at: '2026-09-10T09:00:00.000Z' },
  ];
}

function seedProducts() {
  return [
    {
      id: 'prod_1', supplierId: SEED_SUPPLIER_ID, name: 'كنبة زاوية قماش', sector: 'أثاث وديكور منزلي', categoryId: 'cat_2', status: 'approved', createdAt: '2026-06-02T08:00:00.000Z', images: [], video: null,
      variants: [
        { id: 'var_1', label: 'رمادي - كبير', supplyPrice: { amount: 340, currency: 'USD' }, minPrice: { amount: 420, currency: 'USD' }, suggestedPrice: { amount: 480, currency: 'USD' }, prepDays: 3, location: 'مستودع دمشق', stock: { actual: 12, reserved: 2 } },
        { id: 'var_2', label: 'بيج - كبير', supplyPrice: { amount: 340, currency: 'USD' }, minPrice: { amount: 420, currency: 'USD' }, suggestedPrice: { amount: 480, currency: 'USD' }, prepDays: 3, location: 'مستودع دمشق', stock: { actual: 3, reserved: 1 } },
      ],
    },
    {
      id: 'prod_2', supplierId: SEED_SUPPLIER_ID, name: 'طاولة طعام خشبية', sector: 'أثاث وديكور منزلي', categoryId: null, status: 'pending', createdAt: '2026-09-10T08:00:00.000Z', images: [], video: null,
      variants: [
        { id: 'var_3', label: 'قياس 160سم', supplyPrice: { amount: 180, currency: 'USD' }, minPrice: { amount: 230, currency: 'USD' }, suggestedPrice: { amount: 260, currency: 'USD' }, prepDays: 5, location: 'مستودع دمشق', stock: { actual: 6, reserved: 0 } },
      ],
    },
  ];
}

function seedCategories() {
  return [
    { id: 'cat_1', supplierId: SEED_SUPPLIER_ID, name: 'غرف نوم', createdAt: '2026-06-01T08:30:00.000Z', updatedAt: '2026-06-01T08:30:00.000Z' },
    { id: 'cat_2', supplierId: SEED_SUPPLIER_ID, name: 'غرف معيشة', createdAt: '2026-06-01T08:30:00.000Z', updatedAt: '2026-06-01T08:30:00.000Z' },
    { id: 'cat_3', supplierId: SEED_SUPPLIER_ID, name: 'كراسي', createdAt: '2026-06-01T08:30:00.000Z', updatedAt: '2026-06-01T08:30:00.000Z' },
  ];
}

function seedInventoryMovements() {
  return [
    { id: 'mov_1', productId: 'prod_1', variantId: 'var_1', delta: 15, reason: 'تحديث مخزون أولي', actorName: 'محمود العبد الله', at: '2026-06-02T09:00:00.000Z' },
    { id: 'mov_2', productId: 'prod_1', variantId: 'var_1', delta: -3, reason: 'حجز طلبات', actorName: 'سارة ديب', at: '2026-09-12T09:00:00.000Z' },
  ];
}

function seedOrders() {
  return [
    { id: 'ord_1', opRef: 'OP-88213', supplierId: SEED_SUPPLIER_ID, status: 'new', items: [{ productId: 'prod_1', variantId: 'var_1', name: 'كنبة زاوية قماش - رمادي كبير', qty: 1 }], fulfillmentLocation: 'مستودع دمشق', readyBy: '2026-09-20T00:00:00.000Z', createdAt: '2026-09-16T10:00:00.000Z' },
    { id: 'ord_2', opRef: 'OP-88190', supplierId: SEED_SUPPLIER_ID, status: 'preparing', items: [{ productId: 'prod_1', variantId: 'var_2', name: 'كنبة زاوية قماش - بيج كبير', qty: 1 }], fulfillmentLocation: 'مستودع دمشق', readyBy: '2026-09-14T00:00:00.000Z', createdAt: '2026-09-11T10:00:00.000Z' },
    { id: 'ord_3', opRef: 'OP-88055', supplierId: SEED_SUPPLIER_ID, status: 'completed', items: [{ productId: 'prod_1', variantId: 'var_1', name: 'كنبة زاوية قماش - رمادي كبير', qty: 2 }], fulfillmentLocation: 'مستودع دمشق', readyBy: '2026-09-05T00:00:00.000Z', createdAt: '2026-09-01T10:00:00.000Z' },
  ];
}

function seedPayouts() {
  return [
    { id: 'pay_1', supplierId: SEED_SUPPLIER_ID, currency: 'USD', status: 'eligible', orderIds: ['ord_3'], grossAmount: 680, commission: 34, netAmount: 646, executedAt: null },
    { id: 'pay_2', supplierId: SEED_SUPPLIER_ID, currency: 'SYP', status: 'executed', orderIds: [], grossAmount: 0, commission: 0, netAmount: 0, executedAt: '2026-08-01T00:00:00.000Z' },
  ];
}

function seedTickets() {
  return [
    {
      id: 'tkt_1',
      supplierId: SEED_SUPPLIER_ID,
      subject: 'قطعة تالفة عند الاستلام',
      relatedType: 'order',
      relatedId: 'ord_3',
      reason: 'العميل أبلغ عن خدش في القماش عند فتح الطلب.',
      status: 'open',
      evidenceFiles: [{ name: 'evidence-1.jpg', note: 'صورة توضح موضع الخدش' }],
      messages: [
        { from: 'فريق الدعم', text: 'تم فتح نزاع بخصوص الطلب OP-88055، الرجاء إرفاق الأدلة اللازمة.', at: '2026-09-06T09:00:00.000Z' },
        { from: 'محمود العبد الله', text: 'تم إرفاق صورة توضح أن القطعة غادرت المستودع سليمة حسب سجل إثبات التجهيز.', at: '2026-09-06T14:20:00.000Z' },
      ],
      createdAt: '2026-09-06T09:00:00.000Z',
      updatedAt: '2026-09-06T14:20:00.000Z',
    },
  ];
}

function seedFulfillmentProofs() {
  return [
    {
      id: 'proof_1',
      orderId: 'ord_3',
      files: [{ name: 'packing-ord3.mp4', type: 'video' }],
      note: 'تغليف كامل مع توثيق فتح الصندوق فارغًا قبل التعبئة.',
      uploadedBy: 'سارة ديب',
      uploadedAt: '2026-09-01T11:30:00.000Z',
    },
  ];
}

function seedOrderMessages() {
  return [
    { id: 'msg_1', orderId: 'ord_1', from: 'فريق العمليات', role: 'ops', text: 'الرجاء تأكيد الطلب خلال ساعات العمل القادمة لتفادي تأخر التجهيز.', at: '2026-09-16T10:05:00.000Z', read: false },
    { id: 'msg_2', orderId: 'ord_2', from: 'مسؤول الطلب', role: 'order-owner', text: 'الطلب قيد التجهيز، الموعد المتوقع 2026-09-14.', at: '2026-09-11T12:00:00.000Z', read: true },
  ];
}

function seedLocations() {
  return [
    {
      id: 'loc_1', supplierId: SEED_SUPPLIER_ID, name: 'مستودع دمشق الرئيسي', code: 'DAM-1',
      province: 'دمشق', city: 'دمشق', district: 'المنطقة الصناعية', address: 'المنطقة الصناعية، دمشق',
      landmark: 'خلف محطة وقود الشام', mapUrl: '', managerPhone: '+963944000111',
      accessInstructions: 'الدخول من البوابة الشرقية، التوقف بمنطقة التحميل رقم 3.',
      defaultPrepDays: 3, categoryIds: [], status: 'active', acceptsReturns: true, notes: '', isDefault: true, active: true,
      updatedAt: '2026-06-01T08:00:00.000Z', updatedBy: 'محمود العبد الله',
    },
    {
      id: 'loc_2', supplierId: SEED_SUPPLIER_ID, name: 'مستودع حلب', code: 'ALP-1',
      province: 'حلب', city: 'حلب', district: 'المنطقة الصناعية', address: 'المنطقة الصناعية، حلب',
      landmark: '', mapUrl: '', managerPhone: '+963955333444',
      accessInstructions: '',
      defaultPrepDays: 4, categoryIds: [], status: 'active', acceptsReturns: false, notes: '', isDefault: false, active: true,
      updatedAt: '2026-07-02T08:00:00.000Z', updatedBy: 'محمود العبد الله',
    },
  ];
}

function seedHolidays() {
  return [
    {
      id: 'hol_1', supplierId: SEED_SUPPLIER_ID, title: 'إجازة عيد الأضحى',
      startDate: '2026-05-27', endDate: '2026-05-30', locationIds: [], reason: 'إجازة رسمية',
      stopOrders: false, extendPrepDays: 2, notifyMidrar: false, status: 'upcoming',
      createdBy: 'emp_1', createdAt: '2026-04-01T08:00:00.000Z',
    },
  ];
}

function seedDocuments() {
  return [
    {
      id: 'doc_1', supplierId: SEED_SUPPLIER_ID, type: 'national_id', number: '02010199999',
      issuer: 'الأحوال المدنية — دمشق', issueDate: '2020-01-01', expiryDate: null,
      file: null, status: 'approved', reviewNote: '', updatedAt: '2026-06-02T08:00:00.000Z', updatedBy: 'محمود العبد الله',
    },
    {
      id: 'doc_2', supplierId: SEED_SUPPLIER_ID, type: 'license', number: 'LIC-4471',
      issuer: 'غرفة صناعة دمشق', issueDate: '2024-01-15', expiryDate: '2026-10-15',
      file: null, status: 'approved', reviewNote: '', updatedAt: '2026-06-02T08:00:00.000Z', updatedBy: 'محمود العبد الله',
    },
    {
      id: 'doc_3', supplierId: SEED_SUPPLIER_ID, type: 'commercial_register', number: '30124587',
      issuer: 'سجل التجارة — دمشق', issueDate: '2019-03-10', expiryDate: null,
      file: null, status: 'pending_review', reviewNote: '', updatedAt: '2026-09-18T08:00:00.000Z', updatedBy: 'محمود العبد الله',
    },
  ];
}

function seedNotifications() {
  return [
    { id: 'ntf_1', supplierId: SEED_SUPPLIER_ID, type: 'order', message: 'طلب جديد بانتظار تأكيدك (OP-88213)', read: false, createdAt: '2026-09-16T10:00:00.000Z' },
    { id: 'ntf_2', supplierId: SEED_SUPPLIER_ID, type: 'stock', message: 'الكمية المتاحة لـ "كنبة زاوية قماش - بيج كبير" منخفضة', read: false, createdAt: '2026-09-15T08:00:00.000Z' },
  ];
}

function seedAuditLog() {
  // Seeded so the dashboard's Activity Feed has something real to show on
  // first load — every entry here is shaped exactly like the ones
  // appendAuditLog() writes for real actions elsewhere in the app, so
  // this is illustrative starting history, not a separate mock system.
  return [
    { id: 'audit_seed_3', actorName: 'سارة ديب', action: 'order.statusChange', target: 'ord_2', details: { status: 'preparing' }, at: '2026-09-16T14:00:00.000Z' },
    { id: 'audit_seed_2', actorName: 'سارة ديب', action: 'inventory.adjust', target: 'prod_1/var_1', details: { delta: -3, reason: 'حجز طلبات' }, at: '2026-09-12T09:00:00.000Z' },
    { id: 'audit_seed_1', actorName: 'محمود العبد الله', action: 'product.add', target: 'prod_2', details: { name: 'طاولة طعام خشبية' }, at: '2026-09-10T08:00:00.000Z' },
  ];
}

// Illustrative-only chart series (spec explicitly warns against passing
// mock ratings/analytics off as real: "لا تستخدم Ratings أو Scores وهمية
// على أنها بيانات حقيقية"). The 3-order/2-product seed set above is too
// sparse to derive a meaningful 7-point trend from, so these are a
// separate, clearly-labeled demo dataset the charts read from — the UI
// marks every chart that reads this as "بيانات تجريبية".
function seedDashboardSeries() {
  const dayLabels = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const weekLabels = ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'];
  const monthLabels = ['قبل شهرين', 'الشهر الماضي', 'هذا الشهر'];
  return {
    // Orders/revenue are range-dependent (7/30/90 day tabs on the
    // dashboard); inventory movement and top products are point-in-time
    // snapshots, not time series, so they don't need a range.
    orders: {
      '7d': dayLabels.map((label, i) => ({ label, value: [2, 4, 3, 5, 6, 4, 7][i] })),
      '30d': weekLabels.map((label, i) => ({ label, value: [9, 14, 11, 16][i] })),
      '90d': monthLabels.map((label, i) => ({ label, value: [38, 47, 41][i] })),
    },
    revenue: {
      '7d': dayLabels.map((label, i) => ({ label, value: [180, 420, 260, 510, 640, 380, 720][i] })),
      '30d': weekLabels.map((label, i) => ({ label, value: [1450, 2100, 1780, 2460][i] })),
      '90d': monthLabels.map((label, i) => ({ label, value: [5600, 7200, 7790][i] })),
    },
    // Percentages of total inventory, for the stacked health bar — sums to 100.
    inventoryHealth: [
      { label: 'متاح', value: 62, tone: 'success' },
      { label: 'محجوز', value: 18, tone: 'brand' },
      { label: 'منخفض', value: 14, tone: 'warning' },
      { label: 'نفد', value: 6, tone: 'danger' },
    ],
    topProducts: [
      { label: 'كنبة زاوية قماش', value: 42 },
      { label: 'طاولة طعام خشبية', value: 18 },
    ],
  };
}

// ---- generic collection accessors ----------------------------------------

function collection(name, seedFactory) {
  return {
    all: async () => readCollection(name, seedFactory).items,
    replace: async (items) => {
      const { key } = readCollection(name, seedFactory);
      return writeCollection(key, items);
    },
  };
}

const suppliers = collection('suppliers', seedSuppliers);
// `employees_v2`, not `employees`: the shape moved from a flat
// role/permissions string pair to roleId + access-scope fields (see
// seedEmployees above) — same stale-cache guard as `products_v3` below.
const employees = collection('employees_v2', seedEmployees);
const teamRoles = collection('team_roles', seedTeamRoles);
const teamInvitations = collection('team_invitations', seedTeamInvitations);
const securityEvents = collection('security_events', seedSecurityEvents);
// `products_v3`, not `products`: readCollection() only reseeds on a cache
// miss, and this shape changed (added `categoryId`, then `images`/`video`)
// after some browsers had already cached the old shape — same class of bug
// fixed for `dashboard_series` above. Bump this suffix again if the shape
// changes further, so a stale cache can never silently hide new fields again.
const products = collection('products_v3', seedProducts);
const inventoryMovements = collection('inventory_movements', seedInventoryMovements);
const orders = collection('orders', seedOrders);
const payouts = collection('payouts', seedPayouts);
const tickets = collection('tickets', seedTickets);
const notifications = collection('notifications', seedNotifications);
const auditLog = collection('audit_log', seedAuditLog);
const fulfillmentProofs = collection('fulfillment_proofs', seedFulfillmentProofs);
const orderMessages = collection('order_messages', seedOrderMessages);
// `locations_v2`: the seed shape grew (province/district/manager/etc.) —
// same stale-cache guard as `employees_v2` above.
const locations = collection('locations_v2', seedLocations);
const categories = collection('categories', seedCategories);
const holidays = collection('holidays', seedHolidays);
const documents = collection('documents', seedDocuments);

async function appendAuditLog(entry) {
  const items = await auditLog.all();
  items.unshift({ id: nextId('audit'), at: new Date().toISOString(), ...entry });
  await auditLog.replace(items);
}

// ---- public API ------------------------------------------------------------

export async function getSuppliers() {
  return suppliers.all();
}

export async function getSupplier(supplierId) {
  return (await suppliers.all()).find((s) => s.id === supplierId) ?? null;
}

export async function getEmployees(supplierId) {
  return (await employees.all()).filter((e) => e.supplierId === supplierId);
}

// ---- team / roles / permissions -------------------------------------------
// This is the "فريق العمل" module. Every mutating function below starts
// with requirePermission() (or an owner-only / re-auth check) and THROWS
// if the calling member isn't actually authorized — the mock equivalent
// of a server rejecting an unauthorized API call. This is the strongest
// enforcement a browser-only, localStorage-backed prototype can offer:
// it stops the *UI* from ever completing an action the caller shouldn't
// be able to do, even if a bug let the button render. It is NOT real
// security — anyone with devtools can edit localStorage directly, since
// there is no server or database behind any of this. See
// src/features/supplier/team/permissions.js for the full caveat.

const INVITATION_TTL_HOURS = 72;

function nowIso() {
  return new Date().toISOString();
}

async function getEmployeeById(employeeId) {
  return (await employees.all()).find((e) => e.id === employeeId) ?? null;
}

async function getAllTeamRoles(supplierId) {
  const custom = (await teamRoles.all()).filter((r) => r.supplierId === supplierId);
  return [...DEFAULT_ROLES, ...custom];
}

async function requirePermission(supplierId, actorEmployeeId, permissionId) {
  const actor = await getEmployeeById(actorEmployeeId);
  const deny = async (reason) => {
    // Every denied attempt is logged too — not just successful actions —
    // so "نتيجة الإجراء: ناجح أو مرفوض" in the activity log is meaningful,
    // and a member probing for access they don't have leaves a trail.
    await appendAuditLog({ actorName: actor?.name ?? actorEmployeeId, action: `access.denied`, target: permissionId, details: { reason }, result: 'rejected' });
    await logSecurityEvent({ supplierId, type: 'access_denied', actorName: actor?.name ?? 'غير معروف', severity: 'danger', ownerNotify: false, detail: `محاولة وصول مرفوضة (${permissionId}): ${reason}` });
    throw new Error(reason);
  };
  if (!actor || actor.supplierId !== supplierId) return deny('غير مصرح: العضو غير موجود في هذه المؤسسة');
  if (actor.status !== 'active') return deny('غير مصرح: حساب العضو غير نشط');
  const roles = await getAllTeamRoles(supplierId);
  if (!membershipHasPermission(actor, permissionId, roles)) return deny('غير مصرح: لا تملك الصلاحية اللازمة لهذا الإجراء');
  return actor;
}

async function verifyOwnerPassword(supplierId, confirmPassword) {
  const supplier = await getSupplier(supplierId);
  if (!confirmPassword || confirmPassword !== supplier?.password) {
    throw new Error('كلمة المرور غير صحيحة — هذا إجراء حساس ويتطلب تأكيد كلمة المرور');
  }
}

async function logSecurityEvent({ supplierId, type, actorName, detail, severity = 'info', ownerNotify = false }) {
  const items = await securityEvents.all();
  items.unshift({ id: nextId('sec'), supplierId, type, actorName, detail, severity, ownerNotify, at: nowIso() });
  await securityEvents.replace(items);
}

function isMemberDuplicate(existingMembers, { phone, email }, excludeId = null) {
  return existingMembers.some((m) => {
    if (m.id === excludeId || m.status === 'revoked') return false;
    const samePhone = phone && m.phone && m.phone === phone;
    const sameEmail = email && m.email && m.email.toLowerCase() === email.toLowerCase();
    return samePhone || sameEmail;
  });
}

export function invitationEffectiveStatus(invitation) {
  if (invitation.status === 'pending' && new Date(invitation.expiresAt).getTime() < Date.now()) return 'expired';
  return invitation.status;
}

export async function getTeamRoles(supplierId) {
  return getAllTeamRoles(supplierId);
}

export async function getTeamMembers(supplierId) {
  return (await employees.all()).filter((e) => e.supplierId === supplierId);
}

export async function getTeamInvitations(supplierId) {
  return (await teamInvitations.all()).filter((i) => i.supplierId === supplierId);
}

export async function getSecurityEvents(supplierId) {
  return (await securityEvents.all()).filter((e) => e.supplierId === supplierId);
}

export async function getTeamStats(supplierId) {
  const [members, invitations, roles, events] = await Promise.all([
    getTeamMembers(supplierId), getTeamInvitations(supplierId), getAllTeamRoles(supplierId), getSecurityEvents(supplierId),
  ]);
  return {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    pendingInvites: invitations.filter((i) => invitationEffectiveStatus(i) === 'pending').length,
    suspended: members.filter((m) => m.status === 'suspended').length,
    customRoles: roles.filter((r) => !r.isSystem).length,
    lastSecurityEvent: events[0] ?? null,
  };
}

export async function createCustomRole({ supplierId, actorEmployeeId, name, description, color, permissions }) {
  await requirePermission(supplierId, actorEmployeeId, 'team.create_role');
  const trimmed = (name ?? '').trim();
  if (!trimmed) throw new Error('اسم الدور مطلوب');
  const roles = await getAllTeamRoles(supplierId);
  if (roles.some((r) => r.name.trim().toLowerCase() === trimmed.toLowerCase())) throw new Error('يوجد دور بنفس الاسم بالفعل');
  const items = await teamRoles.all();
  const role = {
    id: nextId('role'), supplierId, name: trimmed, description: (description ?? '').trim(),
    color: color || '#4C5E71', isSystem: false, permissions: [...(permissions ?? [])],
    createdBy: actorEmployeeId, createdAt: nowIso(),
  };
  items.push(role);
  await teamRoles.replace(items);
  await appendAuditLog({ actorName: (await getEmployeeById(actorEmployeeId))?.name, action: 'role.create', target: role.id, details: { name: trimmed, permissions: role.permissions } });
  return role;
}

export async function updateCustomRole({ roleId, actorEmployeeId, patch }) {
  const items = await teamRoles.all();
  const role = items.find((r) => r.id === roleId);
  if (!role) throw new Error('updateCustomRole: دور غير معروف أو غير قابل للتعديل (الأدوار الافتراضية ثابتة)');
  await requirePermission(role.supplierId, actorEmployeeId, 'team.edit_roles');
  Object.assign(role, patch);
  await teamRoles.replace(items);
  await appendAuditLog({ actorName: (await getEmployeeById(actorEmployeeId))?.name, action: 'role.update', target: roleId, details: patch });
  return role;
}

export async function inviteTeamMember({ supplierId, actorEmployeeId, confirmPassword, data }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'team.invite');
  const fullName = (data.fullName ?? '').trim();
  if (!fullName) throw new Error('الاسم الكامل مطلوب');
  if (!data.phone?.trim() && !data.email?.trim()) throw new Error('يجب إدخال رقم هاتف أو بريد إلكتروني');

  const roles = await getAllTeamRoles(supplierId);
  const role = resolveRole(data.roleId, roles);
  if (!role) throw new Error('الدور المحدد غير معروف');
  if (role.id === 'owner') throw new Error('لا يمكن دعوة عضو بدور المالك — استخدم نقل الملكية بدلًا من ذلك');

  if (grantsSensitivePermission(role.permissions)) await verifyOwnerPassword(supplierId, confirmPassword);

  const [members, invitations] = await Promise.all([getTeamMembers(supplierId), getTeamInvitations(supplierId)]);
  if (isMemberDuplicate(members, data)) throw new Error('هذا الرقم أو البريد لديه عضوية بالفعل في هذه المؤسسة');
  if (invitations.some((i) => invitationEffectiveStatus(i) === 'pending' && isMemberDuplicate([i], data))) {
    throw new Error('يوجد دعوة قيد الانتظار بنفس رقم الهاتف أو البريد بالفعل');
  }

  const items = await teamInvitations.all();
  const createdAt = nowIso();
  const invitation = {
    id: nextId('inv'), supplierId,
    fullName, phone: data.phone?.trim() || '', email: data.email?.trim() || '',
    jobTitle: (data.jobTitle ?? '').trim(), preferredLanguage: data.preferredLanguage || 'ar', internalNote: (data.internalNote ?? '').trim(),
    roleId: role.id, locationIds: data.locationIds ?? [], productScope: data.productScope ?? 'all',
    accessExpiresAt: data.accessExpiresAt || null, mustChangePassword: data.mustChangePassword !== false,
    invitedBy: actorEmployeeId, invitedByName: actor.name,
    status: 'pending', resentCount: 0, tokenVersion: 1,
    createdAt, expiresAt: new Date(Date.now() + INVITATION_TTL_HOURS * 3600 * 1000).toISOString(),
  };
  items.push(invitation);
  await teamInvitations.replace(items);

  const sensitive = grantsSensitivePermission(role.permissions);
  await appendAuditLog({ actorName: actor.name, action: 'invitation.send', target: invitation.id, details: { fullName, roleId: role.id, sensitive } });
  if (sensitive) {
    await logSecurityEvent({
      supplierId, type: 'sensitive_invite', actorName: actor.name, severity: 'warning', ownerNotify: true,
      detail: `دعوة عضو جديد (${fullName}) بدور «${role.name}» يتضمن صلاحيات حساسة`,
    });
  }
  return invitation;
}

export async function updateInvitationRole({ invitationId, actorEmployeeId, confirmPassword, roleId }) {
  const items = await teamInvitations.all();
  const invitation = items.find((i) => i.id === invitationId);
  if (!invitation) throw new Error('updateInvitationRole: دعوة غير معروفة');
  if (invitationEffectiveStatus(invitation) !== 'pending') throw new Error('لا يمكن تعديل دور دعوة لم تعد قيد الانتظار');
  const actor = await requirePermission(invitation.supplierId, actorEmployeeId, 'team.invite');
  const roles = await getAllTeamRoles(invitation.supplierId);
  const role = resolveRole(roleId, roles);
  if (!role || role.id === 'owner') throw new Error('الدور المحدد غير صالح');
  if (grantsSensitivePermission(role.permissions)) await verifyOwnerPassword(invitation.supplierId, confirmPassword);
  invitation.roleId = role.id;
  await teamInvitations.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'invitation.roleChange', target: invitationId, details: { roleId: role.id } });
  return invitation;
}

export async function resendTeamInvitation({ invitationId, actorEmployeeId }) {
  const items = await teamInvitations.all();
  const invitation = items.find((i) => i.id === invitationId);
  if (!invitation) throw new Error('resendTeamInvitation: دعوة غير معروفة');
  const actor = await requirePermission(invitation.supplierId, actorEmployeeId, 'team.resend_invite');
  if (invitation.status !== 'pending') throw new Error('لا يمكن إعادة إرسال دعوة غير قيد الانتظار');
  invitation.resentCount += 1;
  invitation.tokenVersion += 1; // invalidates whatever link was sent before
  invitation.expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 3600 * 1000).toISOString();
  await teamInvitations.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'invitation.resend', target: invitationId, details: {} });
  return invitation;
}

export async function cancelTeamInvitation({ invitationId, actorEmployeeId }) {
  const items = await teamInvitations.all();
  const invitation = items.find((i) => i.id === invitationId);
  if (!invitation) throw new Error('cancelTeamInvitation: دعوة غير معروفة');
  const actor = await requirePermission(invitation.supplierId, actorEmployeeId, 'team.invite');
  invitation.status = 'cancelled';
  invitation.tokenVersion += 1;
  await teamInvitations.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'invitation.cancel', target: invitationId, details: {} });
  return invitation;
}

/**
 * Simulates the invitee's own side of the flow (open link → verify →
 * set password → accept). There's no real SMS/email/link in this
 * prototype, so this single mock call stands in for steps 4–8 of the
 * spec's acceptance path. Deliberately takes no actorEmployeeId — the
 * invitee isn't a member yet, so there's nothing to check a permission
 * against.
 */
export async function acceptTeamInvitation({ invitationId }) {
  const invItems = await teamInvitations.all();
  const invitation = invItems.find((i) => i.id === invitationId);
  if (!invitation) throw new Error('acceptTeamInvitation: دعوة غير معروفة');
  const status = invitationEffectiveStatus(invitation);
  if (status !== 'pending') throw new Error(status === 'expired' ? 'انتهت صلاحية هذه الدعوة' : 'هذه الدعوة لم تعد صالحة');

  const members = await getTeamMembers(invitation.supplierId);
  if (isMemberDuplicate(members, invitation)) throw new Error('هذا الرقم أو البريد لديه عضوية بالفعل في هذه المؤسسة');

  const empItems = await employees.all();
  const member = {
    id: nextId('emp'), supplierId: invitation.supplierId,
    name: invitation.fullName, jobTitle: invitation.jobTitle,
    phone: invitation.phone, email: invitation.email, photo: null, preferredLanguage: invitation.preferredLanguage,
    roleId: invitation.roleId, locationIds: invitation.locationIds, productScope: invitation.productScope,
    accessExpiresAt: invitation.accessExpiresAt, mustChangePassword: invitation.mustChangePassword, internalNote: invitation.internalNote,
    status: 'active',
    invitedBy: invitation.invitedBy, invitedAt: invitation.createdAt, acceptedAt: nowIso(),
    lastLoginAt: nowIso(), activeSessionCount: 1,
    suspendedAt: null, suspendedReason: null,
    createdAt: nowIso(),
  };
  empItems.push(member);
  await employees.replace(empItems);

  invitation.status = 'accepted';
  await teamInvitations.replace(invItems);

  await appendAuditLog({ actorName: member.name, action: 'invitation.accept', target: member.id, details: { roleId: member.roleId } });
  return member;
}

export async function updateMemberAccess({ employeeId, actorEmployeeId, confirmPassword, patch }) {
  const items = await employees.all();
  const member = items.find((e) => e.id === employeeId);
  if (!member) throw new Error('updateMemberAccess: عضو غير معروف');
  const actor = await requirePermission(member.supplierId, actorEmployeeId, 'team.edit_role');
  if (member.roleId === 'owner') throw new Error('لا يمكن تعديل دور المالك مباشرة — استخدم نقل الملكية');

  if (patch.roleId && patch.roleId !== member.roleId) {
    const roles = await getAllTeamRoles(member.supplierId);
    const nextRole = resolveRole(patch.roleId, roles);
    if (!nextRole) throw new Error('الدور المحدد غير معروف');
    if (nextRole.id === 'owner') throw new Error('لا يمكن نقل الملكية من هنا — استخدم مسار نقل الملكية');
    if (grantsSensitivePermission(nextRole.permissions)) await verifyOwnerPassword(member.supplierId, confirmPassword);
  }

  const before = { roleId: member.roleId, locationIds: member.locationIds, productScope: member.productScope, accessExpiresAt: member.accessExpiresAt };
  Object.assign(member, patch);
  await employees.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'member.updateAccess', target: employeeId, details: { before, after: patch } });
  return member;
}

export async function suspendTeamMember({ employeeId, actorEmployeeId, reason }) {
  const items = await employees.all();
  const member = items.find((e) => e.id === employeeId);
  if (!member) throw new Error('suspendTeamMember: عضو غير معروف');
  if (member.roleId === 'owner') throw new Error('لا يمكن إيقاف المالك — انقل الملكية أولًا');
  const actor = await requirePermission(member.supplierId, actorEmployeeId, 'team.suspend_member');
  member.status = 'suspended';
  member.suspendedAt = nowIso();
  member.suspendedReason = (reason ?? '').trim();
  member.activeSessionCount = 0;
  await employees.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'member.suspend', target: employeeId, details: { reason: member.suspendedReason } });
  await logSecurityEvent({
    supplierId: member.supplierId, type: 'member_suspended', actorName: actor.name, severity: 'warning', ownerNotify: true,
    detail: `تم إيقاف ${member.name} مؤقتًا${member.suspendedReason ? ` — ${member.suspendedReason}` : ''}`,
  });
  return member;
}

export async function reactivateTeamMember({ employeeId, actorEmployeeId }) {
  const items = await employees.all();
  const member = items.find((e) => e.id === employeeId);
  if (!member) throw new Error('reactivateTeamMember: عضو غير معروف');
  const actor = await requirePermission(member.supplierId, actorEmployeeId, 'team.suspend_member');
  if (member.status !== 'suspended') throw new Error('يمكن إعادة تفعيل الأعضاء الموقوفين مؤقتًا فقط');
  member.status = 'active';
  member.suspendedAt = null;
  member.suspendedReason = null;
  await employees.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'member.reactivate', target: employeeId, details: {} });
  return member;
}

export async function revokeTeamMember({ employeeId, actorEmployeeId, reason }) {
  const items = await employees.all();
  const member = items.find((e) => e.id === employeeId);
  if (!member) throw new Error('revokeTeamMember: عضو غير معروف');
  if (member.roleId === 'owner') throw new Error('لا يمكن إلغاء وصول المالك — انقل الملكية أولًا');
  const actor = await requirePermission(member.supplierId, actorEmployeeId, 'team.suspend_member');
  member.status = 'revoked';
  member.suspendedAt = nowIso();
  member.suspendedReason = (reason ?? '').trim();
  member.activeSessionCount = 0;
  // Never deleted — history (products/orders/audit entries authored by
  // this member) stays intact and still shows their name.
  await employees.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'member.revoke', target: employeeId, details: { reason: member.suspendedReason } });
  await logSecurityEvent({
    supplierId: member.supplierId, type: 'member_revoked', actorName: actor.name, severity: 'warning', ownerNotify: true,
    detail: `تم إلغاء وصول ${member.name} نهائيًا${member.suspendedReason ? ` — ${member.suspendedReason}` : ''}`,
  });
  return member;
}

export async function endMemberSessions({ employeeId, actorEmployeeId }) {
  const items = await employees.all();
  const member = items.find((e) => e.id === employeeId);
  if (!member) throw new Error('endMemberSessions: عضو غير معروف');
  const actor = await requirePermission(member.supplierId, actorEmployeeId, 'team.manage_sessions');
  member.activeSessionCount = 0;
  await employees.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'member.endSessions', target: employeeId, details: {} });
  return member;
}

export async function endAllSessionsExceptOwner({ supplierId, actorEmployeeId, confirmPassword }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'team.manage_sessions');
  await verifyOwnerPassword(supplierId, confirmPassword);
  const items = await employees.all();
  items.forEach((m) => {
    if (m.supplierId === supplierId && m.roleId !== 'owner') m.activeSessionCount = 0;
  });
  await employees.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'team.endAllSessions', target: supplierId, details: {} });
  await logSecurityEvent({ supplierId, type: 'sessions_ended', actorName: actor.name, severity: 'warning', ownerNotify: true, detail: 'تم إنهاء جميع الجلسات عدا جلسة المالك' });
}

export async function transferSupplierOwnership({ supplierId, actorEmployeeId, confirmPassword, newOwnerEmployeeId }) {
  const items = await employees.all();
  const currentOwner = items.find((e) => e.id === actorEmployeeId && e.supplierId === supplierId);
  if (!currentOwner || currentOwner.roleId !== 'owner') throw new Error('نقل الملكية متاح لمالك الحساب الحالي فقط');
  const newOwner = items.find((e) => e.id === newOwnerEmployeeId && e.supplierId === supplierId);
  if (!newOwner) throw new Error('العضو الجديد غير معروف');
  if (newOwner.status !== 'active') throw new Error('يجب أن يكون العضو الجديد نشطًا للانتقال إليه بالملكية');
  await verifyOwnerPassword(supplierId, confirmPassword);

  const suppliersItems = await suppliers.all();
  const supplier = suppliersItems.find((s) => s.id === supplierId);
  if (!supplier) throw new Error('transferSupplierOwnership: مورد غير معروف');
  supplier.pendingOwnershipTransfer = { toEmployeeId: newOwnerEmployeeId, toName: newOwner.name, initiatedBy: actorEmployeeId, initiatedAt: nowIso() };
  await suppliers.replace(suppliersItems);

  await appendAuditLog({ actorName: currentOwner.name, action: 'ownership.transferInitiate', target: newOwnerEmployeeId, details: { toName: newOwner.name } });
  await logSecurityEvent({ supplierId, type: 'ownership_transfer_initiated', actorName: currentOwner.name, severity: 'warning', ownerNotify: true, detail: `بدء نقل ملكية الحساب إلى ${newOwner.name} — بانتظار تأكيده` });
  return supplier.pendingOwnershipTransfer;
}

export async function confirmSupplierOwnershipTransfer({ supplierId, employeeId }) {
  const suppliersItems = await suppliers.all();
  const supplier = suppliersItems.find((s) => s.id === supplierId);
  const pending = supplier?.pendingOwnershipTransfer;
  if (!pending || pending.toEmployeeId !== employeeId) throw new Error('لا يوجد نقل ملكية معلّق بانتظار تأكيدك');

  const items = await employees.all();
  const oldOwner = items.find((e) => e.roleId === 'owner' && e.supplierId === supplierId);
  const newOwner = items.find((e) => e.id === employeeId);
  if (oldOwner) oldOwner.roleId = 'manager';
  if (newOwner) newOwner.roleId = 'owner';
  await employees.replace(items);

  delete supplier.pendingOwnershipTransfer;
  await suppliers.replace(suppliersItems);

  await appendAuditLog({ actorName: newOwner?.name, action: 'ownership.transferConfirm', target: employeeId, details: {} });
  await logSecurityEvent({ supplierId, type: 'ownership_transferred', actorName: newOwner?.name, severity: 'warning', ownerNotify: true, detail: `تم نقل ملكية الحساب إلى ${newOwner?.name}` });
  return newOwner;
}

export async function cancelSupplierOwnershipTransfer({ supplierId, actorEmployeeId }) {
  await requirePermission(supplierId, actorEmployeeId, 'team.edit_role');
  const suppliersItems = await suppliers.all();
  const supplier = suppliersItems.find((s) => s.id === supplierId);
  if (!supplier?.pendingOwnershipTransfer) return;
  delete supplier.pendingOwnershipTransfer;
  await suppliers.replace(suppliersItems);
  await appendAuditLog({ actorName: (await getEmployeeById(actorEmployeeId))?.name, action: 'ownership.transferCancel', target: supplierId, details: {} });
}

// Every action taken anywhere in the supplier portal already lands in
// `auditLog` with `actorName` — this just gives the Team → "سجل النشاط"
// tab a filtered view over that same log, grouped into the categories
// the spec asks to filter by (member, product, order, financial, ...).
export const ACTIVITY_CATEGORIES = [
  { id: 'team', label: 'الفريق والصلاحيات', prefixes: ['member.', 'invitation.', 'role.', 'ownership.', 'team.', 'employee.'] },
  { id: 'products', label: 'المنتجات', prefixes: ['product.'] },
  { id: 'inventory', label: 'المخزون', prefixes: ['inventory.'] },
  { id: 'orders', label: 'الطلبات والتجهيز', prefixes: ['order.', 'fulfillment.'] },
  { id: 'disputes', label: 'المرتجعات والنزاعات', prefixes: ['ticket.'] },
  { id: 'settings', label: 'إعدادات المؤسسة', prefixes: ['supplier.', 'location.', 'category.'] },
];

export async function getTeamActivityLog(supplierId, filters = {}) {
  let list = await auditLog.all();
  if (filters.actorName) list = list.filter((e) => e.actorName === filters.actorName);
  if (filters.category) {
    const cat = ACTIVITY_CATEGORIES.find((c) => c.id === filters.category);
    if (cat) list = list.filter((e) => cat.prefixes.some((p) => e.action?.startsWith(p)));
  }
  if (filters.dateFrom) list = list.filter((e) => e.at >= filters.dateFrom);
  if (filters.dateTo) list = list.filter((e) => e.at <= `${filters.dateTo}T23:59:59.999Z`);
  return list;
}

export async function getProducts(supplierId) {
  return (await products.all()).filter((p) => p.supplierId === supplierId);
}

export async function getProduct(productId) {
  return (await products.all()).find((p) => p.id === productId) ?? null;
}

export async function addProduct({ supplierId, name, description, sector, categoryId, images, video, specs, variants, status, actorName }) {
  if (categoryId) {
    const category = (await categories.all()).find((c) => c.id === categoryId);
    if (!category || category.supplierId !== supplierId) throw new Error('القسم المختار غير تابع لهذا المورد');
  }
  const items = await products.all();
  const product = {
    id: nextId('prod'),
    supplierId,
    name,
    description,
    sector,
    categoryId: categoryId ?? null,
    images: images ?? [],
    video: video ?? null,
    specs: specs ?? '',
    status: status ?? 'pending',
    createdAt: new Date().toISOString(),
    variants: variants.map((v) => ({ id: nextId('var'), ...v })),
  };
  items.push(product);
  await products.replace(items);
  await appendAuditLog({ actorName, action: 'product.add', target: product.id, details: { name } });
  return product;
}

export async function updateProduct({ productId, patch, actorName }) {
  const items = await products.all();
  const product = items.find((p) => p.id === productId);
  if (!product) throw new Error(`updateProduct: unknown product "${productId}"`);
  if (patch.categoryId) {
    const category = (await categories.all()).find((c) => c.id === patch.categoryId);
    if (!category || category.supplierId !== product.supplierId) throw new Error('القسم المختار غير تابع لهذا المورد');
  }
  Object.assign(product, patch);
  await products.replace(items);
  await appendAuditLog({ actorName, action: 'product.update', target: productId, details: patch });
  return product;
}

export async function deleteProduct({ productId, actorName }) {
  const items = await products.all();
  const next = items.filter((p) => p.id !== productId);
  await products.replace(next);
  await appendAuditLog({ actorName, action: 'product.delete', target: productId, details: {} });
}

export async function duplicateProduct({ productId, actorName }) {
  const items = await products.all();
  const source = items.find((p) => p.id === productId);
  if (!source) throw new Error(`duplicateProduct: unknown product "${productId}"`);
  const copy = {
    ...source,
    id: nextId('prod'),
    name: `${source.name} (نسخة)`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    variants: source.variants.map((v) => ({ ...v, id: nextId('var') })),
  };
  items.push(copy);
  await products.replace(items);
  await appendAuditLog({ actorName, action: 'product.duplicate', target: copy.id, details: { sourceId: productId } });
  return copy;
}

export async function updateProductStatus({ productId, status, actorName }) {
  const items = await products.all();
  const product = items.find((p) => p.id === productId);
  if (!product) throw new Error(`updateProductStatus: unknown product "${productId}"`);
  product.status = status;
  await products.replace(items);
  await appendAuditLog({ actorName, action: 'product.statusChange', target: productId, details: { status } });
  return product;
}

export async function getInventoryMovements(productId) {
  const items = await inventoryMovements.all();
  return productId ? items.filter((m) => m.productId === productId) : items;
}

export async function adjustInventory({ productId, variantId, delta, reason, actorName }) {
  const productItems = await products.all();
  const product = productItems.find((p) => p.id === productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!variant) throw new Error(`adjustInventory: unknown variant "${variantId}" on product "${productId}"`);
  variant.stock.actual += delta;
  await products.replace(productItems);

  const movementItems = await inventoryMovements.all();
  const movement = { id: nextId('mov'), productId, variantId, delta, reason, actorName, at: new Date().toISOString() };
  movementItems.unshift(movement);
  await inventoryMovements.replace(movementItems);
  await appendAuditLog({ actorName, action: 'inventory.adjust', target: `${productId}/${variantId}`, details: { delta, reason } });
  return movement;
}

export async function getOrders(supplierId, { status } = {}) {
  const items = (await orders.all()).filter((o) => o.supplierId === supplierId);
  return status ? items.filter((o) => o.status === status) : items;
}

export async function updateOrderStatus({ orderId, status, actorName }) {
  const items = await orders.all();
  const order = items.find((o) => o.id === orderId);
  if (!order) throw new Error(`updateOrderStatus: unknown order "${orderId}"`);
  order.status = status;
  await orders.replace(items);
  await appendAuditLog({ actorName, action: 'order.statusChange', target: orderId, details: { status } });
  return order;
}

export async function getPayouts(supplierId) {
  return (await payouts.all()).filter((p) => p.supplierId === supplierId);
}

export async function getTickets(supplierId) {
  const items = await tickets.all();
  return supplierId ? items.filter((t) => t.supplierId === supplierId) : items;
}

export async function createTicket({ supplierId, subject, relatedType, relatedId, reason, message, actorName }) {
  const items = await tickets.all();
  const now = new Date().toISOString();
  const ticket = {
    id: nextId('tkt'),
    supplierId,
    subject,
    relatedType,
    relatedId,
    reason,
    status: 'open',
    evidenceFiles: [],
    messages: message ? [{ from: actorName, text: message, at: now }] : [],
    createdAt: now,
    updatedAt: now,
  };
  items.unshift(ticket);
  await tickets.replace(items);
  await appendAuditLog({ actorName, action: 'ticket.create', target: ticket.id, details: { subject, relatedType, relatedId } });
  return ticket;
}

export async function addTicketReply({ ticketId, text, actorName }) {
  const items = await tickets.all();
  const ticket = items.find((t) => t.id === ticketId);
  if (!ticket) throw new Error(`addTicketReply: unknown ticket "${ticketId}"`);
  const now = new Date().toISOString();
  ticket.messages.push({ from: actorName, text, at: now });
  ticket.updatedAt = now;
  await tickets.replace(items);
  await appendAuditLog({ actorName, action: 'ticket.reply', target: ticketId, details: {} });
  return ticket;
}

export async function updateTicketStatus({ ticketId, status, actorName }) {
  const items = await tickets.all();
  const ticket = items.find((t) => t.id === ticketId);
  if (!ticket) throw new Error(`updateTicketStatus: unknown ticket "${ticketId}"`);
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  await tickets.replace(items);
  await appendAuditLog({ actorName, action: 'ticket.statusChange', target: ticketId, details: { status } });
  return ticket;
}

export async function getFulfillmentProofs(orderId) {
  const items = await fulfillmentProofs.all();
  return orderId ? items.filter((p) => p.orderId === orderId) : items;
}

export async function addFulfillmentProof({ orderId, files, note, uploadedBy, actorName }) {
  const items = await fulfillmentProofs.all();
  const proof = { id: nextId('proof'), orderId, files, note, uploadedBy, uploadedAt: new Date().toISOString() };
  items.unshift(proof);
  await fulfillmentProofs.replace(items);
  await appendAuditLog({ actorName, action: 'fulfillment.proofUpload', target: orderId, details: { fileCount: files.length } });
  return proof;
}

export async function getOrderMessages(orderId) {
  const items = await orderMessages.all();
  return items.filter((m) => m.orderId === orderId).sort((a, b) => new Date(a.at) - new Date(b.at));
}

export async function addOrderMessage({ orderId, from, role, text }) {
  const items = await orderMessages.all();
  // A message the supplier sends is "read" from their own side by
  // definition; incoming messages start unread until the thread is opened.
  const message = { id: nextId('msg'), orderId, from, role, text, at: new Date().toISOString(), read: role === 'supplier' };
  items.push(message);
  await orderMessages.replace(items);
  return message;
}

export async function markOrderMessagesRead(orderId) {
  const items = await orderMessages.all();
  let changed = false;
  items.forEach((m) => {
    if (m.orderId === orderId && !m.read) { m.read = true; changed = true; }
  });
  if (changed) await orderMessages.replace(items);
}

export async function getUnreadOrderMessageCounts(supplierId) {
  const [orderList, messages] = await Promise.all([getOrders(supplierId), orderMessages.all()]);
  const orderIds = new Set(orderList.map((o) => o.id));
  const counts = {};
  messages.forEach((m) => {
    if (!m.read && orderIds.has(m.orderId)) counts[m.orderId] = (counts[m.orderId] ?? 0) + 1;
  });
  return counts;
}

export async function getLocations(supplierId) {
  return (await locations.all()).filter((l) => l.supplierId === supplierId);
}

export async function addLocation({ supplierId, actorEmployeeId, data }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.manage_locations');
  const items = await locations.all();
  const location = {
    id: nextId('loc'), supplierId, active: true, status: 'active', isDefault: items.length === 0,
    updatedAt: nowIso(), updatedBy: actor.name, ...data,
  };
  items.push(location);
  await locations.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'location.add', target: location.id, details: { name: location.name, city: location.city } });
  return location;
}

export async function updateLocation({ locationId, actorEmployeeId, patch }) {
  const items = await locations.all();
  const location = items.find((l) => l.id === locationId);
  if (!location) throw new Error('updateLocation: موقع غير معروف');
  const actor = await requirePermission(location.supplierId, actorEmployeeId, 'settings.manage_locations');

  // Deactivating a location with open orders or on-hand stock needs an
  // explicit acknowledgement from the caller (`confirmDespiteOpenActivity`)
  // instead of silently stranding those orders/stock.
  if (patch.status && patch.status !== 'active' && location.status === 'active' && !patch.confirmDespiteOpenActivity) {
    const [openOrders, allProducts] = await Promise.all([getOrders(location.supplierId), getProducts(location.supplierId)]);
    const hasOpenOrders = openOrders.some((o) => o.fulfillmentLocation === location.name && !['completed', 'cancelled'].includes(o.status));
    const hasStock = allProducts.some((p) => p.variants.some((v) => v.location === location.name && v.stock.actual > 0));
    if (hasOpenOrders || hasStock) {
      throw new Error(
        hasOpenOrders && hasStock
          ? 'هذا الموقع لديه طلبات مفتوحة ومخزون قائم — راجع الطلبات والمخزون أولًا أو أكّد الإيقاف رغم ذلك'
          : hasOpenOrders
            ? 'هذا الموقع لديه طلبات تجهيز مفتوحة — راجعها أولًا أو أكّد الإيقاف رغم ذلك'
            : 'هذا الموقع لديه مخزون قائم — انقل الكميات أولًا أو أكّد الإيقاف رغم ذلك',
      );
    }
  }
  delete patch.confirmDespiteOpenActivity;

  if (patch.isDefault) {
    items.forEach((l) => { if (l.supplierId === location.supplierId) l.isDefault = false; });
  }

  Object.assign(location, patch, { updatedAt: nowIso(), updatedBy: actor.name });
  await locations.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'location.update', target: locationId, details: patch });
  return location;
}

export async function updateSupplierSettings({ supplierId, patch, actorName }) {
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  if (!supplier) throw new Error(`updateSupplierSettings: unknown supplier "${supplierId}"`);
  Object.assign(supplier, patch);
  await suppliers.replace(items);
  await appendAuditLog({ actorName, action: 'supplier.settingsUpdate', target: supplierId, details: patch });
  return supplier;
}

export async function getNotifications(supplierId) {
  return (await notifications.all()).filter((n) => n.supplierId === supplierId);
}

// ---- settings section (see src/features/supplier/settings/) --------------
// Every versioned section below (`fulfillmentSettings`, `catalogSettings`,
// `inventorySettings`, `businessHours`) carries `updatedAt`/`updatedBy` and
// a lightweight optimistic-concurrency check: the page passes back the
// `updatedAt` it loaded, and the save is rejected if someone else already
// saved a newer version — the mock equivalent of the "two sessions
// shouldn't silently overwrite each other" requirement. This is enforced
// here, not just in the UI.

async function updateVersionedSetting({ supplierId, actorEmployeeId, permissionId, field, patch, expectedUpdatedAt }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, permissionId);
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  if (!supplier) throw new Error('updateVersionedSetting: مورد غير معروف');
  const current = supplier[field] ?? {};
  if (expectedUpdatedAt && current.updatedAt && current.updatedAt !== expectedUpdatedAt) {
    throw new Error('تم تعديل هذا القسم من جلسة أخرى منذ آخر تحميل — يرجى إعادة تحميل الصفحة قبل الحفظ لتفادي الكتابة فوق تعديل زميلك');
  }
  const next = { ...current, ...patch, updatedAt: nowIso(), updatedBy: actor.name };
  supplier[field] = next;
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: `settings.${field}Update`, target: supplierId, details: { patch } });
  return next;
}

export async function updateFulfillmentSettings(args) {
  return updateVersionedSetting({ ...args, permissionId: 'settings.manage_fulfillment', field: 'fulfillmentSettings' });
}
export async function updateCatalogSettings(args) {
  return updateVersionedSetting({ ...args, permissionId: 'settings.manage_catalog', field: 'catalogSettings' });
}
export async function updateInventorySettings(args) {
  return updateVersionedSetting({ ...args, permissionId: 'settings.manage_inventory_settings', field: 'inventorySettings' });
}
export async function updateBusinessHours(args) {
  return updateVersionedSetting({ ...args, permissionId: 'settings.manage_hours', field: 'businessHours' });
}

// ---- general profile (legal/identity fields go through review) -----------

export async function updateGeneralProfile({ supplierId, actorEmployeeId, patch }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.edit_general');
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  if (!supplier) throw new Error('updateGeneralProfile: مورد غير معروف');

  const direct = {};
  const queued = [];
  Object.entries(patch).forEach(([key, value]) => {
    if (REVIEW_REQUIRED_FIELDS.includes(key) && value !== supplier[key]) queued.push({ key, value });
    else direct[key] = value;
  });

  Object.assign(supplier, direct);

  queued.forEach(({ key, value }) => {
    supplier.pendingChanges = (supplier.pendingChanges ?? []).filter((c) => c.field !== key || c.status !== 'pending');
    supplier.pendingChanges.push({
      id: nextId('chg'), field: key, oldValue: supplier[key], newValue: value,
      status: 'pending', reason: '', requestedBy: actorEmployeeId, requestedByName: actor.name,
      requestedAt: nowIso(), reviewedAt: null, reviewNote: '',
    });
  });

  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.generalProfileUpdate', target: supplierId, details: { direct: Object.keys(direct), queuedForReview: queued.map((q) => q.key) } });
  return { supplier, queuedCount: queued.length };
}

/**
 * Stands in for a whole separate admin app that doesn't exist in this
 * prototype — mdrar's own back office would review `pendingChanges` there.
 * Deliberately unauthenticated (no actorEmployeeId / permission check):
 * it's a demo tool, not a real supplier-side action.
 */
export async function simulateReviewDecision({ supplierId, changeId, decision, note }) {
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  const change = supplier?.pendingChanges?.find((c) => c.id === changeId);
  if (!change) throw new Error('simulateReviewDecision: تغيير غير معروف');
  change.status = decision;
  change.reviewedAt = nowIso();
  change.reviewNote = note ?? '';
  if (decision === 'approved') supplier[change.field] = change.newValue;
  await suppliers.replace(items);
  await appendAuditLog({ actorName: 'إدارة مدرار (محاكاة)', action: 'settings.reviewDecision', target: changeId, details: { field: change.field, decision } });
  return change;
}

// ---- contact info (phone/email changes go through a verify step) ---------

export async function updateContactInfo({ supplierId, actorEmployeeId, confirmPassword, patch }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.edit_contact');
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  if (!supplier) throw new Error('updateContactInfo: مورد غير معروف');

  const changingPrimaryPhone = patch.phone && patch.phone !== supplier.phone;
  const changingPrimaryEmail = patch.email && patch.email !== supplier.email;
  if (changingPrimaryPhone || changingPrimaryEmail) await verifyOwnerPassword(supplierId, confirmPassword);

  const direct = { ...patch };
  if (changingPrimaryPhone) {
    supplier.pendingPhoneVerification = { value: patch.phone, previous: supplier.phone, requestedAt: nowIso() };
    delete direct.phone;
  }
  if (changingPrimaryEmail) {
    supplier.pendingEmailVerification = { value: patch.email, previous: supplier.email, requestedAt: nowIso() };
    delete direct.email;
  }
  Object.assign(supplier, direct);
  await suppliers.replace(items);

  await appendAuditLog({ actorName: actor.name, action: 'settings.contactInfoUpdate', target: supplierId, details: { patch: Object.keys(patch) } });
  if (changingPrimaryPhone || changingPrimaryEmail) {
    await logSecurityEvent({
      supplierId, type: 'contact_change_pending', actorName: actor.name, severity: 'warning', ownerNotify: true,
      detail: `طلب تغيير ${changingPrimaryPhone ? 'رقم الهاتف الأساسي' : ''}${changingPrimaryPhone && changingPrimaryEmail ? ' و' : ''}${changingPrimaryEmail ? 'البريد الإلكتروني الأساسي' : ''} — بانتظار التحقق`,
    });
  }
  return supplier;
}

/** Simulates entering the verification code sent to the new phone/email — there's no real SMS/email provider in this prototype. */
export async function confirmContactVerification({ supplierId, actorEmployeeId, channel }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.edit_contact');
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  const pendingKey = channel === 'phone' ? 'pendingPhoneVerification' : 'pendingEmailVerification';
  const pending = supplier?.[pendingKey];
  if (!pending) throw new Error('لا يوجد تغيير بانتظار التحقق');
  const previous = supplier[channel];
  supplier[channel] = pending.value;
  supplier[pendingKey] = null;
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.contactVerified', target: supplierId, details: { channel, previous, next: pending.value } });
  await logSecurityEvent({ supplierId, type: 'contact_changed', actorName: actor.name, severity: 'warning', ownerNotify: true, detail: `تم تأكيد تغيير ${channel === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'} — تم إشعار الوسيلة السابقة (${previous || '—'})` });
  return supplier;
}

// ---- holidays --------------------------------------------------------------

export async function getHolidays(supplierId) {
  return (await holidays.all()).filter((h) => h.supplierId === supplierId);
}

export async function addHoliday({ supplierId, actorEmployeeId, data }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.manage_hours');
  const items = await holidays.all();
  const holiday = { id: nextId('hol'), supplierId, status: 'upcoming', createdBy: actorEmployeeId, createdAt: nowIso(), ...data };
  items.push(holiday);
  await holidays.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.holidayAdd', target: holiday.id, details: { title: holiday.title } });
  if (data.notifyMidrar) {
    await logSecurityEvent({ supplierId, type: 'long_closure', actorName: actor.name, severity: 'info', ownerNotify: false, detail: `تم إعلام إدارة مدرار بتوقف طويل: ${holiday.title}` });
  }
  return holiday;
}

export async function cancelHoliday({ holidayId, actorEmployeeId }) {
  const items = await holidays.all();
  const holiday = items.find((h) => h.id === holidayId);
  if (!holiday) throw new Error('cancelHoliday: إجازة غير معروفة');
  const actor = await requirePermission(holiday.supplierId, actorEmployeeId, 'settings.manage_hours');
  holiday.status = 'cancelled';
  await holidays.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.holidayCancel', target: holidayId, details: {} });
  return holiday;
}

// ---- payout method ----------------------------------------------------------

// The account password is shared at the supplier-org level (see
// `supplier.password`) rather than per-employee — same simplification the
// rest of this prototype already uses (verifyOwnerPassword() re-checks
// this same field for every sensitive re-auth prompt).
export async function changeAccountPassword({ supplierId, actorEmployeeId, currentPassword, newPassword }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.manage_sessions');
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  if (currentPassword !== supplier.password) throw new Error('كلمة المرور الحالية غير صحيحة');
  supplier.password = newPassword;
  supplier.lastPasswordChange = nowIso();
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.passwordChange', target: supplierId, details: {} });
  await logSecurityEvent({ supplierId, type: 'password_changed', actorName: actor.name, severity: 'warning', ownerNotify: true, detail: `تم تغيير كلمة مرور الحساب بواسطة ${actor.name}` });
  return supplier;
}

export async function updatePayoutMethod({ supplierId, actorEmployeeId, confirmPassword, patch }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'finance.edit_payout_method');
  await verifyOwnerPassword(supplierId, confirmPassword);
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  if (!supplier) throw new Error('updatePayoutMethod: مورد غير معروف');

  const previous = supplier.payoutMethod;
  const next = {
    ...patch, status: 'pending', securityHoldUntil: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    updatedAt: nowIso(), updatedBy: actor.name, previous: previous ? { ...previous, previous: undefined } : null,
  };
  supplier.payoutMethod = next;
  await suppliers.replace(items);

  await appendAuditLog({
    actorName: actor.name, action: 'settings.payoutMethodUpdate', target: supplierId,
    details: { previousNumberMasked: maskAccountNumber(previous?.number), nextNumberMasked: maskAccountNumber(patch.number) },
  });
  await logSecurityEvent({ supplierId, type: 'payout_method_changed', actorName: actor.name, severity: 'warning', ownerNotify: true, detail: 'تم تغيير وسيلة استلام الأموال — بانتظار التحقق، وسريّة تنفيذ الدفعات إليها معلّقة 24 ساعة' });
  return next;
}

function maskAccountNumber(number) {
  if (!number) return '—';
  const str = String(number);
  return str.length <= 4 ? str : `${'*'.repeat(str.length - 4)}${str.slice(-4)}`;
}

// ---- notifications ----------------------------------------------------------

function defaultNotificationPrefs() {
  return Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [
    c.id,
    { channels: { inApp: true, sms: c.critical, email: true, dailyDigest: false }, recipientIds: [], locked: c.critical },
  ]));
}

export async function getNotificationPreferences(supplierId) {
  const supplier = await getSupplier(supplierId);
  return supplier?.notificationPrefs ?? defaultNotificationPrefs();
}

export async function updateNotificationPreferences({ supplierId, actorEmployeeId, patch }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.manage_notifications');
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  const current = supplier.notificationPrefs ?? defaultNotificationPrefs();
  const next = { ...current };
  Object.entries(patch).forEach(([categoryId, categoryPatch]) => {
    const category = NOTIFICATION_CATEGORIES.find((c) => c.id === categoryId);
    if (category?.critical) return; // critical categories can never be turned off
    next[categoryId] = { ...current[categoryId], ...categoryPatch };
  });
  supplier.notificationPrefs = next;
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.notificationsUpdate', target: supplierId, details: {} });
  return next;
}

// ---- documents ---------------------------------------------------------------

export function documentEffectiveStatus(doc) {
  if (doc.status === 'archived' || doc.status === 'rejected' || doc.status === 'needs_correction' || doc.status === 'pending_review' || doc.status === 'not_uploaded') return doc.status;
  if (!doc.expiryDate) return doc.status;
  const daysLeft = (new Date(doc.expiryDate).getTime() - Date.now()) / (24 * 3600 * 1000);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'expiring_soon';
  return doc.status;
}

export async function getDocuments(supplierId) {
  return (await documents.all()).filter((d) => d.supplierId === supplierId);
}

export async function upsertDocument({ supplierId, actorEmployeeId, document }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.manage_documents');
  const items = await documents.all();
  if (document.id) {
    const existing = items.find((d) => d.id === document.id);
    if (!existing) throw new Error('upsertDocument: مستند غير معروف');
    Object.assign(existing, document, { status: 'pending_review', updatedAt: nowIso(), updatedBy: actor.name });
    await documents.replace(items);
    await appendAuditLog({ actorName: actor.name, action: 'settings.documentUpdate', target: existing.id, details: { type: existing.type } });
    return existing;
  }
  const created = { id: nextId('doc'), supplierId, status: 'pending_review', reviewNote: '', updatedAt: nowIso(), updatedBy: actor.name, ...document };
  items.push(created);
  await documents.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.documentAdd', target: created.id, details: { type: created.type } });
  return created;
}

/** Never a hard delete — a superseded/expired document stays archived with its edit history, per the retention rule. */
export async function archiveDocument({ documentId, actorEmployeeId }) {
  const items = await documents.all();
  const doc = items.find((d) => d.id === documentId);
  if (!doc) throw new Error('archiveDocument: مستند غير معروف');
  const actor = await requirePermission(doc.supplierId, actorEmployeeId, 'settings.manage_documents');
  doc.status = 'archived';
  doc.updatedAt = nowIso();
  doc.updatedBy = actor.name;
  await documents.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.documentArchive', target: documentId, details: {} });
  return doc;
}

// ---- per-user display preferences (personal, never shared across the team) --

export function defaultUserPreferences() {
  return {
    timezone: 'Asia/Damascus', dateFormat: 'DD/MM/YYYY', numberFormat: 'ar', currencyDisplay: 'symbol',
    density: 'comfortable', rowsPerPage: 20, rememberFilters: true, landingPage: '/supplier',
  };
}

export async function updateUserPreferences({ employeeId, patch }) {
  const items = await employees.all();
  const member = items.find((e) => e.id === employeeId);
  if (!member) throw new Error('updateUserPreferences: عضو غير معروف');
  const { language, ...prefsPatch } = patch;
  if (language) member.preferredLanguage = language;
  member.preferences = { ...(member.preferences ?? defaultUserPreferences()), ...prefsPatch };
  await employees.replace(items);
  // Personal, not security/financial — intentionally not written to the
  // shared audit log so it doesn't clutter "سجل التغييرات" with noise
  // only relevant to one person's own screen.
  return member.preferences;
}

// ---- settings change log ------------------------------------------------

export const SETTINGS_LOG_SECTIONS = [
  { id: 'profile', label: 'الملف العام', prefixes: ['settings.generalProfileUpdate', 'settings.reviewDecision'] },
  { id: 'contact', label: 'بيانات التواصل', prefixes: ['settings.contactInfoUpdate', 'settings.contactVerified'] },
  { id: 'locations', label: 'مواقع التجهيز', prefixes: ['location.'] },
  { id: 'hours', label: 'أوقات العمل والإجازات', prefixes: ['settings.businessHoursUpdate', 'settings.holiday'] },
  { id: 'fulfillment', label: 'الطلبات والتجهيز', prefixes: ['settings.fulfillmentSettingsUpdate'] },
  { id: 'catalog', label: 'المنتجات والمخزون', prefixes: ['settings.catalogSettingsUpdate', 'settings.inventorySettingsUpdate'] },
  { id: 'financial', label: 'المالية', prefixes: ['settings.payoutMethodUpdate'] },
  { id: 'notifications', label: 'الإشعارات', prefixes: ['settings.notificationsUpdate'] },
  { id: 'documents', label: 'الوثائق', prefixes: ['settings.document'] },
  { id: 'account', label: 'إدارة الحساب', prefixes: ['settings.orderPause', 'settings.accountPause', 'settings.accountResume', 'settings.closureRequest'] },
];

export async function getSettingsChangeLog(supplierId, filters = {}) {
  let list = await auditLog.all();
  list = list.filter((e) => e.action?.startsWith('settings.') || e.action?.startsWith('location.'));
  if (filters.actorName) list = list.filter((e) => e.actorName === filters.actorName);
  if (filters.section) {
    const section = SETTINGS_LOG_SECTIONS.find((s) => s.id === filters.section);
    if (section) list = list.filter((e) => section.prefixes.some((p) => e.action?.startsWith(p)));
  }
  if (filters.dateFrom) list = list.filter((e) => e.at >= filters.dateFrom);
  if (filters.dateTo) list = list.filter((e) => e.at <= `${filters.dateTo}T23:59:59.999Z`);
  return list;
}

// ---- account management ---------------------------------------------------

export async function pauseOrderIntake({ supplierId, actorEmployeeId, dateFrom, dateTo, locationIds, reason }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.pause_orders');
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  const window = { id: nextId('pause'), dateFrom, dateTo, locationIds: locationIds ?? [], reason, createdBy: actor.name, createdAt: nowIso() };
  supplier.orderPauseWindows = [...(supplier.orderPauseWindows ?? []), window];
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.orderPauseAdd', target: supplierId, details: { dateFrom, dateTo, reason } });
  return window;
}

export async function cancelOrderPause({ supplierId, actorEmployeeId, windowId }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.pause_orders');
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  supplier.orderPauseWindows = (supplier.orderPauseWindows ?? []).filter((w) => w.id !== windowId);
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.orderPauseCancel', target: windowId, details: {} });
}

async function getClosureBlockers(supplierId) {
  const [openOrders, openPayouts, openTickets] = await Promise.all([
    getOrders(supplierId), getPayouts(supplierId), getTickets(supplierId),
  ]);
  const blockers = [];
  const pendingOrders = openOrders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  if (pendingOrders.length) blockers.push(`${pendingOrders.length} طلب مفتوح لم يكتمل بعد`);
  const pendingPayouts = openPayouts.filter((p) => p.status === 'eligible' && !p.executedAt);
  if (pendingPayouts.length) blockers.push(`${pendingPayouts.length} مستحقات لم تُصرف بعد`);
  const openDisputes = openTickets.filter((t) => t.status !== 'resolved');
  if (openDisputes.length) blockers.push(`${openDisputes.length} نزاع/تذكرة مفتوحة`);
  return blockers;
}

export async function pauseSupplierAccount({ supplierId, actorEmployeeId, confirmPassword, reason }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.pause_orders');
  await verifyOwnerPassword(supplierId, confirmPassword);
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  supplier.accountStatus = 'paused';
  supplier.pausedAt = nowIso();
  supplier.pausedReason = reason ?? '';
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.accountPause', target: supplierId, details: { reason } });
  await logSecurityEvent({ supplierId, type: 'account_paused', actorName: actor.name, severity: 'warning', ownerNotify: true, detail: `تم إيقاف الحساب مؤقتًا${reason ? ` — ${reason}` : ''}` });
  return supplier;
}

export async function resumeSupplierAccount({ supplierId, actorEmployeeId }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.pause_orders');
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  supplier.accountStatus = 'active';
  supplier.pausedAt = null;
  supplier.pausedReason = null;
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.accountResume', target: supplierId, details: {} });
  return supplier;
}

export async function requestAccountClosure({ supplierId, actorEmployeeId, confirmPassword, reason }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.request_account_closure');
  const blockers = await getClosureBlockers(supplierId);
  if (blockers.length) throw new Error(`لا يمكن إرسال طلب الإغلاق الآن: ${blockers.join('، ')}`);
  await verifyOwnerPassword(supplierId, confirmPassword);
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  supplier.closureRequest = { status: 'pending', reason, requestedBy: actor.name, requestedAt: nowIso() };
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.closureRequestSubmit', target: supplierId, details: { reason } });
  await logSecurityEvent({ supplierId, type: 'closure_requested', actorName: actor.name, severity: 'warning', ownerNotify: true, detail: `تم إرسال طلب إغلاق الحساب إلى إدارة مدرار — ${reason}` });
  return supplier.closureRequest;
}

export async function cancelAccountClosureRequest({ supplierId, actorEmployeeId }) {
  const actor = await requirePermission(supplierId, actorEmployeeId, 'settings.request_account_closure');
  const items = await suppliers.all();
  const supplier = items.find((s) => s.id === supplierId);
  supplier.closureRequest = null;
  await suppliers.replace(items);
  await appendAuditLog({ actorName: actor.name, action: 'settings.closureRequestCancel', target: supplierId, details: {} });
}

/** Self-service export of the supplier's own org data — never includes masked merchant/customer identities, since those never belong to the supplier's own record in the first place. */
export async function exportSupplierData({ supplierId, actorEmployeeId }) {
  await requirePermission(supplierId, actorEmployeeId, 'settings.export_data');
  const [supplier, locs, docs, members] = await Promise.all([
    getSupplier(supplierId), getLocations(supplierId), getDocuments(supplierId), getTeamMembers(supplierId),
  ]);
  const { password, ...safeSupplier } = supplier; // eslint-disable-line no-unused-vars
  return {
    exportedAt: nowIso(),
    profile: safeSupplier,
    locations: locs,
    documents: docs.map(({ file, ...rest }) => rest), // eslint-disable-line no-unused-vars
    team: members.map((m) => ({ name: m.name, jobTitle: m.jobTitle, role: m.roleId, status: m.status })),
  };
}

// ---- settings overview / completion ---------------------------------------

export async function getSettingsOverview(supplierId, actorEmployeeId) {
  await requirePermission(supplierId, actorEmployeeId, 'settings.view');
  const [supplier, locs, docs, members, invitations] = await Promise.all([
    getSupplier(supplierId), getLocations(supplierId), getDocuments(supplierId), getTeamMembers(supplierId), getTeamInvitations(supplierId),
  ]);

  const profileFields = [supplier.legalName, supplier.companyName, supplier.activityType, supplier.city, supplier.commercialRegister];
  const contactFields = [supplier.fullName, supplier.phone, supplier.email];
  const filledCount = [...profileFields, ...contactFields].filter(Boolean).length;
  const totalFields = profileFields.length + contactFields.length;
  const hasActiveLocation = locs.some((l) => l.status === 'active');
  const hasPayoutMethod = Boolean(supplier.payoutMethod?.number);
  const requiredDocTypes = ['national_id', 'license'];
  const hasRequiredDocs = requiredDocTypes.every((t) => docs.some((d) => d.type === t && documentEffectiveStatus(d) === 'approved'));
  const completionParts = [filledCount === totalFields, hasActiveLocation, hasPayoutMethod, hasRequiredDocs, Boolean(supplier.businessHours)];
  const completionPercent = Math.round((completionParts.filter(Boolean).length / completionParts.length) * 100);

  const expiringDocs = docs.filter((d) => ['expiring_soon', 'expired'].includes(documentEffectiveStatus(d)));
  const actions = [];
  if (!hasActiveLocation) actions.push({ id: 'add_location', label: 'إضافة موقع تجهيز', priority: 1 });
  if (filledCount < totalFields) actions.push({ id: 'complete_contact', label: 'إكمال بيانات التواصل', priority: 2 });
  if (!hasPayoutMethod) actions.push({ id: 'add_payout', label: 'إضافة وسيلة استلام مستحقات', priority: 2 });
  if (!supplier.businessHours) actions.push({ id: 'set_hours', label: 'تحديد ساعات العمل', priority: 3 });
  expiringDocs.forEach((d) => actions.push({ id: `doc_${d.id}`, label: `تحديث وثيقة منتهية أو قاربت على الانتهاء (${d.type})`, priority: 1 }));
  if (docs.some((d) => documentEffectiveStatus(d) === 'not_uploaded')) actions.push({ id: 'upload_doc', label: 'رفع وثيقة مطلوبة', priority: 2 });
  actions.sort((a, b) => a.priority - b.priority);

  const events = await getSecurityEvents(supplierId);

  return {
    completionPercent,
    verificationStatus: supplier.status,
    activeLocationsCount: locs.filter((l) => l.status === 'active').length,
    payoutMethodStatus: supplier.payoutMethod?.status ?? 'pending',
    expiringDocuments: expiringDocs.length,
    actionsNeeded: actions,
    activeTeamMembers: members.filter((m) => m.status === 'active').length,
    pendingInvitations: invitations.filter((i) => invitationEffectiveStatus(i) === 'pending').length,
    lastSecurityOrFinancialChange: events[0] ?? null,
    restrictions: supplier.restrictions ?? [],
    accountStatus: supplier.accountStatus ?? 'active',
    closureRequest: supplier.closureRequest ?? null,
  };
}

export async function markNotificationRead(notificationId) {
  const items = await notifications.all();
  const notification = items.find((n) => n.id === notificationId);
  if (notification) notification.read = true;
  await notifications.replace(items);
  return notification ?? null;
}

export async function getAuditLog() {
  return auditLog.all();
}

/**
 * Illustrative-only chart series for the dashboard home — see
 * seedDashboardSeries(). Named `dashboard_series_v2`, not `dashboard_series`:
 * readCollection() only ever runs seedFactory() on a cache miss, so when
 * this shape changed (flat arrays -> ranged {7d,30d,90d} objects, then
 * inventoryMovement -> inventoryHealth) browsers that had already visited
 * /supplier kept serving the old cached shape forever, with no
 * `inventoryHealth` key at all — that's what crashed InventoryHealthBar.
 * Bump this suffix (v3, v4, ...) any time this function's return shape
 * changes again, so a stale cache can never silently resurface.
 */
export async function getDashboardSeries() {
  return readCollection('dashboard_series_v2', seedDashboardSeries).items;
}

// ---- categories -------------------------------------------------------
// Supplier-owned custom taxonomy, distinct from `sector` (a fixed global
// list every product already has) — a category only exists for, and is
// only ever visible/editable by, the supplier who created it.

export async function getCategories(supplierId) {
  return (await categories.all()).filter((c) => c.supplierId === supplierId);
}

export async function addCategory({ supplierId, name, actorName }) {
  const trimmed = (name ?? '').trim();
  if (!trimmed) throw new Error('اسم القسم مطلوب');
  const items = await categories.all();
  const duplicate = items.some((c) => c.supplierId === supplierId && c.name.trim().toLowerCase() === trimmed.toLowerCase());
  if (duplicate) throw new Error('يوجد قسم بنفس الاسم بالفعل');
  const now = new Date().toISOString();
  const category = { id: nextId('cat'), supplierId, name: trimmed, createdAt: now, updatedAt: now };
  items.push(category);
  await categories.replace(items);
  await appendAuditLog({ actorName, action: 'category.add', target: category.id, details: { name: trimmed } });
  return category;
}

export async function updateCategory({ categoryId, name, actorName }) {
  const trimmed = (name ?? '').trim();
  if (!trimmed) throw new Error('اسم القسم مطلوب');
  const items = await categories.all();
  const category = items.find((c) => c.id === categoryId);
  if (!category) throw new Error(`updateCategory: unknown category "${categoryId}"`);
  const duplicate = items.some((c) => c.id !== categoryId && c.supplierId === category.supplierId && c.name.trim().toLowerCase() === trimmed.toLowerCase());
  if (duplicate) throw new Error('يوجد قسم بنفس الاسم بالفعل');
  category.name = trimmed;
  category.updatedAt = new Date().toISOString();
  await categories.replace(items);
  await appendAuditLog({ actorName, action: 'category.update', target: categoryId, details: { name: trimmed } });
  return category;
}

/** Blocks deletion (no cascade) if any product still references this category — matches the spec's explicit "never silently delete products" requirement. */
export async function deleteCategory({ categoryId, actorName }) {
  const items = await categories.all();
  const category = items.find((c) => c.id === categoryId);
  if (!category) throw new Error(`deleteCategory: unknown category "${categoryId}"`);
  const linkedProducts = (await products.all()).some((p) => p.categoryId === categoryId);
  if (linkedProducts) {
    throw new Error('لا يمكن حذف هذا القسم لأنه يحتوي على منتجات. قم بنقل المنتجات إلى قسم آخر أولًا.');
  }
  await categories.replace(items.filter((c) => c.id !== categoryId));
  await appendAuditLog({ actorName, action: 'category.delete', target: categoryId, details: { name: category.name } });
}

/** `{ [categoryId]: productCount }` for one supplier — used by the categories table's "عدد المنتجات" column. */
export async function getCategoryProductCounts(supplierId) {
  const supplierProducts = await getProducts(supplierId);
  const counts = {};
  supplierProducts.forEach((p) => {
    if (!p.categoryId) return;
    counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
  });
  return counts;
}

// There is no admin panel yet to author these campaigns, so this always
// resolves to "nothing published" — that's the honest current state, not
// a placeholder value. Once an admin-side tool exists to manage supplier
// ads, this is the one function to swap for a real fetch; the shape below
// (message/imageUrl/ctaLabel/ctaUrl) is what SupplierAdBanner already
// expects, so no UI changes will be needed when that day comes.
export async function getSupplierBanner() {
  return { message: null, imageUrl: null, ctaLabel: null, ctaUrl: null };
}

export { SEED_SUPPLIER_ID };
