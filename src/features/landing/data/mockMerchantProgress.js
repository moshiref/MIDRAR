/**
 * Mock "current merchant" sample for the public landing page's "باقتك
 * الحالية" demo panel
 * (src/features/landing/components/MerchantPlansSection.jsx). The
 * landing page has no auth or per-visitor merchant session — this is
 * illustrative sample data showing how the package system behaves, not
 * a real logged-in merchant's figures.
 *
 * The shape (a current package id + a list of orders, each with a
 * status/currency/amount) is exactly what packageLogic.js's
 * `filterQualifyingOrders`/`sumQualifyingSales` already expect, so
 * swapping this for a real API response later
 * (e.g. `GET /api/merchant/:id/progress`) is a drop-in replacement —
 * nothing downstream needs to change shape.
 *
 * Includes one cancelled and one returned order on purpose, so the
 * "qualifying sales" the UI shows visibly excludes them rather than
 * just trusting a pre-summed number.
 */

export const MOCK_CURRENT_PACKAGE_ID = 'basic';

export const MOCK_MERCHANT_ORDERS = [
  { id: 'ord_1', status: 'completed', currency: 'USD', amount: 40 },
  { id: 'ord_2', status: 'completed', currency: 'USD', amount: 50 },
  { id: 'ord_3', status: 'cancelled', currency: 'USD', amount: 60 },
  { id: 'ord_4', status: 'completed', currency: 'SYP', amount: 6000 },
  { id: 'ord_5', status: 'completed', currency: 'SYP', amount: 4000 },
  { id: 'ord_6', status: 'returned', currency: 'SYP', amount: 9000 },
];
