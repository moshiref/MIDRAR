import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import PublicLayout from './components/layout/PublicLayout';
import LandingPage from './features/landing/LandingPage';
import OpenStorePage from './features/open-store/OpenStorePage';
import LogisticsPartnerApplicationPage from './features/logistics-partner/LogisticsPartnerApplicationPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import SupplierRoot from './features/supplier/SupplierRoot';
import SupplierProtectedLayout from './features/supplier/SupplierProtectedLayout';
import SupplierSignInPage from './features/supplier/session/SupplierSignInPage';
import SupplierApplicationStatusPage from './features/supplier/onboarding/SupplierApplicationStatusPage';
import SupplierEmployeesPage from './features/supplier/employees/SupplierEmployeesPage';
import SupplierDashboardHome from './features/supplier/dashboard/SupplierDashboardHome';
import SupplierPagePlaceholder from './features/supplier/SupplierPagePlaceholder';

/**
 * Routing: the public landing route, the standalone /open-store and
 * /logistics-partner application flows (both share the `.wizard-page`
 * CSS scope — see src/components/forms/wizardPage.css), /login +
 * /register + /forgot-password (frontend-only auth — see
 * src/features/auth/authService.js), and the /supplier/* dashboard
 * (Phase 0 of the supplier-portal delivery plan — mock-session-gated,
 * its own SupplierLayout shell). None of the standalone flow pages use
 * PublicLayout — each has its own minimal header instead of the full
 * marketing nav. Pages under /supplier that later phases haven't built
 * yet render SupplierPagePlaceholder rather than nothing. Future phases
 * add merchant/admin dashboards and the per-merchant storefront under
 * their own layouts, per the Phase 0 routing plan.
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
        <Route path="/logistics-partner" element={<LogisticsPartnerApplicationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/supplier" element={<SupplierRoot />}>
          <Route path="sign-in" element={<SupplierSignInPage />} />
          <Route path="application-status" element={<SupplierApplicationStatusPage />} />
          <Route element={<SupplierProtectedLayout />}>
            <Route index element={<SupplierDashboardHome />} />
            <Route path="products" element={<SupplierPagePlaceholder title="المنتجات" />} />
            <Route path="inventory" element={<SupplierPagePlaceholder title="المخزون" />} />
            <Route path="orders" element={<SupplierPagePlaceholder title="الطلبات" />} />
            <Route path="payouts" element={<SupplierPagePlaceholder title="المستحقات وكشوف الدفعات" />} />
            <Route path="performance" element={<SupplierPagePlaceholder title="التقييم والأداء" />} />
            <Route path="disputes" element={<SupplierPagePlaceholder title="المرتجعات والنزاعات" />} />
            <Route path="notifications" element={<SupplierPagePlaceholder title="الإشعارات والإعدادات" />} />
            <Route path="locations" element={<SupplierPagePlaceholder title="مواقع التجهيز" />} />
            <Route path="employees" element={<SupplierEmployeesPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
