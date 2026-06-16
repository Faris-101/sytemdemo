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

// ─────────────────────────────────────────
// Tooltip components (Defined outside of render for performance)
// ─────────────────────────────────────────

const SalesTooltip = ({ active, payload, label, color }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 shadow-[var(--shadow-card)]">
      <p className="mb-1 text-xs font-bold text-[var(--muted)]">{label}</p>
      <p className="text-sm font-extrabold" style={{ color }}>
        {fmtRp(payload[0]?.value || 0)}
      </p>
    </div>
  );
};

const LeadsTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 shadow-[var(--shadow-card)] min-w-[140px]">
      <p className="mb-2 text-xs font-bold text-[var(--muted)]">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-[var(--muted)]">
              {p.dataKey === 'total' ? 'Total' : p.dataKey === 'closing' ? 'Closing' : 'Aktif'}
            </span>
          </span>
          <span className="font-bold text-[var(--text)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// SalesChart — grafik area pemasukan/laba
// (hanya muncul untuk role finance)
// ─────────────────────────────────────────

export function SalesChart({ data = [], mode = 'masuk' }) {
  if (!data || data.length === 0) {
    return <ChartEmpty text="Belum ada data transaksi keuangan." />;
  }

  const key = mode === 'masuk' ? 'masuk' : 'laba';
  const color = mode === 'masuk' ? 'var(--success)' : 'var(--accent)';

  return (
    <div className="h-[268px] min-h-[268px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-soft)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => fmtRpShort(v)}
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            content={<SalesTooltip color={color} />}
            cursor={{ stroke: color, strokeWidth: 1.5, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2.5}
            fill="url(#gradSales)"
            dot={{ fill: color, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────
// LeadsChart — grafik bar leads per bulan
// (tersedia untuk semua role)
// ─────────────────────────────────────────

export function LeadsChart({ leads = [] }) {
  const data = buildLeadsChartData(leads);
  const total = data.reduce((s, d) => s + d.total, 0);

  if (total === 0) {
    return <ChartEmpty text="Belum ada data leads dalam 6 bulan terakhir." />;
  }

  return (
    <div className="h-[268px] min-h-[268px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
          barSize={18}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-soft)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<LeadsTooltip />} cursor={{ fill: 'var(--surface-soft)' }} />
          <Bar dataKey="total" fill="var(--accent-soft)" radius={[4, 4, 0, 0]} name="Total" />
          <Bar dataKey="aktif" fill="var(--success-soft)" radius={[4, 4, 0, 0]} name="Aktif" />
          <Bar dataKey="closing" fill="var(--success)" radius={[4, 4, 0, 0]} name="Closing" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────
// UnitPieChart — donut distribusi status unit
// ─────────────────────────────────────────

export function UnitPieChart({ distribution = [], total = 0 }) {
  const data = distribution.filter((d) => d.value > 0);
  const totalValue = total || data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return <ChartEmpty text="Belum ada data unit." />;
  }

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="var(--white)"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={800}
        letterSpacing="-0.02em"
        opacity={0.95}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-[220px] w-full animate-in fade-in zoom-in duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((entry, idx) => (
                <linearGradient
                  key={`grad-${idx}`}
                  id={`grad-${entry.label}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={UNIT_COLORS[entry.label] || 'var(--accent-deep)'}
                    stopOpacity={1}
                  />
                  <stop
                    offset="70%"
                    stopColor={UNIT_COLORS[entry.label] || 'var(--accent-deep)'}
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor={UNIT_COLORS[entry.label] || 'var(--accent-deep)'}
                    stopOpacity={0.75}
                  />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={94}
              dataKey="value"
              labelLine={false}
              label={renderLabel}
              strokeWidth={4}
              stroke="var(--surface)"
              filter="drop-shadow(0 6px 18px rgba(0,0,0,0.16))"
              isAnimationActive
              animationBegin={0}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {data.map((entry, idx) => (
                <Cell
                  key={entry.label}
                  fill={`url(#grad-${entry.label})`}
                  style={{
                    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.08))',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [v, '']}
              contentStyle={{
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                backdropFilter: 'blur(14px)',
                boxShadow: 'var(--shadow-card)',
                padding: '12px 16px',
                color: 'var(--text)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-3xl font-bold text-[var(--text)]">{totalValue}</span>
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Total Unit</span>
        </div>
      </div>

      {/* Legend manual - improved */}
      <div className="w-full space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        {data.map((item) => {
          const pct = total ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div
              key={item.label}
              className="group cursor-pointer rounded-lg px-4 py-3 transition-all duration-300 hover:scale-[1.02] hover:bg-[var(--accent-soft)] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full ring-2 ring-offset-2 transition-all duration-300 group-hover:ring-[3px] group-hover:ring-offset-3"
                    style={{
                      background: UNIT_COLORS[item.label] || 'var(--accent-deep)',
                      ringColor: UNIT_COLORS[item.label] || 'var(--accent-deep)',
                      boxShadow: `0 4px 8px ${UNIT_COLORS[item.label] || 'var(--accent-deep)'}40`,
                    }}
                  />
                  <span className="text-sm font-semibold text-[var(--text)] transition-all duration-300 group-hover:text-[var(--accent)]">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-[var(--accent)] transition-colors duration-300 group-hover:text-[var(--accent-deep)]">
                    {item.value}
                  </span>
                  <span className="text-xs font-medium text-[var(--muted)] transition-colors duration-300 group-hover:text-[var(--text)]">
                    {pct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ChartPanel — wrapper dengan toggle tab
// Menyatukan SalesChart + LeadsChart dalam satu panel
// ─────────────────────────────────────────

export function ChartPanel({ chartData = [], leads = [], canReadFinance = false }) {
  const [tab, setTab] = useState(canReadFinance ? 'keuangan' : 'leads');
  const [mode, setMode] = useState('masuk');

  // Pastikan tab default valid
  const activeTab = canReadFinance ? tab : 'leads';

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-0.5">
          {canReadFinance && (
            <TabBtn active={activeTab === 'keuangan'} onClick={() => setTab('keuangan')}>
              Keuangan
            </TabBtn>
          )}
          <TabBtn active={activeTab === 'leads'} onClick={() => setTab('leads')}>
            Leads & Pipeline
          </TabBtn>
        </div>

        {/* Toggle mode hanya muncul saat tab keuangan aktif */}
        {activeTab === 'keuangan' && (
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
            {['masuk', 'laba'].map((m) => (
              <TabBtn key={m} active={mode === m} onClick={() => setMode(m)}>
                {m === 'masuk' ? 'Pemasukan' : 'Laba'}
              </TabBtn>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      {activeTab === 'keuangan' ? (
        <SalesChart data={chartData} mode={mode} />
      ) : (
        <LeadsChart leads={leads} />
      )}

      {/* Legend bar chart (hanya untuk tab leads) */}
      {activeTab === 'leads' && (
        <div className="mt-3 flex items-center gap-5 text-xs text-[var(--muted)]">
          <LegendDot color="#bfdbfe" label="Total leads" />
          <LegendDot color="#6ee7b7" label="Aktif" />
          <LegendDot color="#16a34a" label="Closing" />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Sub-components kecil
// ─────────────────────────────────────────

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
          : 'text-[var(--muted)] hover:text-[var(--text)]'
      }`}
    >
      {children}
    </button>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function ChartEmpty({ text }) {
  return (
    <div className="grid h-[268px] place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
      <p className="text-sm font-medium italic text-slate-400">{text}</p>
    </div>
  );
}
