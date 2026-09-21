import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSuppliers, getSupplier, getEmployees, getTeamRoles } from '../data/mockSupplierDb';
import { membershipHasPermission } from '../team/permissions';
import { DEV_SKIP_SUPPLIER_AUTH } from '../devAuthBypass';

/**
 * Mock session/permissions for the supplier portal. There is no backend
 * or real auth yet (see the Phase 0 supplier-portal plan) — "signing in"
 * just remembers which seeded supplier + employee the browser is acting
 * as, in localStorage, and resolves the full records from
 * mockSupplierDb on load. This is enough to unblock every role-gated UI
 * decision (e.g. hiding financial data from non-finance employees)
 * without pretending real authentication exists.
 */

const SESSION_KEY = 'midrar_supplier_session_v1';
const SupplierSessionContext = createContext(null);

function readStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function writeStoredSession(value) {
  try {
    if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — session just won't survive a reload this run */
  }
}

export function SupplierSessionProvider({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'signed-out' | 'signed-in'
  const [supplier, setSupplier] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [teamRoles, setTeamRoles] = useState([]);

  const loadSession = useCallback(async (ids) => {
    if (!ids) {
      if (DEV_SKIP_SUPPLIER_AUTH) {
        const suppliers = await getSuppliers();
        const defaultSupplier = suppliers[0] ?? null;
        const defaultEmployees = defaultSupplier ? await getEmployees(defaultSupplier.id) : [];
        const defaultEmployee = defaultEmployees.find((e) => e.roleId === 'owner') ?? defaultEmployees[0] ?? null;
        if (defaultSupplier && defaultEmployee && defaultEmployee.status === 'active') {
          setSupplier(defaultSupplier);
          setEmployee(defaultEmployee);
          setTeamRoles(await getTeamRoles(defaultSupplier.id));
          setStatus('signed-in');
          return;
        }
      }
      setSupplier(null);
      setEmployee(null);
      setTeamRoles([]);
      setStatus('signed-out');
      return;
    }
    const [supplierRecord, employeeRecords] = await Promise.all([
      getSupplier(ids.supplierId),
      getEmployees(ids.supplierId),
    ]);
    const employeeRecord = employeeRecords.find((e) => e.id === ids.employeeId) ?? null;
    // Only 'active' can sign in — every other status (suspended, revoked,
    // pending invite/verification, expired invite) is a blocked login,
    // not just the old single 'disabled' value.
    if (!supplierRecord || !employeeRecord || employeeRecord.status !== 'active') {
      writeStoredSession(null);
      setSupplier(null);
      setEmployee(null);
      setTeamRoles([]);
      setStatus('signed-out');
      return;
    }
    setSupplier(supplierRecord);
    setEmployee(employeeRecord);
    setTeamRoles(await getTeamRoles(ids.supplierId));
    setStatus('signed-in');
  }, []);

  useEffect(() => {
    loadSession(readStoredSession());
  }, [loadSession]);

  const signIn = useCallback(async (supplierId, employeeId) => {
    setStatus('loading');
    writeStoredSession({ supplierId, employeeId });
    await loadSession({ supplierId, employeeId });
  }, [loadSession]);

  const signOut = useCallback(() => {
    writeStoredSession(null);
    setSupplier(null);
    setEmployee(null);
    setTeamRoles([]);
    setStatus('signed-out');
  }, []);

  const hasPermission = useCallback(
    (permissionId) => membershipHasPermission(employee, permissionId, teamRoles),
    [employee, teamRoles],
  );

  // Re-pulls the current supplier record from mockSupplierDb — used after
  // profile edits (SupplierSettingsPage) so the sidebar's company name/logo
  // update immediately instead of waiting for the next sign-in.
  const refreshSupplier = useCallback(async () => {
    if (!supplier) return;
    const fresh = await getSupplier(supplier.id);
    if (fresh) setSupplier(fresh);
  }, [supplier]);

  // Re-pulls the current employee record + team roles — used by the Team
  // module after the signed-in member edits their own role/roles list.
  const refreshTeam = useCallback(async () => {
    if (!supplier || !employee) return;
    const [freshEmployees, freshRoles] = await Promise.all([getEmployees(supplier.id), getTeamRoles(supplier.id)]);
    const fresh = freshEmployees.find((e) => e.id === employee.id);
    if (fresh) setEmployee(fresh);
    setTeamRoles(freshRoles);
  }, [supplier, employee]);

  const value = useMemo(
    () => ({ status, supplier, employee, teamRoles, signIn, signOut, hasPermission, refreshSupplier, refreshTeam }),
    [status, supplier, employee, teamRoles, signIn, signOut, hasPermission, refreshSupplier, refreshTeam],
  );

  return <SupplierSessionContext.Provider value={value}>{children}</SupplierSessionContext.Provider>;
}

export function useSupplierSession() {
  const ctx = useContext(SupplierSessionContext);
  if (!ctx) throw new Error('useSupplierSession must be used within a SupplierSessionProvider');
  return ctx;
}

/** Route guard: renders children once signed in, redirects to the mock sign-in page otherwise. */
export function RequireSupplierSession({ children }) {
  const { status } = useSupplierSession();
  const location = useLocation();

  if (status === 'loading') return null;
  if (status === 'signed-out') return <Navigate to="/supplier/sign-in" state={{ from: location }} replace />;
  return children;
}
