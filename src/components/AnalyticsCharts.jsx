import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { buildLeadsChartData, fmtRp, fmtRpShort } from "../utils/chartUtils";

const CHART_COLORS = {
  primary: "#6366F1",
  secondary: "#8B5CF6",
  success: "#10B981",
  warning: "#F59E0B",
  border: "#E5E7EB",
  muted: "#94A3B8",
};

const SalesTooltip = ({ active, payload, label, color }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-xl">
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="text-sm font-black text-slate-950" style={{ color }}>
        {fmtRp(payload[0]?.value || 0)}
      </p>
    </div>
  );
};

const LeadsTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[148px] rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-xl">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.fill }} />
            <span>{p.name || p.dataKey}</span>
          </span>
          <span className="font-black text-slate-950">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function SalesChart({ data = [], mode = "masuk", isCompact }) {
  if (!data || data.length === 0) {
    return <ChartEmpty text="Belum ada data." />;
  }

  const key = mode === "masuk" ? "masuk" : "laba";
  const color = mode === "masuk" ? CHART_COLORS.primary : CHART_COLORS.success;

  return (
    <div className={`${isCompact ? "h-[230px]" : "h-[280px]"} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.22} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={CHART_COLORS.border} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fontWeight: 700, fill: CHART_COLORS.muted }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => fmtRpShort(v)}
            tick={{ fontSize: 10, fontWeight: 700, fill: CHART_COLORS.muted }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<SalesTooltip color={color} />} cursor={{ stroke: color, strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={3}
            fill="url(#gradSales)"
            dot={{ fill: color, strokeWidth: 0, r: 2.5 }}
            activeDot={{ r: 5, fill: color, strokeWidth: 3, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadsChart({ leads = [], isCompact }) {
  const data = buildLeadsChartData(leads);
  if (!data.length) return <ChartEmpty text="Belum ada data." />;

  return (
    <div className={`${isCompact ? "h-[230px]" : "h-[280px]"} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }} barSize={isCompact ? 11 : 18} barGap={4}>
          <CartesianGrid strokeDasharray="4 4" stroke={CHART_COLORS.border} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<LeadsTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
          <Bar dataKey="total" name="Total" fill="rgba(99,102,241,0.18)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="aktif" name="Aktif" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} />
          <Bar dataKey="closing" name="Closing" fill={CHART_COLORS.success} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UnitPieChart({ distribution = [], total = 0, isCompact }) {
  const data = distribution.filter((d) => d.value > 0);
  if (data.length === 0) return <ChartEmpty text="Belum ada data." />;

  return (
    <div className={`flex flex-col items-center ${isCompact ? "gap-4" : "gap-5"}`}>
      <div className={`relative ${isCompact ? "h-[170px]" : "h-[210px]"} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isCompact ? 46 : 62}
              outerRadius={isCompact ? 74 : 92}
              dataKey="value"
              strokeWidth={5}
              stroke="#FFFFFF"
              isAnimationActive
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                boxShadow: "0 18px 45px rgba(15,23,42,0.12)",
                fontSize: 11,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${isCompact ? "text-2xl" : "text-3xl"} font-black tracking-normal text-slate-950`}>{total}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Total unit</span>
        </div>
      </div>

      <div className={`grid w-full gap-2 ${isCompact ? "grid-cols-1" : "grid-cols-1"}`}>
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
              <span className="truncate text-xs font-bold text-slate-600">{item.label}</span>
            </div>
            <span className="text-xs font-black text-slate-950">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartPanel({ chartData = [], leads = [], canReadFinance = false, isCompact }) {
  const [tab, setTab] = useState(canReadFinance ? "keuangan" : "leads");
  const [mode, setMode] = useState("masuk");
  const activeTab = canReadFinance ? tab : "leads";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-slate-50 p-1">
          {canReadFinance && (
            <TabBtn active={activeTab === "keuangan"} onClick={() => setTab("keuangan")}>
              Keuangan
            </TabBtn>
          )}
          <TabBtn active={activeTab === "leads"} onClick={() => setTab("leads")}>
            Leads & Pipeline
          </TabBtn>
        </div>

        {activeTab === "keuangan" && (
          <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-white p-1">
            <TabBtn active={mode === "masuk"} onClick={() => setMode("masuk")}>
              Income
            </TabBtn>
            <TabBtn active={mode === "laba"} onClick={() => setMode("laba")}>
              Profit
            </TabBtn>
          </div>
        )}
      </div>

      {activeTab === "keuangan" ? (
        <SalesChart data={chartData} mode={mode} isCompact={isCompact} />
      ) : (
        <LeadsChart leads={leads} isCompact={isCompact} />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 min-h-0 rounded-xl px-3 text-[11px] font-black transition ${
        active ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function ChartEmpty({ text }) {
  return (
    <div className="grid h-[220px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
      <p className="text-xs font-bold text-slate-400">{text}</p>
    </div>
  );
}
