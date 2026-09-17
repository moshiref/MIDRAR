import { Outlet } from 'react-router-dom';
import { SupplierSessionProvider } from './session/SupplierSessionContext';

/** Wraps every /supplier/* route in the mock session provider (sign-in page included, so it can call signIn()). */
export default function SupplierRoot() {
  return (
    <SupplierSessionProvider>
      <Outlet />
    </SupplierSessionProvider>
  );
}
