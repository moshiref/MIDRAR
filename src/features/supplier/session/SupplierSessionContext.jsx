import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSupplier, getEmployees } from '../data/mockSupplierDb';

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

  const loadSession = useCallback(async (ids) => {
    if (!ids) {
      setSupplier(null);
      setEmployee(null);
      setStatus('signed-out');
      return;
    }
    const [supplierRecord, employeeRecords] = await Promise.all([
      getSupplier(ids.supplierId),
      getEmployees(ids.supplierId),
    ]);
    const employeeRecord = employeeRecords.find((e) => e.id === ids.employeeId) ?? null;
    if (!supplierRecord || !employeeRecord) {
      writeStoredSession(null);
      setSupplier(null);
      setEmployee(null);
      setStatus('signed-out');
      return;
    }
    setSupplier(supplierRecord);
    setEmployee(employeeRecord);
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
    setStatus('signed-out');
  }, []);

  const hasPermission = useCallback(
    (permission) => Boolean(employee?.permissions?.includes(permission)),
    [employee],
  );

  const value = { status, supplier, employee, signIn, signOut, hasPermission };

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
