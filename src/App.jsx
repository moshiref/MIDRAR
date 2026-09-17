import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import LandingPage from './features/landing/LandingPage';

/**
 * Phase 1 routing: only the public landing route exists today. Future
 * phases add merchant/supplier/admin dashboards and the per-merchant
 * storefront under their own layouts, per the Phase 0 routing plan.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
