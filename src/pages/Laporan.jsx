import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { exportToExcel, formatTanggal } from '../utils/exportExcel';

const LAPORAN_LIST = [
  {
    id: 'units',
    label: 'Laporan Unit / Kavling',
    icon: '🏠',
    desc: 'Data semua unit beserta status, harga, dan spesifikasi',
    roles: ['admin', 'direktur', 'marketing', 'keuangan'],
  },
  {
    id: 'leads',
    label: 'Laporan Leads / Prospek',
    icon: '👥',
    desc: 'Daftar semua prospek beserta status dan marketing yang handle',
    roles: ['admin', 'direktur', 'marketing'],
  },
  {
    id: 'customers',
    label: 'Laporan Customer',
    icon: '🤝',
    desc: 'Data customer, unit yang dibeli, dan status pembayaran',
    roles: ['admin', 'direktur', 'keuangan'],
  },
  {
    id: 'keuangan',
    label: 'Laporan Keuangan',
    icon: '💰',
    desc: 'Rekap semua transaksi masuk dan keluar',
    roles: ['admin', 'direktur', 'keuangan'],
  },
  {
    id: 'cicilan',
    label: 'Laporan Cicilan',
    icon: '💳',
    desc: 'Riwayat dan status cicilan semua customer',
    roles: ['admin', 'direktur', 'keuangan'],
  },
  {
    id: 'timsales',
    label: 'Laporan Tim Sales',
    icon: '📊',
    desc: 'Performa tim sales beserta jumlah closing dan lead',
    roles: ['admin', 'direktur'],
  },
];

