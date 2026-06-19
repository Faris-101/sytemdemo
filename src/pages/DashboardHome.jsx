import { useEffect, useMemo, useState, cloneElement } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Home,
  Key,
  MapPin,
  Maximize2,
  Search,
  TrendingUp,
  UserPlus,
  Users,
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
          canReadFinance ? api.get("/keuangan/summary") : Promise.resolve({ data: null }),
          canReadFinance ? api.get("/keuangan/chart") : Promise.resolve({ data: [] }),
        ]);

        if (ignore) return;

        const [units, leads, customers, reminders, approvals, keuangan, chart] = results;

        setData({
          units: units.status === "fulfilled" ? (Array.isArray(units.value.data) ? units.value.data : []) : [],
          leads: leads.status === "fulfilled" ? (Array.isArray(leads.value.data) ? leads.value.data : []) : [],
          customers: customers.status === "fulfilled" ? (Array.isArray(customers.value.data) ? customers.value.data : []) : [],
          reminders: reminders.status === "fulfilled" ? (Array.isArray(reminders.value.data) ? reminders.value.data : []) : [],
          approvals: approvals.status === "fulfilled" ? approvals.value.data?.jumlah || 0 : 0,
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
    return () => {
      ignore = true;
    };
  }, [canReadFinance]);

  const stats = useMemo(() => buildDashboardStats(data), [data]);

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Menyiapkan dashboard...
          </span>
        </div>
      </div>
    );
  }

  const statsGridClass = isMobile
    ? "grid-cols-1"
    : isTablet
      ? "grid-cols-2"
      : "grid-cols-2 lg:grid-cols-5";

  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 ${
        isMobile ? "space-y-5 pb-24" : isTablet ? "space-y-6 pb-20" : "space-y-6 pb-20"
      }`}
    >
      <header className={`grid gap-5 ${isDesktop ? "lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end" : ""}`}>
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[11px] font-bold text-indigo-600 shadow-sm">
            <Activity className="h-3.5 w-3.5" />
            Operational command center
          </div>
          <h1
            className={`max-w-3xl font-black leading-[1.03] tracking-normal text-slate-950 ${
              isMobile ? "text-[2.15rem]" : isTablet ? "text-4xl" : "text-5xl"
            }`}
          >
            Selamat datang,
            <br />
            <span className="text-indigo-600">{user?.nama || "Administrator"}</span>
          </h1>
          <p className={`mt-3 max-w-2xl font-medium leading-relaxed text-slate-500 ${isMobile ? "text-sm" : "text-base"}`}>
            Pantau performa properti, manajemen leads, dan siklus kas perusahaan dalam satu kendali terpadu.
          </p>
        </div>

        <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-[minmax(0,1fr)_auto_auto]"}`}>
          <label className="relative block min-w-0">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Cari data operasional..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-11 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black uppercase tracking-[0.12em] text-indigo-600 shadow-sm transition hover:border-indigo-200"
          >
            <Calendar className="h-4 w-4" />
            <span>{formatTanggalLengkap(new Date())}</span>
          </button>

          <button
            type="button"
            className="relative inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
            aria-label="Notifikasi dashboard"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>
        </div>
      </header>

      <section className={`grid gap-3 ${statsGridClass}`}>
        <MetricCard icon={<Home />} label="Total Unit" value={stats.totalUnit} helper={`${stats.unitThisMonth} unit baru`} tone="emerald" isCompact={isDesktop} />
        <MetricCard icon={<Key />} label="Tersewa" value={stats.totalBooking} helper={`${formatPercent(stats.bookingRate)} dari total`} tone="blue" isCompact={isDesktop} />
        <MetricCard icon={<BadgeCheck />} label="Tersedia" value={stats.unitTersedia} helper="Unit siap disewa" tone="violet" isCompact={isDesktop} />
        <MetricCard icon={<UserPlus />} label="Leads Aktif" value={stats.activeLead} helper={`${stats.newLeadsThisMonth} leads baru`} tone="amber" isCompact={isDesktop} />
        <MetricCard icon={<Users />} label="Kunjungan" value={stats.totalCustomer} helper={`${stats.newCustomersThisMonth} kunjungan hari ini`} tone="teal" isCompact={isDesktop} />
      </section>

      <div className={`grid gap-5 ${isDesktop ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "grid-cols-1"}`}>
        <div className="space-y-5">
          <div className={`grid gap-5 ${isMobile ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]"}`}>
            <Panel title="Analytics Hub" subtitle="Growth & performance trends" action={<GhostButton label="Perencanaan" />}>
              <ChartPanel chartData={data.chart} leads={data.leads} canReadFinance={canReadFinance} isCompact={isDesktop} />
            </Panel>

            <Panel title="Inventory Health" subtitle="Unit status distribution">
              <UnitPieChart distribution={stats.unitDistribution} total={stats.totalUnit} isCompact={isDesktop} />
            </Panel>
          </div>

          <div className={`grid gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
            <SummaryCard label="Revenue" value={formatRupiahCompact(stats.totalSales)} change="+18%" tone="blue" />
            <SummaryCard label="Profit" value={formatRupiahCompact(stats.grossProfit)} change="+12%" tone="emerald" />
            <SummaryCard label="Booking" value={stats.totalBooking} change="+9%" tone="violet" />
            <SummaryCard label="Conv." value={formatPercent(stats.conversionRate)} change="+6%" tone="amber" />
          </div>

          <Panel title="Recent Activities" subtitle={`${stats.totalLead} active prospects`} action={<GhostButton label="Lihat semua" />}>
            <LeadsTable leads={stats.latestLeads} isCompact={isDesktop || isMobile} />
          </Panel>
        </div>

        <aside className={`grid gap-5 ${isDesktop ? "content-start" : "md:grid-cols-2"}`}>
          <Panel title="To Do List" action={<GhostButton label="Tambah" />}>
            <ScheduleList reminders={stats.reminders} isCompact={isDesktop} />
          </Panel>

          <Panel title="Live Activity" subtitle="Operational pulse">
            <ActivityList activities={stats.activities} isCompact={isDesktop} />
          </Panel>

          <Panel title="Top Asset" subtitle="Highest value">
            <BestProperty unit={stats.bestProperty} isCompact={isDesktop} />
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, helper, tone, isCompact }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    teal: "bg-teal-50 text-teal-600 ring-teal-100",
  };

  return (
    <article className={`group rounded-[22px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-indigo-100 ${isCompact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`grid shrink-0 place-items-center rounded-full ring-1 ${tones[tone]} ${isCompact ? "h-10 w-10" : "h-12 w-12"}`}>
          {cloneElement(icon, { size: isCompact ? 18 : 21, strokeWidth: 2.2 })}
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-slate-300 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
      <div className={isCompact ? "mt-4" : "mt-5"}>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className={`mt-1 font-black tracking-normal text-slate-950 ${isCompact ? "text-2xl" : "text-3xl"}`}>{value}</p>
        <p className="mt-2 text-xs font-semibold text-slate-500">{helper}</p>
      </div>
    </article>
  );
}

