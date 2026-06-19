import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarCheck,
  LayoutDashboard,
  Menu,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  Target,
  UserRound,
  X,
} from "lucide-react";
import Navbar from "./Navbar";
import { useView } from "../context/ViewContext";
import { useAuth } from "../context/useAuth";

const quickLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/leads", label: "Leads", icon: Target },
  { to: "/dashboard/customers", label: "Customers", icon: UserRound },
  { to: "/dashboard/bookings", label: "Booking", icon: CalendarCheck },
];

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

export default function Layout() {
  const { viewMode, setViewMode } = useView();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);

  const isMobile = viewMode === "mobile";
  const isTablet = viewMode === "tablet";
  const isDesktop = viewMode === "desktop";

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

  const initials = getInitials(user?.nama || "Administrator");
  const ActiveModeIcon = viewOptions.find((option) => option.id === viewMode)?.icon || Smartphone;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#F8FAFC] text-slate-900">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-[80] h-auto min-h-0 rounded-none bg-slate-950/35 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {isMobile ? (
        <aside
          className={`fixed inset-y-0 left-0 z-[90] w-[292px] transition-transform duration-300 ease-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Navbar variant="full" onClose={() => setSidebarOpen(false)} />
        </aside>
      ) : (
        <aside
          className={`relative z-30 shrink-0 border-r border-slate-200/80 bg-white ${
            isDesktop ? "w-[76px]" : "w-[92px]"
          }`}
        >
          <Navbar variant={isDesktop ? "icon" : "compact"} />
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/82 px-4 py-3 backdrop-blur-2xl sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {isMobile && (
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
                  {isMobile ? "Mobile Mode" : isTablet ? "Tablet Mode" : "Desktop Workspace"}
                </p>
              </div>
            </div>

            {!isMobile && (
              <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 lg:flex">
                {quickLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    className={({ isActive }) =>
                      `inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
                        isActive
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            )}

            <div className="flex items-center gap-2">
              {!isMobile && (
                <div className="relative hidden w-[260px] md:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Cari operasional..."
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
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
                  <div className="hidden min-w-0 pr-2 sm:block">
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

        <main
          className={`app-scrollbar flex-1 overflow-y-auto overflow-x-hidden ${
            isDesktop ? "px-4 py-5 sm:px-6" : isTablet ? "px-4 py-5 sm:px-5" : "px-4 py-4"
          }`}
        >
          <div
            className={`mx-auto w-full ${
              isDesktop ? "max-w-[1180px]" : isTablet ? "max-w-[860px]" : "max-w-[520px]"
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>

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
                        active ? "bg-white/16 text-white" : "bg-white text-indigo-600 shadow-sm"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{option.label}</span>
                      <span className={`block text-[11px] font-medium ${active ? "text-white/72" : "text-slate-400"}`}>
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
          aria-label={switcherOpen ? "Tutup pilihan tampilan" : "Buka pilihan tampilan"}
        >
          {switcherOpen ? <X className="h-5 w-5" /> : <ActiveModeIcon className="h-5 w-5" />}
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
