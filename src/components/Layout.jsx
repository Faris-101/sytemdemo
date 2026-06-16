import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Bell,
  CalendarCheck,
  LayoutDashboard,
  Target,
  UserRound,
  Monitor,
  Tablet,
  Smartphone,
  Maximize,
} from "lucide-react";
import Navbar from "./Navbar";

const mobileLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/leads", label: "Leads", icon: Target },
  { to: "/dashboard/customers", label: "Customers", icon: UserRound },
  { to: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/dashboard/reminders", label: "Reminder", icon: Bell },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("pc"); // "pc", "tablet", "mobile"

  // Ukuran simulasi
  const containerWidths = {
    pc: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  // Helper untuk menentukan apakah kita dalam mode simulasi
  const isSimulated = viewMode !== "pc";

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#0f172a]">
      {/* ── DEVICE PREVIEWER CONTROLS ── */}
      <div className="relative z-[100] flex h-14 w-full items-center justify-center gap-4 border-b border-white/5 bg-slate-900/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 rounded-2xl bg-black/20 p-1 border border-white/5 shadow-inner">
          <DeviceButton 
            active={viewMode === "pc"} 
            onClick={() => setViewMode("pc")} 
            icon={<Monitor className="h-4 w-4" />} 
            label="Desktop" 
          />
          <DeviceButton 
            active={viewMode === "tablet"} 
            onClick={() => setViewMode("tablet")} 
            icon={<Tablet className="h-4 w-4" />} 
            label="Tablet" 
          />
          <DeviceButton 
            active={viewMode === "mobile"} 
            onClick={() => setViewMode("mobile")} 
            icon={<Smartphone className="h-4 w-4" />} 
            label="Mobile" 
          />
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">Responsive Preview Active</span>
        </div>
      </div>

      {/* ── MAIN WRAPPER ── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-0 transition-all duration-500">
        <div 
          className={`
            relative flex h-full overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-all duration-500 ease-in-out
            ${isSimulated ? "my-auto rounded-[32px] border-[8px] border-slate-800 shadow-2xl ring-1 ring-white/10" : "w-full"}
          `}
          style={{ 
            width: containerWidths[viewMode],
            maxHeight: isSimulated ? "calc(100% - 40px)" : "100%"
          }}
        >
          {/* Overlay Sidebar Mobile (Saat disimulasi maupun real) */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navbar */}
          <div
            className={`
              fixed inset-y-0 left-0 z-50 flex w-full max-w-[280px] transition-transform duration-300
              ${viewMode === 'pc' ? 'lg:translate-x-0' : ''}
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <Navbar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Content Area */}
          <div className={`flex min-w-0 flex-1 flex-col overflow-hidden ${viewMode === 'pc' ? 'lg:ml-[280px]' : ''}`}>
            {/* Header (Hanya muncul jika bukan PC atau ukuran layar kecil) */}
            <header className={`glass sticky top-0 z-30 flex items-center justify-between gap-3 px-5 py-4 shadow-sm shadow-slate-900/10 ${viewMode === 'pc' ? 'lg:hidden' : ''}`}>
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)] transition-all hover:scale-105 active:scale-95"
                aria-label="Buka menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="font-display text-[20px] font-semibold tracking-tighter text-[var(--text)]">
                Prop<span className="text-[var(--accent)]">Suite</span>
              </span>
              <div className="h-11 w-11 rounded-2xl bg-white shadow-sm overflow-hidden p-1.5 border border-[var(--border)]">
                <img src="/assets/logo.svg" alt="PropSuite Logo" className="h-full w-full object-contain" />
              </div>
            </header>

            {/* Main Content */}
            <main className="app-scrollbar flex-1 overflow-y-auto px-4 py-6 pb-24 sm:px-6 md:px-10 lg:px-14 lg:py-14 lg:pb-6">
              <Outlet />
            </main>

            {/* Bottom Nav (Hanya muncul jika bukan PC atau layar mobile/tablet) */}
            <footer className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-md ${viewMode === 'pc' ? 'lg:hidden' : ''}`}>
              <div className="mx-auto flex max-w-[720px] items-center justify-between gap-1">
                {mobileLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/" || item.to === "/dashboard"}
                      className={({ isActive }) =>
                        `group flex min-w-[0] flex-1 flex-col items-center justify-center gap-1 rounded-3xl px-2 py-2 text-[11px] font-semibold transition-all ${
                          isActive
                            ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] text-white shadow-[0_12px_30px_var(--accent-glow)]"
                            : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                        }`
                      }
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-2xl transition-all">
                        <Icon className="h-5 w-5" strokeWidth={2.2} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
        ${active ? "bg-white text-slate-900 shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5"}
      `}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
