import { PACKAGES } from './merchantPlans';

/**
 * Pure business logic for merchant packages — progress, upgrade
 * eligibility, commission, and what "qualifying" sales/deliveries mean.
 * Deliberately has zero UI/React imports so it can be unit-tested in
 * isolation and reused later by a real merchant dashboard or an API
 * layer without change.
 */

const NON_QUALIFYING_STATUSES = new Set(['cancelled', 'returned']);

export function getPackageById(id) {
  return PACKAGES.find((pkg) => pkg.id === id) ?? null;
}

/**
 * basic → silver → gold → diamond → null. Diamond is the last tier —
 * there is no upgrade past it. Order is driven by each package's
 * `order` field, not array position, so re-sequencing PACKAGES can't
 * silently break this.
 */
export function getNextPackage(currentPackageId) {
  const current = getPackageById(currentPackageId);
  if (!current) return null;
  return PACKAGES.find((pkg) => pkg.order === current.order + 1) ?? null;
}

/** Net completed sales only — cancelled and returned orders never count toward a package target. */
export function isQualifyingOrder(order) {
  return !NON_QUALIFYING_STATUSES.has(order.status);
}

export function filterQualifyingOrders(orders) {
  return orders.filter(isQualifyingOrder);
}

/** Sums qualifying orders per currency. USD and SYP are never mixed or converted — two independent totals. */
export function sumQualifyingSales(orders) {
  return filterQualifyingOrders(orders).reduce(
    (totals, order) => {
      if (order.currency === 'USD') totals.usd += order.amount;
      else if (order.currency === 'SYP') totals.syp += order.amount;
      return totals;
    },
    { usd: 0, syp: 0 },
  );
}

/**
 * Progress toward `pkg`'s target: USD and SYP progress are computed
 * independently (sales / target for each currency, no exchange rate,
 * ever) and then summed — not averaged — to get one combined progress
 * value for the UI. $100 of $200 (50%) + 13,000 of 26,000 SYP (50%) =
 * 100% combined, exactly the spec's worked example.
 */
export function calculateCurrencyProgress({ usdSales, sypSales, pkg }) {
  const usdProgress = pkg.usdTarget > 0 ? usdSales / pkg.usdTarget : 0;
  const sypProgress = pkg.sypTarget > 0 ? sypSales / pkg.sypTarget : 0;
  const combinedProgress = usdProgress + sypProgress;

  return {
    usdProgress,
    sypProgress,
    combinedProgress,
    combinedProgressPercent: Math.round(combinedProgress * 100),
    remainingUsd: Math.max(0, pkg.usdTarget - usdSales),
    remainingSyp: Math.max(0, pkg.sypTarget - sypSales),
  };
}

/** A merchant becomes eligible the instant combined progress reaches 100% of the current package's target. */
export function isEligibleForUpgrade(combinedProgress) {
  return combinedProgress >= 1;
}

/**
 * MIDRAR's commission is a percentage of the merchant's own profit
 * margin (sale price minus what they paid the supplier) — never of the
 * full product price, and delivery fees never enter this calculation at
 * all (the function doesn't even accept a delivery-fee parameter).
 * Supplier commission is a completely separate system, not touched
 * here. Every call is independent and stateless — an order's commission
 * is fixed by whatever `commissionRate` is passed in at the time, so an
 * upgrade that changes the *current* package later can never retroactively
 * change a past order's already-computed commission.
 */
export function calculateCommission({ salePrice, supplierCost, commissionRate }) {
  const merchantProfit = salePrice - supplierCost;
  const commission = merchantProfit * (commissionRate / 100);
  return { merchantProfit, commission };
}
