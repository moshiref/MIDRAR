/**
 * Shared localStorage contract for merchant/supplier applications
 * submitted through the /open-store wizard
 * (src/features/open-store/OpenStorePage.jsx writes here) and read back
 * by the supplier portal's pending-approval lookup
 * (src/features/supplier/onboarding/SupplierApplicationStatusPage.jsx).
 * Extracted so both sides share one definition of the storage key and
 * entry shape instead of drifting apart.
 */

export const APPLICATIONS_KEY = 'midrar_applications_v1';

export function genRef(prefix) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function loadApplications() {
  try {
    return JSON.parse(localStorage.getItem(APPLICATIONS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveApplication(entry) {
  const apps = loadApplications();
  apps.unshift(entry);
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  } catch {
    /* storage unavailable — the in-memory success screen still shows the reference */
  }
}
