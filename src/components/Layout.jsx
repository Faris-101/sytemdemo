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
  Menu,
  X,
  Settings2,
} from "lucide-react";
import Navbar from "./Navbar";
import { useView } from "../context/ViewContext";

const mobileLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/leads", label: "Leads", icon: Target },
  { to: "/dashboard/customers", label: "Customers", icon: UserRound },
  { to: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/dashboard/reminders", label: "Reminder", icon: Bell },
];

export default function Layout() {
  const { viewMode, setViewMode } = useView();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);

  // Close switcher on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setIsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine if we need to force mobile/tablet layout behavior
  const isMobileView = viewMode === "mobile";
  const isTabletView = viewMode === "tablet";
  const isDesktopView = viewMode === "desktop";

  return (
    <div className={`workspace-root relative flex h-screen w-full flex-col overflow-hidden bg-[var(--bg)]`}>
      
      {/* ── NATIVE DASHBOARD STRUCTURE ── */}
      <div className={`relative flex flex-1 flex-row h-full w-full ${isDesktopView ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"}`}>
        
        {/* 1. Sidebar (PC: Flex, Mobile/Tablet: Absolute) */}
        <aside className={`
            z-[100] flex w-full max-w-[280px] shrink-0 transition-transform duration-500 h-full
            ${isDesktopView ? "relative translate-x-0" : "fixed inset-y-0 left-0 -translate-x-full shadow-2xl"}
            ${sidebarOpen ? "!translate-x-0" : ""}
        `}>
          <Navbar onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Sidebar Overlay (Only active in non-desktop mode) */}
        {sidebarOpen && !isDesktopView && (
          <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* 2. Main Content Viewport */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden h-full">
          
          {/* Top Header (Visible only in non-desktop mode OR if screen width is forced small) */}
          <header className={`glass sticky top-0 z-50 flex items-center justify-between gap-3 px-6 py-4 shadow-sm shadow-slate-900/10 transition-all ${isDesktopView ? "hidden" : "flex"}`}>
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)] transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Menu className="h-6 w-6" strokeWidth={3} />
            </button>
            <span className="font-display text-[22px] font-black tracking-tight text-[var(--text)]">
              Prop<span className="text-[var(--accent)]">Suite</span>
            </span>
            <div className="h-10 w-10 rounded-2xl bg-white shadow-lg p-1.5 border border-[var(--border)] overflow-hidden">
              <img src="/assets/logo.svg" alt="Logo" className="h-full w-full object-contain" />
            </div>
          </header>

          {/* Core Content Area */}
          <main className={`app-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-8 md:px-10 lg:px-12 lg:py-10 transition-all ${isDesktopView ? "w-full" : ""}`}>
            <div className={`mx-auto w-full transition-all duration-500 ${isMobileView ? "max-w-[480px]" : isTabletView ? "max-w-[1024px]" : "max-w-[1600px]"}`}>
               <Outlet />
            </div>
          </main>

          {/* Bottom Navigation (Only visible in mobile mode) */}
          <footer className={`sticky bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-4 shadow-[0_-20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all ${isMobileView ? "block" : "hidden"}`}>
            <div className="mx-auto flex max-w-[500px] items-center justify-between gap-1.5">
              {mobileLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/" || item.to === "/dashboard"}
                  className={({ isActive }) =>
                    `group flex min-w-[0] flex-1 flex-col items-center justify-center gap-1.5 rounded-[24px] px-2 py-3 transition-all ${
                      isActive ? "bg-[var(--accent)] text-white shadow-xl scale-105" : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="h-5 w-5 mb-0.5" strokeWidth={isActive ? 3 : 2} />
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </footer>
        </div>
      </div>

      {/* ── MINIMALIST FLOATING WORKSPACE SWITCHER (Bottom Right) ── */}
      <div className="fixed bottom-6 right-6 z-[2000]" ref={switcherRef}>
        {isSwitcherOpen && (
          <div className="absolute bottom-full mb-4 right-0 w-56 rounded-[32px] bg-slate-900/98 border border-white/10 p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-3xl animate-in zoom-in slide-in-from-bottom-4 duration-500">
             <div className="px-4 py-2 mb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">Workspace Mode</p>
             </div>
             <SwitcherItem active={viewMode === 'desktop'} onClick={() => { setViewMode('desktop'); setIsSwitcherOpen(false); }} icon={<Monitor className="h-4 w-4" />} label="Desktop Workspace" />
             <SwitcherItem active={viewMode === 'tablet'} onClick={() => { setViewMode('tablet'); setIsSwitcherOpen(false); }} icon={<Tablet className="h-4 w-4" />} label="Tablet Workspace" />
             <SwitcherItem active={viewMode === 'mobile'} onClick={() => { setViewMode('mobile'); setIsSwitcherOpen(false); }} icon={<Smartphone className="h-4 w-4" />} label="Mobile Workspace" />
             <div className="mt-2 border-t border-white/5 pt-3 pb-1 px-4 text-center">
                <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">Refined v2.4 Engine</p>
             </div>
          </div>
        )}

        <button 
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300 shadow-2xl backdrop-blur-2xl group ${
            isSwitcherOpen 
              ? "bg-slate-900 border-[var(--accent)] text-white scale-110" 
              : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:scale-105"
          }`}
        >
          {isSwitcherOpen ? <X className="h-6 w-6" /> : <Settings2 className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />}
        </button>
      </div>
    </div>
  );
}

function SwitcherItem({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-[22px] transition-all text-left group ${
        active ? "bg-[var(--accent)] text-white shadow-lg scale-105" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? "text-white" : "text-[var(--accent)]"}`}>{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );
}
