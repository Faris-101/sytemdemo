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
    <aside className="relative flex h-screen w-full max-w-[280px] shrink-0 flex-col overflow-hidden bg-[#1c1730] text-white shadow-2xl transition-all duration-300">
      
      {/* ── BRANDING ── */}
      <div className="relative z-10 flex items-center gap-4 px-6 py-8">
        <div className="relative h-10 w-10 shrink-0 rounded-lg bg-white p-1.5 overflow-hidden">
          <img src="/assets/logo.svg" alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <h1 className="font-display text-xl font-black tracking-tight leading-none text-white">
            Prop<span className="text-[var(--accent)]">Suite</span>
          </h1>
          <p className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Management System</p>
        </div>
      </div>

      {/* ── USER INFO (Simple for Sidebar) ── */}
      <div className="relative z-10 mx-4 mb-6 px-2">
        <div className="flex items-center gap-3 py-4 border-y border-white/5">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-[var(--accent)] flex items-center justify-center text-xs font-black text-black">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">{user?.nama}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="app-scrollbar relative z-10 flex-1 space-y-1 overflow-y-auto px-3 pb-8">
        {allowedMenus.map((item, index) => {
          if (item.group) {
            return (
              <div
                key={`group-${index}`}
                className="px-4 pb-2 pt-6 text-[9px] font-black uppercase tracking-[0.2em] text-white/30"
              >
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
                `nav-item group flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all ${
                  isActive
                    ? "active bg-[var(--accent)] text-black font-bold shadow-lg"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-black" : "text-white/40 group-hover:text-[var(--accent)]"}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-[9px] font-black shadow-md ${isActive ? "bg-black text-white" : "bg-rose-500 text-white"}`}>
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── FOOTER ACTIONS ── */}
      <div className="relative z-10 p-4 border-t border-white/5 bg-[#14121f]/50">
        <div className="flex items-center justify-between mb-4">
          <button onClick={toggleTheme} className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all">
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
          <button onClick={handleLogout} className="h-9 w-9 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

