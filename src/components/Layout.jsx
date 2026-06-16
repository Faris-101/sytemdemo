import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  Bell,
  CalendarCheck,
  LayoutDashboard,
  Target,
  UserRound,
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

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-30 flex w-full max-w-[280px] transition-transform duration-300
          lg:fixed lg:w-[280px] lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Navbar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-[280px]">
        <header className="glass sticky top-0 z-20 flex items-center justify-between gap-3 px-5 py-4 lg:hidden shadow-sm shadow-slate-900/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)] transition-all hover:scale-105 active:scale-95"
            aria-label="Buka menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="font-display text-[20px] font-semibold tracking-tighter text-[var(--text)]">
            Prop<span className="text-[var(--accent)]">Suite</span>
          </span>
          <div className="h-11 w-11 rounded-2xl bg-white shadow-sm overflow-hidden p-1.5 border border-[var(--border)]">
            <img
              src="/assets/logo.svg"
              alt="PropSuite Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </header>

        <main className="app-scrollbar flex-1 overflow-y-auto px-4 py-6 pb-24 sm:px-6 md:px-10 lg:px-14 lg:py-14 lg:pb-6">
          <Outlet />
        </main>

        <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden">
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
  );
}
