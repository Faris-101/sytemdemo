import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { exportToExcel } from '../utils/exportExcel';

const STATUS_COLOR = {
  Tersedia: { bg: 'var(--accent-soft)', color: 'var(--accent)' },
  Dipesan: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  Inden: { bg: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' },
  Terjual: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  Blokir: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' },
};

const BUNGA_BANK = [
  { label: 'BTN 10.5%/th', nilai: 10.5 },
  { label: 'BRI 11%/th', nilai: 11 },
  { label: 'BNI 10.75%/th', nilai: 10.75 },
  { label: 'Mandiri 11.5%/th', nilai: 11.5 },
  { label: 'Bank Swasta 12%', nilai: 12 },
  { label: 'Custom', nilai: null },
];

const TENOR_OPTIONS = [5, 10, 15, 20, 25, 30];

export default function Pricelist() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Tersedia');
  const [filterBlok, setFilterBlok] = useState('');
  const [blokList, setBlokList] = useState([]);
  const [tab, setTab] = useState('pricelist'); // "pricelist" | "simulasi"

  // State simulasi KPR
  const [sim, setSim] = useState({
    harga: '',
    dp_persen: 20,
    tenor: 15,
    bunga_idx: 0,
    bunga_custom: '',
  });
  const [hasilSim, setHasilSim] = useState(null);
  const [unitDipilih, setUnitDipilih] = useState(null);

  const fetchUnits = useCallback(async () => {
    try {
      let params = [];
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (filterBlok) params.push(`blok=${encodeURIComponent(filterBlok)}`);
      const res = await api.get(`/units${params.length ? '?' + params.join('&') : ''}`);
      setUnits(res.data);

      // Daftar blok unik
      const bloks = [...new Set(res.data.map((u) => u.blok).filter(Boolean))];
      setBlokList(bloks);
    } catch {
      console.error('Gagal fetch units');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterBlok]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Hitung simulasi KPR
  function hitungKPR() {
    const harga = Number(sim.harga);
    const dp = harga * (sim.dp_persen / 100);
    const pokok = harga - dp;
    const bunga =
      BUNGA_BANK[sim.bunga_idx].nilai !== null
        ? BUNGA_BANK[sim.bunga_idx].nilai
        : Number(sim.bunga_custom);

    if (!harga || !bunga || !sim.tenor) {
      alert('Lengkapi data simulasi dulu');
      return;
    }

    const r = bunga / 100 / 12; // bunga per bulan
    const n = sim.tenor * 12; // total bulan

    const cicilan = r === 0 ? pokok / n : (pokok * r) / (1 - Math.pow(1 + r, -n));

    const totalBayar = cicilan * n;
    const totalBunga = totalBayar - pokok;

    setHasilSim({
      harga,
      dp,
      pokok,
      bunga: bunga,
      tenor: sim.tenor,
      cicilan,
      totalBayar,
      totalBunga,
      tabelAngsuran: buildTabel(pokok, r, n, cicilan),
    });
  }

  function buildTabel(pokok, r, n, cicilan) {
    // Hanya tampilkan per tahun (bukan per bulan — terlalu panjang)
    const tabel = [];
    let sisa = pokok;

    for (let bulan = 1; bulan <= n; bulan++) {
      const bunga = sisa * r;
      const pokokBulan = cicilan - bunga;
      sisa -= pokokBulan;

      // Ambil per tahun saja
      if (bulan % 12 === 0 || bulan === n) {
        tabel.push({
          tahun: Math.ceil(bulan / 12),
          bulan,
          cicilan,
          bunga: bunga,
          pokok: pokokBulan,
          sisa: Math.max(sisa, 0),
        });
      }
    }
    return tabel;
  }

  function bukaSim(unit) {
    setUnitDipilih(unit);
    setSim((prev) => ({ ...prev, harga: unit.harga || '' }));
    setHasilSim(null);
    setTab('simulasi');
  }

  function exportPricelist() {
    exportToExcel(
      [
        {
          nama: 'Pricelist',
          data: units,
          kolom: [
            { key: 'kode', label: 'Kode', width: 12 },
            { key: 'blok', label: 'Blok/Cluster', width: 18 },
            { key: 'tipe', label: 'Tipe', width: 12 },
            { key: 'luas_tanah', label: 'LT (m²)', width: 10 },
            { key: 'luas_bangunan', label: 'LB (m²)', width: 10 },
            { key: 'harga', label: 'Harga (Rp)', width: 20 },
            { key: 'status', label: 'Status', width: 12 },
            { key: 'fasilitas', label: 'Fasilitas', width: 28 },
          ],
        },
      ],
      'Pricelist_PropSuite'
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Pricelist & Simulasi KPR</h1>
          <p style={styles.pageSubtitle}>{units.length} unit ditemukan</p>
        </div>
        {tab === 'pricelist' && (
          <button onClick={exportPricelist} style={styles.btnPrimary}>
            ⬇ Export Pricelist
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div style={styles.tabBar}>
        {[
          { key: 'pricelist', label: '📋 Pricelist' },
          { key: 'simulasi', label: '🧮 Simulasi KPR' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...styles.tabBtn,
              backgroundColor: tab === t.key ? 'var(--accent)' : 'var(--surface)',
              color: tab === t.key ? 'white' : 'var(--text)',
              fontWeight: tab === t.key ? '700' : '600',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PRICELIST VIEW ── */}
      {tab === 'pricelist' && (
        <>
          {/* Filter */}
          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Status:</span>
              {['', 'Tersedia', 'Dipesan', 'Inden', 'Terjual'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setLoading(true);
                    setFilterStatus(s);
                  }}
                  style={{
                    ...styles.filterBtn,
                    backgroundColor: filterStatus === s ? 'var(--accent)' : 'var(--surface)',
                    color: filterStatus === s ? 'white' : 'var(--text)',
                  }}
                >
                  {s || 'Semua'}
                </button>
              ))}
            </div>
            {blokList.length > 0 && (
              <div style={styles.filterGroup}>
                <span style={styles.filterLabel}>Cluster:</span>
                {['', ...blokList].map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setLoading(true);
                      setFilterBlok(b);
                    }}
                    style={{
                      ...styles.filterBtn,
                      backgroundColor: filterBlok === b ? 'var(--accent)' : 'var(--surface)',
                      color: filterBlok === b ? 'white' : 'var(--text)',
                    }}
                  >
                    {b || 'Semua'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Memuat...</p>
          ) : units.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Tidak ada unit.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Kode', 'Blok/Cluster', 'Tipe', 'LT/LB', 'Harga', 'Status', 'Aksi'].map(
                      (h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{u.kode}</strong>
                      </td>
                      <td style={styles.td}>{u.blok || '-'}</td>
                      <td style={styles.td}>{u.tipe || '-'}</td>
                      <td style={styles.td}>
                        <span style={styles.ltlb}>
                          {u.luas_tanah || '-'}/{u.luas_bangunan || '-'} m²
                        </span>
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: '800',
                          color: 'var(--text)',
                        }}
                      >
                        {formatRp(u.harga)}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: STATUS_COLOR[u.status]?.bg,
                            color: STATUS_COLOR[u.status]?.color,
                          }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {u.status === 'Tersedia' && (
                          <button onClick={() => bukaSim(u)} style={styles.btnSim}>
                            🧮 Simulasi KPR
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── SIMULASI KPR VIEW ── */}
      {tab === 'simulasi' && (
        <div style={styles.simWrapper}>
          {/* Form input */}
          <div style={styles.simCard}>
            <h2 style={styles.simTitle}>🧮 Kalkulator KPR</h2>

            {unitDipilih && (
              <div style={styles.unitPilihBox}>
                <span style={{ fontSize: '20px' }}>🏠</span>
                <div>
                  <div style={{ fontWeight: '800', color: 'var(--text)' }}>
                    Unit {unitDipilih.kode} — {unitDipilih.tipe}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {unitDipilih.blok} · Harga: {formatRp(unitDipilih.harga)}
                  </div>
                </div>
                <button onClick={() => setUnitDipilih(null)} style={styles.btnClearUnit}>
                  ✕
                </button>
              </div>
            )}

            <div style={styles.simGrid}>
              {/* Harga unit */}
              <div style={styles.simField}>
                <label style={styles.label}>Harga Unit (Rp)</label>
                <input
                  type="number"
                  value={sim.harga}
                  onChange={(e) => setSim({ ...sim, harga: e.target.value })}
                  placeholder="Contoh: 350000000"
                  style={styles.input}
                />
                {sim.harga && <span style={styles.inputNote}>{formatRp(Number(sim.harga))}</span>}
              </div>

              {/* DP */}
              <div style={styles.simField}>
                <label style={styles.label}>Uang Muka / DP (%)</label>
                <div style={styles.sliderWrapper}>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={sim.dp_persen}
                    onChange={(e) => setSim({ ...sim, dp_persen: Number(e.target.value) })}
                    style={styles.slider}
                  />
                  <div style={styles.sliderInfo}>
                    <span style={{ fontWeight: '800', color: 'var(--text)' }}>
                      {sim.dp_persen}%
                    </span>
                    {sim.harga && (
                      <span style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: '600' }}>
                        = {formatRp((Number(sim.harga) * sim.dp_persen) / 100)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tenor */}
              <div style={styles.simField}>
                <label style={styles.label}>Tenor (Tahun)</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {TENOR_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSim({ ...sim, tenor: t })}
                      style={{
                        ...styles.tenorBtn,
                        backgroundColor: sim.tenor === t ? 'var(--accent)' : 'var(--bg)',
                        color: sim.tenor === t ? 'white' : 'var(--text)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {t} th
                    </button>
                  ))}
                </div>
              </div>

              {/* Bunga */}
              <div style={styles.simField}>
                <label style={styles.label}>Suku Bunga Bank</label>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {BUNGA_BANK.map((b, i) => (
                    <label key={i} style={styles.radioLabel}>
                      <input
                        type="radio"
                        checked={sim.bunga_idx === i}
                        onChange={() => setSim({ ...sim, bunga_idx: i })}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span>{b.label}</span>
                    </label>
                  ))}
                  {BUNGA_BANK[sim.bunga_idx].nilai === null && (
                    <input
                      type="number"
                      step="0.1"
                      value={sim.bunga_custom}
                      onChange={(e) => setSim({ ...sim, bunga_custom: e.target.value })}
                      placeholder="Masukkan % bunga per tahun"
                      style={{ ...styles.input, marginTop: '4px' }}
                    />
                  )}
                </div>
              </div>
            </div>

            <button onClick={hitungKPR} style={styles.btnHitung}>
              Hitung Simulasi →
            </button>
          </div>

          {/* Hasil simulasi */}
          {hasilSim && (
            <div style={styles.hasilCard}>
              <h2 style={styles.simTitle}>📊 Hasil Simulasi</h2>

              {/* Ringkasan */}
              <div style={styles.hasilGrid}>
                <div style={styles.hasilItem}>
                  <p style={styles.hasilLabel}>Harga Unit</p>
                  <p style={styles.hasilVal}>{formatRp(hasilSim.harga)}</p>
                </div>
                <div style={styles.hasilItem}>
                  <p style={styles.hasilLabel}>Uang Muka ({sim.dp_persen}%)</p>
                  <p style={styles.hasilVal}>{formatRp(hasilSim.dp)}</p>
                </div>
                <div style={styles.hasilItem}>
                  <p style={styles.hasilLabel}>Pokok KPR</p>
                  <p style={styles.hasilVal}>{formatRp(hasilSim.pokok)}</p>
                </div>
                <div style={{ ...styles.hasilItem, backgroundColor: 'var(--accent)' }}>
                  <p
                    style={{
                      ...styles.hasilLabel,
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    Cicilan / Bulan
                  </p>
                  <p
                    style={{
                      ...styles.hasilVal,
                      color: 'white',
                      fontSize: '24px',
                    }}
                  >
                    {formatRp(hasilSim.cicilan)}
                  </p>
                </div>
                <div style={styles.hasilItem}>
                  <p style={styles.hasilLabel}>Total Pembayaran</p>
                  <p style={{ ...styles.hasilVal, color: '#ef4444' }}>
                    {formatRp(hasilSim.totalBayar)}
                  </p>
                </div>
                <div style={styles.hasilItem}>
                  <p style={styles.hasilLabel}>Total Bunga</p>
                  <p style={{ ...styles.hasilVal, color: '#f59e0b' }}>
                    {formatRp(hasilSim.totalBunga)}
                  </p>
                </div>
              </div>

              {/* Info */}
              <p style={styles.simInfo}>
                Bunga <strong>{hasilSim.bunga}%/tahun</strong> · Tenor{' '}
                <strong>{hasilSim.tenor} tahun</strong> ({hasilSim.tenor * 12} bulan)
              </p>

              {/* Tabel angsuran per tahun */}
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: 'var(--text)',
                  margin: '20px 0 12px',
                }}
              >
                Rincian per Tahun
              </h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Tahun', 'Cicilan/bln', 'Bunga/bln', 'Pokok/bln', 'Sisa Pokok'].map((h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hasilSim.tabelAngsuran.map((row) => (
                      <tr key={row.tahun} style={styles.tr}>
                        <td style={styles.td}>Tahun {row.tahun}</td>
                        <td style={styles.td}>{formatRp(row.cicilan)}</td>
                        <td style={{ ...styles.td, color: '#f59e0b', fontWeight: '600' }}>
                          {formatRp(row.bunga)}
                        </td>
                        <td style={{ ...styles.td, color: 'var(--accent)', fontWeight: '600' }}>
                          {formatRp(row.pokok)}
                        </td>
                        <td style={{ ...styles.td, fontWeight: '700' }}>{formatRp(row.sisa)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Disclaimer */}
              <p style={styles.disclaimer}>
                * Simulasi ini hanya perkiraan. Cicilan aktual dapat berbeda tergantung kebijakan
                bank, asuransi, dan biaya tambahan lainnya.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatRp(angka) {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
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
  tabBar: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tabBtn: {
    padding: '10px 20px',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s ease',
  },
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '12px',
    color: 'var(--muted)',
    fontWeight: '700',
    width: '60px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  filterBtn: {
    padding: '6px 16px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  tableWrapper: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    overflow: 'auto',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--muted)',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--surface-soft)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    transition: 'background-color 0.2s ease',
  },
  td: { padding: '14px 16px', fontSize: '14px', color: 'var(--text)' },
  ltlb: { fontSize: '12px', color: 'var(--muted)', fontWeight: '600' },
  badge: {
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
  },
  btnSim: {
    padding: '6px 14px',
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  btnPrimary: {
    padding: '10px 24px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px var(--accent-soft)',
  },
  simWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    alignItems: 'flex-start',
  },
  simCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border)',
  },
  hasilCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border)',
  },
  simTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: '0 0 20px',
    letterSpacing: '-0.01em',
  },
  unitPilihBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--accent-soft)',
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '20px',
    border: '1px solid var(--accent)',
  },
  btnClearUnit: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    color: 'var(--muted)',
    fontSize: '12px',
    marginLeft: 'auto',
  },
  simGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
  simField: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    padding: '10px 14px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  },
  inputNote: {
    fontSize: '12px',
    color: 'var(--accent)',
    fontWeight: '700',
    marginTop: '4px',
    display: 'block',
  },
  sliderWrapper: { display: 'flex', flexDirection: 'column', gap: '6px' },
  slider: { width: '100%', accentColor: 'var(--accent)' },
  sliderInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenorBtn: {
    padding: '8px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: 'var(--text)',
    cursor: 'pointer',
    fontWeight: '600',
  },
  btnHitung: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '800',
    marginTop: '12px',
    boxShadow: '0 4px 12px var(--accent-soft)',
  },
  hasilGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  hasilItem: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
  },
  hasilLabel: {
    fontSize: '10px',
    color: 'var(--muted)',
    margin: '0 0 6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '700',
  },
  hasilVal: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: 0,
  },
  simInfo: { fontSize: '13px', color: 'var(--muted)', margin: '0 0 12px', fontWeight: '600' },
  disclaimer: {
    fontSize: '11px',
    color: 'var(--muted)',
    fontStyle: 'italic',
    marginTop: '16px',
    lineHeight: 1.6,
  },
};