function SummaryCard({ label, value, change, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <article className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${tones[tone]}`}>
          <TrendingUp className="h-3 w-3" />
          {change}
        </span>
      </div>
      <h4 className="mt-4 truncate text-xl font-black tracking-normal text-slate-950">{value}</h4>
      <p className="mt-1 text-[11px] font-semibold text-slate-400">Vs last month</p>
    </article>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-black uppercase tracking-normal text-slate-950">{title}</h2>
          {subtitle && <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function LeadsTable({ leads, isCompact }) {
  if (!leads.length) {
    return (
      <div className="grid min-h-[170px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <p className="text-xs font-bold text-slate-400">Belum ada leads terbaru.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Name</th>
            {!isCompact && <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Status</th>}
            <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Budget</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="group">
              <td className="border-t border-slate-200 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={lead.nama} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-600">{lead.nama}</p>
                    {isCompact && <StatusBadge status={lead.status || "Baru"} />}
                  </div>
                </div>
              </td>
              {!isCompact && (
                <td className="border-t border-slate-200 px-4 py-3">
                  <StatusBadge status={lead.status || "Baru"} />
                </td>
              )}
              <td className="border-t border-slate-200 px-4 py-3 text-right text-sm font-black text-slate-950">
                {formatRupiahCompact(lead.budget)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleList({ reminders, isCompact }) {
  if (!reminders.length) {
    return (
      <div className="grid min-h-[170px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center">
        <div>
          <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
          <p className="mt-3 text-xs font-bold text-slate-500">Tidak ada agenda tertunda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isCompact ? "space-y-2.5" : "space-y-3"}>
      {reminders.map((reminder) => (
        <div key={reminder.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <Clock className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-950">{reminder.lead_nama || "Follow-up"}</p>
            <p className="truncate text-xs font-medium text-slate-500">{reminder.catatan || "Agenda operasional"}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
        </div>
      ))}
    </div>
  );
}

function ActivityList({ activities, isCompact }) {
  return (
    <div className={isCompact ? "space-y-3" : "space-y-4"}>
      {activities.slice(0, 5).map((activity, index) => (
        <div key={`${activity.label}-${index}`} className="flex gap-3">
          <div className="relative flex flex-col items-center">
            <div className={`grid rounded-2xl ${index === 0 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"} ${isCompact ? "h-8 w-8" : "h-9 w-9"} place-items-center`}>
              <Activity className="h-4 w-4" />
            </div>
            {index !== 4 && <div className="mt-2 w-px flex-1 bg-slate-200" />}
          </div>
          <div className="min-w-0 flex-1 pb-2">
            <p className="text-sm font-bold leading-snug text-slate-950">{activity.label}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{activity.meta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BestProperty({ unit, isCompact }) {
  if (!unit) {
    return (
      <div className="grid min-h-[170px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
        <p className="text-xs font-bold text-slate-400">Belum ada data properti.</p>
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className={isCompact ? "h-32" : "h-40"}>
        <img
          src="/bahan acak/zac-gudakov-UPbYh3A5cdg-unsplash.jpg"
          alt="Top asset"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black tracking-normal text-slate-950">{unit.kode}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              Blok {unit.blok}
            </p>
          </div>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="my-4 grid grid-cols-2 gap-3 border-y border-slate-200 py-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Maximize2 className="h-4 w-4 text-indigo-600" />
            {unit.luas_tanah} m2
          </div>
          <div className="truncate text-right text-xs font-black text-indigo-600">
            {formatRupiahCompact(unit.harga)}
          </div>
        </div>

        <button type="button" className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-slate-950 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-indigo-600">
          Details
        </button>
      </div>
    </article>
  );
}

function Avatar({ name }) {
  const initials = (name || "?").trim()[0]?.toUpperCase() || "?";
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-xs font-black text-indigo-600">
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const tones = {
    baru: "bg-blue-50 text-blue-600",
    survey: "bg-violet-50 text-violet-600",
    closing: "bg-emerald-50 text-emerald-600",
    dead: "bg-red-50 text-red-600",
  };
  const toneClass = tones[status.toLowerCase()] || "bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${toneClass}`}>{status}</span>;
}

function GhostButton({ label }) {
  return (
    <button type="button" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-[11px] font-black text-indigo-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50">
      {label}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </button>
  );
}

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
  const totalUnit = units.length || 42;
  const totalBooking = booking.length || 6;

  return {
    totalUnit,
    unitTersedia: tersedia.length || 12,
    unitTerjual: terjual.length || 24,
    totalLead: leads.length || 156,
    activeLead: leads.filter((lead) => !["closing", "dead"].includes(lead.status?.toLowerCase())).length || 89,
    totalCustomer: customers.length || 64,
    unitThisMonth: 5,
    soldThisMonth: 3,
    newLeadsThisMonth: 12,
    newCustomersThisMonth: 4,
    availableRate: units.length ? (tersedia.length / units.length) * 100 : 28.5,
    bookingRate: totalUnit ? (totalBooking / totalUnit) * 100 : 0,
    conversionRate: leads.length ? (customers.length / leads.length) * 100 : 41,
    totalSales: totalMasuk,
    grossProfit: totalMasuk - totalKeluar,
    totalBooking,
    unitDistribution: [
      { label: "Tersewa", value: terjual.length || 24, color: "#10B981" },
      { label: "Tersedia", value: tersedia.length || 12, color: "#6366F1" },
      { label: "Booking", value: booking.length || 6, color: "#F59E0B" },
      { label: "Maintenance", value: Math.max(totalUnit - (terjual.length + tersedia.length + booking.length), 0) || 3, color: "#8B5CF6" },
    ],
    reminders: reminders.slice(0, 4),
    latestLeads: leads.slice(0, 5),
    bestProperty: [...units].sort((a, b) => parseNumber(b.harga) - parseNumber(a.harga))[0] || {
      kode: "Villa Sinar",
      blok: "A-01",
      tipe: "Premium",
      harga: 1250000000,
      luas_tanah: 250,
    },
    activities: [
      { label: "Unit A-01 sold out", meta: "Cluster Sakura" },
      { label: "New lead registered", meta: "Source: Instagram" },
      { label: "Payment received", meta: "ID: INV-8829" },
      { label: "Survey schedule", meta: "Lead: Budi Santoso" },
      { label: "Approval required", meta: "Diskon booking" },
    ],
  };
}

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
