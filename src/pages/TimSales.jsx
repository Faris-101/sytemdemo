import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const ROLE_TIM = ['Sales', 'Marketing', 'Team Leader', 'Manager'];

const MEDAL = ['🥇', '🥈', '🥉'];

const FORM_AWAL = {
  nama: '',
  username: '',
  hp: '',
  email: '',
  role_tim: 'Sales',
  target_bulanan: '',
  area: '',
  status: 'Aktif',
  catatan: '',
};

export default function TimSales() {
  const { user } = useAuth();
  const [tim, setTim] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState(FORM_AWAL);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const bisaEdit = ['admin', 'direktur'].includes(user?.role);

  useEffect(() => {
    fetchTim();
  }, []);

  async function fetchTim() {
    setLoading(true);
    try {
      const res = await api.get('/timsales');
      setTim(res.data);
    } catch {
      console.error('Gagal fetch tim');
    } finally {
      setLoading(false);
    }
  }

  async function bukaDetail(anggota) {
    try {
      const res = await api.get(`/timsales/${anggota.id}`);
      setShowDetail(res.data);
    } catch {
      alert('Gagal load detail');
    }
  }

  function bukaTambah() {
    setForm(FORM_AWAL);
    setEditId(null);
    setShowModal(true);
  }

  function bukaEdit(anggota) {
    setForm({
      nama: anggota.nama,
      username: anggota.username || '',
      hp: anggota.hp || '',
      email: anggota.email || '',
      role_tim: anggota.role_tim,
      target_bulanan: anggota.target_bulanan || '',
      area: anggota.area || '',
      status: anggota.status,
      catatan: anggota.catatan || '',
    });
    setEditId(anggota.id);
    setShowModal(true);
  }

  function tutupModal() {
    setShowModal(false);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editId) {
        await api.put(`/timsales/${editId}`, form);
      } else {
        await api.post('/timsales', form);
      }
      tutupModal();
      fetchTim();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapus(anggota) {
    if (!window.confirm(`Hapus ${anggota.nama} dari tim?`)) return;
    try {
      await api.delete(`/timsales/${anggota.id}`);
      fetchTim();
    } catch {
      alert('Gagal hapus anggota');
    }
  }

  // Pisahkan aktif & nonaktif
  const timAktif = tim.filter((t) => t.status === 'Aktif');
  const timNonaktif = tim.filter((t) => t.status === 'Nonaktif');

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Tim Sales</h1>
          <p style={styles.pageSubtitle}>{timAktif.length} anggota aktif</p>
        </div>
        {bisaEdit && (
          <button onClick={bukaTambah} style={styles.btnPrimary}>
            + Tambah Anggota
          </button>
        )}
      </div>

      {/* Leaderboard */}
      {!loading && timAktif.length > 0 && (
        <>
          <h2 style={styles.sectionTitle}>🏆 Leaderboard Bulan Ini</h2>
          <div style={styles.leaderGrid}>
            {timAktif.slice(0, 3).map((t, i) => (
              <div
                key={t.id}
                style={{
                  ...styles.leaderCard,
                  borderTop:
                    i === 0
                      ? '3px solid #fbbf24'
                      : i === 1
                        ? '3px solid #94a3b8'
                        : '3px solid #d97706',
                }}
              >
                <div style={styles.leaderRank}>{MEDAL[i] || `#${i + 1}`}</div>
                <div style={styles.leaderAvatar}>
                  {t.nama
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div style={styles.leaderNama}>{t.nama}</div>
                <div style={styles.leaderRole}>{t.role_tim}</div>
                <div style={styles.leaderStat}>
                  <div style={styles.statAngka}>{t.closing_bulan_ini}</div>
                  <div style={styles.statLabel}>Closing</div>
                </div>
                <div style={styles.leaderProgress}>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: t.target_bulanan
                          ? `${Math.min((t.closing_bulan_ini / t.target_bulanan) * 100, 100)}%`
                          : '0%',
                      }}
                    />
                  </div>
                  <span style={styles.progressLabel}>
                    {t.target_bulanan
                      ? `${Math.round((t.closing_bulan_ini / t.target_bulanan) * 100)}% dari target ${t.target_bulanan}`
                      : 'Belum ada target'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tabel semua anggota */}
      <h2 style={styles.sectionTitle}>👥 Semua Anggota</h2>
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  'Rank',
                  'Nama',
                  'Role',
                  'Area',
                  'Lead Aktif',
                  'Closing',
                  'Target',
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
              {[...timAktif, ...timNonaktif].map((t, i) => (
                <tr
                  key={t.id}
                  style={{
                    ...styles.tr,
                    opacity: t.status === 'Nonaktif' ? 0.5 : 1,
                  }}
                >
                  <td style={styles.td}>{t.status === 'Aktif' ? MEDAL[i] || `#${i + 1}` : '-'}</td>
                  <td style={styles.td}>
                    <div style={styles.namaCell}>
                      <div style={styles.avatarKecil}>
                        {t.nama
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{t.nama}</div>
                        {t.hp && <div style={styles.subText}>📱 {t.hp}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{t.role_tim}</td>
                  <td style={styles.td}>{t.area || '-'}</td>
                  <td style={styles.td}>
                    <span style={styles.badgeBlue}>{t.lead_aktif}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badgeGreen}>{t.closing_bulan_ini}</span>
                  </td>
                  <td style={styles.td}>{t.target_bulanan || '-'}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          t.status === 'Aktif' ? 'var(--accent-soft)' : 'var(--surface-soft)',
                        color: t.status === 'Aktif' ? 'var(--accent)' : 'var(--muted)',
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => bukaDetail(t)} style={styles.btnDetail}>
                        Detail
                      </button>
                      {bisaEdit && (
                        <>
                          <button onClick={() => bukaEdit(t)} style={styles.btnEdit}>
                            Edit
                          </button>
                          <button onClick={() => handleHapus(t)} style={styles.btnHapus}>
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editId ? 'Edit Anggota' : 'Tambah Anggota Tim'}</h2>
              <button onClick={tutupModal} style={styles.btnClose}>
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div style={styles.formGrid}>
                <Field label="Nama *">
                  <input
                    name="nama"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    required
                    style={styles.input}
                    placeholder="Nama lengkap"
                  />
                </Field>
                <Field label="Username">
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    style={styles.input}
                    placeholder="Username login (opsional)"
                  />
                </Field>
                <Field label="No. HP">
                  <input
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: e.target.value })}
                    style={styles.input}
                    placeholder="08xxxxxxxxxx"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={styles.input}
                    placeholder="email@contoh.com"
                  />
                </Field>
                <Field label="Role Tim">
                  <select
                    value={form.role_tim}
                    onChange={(e) => setForm({ ...form, role_tim: e.target.value })}
                    style={styles.input}
                  >
                    {ROLE_TIM.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Target Closing/Bulan">
                  <input
                    type="number"
                    value={form.target_bulanan}
                    onChange={(e) => setForm({ ...form, target_bulanan: e.target.value })}
                    style={styles.input}
                    placeholder="Contoh: 3"
                  />
                </Field>
                <Field label="Area Coverage">
                  <input
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    style={styles.input}
                    placeholder="Contoh: Solo, Boyolali"
                  />
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={styles.input}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </Field>
              </div>
              <Field label="Catatan">
                <textarea
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                  rows={2}
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </Field>
              {error && <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button type="button" onClick={tutupModal} style={styles.btnSecondary}>
                  Batal
                </button>
                <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                  {submitting ? 'Menyimpan...' : editId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetail && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{showDetail.anggota.nama}</h2>
              <button onClick={() => setShowDetail(null)} style={styles.btnClose}>
                ✕
              </button>
            </div>

            {/* Statistik */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div style={styles.detailStat}>
                <div style={styles.statAngkaBig}>{showDetail.anggota.closing_bulan_ini ?? '-'}</div>
                <div style={styles.statLabel}>Closing Bulan Ini</div>
              </div>
              <div style={styles.detailStat}>
                <div style={styles.statAngkaBig}>{showDetail.anggota.lead_aktif ?? '-'}</div>
                <div style={styles.statLabel}>Lead Aktif</div>
              </div>
              <div style={styles.detailStat}>
                <div style={styles.statAngkaBig}>{showDetail.anggota.target_bulanan || '-'}</div>
                <div style={styles.statLabel}>Target/Bulan</div>
              </div>
            </div>

            {/* 20 Lead terakhir */}
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '10px',
              }}
            >
              Lead Terbaru
            </h3>
            {showDetail.leads.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Belum ada lead.</p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {showDetail.leads.map((l) => (
                  <div key={l.id} style={styles.leadItem}>
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{l.nama}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{l.sumber}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor:
                          l.status === 'Closing' ? 'var(--accent-soft)' : 'var(--surface-soft)',
                        color: l.status === 'Closing' ? 'var(--accent)' : 'var(--muted)',
                      }}
                    >
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label
        style={{
          fontSize: '11px',
          fontWeight: '700',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </label>
      {children}
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
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    margin: '24px 0 12px',
  },
  leaderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '8px',
  },
  leaderCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    textAlign: 'center',
  },
  leaderRank: { fontSize: '28px', marginBottom: '8px' },
  leaderAvatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--accent)',
    fontWeight: '800',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px',
  },
  leaderNama: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '2px',
  },
  leaderRole: { fontSize: '11px', color: 'var(--muted)', marginBottom: '12px' },
  leaderStat: { marginBottom: '10px' },
  statAngka: { fontSize: '32px', fontWeight: '800', color: 'var(--text)' },
  statAngkaBig: { fontSize: '28px', fontWeight: '800', color: 'var(--text)' },
  statLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  leaderProgress: { marginTop: '8px' },
  progressTrack: {
    height: '5px',
    backgroundColor: 'var(--surface-soft)',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '4px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '999px',
    transition: 'width 0.4s',
  },
  progressLabel: { fontSize: '10px', color: 'var(--muted)' },
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
  namaCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatarKecil: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--accent)',
    fontWeight: '800',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  subText: { fontSize: '11px', color: 'var(--muted)', marginTop: '1px' },
  badge: {
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
  },
  badgeBlue: {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    color: '#2563eb',
  },
  badgeGreen: {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent)',
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
  btnDetail: {
    padding: '6px 12px',
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
  },
  btnEdit: {
    padding: '6px 12px',
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700',
  },
  btnHapus: {
    padding: '6px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
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
    transition: 'all 0.2s ease',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
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
  detailStat: {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  leadItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
  },
};
