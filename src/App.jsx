import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import PublicLayout from './components/layout/PublicLayout';
import LandingPage from './features/landing/LandingPage';
import OpenStorePage from './features/open-store/OpenStorePage';
import SupplierRegistrationPage from './features/supplier-registration/SupplierRegistrationPage';
import LogisticsPartnerApplicationPage from './features/logistics-partner/LogisticsPartnerApplicationPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import SupplierPagePlaceholder from './features/supplier/SupplierPagePlaceholder';

// The entire /supplier/* subtree (including its shell — sidebar/topbar —
// and icon set) is lazy: none of it should ever land in the main site's
// bundle, since a marketing-site visitor who never clicks "سجّل كمورد"
// shouldn't pay for it. One Suspense boundary below covers all of it;
// SupplierLayout adds its own nested boundary around just the page body
// so switching between dashboard pages doesn't re-suspend the whole shell.
const SupplierRoot = lazy(() => import('./features/supplier/SupplierRoot'));
const SupplierProtectedLayout = lazy(() => import('./features/supplier/SupplierProtectedLayout'));
const SupplierSignInPage = lazy(() => import('./features/supplier/session/SupplierSignInPage'));
const SupplierApplicationStatusPage = lazy(() => import('./features/supplier/onboarding/SupplierApplicationStatusPage'));
const SupplierDashboardHome = lazy(() => import('./features/supplier/dashboard/SupplierDashboardHome'));
const SupplierProductsPage = lazy(() => import('./features/supplier/products/SupplierProductsPage'));
const SupplierProductForm = lazy(() => import('./features/supplier/products/SupplierProductForm'));
const SupplierInventoryPage = lazy(() => import('./features/supplier/inventory/SupplierInventoryPage'));
const SupplierOrdersPage = lazy(() => import('./features/supplier/orders/SupplierOrdersPage'));
const SupplierFulfillmentProofPage = lazy(() => import('./features/supplier/fulfillment/SupplierFulfillmentProofPage'));
const SupplierChatPage = lazy(() => import('./features/supplier/chat/SupplierChatPage'));
const SupplierDisputesPage = lazy(() => import('./features/supplier/disputes/SupplierDisputesPage'));
const SupplierPayoutsPage = lazy(() => import('./features/supplier/payouts/SupplierPayoutsPage'));
const SupplierPerformancePage = lazy(() => import('./features/supplier/performance/SupplierPerformancePage'));
const SupplierEmployeesPage = lazy(() => import('./features/supplier/employees/SupplierEmployeesPage'));
const SupplierSettingsPage = lazy(() => import('./features/supplier/settings/SupplierSettingsPage'));

/**
 * Routing: the public landing route, the standalone /open-store and
 * /logistics-partner application flows (both share the `.wizard-page`
 * CSS scope — see src/components/forms/wizardPage.css), /login +
 * /register + /forgot-password (frontend-only auth — see
 * src/features/auth/authService.js), and the /supplier/* dashboard
 * (mock-session-gated, SupplierLayout shell with its own Suspense
 * boundary around the lazy-loaded pages above). None of the standalone
 * flow pages use PublicLayout — each has its own minimal header instead
 * of the full marketing nav. /supplier/locations and /supplier/notifications
 * still render SupplierPagePlaceholder — their content now lives inside
 * SupplierSettingsPage (fulfillment locations tab) and the topbar
 * notifications bell respectively, so the sidebar no longer links to
 * these two routes, but the routes are kept rather than deleted.
 */
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route path="/open-store" element={<OpenStorePage />} />
        <Route path="/supplier-registration" element={<SupplierRegistrationPage />} />
        <Route path="/logistics-partner" element={<LogisticsPartnerApplicationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/supplier"
          element={(
            <Suspense fallback={<div className="min-h-screen bg-white" />}>
              <SupplierRoot />
            </Suspense>
          )}
        >
          <Route path="sign-in" element={<SupplierSignInPage />} />
          <Route path="application-status" element={<SupplierApplicationStatusPage />} />
          <Route element={<SupplierProtectedLayout />}>
            <Route index element={<SupplierDashboardHome />} />
            <Route path="products" element={<SupplierProductsPage />} />
            <Route path="products/new" element={<SupplierProductForm />} />
            <Route path="products/:productId" element={<SupplierProductForm />} />
            <Route path="inventory" element={<SupplierInventoryPage />} />
            <Route path="orders" element={<SupplierOrdersPage />} />
            <Route path="fulfillment-proof" element={<SupplierFulfillmentProofPage />} />
            <Route path="chat" element={<SupplierChatPage />} />
            <Route path="payouts" element={<SupplierPayoutsPage />} />
            <Route path="performance" element={<SupplierPerformancePage />} />
            <Route path="disputes" element={<SupplierDisputesPage />} />
            <Route path="notifications" element={<SupplierPagePlaceholder title="الإشعارات" />} />
            <Route path="locations" element={<SupplierPagePlaceholder title="مواقع التجهيز" />} />
            <Route path="employees" element={<SupplierEmployeesPage />} />
            <Route path="settings" element={<SupplierSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
