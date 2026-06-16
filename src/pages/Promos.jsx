import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const TIPE_STYLE = {
  Persen: { bg: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' },
  Nominal: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' },
};

const FORM_AWAL = {
  kode: '',
  nama: '',
  tipe: 'Persen',
  nilai: '',
  min_harga: '',
  maks_diskon: '',
  kuota: '',
  tgl_mulai: '',
  tgl_akhir: '',
  keterangan: '',
};

export default function Promos() {
  const { user } = useAuth();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_AWAL);
  const [submitting, setSubmitting] = useState(false);
  const [showUsage, setShowUsage] = useState(null);
  const [usageData, setUsageData] = useState([]);
  const isAdmin = ['admin', 'direktur'].includes(user?.role);

  useEffect(() => {
    fetchPromos();
  }, []);

  async function fetchPromos() {
    setLoading(true);
    try {
      const res = await api.get('/promos');
      setPromos(res.data);
    } catch {
      console.error('Gagal fetch promos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/promos', form);
      setForm(FORM_AWAL);
      setShowForm(false);
      fetchPromos();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal buat promo');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id) {
    try {
      await api.patch(`/promos/${id}/toggle`);
      fetchPromos();
    } catch {
      alert('Gagal update status');
    }
  }

  async function handleDelete(id, nama) {
    if (!window.confirm(`Hapus promo "${nama}"?`)) return;
    try {
      await api.delete(`/promos/${id}`);
      fetchPromos();
    } catch {
      alert('Gagal hapus promo');
    }
  }

  async function handleShowUsage(promo) {
    setShowUsage(promo);
    try {
      const res = await api.get(`/promos/${promo.id}/usage`);
      setUsageData(res.data);
    } catch {
      setUsageData([]);
    }
  }

  function statusPromo(p) {
    const today = new Date().toISOString().split('T')[0];
    if (!p.aktif) return { label: 'Nonaktif', color: 'var(--muted)', bg: 'var(--surface-soft)' };
    if (today < p.tgl_mulai)
      return { label: 'Belum Mulai', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    if (today > p.tgl_akhir)
      return { label: 'Berakhir', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
    return { label: 'Aktif', color: 'var(--accent)', bg: 'var(--accent-soft)' };
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Diskon & Promo</h1>
          <p style={styles.pageSubtitle}>{promos.length} promo terdaftar</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
            {showForm ? '✕ Tutup' : '+ Buat Promo'}
          </button>
        )}
      </div>

      {/* Form Buat Promo */}
      {showForm && isAdmin && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Buat Promo Baru</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid3}>
              <div>
                <label style={styles.label}>Kode Promo *</label>
                <input
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                  required
                  placeholder="LEBARAN2025"
                  style={styles.input}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.label}>Nama Promo *</label>
                <input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  required
                  placeholder="Promo Lebaran 2025"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ ...styles.formGrid3, marginTop: '12px' }}>
              <div>
                <label style={styles.label}>Tipe Diskon</label>
                <select
                  value={form.tipe}
                  onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                  style={styles.input}
                >
                  <option value="Persen">Persen (%)</option>
                  <option value="Nominal">Nominal (Rp)</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>
                  Nilai {form.tipe === 'Persen' ? '(%)' : '(Rp)'} *
                </label>
                <input
                  type="number"
                  value={form.nilai}
                  onChange={(e) => setForm({ ...form, nilai: e.target.value })}
                  required
                  placeholder={form.tipe === 'Persen' ? '5' : '10000000'}
                  style={styles.input}
                />
              </div>
              {form.tipe === 'Persen' && (
                <div>
                  <label style={styles.label}>Maks. Diskon (Rp)</label>
                  <input
                    type="number"
                    value={form.maks_diskon}
                    onChange={(e) => setForm({ ...form, maks_diskon: e.target.value })}
                    placeholder="Opsional"
                    style={styles.input}
                  />
                </div>
              )}
            </div>

            <div style={{ ...styles.formGrid3, marginTop: '12px' }}>
              <div>
                <label style={styles.label}>Min. Harga (Rp)</label>
                <input
                  type="number"
                  value={form.min_harga}
                  onChange={(e) => setForm({ ...form, min_harga: e.target.value })}
                  placeholder="Opsional"
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Kuota (pemakaian)</label>
                <input
                  type="number"
                  value={form.kuota}
                  onChange={(e) => setForm({ ...form, kuota: e.target.value })}
                  placeholder="Kosong = unlimited"
                  style={styles.input}
                />
              </div>
              <div /> {/* spacer */}
              <div>
                <label style={styles.label}>Tanggal Mulai *</label>
                <input
                  type="date"
                  value={form.tgl_mulai}
                  onChange={(e) => setForm({ ...form, tgl_mulai: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Tanggal Akhir *</label>
                <input
                  type="date"
                  value={form.tgl_akhir}
                  onChange={(e) => setForm({ ...form, tgl_akhir: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={styles.label}>Keterangan</label>
              <textarea
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                rows={2}
                style={{ ...styles.input, resize: 'vertical' }}
                placeholder="Syarat & ketentuan promo..."
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
              <button type="button" onClick={() => setShowForm(false)} style={styles.btnSecondary}>
                Batal
              </button>
              <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                {submitting ? 'Menyimpan...' : 'Simpan Promo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Promo */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : promos.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '40px' }}>🏷️</div>
          <p style={{ color: 'var(--muted)', marginTop: '10px' }}>Belum ada promo.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {promos.map((p) => {
            const status = statusPromo(p);
            const sisa = p.kuota !== null ? Math.max(0, p.kuota - p.total_pemakaian) : null;

            return (
              <div
                key={p.id}
                style={{
                  ...styles.promoCard,
                  opacity: !p.aktif ? 0.6 : 1,
                }}
              >
                {/* Badge kode */}
                <div style={styles.promoTop}>
                  <span style={styles.promoKode}>{p.kode}</span>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: status.bg,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                <div style={styles.promNama}>{p.nama}</div>

                {/* Nilai diskon */}
                <div style={styles.promoNilai}>
                  <span
                    style={{
                      ...styles.tipeBadge,
                      backgroundColor: TIPE_STYLE[p.tipe]?.bg,
                      color: TIPE_STYLE[p.tipe]?.color,
                    }}
                  >
                    {p.tipe === 'Persen' ? `${p.nilai}% OFF` : `- ${formatRp(p.nilai)}`}
                  </span>
                  {p.tipe === 'Persen' && p.maks_diskon && (
                    <span style={styles.subInfo}>maks. {formatRp(p.maks_diskon)}</span>
                  )}
                </div>

                {/* Info tambahan */}
                <div style={styles.promoMeta}>
                  <div>
                    📅 {formatTgl(p.tgl_mulai)} – {formatTgl(p.tgl_akhir)}
                  </div>
                  {p.min_harga > 0 && <div>🏷️ Min. {formatRp(p.min_harga)}</div>}
                  <div>
                    📊 Dipakai: <strong>{p.total_pemakaian}x</strong>
                    {p.kuota !== null && ` · Sisa: ${sisa}`}
                  </div>
                  <div>
                    💰 Total diskon: <strong>{formatRp(p.total_diskon_diberikan)}</strong>
                  </div>
                </div>

                {/* Keterangan */}
                {p.keterangan && <div style={styles.promoNote}>{p.keterangan}</div>}

                {/* Aksi */}
                <div style={styles.promoActions}>
                  <button onClick={() => handleShowUsage(p)} style={styles.btnInfo}>
                    📋 Riwayat
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleToggle(p.id)}
                        style={p.aktif ? styles.btnWarning : styles.btnSuccess}
                      >
                        {p.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button onClick={() => handleDelete(p.id, p.nama)} style={styles.btnDanger}>
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Riwayat Pemakaian */}
      {showUsage && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Riwayat Pemakaian</h2>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {showUsage.kode} — {showUsage.nama}
                </div>
              </div>
              <button onClick={() => setShowUsage(null)} style={styles.btnClose}>
                ✕
              </button>
            </div>

            {usageData.length === 0 ? (
              <p
                style={{
                  color: 'var(--muted)',
                  textAlign: 'center',
                  padding: '30px 0',
                }}
              >
                Belum ada pemakaian.
              </p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Nama', 'Unit', 'Harga Asal', 'Diskon', 'Harga Akhir', 'Tanggal'].map(
                        (h) => (
                          <th key={h} style={styles.th}>
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {usageData.map((u) => (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.td}>{u.nama_calon}</td>
                        <td style={styles.td}>
                          <strong>{u.unit_kode}</strong>
                        </td>
                        <td style={styles.td}>{formatRp(u.harga_asal)}</td>
                        <td
                          style={{
                            ...styles.td,
                            color: 'var(--accent)',
                            fontWeight: '700',
                          }}
                        >
                          -{formatRp(u.diskon_rp)}
                        </td>
                        <td style={styles.td}>{formatRp(u.harga_akhir)}</td>
                        <td style={styles.td}>
                          {new Date(u.used_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
  formGrid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
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
    transition: 'border-color 0.2s ease',
    outline: 'none',
  },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  promoCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  promoTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoKode: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text)',
    letterSpacing: '0.06em',
    fontFamily: 'monospace',
  },
  promNama: { fontSize: '14px', fontWeight: '700', color: 'var(--text)' },
  promoNilai: { display: 'flex', alignItems: 'center', gap: '8px' },
  tipeBadge: {
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '800',
  },
  subInfo: { fontSize: '11px', color: 'var(--muted)' },
  promoMeta: {
    fontSize: '12px',
    color: 'var(--muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    lineHeight: 1.6,
  },
  promoNote: {
    fontSize: '12px',
    color: 'var(--muted)',
    fontStyle: 'italic',
    backgroundColor: 'var(--surface-soft)',
    borderRadius: '8px',
    padding: '8px 12px',
    border: '1px solid var(--border)',
  },
  promoActions: {
    display: 'flex',
    gap: '6px',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
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
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px var(--accent-soft)',
  },
  btnSecondary: {
    padding: '10px 24px',
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  btnInfo: {
    padding: '6px 14px',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    color: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnSuccess: {
    padding: '6px 14px',
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnWarning: {
    padding: '6px 14px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnDanger: {
    padding: '6px 14px',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'var(--surface)',
    borderRadius: '20px',
    width: '95%',
    maxWidth: '640px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
};
