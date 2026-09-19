/**
 * TEMPORARY, UI/UX-first development bypass. While this is `true`,
 * visiting /supplier with no stored session auto-resolves to the first
 * seeded supplier/employee instead of redirecting to the mock sign-in
 * page — so the dashboard is reachable directly while its screens are
 * being built and reviewed, with zero auth/database work involved (it's
 * just picking a different default in the same mock session state that
 * already existed).
 *
 * Nothing about the real (mock) sign-in flow is removed: SupplierSignInPage,
 * the /supplier/sign-in route, and SupplierSessionContext's signIn/signOut
 * all still work exactly as before — this only changes what happens when
 * there is NO stored session yet. Flip this back to `false` when it's
 * time to require sign-in again (and, later, to wire up real Supabase auth).
 */
export const DEV_SKIP_SUPPLIER_AUTH = true;
