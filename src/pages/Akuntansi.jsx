import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const TABS = [
  { key: 'labarugi', label: '📊 Laba Rugi' },
  { key: 'neraca', label: '⚖ Neraca' },
  { key: 'jurnal', label: '📋 Jurnal Umum' },
  { key: 'hutang', label: '💸 Hutang Usaha' },
  { key: 'piutang', label: '💰 Piutang' },
];

const JENIS_AKUN = ['Aset', 'Kewajiban', 'Modal', 'Pendapatan', 'Beban'];
const FORM_JURNAL_AWAL = {
  tgl: '',
  keterangan: '',
  referensi: '',
  detail: [
    { akun_id: '', posisi: 'Debet', nominal: '' },
    { akun_id: '', posisi: 'Kredit', nominal: '' },
  ],
};
const FORM_HUTANG_AWAL = {
  nama_pihak: '',
  keterangan: '',
  nominal: '',
  tgl_hutang: '',
  tgl_jatuh_tempo: '',
  catatan: '',
};

export default function Akuntansi() {
  const [tab, setTab] = useState('labarugi');
  const [akun, setAkun] = useState([]);

  // State per tab
  const [labaRugi, setLabaRugi] = useState(null);
  const [neraca, setNeraca] = useState(null);
  const [jurnal, setJurnal] = useState([]);
  const [hutang, setHutang] = useState([]);
  const [piutang, setPiutang] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter
  const [periode, setPeriode] = useState({ dari: '', sampai: '' });
  const [filterHutang, setFilterHutang] = useState('');

  // Form states
  const [showJurnalForm, setShowJurnalForm] = useState(false);
  const [formJurnal, setFormJurnal] = useState(FORM_JURNAL_AWAL);
  const [showHutangForm, setShowHutangForm] = useState(false);
  const [formHutang, setFormHutang] = useState(FORM_HUTANG_AWAL);
  const [submitting, setSubmitting] = useState(false);

  // Detail jurnal
  const [jurnalDetail, setJurnalDetail] = useState(null);

  // Bayar hutang
  const [showBayar, setShowBayar] = useState(null);
  const [jumlahBayar, setJumlahBayar] = useState('');

  const fetchAkun = useCallback(async () => {
    try {
      const res = await api.get('/akuntansi/akun');
      setAkun(res.data);
    } catch {
      console.error('Gagal fetch akun');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await api.get('/akuntansi/akun');
        if (!ignore) setAkun(res.data);
      } catch {
        console.error('Gagal fetch akun');
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const buildPeriodeParams = useCallback(() => {
    const p = new URLSearchParams();
    if (periode.dari) p.append('dari', periode.dari);
    if (periode.sampai) p.append('sampai', periode.sampai);
    const s = p.toString();
    return s ? `?${s}` : '';
  }, [periode]);

  const fetchTabData = useCallback(async () => {
    setLoading(true);
    try {
      const p = buildPeriodeParams();
      if (tab === 'labarugi') {
        const res = await api.get(`/akuntansi/labarugi${p}`);
        setLabaRugi(res.data);
      } else if (tab === 'neraca') {
        const res = await api.get('/akuntansi/neraca');
        setNeraca(res.data);
      } else if (tab === 'jurnal') {
        const res = await api.get(`/akuntansi/jurnal${p}`);
        setJurnal(res.data);
      } else if (tab === 'hutang') {
        const params = filterHutang ? `?status=${filterHutang}` : '';
        const res = await api.get(`/akuntansi/hutang${params}`);
        setHutang(res.data);
      } else if (tab === 'piutang') {
        const res = await api.get('/customers');
        const aktif = res.data.filter((c) => c.status !== 'Lunas');
        setCustomers(aktif);
        const total = aktif.reduce((s, c) => s + (Number(c.total) - Number(c.terbayar)), 0);
        setPiutang(total);
      }
    } catch {
      console.error('Gagal fetch data');
    } finally {
      setLoading(false);
    }
  }, [tab, filterHutang, buildPeriodeParams]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const p = buildPeriodeParams();
        if (tab === 'labarugi') {
          const res = await api.get(`/akuntansi/labarugi${p}`);
          if (!ignore) setLabaRugi(res.data);
        } else if (tab === 'neraca') {
          const res = await api.get('/akuntansi/neraca');
          if (!ignore) setNeraca(res.data);
        } else if (tab === 'jurnal') {
          const res = await api.get(`/akuntansi/jurnal${p}`);
          if (!ignore) setJurnal(res.data);
        } else if (tab === 'hutang') {
          const params = filterHutang ? `?status=${filterHutang}` : '';
          const res = await api.get(`/akuntansi/hutang${params}`);
          if (!ignore) setHutang(res.data);
        } else if (tab === 'piutang') {
          const res = await api.get('/customers');
          const aktif = res.data.filter((c) => c.status !== 'Lunas');
          if (!ignore) {
            setCustomers(aktif);
            const total = aktif.reduce((s, c) => s + (Number(c.total) - Number(c.terbayar)), 0);
            setPiutang(total);
          }
        }
      } catch {
        console.error('Gagal fetch data');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [tab, filterHutang, buildPeriodeParams]);

  // Jurnal form helpers
  function addBaris() {
    setFormJurnal((prev) => ({
      ...prev,
      detail: [...prev.detail, { akun_id: '', posisi: 'Debet', nominal: '' }],
    }));
  }

  function removeBaris(idx) {
    setFormJurnal((prev) => ({
      ...prev,
      detail: prev.detail.filter((_, i) => i !== idx),
    }));
  }

  function updateBaris(idx, field, value) {
    setFormJurnal((prev) => ({
      ...prev,
      detail: prev.detail.map((b, i) => (i === idx ? { ...b, [field]: value } : b)),
    }));
  }

  const totalDebet = formJurnal.detail
    .filter((d) => d.posisi === 'Debet')
    .reduce((s, d) => s + (Number(d.nominal) || 0), 0);
  const totalKredit = formJurnal.detail
    .filter((d) => d.posisi === 'Kredit')
    .reduce((s, d) => s + (Number(d.nominal) || 0), 0);
  const isBalance = totalDebet === totalKredit && totalDebet > 0;

  async function submitJurnal(e) {
    e.preventDefault();
    if (!isBalance) return alert('Jurnal harus balance (Debet = Kredit)');
    setSubmitting(true);
    try {
      await api.post('/akuntansi/jurnal', formJurnal);
      setFormJurnal(FORM_JURNAL_AWAL);
      setShowJurnalForm(false);
      fetchTabData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal simpan jurnal');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitHutang(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/akuntansi/hutang', formHutang);
      setFormHutang(FORM_HUTANG_AWAL);
      setShowHutangForm(false);
      fetchTabData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal catat hutang');
    } finally {
      setSubmitting(false);
    }
  }

  async function bayarHutang(id) {
    if (!jumlahBayar) return alert('Isi jumlah bayar dulu');
    try {
      await api.patch(`/akuntansi/hutang/${id}/bayar`, { jumlah: jumlahBayar });
      setShowBayar(null);
      setJumlahBayar('');
      fetchTabData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal catat pembayaran');
    }
  }

  async function hapusJurnal(id) {
    if (!confirm('Hapus jurnal ini?')) return;
    try {
      await api.delete(`/akuntansi/jurnal/${id}`);
      fetchTabData();
    } catch {
      alert('Gagal hapus jurnal');
    }
  }

  async function hapusHutang(id) {
    if (!confirm('Hapus data hutang ini?')) return;
    try {
      await api.delete(`/akuntansi/hutang/${id}`);
      fetchTabData();
    } catch {
      alert('Gagal hapus hutang');
    }
  }

  async function bukaDetailJurnal(id) {
    try {
      const res = await api.get(`/akuntansi/jurnal/${id}`);
      setJurnalDetail(res.data);
    } catch {
      alert('Gagal load detail');
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Keuangan & Akuntansi</h1>
          <p style={styles.pageSubtitle}>Jurnal, laporan keuangan, piutang & hutang</p>
        </div>
      </div>

      {/* Filter Periode */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap: '12px',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <label style={styles.label}>Dari</label>
          <input
            type="date"
            value={periode.dari}
            onChange={(e) => setPeriode((p) => ({ ...p, dari: e.target.value }))}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Sampai</label>
          <input
            type="date"
            value={periode.sampai}
            onChange={(e) => setPeriode((p) => ({ ...p, sampai: e.target.value }))}
            style={styles.input}
          />
        </div>
        <button onClick={fetchTabData} style={styles.btnPrimary}>
          Terapkan
        </button>
        <button
          onClick={() => {
            setPeriode({ dari: '', sampai: '' });
            setTimeout(fetchTabData, 100);
          }}
          style={styles.btnSecondary}
        >
          Reset
        </button>
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...styles.tabBtn,
              backgroundColor: tab === t.key ? 'var(--accent)' : 'var(--surface)',
              color: tab === t.key ? 'white' : 'var(--text)',
              borderColor: tab === t.key ? 'var(--accent)' : 'var(--border)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : (
        <>
          {/* ── LABA RUGI ── */}
          {tab === 'labarugi' && labaRugi && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Pendapatan */}
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Pendapatan</h3>
                <div className="space-y-2">
                  {labaRugi.pendapatan.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text)' }}>{p.akun_nama}</span>
                      <span className="font-semibold text-green-600">{formatRp(p.saldo)}</span>
                    </div>
                  ))}
                  {labaRugi.pendapatan.length === 0 && (
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Belum ada pendapatan</p>
                  )}
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '700',
                    color: 'var(--text)',
                  }}
                >
                  <span>Total Pendapatan</span>
                  <span className="text-green-600">{formatRp(labaRugi.total_pendapatan)}</span>
                </div>
              </div>

              {/* Beban */}
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Beban</h3>
                <div className="space-y-2">
                  {labaRugi.beban.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text)' }}>{b.akun_nama}</span>
                      <span className="font-semibold text-red-500">{formatRp(b.saldo)}</span>
                    </div>
                  ))}
                  {labaRugi.beban.length === 0 && (
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Belum ada beban</p>
                  )}
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '700',
                    color: 'var(--text)',
                  }}
                >
                  <span>Total Beban</span>
                  <span className="text-red-500">{formatRp(labaRugi.total_beban)}</span>
                </div>
              </div>

              {/* Laba Bersih */}
              <div
                style={{
                  ...styles.formCard,
                  gridColumn: 'span 2',
                  backgroundColor:
                    labaRugi.laba_bersih >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 style={{ ...styles.formTitle, fontSize: '18px' }}>
                    {labaRugi.laba_bersih >= 0 ? '✅ Laba Bersih' : '❌ Rugi Bersih'}
                  </h3>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: '900',
                      color: labaRugi.laba_bersih >= 0 ? '#16a34a' : '#dc2626',
                    }}
                  >
                    {formatRp(Math.abs(labaRugi.laba_bersih))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── NERACA ── */}
          {tab === 'neraca' && neraca && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Aktiva */}
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>AKTIVA</h3>

                <p style={styles.label}>Aset</p>
                {neraca.aset.map((a) => (
                  <div key={a.id} className="mb-1 flex justify-between text-sm">
                    <span style={{ color: 'var(--text)' }}>
                      {a.kode} — {a.nama}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>
                      {formatRp(a.saldo)}
                    </span>
                  </div>
                ))}
                {neraca.piutang_real > 0 && (
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-orange-600">Piutang Customer (real)</span>
                    <span className="font-semibold text-orange-600">
                      {formatRp(neraca.piutang_real)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    marginTop: '12px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '700',
                    color: 'var(--text)',
                  }}
                >
                  <span>Total Aktiva</span>
                  <span>{formatRp(neraca.total_aset + neraca.piutang_real)}</span>
                </div>
              </div>

              {/* Pasiva */}
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>PASIVA</h3>

                <p style={styles.label}>Kewajiban</p>
                {neraca.kewajiban.map((a) => (
                  <div key={a.id} className="mb-1 flex justify-between text-sm">
                    <span style={{ color: 'var(--text)' }}>
                      {a.kode} — {a.nama}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>
                      {formatRp(a.saldo)}
                    </span>
                  </div>
                ))}
                {neraca.hutang_real > 0 && (
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-red-500">Hutang Usaha (real)</span>
                    <span className="font-semibold text-red-500">
                      {formatRp(neraca.hutang_real)}
                    </span>
                  </div>
                )}

                <p style={{ ...styles.label, marginTop: '16px' }}>Modal</p>
                {neraca.modal.map((a) => (
                  <div key={a.id} className="mb-1 flex justify-between text-sm">
                    <span style={{ color: 'var(--text)' }}>
                      {a.kode} — {a.nama}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>
                      {formatRp(a.saldo)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: '12px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '700',
                    color: 'var(--text)',
                  }}
                >
                  <span>Total Pasiva</span>
                  <span>{formatRp(neraca.total_pasiva + neraca.hutang_real)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── JURNAL ── */}
          {tab === 'jurnal' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowJurnalForm(!showJurnalForm)}
                  style={styles.btnPrimary}
                >
                  {showJurnalForm ? '✕ Tutup' : '+ Buat Jurnal'}
                </button>
              </div>

              {/* Form Jurnal */}
              {showJurnalForm && (
                <div style={styles.formCard}>
                  <h3 style={styles.formTitle}>Jurnal Umum Baru</h3>
                  <form onSubmit={submitJurnal} className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label style={styles.label}>Tanggal *</label>
                        <input
                          type="date"
                          value={formJurnal.tgl}
                          onChange={(e) =>
                            setFormJurnal((p) => ({
                              ...p,
                              tgl: e.target.value,
                            }))
                          }
                          required
                          style={styles.input}
                        />
                      </div>
                      <div className="col-span-2">
                        <label style={styles.label}>Keterangan *</label>
                        <input
                          value={formJurnal.keterangan}
                          onChange={(e) =>
                            setFormJurnal((p) => ({
                              ...p,
                              keterangan: e.target.value,
                            }))
                          }
                          required
                          placeholder="Deskripsi transaksi"
                          style={styles.input}
                        />
                      </div>
                    </div>

                    {/* Baris Debet/Kredit */}
                    <div
                      style={{
                        overflow: 'auto',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <table className="w-full text-sm">
                        <thead style={{ background: 'var(--surface-soft)' }}>
                          <tr>
                            <th style={styles.th}>Akun</th>
                            <th style={styles.th}>Posisi</th>
                            <th style={styles.th}>Nominal</th>
                            <th style={styles.th}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formJurnal.detail.map((baris, idx) => (
                            <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                              <td className="px-3 py-2">
                                <select
                                  value={baris.akun_id}
                                  onChange={(e) => updateBaris(idx, 'akun_id', e.target.value)}
                                  required
                                  style={styles.input}
                                >
                                  <option value="">-- Pilih Akun --</option>
                                  {JENIS_AKUN.map((jenis) => (
                                    <optgroup key={jenis} label={jenis}>
                                      {akun
                                        .filter((a) => a.jenis === jenis)
                                        .map((a) => (
                                          <option key={a.id} value={a.id}>
                                            {a.kode} — {a.nama}
                                          </option>
                                        ))}
                                    </optgroup>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  value={baris.posisi}
                                  onChange={(e) => updateBaris(idx, 'posisi', e.target.value)}
                                  style={{
                                    ...styles.input,
                                    fontWeight: '700',
                                    backgroundColor:
                                      baris.posisi === 'Debet'
                                        ? 'rgba(59, 130, 246, 0.1)'
                                        : 'rgba(34, 197, 94, 0.1)',
                                    color: baris.posisi === 'Debet' ? '#2563eb' : '#16a34a',
                                    borderColor: 'transparent',
                                  }}
                                >
                                  <option value="Debet">Debet</option>
                                  <option value="Kredit">Kredit</option>
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={baris.nominal}
                                  onChange={(e) => updateBaris(idx, 'nominal', e.target.value)}
                                  required
                                  placeholder="0"
                                  style={styles.input}
                                />
                              </td>
                              <td className="px-2 py-2">
                                {formJurnal.detail.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeBaris(idx)}
                                    style={{
                                      color: '#ef4444',
                                      border: 'none',
                                      background: 'none',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    ✕
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot style={{ background: 'var(--surface-soft)' }}>
                          <tr>
                            <td
                              colSpan={2}
                              style={{
                                padding: '8px 12px',
                                textAlign: 'right',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: 'var(--muted)',
                              }}
                            >
                              Total:
                            </td>
                            <td className="px-3 py-2">
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  color: isBalance ? '#16a34a' : '#dc2626',
                                }}
                              >
                                D: {formatRp(totalDebet)} | K: {formatRp(totalKredit)}
                                {isBalance ? ' ✓' : ' ✗'}
                              </div>
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={addBaris}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--accent)',
                          fontSize: '14px',
                          fontWeight: '600',
                          textDecoration: 'underline',
                        }}
                      >
                        + Tambah Baris
                      </button>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowJurnalForm(false)}
                          style={styles.btnSecondary}
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !isBalance}
                          style={{
                            ...styles.btnPrimary,
                            opacity: !isBalance || submitting ? 0.5 : 1,
                          }}
                        >
                          {submitting ? 'Menyimpan...' : 'Simpan Jurnal'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Tabel Jurnal */}
              <div style={styles.tableWrapper}>
                <table className="w-full">
                  <thead>
                    <tr>
                      {['No Jurnal', 'Tanggal', 'Keterangan', 'Dibuat oleh', 'Aksi'].map((h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jurnal.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: '32px',
                            textAlign: 'center',
                            color: 'var(--muted)',
                            fontSize: '14px',
                          }}
                        >
                          Belum ada jurnal.
                        </td>
                      </tr>
                    ) : (
                      jurnal.map((j) => (
                        <tr key={j.id} style={styles.tr}>
                          <td
                            className="px-4 py-3 text-sm font-mono font-bold"
                            style={{ color: 'var(--accent)' }}
                          >
                            {j.no_jurnal}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>
                            {new Date(j.tgl).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>
                            {j.keterangan}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                            {j.created_by}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => bukaDetailJurnal(j.id)}
                                style={{ ...styles.btnSelesai, padding: '4px 10px' }}
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => hapusJurnal(j.id)}
                                style={{ ...styles.btnHapus, padding: '4px 10px' }}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── HUTANG ── */}
          {tab === 'hutang' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div style={styles.filterBar}>
                  {['', 'Belum Lunas', 'Sebagian', 'Lunas'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterHutang(s)}
                      style={{
                        ...styles.filterBtn,
                        backgroundColor: filterHutang === s ? 'var(--accent)' : 'var(--surface)',
                        color: filterHutang === s ? 'white' : 'var(--text)',
                        borderColor: filterHutang === s ? 'var(--accent)' : 'var(--border)',
                      }}
                    >
                      {s || 'Semua'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowHutangForm(!showHutangForm)}
                  style={styles.btnPrimary}
                >
                  {showHutangForm ? '✕ Tutup' : '+ Catat Hutang'}
                </button>
              </div>

              {/* Form Hutang */}
              {showHutangForm && (
                <div style={styles.formCard}>
                  <form onSubmit={submitHutang} className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label style={styles.label}>Nama Pihak / Vendor *</label>
                      <input
                        value={formHutang.nama_pihak}
                        onChange={(e) =>
                          setFormHutang((p) => ({
                            ...p,
                            nama_pihak: e.target.value,
                          }))
                        }
                        required
                        placeholder="Nama supplier/vendor"
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Keterangan</label>
                      <input
                        value={formHutang.keterangan}
                        onChange={(e) =>
                          setFormHutang((p) => ({
                            ...p,
                            keterangan: e.target.value,
                          }))
                        }
                        placeholder="Contoh: Pembelian material"
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Nominal *</label>
                      <input
                        type="number"
                        value={formHutang.nominal}
                        onChange={(e) =>
                          setFormHutang((p) => ({
                            ...p,
                            nominal: e.target.value,
                          }))
                        }
                        required
                        placeholder="Jumlah hutang"
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Tanggal Hutang *</label>
                      <input
                        type="date"
                        value={formHutang.tgl_hutang}
                        onChange={(e) =>
                          setFormHutang((p) => ({
                            ...p,
                            tgl_hutang: e.target.value,
                          }))
                        }
                        required
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Jatuh Tempo</label>
                      <input
                        type="date"
                        value={formHutang.tgl_jatuh_tempo}
                        onChange={(e) =>
                          setFormHutang((p) => ({
                            ...p,
                            tgl_jatuh_tempo: e.target.value,
                          }))
                        }
                        style={styles.input}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowHutangForm(false)}
                        style={styles.btnSecondary}
                      >
                        Batal
                      </button>
                      <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                        {submitting ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tabel Hutang */}
              <div style={styles.tableWrapper}>
                <table className="w-full">
                  <thead>
                    <tr>
                      {[
                        'Pihak',
                        'Keterangan',
                        'Nominal',
                        'Dibayar',
                        'Sisa',
                        'Jatuh Tempo',
                        'Status',
                        'Aksi',
                      ].map((h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hutang.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            padding: '32px',
                            textAlign: 'center',
                            fontSize: '14px',
                            color: 'var(--muted)',
                          }}
                        >
                          Tidak ada hutang.
                        </td>
                      </tr>
                    ) : (
                      hutang.map((h) => {
                        const sisa = Number(h.nominal) - Number(h.sudah_dibayar);
                        const telat =
                          h.tgl_jatuh_tempo &&
                          new Date(h.tgl_jatuh_tempo) < new Date() &&
                          h.status !== 'Lunas';
                        return (
                          <tr key={h.id} style={styles.tr}>
                            <td
                              className="px-4 py-3 text-sm font-semibold"
                              style={{ color: 'var(--text)' }}
                            >
                              {h.nama_pihak}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                              {h.keterangan || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>
                              {formatRp(h.nominal)}
                            </td>
                            <td className="px-4 py-3 text-sm text-green-600">
                              {formatRp(h.sudah_dibayar)}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-red-500">
                              {formatRp(sisa)}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>
                              {h.tgl_jatuh_tempo ? (
                                <span
                                  style={{
                                    fontWeight: telat ? '700' : '400',
                                    color: telat ? '#ef4444' : 'var(--text)',
                                  }}
                                >
                                  {new Date(h.tgl_jatuh_tempo).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                  {telat && ' ⚠'}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                style={{
                                  ...styles.badge,
                                  backgroundColor:
                                    h.status === 'Lunas'
                                      ? 'rgba(34, 197, 94, 0.15)'
                                      : h.status === 'Sebagian'
                                        ? 'rgba(245, 158, 11, 0.15)'
                                        : 'rgba(239, 68, 68, 0.15)',
                                  color:
                                    h.status === 'Lunas'
                                      ? '#16a34a'
                                      : h.status === 'Sebagian'
                                        ? '#d97706'
                                        : '#dc2626',
                                }}
                              >
                                {h.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {h.status !== 'Lunas' &&
                                  (showBayar === h.id ? (
                                    <div className="flex gap-1">
                                      <input
                                        type="number"
                                        value={jumlahBayar}
                                        onChange={(e) => setJumlahBayar(e.target.value)}
                                        placeholder="Nominal"
                                        style={{
                                          ...styles.input,
                                          width: '100px',
                                          padding: '4px 8px',
                                          fontSize: '12px',
                                        }}
                                      />
                                      <button
                                        onClick={() => bayarHutang(h.id)}
                                        style={{ ...styles.btnSelesai, padding: '4px 8px' }}
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={() => setShowBayar(null)}
                                        style={{ ...styles.btnBatal, padding: '4px 8px' }}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setShowBayar(h.id)}
                                      style={{ ...styles.btnSelesai, padding: '4px 10px' }}
                                    >
                                      Bayar
                                    </button>
                                  ))}
                                <button
                                  onClick={() => hapusHutang(h.id)}
                                  style={{ ...styles.btnHapus, padding: '4px 10px' }}
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PIUTANG ── */}
          {tab === 'piutang' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div style={styles.formCard}>
                  <p style={styles.label}>Total Piutang</p>
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '24px',
                      fontWeight: '900',
                      color: '#f59e0b',
                    }}
                  >
                    {formatRp(piutang)}
                  </p>
                </div>
                <div style={styles.formCard}>
                  <p style={styles.label}>Jumlah Customer</p>
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '24px',
                      fontWeight: '900',
                      color: 'var(--text)',
                    }}
                  >
                    {customers.length}
                  </p>
                </div>
                <div style={styles.formCard}>
                  <p style={styles.label}>Rata-rata Piutang</p>
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '24px',
                      fontWeight: '900',
                      color: 'var(--text)',
                    }}
                  >
                    {customers.length ? formatRp(piutang / customers.length) : 'Rp 0'}
                  </p>
                </div>
              </div>

              {/* Tabel piutang per customer */}
              <div style={styles.tableWrapper}>
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Customer', 'Unit', 'Total', 'Terbayar', 'Piutang', 'Metode', 'Status'].map(
                        (h) => (
                          <th key={h} style={styles.th}>
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            padding: '32px',
                            textAlign: 'center',
                            fontSize: '14px',
                            color: 'var(--muted)',
                          }}
                        >
                          Semua customer sudah lunas.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => {
                        const sisa = Number(c.total) - Number(c.terbayar);
                        return (
                          <tr key={c.id} style={styles.tr}>
                            <td
                              className="px-4 py-3 text-sm font-semibold"
                              style={{ color: 'var(--text)' }}
                            >
                              {c.nama}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>
                              {c.unit_kode || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>
                              {formatRp(c.total)}
                            </td>
                            <td className="px-4 py-3 text-sm text-green-600">
                              {formatRp(c.terbayar)}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-orange-500">
                              {formatRp(sisa)}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>
                              {c.metode_bayar || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                style={{
                                  ...styles.badge,
                                  backgroundColor:
                                    c.status === 'Menunggak'
                                      ? 'rgba(239, 68, 68, 0.15)'
                                      : 'rgba(59, 130, 246, 0.15)',
                                  color: c.status === 'Menunggak' ? '#dc2626' : '#2563eb',
                                }}
                              >
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Detail Jurnal */}
      {jurnalDetail && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>{jurnalDetail.no_jurnal}</h2>
                <p style={styles.pageSubtitle}>
                  {new Date(jurnalDetail.tgl).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button onClick={() => setJurnalDetail(null)} style={styles.btnClose}>
                ✕
              </button>
            </div>
            <p
              style={{
                ...styles.formTitle,
                fontSize: '14px',
                color: 'var(--text)',
                marginBottom: '16px',
              }}
            >
              {jurnalDetail.keterangan}
            </p>
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              <table className="w-full text-sm">
                <thead style={{ background: 'var(--surface-soft)' }}>
                  <tr>
                    <th style={styles.th}>Akun</th>
                    <th style={{ ...styles.th, textAlign: 'right', color: '#2563eb' }}>Debet</th>
                    <th style={{ ...styles.th, textAlign: 'right', color: '#16a34a' }}>Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {jurnalDetail.detail?.map((d, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td
                        className={`px-3 py-2 ${d.posisi === 'Kredit' ? 'pl-8' : ''}`}
                        style={{ color: 'var(--text)' }}
                      >
                        {d.akun_kode} — {d.akun_nama}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-blue-600">
                        {d.posisi === 'Debet' ? formatRp(d.nominal) : ''}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-green-600">
                        {d.posisi === 'Kredit' ? formatRp(d.nominal) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ background: 'var(--surface-soft)' }}>
                  <tr>
                    <td
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: 'var(--muted)',
                      }}
                    >
                      Total
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-black text-blue-600">
                      {formatRp(
                        jurnalDetail.detail
                          ?.filter((d) => d.posisi === 'Debet')
                          .reduce((s, d) => s + Number(d.nominal), 0)
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-black text-green-600">
                      {formatRp(
                        jurnalDetail.detail
                          ?.filter((d) => d.posisi === 'Kredit')
                          .reduce((s, d) => s + Number(d.nominal), 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
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
  formCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
  },
  formTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '14px',
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
  tabBar: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tabBtn: {
    padding: '8px 16px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  filterBar: { display: 'flex', gap: '8px' },
  filterBtn: {
    padding: '6px 14px',
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
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    background: 'var(--surface-soft)',
  },
  tr: { borderBottom: '1px solid var(--border)' },
  badge: {
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
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
  btnSecondary: {
    padding: '10px 20px',
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  btnSelesai: {
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnBatal: {
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnHapus: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '540px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '28px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-soft)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  btnClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'var(--muted)',
  },
};

function formatRp(angka) {
  if (!angka && angka !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}
