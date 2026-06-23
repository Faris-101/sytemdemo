import { Outlet } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Bell,
  Menu,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  X,
} from "lucide-react";
import Navbar from "./Navbar";
import { useView } from "../context/ViewContext";
import { useAuth } from "../context/useAuth";

const viewOptions = [
  {
    id: "mobile",
    label: "Mobile Preview",
    description: "Tampilan perangkat seluler",
    icon: Smartphone,
  },
  {
    id: "tablet",
    label: "Tablet Preview",
    description: "Tampilan perangkat tablet",
    icon: Tablet,
  },
  {
    id: "desktop",
    label: "Desktop Workspace",
    description: "Tampilan penuh monitor",
    icon: Monitor,
  },
];

export default function Layout() {
  const { viewMode, setViewMode } = useView();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  
  const switcherRef = useRef(null);

  // Monitor lebar jendela browser asli
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tutup sidebar saat berganti mode tampilan
  useEffect(() => {
    setSidebarOpen(false);
  }, [viewMode]);

  // Tutup pemilih tampilan saat klik di luar
  useEffect(() => {
    function onPointerDown(e) {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const initials = getInitials(user?.nama || "Administrator");
  const ActiveModeIcon =
    viewOptions.find((o) => o.id === viewMode)?.icon || Smartphone;

  // Deteksi jika user membuka dari layar lebar (desktop)
  const screenIsDesktop = windowWidth >= 1024;
  
  // Tampilkan simulator hanya jika di desktop dan memilih mode simulasi mobile/tablet
  const showSimulator = screenIsDesktop && (viewMode === "mobile" || viewMode === "tablet");

  // ── Header Elemen ────────────────────────────────────────────────────────
  const headerEl = (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        {/* Kiri: Tombol Drawer & Judul Mode */}
        <div className="flex min-w-0 items-center gap-2">
          {viewMode !== "desktop" && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 focus:outline-none"
              aria-label="Buka menu navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              PropSuite
            </p>
            <p className="truncate text-xs font-bold text-slate-900">
              {viewMode === "mobile"
                ? "Mobile Mode"
                : viewMode === "tablet"
                  ? "Tablet Mode"
                  : "Desktop Workspace"}
            </p>
          </div>
        </div>

        {/* Kanan: Search, Notifikasi, & User Profil */}
        <div className="flex items-center gap-2">
          {viewMode === "desktop" && (
            <div className="relative w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Cari operasional..."
                className="h-9 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pl-9 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          )}

          {viewMode !== "desktop" && (
            <span className="shrink-0 text-[10px] font-semibold leading-tight text-slate-500 mr-1">
              {new Intl.DateTimeFormat("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date())}
            </span>
          )}

          <button
            type="button"
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
            aria-label="Notifikasi"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>

          <div className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 shadow-sm">
            <div className="grid h-7 w-7 place-items-center rounded-xl bg-indigo-600 text-[11px] font-black text-white">
              {initials}
            </div>
            {viewMode === "desktop" && (
              <div className="min-w-0 pr-1">
                <p className="max-w-[100px] truncate text-xs font-bold text-slate-900">
                  {user?.nama || "Administrator"}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {user?.role || "Admin"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // ── Icon Sidebar (Khusus Desktop Workspace) ──────────────────────────────
  const iconSidebarEl = (
    <aside className="relative z-30 w-[68px] shrink-0 border-r border-slate-200/80 bg-white">
      <Navbar variant="icon" />
    </aside>
  );

  // ── View Switcher FAB ────────────────────────────────────────────────────
  const switcherEl = (
    <div ref={switcherRef} className="fixed bottom-5 right-5 z-[120]">
      {switcherOpen && (
        <div className="mb-3 w-[250px] rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)] animate-in zoom-in-95 duration-150">
          <div className="px-3 pb-2 pt-2">
            <p className="text-xs font-bold text-slate-950">Mode Tampilan</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              Uji tata letak dasbor responsif.
            </p>
          </div>
          <div className="space-y-1">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              const active = viewMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setViewMode(option.id);
                    setSwitcherOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-indigo-50 text-indigo-600 shadow-sm"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold">
                      {option.label}
                    </span>
                    <span
                      className={`block text-[10px] font-medium ${
                        active ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setSwitcherOpen((o) => !o)}
        className="grid h-14 w-14 place-items-center rounded-full border border-indigo-100 bg-white text-indigo-600 shadow-[0_8px_32px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none"
        aria-label={
          switcherOpen ? "Tutup pilihan tampilan" : "Buka pilihan tampilan"
        }
      >
        {switcherOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <ActiveModeIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER STRATEGY
  // ══════════════════════════════════════════════════════════════════════════

  // SKENARIO 1: Tampilkan simulator jika di desktop dan memilih Mobile/Tablet
  if (showSimulator) {
    const isMobileSim = viewMode === "mobile";
    return (
      <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 overflow-hidden p-6 select-none">
        
        {/* Info Banner */}
        <div className="mb-4 flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-[10px] text-slate-300">
              Interactive Device Preview
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Menguji adaptasi responsif pada resolusi{" "}
            <span className="text-indigo-400 font-bold">
              {isMobileSim ? "390px × 820px (Mobile)" : "768px × 920px (Tablet)"}
            </span>
          </p>
        </div>

        {/* Chassis Device Simulator */}
        <div
          className={`relative transition-all duration-500 flex flex-col bg-white text-slate-900 border-slate-950 shadow-[0_35px_90px_rgba(0,0,0,0.8)] overflow-hidden ${
            isMobileSim
              ? "w-[390px] h-[820px] border-[14px] rounded-[48px] ring-8 ring-slate-900/60"
              : "w-[768px] h-[920px] max-h-[85vh] border-[16px] rounded-[36px] ring-8 ring-slate-900/60"
          }`}
        >
          {/* Kamera depan / Notch Simulation */}
          {isMobileSim && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-full z-50 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-12" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-900/50" />
            </div>
          )}

          {/* Sisi Dalam Layar Simulasi (Workspace) */}
          <div className="w-full h-full relative overflow-hidden bg-[#F8FAFC] select-text">
            {/* Backdrop Sidebar */}
            {sidebarOpen && (
              <div
                className="absolute inset-0 z-[80] h-full w-full bg-slate-950/40 transition-opacity cursor-pointer"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar Drawer Terbatas dalam layar simulasi */}
            <aside
              className={`absolute inset-y-0 left-0 z-[90] w-[260px] transition-transform duration-300 ease-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <Navbar variant="full" onClose={() => setSidebarOpen(false)} />
            </aside>

            {/* Layout Struktur Konten */}
            <div className="flex h-full w-full flex-col overflow-hidden">
              {headerEl}
              <main className="app-scrollbar flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] px-4 py-4">
                <Outlet />
              </main>
            </div>
          </div>
        </div>

        {/* Pemilih Tampilan Luar Simulator */}
        {switcherEl}
      </div>
    );
  }

  // SKENARIO 2: Tampilan Alami/Fluid (Responsive Murni tanpa scaling)
  // Digunakan untuk desktop workspace penuh, ATAU perangkat mobile/tablet asli
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900">
      
      {/* Sidebar Kiri (Hanya tampil di Desktop Workspace asli) */}
      {viewMode === "desktop" && iconSidebarEl}

      {/* Drawer Sidebar untuk layar mobile/tablet asli */}
      {viewMode !== "desktop" && (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-[80] h-full w-full bg-slate-950/40 cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside
            className={`fixed inset-y-0 left-0 z-[90] w-[280px] transition-transform duration-300 ease-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Navbar variant="full" onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main Konten Utama - Mengisi sisa ruang secara fleksibel */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {headerEl}
        <main className="app-scrollbar flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] px-4 py-5 md:px-6">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>      {/* Pemilih Tampilan */}
      {switcherEl}
    </div>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
