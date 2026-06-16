import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const STATUS_BAYAR_STYLE = {
  Menunggu: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  Diverifikasi: { bg: 'var(--success-soft)', color: 'var(--success)' },
  Ditolak: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
};

export default function CustomerPortal() {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';
  const isAdmin = ['admin', 'direktur'].includes(user?.role);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [myData, setMyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFormBayar, setShowFormBayar] = useState(false);
  const [showBuatAkun, setShowBuatAkun] = useState(null);
  const [formBayar, setFormBayar] = useState({
    nominal: '',
    tgl_bayar: '',
    metode: 'Transfer',
    keterangan: '',
  });
  const [formAkun, setFormAkun] = useState({
    nama: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [buktiFile, setBuktiFile] = useState(null);

  // ─── Mode Customer ───────────────────────────────────────
  const fetchMyData = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, payRes] = await Promise.all([api.get('/customers/me'), api.get('/payments')]);
      setMyData(custRes.data);
      setPayments(payRes.data);
    } catch {
      console.error('Gagal fetch data customer');
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleSubmitBayar(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formBayar).forEach(([k, v]) => fd.append(k, v));
      if (buktiFile) fd.append('bukti', buktiFile);
      await api.post('/payments', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowFormBayar(false);
      setFormBayar({
        nominal: '',
        tgl_bayar: '',
        metode: 'Transfer',
        keterangan: '',
      });
      setBuktiFile(null);
      fetchMyData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal submit pembayaran');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Mode Admin/Marketing ────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch {
      console.error('Gagal fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isCustomer) fetchMyData();
    else fetchCustomers();
  }, [isCustomer, fetchMyData, fetchCustomers]);

  async function fetchPayments(custId) {
    const res = await api.get(`/payments?customer_id=${custId}`);
    setPayments(res.data);
  }

  async function handleVerifikasi(payId, status) {
    try {
      await api.patch(`/payments/${payId}/verifikasi`, { status });
      fetchPayments(selectedCustomer.id);
      fetchCustomers();
    } catch {
      alert('Gagal verifikasi');
    }
  }

  async function handleBuatAkun(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register-customer', {
        ...formAkun,
        customer_id: showBuatAkun.id,
      });
      setShowBuatAkun(null);
      setFormAkun({ nama: '', email: '', password: '' });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal buat akun');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── RENDER Customer ─────────────────────────────────────
  if (isCustomer) {
    if (loading) return <p style={{ color: 'var(--muted)' }}>Memuat...</p>;
    if (!myData) return <p style={{ color: 'var(--muted)' }}>Data tidak ditemukan.</p>;

    const persen =
      myData.total > 0 ? Math.min(100, Math.round((myData.terbayar / myData.total) * 100)) : 0;
    const sisa = myData.total - myData.terbayar;

    return (
      <div>
        <h1 style={styles.pageTitle}>Portal Saya</h1>

        {/* Kartu Info Unit */}
        <div style={styles.infoCard}>
          <div style={styles.infoGrid}>
            <div>
              <div style={styles.infoLabel}>Unit</div>
              <div style={styles.infoValue}>{myData.unit_kode}</div>
            </div>
            <div>
              <div style={styles.infoLabel}>Tipe</div>
              <div style={styles.infoValue}>{myData.tipe || '-'}</div>
            </div>
            <div>
              <div style={styles.infoLabel}>Total Harga</div>
              <div style={styles.infoValue}>{formatRp(myData.total)}</div>
            </div>
            <div>
              <div style={styles.infoLabel}>Metode</div>
              <div style={styles.infoValue}>{myData.metode_bayar}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                marginBottom: '6px',
              }}
            >
              <span style={{ color: 'var(--muted)' }}>
                Terbayar: <strong style={{ color: '#27ae60' }}>{formatRp(myData.terbayar)}</strong>
              </span>
              <span style={{ color: 'var(--muted)' }}>
                Sisa: <strong style={{ color: '#e74c3c' }}>{formatRp(sisa)}</strong>
              </span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${persen}%` }} />
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--muted)',
                marginTop: '6px',
              }}
            >
              {persen}% terbayar
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button onClick={() => setShowFormBayar(!showFormBayar)} style={styles.btnPrimary}>
              {showFormBayar ? '✕ Batal' : '+ Submit Pembayaran'}
            </button>
          </div>
        </div>

        {/* Form Submit Pembayaran */}
        {showFormBayar && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Submit Pembayaran</h3>
            <form onSubmit={handleSubmitBayar}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Nominal (Rp) *</label>
                  <input
                    type="number"
                    value={formBayar.nominal}
                    onChange={(e) => setFormBayar({ ...formBayar, nominal: e.target.value })}
                    required
                    style={styles.input}
                    placeholder="Jumlah yang dibayarkan"
                  />
                </div>
                <div>
                  <label style={styles.label}>Tanggal Bayar *</label>
                  <input
                    type="date"
                    value={formBayar.tgl_bayar}
                    onChange={(e) => setFormBayar({ ...formBayar, tgl_bayar: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Metode</label>
                  <select
                    value={formBayar.metode}
                    onChange={(e) => setFormBayar({ ...formBayar, metode: e.target.value })}
                    style={styles.input}
                  >
                    {['Transfer', 'Cash', 'KPR', 'Lainnya'].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Upload Bukti</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setBuktiFile(e.target.files[0])}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <label style={styles.label}>Keterangan</label>
                <textarea
                  value={formBayar.keterangan}
                  onChange={(e) => setFormBayar({ ...formBayar, keterangan: e.target.value })}
                  rows={2}
                  style={{ ...styles.input, resize: 'vertical' }}
                  placeholder="Misal: Cicilan ke-3, angsuran bulan Juni..."
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '14px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowFormBayar(false)}
                  style={styles.btnSecondary}
                >
                  Batal
                </button>
                <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                  {submitting ? 'Mengirim...' : 'Kirim Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Riwayat Pembayaran */}
        <h2 style={{ ...styles.pageTitle, fontSize: '16px', marginTop: '24px' }}>
          Riwayat Pembayaran
        </h2>
        {payments.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Belum ada pembayaran.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Tanggal', 'Nominal', 'Metode', 'Keterangan', 'Bukti', 'Status'].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>{formatTgl(p.tgl_bayar)}</td>
                    <td style={styles.td}>
                      <strong>{formatRp(p.nominal)}</strong>
                    </td>
                    <td style={styles.td}>{p.metode}</td>
                    <td style={styles.td}>{p.keterangan || '-'}</td>
                    <td style={styles.td}>
                      {p.bukti_url ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL}${p.bukti_url}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--g1)', fontWeight: '600' }}
                        >
                          Lihat
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: STATUS_BAYAR_STYLE[p.status]?.bg,
                          color: STATUS_BAYAR_STYLE[p.status]?.color,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ─── RENDER Admin/Marketing ──────────────────────────────
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: selectedCustomer ? '320px 1fr' : '1fr',
        gap: '20px',
      }}
    >
      {/* Panel Kiri — List Customer */}
      <div>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Portal Customer</h1>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Memuat...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {customers.map((c) => {
              const persen =
                c.total > 0 ? Math.min(100, Math.round((c.terbayar / c.total) * 100)) : 0;
              const isSelected = selectedCustomer?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomer(c);
                    fetchPayments(c.id);
                  }}
                  style={{
                    ...styles.customerCard,
                    border: isSelected ? '2px solid var(--g1)' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--g1)' }}>{c.nama}</strong>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          c.status === 'Lunas' ? 'var(--success-soft)' : 'var(--warning-soft)',
                        color: c.status === 'Lunas' ? 'var(--success)' : 'var(--warning)',
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      marginTop: '3px',
                    }}
                  >
                    Unit {c.unit_kode} · {c.metode_bayar}
                  </div>
                  <div
                    style={{
                      ...styles.progressTrack,
                      marginTop: '8px',
                      height: '5px',
                    }}
                  >
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${persen}%`,
                        height: '5px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      marginTop: '3px',
                    }}
                  >
                    {persen}% · {formatRp(c.terbayar)} dari {formatRp(c.total)}
                  </div>
                  {!c.user_id && isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBuatAkun(c);
                        setFormAkun({ nama: c.nama, email: '', password: '' });
                      }}
                      style={{
                        ...styles.btnWarning,
                        marginTop: '8px',
                        fontSize: '11px',
                        padding: '4px 10px',
                      }}
                    >
                      + Buat Akun Login
                    </button>
                  )}
                  {c.user_id && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#27ae60',
                        marginTop: '4px',
                      }}
                    >
                      ✓ Sudah punya akun
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel Kanan — Detail Pembayaran */}
      {selectedCustomer && (
        <div>
          <div style={styles.pageHeader}>
            <div>
              <h2 style={{ ...styles.pageTitle, fontSize: '18px' }}>{selectedCustomer.nama}</h2>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Unit {selectedCustomer.unit_kode} · {selectedCustomer.hp}
              </div>
            </div>
            <button onClick={() => setSelectedCustomer(null)} style={styles.btnSecondary}>
              ✕ Tutup
            </button>
          </div>

          {/* Ringkasan */}
          <div style={{ ...styles.infoCard, marginBottom: '20px' }}>
            <div style={styles.infoGrid}>
              <div>
                <div style={styles.infoLabel}>Total</div>
                <div style={styles.infoValue}>{formatRp(selectedCustomer.total)}</div>
              </div>
              <div>
                <div style={styles.infoLabel}>Terbayar</div>
                <div style={{ ...styles.infoValue, color: '#27ae60' }}>
                  {formatRp(selectedCustomer.terbayar)}
                </div>
              </div>
              <div>
                <div style={styles.infoLabel}>Sisa</div>
                <div style={{ ...styles.infoValue, color: '#e74c3c' }}>
                  {formatRp(selectedCustomer.total - selectedCustomer.terbayar)}
                </div>
              </div>
              <div>
                <div style={styles.infoLabel}>Status</div>
                <div style={styles.infoValue}>{selectedCustomer.status}</div>
              </div>
            </div>
          </div>

          {/* Tabel Pembayaran */}
          <h3
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--g1)',
              marginBottom: '12px',
            }}
          >
            Riwayat Pembayaran
          </h3>
          {payments.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Belum ada pembayaran.</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Tanggal', 'Nominal', 'Metode', 'Keterangan', 'Bukti', 'Status', 'Aksi'].map(
                      (h) => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={styles.tr}>
                      <td style={styles.td}>{formatTgl(p.tgl_bayar)}</td>
                      <td style={styles.td}>
                        <strong>{formatRp(p.nominal)}</strong>
                      </td>
                      <td style={styles.td}>{p.metode}</td>
                      <td style={styles.td}>{p.keterangan || '-'}</td>
                      <td style={styles.td}>
                        {p.bukti_url ? (
                          <a
                            href={`${import.meta.env.VITE_API_URL}${p.bukti_url}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--g1)', fontWeight: '600' }}
                          >
                            Lihat
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            background: STATUS_BAYAR_STYLE[p.status]?.bg,
                            color: STATUS_BAYAR_STYLE[p.status]?.color,
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {p.status === 'Menunggu' && isAdmin && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={() => handleVerifikasi(p.id, 'Diverifikasi')}
                              style={styles.btnConvert}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleVerifikasi(p.id, 'Ditolak')}
                              style={styles.btnBatal}
                            >
                              ✕
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
        </div>
      )}

      {/* Modal Buat Akun */}
      {showBuatAkun && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '420px' }}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Buat Akun Login</h2>
              <button onClick={() => setShowBuatAkun(null)} style={styles.btnClose}>
                ✕
              </button>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                marginBottom: '16px',
              }}
            >
              Untuk: <strong>{showBuatAkun.nama}</strong> · Unit {showBuatAkun.unit_kode}
            </div>
            <form onSubmit={handleBuatAkun}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div>
                  <label style={styles.label}>Nama</label>
                  <input
                    value={formAkun.nama}
                    onChange={(e) => setFormAkun({ ...formAkun, nama: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={formAkun.email}
                    onChange={(e) => setFormAkun({ ...formAkun, email: e.target.value })}
                    required
                    style={styles.input}
                    placeholder="email@customer.com"
                  />
                </div>
                <div>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={formAkun.password}
                    onChange={(e) => setFormAkun({ ...formAkun, password: e.target.value })}
                    required
                    style={styles.input}
                    placeholder="Min. 8 karakter"
                    minLength={8}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowBuatAkun(null)}
                  style={{ ...styles.btnSecondary, flex: 1 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...styles.btnPrimary, flex: 2 }}
                >
                  {submitting ? 'Membuat...' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRp(n) {
  if (!n && n !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}
function formatTgl(tgl) {
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  infoCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text)',
    marginTop: '4px',
  },
  progressTrack: {
    backgroundColor: 'var(--bg)',
    borderRadius: '999px',
    height: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border)',
  },
  progressBar: {
    background: 'var(--accent)',
    height: '8px',
    borderRadius: '999px',
    transition: 'width 0.5s ease',
  },
  formCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '22px',
    marginBottom: '20px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
  },
  formTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '16px',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
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
    fontFamily: 'var(--sans)',
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
  td: { padding: '12px 16px', fontSize: '13px', color: 'var(--text)' },
  badge: {
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
  },
  customerCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    transition: 'all 0.2s ease',
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
  btnConvert: {
    padding: '5px 10px',
    background: 'rgba(39, 174, 96, 0.1)',
    color: '#27ae60',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
  },
  btnBatal: {
    padding: '5px 10px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#e74c3c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
  },
  btnWarning: {
    padding: '6px 12px',
    background: 'rgba(243, 156, 18, 0.1)',
    color: '#f39c12',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
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
    alignItems: 'center',
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
