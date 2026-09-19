import { useEffect, useState, Suspense } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSupplierSession } from '../../features/supplier/session/SupplierSessionContext';
import { SkeletonRows } from '../../features/supplier/ui/Skeleton';
import logoMark from '../../assets/logo-mark.png';
import '../../features/supplier/supplierExact.css';

function showToast(message) {
  let holder = document.getElementById('toastHolder');
  if (!holder) {
    holder = document.createElement('div');
    holder.id = 'toastHolder';
    holder.style.cssText = 'position:fixed; bottom:24px; left:50%; transform:translateX(-50%); z-index:200; display:flex; flex-direction:column; gap:8px; align-items:center;';
    document.body.appendChild(holder);
  }
  const t = document.createElement('div');
  t.textContent = message;
  t.style.cssText = 'background:var(--brand-navy-deep); color:#fff; padding:12px 22px; border-radius:999px; font-size:0.86rem; font-weight:700; box-shadow:0 10px 30px -8px rgba(9,25,46,0.4); opacity:0; transform:translateY(10px); transition:all .25s ease;';
  holder.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'none'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2400);
}

export default function SupplierLayout() {
  const { supplier, employee, signOut } = useSupplierSession();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // الأرقام المطلوبة نصًا في القائمة: طلبات التجهيز 2، المخزون 1
  const [fulfillCount] = useState(2);
  const [inventoryLowCount] = useState(1);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  // Esc closes the mobile drawer, same as every other dismissible panel in the portal.
  useEffect(() => {
    if (!sidebarOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') setSidebarOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  // expose toast globally for child pages that might call window.showToast
  useEffect(() => {
    window.showToast = showToast;
    return () => { delete window.showToast; };
  }, []);

  const displayName = employee?.name ?? 'محمود العبد الله';
  const initials = displayName.split(' ').map((w) => w[0]).join('').slice(0, 2) || 'مح';

  return (
    <div className="supplier-exact" dir="rtl">
      <div className="app-shell">
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar">
          <div className="sidebar-brand" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={logoMark} alt="مدرار" />
              <span className="en">MIDRAR</span>
            </div>
            <button type="button" className="sidebar-close" aria-label="إغلاق القائمة" onClick={closeSidebar}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="store-switch">
            <div className="dot-avatar" />
            <div>
              <div className="name">{supplier?.companyName ?? 'مصنع الأمل للأثاث'}</div>
              <div className="status"><span className="dot" /> مورد نشط</div>
            </div>
          </div>
          <nav className="nav-scroll">
            <div className="nav-group">
              <NavLink
                to="/supplier"
                end
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
                نظرة عامة
              </NavLink>
              <NavLink
                to="/supplier/orders"
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 16V6a1 1 0 011-1h9v11H3z" /><path d="M13 9h4l4 4v3h-8z" /><circle cx="7" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></svg>
                طلبات التجهيز <span className="badge-count en">{fulfillCount}</span>
              </NavLink>
              <NavLink
                to="/supplier/products"
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                المنتجات
              </NavLink>
              <NavLink
                to="/supplier/categories"
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
                الأقسام
              </NavLink>
              <NavLink
                to="/supplier/inventory"
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 10h18" /></svg>
                المخزون <span className="badge-count en">{inventoryLowCount}</span>
              </NavLink>
            </div>
            <div className="nav-group">
              <div className="nav-group-label">المال والأداء</div>
              <NavLink
                to="/supplier/payouts"
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10h20" /></svg>
                المستحقات
              </NavLink>
              <NavLink
                to="/supplier/performance"
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18" /><path d="M7 16l4-5 3 3 5-7" /></svg>
                الأداء
              </NavLink>
            </div>
            <div className="nav-group">
              <div className="nav-group-label">الإدارة</div>
              <NavLink
                to="/supplier/employees"
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c1-4 4-6 6.5-6s5.5 2 6.5 6" /></svg>
                الفريق
              </NavLink>
              <NavLink
                to="/supplier/settings"
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.7.7a1 1 0 01-1.4 1.4l-.7-.7a1.7 1.7 0 00-1.9-.3" /></svg>
                الإعدادات
              </NavLink>
            </div>
          </nav>
          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="avatar en">{initials}</div>
              <div>
                <div className="uname">{displayName}</div>
                <div className="urole">{employee?.role === 'owner' ? 'مسؤول المورد' : employee?.role ?? 'مسؤول المورد'}</div>
              </div>
            </div>
          </div>
        </aside>
        <div className={`sidebar-scrim${sidebarOpen ? ' open' : ''}`} id="sidebarScrim" onClick={closeSidebar} />

        <div className="main">
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              <button type="button" className="menu-toggle" id="menuToggle" aria-label="القائمة" onClick={openSidebar}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              </button>
              <div className="search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                <input type="text" placeholder="ابحث عن طلب أو منتج..." onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) navigate(`/supplier/products?highlight=${encodeURIComponent(e.target.value.trim())}`); }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="topbar-avatar en">{initials}</div>
            </div>
          </div>

          <div className="content">
            <Suspense fallback={<SkeletonRows rows={6} />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
