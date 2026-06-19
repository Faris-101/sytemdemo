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
  Moon,
  Scale,
  ShieldCheck,
  Sun,
  Tags,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";

const menus = [
  { group: "Overview" },
  { to: "/", label: "Lihat Website", icon: Globe },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

  { group: "Penjualan" },
  { to: "/dashboard/leads", label: "Leads", icon: Target },
  { to: "/dashboard/reminders", label: "Reminder", icon: Bell, badge: "reminder" },
  { to: "/dashboard/bookings", label: "Booking", icon: CalendarCheck },
  { to: "/dashboard/customers", label: "Customers", icon: UserRound },
  { to: "/dashboard/cicilan", label: "Cicilan", icon: CreditCard },
  { to: "/dashboard/dokumen", label: "Dokumen", icon: FileText },
  { to: "/dashboard/bast", label: "Serah Terima", icon: Handshake },
  { to: "/dashboard/after-sales", label: "After Sales", icon: Headphones },

  { group: "Properti" },
  { to: "/dashboard/units", label: "Unit / Kavling", icon: Building2 },
  { to: "/dashboard/pricelist", label: "Pricelist & KPR", icon: Landmark },
  { to: "/dashboard/progress", label: "Progress", icon: TrendingUp },
  { to: "/dashboard/proyek", label: "Proyek & Konstruksi", icon: HardHat },

  { group: "Tim & Marketing" },
  { to: "/dashboard/timsales", label: "Tim Sales", icon: UsersRound },
  { to: "/dashboard/promo", label: "Promo", icon: Tags },

  { group: "Legal" },
  { to: "/dashboard/legal", label: "Legal & Dokumen", icon: Scale },

  { group: "Keuangan" },
  { to: "/dashboard/keuangan", label: "Kas & Keuangan", icon: Wallet },
  { to: "/dashboard/akuntansi", label: "Keuangan Pro", icon: BookOpenCheck },

  { group: "Manajemen" },
  { to: "/dashboard/approvals", label: "Approval", icon: ShieldCheck, badge: "approval" },
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

export default function Navbar({ onClose, variant = "full" }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [badges, setBadges] = useState({ reminder: 0, approval: 0 });

  const isFull = variant === "full";
  const isIcon = variant === "icon";
  const isCompact = variant === "compact" || variant === "icon";

  useEffect(() => {
    let ignore = false;

    Promise.allSettled([api.get("/reminders/badge"), api.get("/approvals/badge")]).then(([r, a]) => {
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

  const initials = getInitials(user?.nama || "Administrator");

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-white text-slate-900">
      <div className={`flex items-center border-b border-slate-200 ${isFull ? "justify-between px-5 py-5" : "justify-center px-3 py-4"}`}>
        <div className={`flex min-w-0 items-center ${isFull ? "gap-3" : "justify-center"}`}>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-600/20">
            PS
          </div>
          {isFull && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black tracking-normal text-slate-950">PropSuite</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Enterprise CRM</p>
            </div>
          )}
        </div>

        {isFull && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isFull && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-xs font-black text-indigo-600 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">{user?.nama || "Administrator"}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{user?.role || "Admin"}</p>
            </div>
          </div>
        </div>
      )}

      <nav className={`app-scrollbar flex-1 overflow-y-auto ${isFull ? "space-y-1 px-3 pb-4" : "space-y-1 px-2 pb-4 pt-3"}`}>
        {allowedMenus.map((item, index) => {
          if (item.group) {
            if (isCompact) {
              return <div key={`group-${index}`} className="mx-auto my-3 h-px w-8 rounded-full bg-slate-200" />;
            }

            return (
              <div key={`group-${index}`} className="px-3 pb-1 pt-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
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
              title={isCompact ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center transition ${
                  isCompact
                    ? "mx-auto h-11 w-11 justify-center rounded-2xl"
                    : "gap-3 rounded-2xl px-3 py-3 text-sm font-semibold"
                } ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`${isCompact ? "h-5 w-5" : "h-[18px] w-[18px]"} ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
                  {!isCompact && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                  {badgeCount > 0 && (
                    <span
                      className={`grid place-items-center rounded-full text-[9px] font-black ${
                        isCompact
                          ? "absolute -right-1 -top-1 h-5 min-w-5 px-1"
                          : "h-5 min-w-5 px-1.5"
                      } ${isActive ? "bg-white text-indigo-600" : "bg-red-500 text-white"}`}
                    >
                      {badgeCount}
                    </span>
                  )}
                  {isIcon && (
                    <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-xl group-hover:block">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={`border-t border-slate-200 ${isFull ? "p-4" : "px-2 py-4"}`}>
        <div className={`flex ${isFull ? "items-center justify-between gap-2" : "flex-col items-center gap-2"}`}>
          <button
            type="button"
            onClick={toggleTheme}
            className={`${isFull ? "flex-1 px-3" : "w-11"} inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600`}
            title="Ganti tema"
          >
            {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
            {isFull && <span>{theme === "light" ? "Dark" : "Light"}</span>}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className={`${isFull ? "flex-1 px-3" : "w-11"} inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-600 hover:text-white`}
            title="Logout"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {isFull && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
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
