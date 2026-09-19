import { useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import { SupplierWizard } from '../open-store/OpenStorePage';
import '../../components/forms/wizardPage.css';

/**
 * Standalone /supplier-registration — the same SupplierWizard component
 * used by /open-store's "سجّل كمورد" toggle (now exported from
 * OpenStorePage.jsx), just mounted at its own URL so it's reachable
 * directly while the "سجّل كمورد" CTAs elsewhere temporarily point at
 * /supplier instead (see MerchantSupplierSplit.jsx and OpenStorePage.jsx).
 * Nothing about the wizard itself — fields, validation, submit logic — is
 * duplicated or changed; this file is only the page shell around it.
 */
export default function SupplierRegistrationPage() {
  const navigate = useNavigate();

  return (
    <div className="wizard-page">
      <header>
        <div className="nav">
          <Logo />
          <a className="back-link" href="/" onClick={(e) => { e.preventDefault(); navigate(-1); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l-6 6 6 6M3 12h18" transform="scale(-1,1) translate(-24,0)" /></svg>
            رجوع للموقع
          </a>
        </div>
      </header>

      <div className="wrap">
        <div className="route-hero">
          <span className="eyebrow"><span className="en">MIDRAR</span> · ابدأ رحلتك</span>
          <h1>وسّع قنوات بيع منتجاتك مع مدرار</h1>
          <p>إذا كنت مصنعًا أو مستوردًا أو موزعًا أو تاجر جملة، قدّم طلبك للانضمام إلى شبكة موردي مدرار.</p>
        </div>

        <div className="form-card">
          <SupplierWizard />
        </div>
      </div>

      <footer>© 2026 مدرار — <span className="en">MIDRAR</span></footer>
    </div>
  );
}
