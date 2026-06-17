import { NavLink, Outlet } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  CalendarCheck,
  LayoutDashboard,
  Target,
  UserRound,
  Monitor,
  Tablet,
  Smartphone,
  ChevronDown,
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const dropdownRef = useRef(null);

  const deviceDims = {
    pc: { w: "100%", h: "100%" },
    tablet: { w: "820px", h: "1180px" },
    mobile: { w: "390px", h: "844px" },
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPreviewOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (viewMode === "pc") {
      setScale(1);
      return;
    }
    const updateScale = () => {
      const padding = 120;
      const availableH = window.innerHeight - padding;
      const targetH = parseInt(deviceDims[viewMode].h);
      if (availableH < targetH) setScale(availableH / targetH);
      else setScale(1);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [viewMode]);

  const isSimulated = viewMode !== "pc";

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#0a0914]">
      
      {/* ── FLOATING PREVIEWER ── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000]" ref={dropdownRef}>
        <button 
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 shadow-2xl ${
            isPreviewOpen 
              ? "bg-slate-900 border-[var(--accent)] text-white" 
              : "bg-white/10 border-white/10 text-white backdrop-blur-xl hover:bg-white/20"
          }`}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent)] shadow-lg">
             {viewMode === "pc" ? <Monitor className="h-3.5 w-3.5" /> : 
              viewMode === "tablet" ? <Tablet className="h-3.5 w-3.5" /> : 
              <Smartphone className="h-3.5 w-3.5" />}
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">
            {viewMode.toUpperCase()} VIEW
          </span>
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-300 ${isPreviewOpen ? "rotate-180" : ""}`} />
        </button>

        {isPreviewOpen && (
          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 rounded-[24px] bg-slate-900/95 border border-white/10 p-2 shadow-2xl backdrop-blur-2xl animate-in zoom-in slide-in-from-top-2 duration-300">
             <PreviewItem active={viewMode === 'pc'} onClick={() => { setViewMode('pc'); setIsPreviewOpen(false); }} icon={<Monitor className="h-4 w-4" />} label="Desktop View" />
             <PreviewItem active={viewMode === 'tablet'} onClick={() => { setViewMode('tablet'); setIsPreviewOpen(false); }} icon={<Tablet className="h-4 w-4" />} label="Tablet Mode" />
             <PreviewItem active={viewMode === 'mobile'} onClick={() => { setViewMode('mobile'); setIsPreviewOpen(false); }} icon={<Smartphone className="h-4 w-4" />} label="Mobile Phone" />
          </div>
        )}
      </div>

      {/* ── WORKSPACE ── */}
      <div className="relative flex flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_center,rgba(142,124,255,0.05)_0%,transparent_80%)]">
        
        <div 
          className={`
            relative transition-all duration-700 ease-in-out origin-center flex w-full h-full
            ${isSimulated ? "device-frame !w-auto !h-auto" : ""}
            ${viewMode === 'mobile' ? 'force-mobile' : ''}
            ${viewMode === 'tablet' ? 'force-tablet' : ''}
          `}
          style={{ 
            width: isSimulated ? deviceDims[viewMode].w : "100%",
            height: isSimulated ? deviceDims[viewMode].h : "100%",
            transform: isSimulated ? `scale(${scale})` : 'none',
          }}
        >
          {/* Sidebar Overlay (Mobile real or simulation) */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar Navbar */}
          <aside className={`
              z-[70] flex w-full max-w-[280px] shrink-0 transition-transform duration-300
              ${viewMode === 'pc' ? 'relative translate-x-0' : 'fixed inset-y-0 left-0 -translate-x-full'}
              ${sidebarOpen ? "!translate-x-0" : ""}
          `}>
            <Navbar onClose={() => setSidebarOpen(false)} />
          </aside>

          {/* Main Content Area */}
          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--bg)]">
            
            {/* Header for Mobile/Tablet */}
            <header className={`glass sticky top-0 z-50 flex items-center justify-between gap-3 px-6 py-4 shadow-sm shadow-slate-900/10 ${viewMode === 'pc' ? 'lg:hidden' : 'pt-12'}`}>
              <button onClick={() => setSidebarOpen(true)} className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)] transition-all">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <span className="font-display text-[22px] font-black tracking-tight text-[var(--text)]">Prop<span className="text-[var(--accent)]">Suite</span></span>
              <div className="h-10 w-10 rounded-2xl bg-white shadow-lg p-1.5 border border-[var(--border)]">
                <img src="/assets/logo.svg" alt="Logo" className="h-full w-full object-contain" />
              </div>
            </header>

            <main className="app-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-8 md:px-10 lg:px-12 lg:py-10">
              <Outlet />
            </main>

            {/* Bottom Nav Simulation */}
            <footer className={`sticky bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/90 px-4 py-4 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl ${viewMode === 'pc' ? 'lg:hidden' : ''}`}>
              <div className="mx-auto flex max-w-[500px] items-center justify-between gap-2">
                {mobileLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/" || item.to === "/dashboard"}
                      className={({ isActive }) =>
                        `group flex min-w-[0] flex-1 flex-col items-center justify-center gap-1.5 rounded-[22px] px-2 py-3 transition-all ${
                          isActive ? "bg-[var(--accent)] text-white shadow-lg" : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className="h-5 w-5" strokeWidth={isActive ? 3 : 2} />
                          <span className="text-[9px] font-black uppercase tracking-widest truncate">{item.label}</span>
                        </>
                      )}
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

function PreviewItem({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
        active ? "bg-[var(--accent)] text-white shadow-lg scale-105" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="h-4 w-4 shrink-0">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
