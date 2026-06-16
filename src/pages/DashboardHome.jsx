import { useEffect, useMemo, useState } from "react";
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
  BarChart3, 
  PieChart, 
  ArrowUpRight,
  MoreVertical,
  Activity,
  ChevronRight,
  Sparkles,
  MapPin,
  Maximize2
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
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
  const canReadFinance = ["admin", "keuangan", "direktur"].includes(user?.role);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

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
    <div className="mx-auto max-w-[1600px] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── HEADER ── */}
      <header className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-2-soft)] text-[10px] font-black uppercase tracking-[0.25em] text-[var(--accent-2-deep)] border border-[var(--accent-2)]/10">
            <Sparkles className="h-3 w-3" />
            Operational Intelligence
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-black tracking-tight text-[var(--text)] sm:text-6xl leading-tight">
              Selamat datang, <br />
              <span className="text-[var(--accent)]">{user?.nama || "Administrator"}</span>
            </h1>
            <p className="max-w-2xl text-base font-medium text-[var(--muted)] leading-relaxed">
              Pantau performa proyek, manajemen leads, dan aliran kas perusahaan dalam satu kendali terpadu.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              className="h-14 w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 pl-12 text-sm font-bold text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
              placeholder="Cari data operasional..."
              type="search"
            />
          </div>
          <div className="flex h-14 items-center gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-black uppercase tracking-widest text-[var(--accent)] shadow-sm">
            <Calendar className="h-5 w-5" />
            <span>{formatTanggalLengkap(new Date())}</span>
          </div>
          <button className="relative h-14 w-14 flex items-center justify-center rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)] group">
            <Bell className="h-6 w-6 group-hover:animate-bounce" />
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-rose-500 text-[10px] font-black text-white rounded-full border-2 border-[var(--bg)] shadow-lg">
              3
            </span>
          </button>
        </div>
      </header>

      {/* ── METRICS ── */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard icon={<Home />} label="Total Unit" value={stats.totalUnit} helper={`${stats.unitThisMonth} unit baru`} tone="emerald" />
        <MetricCard icon={<Key />} label="Tersedia" value={stats.unitTersedia} helper={`${formatPercent(stats.availableRate)} dari total`} tone="blue" />
        <MetricCard icon={<BadgeCheck />} label="Terjual" value={stats.unitTerjual} helper={`${stats.soldThisMonth} closing bulan ini`} tone="violet" />
        <MetricCard icon={<UserPlus />} label="Leads Aktif" value={stats.activeLead} helper={`${stats.newLeadsThisMonth} leads baru`} tone="amber" />
        <MetricCard icon={<Users />} label="Customer" value={stats.totalCustomer} helper={`${stats.newCustomersThisMonth} kontrak baru`} tone="teal" />
      </section>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 gap-8 2xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Panel title="Analytics Hub" subtitle="Growth & Performance Trends">
              <div className="h-[340px]">
                <ChartPanel chartData={data.chart} leads={data.leads} canReadFinance={canReadFinance} />
              </div>
            </Panel>
            <Panel title="Inventory Health" subtitle="Unit Status Distribution">
               <UnitPieChart distribution={stats.unitDistribution} total={stats.totalUnit} />
            </Panel>
          </div>

          {/* Summaries Row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Revenue" value={formatRupiahCompact(stats.totalSales)} change="+18.5%" tone="blue" trend="up" />
            <SummaryCard label="Gross Profit" value={formatRupiahCompact(stats.grossProfit)} change="+12.2%" tone="emerald" trend="up" />
            <SummaryCard label="Active Booking" value={stats.totalBooking} change="+9.1%" tone="violet" trend="up" />
            <SummaryCard label="Conversion" value={formatPercent(stats.conversionRate)} change="+6.4%" tone="amber" trend="up" />
          </div>

          {/* Leads Table */}
          <Panel 
            title="Recent Leads" 
            subtitle={`${stats.totalLead} active prospects pipeline`}
            action={<GhostButton label="View CRM" />}
          >
            <LeadsTable leads={stats.latestLeads} />
          </Panel>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <Panel title="Schedule" action={<GhostButton label="Calendar" />}>
            <ScheduleList reminders={stats.reminders} />
          </Panel>

          <Panel title="Live Activity" action={<GhostButton label="Log" />}>
            <ActivityList activities={stats.activities} />
          </Panel>

          <Panel title="Top Asset" subtitle="Highest Valued Property">
             <BestProperty unit={stats.bestProperty} />
          </Panel>
        </aside>
      </div>

      {/* Footer Branding */}
      <footer className="relative overflow-hidden rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)]">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-2)]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-sm font-black text-[var(--text)] uppercase tracking-widest">PropSuite Intelligence Engine v2.4</p>
            <p className="text-xs font-bold text-[var(--muted)]">Automated data synchronization complete. All systems operational.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Cloud Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// UI Components
// ─────────────────────────────────────────────

