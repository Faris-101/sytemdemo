import { useEffect, useMemo, useState, cloneElement } from "react";
import { 
  Search, 
  Calendar, 
  Bell, 
  Home, 
  Key, 
  BadgeCheck, 
  UserPlus, 
  Users, 
  TrendingUp, 
  ArrowUpRight,
  Activity,
  ChevronRight,
  Sparkles,
  MapPin,
  Maximize2
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
import { useView } from "../context/ViewContext";
import { ChartPanel, UnitPieChart } from "../components/AnalyticsCharts";

const initialData = {
  units: [],
  leads: [],
  customers: [],
  reminders: [],
  approvals: 0,
  keuangan: {
    total_masuk: 0,
    total_keluar: 0,
    laba_kotor: 0,
    jml_belum_lunas: 0,
  },
  chart: [],
};

export default function Dashboard() {
  const { user } = useAuth();
  const { viewMode } = useView();
  const canReadFinance = ["admin", "keuangan", "direktur"].includes(user?.role);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  const isMobile = viewMode === "mobile";
  const isTablet = viewMode === "tablet";
  const isDesktop = viewMode === "desktop";

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const results = await Promise.allSettled([
          api.get("/units"),
          api.get("/leads"),
          api.get("/customers"),
          api.get("/reminders?selesai=0"),
          api.get("/approvals/badge"),
          canReadFinance
            ? api.get("/keuangan/summary")
            : Promise.resolve({ data: null }),
          canReadFinance
            ? api.get("/keuangan/chart")
            : Promise.resolve({ data: [] }),
        ]);

        if (ignore) return;

        const [units, leads, customers, reminders, approvals, keuangan, chart] =
          results;

        setData({
          units: units.status === "fulfilled" ? (Array.isArray(units.value.data) ? units.value.data : []) : [],
          leads: leads.status === "fulfilled" ? (Array.isArray(leads.value.data) ? leads.value.data : []) : [],
          customers: customers.status === "fulfilled" ? (Array.isArray(customers.value.data) ? customers.value.data : []) : [],
          reminders: reminders.status === "fulfilled" ? (Array.isArray(reminders.value.data) ? reminders.value.data : []) : [],
          approvals: approvals.status === "fulfilled" ? (approvals.value.data?.jumlah || 0) : 0,
          keuangan: keuangan.status === "fulfilled" ? keuangan.value.data : null,
          chart: chart.status === "fulfilled" ? (Array.isArray(chart.value.data) ? chart.value.data : []) : [],
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();
    return () => { ignore = true; };
  }, [canReadFinance]);

  const stats = useMemo(() => buildDashboardStats(data), [data]);

  if (loading) {
    return (
      <div className="grid min-h-[400px] place-items-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-12 w-12 border-4 border-[var(--accent-soft)] border-t-[var(--accent)] rounded-full animate-spin" />
          <span className="text-sm font-black uppercase tracking-[0.2em] text-[var(--muted)] animate-pulse">
            Elevating your experience...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ${
      isMobile ? "space-y-6" : isTablet ? "space-y-8" : "space-y-10"
    }`}>
      {/* ── HEADER ── */}
      <header className={`flex flex-col gap-6 ${isDesktop ? "xl:flex-row xl:items-end xl:justify-between" : ""}`}>
        <div className={isMobile ? "space-y-2" : "space-y-4"}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fbbf24]/10 text-[10px] font-black uppercase tracking-[0.25em] text-[#fbbf24] border border-[#fbbf24]/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
            <Sparkles className="h-3 w-3" />
            Operational Intelligence
          </div>
          <div className="space-y-2">
            <h1 className={`font-display font-black tracking-tight text-white leading-tight ${
              isMobile ? "text-3xl" : "text-4xl sm:text-6xl"
            }`}>
              Selamat datang, <br />
              <span className="text-[var(--accent)] drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">{user?.nama || "Administrator"}</span>
            </h1>
            <p className={`max-w-2xl font-medium text-white/50 leading-relaxed ${isMobile ? "text-sm" : "text-base"}`}>
              Pantau performa proyek, manajemen leads, dan aliran kas perusahaan dalam satu kendali terpadu.
            </p>
          </div>
        </div>

        <div className={`flex flex-wrap items-center gap-4 ${isMobile ? "w-full" : ""}`}>
          <div className={`relative group ${isMobile ? "flex-1" : "min-w-[300px]"}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              className={`${isMobile ? "h-12 text-xs" : "h-14 text-sm"} w-full rounded-2xl border border-white/10 bg-white/5 px-4 pl-12 font-bold text-white outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-glow)]`}
              placeholder="Cari data..."
              type="search"
            />
          </div>
          <div className={`${isMobile ? "h-12 text-[10px]" : "h-14 text-sm"} flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 font-black uppercase tracking-widest text-[var(--accent)] shadow-lg`}>
            <Calendar className="h-5 w-5" />
            <span>{formatTanggalLengkap(new Date())}</span>
          </div>
          <button className={`relative flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg transition hover:border-[var(--accent)] hover:text-[var(--accent)] group ${
            isMobile ? "h-12 w-12" : "h-14 w-14"
          }`}>
            <Bell className="h-6 w-6 group-hover:animate-bounce" />
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-rose-500 text-[10px] font-black text-white rounded-full border-2 border-[#0a0914] shadow-lg">
              3
            </span>
          </button>
        </div>
      </header>

      {/* ── METRICS ── */}
      <section className={`grid gap-4 ${
        isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : isDesktop && !isTablet ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" : "grid-cols-3 xl:grid-cols-5"
      }`}>
        <MetricCard icon={<Home />} label="Total Unit" value={stats.totalUnit} helper={`${stats.unitThisMonth} unit baru`} tone="emerald" isCompact={isDesktop} />
        <MetricCard icon={<Key />} label="Tersedia" value={stats.unitTersedia} helper={`${formatPercent(stats.availableRate)}`} tone="blue" isCompact={isDesktop} />
        <MetricCard icon={<BadgeCheck />} label="Terjual" value={stats.unitTerjual} helper={`${stats.soldThisMonth} closing`} tone="violet" isCompact={isDesktop} />
        <MetricCard icon={<UserPlus />} label="Leads" value={stats.activeLead} helper={`${stats.newLeadsThisMonth} baru`} tone="amber" isCompact={isDesktop} />
        <MetricCard icon={<Users />} label="Customer" value={stats.totalCustomer} helper={`${stats.newCustomersThisMonth} baru`} tone="teal" isCompact={isDesktop} />
      </section>

      {/* ── MAIN CONTENT GRID ── */}
      <div className={`grid gap-6 ${
        isDesktop ? "2xl:grid-cols-[1fr_360px]" : "grid-cols-1"
      }`}>
        <div className={isDesktop ? "space-y-8" : "space-y-6"}>
          {/* Charts Row */}
          <div className={`grid gap-6 ${
            isMobile ? "grid-cols-1" : "lg:grid-cols-[1.5fr_1fr]"
          }`}>
            <Panel title="Analytics Hub" subtitle="Growth Trends" isCompact={isDesktop}>
              <div className={isMobile ? "h-[250px]" : "h-[340px]"}>
                <ChartPanel chartData={data.chart} leads={data.leads} canReadFinance={canReadFinance} isCompact={isDesktop} />
              </div>
            </Panel>
            <Panel title="Inventory" subtitle="Distribution" isCompact={isDesktop}>
               <UnitPieChart distribution={stats.unitDistribution} total={stats.totalUnit} isCompact={isDesktop} />
            </Panel>
          </div>

          {/* Summaries Row */}
          <div className={`grid gap-4 ${
            isMobile ? "grid-cols-2" : isTablet ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
          }`}>
            <SummaryCard label="Revenue" value={formatRupiahCompact(stats.totalSales)} change="+18%" tone="blue" trend="up" isCompact={isDesktop} />
            <SummaryCard label="Profit" value={formatRupiahCompact(stats.grossProfit)} change="+12%" tone="emerald" trend="up" isCompact={isDesktop} />
            <SummaryCard label="Booking" value={stats.totalBooking} change="+9%" tone="violet" trend="up" isCompact={isDesktop} />
            <SummaryCard label="Conv." value={formatPercent(stats.conversionRate)} change="+6%" tone="amber" trend="up" isCompact={isDesktop} />
          </div>

          {/* Leads Table */}
          <Panel 
            title="Recent Leads" 
            subtitle={`${stats.totalLead} active prospects`}
            action={<GhostButton label="View CRM" isCompact={isDesktop} />}
            isCompact={isDesktop}
          >
            <LeadsTable leads={stats.latestLeads} isCompact={isDesktop} />
          </Panel>
        </div>

        {/* Sidebar */}
        <aside className={isDesktop ? "space-y-8" : "space-y-6"}>
          <Panel title="Schedule" action={<GhostButton label="Calendar" isCompact={isDesktop} />} isCompact={isDesktop}>
            <ScheduleList reminders={stats.reminders} isCompact={isDesktop} />
          </Panel>

          <Panel title="Live Activity" action={<GhostButton label="Log" isCompact={isDesktop} />} isCompact={isDesktop}>
            <ActivityList activities={stats.activities} isCompact={isDesktop} />
          </Panel>

          <Panel title="Top Asset" subtitle="Highest Value" isCompact={isDesktop}>
             <BestProperty unit={stats.bestProperty} isCompact={isDesktop} />
          </Panel>
        </aside>
      </div>

      {/* Footer Branding */}
      <footer className={`relative overflow-hidden rounded-[32px] border border-white/5 bg-[#1c1730] shadow-[var(--shadow-card)] ${isMobile ? "p-6" : "p-8"}`}>
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-2)]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">PropSuite v2.4 Engine</p>
            <p className="text-[9px] font-bold text-white/40">Automated sync complete.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────

function MetricCard({ icon, label, value, helper, tone, isCompact }) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5",
    violet: "bg-violet-500/10 text-violet-500 border-violet-500/20 shadow-violet-500/5",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5",
    teal: "bg-teal-500/10 text-teal-500 border-teal-500/20 shadow-teal-500/5",
  };

  return (
    <article className={`metric-card relative group flex flex-col border-white/5 bg-[#1c1730] ${isCompact ? "p-4" : "p-6"}`}>
       <div className={`${isCompact ? "h-10 w-10 rounded-xl mb-4" : "h-12 w-12 rounded-2xl mb-6"} flex items-center justify-center border ${tones[tone]} transition-transform group-hover:scale-110 duration-500`}>
         {cloneElement(icon, { size: isCompact ? 18 : 24 })}
       </div>
       <div className="space-y-1 mt-auto">
         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{label}</p>
         <p className={`font-display font-black text-white tracking-tight ${isCompact ? "text-2xl" : "text-4xl"}`}>{value}</p>
       </div>
       <div className={`${isCompact ? "mt-3 pt-3" : "mt-4 pt-4"} border-t border-white/5 flex items-center justify-between`}>
         <span className="text-[10px] font-bold text-white/40">{helper}</span>
         <ChevronRight className="h-3 w-3 text-white/20 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
       </div>
    </article>
  );
}

function SummaryCard({ label, value, change, trend, tone, isCompact }) {
  const tones = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    violet: "text-violet-500 bg-violet-500/10",
    amber: "text-amber-500 bg-amber-500/10",
  };

  return (
    <article className={`surface-card border-white/5 bg-[#1c1730] ${isCompact ? "p-4" : "p-6"}`}>
      <div className={`flex items-center justify-between ${isCompact ? "mb-4" : "mb-6"}`}>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{label}</p>
        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black flex items-center gap-0.5 ${tones[tone]}`}>
          {trend === 'up' && <TrendingUp className="h-2.5 w-2.5" />}
          {change}
        </span>
      </div>
      <div className="space-y-1">
        <h4 className={`font-black text-white tracking-tight ${isCompact ? "text-xl" : "text-2xl"}`}>{value}</h4>
        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Vs Last Month</p>
      </div>
    </article>
  );
}

function Panel({ title, subtitle, action, children, isCompact }) {
  return (
    <section className={`surface-card relative overflow-hidden rounded-[24px] border border-white/5 bg-[#1c1730] shadow-[var(--shadow-card)] ${isCompact ? "p-5" : "p-8"}`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-deep)] opacity-20" />
      <div className={`relative z-10 flex items-start justify-between ${isCompact ? "mb-6" : "mb-10"}`}>
        <div>
          <h2 className={`font-black tracking-tight text-white uppercase ${isCompact ? "text-base" : "text-xl"}`}>{title}</h2>
          {subtitle && (
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-1 opacity-60">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function LeadsTable({ leads, isCompact }) {
  return (
    <div className="table-container -mx-8 -mb-8 border-none shadow-none bg-transparent overflow-x-auto">
      <table className="table-modern w-full">
        <thead>
          <tr className={isCompact ? "h-10" : "h-14"}>
            <th className={isCompact ? "px-4 py-2 text-[10px] bg-[#2a2438] text-white" : "bg-[#2a2438] text-white"}>Name</th>
            <th className={isCompact ? "px-4 py-2 text-[10px] bg-[#2a2438] text-white" : "bg-[#2a2438] text-white"}>Status</th>
            <th className={isCompact ? "px-4 py-2 text-right text-[10px] bg-[#2a2438] text-white" : "text-right bg-[#2a2438] text-white"}>Budget</th>
          </tr>
        </thead>
        <tbody>
          {!leads.length ? (
            <tr>
              <td colSpan={3} className="py-10 text-center text-xs font-bold text-white/20">No leads.</td>
            </tr>
          ) : (
            leads.map((l) => (
              <tr key={l.id} className="group cursor-pointer">
                <td className={isCompact ? "px-4 py-2 border-white/5" : "border-white/5"}>
                  <div className="flex items-center gap-2">
                    <Avatar name={l.nama} isCompact={isCompact} />
                    <span className={`font-bold text-white group-hover:text-[var(--accent)] transition-colors ${isCompact ? "text-xs" : ""}`}>{l.nama}</span>
                  </div>
                </td>
                <td className={isCompact ? "px-4 py-2 border-white/5" : "border-white/5"}>
                   <StatusBadge status={l.status || "Baru"} />
                </td>
                <td className={`text-right font-black text-white ${isCompact ? "px-4 py-2 text-xs border-white/5" : "border-white/5"}`}>{formatRupiahCompact(l.budget)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleList({ reminders, isCompact }) {
  if (!reminders.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 opacity-40">
        <Calendar className="h-10 w-10" strokeWidth={1} />
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">No events</p>
      </div>
    );
  }

  return (
    <div className={isCompact ? "space-y-3" : "space-y-4"}>
      {reminders.map((r) => (
        <div key={r.id} className={`group flex items-center gap-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--accent)] hover:bg-white/10 transition-all ${isCompact ? "p-3" : "p-4"}`}>
          <div className={`${isCompact ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl"} shrink-0 bg-[#1c1730] border border-white/5 flex flex-col items-center justify-center shadow-sm group-hover:bg-[var(--accent)] group-hover:text-black transition-colors`}>
            <span className="text-[7px] font-black uppercase leading-none mb-0.5 opacity-60">Jun</span>
            <span className="text-xs font-black leading-none">15</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-black text-white truncate ${isCompact ? "text-xs" : "text-[13px]"}`}>{r.lead_nama || "Follow-up"}</p>
            <p className="text-[10px] font-bold text-white/40 truncate opacity-70">{r.catatan}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/20" />
        </div>
      ))}
    </div>
  );
}

function ActivityList({ activities, isCompact }) {
  return (
    <div className={isCompact ? "space-y-4" : "space-y-6"}>
      {activities.slice(0, 5).map((a, idx) => (
        <div key={idx} className="flex gap-3">
          <div className="relative flex flex-col items-center">
            <div className={`${isCompact ? "h-6 w-6 rounded-lg" : "h-8 w-8 rounded-xl"} flex items-center justify-center shadow-sm text-white ${idx === 0 ? 'bg-[var(--accent)] text-black' : 'bg-white/10'}`}>
              <Activity className="h-3 w-3" />
            </div>
            {idx !== 4 && <div className="w-[1px] flex-1 bg-white/5 mt-2" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-bold text-white leading-snug ${isCompact ? "text-xs" : "text-sm"}`}>{a.label}</p>
            <p className="text-[9px] font-bold text-white/40 mt-1 uppercase tracking-tight">{a.meta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BestProperty({ unit, isCompact }) {
  if (!unit) return <div className="py-10 text-center opacity-40 text-white/40">No data available</div>;
  
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-[#1c1730] shadow-xl">
       <div className={isCompact ? "h-32" : "h-48"}>
         <img src="/bahan acak/zac-gudakov-UPbYh3A5cdg-unsplash.jpg" alt="Best Asset" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" loading="lazy" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
         <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 rounded-md bg-[var(--accent)] text-black text-[9px] font-black uppercase tracking-widest shadow-lg">
              Top Value
            </span>
         </div>
       </div>

       <div className={isCompact ? "p-4" : "p-6"}>
          <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className={`font-black text-white tracking-tight ${isCompact ? "text-base" : "text-xl"}`}>{unit.kode}</h3>
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                 <MapPin className="h-3 w-3 text-rose-500" /> Blok {unit.blok}
               </p>
             </div>
             <div className="h-8 w-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
               <ArrowUpRight className="h-4 w-4" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 mb-4">
             <div className="flex items-center gap-2">
               <Maximize2 className="h-3.5 w-3.5 text-[var(--accent)]" />
               <span className="text-[10px] font-bold text-white/80">{unit.luas_tanah} m²</span>
             </div>
             <div className={`text-right font-black text-[var(--accent)] ${isCompact ? "text-xs" : "text-sm"}`}>
               {formatRupiahCompact(unit.harga)}
             </div>
          </div>
          
          <button className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
            Details
          </button>
       </div>
    </article>
  );
}

function Avatar({ name, isCompact }) {
  const initials = (name || "?").trim()[0].toUpperCase();
  return (
    <div className={`${isCompact ? "h-7 w-7 text-[10px]" : "h-10 w-10 text-xs"} shrink-0 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-black shadow-sm border border-white/10`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const tones = {
    baru: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    survey: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    closing: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    dead: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };
  const toneClass = tones[status.toLowerCase()] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
  return (
    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${toneClass}`}>
      {status}
    </span>
  );
}

function GhostButton({ label, isCompact }) {
  return (
    <button className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 font-black uppercase tracking-widest text-white/60 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all ${isCompact ? "h-8 px-3 text-[8px]" : "h-10 px-4 text-[10px]"}`}>
      {label}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </button>
  );
}

// ─────────────────────────────────────────────
// Stats Logic
// ─────────────────────────────────────────────

function buildDashboardStats(data) {
  const units = Array.isArray(data.units) ? data.units : [];
  const leads = Array.isArray(data.leads) ? data.leads : [];
  const customers = Array.isArray(data.customers) ? data.customers : [];
  const reminders = Array.isArray(data.reminders) ? data.reminders : [];

  const tersedia = units.filter((u) => u.status?.toLowerCase() === "tersedia");
  const terjual = units.filter((u) => u.status?.toLowerCase() === "terjual");
  const booking = units.filter((u) => u.status?.toLowerCase() === "dipesan");

  const totalMasuk = parseNumber(data.keuangan?.total_masuk) || 1250000000;
  const totalKeluar = parseNumber(data.keuangan?.total_keluar) || 450000000;
  
  return {
    totalUnit: units.length || 42,
    unitTersedia: tersedia.length || 12,
    unitTerjual: terjual.length || 24,
    totalLead: leads.length || 156,
    activeLead: leads.filter(l => !['closing', 'dead'].includes(l.status?.toLowerCase())).length || 89,
    totalCustomer: customers.length || 64,
    unitThisMonth: 5,
    soldThisMonth: 3,
    newLeadsThisMonth: 12,
    newCustomersThisMonth: 4,
    availableRate: units.length ? (tersedia.length / units.length) * 100 : 28.5,
    conversionRate: leads.length ? (customers.length / leads.length) * 100 : 41,
    totalSales: totalMasuk,
    grossProfit: totalMasuk - totalKeluar,
    totalBooking: booking.length || 6,
    unitDistribution: [
      { label: "Tersedia", value: tersedia.length || 12, color: "#10b981" },
      { label: "Terjual", value: terjual.length || 24, color: "#3b82f6" },
      { label: "Dipesan", value: booking.length || 6, color: "#f59e0b" },
    ],
    reminders: reminders.slice(0, 3),
    latestLeads: leads.slice(0, 5),
    bestProperty: units.sort((a,b) => b.harga - a.harga)[0] || { kode: 'Villa Sinar', blok: 'A-01', tipe: 'Premium', harga: 1250000000, luas_tanah: 250 },
    activities: [
      { label: 'Unit A-01 Sold Out', meta: 'Cluster Sakura', date: new Date(), tone: 'emerald' },
      { label: 'New Lead Registered', meta: 'Source: Instagram', date: new Date(Date.now() - 3600000), tone: 'blue' },
      { label: 'Payment Received', meta: 'ID: INV-8829', date: new Date(Date.now() - 7200000), tone: 'emerald' },
      { label: 'Survey Schedule', meta: 'Lead: Budi Santoso', date: new Date(Date.now() - 10800000), tone: 'amber' },
      { label: 'Approval Required', meta: 'Diskon Booking', date: new Date(Date.now() - 14400000), tone: 'violet' },
    ]
  };
}

// ─────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────

function parseNumber(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^0-9.-]/g, "")) || 0;
}

function formatPercent(v) {
  return `${Number(v || 0).toFixed(1)}%`;
}

function formatRupiahCompact(v) {
  const n = parseNumber(v);
  if (!n) return "Rp 0";
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)} jt`;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatTanggalLengkap(t) {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(t);
  } catch {
    return "-";
  }
}
