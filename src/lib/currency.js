/**
 * Money formatting for the supplier portal, where USD and SYP (Syrian
 * pound) are always tracked and displayed as two separate balances —
 * never auto-converted or combined (spec: "الدولار والليرة السورية
 * الجديدة رصيدان وكشفان ودفعتان منفصلتان"). Every amount in the app must
 * carry an explicit currency; there is no default/ambient currency.
 */

export const SUPPORTED_CURRENCIES = ['USD', 'SYP'];

const SYP_LABEL = 'ل.س';

/** Formats a numeric amount as a currency string. `currency` is 'USD' or 'SYP'. */
export function formatMoney(amount, currency) {
  const value = Number(amount) || 0;

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
  }

  if (currency === 'SYP') {
    // Intl's built-in SYP currency formatting is inconsistent across
    // environments (stale ISO 4217 minor-unit data), so format the
    // number ourselves and append the local abbreviation.
    return `${new Intl.NumberFormat('ar-SY', { maximumFractionDigits: 0 }).format(value)} ${SYP_LABEL}`;
  }

  throw new Error(`formatMoney: unsupported currency "${currency}" — expected one of ${SUPPORTED_CURRENCIES.join(', ')}`);
}
