import { useEffect, useState } from 'react';
import api from '../api/axios';

const STATUS_STYLE = {
  Lunas: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)' },
  Belum: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--orange)' },
  Telat: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)' },
};

const FORM_AWAL = {
  tgl_jatuh_tempo: '',
  keterangan: '',
  nominal: '',
  metode: '',
  catatan: '',
};

export default function Cicilan() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cicilan, setCicilan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCust, setLoadingCust] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_AWAL);
  const [showBayarId, setShowBayarId] = useState(null);
  const [tglBayar, setTglBayar] = useState('');
  const [metodeBayar] = useState('Transfer Bank');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoadingCust(true);
    try {
      const res = await api.get('/cicilan/');
      setCustomers(res.data);
    } catch {
      console.error('Gagal fetch customers');
    } finally {
      setLoadingCust(false);
    }
  }

  async function pilihCustomer(c) {
    setSelected(c);
    setLoading(true);
    setShowForm(false);
    try {
      const res = await api.get(`/cicilan/${c.id}`);
      setCicilan(res.data);
    } catch {
      console.error('Gagal fetch cicilan');
    } finally {
      setLoading(false);
    }
  }

  async function handleTambah(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/cicilan', { ...form, customer_id: selected.id });
      setForm(FORM_AWAL);
      setShowForm(false);
      pilihCustomer(selected);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal tambah cicilan');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBayar(id) {
    if (!tglBayar) return alert('Pilih tanggal bayar dulu');
    setSubmitting(true);
    try {
      await api.patch(`/cicilan/${id}/bayar`, {
        tgl_bayar: tglBayar,
        metode: metodeBayar,
      });
      setShowBayarId(null);
      setTglBayar('');
      pilihCustomer(selected);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal catat pembayaran');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBatal(id) {
    if (!window.confirm('Batalkan pembayaran cicilan ini?')) return;
    try {
      await api.patch(`/cicilan/${id}/batal`);
      pilihCustomer(selected);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal batalkan');
    }
  }

  async function handleHapus(id) {
    if (!window.confirm('Hapus data cicilan ini?')) return;
    try {
      await api.delete(`/cicilan/${id}`);
      pilihCustomer(selected);
    } catch {
      alert('Gagal hapus cicilan');
    }
  }

  const totalCicilan = cicilan.reduce((s, c) => s + Number(c.nominal), 0);
  const totalTerbayar = Number(selected?.terbayar || 0);
  const sisaTagihan = Number(selected?.total || 0) - totalTerbayar;

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 96px)' }}>
      {/* Panel Kiri — daftar customer */}
      <div style={styles.panelKiri}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Pilih Customer</h2>
        </div>
        {loadingCust ? (
          <p style={{ padding: '16px', color: 'var(--muted)', fontSize: '13px' }}>Memuat...</p>
        ) : (
          <div style={styles.custList}>
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => pilihCustomer(c)}
                style={{
                  ...styles.custItem,
                  background: selected?.id === c.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                  borderLeft:
                    selected?.id === c.id ? '3px solid var(--gold)' : '3px solid transparent',
                }}
              >
                <div style={styles.custName}>{c.nama}</div>
                <div style={styles.custSub}>
                  {c.unit_kode || '-'} · {c.metode_bayar}
                </div>
                {c.cicilan_telat > 0 && (
                  <div style={styles.telatBadge}>⚠ {c.cicilan_telat} telat</div>
                )}
                {c.jatuh_tempo_berikutnya && (
                  <div style={styles.jatuhTempoBadge}>
                    Berikutnya:{' '}
                    {new Date(c.jatuh_tempo_berikutnya).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel Kanan — detail cicilan */}
      <div style={styles.panelKanan}>
        {!selected ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '48px' }}>💳</div>
            <p style={{ color: 'var(--muted)', marginTop: '12px' }}>
              Pilih customer untuk melihat riwayat cicilan
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={styles.dokHeader}>
              <div>
                <h2 style={styles.dokTitle}>{selected.nama}</h2>
                <p style={styles.dokSub}>
                  {selected.unit_kode} · {selected.metode_bayar}
                </p>
              </div>
              <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
                {showForm ? '✕ Tutup' : '+ Tambah Cicilan'}
              </button>
            </div>

            {/* Summary */}
            <div style={styles.summaryRow}>
              <div style={styles.summaryBox}>
                <p style={styles.summaryLabel}>Total Tagihan</p>
                <p style={{ ...styles.summaryVal, color: 'var(--g1)' }}>
                  {formatRp(selected.total)}
                </p>
              </div>
              <div style={styles.summaryBox}>
                <p style={styles.summaryLabel}>Cicilan Tercatat</p>
                <p style={{ ...styles.summaryVal, color: '#2980b9' }}>{formatRp(totalCicilan)}</p>
                <p
                  style={{
                    fontSize: '11px',
                    color: 'var(--muted)',
                    marginTop: '2px',
                  }}
                >
                  {cicilan.length} cicilan
                </p>
              </div>
              <div style={styles.summaryBox}>
                <p style={styles.summaryLabel}>Total Terbayar</p>
                <p style={{ ...styles.summaryVal, color: '#27ae60' }}>{formatRp(totalTerbayar)}</p>
                <p
                  style={{
                    fontSize: '11px',
                    color: 'var(--muted)',
                    marginTop: '2px',
                  }}
                >
                  termasuk DP & cicilan
                </p>
              </div>
              <div style={styles.summaryBox}>
                <p style={styles.summaryLabel}>Sisa Tagihan</p>
                <p
                  style={{
                    ...styles.summaryVal,
                    color: sisaTagihan > 0 ? '#e74c3c' : '#27ae60',
                  }}
                >
                  {formatRp(sisaTagihan)}
                </p>
                {sisaTagihan <= 0 && (
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#27ae60',
                      fontWeight: '700',
                      marginTop: '2px',
                    }}
                  >
                    ✓ Lunas
                  </p>
                )}
              </div>
            </div>
            {/* Form tambah cicilan */}
            {showForm && (
              <form onSubmit={handleTambah} style={styles.formCard}>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Keterangan</label>
                    <input
                      value={form.keterangan}
                      onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                      placeholder="Contoh: DP, Cicilan ke-1"
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Tanggal Jatuh Tempo *</label>
                    <input
                      type="date"
                      value={form.tgl_jatuh_tempo}
                      onChange={(e) => setForm({ ...form, tgl_jatuh_tempo: e.target.value })}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Nominal *</label>
                    <input
                      type="number"
                      value={form.nominal}
                      onChange={(e) => setForm({ ...form, nominal: e.target.value })}
                      placeholder="Contoh: 5000000"
                      required
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Metode</label>
                    <select
                      value={form.metode}
                      onChange={(e) => setForm({ ...form, metode: e.target.value })}
                      style={styles.input}
                    >
                      <option value="">-- Pilih --</option>
                      {['Transfer Bank', 'Cash', 'KPR', 'Lainnya'].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginTop: '12px',
                  }}
                >
                  <button type="button" onClick={() => setShowForm(false)} style={styles.btnBatal}>
                    Batal
                  </button>
                  <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                    {submitting ? 'Menyimpan...' : 'Simpan Cicilan'}
                  </button>
                </div>
              </form>
            )}

            {/* Tabel cicilan */}
            {loading ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Memuat cicilan...</p>
            ) : cicilan.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Belum ada data cicilan.</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {[
                        'Keterangan',
                        'Jatuh Tempo',
                        'Nominal',
                        'Tgl Bayar',
                        'Metode',
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
                    {cicilan.map((c) => (
                      <tr key={c.id} style={styles.tr}>
                        <td style={styles.td}>{c.keterangan || '-'}</td>
                        <td style={styles.td}>
                          {new Date(c.tgl_jatuh_tempo).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={{ ...styles.td, fontWeight: '600' }}>{formatRp(c.nominal)}</td>
                        <td style={styles.td}>
                          {c.tgl_bayar
                            ? new Date(c.tgl_bayar).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td style={styles.td}>{c.metode || '-'}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              background: STATUS_STYLE[c.status]?.bg,
                              color: STATUS_STYLE[c.status]?.color,
                            }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {/* Form bayar inline */}
                          {showBayarId === c.id ? (
                            <div
                              style={{
                                display: 'flex',
                                gap: '5px',
                                alignItems: 'center',
                              }}
                            >
                              <input
                                type="date"
                                value={tglBayar}
                                onChange={(e) => setTglBayar(e.target.value)}
                                style={{
                                  ...styles.input,
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  width: '130px',
                                }}
                              />
                              <button
                                onClick={() => handleBayar(c.id)}
                                disabled={submitting}
                                style={styles.btnSelesai}
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setShowBayarId(null)}
                                style={styles.btnBatalKecil}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '5px' }}>
                              {c.status === 'Belum' && (
                                <button
                                  onClick={() => {
                                    setShowBayarId(c.id);
                                    setTglBayar(new Date().toISOString().split('T')[0]);
                                  }}
                                  style={styles.btnSelesai}
                                >
                                  Bayar
                                </button>
                              )}
                              {c.status !== 'Belum' && (
                                <button
                                  onClick={() => handleBatal(c.id)}
                                  style={styles.btnBatalKecil}
                                >
                                  Batal
                                </button>
                              )}
                              <button onClick={() => handleHapus(c.id)} style={styles.btnHapus}>
                                Hapus
                              </button>
                            </div>
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
      </div>
    </div>
  );
}

function formatRp(angka) {
  if (!angka && angka !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

const styles = {
  panelKiri: {
    width: '280px',
    flexShrink: 0,
    background: 'var(--surface)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-soft)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid var(--border)',
  },
  panelHeader: {
    padding: '20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface-soft)',
  },
  panelTitle: { fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: 0 },
  custList: { overflowY: 'auto', flex: 1, padding: '8px' },
  custItem: {
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: '12px',
    marginBottom: '4px',
  },
  custName: { fontSize: '14px', fontWeight: '700', color: 'var(--text)' },
  custSub: { fontSize: '12px', color: 'var(--muted)', marginTop: '4px' },
  telatBadge: {
    fontSize: '11px',
    color: 'var(--red)',
    fontWeight: '700',
    marginTop: '6px',
  },
  jatuhTempoBadge: {
    fontSize: '11px',
    color: 'var(--muted)',
    marginTop: '4px',
  },
  panelKanan: {
    flex: 1,
    background: 'var(--surface)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-soft)',
    padding: '32px',
    overflowY: 'auto',
    border: '1px solid var(--border)',
  },
  emptyState: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dokHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  dokTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  dokSub: { fontSize: '14px', color: 'var(--muted)', marginTop: '4px' },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryBox: {
    background: 'var(--surface-soft)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border)',
  },
  summaryLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  summaryVal: { fontSize: '20px', fontWeight: '800' },
  formCard: {
    background: 'var(--surface-soft)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid var(--border)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  },
  input: {
    padding: '10px 14px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--sans)',
    outline: 'none',
  },
  tableWrapper: {
    overflow: 'auto',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    background: 'var(--surface-soft)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '14px 16px', fontSize: '14px', color: 'var(--text)' },
  badge: {
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
  },
  btnPrimary: {
    padding: '10px 20px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'var(--sans)',
    transition: 'all 0.2s ease',
  },
  btnBatal: {
    padding: '10px 20px',
    background: 'var(--surface-soft)',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'var(--sans)',
  },
  btnSelesai: {
    padding: '6px 14px',
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
  },
  btnBatalKecil: {
    padding: '6px 12px',
    background: 'var(--surface-soft)',
    color: 'var(--muted)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  btnHapus: {
    padding: '6px 12px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--red)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
};
