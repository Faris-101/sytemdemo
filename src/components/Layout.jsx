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
  Menu,
  X,
  Settings2,
  Search,
} from "lucide-react";
import Navbar from "./Navbar";
import { useView } from "../context/ViewContext";
import { useAuth } from "../context/useAuth";

// Navigation links for the bottom mobile navbar
const mobileLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/leads", label: "Leads", icon: Target },
  { to: "/dashboard/customers", label: "Customers", icon: UserRound },
  { to: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/dashboard/reminders", label: "Reminder", icon: Bell },
];

export default function Layout() {
  const { viewMode, setViewMode } = useView();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);

  // Helper booleans for clean logic
  const isDesktop = viewMode === "desktop";
  const isTablet = viewMode === "tablet";
  const isMobile = viewMode === "mobile";

  // 1. View Mode Initialization Logic
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Note: We only auto-set on mount or if needed, 
      // but the requirement says "Use single source of truth: ONLY from viewMode state"
      // So we don't force it on every resize if the user manually changed it.
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar automatically when switching view modes
  useEffect(() => {
    setSidebarOpen(false);
  }, [viewMode]);

  // Close switcher popup on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setIsSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // User initials for avatar
  const initials = user?.nama ? user.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "AD";

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      
      {/* ── MAIN WORKSPACE STRUCTURE ── */}
      <div className="relative flex flex-1 flex-row h-full w-full overflow-hidden">
        
        {/* 2. SIDEBAR LOGIC (Conditional based on viewMode) */}
        {/* Mobile: Completely removed from DOM unless opened as overlay (we'll use the same overlay logic for Tablet/Mobile) */}
        {/* Desktop: Always visible on left */}
        
        {(isTablet || isMobile) && sidebarOpen && (
          <div 
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        {(!isMobile || sidebarOpen) && (
          <aside 
            className={`
              z-[90] flex w-[280px] shrink-0 transition-transform duration-300 h-full
              ${isDesktop ? "relative translate-x-0" : "fixed inset-y-0 left-0 -translate-x-full"}
              ${sidebarOpen ? "!translate-x-0 shadow-2xl" : ""}
            `}
          >
            <Navbar onClose={() => setSidebarOpen(false)} />
          </aside>
        )}

        {/* 3. MAIN CONTENT VIEWPORT */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden h-full">
          
          {/* TOP HEADER (Layout changes based on mode) */}
          <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-all bg-[#0a0914]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]`}>
            
            {/* Left Section: Hamburger (Tablet/Mobile) or Search (Desktop) */}
            <div className="flex items-center gap-4 flex-1">
              {!isDesktop && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-2.5 rounded-xl bg-white/5 text-[var(--accent)] hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                >
                  <Menu className="h-5 w-5" strokeWidth={2.5} />
                </button>
              )}
              
              {!isDesktop && (
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-white p-1.5 shadow-lg shadow-[var(--accent-glow)] overflow-hidden">
                    <img src="/assets/logo.svg" alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <span className="font-display text-xl font-black tracking-tight text-white">
                    Prop<span className="text-[var(--accent)]">Suite</span>
                  </span>
                </div>
              )}

              {isDesktop && (
                <div className="relative w-full max-w-md group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-[var(--accent)] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search operations..." 
                    className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-glow)] transition-all placeholder:text-white/20"
                  />
                </div>
              )}
            </div>

            {/* Right Section: Notifications + Profile */}
            <div className="flex items-center gap-4">
              {isDesktop && (
                <button className="relative p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5 group">
                  <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-[#0a0914] shadow-sm" />
                </button>
              )}

              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                {!isMobile && (
                  <div className="text-right hidden sm:block">
                    <p className="text-[11px] font-black text-white leading-none tracking-tight">{user?.nama || "Administrator"}</p>
                    <p className="text-[9px] font-bold text-[#fbbf24] uppercase tracking-[0.15em] mt-1 opacity-80">{user?.role || "Manager"}</p>
                  </div>
                )}
                <div className={`${isMobile ? "h-9 w-9" : "h-11 w-11"} rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#d97706] flex items-center justify-center text-xs font-black text-black shadow-lg shadow-[rgba(251,191,36,0.2)] border-2 border-white/20 active:scale-95 transition-transform`}>
                  {initials}
                </div>
              </div>
            </div>
          </header>

          {/* CORE CONTENT AREA (Padding adjusts per mode) */}
          <main 
            className={`
              app-scrollbar flex-1 overflow-y-auto overflow-x-hidden transition-all
              ${isDesktop ? "px-10 py-8" : isTablet ? "px-6 py-6" : "px-4 py-4"}
            `}
          >
            <div className="max-w-[1600px] mx-auto">
               <Outlet />
            </div>
          </main>

          {/* BOTTOM NAVIGATION (Visible only in Mobile mode) */}
          {isMobile && (
            <footer className="sticky bottom-0 z-[60] border-t border-white/10 bg-[#1c1730]/90 px-4 py-3 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
              <div className="mx-auto flex max-w-[500px] items-center justify-between gap-1">
                {mobileLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dashboard"}
                    className={({ isActive }) =>
                      `group flex min-w-[0] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 transition-all ${
                        isActive 
                          ? "bg-[var(--accent)] text-black shadow-xl shadow-[var(--accent-glow)] scale-105 font-bold" 
                          : "text-white/40 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 mb-0.5" strokeWidth={isActive ? 3 : 2} />
                    <span className="text-[8px] font-black uppercase tracking-[0.1em] truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* ── 4. MODE SWITCHER FAB (Bottom Right) ── */}
      <div className="fixed bottom-6 right-6 z-[999]" ref={switcherRef}>
        {isSwitcherOpen && (
          <div className="absolute bottom-full mb-4 right-0 w-52 rounded-[28px] bg-slate-900/98 border border-white/10 p-2 shadow-2xl backdrop-blur-3xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
             <div className="px-4 py-2 mb-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">Switch View</p>
             </div>
             
             <button 
                onClick={() => { setViewMode('desktop'); setIsSwitcherOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${isDesktop ? "bg-[var(--accent)] text-black" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
             >
                <Monitor className={`h-4 w-4 ${isDesktop ? "" : "text-[var(--accent)]"}`} />
                <span className="text-[11px] font-black uppercase tracking-wider">Desktop</span>
             </button>

             <button 
                onClick={() => { setViewMode('tablet'); setIsSwitcherOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${isTablet ? "bg-[var(--accent)] text-black" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
             >
                <Tablet className={`h-4 w-4 ${isTablet ? "" : "text-[var(--accent)]"}`} />
                <span className="text-[11px] font-black uppercase tracking-wider">Tablet</span>
             </button>

             <button 
                onClick={() => { setViewMode('mobile'); setIsSwitcherOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${isMobile ? "bg-[var(--accent)] text-black" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
             >
                <Smartphone className={`h-4 w-4 ${isMobile ? "" : "text-[var(--accent)]"}`} />
                <span className="text-[11px] font-black uppercase tracking-wider">Mobile</span>
             </button>
          </div>
        )}

        <button 
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className={`flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition-all duration-300 border border-white/20 ${
            isSwitcherOpen ? "bg-white text-black scale-110" : "bg-[var(--accent)] text-black hover:scale-105 active:scale-95"
          }`}
        >
          {isSwitcherOpen ? (
            <X className="h-6 w-6" strokeWidth={3} />
          ) : (
            <>
              {isDesktop && <Monitor className="h-6 w-6" strokeWidth={2.5} />}
              {isTablet && <Tablet className="h-6 w-6" strokeWidth={2.5} />}
              {isMobile && <Smartphone className="h-6 w-6" strokeWidth={2.5} />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
