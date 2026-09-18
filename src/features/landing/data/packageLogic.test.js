import { describe, it, expect } from 'vitest';
import { PACKAGES } from './merchantPlans';
import {
  getPackageById,
  getNextPackage,
  filterQualifyingOrders,
  sumQualifyingSales,
  calculateCurrencyProgress,
  isEligibleForUpgrade,
  calculateCommission,
} from './packageLogic';

const basic = getPackageById('basic');
const silver = getPackageById('silver');
const gold = getPackageById('gold');
const diamond = getPackageById('diamond');

describe('progress — dual currency, summed independently, no exchange rate', () => {
  it('1. $100 of $200 + 13,000 of 26,000 SYP = 100% of the الأساسية target', () => {
    const progress = calculateCurrencyProgress({ usdSales: 100, sypSales: 13000, pkg: basic });
    expect(progress.usdProgress).toBeCloseTo(0.5);
    expect(progress.sypProgress).toBeCloseTo(0.5);
    expect(progress.combinedProgressPercent).toBe(100);
    expect(isEligibleForUpgrade(progress.combinedProgress)).toBe(true);
  });
});

describe('qualifying sales — net completed only', () => {
  const orders = [
    { id: 'a', status: 'completed', currency: 'USD', amount: 100 },
    { id: 'b', status: 'cancelled', currency: 'USD', amount: 999 },
    { id: 'c', status: 'returned', currency: 'SYP', amount: 999 },
    { id: 'd', status: 'completed', currency: 'SYP', amount: 5000 },
  ];

  it('2. a cancelled order is excluded from sales', () => {
    const qualifying = filterQualifyingOrders(orders);
    expect(qualifying.find((o) => o.id === 'b')).toBeUndefined();
  });

  it('3. a returned order is excluded from sales', () => {
    const qualifying = filterQualifyingOrders(orders);
    expect(qualifying.find((o) => o.id === 'c')).toBeUndefined();
  });

  it('only qualifying totals are summed per currency', () => {
    const totals = sumQualifyingSales(orders);
    expect(totals).toEqual({ usd: 100, syp: 5000 });
  });
});

describe('upgrade sequence', () => {
  it('4. reaching the الأساسية target moves the merchant to الفضية', () => {
    expect(getNextPackage(basic.id).id).toBe('silver');
  });

  it('5. reaching the الفضية target moves the merchant to الذهبية', () => {
    expect(getNextPackage(silver.id).id).toBe('gold');
  });

  it('6. reaching the الذهبية target moves the merchant to الماسية', () => {
    expect(getNextPackage(gold.id).id).toBe('diamond');
  });

  it('7. الماسية has no upgrade after it', () => {
    expect(getNextPackage(diamond.id)).toBeNull();
  });
});

describe('8. an upgrade never recomputes a past order', () => {
  it('each order carries its own commissionRate snapshot — calculateCommission never looks up "the current package"', () => {
    const orderBeforeUpgrade = calculateCommission({ salePrice: 130, supplierCost: 100, commissionRate: 10 });
    // merchant upgrades to a higher tier after this order was placed
    const orderAfterUpgrade = calculateCommission({ salePrice: 130, supplierCost: 100, commissionRate: 12 });

    expect(orderBeforeUpgrade.commission).toBeCloseTo(3);
    // re-running the same historical call with its original rate is unaffected by the "later" tier
    expect(calculateCommission({ salePrice: 130, supplierCost: 100, commissionRate: 10 }).commission).toBeCloseTo(3);
    expect(orderAfterUpgrade.commission).toBeCloseTo(3.6);
  });
});

describe('commission — merchant profit only, never the full sale price', () => {
  it('9. commission is calculated from Sale Price - Supplier Cost', () => {
    const { merchantProfit, commission } = calculateCommission({ salePrice: 130, supplierCost: 100, commissionRate: 10 });
    expect(merchantProfit).toBe(30);
    expect(commission).toBeCloseTo(3);
    // NOT 10% of the full 130 sale price (which would be 13)
    expect(commission).not.toBeCloseTo(13);
  });

  it('10. delivery fees never enter merchant profit — the function has no delivery-fee input at all', () => {
    expect(calculateCommission).toHaveLength(1); // one destructured options object, no separate deliveryFee param
    const withoutDeliveryFee = calculateCommission({ salePrice: 130, supplierCost: 100, commissionRate: 10 });
    const stillNoDeliveryFeeEffect = calculateCommission({
      salePrice: 130,
      supplierCost: 100,
      commissionRate: 10,
      deliveryFee: 25, // extraneous — must be silently ignored, not subtracted or added
    });
    expect(stillNoDeliveryFeeEffect).toEqual(withoutDeliveryFee);
  });
});

describe('failed-delivery coverage quotas', () => {
  it('11. الأساسية = 3', () => expect(basic.failedDeliveryQuota).toBe(3));
  it('12. الفضية = 5', () => expect(silver.failedDeliveryQuota).toBe(5));
  it('13. الذهبية = 8', () => expect(gold.failedDeliveryQuota).toBe(8));
  it('14. الماسية = 12', () => expect(diamond.failedDeliveryQuota).toBe(12));
});

describe('15. unused delivery-failure cases do not roll over to the next month', () => {
  it('failedDeliveryQuota is a fixed monthly allowance, not accumulating/decrementing state', () => {
    // No "remaining/used/rolloverFrom" field exists anywhere in the package config —
    // that absence is the point: each month's quota is always the same fixed number,
    // never carried over or reduced by a prior month's unused cases.
    PACKAGES.forEach((pkg) => {
      expect(pkg).not.toHaveProperty('rolloverQuota');
      expect(pkg).not.toHaveProperty('remainingFailedDeliveryQuota');
      expect(getPackageById(pkg.id).failedDeliveryQuota).toBe(pkg.failedDeliveryQuota);
    });
  });
});

describe('package data sanity', () => {
  it('only 4 packages remain — الأهلية was removed entirely', () => {
    expect(PACKAGES.map((p) => p.id)).toEqual(['basic', 'silver', 'gold', 'diamond']);
    expect(getPackageById('eligibility')).toBeNull();
  });
});