export default function Laporan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState({});
  const [filter, setFilter] = useState({ dari: '', sampai: '' });

  const laporanTersedia = LAPORAN_LIST.filter((l) => l.roles.includes(user?.role));

  async function handleExport(id) {
    setLoading((prev) => ({ ...prev, [id]: true }));
    try {
      switch (id) {
        case 'units':
          await exportUnits();
          break;
        case 'leads':
          await exportLeads();
          break;
        case 'customers':
          await exportCustomers();
          break;
        case 'keuangan':
          await exportKeuangan();
          break;
        case 'cicilan':
          await exportCicilan();
          break;
        case 'timsales':
          await exportTimSales();
          break;
        default:
          break;
      }
    } catch {
      alert('Gagal export laporan');
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  // ── Export functions

  async function exportUnits() {
    const res = await api.get('/units');
    exportToExcel(
      [
        {
          nama: 'Unit & Kavling',
          data: res.data,
          kolom: [
            { key: 'kode', label: 'Kode Unit', width: 12 },
            { key: 'blok', label: 'Blok/Cluster', width: 18 },
            { key: 'tipe', label: 'Tipe', width: 12 },
            { key: 'luas_tanah', label: 'LT (m²)', width: 10 },
            { key: 'luas_bangunan', label: 'LB (m²)', width: 10 },
            { key: 'harga', label: 'Harga (Rp)', width: 18 },
            { key: 'status', label: 'Status', width: 14 },
            { key: 'fasilitas', label: 'Fasilitas', width: 25 },
            { key: 'catatan', label: 'Catatan', width: 25 },
          ],
        },
      ],
      'Laporan_Unit'
    );
  }

  async function exportLeads() {
    const params = buildParams();
    const res = await api.get(`/leads${params}`);
    exportToExcel(
      [
        {
          nama: 'Leads & Prospek',
          data: res.data,
          kolom: [
            { key: 'nama', label: 'Nama', width: 22 },
            { key: 'hp', label: 'No HP', width: 16 },
            { key: 'email', label: 'Email', width: 25 },
            { key: 'sumber', label: 'Sumber', width: 14 },
            { key: 'status', label: 'Status', width: 14 },
            { key: 'minat', label: 'Minat', width: 20 },
            { key: 'budget', label: 'Budget (Rp)', width: 18 },
            { key: 'marketing', label: 'Marketing', width: 18 },
            { key: 'catatan', label: 'Catatan', width: 30 },
            {
              key: 'created_at',
              label: 'Tgl Masuk',
              width: 16,
            },
          ],
        },
      ],
      'Laporan_Leads'
    );
  }

  async function exportCustomers() {
    const res = await api.get('/customers');
    exportToExcel(
      [
        {
          nama: 'Data Customer',
          data: res.data,
          kolom: [
            { key: 'nama', label: 'Nama Customer', width: 22 },
            { key: 'hp', label: 'No HP', width: 16 },
            { key: 'email', label: 'Email', width: 25 },
            { key: 'unit_kode', label: 'Unit', width: 12 },
            { key: 'total', label: 'Total (Rp)', width: 18 },
            { key: 'terbayar', label: 'Terbayar (Rp)', width: 18 },
            { key: 'metode_bayar', label: 'Metode', width: 14 },
            { key: 'status', label: 'Status', width: 12 },
            { key: 'tgl_akad', label: 'Tgl Akad', width: 14 },
            { key: 'catatan', label: 'Catatan', width: 30 },
          ],
        },
      ],
      'Laporan_Customer'
    );
  }

  async function exportKeuangan() {
    const params = buildParams();
    const [transaksiRes, summaryRes] = await Promise.all([
      api.get(`/keuangan${params}`),
      api.get('/keuangan/summary'),
    ]);

    const summary = summaryRes.data;

    exportToExcel(
      [
        {
          nama: 'Transaksi',
          data: transaksiRes.data,
          kolom: [
            { key: 'tgl', label: 'Tanggal', width: 14 },
            { key: 'jenis', label: 'Jenis', width: 10 },
            { key: 'kategori', label: 'Kategori', width: 22 },
            { key: 'keterangan', label: 'Keterangan', width: 30 },
            { key: 'nominal', label: 'Nominal (Rp)', width: 18 },
            { key: 'created_by', label: 'Dicatat oleh', width: 18 },
            { key: 'catatan', label: 'Catatan', width: 25 },
          ],
        },
        {
          nama: 'Ringkasan',
          data: [
            ['Total Masuk', summary.total_masuk],
            ['Total Keluar', summary.total_keluar],
            ['Laba Kotor', summary.laba_kotor],
            ['Total Piutang', summary.total_piutang],
          ],
        },
      ],
      'Laporan_Keuangan'
    );
  }

  async function exportCicilan() {
    // Ambil semua customer dulu
    const custRes = await api.get('/customers');
    const allCicilan = [];

    // Ambil cicilan tiap customer
    await Promise.all(
      custRes.data.map(async (c) => {
        const res = await api.get(`/cicilan/${c.id}`);
        res.data.forEach((ci) => {
          allCicilan.push({
            customer_nama: c.nama,
            unit_kode: c.unit_kode,
            keterangan: ci.keterangan,
            tgl_jatuh_tempo: formatTanggal(ci.tgl_jatuh_tempo),
            nominal: ci.nominal,
            tgl_bayar: ci.tgl_bayar ? formatTanggal(ci.tgl_bayar) : '-',
            metode: ci.metode,
            status: ci.status,
          });
        });
      })
    );

    exportToExcel(
      [
        {
          nama: 'Cicilan',
          data: allCicilan,
          kolom: [
            { key: 'customer_nama', label: 'Customer', width: 22 },
            { key: 'unit_kode', label: 'Unit', width: 12 },
            { key: 'keterangan', label: 'Keterangan', width: 18 },
            { key: 'tgl_jatuh_tempo', label: 'Jatuh Tempo', width: 14 },
            { key: 'nominal', label: 'Nominal (Rp)', width: 18 },
            { key: 'tgl_bayar', label: 'Tgl Bayar', width: 14 },
            { key: 'metode', label: 'Metode', width: 14 },
            { key: 'status', label: 'Status', width: 12 },
          ],
        },
      ],
      'Laporan_Cicilan'
    );
  }

  async function exportTimSales() {
    const res = await api.get('/timsales');
    exportToExcel(
      [
        {
          nama: 'Tim Sales',
          data: res.data,
          kolom: [
            { key: 'nama', label: 'Nama', width: 22 },
            { key: 'role_tim', label: 'Role', width: 16 },
            { key: 'hp', label: 'No HP', width: 16 },
            { key: 'area', label: 'Area', width: 18 },
            { key: 'target_bulanan', label: 'Target/Bulan', width: 14 },
            { key: 'closing_bulan_ini', label: 'Closing Bulan Ini', width: 18 },
            { key: 'lead_aktif', label: 'Lead Aktif', width: 14 },
            { key: 'total_lead', label: 'Total Lead', width: 14 },
            { key: 'status', label: 'Status', width: 12 },
          ],
        },
      ],
      'Laporan_TimSales'
    );
  }

  function buildParams() {
    const params = new URLSearchParams();
    if (filter.dari) params.append('dari', filter.dari);
    if (filter.sampai) params.append('sampai', filter.sampai);
    const q = params.toString();
    return q ? `?${q}` : '';
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Laporan & Export</h1>
          <p style={styles.pageSubtitle}>Download data dalam format Excel</p>
        </div>
      </div>

      {/* Filter tanggal — untuk laporan keuangan & leads */}
      <div style={styles.filterCard}>
        <div style={styles.filterIcon}>📅</div>
        <div>
          <p style={styles.filterTitle}>Filter Periode</p>
          <p style={styles.filterSub}>Berlaku untuk laporan Keuangan dan Leads</p>
        </div>
        <div style={styles.filterInputs}>
          <div>
            <label style={styles.label}>Dari</label>
            <input
              type="date"
              value={filter.dari}
              onChange={(e) => setFilter({ ...filter, dari: e.target.value })}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Sampai</label>
            <input
              type="date"
              value={filter.sampai}
              onChange={(e) => setFilter({ ...filter, sampai: e.target.value })}
              style={styles.input}
            />
          </div>
          <button onClick={() => setFilter({ dari: '', sampai: '' })} style={styles.btnReset}>
            Reset
          </button>
        </div>
      </div>

      {/* Grid Laporan */}
      <div style={styles.laporanGrid}>
        {laporanTersedia.map((l) => (
          <div key={l.id} style={styles.laporanCard}>
            <div style={styles.laporanIcon}>{l.icon}</div>
            <div style={{ flex: 1 }}>
              <h3 style={styles.laporanLabel}>{l.label}</h3>
              <p style={styles.laporanDesc}>{l.desc}</p>
            </div>
            <button
              onClick={() => handleExport(l.id)}
              disabled={loading[l.id]}
              style={{
                ...styles.btnExport,
                opacity: loading[l.id] ? 0.6 : 1,
              }}
            >
              {loading[l.id] ? '⏳ Menyiapkan...' : '⬇ Download Excel'}
            </button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div style={styles.infoBox}>
        <span style={{ fontSize: '16px' }}>💡</span>
        <p style={styles.infoText}>
          File Excel akan otomatis terdownload ke komputer kamu. Laporan Keuangan memiliki 2 sheet:{' '}
          <strong>Transaksi</strong> dan <strong>Ringkasan</strong>.
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: { fontSize: '14px', color: 'var(--muted)', marginTop: '4px' },
  filterCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '18px 22px',
    marginBottom: '24px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  filterIcon: { fontSize: '28px', flexShrink: 0 },
  filterTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text)',
    margin: '0 0 2px',
  },
  filterSub: { fontSize: '12px', color: 'var(--muted)', margin: 0 },
  filterInputs: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
    marginLeft: 'auto',
    flexWrap: 'wrap',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '5px',
  },
  input: {
    padding: '8px 12px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'var(--text)',
    fontFamily: 'var(--sans)',
    outline: 'none',
  },
  btnReset: {
    padding: '8px 14px',
    backgroundColor: 'var(--surface-soft)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--muted)',
    fontFamily: 'var(--sans)',
    fontWeight: '600',
  },
  laporanGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  laporanCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '20px 24px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
  },
  laporanIcon: { fontSize: '32px', flexShrink: 0 },
  laporanLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text)',
    margin: '0 0 4px',
  },
  laporanDesc: { fontSize: '12px', color: 'var(--muted)', margin: 0 },
  btnExport: {
    padding: '10px 20px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'var(--sans)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    boxShadow: '0 4px 12px var(--accent-soft)',
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    backgroundColor: 'var(--surface-soft)',
    borderRadius: '12px',
    padding: '14px 18px',
    marginTop: '20px',
    border: '1px solid var(--border)',
  },
  infoText: { fontSize: '13px', color: 'var(--text)', margin: 0, lineHeight: 1.6, opacity: 0.8 },
};
