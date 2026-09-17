import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../ui/Logo';
import Modal from '../ui/Modal';
import { useSupplierSession } from '../../features/supplier/session/SupplierSessionContext';

/** The 12 required supplier-portal pages (spec §14), in nav order. */
const NAV_ITEMS = [
  { to: '/supplier', label: 'الرئيسية والمؤشرات', end: true },
  { to: '/supplier/products', label: 'المنتجات' },
  { to: '/supplier/inventory', label: 'المخزون' },
  { to: '/supplier/orders', label: 'الطلبات' },
  { to: '/supplier/payouts', label: 'المستحقات وكشوف الدفعات' },
  { to: '/supplier/performance', label: 'التقييم والأداء' },
  { to: '/supplier/disputes', label: 'المرتجعات والنزاعات' },
  { to: '/supplier/notifications', label: 'الإشعارات والإعدادات' },
  { to: '/supplier/locations', label: 'مواقع التجهيز' },
  { to: '/supplier/employees', label: 'الموظفون والصلاحيات' },
];

function NavList({ onNavigate }) {
  return (
    <ul className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                isActive ? 'bg-brand-navy text-white' : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
              }`
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function SessionSummary({ onSignOut }) {
  const { supplier, employee } = useSupplierSession();
  return (
    <div className="border-t border-border-default p-4 text-xs text-text-muted">
      <div className="font-bold text-text-primary">{supplier?.companyName}</div>
      <div>{employee?.name} — {employee?.role}</div>
      <button type="button" onClick={onSignOut} className="mt-2 font-bold text-brand-blue">تسجيل الخروج</button>
    </div>
  );
}

/**
 * The supplier portal's app shell: RTL sidebar nav on desktop, a topbar
 * with a modal nav drawer on mobile. Parallels how PublicLayout wraps
 * the marketing pages, but dashboard-shaped — built with Tailwind
 * utilities against the shared @theme tokens rather than a new scoped
 * CSS file, per the Phase 0 supplier-portal plan.
 */
export default function SupplierLayout() {
  const { signOut } = useSupplierSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-text-primary" dir="rtl">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-border-default bg-surface md:flex">
        <div className="border-b border-border-default p-5"><Logo /></div>
        <nav className="flex-1 overflow-y-auto p-3">
          <NavList />
        </nav>
        <SessionSummary onSignOut={signOut} />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border-default bg-surface px-4 py-3 md:hidden">
          <Logo />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-md border border-border-default px-3 py-1.5 text-sm font-bold text-text-primary"
          >
            القائمة
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="القائمة">
        <NavList onNavigate={() => setMenuOpen(false)} />
        <button
          type="button"
          onClick={() => { setMenuOpen(false); signOut(); }}
          className="mt-4 w-full rounded-md border border-border-default px-3 py-2 text-sm font-bold text-brand-blue"
        >
          تسجيل الخروج
        </button>
      </Modal>
    </div>
  );
}
