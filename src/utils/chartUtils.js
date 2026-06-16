// Chart Utilities for PropSuite

export const MONTHS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const UNIT_COLORS = {
  Tersedia: 'var(--success)',
  Terjual: 'var(--accent)',
  Dipesan: 'var(--warning)',
  Booking: 'var(--warning)',
  Blokir: 'var(--red)',
  Inden: 'var(--orange)',
  Lainnya: 'var(--muted)',
};

export function toNum(v) {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0;
}

export function fmtRp(v) {
  const n = toNum(v);
  if (!n) return 'Rp 0';
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1).replace('.', ',')} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)} jt`;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtRpShort(v) {
  const n = toNum(v);
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}M`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}jt`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return String(n);
}

export function buildLeadsChartData(leads = []) {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const m = d.getMonth();

    const bulanLeads = leads.filter((l) => {
      if (!l.created_at) return false;
      const ld = new Date(l.created_at);
      return ld.getFullYear() === y && ld.getMonth() === m;
    });

    const statusCount = {};
    bulanLeads.forEach((l) => {
      const s = l.status || 'Baru';
      statusCount[s] = (statusCount[s] || 0) + 1;
    });

    result.push({
      label: `${MONTHS_ID[m]} '${String(y).slice(2)}`,
      total: bulanLeads.length,
      closing: statusCount['Closing'] || 0,
      aktif: bulanLeads.filter((l) => !['closing', 'dead'].includes((l.status || '').toLowerCase()))
        .length,
    });
  }
  return result;
}
