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

const KEY_PREFIX = 'midrar_supplier_';
const SCHEMA_VERSION = 1;

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
      city: 'دمشق',
      activityType: 'factory',
      status: 'approved',
      ratingSummary: { fulfillmentAccuracy: 0.94, prepTimeAdherence: 0.88, stockAccuracy: 0.97, returnRate: 0.03, prepSpeedScore: 0.86, merchantRating: 0.91 },
      // Illustrative-only "last period" snapshot so the Performance page
      // can show a trend/delta — same demo-data caveat as ratingSummary.
      previousRatingSummary: { fulfillmentAccuracy: 0.90, prepTimeAdherence: 0.85, stockAccuracy: 0.95, returnRate: 0.05, prepSpeedScore: 0.81, merchantRating: 0.88 },
      bankAccount: { bankName: 'بنك سورية والمهجر', holderName: 'محمود العبد الله', iban: 'SY00 0000 0000 0000 0000' },
      wallet: { provider: 'محفظة سيريتيل كاش', number: '0944000111' },
      twoFactorEnabled: false,
      createdAt: '2026-06-01T08:00:00.000Z',
    },
  ];
}

function seedEmployees() {
  return [
    { id: 'emp_1', supplierId: SEED_SUPPLIER_ID, name: 'محمود العبد الله', role: 'owner', permissions: ['products', 'inventory', 'fulfillment', 'accounting'], status: 'active', createdAt: '2026-06-01T08:00:00.000Z' },
    { id: 'emp_2', supplierId: SEED_SUPPLIER_ID, name: 'سارة ديب', role: 'warehouse', permissions: ['fulfillment', 'inventory'], status: 'active', createdAt: '2026-06-10T08:00:00.000Z' },
  ];
}

function seedProducts() {
  return [
    {
      id: 'prod_1', supplierId: SEED_SUPPLIER_ID, name: 'كنبة زاوية قماش', sector: 'أثاث وديكور منزلي', status: 'approved', createdAt: '2026-06-02T08:00:00.000Z',
      variants: [
        { id: 'var_1', label: 'رمادي - كبير', supplyPrice: { amount: 340, currency: 'USD' }, minPrice: { amount: 420, currency: 'USD' }, suggestedPrice: { amount: 480, currency: 'USD' }, prepDays: 3, location: 'مستودع دمشق', stock: { actual: 12, reserved: 2 } },
        { id: 'var_2', label: 'بيج - كبير', supplyPrice: { amount: 340, currency: 'USD' }, minPrice: { amount: 420, currency: 'USD' }, suggestedPrice: { amount: 480, currency: 'USD' }, prepDays: 3, location: 'مستودع دمشق', stock: { actual: 3, reserved: 1 } },
      ],
    },
    {
      id: 'prod_2', supplierId: SEED_SUPPLIER_ID, name: 'طاولة طعام خشبية', sector: 'أثاث وديكور منزلي', status: 'pending', createdAt: '2026-09-10T08:00:00.000Z',
      variants: [
        { id: 'var_3', label: 'قياس 160سم', supplyPrice: { amount: 180, currency: 'USD' }, minPrice: { amount: 230, currency: 'USD' }, suggestedPrice: { amount: 260, currency: 'USD' }, prepDays: 5, location: 'مستودع دمشق', stock: { actual: 6, reserved: 0 } },
      ],
    },
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
    { id: 'loc_1', supplierId: SEED_SUPPLIER_ID, name: 'مستودع دمشق الرئيسي', city: 'دمشق', address: 'المنطقة الصناعية، دمشق', active: true },
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
const employees = collection('employees', seedEmployees);
const products = collection('products', seedProducts);
const inventoryMovements = collection('inventory_movements', seedInventoryMovements);
const orders = collection('orders', seedOrders);
const payouts = collection('payouts', seedPayouts);
const tickets = collection('tickets', seedTickets);
const notifications = collection('notifications', seedNotifications);
const auditLog = collection('audit_log', seedAuditLog);
const fulfillmentProofs = collection('fulfillment_proofs', seedFulfillmentProofs);
const orderMessages = collection('order_messages', seedOrderMessages);
const locations = collection('locations', seedLocations);

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

export async function addEmployee({ supplierId, name, role, permissions, actorName }) {
  const items = await employees.all();
  const employee = { id: nextId('emp'), supplierId, name, role, permissions, status: 'active', createdAt: new Date().toISOString() };
  items.push(employee);
  await employees.replace(items);
  await appendAuditLog({ actorName, action: 'employee.add', target: employee.id, details: { name, role, permissions } });
  return employee;
}

export async function updateEmployee({ employeeId, patch, actorName }) {
  const items = await employees.all();
  const employee = items.find((e) => e.id === employeeId);
  if (!employee) throw new Error(`updateEmployee: unknown employee "${employeeId}"`);
  Object.assign(employee, patch);
  await employees.replace(items);
  await appendAuditLog({ actorName, action: 'employee.update', target: employeeId, details: patch });
  return employee;
}

export async function removeEmployee({ employeeId, actorName }) {
  const items = await employees.all();
  const next = items.filter((e) => e.id !== employeeId);
  await employees.replace(next);
  await appendAuditLog({ actorName, action: 'employee.remove', target: employeeId, details: {} });
}

export async function getProducts(supplierId) {
  return (await products.all()).filter((p) => p.supplierId === supplierId);
}

export async function getProduct(productId) {
  return (await products.all()).find((p) => p.id === productId) ?? null;
}

export async function addProduct({ supplierId, name, description, sector, images, specs, variants, status, actorName }) {
  const items = await products.all();
  const product = {
    id: nextId('prod'),
    supplierId,
    name,
    description,
    sector,
    images: images ?? [],
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

export async function addLocation({ supplierId, name, city, address, actorName }) {
  const items = await locations.all();
  const location = { id: nextId('loc'), supplierId, name, city, address, active: true };
  items.push(location);
  await locations.replace(items);
  await appendAuditLog({ actorName, action: 'location.add', target: location.id, details: { name, city } });
  return location;
}

export async function updateLocation({ locationId, patch, actorName }) {
  const items = await locations.all();
  const location = items.find((l) => l.id === locationId);
  if (!location) throw new Error(`updateLocation: unknown location "${locationId}"`);
  Object.assign(location, patch);
  await locations.replace(items);
  await appendAuditLog({ actorName, action: 'location.update', target: locationId, details: patch });
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

export { SEED_SUPPLIER_ID };
