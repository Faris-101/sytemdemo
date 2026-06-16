import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const KATEGORI_MASUK = ['Penjualan Unit', 'DP', 'Angsuran', 'Pelunasan', 'Lainnya'];
const KATEGORI_KELUAR = [
  'Konstruksi & Material',
  'Gaji & Honor',
  'Marketing & Iklan',
  'Operasional',
  'Pajak',
  'Lainnya',
];

const FORM_AWAL = {
  jenis: 'masuk',
  tgl: '',
  kategori: '',
  keterangan: '',
  nominal: '',
  catatan: '',
};

export default function Keuangan() {
  const { user } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(FORM_AWAL);
  const [editId, setEditId] = useState(null);
  const [filterJenis, setFilterJenis] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const bisaHapus = user?.role === 'admin';
  const kategoriOptions = form.jenis === 'masuk' ? KATEGORI_MASUK : KATEGORI_KELUAR;

  useEffect(() => {
    let ignore = false;
    const params = filterJenis ? `?jenis=${filterJenis}` : '';

    Promise.all([api.get(`/keuangan${params}`), api.get('/keuangan/summary')])
      .then(([transaksiRes, summaryRes]) => {
        if (ignore) return;
        setTransaksi(transaksiRes.data);
        setSummary(summaryRes.data);
      })
      .catch(() => {
        if (!ignore) setError('Gagal memuat data keuangan');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [filterJenis]);

  async function fetchAll() {
    try {
      const params = filterJenis ? `?jenis=${filterJenis}` : '';
      const [transaksiRes, summaryRes] = await Promise.all([
        api.get(`/keuangan${params}`),
        api.get('/keuangan/summary'),
      ]);
      setTransaksi(transaksiRes.data);
      setSummary(summaryRes.data);
    } catch {
      setError('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  }

  function bukaTambah() {
    setForm(FORM_AWAL);
    setEditId(null);
    setError('');
    setShowModal(true);
  }

  function bukaEdit(item) {
    setForm({
      jenis: item.jenis,
      tgl: item.tgl ? item.tgl.split('T')[0] : '',
      kategori: item.kategori || '',
      keterangan: item.keterangan || '',
      nominal: item.nominal || '',
      catatan: item.catatan || '',
    });
    setEditId(item.id);
    setError('');
    setShowModal(true);
  }

  function tutupModal() {
    setShowModal(false);
    setForm(FORM_AWAL);
    setEditId(null);
    setError('');
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'jenis') {
      setForm({ ...form, jenis: value, kategori: '' });
      return;
    }
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      ...form,
      nominal: Number(form.nominal),
    };

    try {
      if (editId) {
        await api.put(`/keuangan/${editId}`, payload);
      } else {
        await api.post('/keuangan', payload);
      }
      tutupModal();
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapus(item) {
    if (!window.confirm(`Hapus transaksi ${item.keterangan || item.kategori}?`)) return;

    try {
      await api.delete(`/keuangan/${item.id}`);
      await fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus transaksi');
    }
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Keuangan</h1>
          <p style={styles.pageSubtitle}>{transaksi.length} transaksi ditemukan</p>
        </div>
        <button onClick={bukaTambah} style={styles.btnPrimary}>
          + Catat Transaksi
        </button>
      </div>

      {summary && (
        <div style={styles.summaryGrid}>
          <SummaryCard
            label="Total Masuk"
            value={formatRupiah(summary.total_masuk)}
            color="var(--green)"
            icon="+"
          />
          <SummaryCard
            label="Total Keluar"
            value={formatRupiah(summary.total_keluar)}
            color="var(--red)"
            icon="-"
          />
          <SummaryCard
            label="Laba Kotor"
            value={formatRupiah(summary.laba_kotor)}
            color={summary.laba_kotor >= 0 ? 'var(--g1)' : 'var(--red)'}
            icon="="
          />
          <SummaryCard
            label="Total Piutang"
            value={formatRupiah(summary.total_piutang)}
            color="var(--gold)"
            icon="!"
          />
        </div>
      )}

      <div style={styles.filterBar}>
        <span style={styles.filterLabel}>Filter:</span>
        {[
          { val: '', label: 'Semua' },
          { val: 'masuk', label: 'Pemasukan' },
          { val: 'keluar', label: 'Pengeluaran' },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilterJenis(f.val)}
            style={{
              ...styles.filterBtn,
              backgroundColor: filterJenis === f.val ? 'var(--g1)' : 'var(--surface)',
              color: filterJenis === f.val ? 'var(--white)' : 'var(--muted)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && !showModal && <p style={styles.errorText}>{error}</p>}

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat data...</p>
      ) : transaksi.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Belum ada transaksi.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  'Tanggal',
                  'Jenis',
                  'Kategori',
                  'Keterangan',
                  'Nominal',
                  'Dicatat Oleh',
                  'Aksi',
                ].map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transaksi.map((item) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{formatTanggal(item.tgl)}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          item.jenis === 'masuk'
                            ? 'var(--success-soft)'
                            : 'rgba(248, 215, 218, 0.4)',
                        color: item.jenis === 'masuk' ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {item.jenis === 'masuk' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td style={styles.td}>{item.kategori || '-'}</td>
                  <td style={styles.td}>
                    <strong>{item.keterangan || '-'}</strong>
                    {item.catatan && <div style={styles.subText}>{item.catatan}</div>}
                  </td>
                  <td style={styles.td}>
                    <strong
                      style={{
                        color: item.jenis === 'masuk' ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {formatRupiah(item.nominal)}
                    </strong>
                  </td>
                  <td style={styles.td}>{item.created_by || '-'}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => bukaEdit(item)} style={styles.btnEdit}>
                        Edit
                      </button>
                      {bisaHapus && (
                        <button onClick={() => handleHapus(item)} style={styles.btnHapus}>
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editId ? 'Edit Transaksi' : 'Catat Transaksi'}</h2>
              <button onClick={tutupModal} style={styles.btnClose}>
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.formGrid}>
                <Field label="Jenis *">
                  <select
                    name="jenis"
                    value={form.jenis}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="masuk">Pemasukan</option>
                    <option value="keluar">Pengeluaran</option>
                  </select>
                </Field>

                <Field label="Tanggal *">
                  <input
                    name="tgl"
                    type="date"
                    value={form.tgl}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </Field>

                <Field label="Kategori">
                  <select
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriOptions.map((kategori) => (
                      <option key={kategori} value={kategori}>
                        {kategori}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Nominal *">
                  <input
                    name="nominal"
                    type="number"
                    min="1"
                    value={form.nominal}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: 5000000"
                    style={styles.input}
                  />
                </Field>
              </div>

              <Field label="Keterangan">
                <input
                  name="keterangan"
                  value={form.keterangan}
                  onChange={handleChange}
                  placeholder="Contoh: DP Unit A-01"
                  style={styles.input}
                />
              </Field>

              <Field label="Catatan">
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleChange}
                  rows={3}
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </Field>

              {error && <p style={styles.errorText}>{error}</p>}

              <div style={styles.modalFooter}>
                <button type="button" onClick={tutupModal} style={styles.btnSecondary}>
                  Batal
                </button>
                <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                  {submitting ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Catat Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, icon }) {
  return (
    <div style={styles.summaryCard}>
      <div style={{ ...styles.summaryIcon, color }}>{icon}</div>
      <div>
        <p style={styles.cardLabel}>{label}</p>
        <p style={{ ...styles.cardValue, color }}>{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function formatRupiah(angka) {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

function formatTanggal(tanggal) {
  if (!tanggal) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(tanggal));
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: 'var(--shadow-soft)',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  summaryIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'var(--surface-soft)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '18px',
  },
  cardLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  cardValue: { fontSize: '20px', fontWeight: '800', margin: 0 },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterLabel: { fontSize: '13px', color: 'var(--muted)' },
  filterBtn: {
    padding: '8px 16px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '13px',
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
    backgroundColor: 'var(--surface-soft)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '14px 16px', fontSize: '14px', color: 'var(--text)' },
  subText: { fontSize: '12px', color: 'var(--muted)', marginTop: '2px' },
  badge: {
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
  },
  btnPrimary: {
    padding: '10px 24px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
  },
  btnSecondary: {
    padding: '10px 24px',
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  btnEdit: {
    padding: '6px 14px',
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnHapus: {
    padding: '6px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--red)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '620px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  btnClose: {
    background: 'var(--surface-soft)',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    display: 'grid',
    placeItems: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    color: 'var(--muted)',
  },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  fieldLabel: { fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' },
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
  errorText: { color: 'var(--red)', fontSize: '13px', fontWeight: '600', margin: '0 0 16px' },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
};
