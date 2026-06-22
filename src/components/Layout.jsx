import { Outlet } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
    label: "Mobile",
    description: "Single column",
    icon: Smartphone,
  },
  {
    id: "tablet",
    label: "Tablet",
    description: "Two column",
    icon: Tablet,
  },
  {
    id: "desktop",
    label: "Desktop Workspace",
    description: "More information",
    icon: Monitor,
  },
];

const VIRTUAL_WIDTH = { desktop: 1180 };

export default function Layout() {
  const { viewMode, setViewMode } = useView();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);
  const shellRef = useRef(null);
  const [scale, setScale] = useState(1);

  const isMobile = viewMode === "mobile";
  const isTablet = viewMode === "tablet";
  const isDesktop = viewMode === "desktop";
  const useDrawerNav = isMobile || isTablet;
  const virtualWidth = VIRTUAL_WIDTH[viewMode] || null;

  useEffect(() => {
    setSidebarOpen(false);
  }, [viewMode]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setSwitcherOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useLayoutEffect(() => {
    if (!virtualWidth || !shellRef.current) {
      setScale(1);
      return undefined;
    }

    const shellEl = shellRef.current;

    function updateScale() {
      const availableWidth = shellEl.clientWidth;
      const next =
        availableWidth > 0 ? Math.min(1, availableWidth / virtualWidth) : 1;
      setScale(next > 0 ? next : 1);
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [virtualWidth]);

  const initials = getInitials(user?.nama || "Administrator");
  const ActiveModeIcon =
    viewOptions.find((option) => option.id === viewMode)?.icon || Smartphone;
  const isShrunk = isDesktop && scale < 0.999;

  const sidebarEl = (
    <aside
      className={`relative z-30 shrink-0 border-r border-slate-200/80 bg-white ${
        isDesktop ? "w-[76px]" : "w-[92px]"
      }`}
    >
      <Navbar variant={isDesktop ? "icon" : "compact"} />
    </aside>
  );

  const headerEl = (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/82 px-4 py-3 backdrop-blur-2xl sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {useDrawerNav && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              PropSuite
            </p>
            <p className="truncate text-sm font-bold text-slate-900">
              {isMobile
                ? "Mobile Mode"
                : isTablet
                  ? "Tablet Mode"
                  : "Desktop Workspace"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && (
            <div className="relative w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Cari operasional..."
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          )}

          {!isDesktop && (
            <span className="text-[11px] font-semibold text-slate-500">
              {new Intl.DateTimeFormat("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date())}
            </span>
          )}

          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
            aria-label="Notifikasi"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>

          <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 shadow-sm">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-xs font-black text-white">
              {initials}
            </div>
            {!isMobile && (
              <div className="min-w-0 pr-2">
                <p className="max-w-[120px] truncate text-xs font-bold text-slate-900">
                  {user?.nama || "Administrator"}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {user?.role || "Admin"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div
      ref={shellRef}
      className="relative flex h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900"
    >
      {useDrawerNav && sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-[80] h-auto min-h-0 rounded-none bg-slate-950/35 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {useDrawerNav ? (
        <>
          <aside
            className={`fixed inset-y-0 left-0 z-[90] w-[292px] transition-transform duration-300 ease-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Navbar variant="full" onClose={() => setSidebarOpen(false)} />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            {headerEl}
            <main className="app-scrollbar flex-1 overflow-y-auto overflow-x-hidden bg-slate-100 px-3 py-5 sm:px-6">
              <div
                className={`mx-auto w-full rounded-[28px] border border-slate-200 bg-[#F8FAFC] p-3 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-5 ${
                  isMobile ? "max-w-[430px]" : "max-w-[860px]"
                }`}
              >
                <Outlet />
              </div>
            </main>
          </div>
        </>
      ) : isShrunk ? (
        <div className="h-screen w-full overflow-hidden bg-slate-200">
          <div
            style={{
              width: virtualWidth,
              height: `calc(100vh / ${scale})`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div className="flex h-full" style={{ width: virtualWidth }}>
              {sidebarEl}
              <div className="flex min-w-0 flex-1 flex-col">
                {headerEl}
                <main
                  className={`app-scrollbar flex-1 overflow-y-auto overflow-x-hidden ${
                    isDesktop
                      ? "bg-[#F8FAFC] px-4 py-5 sm:px-6"
                      : "bg-slate-100 px-3 py-5 sm:px-6"
                  }`}
                >
                  <div className="w-full">
                    <Outlet />
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {sidebarEl}
          <div className="flex min-w-0 flex-1 flex-col">
            {headerEl}
            <main
              className={`app-scrollbar flex-1 overflow-y-auto overflow-x-hidden ${
                isDesktop
                  ? "bg-[#F8FAFC] px-4 py-5 sm:px-6"
                  : "bg-slate-100 px-3 py-5 sm:px-6"
              }`}
            >
              <div
                className={`mx-auto w-full ${
                  isDesktop
                    ? "max-w-[1180px]"
                    : "max-w-[860px] rounded-[28px] border border-slate-200 bg-[#F8FAFC] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-6"
                }`}
              >
                <Outlet />
              </div>
            </main>
          </div>
        </>
      )}

      <div ref={switcherRef} className="fixed bottom-5 right-5 z-[120]">
        {switcherOpen && (
          <div className="mb-3 w-[244px] rounded-[22px] border border-white/70 bg-white/88 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-in zoom-in">
            <div className="px-3 pb-2 pt-2">
              <p className="text-xs font-bold text-slate-950">Pilih Tampilan</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Sesuaikan kepadatan dashboard.
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
                    className={`flex h-auto min-h-0 w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                        active
                          ? "bg-white/16 text-white"
                          : "bg-white text-indigo-600 shadow-sm"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">
                        {option.label}
                      </span>
                      <span
                        className={`block text-[11px] font-medium ${active ? "text-white/72" : "text-slate-400"}`}
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
          onClick={() => setSwitcherOpen((open) => !open)}
          className="grid h-14 w-14 place-items-center rounded-full border border-white/70 bg-white/82 text-indigo-600 shadow-[0_18px_50px_rgba(79,70,229,0.28)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white"
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
    </div>
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
