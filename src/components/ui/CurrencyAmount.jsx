import { formatMoney } from '../../lib/currency';

/**
 * Displays one money amount in one currency. Deliberately has no
 * "total across currencies" mode — USD and SYP figures are always shown
 * as separate `<CurrencyAmount>`s side by side, never summed, matching
 * the supplier portal's dual-currency ledger.
 */
export default function CurrencyAmount({ amount, currency, className = '', ...rest }) {
  return (
    <span className={`en ${className}`.trim()} dir="ltr" {...rest}>
      {formatMoney(amount, currency)}
    </span>
  );
}
