import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CalendarCheck,
  LayoutDashboard,
  Target,
  UserRound,
  Monitor,
  Tablet,
  Smartphone,
  Info,
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
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  // Ukuran dimensi fisik perangkat simulasi
  const deviceDims = {
    pc: { w: "100%", h: "100%" },
    tablet: { w: "820px", h: "1180px" },
    mobile: { w: "390px", h: "844px" },
  };

  // Efek auto-scale untuk memastikan frame perangkat muat di layar
  useEffect(() => {
    if (viewMode === "pc") {
      setScale(1);
      return;
    }

    const updateScale = () => {
      const padding = 120; // Ruang untuk kontrol & bezel
      const availableH = window.innerHeight - padding;
      const targetH = parseInt(deviceDims[viewMode].h);
      
      if (availableH < targetH) {
        setScale(availableH / targetH);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [viewMode]);

  const isSimulated = viewMode !== "pc";

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#0f172a] font-sans selection:bg-[var(--accent)] selection:text-white">
      {/* ── TOP CONTROL BAR ── */}
      <nav className="relative z-[100] flex h-16 w-full items-center justify-between border-b border-white/5 bg-slate-900/90 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] shadow-lg shadow-[var(--accent-glow)]">
             <img src="/assets/logo.svg" alt="Logo" className="h-6 w-6 invert brightness-0" />
           </div>
           <div className="hidden sm:block">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none mb-1">Previewer</p>
             <h2 className="text-sm font-black text-white tracking-tight">PropSuite <span className="text-[var(--accent)]">v2.4</span></h2>
           </div>
        </div>

        <div className="flex items-center gap-1 rounded-2xl bg-black/30 p-1 border border-white/5 shadow-inner">
          <DeviceButton 
            active={viewMode === "pc"} 
            onClick={() => { setViewMode("pc"); setSidebarOpen(false); }} 
            icon={<Monitor className="h-4 w-4" />} 
            label="Desktop" 
          />
          <DeviceButton 
            active={viewMode === "tablet"} 
            onClick={() => { setViewMode("tablet"); setSidebarOpen(false); }} 
            icon={<Tablet className="h-4 w-4" />} 
            label="Tablet" 
          />
          <DeviceButton 
            active={viewMode === "mobile"} 
            onClick={() => { setViewMode("mobile"); setSidebarOpen(false); }} 
            icon={<Smartphone className="h-4 w-4" />} 
            label="Mobile" 
          />
        </div>

        <div className="flex items-center gap-3">
           <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold text-white/60">
             <Info className="h-3.5 w-3.5" />
             Scale: {Math.round(scale * 100)}%
           </div>
           <button className="h-10 px-4 rounded-xl bg-white text-slate-900 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-lg shadow-white/5">
             Publish
           </button>
        </div>
      </nav>

      {/* ── WORKSPACE ── */}
      <div className="relative flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8 transition-all duration-700 bg-[radial-gradient(circle_at_center,rgba(109,91,250,0.05)_0%,transparent_70%)]">
        
        {/* Shadow Backdrop for simulated mode */}
        {isSimulated && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

        <div 
          className={`
            relative transition-all duration-700 ease-in-out origin-center
            ${isSimulated ? "device-frame" : "h-full w-full"}
            ${viewMode === 'mobile' ? 'force-mobile' : ''}
            ${viewMode === 'tablet' ? 'force-tablet' : ''}
          `}
          style={{ 
            width: deviceDims[viewMode].w,
            height: deviceDims[viewMode].h,
            transform: `scale(${scale})`,
          }}
        >
          <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
            
            {/* Sidebar Overlay (Forced behavior in simulation or real mobile) */}
            {sidebarOpen && (
              <div
                className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar Navbar — Logika LG dipaksa jika bukan PC */}
            <div
              className={`
                absolute inset-y-0 left-0 z-[70] flex w-full max-w-[280px] transition-transform duration-300
                ${viewMode === 'pc' ? 'lg:relative lg:translate-x-0' : '-translate-x-full'}
                ${sidebarOpen ? "translate-x-0" : ""}
              `}
            >
              <Navbar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Viewport */}
            <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
              
              {/* Header: Muncul jika Mobile/Tablet atau Layar Kecil di PC */}
              <header className={`glass sticky top-0 z-50 flex items-center justify-between gap-3 px-5 py-4 shadow-sm shadow-slate-900/10 ${viewMode === 'pc' ? 'lg:hidden' : 'pt-10'}`}>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)] transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <span className="font-display text-[22px] font-black tracking-tight text-[var(--text)]">
                  Prop<span className="text-[var(--accent)]">Suite</span>
                </span>
                <div className="h-11 w-11 rounded-2xl bg-white shadow-xl shadow-[var(--accent-glow)] overflow-hidden p-1.5 border border-[var(--border)]">
                  <img src="/assets/logo.svg" alt="Logo" className="h-full w-full object-contain" />
                </div>
              </header>

              {/* Main Content Area */}
              <main className="app-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-10 lg:px-14 lg:py-12">
                <Outlet />
              </main>

              {/* Bottom Nav: Muncul di Mobile/Tablet */}
              <footer className={`sticky bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/90 px-3 py-3 shadow-[0_-15px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl ${viewMode === 'pc' ? 'lg:hidden' : ''}`}>
                <div className="mx-auto flex max-w-[500px] items-center justify-between gap-1">
                  {mobileLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/" || item.to === "/dashboard"}
                        className={({ isActive }) =>
                          `group flex min-w-[0] flex-1 flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2.5 transition-all ${
                            isActive
                              ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] text-white shadow-lg shadow-[var(--accent-glow)]"
                              : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                          }`
                        }
                      >
                        <Icon className="h-5 w-5 mb-0.5" strokeWidth={isActive ? 3 : 2} />
                        <span className="text-[10px] font-black uppercase tracking-widest truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </footer>
            </div>
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
        flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all
        ${active ? "bg-white text-slate-900 shadow-xl scale-105" : "text-white/40 hover:text-white hover:bg-white/5"}
      `}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}