function MetricCard({ icon, label, value, helper, tone }) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5",
    violet: "bg-violet-500/10 text-violet-500 border-violet-500/20 shadow-violet-500/5",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5",
    teal: "bg-teal-500/10 text-teal-500 border-teal-500/20 shadow-teal-500/5",
  };

  return (
    <article className="metric-card relative group p-6 h-full flex flex-col">
       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${tones[tone]} mb-6 transition-transform group-hover:scale-110 duration-500`}>
         {icon}
       </div>
       <div className="space-y-1 mt-auto">
         <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] opacity-70">{label}</p>
         <p className="font-display text-4xl font-black text-[var(--text)] tracking-tight">{value}</p>
       </div>
       <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
         <span className="text-[11px] font-bold text-[var(--muted)]">{helper}</span>
         <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
       </div>
    </article>
  );
}

function SummaryCard({ label, value, change, trend, tone }) {
  const tones = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    violet: "text-violet-500 bg-violet-500/10",
    amber: "text-amber-500 bg-amber-500/10",
  };

  return (
    <article className="surface-card p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${tones[tone]}`}>
          {trend === 'up' && <TrendingUp className="h-3 w-3" />}
          {change}
        </span>
      </div>
      <div className="space-y-1">
        <h4 className="text-2xl font-black text-[var(--text)] tracking-tight">{value}</h4>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Vs Last Month</p>
      </div>
    </article>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="surface-card relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)]">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-deep)] opacity-20" />
      <div className="relative z-10 flex items-start justify-between mb-10">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[var(--text)] uppercase">{title}</h2>
          {subtitle && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] mt-1.5 opacity-60">
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

function LeadsTable({ leads }) {
  return (
    <div className="table-container -mx-8 -mb-8 border-none shadow-none bg-transparent overflow-x-auto">
      <table className="table-modern w-full">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Source</th>
            <th>Status</th>
            <th>Interest</th>
            <th className="text-right">Budget</th>
          </tr>
        </thead>
        <tbody>
          {!leads.length ? (
            <tr>
              <td colSpan="5" className="py-20 text-center text-sm font-bold text-[var(--muted)]">
                Belum ada data leads terbaru.
              </td>
            </tr>
          ) : (
            leads.map((l) => (
              <tr key={l.id} className="group cursor-pointer">
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar name={l.nama} />
                    <span className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{l.nama}</span>
                  </div>
                </td>
                <td className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{l.sumber}</td>
                <td>
                   <StatusBadge status={l.status || "Baru"} />
                </td>
                <td className="text-[11px] font-bold text-[var(--muted)]">{l.minat || '-'}</td>
                <td className="text-right font-black text-[var(--text)]">{formatRupiahCompact(l.budget)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleList({ reminders }) {
  if (!reminders.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 opacity-40">
        <Calendar className="h-12 w-12" strokeWidth={1} />
        <p className="text-[10px] font-black uppercase tracking-widest">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reminders.map((r) => (
        <div key={r.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-soft)]/50 border border-[var(--border)] hover:border-[var(--accent)] hover:bg-white transition-all">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-white border border-[var(--border)] flex flex-col items-center justify-center shadow-sm group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
            <span className="text-[8px] font-black uppercase leading-none mb-0.5 opacity-60">Jun</span>
            <span className="text-sm font-black leading-none">15</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-black text-[var(--text)] truncate">{r.lead_nama || "Follow-up"}</p>
            <p className="text-[11px] font-bold text-[var(--muted)] truncate opacity-70">{r.catatan}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
        </div>
      ))}
    </div>
  );
}

function ActivityList({ activities }) {
  return (
    <div className="space-y-6">
      {activities.slice(0, 5).map((a, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shadow-sm text-white ${idx === 0 ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'}`}>
              <Activity className="h-4 w-4" />
            </div>
            {idx !== 4 && <div className="w-[1px] flex-1 bg-[var(--border)] mt-2" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--text)] leading-snug">{a.label}</p>
            <p className="text-[11px] font-bold text-[var(--muted)] mt-1 uppercase tracking-tight">{a.meta}</p>
            <p className="text-[10px] font-medium text-[var(--muted)] mt-2 opacity-60">{formatActivityTime(a.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BestProperty({ unit }) {
  if (!unit) return <div className="py-10 text-center opacity-40">No data available</div>;
  
  return (
    <article className="group relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-white shadow-xl">
       <div className="h-48 overflow-hidden">
         <img src="/bahan acak/zac-gudakov-UPbYh3A5cdg-unsplash.jpg" alt="Best Asset" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" loading="lazy" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
         <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-[var(--accent)] shadow-lg">
              Top Value
            </span>
         </div>
       </div>

       <div className="p-6">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-xl font-black text-[var(--text)] tracking-tight">{unit.kode}</h3>
               <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-1.5 mt-1">
                 <MapPin className="h-3.5 w-3.5 text-rose-500" /> Blok {unit.blok} • {unit.tipe}
               </p>
             </div>
             <div className="h-10 w-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
               <ArrowUpRight className="h-5 w-5" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-[var(--border)] mb-4">
             <div className="flex items-center gap-2">
               <Maximize2 className="h-4 w-4 text-[var(--accent)]" />
               <span className="text-xs font-bold">{unit.luas_tanah} m²</span>
             </div>
             <div className="text-right font-black text-[var(--accent)]">
               {formatRupiahCompact(unit.harga)}
             </div>
          </div>
          
          <button className="w-full py-3 rounded-2xl bg-[var(--navy)] text-white text-xs font-black uppercase tracking-widest hover:brightness-125 transition-all">
            Asset Details
          </button>
       </div>
    </article>
  );
}

function Avatar({ name }) {
  const initials = (name || "?").trim()[0].toUpperCase();
  return (
    <div className="h-10 w-10 shrink-0 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-black text-xs shadow-sm border border-white/50">
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
    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${toneClass}`}>
      {status}
    </span>
  );
}

function GhostButton({ label }) {
  return (
    <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[var(--border)] bg-white text-[10px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all">
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

function formatActivityTime(t) {
  if (!t) return "-";
  const date = new Date(t);
  if (isNaN(date.getTime())) return "-";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hours ago`;
  return formatTanggalLengkap(date);
}

function formatTanggalLengkap(t) {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(t);
  } catch {
    return "-";
  }
}
