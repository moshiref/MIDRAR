import { RequireSupplierSession } from './session/SupplierSessionContext';
import SupplierLayout from '../../components/layout/SupplierLayout';

/** Everything under /supplier except /supplier/sign-in: guarded by session, wrapped in the dashboard shell. */
export default function SupplierProtectedLayout() {
  return (
    <RequireSupplierSession>
      <SupplierLayout />
    </RequireSupplierSession>
  );
}
