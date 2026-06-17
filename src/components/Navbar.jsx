import {
  BarChart3,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarCheck,
  CreditCard,
  FileText,
  Globe,
  Handshake,
  HardHat,
  Headphones,
  Landmark,
  LayoutDashboard,
  LogOut,
  Monitor,
  Scale,
  ShieldCheck,
  Tags,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  Wallet,
  Sun,
  Moon,
  X,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import { useView } from "../context/ViewContext";

const menus = [
  { group: "OVERVIEW" },
  { to: "/", label: "Lihat Website", icon: Globe },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

  { group: "PENJUALAN" },
  { to: "/dashboard/leads", label: "Leads", icon: Target },
  {
    to: "/dashboard/reminders",
    label: "Reminder",
    icon: Bell,
    badge: "reminder",
  },
  { to: "/dashboard/bookings", label: "Booking", icon: CalendarCheck },
  { to: "/dashboard/customers", label: "Customers", icon: UserRound },
  { to: "/dashboard/cicilan", label: "Cicilan", icon: CreditCard },
  { to: "/dashboard/dokumen", label: "Dokumen", icon: FileText },
  { to: "/dashboard/bast", label: "Serah Terima", icon: Handshake },
  { to: "/dashboard/after-sales", label: "After Sales", icon: Headphones },

  { group: "PROPERTI" },
  { to: "/dashboard/units", label: "Unit / Kavling", icon: Building2 },
  { to: "/dashboard/pricelist", label: "Pricelist & KPR", icon: Landmark },
  { to: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { to: "/dashboard/proyek", label: "Proyek & Konstruksi", icon: HardHat },

  { group: "TIM & MARKETING" },
  { to: "/dashboard/timsales", label: "Tim Sales", icon: UsersRound },
  { to: "/dashboard/promo", label: "Promo", icon: Tags },

  { group: "LEGAL" },
  { to: "/dashboard/legal", label: "Legal & Dokumen", icon: Scale },

  { group: "KEUANGAN" },
  { to: "/dashboard/keuangan", label: "Kas & Keuangan", icon: Wallet },
  { to: "/dashboard/akuntansi", label: "Keuangan Pro", icon: BookOpenCheck },

  { group: "MANAJEMEN" },
  {
    to: "/dashboard/approvals",
    label: "Approval",
    icon: ShieldCheck,
    badge: "approval",
  },
  { to: "/dashboard/laporan", label: "Laporan", icon: BarChart3 },
  { to: "/dashboard/portal", label: "Portal Customer", icon: Monitor },
];

const roleAccess = {
  "/dashboard/keuangan": ["admin", "keuangan", "direktur"],
  "/dashboard/akuntansi": ["admin", "keuangan", "direktur"],
  "/dashboard/approvals": ["admin", "direktur", "marketing", "keuangan"],
  "/dashboard/laporan": ["admin", "direktur", "keuangan"],
  "/dashboard/timsales": ["admin", "direktur"],
  "/dashboard/portal": ["admin", "direktur"],
  "/dashboard/legal": ["admin", "direktur", "keuangan"],
};

const ROLE_COLOR = {
  admin: "text-[var(--accent)]",
  marketing: "text-[var(--accent)]",
  keuangan: "text-blue-500",
  direktur: "text-violet-500",
  customer: "text-teal-500",
};

export default function Navbar({ onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { viewMode } = useView();
  const navigate = useNavigate();
  const [badges, setBadges] = useState({ reminder: 0, approval: 0 });

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      api.get("/reminders/badge"),
      api.get("/approvals/badge"),
    ]).then(([r, a]) => {
      if (ignore) return;
      setBadges({
        reminder: r.status === "fulfilled" ? r.value.data.jumlah : 0,
        approval: a.status === "fulfilled" ? a.value.data.jumlah : 0,
      });
    });
    return () => {
      ignore = true;
    };
  }, []);

  const initials = user?.nama
    ? user.nama
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const allowedMenus = menus.filter((item) => {
    if (item.group) return true;
    const allowed = roleAccess[item.to];
    return !allowed || allowed.includes(user?.role);
  });

  function handleNavClick() {
    if (onClose) onClose();
  }

  function handleLogout() {
    logout();
    navigate("/login");
    if (onClose) onClose();
  }

  const isDesktopWorkspace = viewMode === 'desktop';

  return (
    <aside className="relative flex h-screen w-full max-w-[280px] shrink-0 flex-col overflow-hidden rounded-r-[40px] border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl transition-all duration-300">
      {/* ── AMBIENT GLOW ── */}
      <div className="glow-orb -left-32 -top-32 h-80 w-80 opacity-40 bg-[radial-gradient(circle,var(--accent-glow),transparent_70%)]" />
      <div className="glow-orb -right-32 bottom-20 h-64 w-64 opacity-20 bg-[radial-gradient(circle,var(--accent-2-soft),transparent_70%)]" />

      {/* ── DESKTOP BRANDING (Only if Desktop Workspace) ── */}
      {isDesktopWorkspace && (
        <div className="relative z-10 hidden lg:flex items-center justify-between px-8 py-10">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative h-12 w-12 shrink-0 rounded-[18px] bg-white shadow-xl shadow-[var(--accent-glow)] overflow-hidden p-2 border border-[var(--border)] group-hover:scale-105 transition-transform duration-500">
              <img src="/assets/logo.svg" alt="Logo" className="h-full w-full object-contain" />
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black tracking-tight leading-none text-[var(--text)]">
                Prop<span className="text-[var(--accent)]">Suite</span>
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] opacity-60">Control Center</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-all"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
        </div>
      )}

      {/* ── MOBILE/DRAWER BRANDING (If Mobile/Tablet Workspace OR Screen Small) ── */}
      {(!isDesktopWorkspace || window.innerWidth < 1024) && (
        <div className="relative z-10 flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-white shadow-lg overflow-hidden p-1.5 border border-[var(--border)]">
               <img src="/assets/logo.svg" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[var(--text)]">
              Prop<span className="text-[var(--accent)]">Suite</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="h-11 w-11 flex items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--muted)]">
              {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>
            <button onClick={onClose} className="h-11 w-11 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 transition-all">
              <X className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* ── USER PROFILE CARD ── */}
      <div className="relative z-10 mx-5 mb-8 overflow-hidden rounded-[32px] border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-soft)] p-5 shadow-[var(--shadow-card)]">
        <div className="absolute right-[-20px] top-[-20px] h-24 w-24 rounded-full bg-[var(--accent-glow)] opacity-50 blur-xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] flex items-center justify-center text-sm font-black text-white shadow-xl shadow-[var(--accent-glow)] border-2 border-white/20">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-black text-[var(--text)] leading-tight">{user?.nama}</div>
            <div className={`mt-1 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md inline-block bg-[var(--surface)] border border-[var(--border)] ${ROLE_COLOR[user?.role] || 'text-[var(--accent)]'}`}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="app-scrollbar relative z-10 flex-1 space-y-1.5 overflow-y-auto px-4 pb-8">
        {allowedMenus.map((item, index) => {
          if (item.group) {
            return (
              <div
                key={`group-${index}`}
                className="flex items-center gap-2 px-3 pb-3 pt-8 text-[9px] font-black uppercase tracking-[0.25em] text-[var(--muted)] opacity-50 first:pt-2"
              >
                <div className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                {item.group}
              </div>
            );
          }

          const Icon = item.icon;
          const badgeCount = item.badge ? badges[item.badge] : 0;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/" || item.to === "/dashboard"}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-item group flex items-center gap-4 px-4 py-4.5 text-[13.5px] font-bold transition-all rounded-[22px] ${
                  isActive
                    ? "active bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)] hover:bg-[var(--accent-deep)]"
                    : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isActive ? "bg-white/20 text-white" : "bg-[var(--surface-soft)] text-[var(--muted)] group-hover:bg-white group-hover:text-[var(--accent)] group-hover:shadow-sm"
                  }`}>
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2.2} />
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-lg bg-rose-500 px-1.5 text-[9px] font-black text-white shadow-md">
                      {badgeCount}
                    </span>
                  )}
                  {!isActive && <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── LOGOUT ── */}
      <div className="relative z-10 p-5 border-t border-[var(--border)]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-[13.5px] font-black uppercase tracking-widest text-[var(--muted)] transition-all hover:bg-rose-500/10 hover:text-rose-500"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
