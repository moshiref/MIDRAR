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
      ratingSummary: { fulfillmentAccuracy: 0.94, prepTimeAdherence: 0.88, stockAccuracy: 0.97, returnRate: 0.03 },
      createdAt: '2026-06-01T08:00:00.000Z',
    },
  ];
}

function seedEmployees() {
  return [
    { id: 'emp_1', supplierId: SEED_SUPPLIER_ID, name: 'محمود العبد الله', role: 'owner', permissions: ['products', 'inventory', 'fulfillment', 'accounting'], createdAt: '2026-06-01T08:00:00.000Z' },
    { id: 'emp_2', supplierId: SEED_SUPPLIER_ID, name: 'سارة ديب', role: 'fulfillment', permissions: ['fulfillment', 'inventory'], createdAt: '2026-06-10T08:00:00.000Z' },
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
  return [];
}

function seedNotifications() {
  return [
    { id: 'ntf_1', supplierId: SEED_SUPPLIER_ID, type: 'order', message: 'طلب جديد بانتظار تأكيدك (OP-88213)', read: false, createdAt: '2026-09-16T10:00:00.000Z' },
    { id: 'ntf_2', supplierId: SEED_SUPPLIER_ID, type: 'stock', message: 'الكمية المتاحة لـ "كنبة زاوية قماش - بيج كبير" منخفضة', read: false, createdAt: '2026-09-15T08:00:00.000Z' },
  ];
}

function seedAuditLog() {
  return [];
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
  const employee = { id: nextId('emp'), supplierId, name, role, permissions, createdAt: new Date().toISOString() };
  items.push(employee);
  await employees.replace(items);
  await appendAuditLog({ actorName, action: 'employee.add', target: employee.id, details: { name, role, permissions } });
  return employee;
}

export async function getProducts(supplierId) {
  return (await products.all()).filter((p) => p.supplierId === supplierId);
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

export async function getTickets() {
  return tickets.all();
}

export async function createTicket({ subject, relatedType, relatedId, message, actorName }) {
  const items = await tickets.all();
  const ticket = {
    id: nextId('tkt'),
    subject,
    relatedType,
    relatedId,
    status: 'open',
    messages: [{ from: actorName, text: message, at: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
  };
  items.unshift(ticket);
  await tickets.replace(items);
  await appendAuditLog({ actorName, action: 'ticket.create', target: ticket.id, details: { subject, relatedType, relatedId } });
  return ticket;
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

export { SEED_SUPPLIER_ID };
