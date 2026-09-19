import { Outlet } from 'react-router-dom';
import { SupplierSessionProvider } from './session/SupplierSessionContext';
import { SupplierThemeProvider } from './session/SupplierThemeContext';
import { ToastProvider } from './ui/SupplierToast';
import './supplierTheme.css';

/** Wraps every /supplier/* route in the mock session, theme, and toast providers (sign-in page included, so it can call signIn()). */
export default function SupplierRoot() {
  return (
    <SupplierThemeProvider>
      <ToastProvider>
        <SupplierSessionProvider>
          <Outlet />
        </SupplierSessionProvider>
      </ToastProvider>
    </SupplierThemeProvider>
  );
}
