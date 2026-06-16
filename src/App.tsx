import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import PublicLayout from './layouts/PublicLayout';
import ScrollToTop from './components/ScrollToTop';

// --- Lazy Load Pages ---
// Public
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Features = lazy(() => import('./pages/Features'));
const Login = lazy(() => import('./pages/Login'));

// Dashboard Core
const Layout = lazy(() => import('./components/Layout'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));

// Dashboard Modules
const Units = lazy(() => import('./pages/Units'));
const Leads = lazy(() => import('./pages/Leads'));
const Customers = lazy(() => import('./pages/Customers'));
const Keuangan = lazy(() => import('./pages/Keuangan'));
const Reminders = lazy(() => import('./pages/Reminders'));
const DokumenCustomer = lazy(() => import('./pages/DokumenCustomer'));
const Cicilan = lazy(() => import('./pages/Cicilan'));
const ProgressPembangunan = lazy(() => import('./pages/ProgressPembangunan'));
const TimSales = lazy(() => import('./pages/TimSales'));
const Approvals = lazy(() => import('./pages/Approvals'));
const Laporan = lazy(() => import('./pages/Laporan'));
const Pricelist = lazy(() => import('./pages/Pricelist'));
const Bookings = lazy(() => import('./pages/Bookings'));
const AfterSales = lazy(() => import('./pages/AfterSales'));
const Legal = lazy(() => import('./pages/Legal'));
const Akuntansi = lazy(() => import('./pages/Akuntansi'));
const Proyek = lazy(() => import('./pages/Proyek'));
const Promos = lazy(() => import('./pages/Promos'));
const BAST = lazy(() => import('./pages/BAST'));
const CustomerPortal = lazy(() => import('./pages/CustomerPortal'));

// --- Loading Placeholder ---
function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-[var(--accent-soft)] border-t-[var(--accent)] rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] animate-pulse">
          Loading Module...
        </span>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth() as unknown as { user: Record<string, unknown> | null };
  const user = auth?.user;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="features" element={<Features />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="units" element={<Units />} />
            <Route path="leads" element={<Leads />} />
            <Route path="customers" element={<Customers />} />
            <Route path="keuangan" element={<Keuangan />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="dokumen" element={<DokumenCustomer />} />
            <Route path="cicilan" element={<Cicilan />} />
            <Route path="progress" element={<ProgressPembangunan />} />
            <Route path="timsales" element={<TimSales />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="laporan" element={<Laporan />} />
            <Route path="pricelist" element={<Pricelist />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="promo" element={<Promos />} />
            <Route path="portal" element={<CustomerPortal />} />
            <Route path="bast" element={<BAST />} />
            <Route path="after-sales" element={<AfterSales />} />
            <Route path="legal" element={<Legal />} />
            <Route path="akuntansi" element={<Akuntansi />} />
            <Route path="proyek" element={<Proyek />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}
