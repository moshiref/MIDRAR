/**
 * Wraps the supplier portal in the `.supplier-portal` scope that
 * supplierTheme.css / supplierExact.css key their CSS custom properties
 * off of. The portal is light-only by design — `data-theme` is fixed so
 * nothing here needs to read/store a preference.
 */
export function SupplierThemeProvider({ children }) {
  return (
    <div className="supplier-portal" data-theme="light">
      {children}
    </div>
  );
}
