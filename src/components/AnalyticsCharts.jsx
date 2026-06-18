import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useState } from 'react';
import { fmtRp, fmtRpShort, UNIT_COLORS, buildLeadsChartData } from '../utils/chartUtils';

const SalesTooltip = ({ active, payload, label, color }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1c1730] px-3 py-2.5 shadow-2xl">
      <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-white/40">{label}</p>
      <p className="text-sm font-black" style={{ color }}>
        {fmtRp(payload[0]?.value || 0)}
      </p>
    </div>
  );
};

const LeadsTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1c1730] px-3 py-2.5 shadow-2xl min-w-[140px]">
      <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-white/40">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-white/80">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.fill }} />
            <span>{p.dataKey}</span>
          </span>
          <span className="font-black text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function SalesChart({ data = [], mode = 'masuk', isCompact }) {
  if (!data || data.length === 0) {
    return <ChartEmpty text="No data." />;
  }

  const key = mode === 'masuk' ? 'masuk' : 'laba';
  const color = mode === 'masuk' ? '#fbbf24' : '#6d5bfa';

  return (
    <div className={`${isCompact ? "h-[220px]" : "h-[280px]"} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fontWeight: 700, fill: 'white', opacity: 0.3 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => fmtRpShort(v)}
            tick={{ fontSize: 10, fontWeight: 700, fill: 'white', opacity: 0.3 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<SalesTooltip color={color} />} cursor={{ stroke: color, strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={3}
            fill="url(#gradSales)"
            dot={{ fill: color, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadsChart({ leads = [], isCompact }) {
  const data = buildLeadsChartData(leads);
  if (!data.length) return <ChartEmpty text="No data." />;

  return (
    <div className={`${isCompact ? "h-[220px]" : "h-[280px]"} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={isCompact ? 12 : 20} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: 'white', opacity: 0.3 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: 'white', opacity: 0.3 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<LeadsTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="total" fill="rgba(251,191,36,0.2)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="aktif" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          <Bar dataKey="closing" fill="#6d5bfa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UnitPieChart({ distribution = [], total = 0, isCompact }) {
  const data = distribution.filter((d) => d.value > 0);
  if (data.length === 0) return <ChartEmpty text="No data." />;

  return (
    <div className={`flex flex-col items-center ${isCompact ? "gap-4" : "gap-8"}`}>
      <div className={`relative ${isCompact ? "h-[160px]" : "h-[220px]"} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isCompact ? 45 : 65}
              outerRadius={isCompact ? 70 : 95}
              dataKey="value"
              strokeWidth={3}
              stroke="#1c1730"
              isAnimationActive
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1c1730', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
              itemStyle={{ color: 'white' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`${isCompact ? "text-2xl" : "text-4xl"} font-black text-white`}>{total}</span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Total Units</span>
        </div>
      </div>

      <div className={`w-full grid ${isCompact ? "grid-cols-2 gap-2" : "grid-cols-1 gap-3"}`}>
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
               <span className="text-[10px] font-bold text-white/60">{item.label}</span>
            </div>
            <span className="text-xs font-black text-[var(--accent)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartPanel({ chartData = [], leads = [], canReadFinance = false, isCompact }) {
  const [tab, setTab] = useState(canReadFinance ? 'keuangan' : 'leads');
  const [mode, setMode] = useState('masuk');
  const activeTab = canReadFinance ? tab : 'leads';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
          {canReadFinance && (
            <TabBtn active={activeTab === 'keuangan'} onClick={() => setTab('keuangan')}>Finance</TabBtn>
          )}
          <TabBtn active={activeTab === 'leads'} onClick={() => setTab('leads')}>Pipeline</TabBtn>
        </div>
        {activeTab === 'keuangan' && (
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
            <TabBtn active={mode === 'masuk'} onClick={() => setMode('masuk')}>Income</TabBtn>
            <TabBtn active={mode === 'laba'} onClick={() => setMode('laba')}>Profit</TabBtn>
          </div>
        )}
      </div>

      {activeTab === 'keuangan' ? (
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
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-[var(--accent)] text-black shadow-lg' : 'text-white/40 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function ChartEmpty({ text }) {
  return (
    <div className="grid h-[200px] place-items-center rounded-xl border border-dashed border-white/10 bg-white/5">
      <p className="text-xs font-bold uppercase tracking-widest text-white/20 italic">{text}</p>
    </div>
  );
}
