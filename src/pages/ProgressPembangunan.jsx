import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const TAHAP_LIST = ['Persiapan', 'Pondasi', 'Struktur', 'Atap', 'Finishing', 'Selesai'];

const TAHAP_COLOR = {
  Persiapan: { bg: 'var(--surface-soft)', color: 'var(--muted)' },
  Pondasi: { bg: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' },
  Struktur: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  Atap: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' },
  Finishing: { bg: 'rgba(22, 163, 74, 0.15)', color: 'var(--accent)' },
  Selesai: { bg: 'var(--accent-soft)', color: 'var(--accent)' },
};

export default function ProgressPembangunan() {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBlok, setFilterBlok] = useState('');
  const [blokList, setBlokList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({
    tahap: 'Persiapan',
    persen: '',
    catatan_lapangan: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null);

  const bisaEdit = ['admin', 'direktur'].includes(user?.role);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterBlok ? `?blok=${encodeURIComponent(filterBlok)}` : '';
      const [unitsRes, summaryRes] = await Promise.all([
        api.get(`/progress${params}`),
        api.get('/progress/summary'),
      ]);
      setUnits(unitsRes.data);
      setSummary(summaryRes.data);

      // Ambil daftar blok unik
      const bloks = [...new Set(unitsRes.data.map((u) => u.blok).filter(Boolean))];
      setBlokList(bloks);
    } catch {
      console.error('Gagal fetch progress');
    } finally {
      setLoading(false);
    }
  }, [filterBlok]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function bukaDetail(unit) {
    setSelected(unit);
    try {
      const res = await api.get(`/progress/${unit.id}`);
      setDetail(res.data);
      setForm({
        tahap: res.data.progress?.tahap || 'Persiapan',
        persen: res.data.progress?.persen || '',
        catatan_lapangan: res.data.progress?.catatan_lapangan || '',
      });
    } catch {
      console.error('Gagal fetch detail');
    }
    setShowModal(true);
  }

  async function handleSimpan(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/progress/${selected.id}`, form);
      setShowModal(false);
      fetchAll();
    } catch {
      alert('Gagal simpan progress');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUploadFoto(file) {
    if (!file) return;
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const res = await api.post(`/progress/${selected.id}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetail((prev) => ({
        ...prev,
        progress: { ...prev.progress, foto_url: res.data.foto_url },
      }));
      fetchAll();
    } catch {
      alert('Gagal upload foto');
    } finally {
      setUploadingFoto(false);
    }
  }

  // Hitung persen otomatis saat tahap berubah
  function handleTahapChange(tahap) {
    const persen = Math.round((TAHAP_LIST.indexOf(tahap) / (TAHAP_LIST.length - 1)) * 100);
    setForm({ ...form, tahap, persen });
  }

  // Group units by blok
  const unitsByBlok = units.reduce((acc, u) => {
    const key = u.blok || 'Tanpa Blok';
    if (!acc[key]) acc[key] = [];
    acc[key].push(u);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Progress Pembangunan</h1>
          <p style={styles.pageSubtitle}>{units.length} unit terpantau</p>
        </div>
      </div>

      {/* Summary per Cluster */}
      {summary.length > 0 && (
        <>
          <h2 style={styles.sectionTitle}>📊 Ringkasan per Cluster</h2>
          <div style={styles.summaryGrid}>
            {summary.map((s) => (
              <div key={s.blok} style={styles.summaryCard}>
                <div style={styles.summaryBlok}>{s.blok}</div>
                <div style={styles.summaryTrack}>
                  <div
                    style={{
                      ...styles.summaryFill,
                      width: `${Math.round(s.rata_persen)}%`,
                      backgroundColor: s.rata_persen === 100 ? 'var(--accent)' : 'var(--accent)',
                    }}
                  />
                </div>
                <div style={styles.summaryInfo}>
                  <span style={{ fontWeight: '800', color: 'var(--text)' }}>
                    {Math.round(s.rata_persen)}%
                  </span>
                  <span style={{ color: 'var(--muted)' }}>
                    {s.unit_selesai}/{s.total_unit} selesai
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Filter Blok */}
      <div style={styles.filterBar}>
        <span style={styles.filterLabel}>Cluster:</span>
        {['', ...blokList].map((b) => (
          <button
            key={b}
            onClick={() => setFilterBlok(b)}
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

      {/* Grid Unit per Blok */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : (
        Object.entries(unitsByBlok).map(([blok, blokUnits]) => (
          <div key={blok} style={{ marginBottom: '28px' }}>
            <h2 style={styles.blokTitle}>{blok}</h2>
            <div style={styles.unitGrid}>
              {blokUnits.map((u) => (
                <div key={u.id} onClick={() => bukaDetail(u)} style={styles.unitCard}>
                  {/* Kode unit */}
                  <div style={styles.unitKode}>{u.kode}</div>
                  <div style={styles.unitTipe}>{u.tipe || '-'}</div>

                  {/* Badge tahap */}
                  <div
                    style={{
                      ...styles.tahapBadge,
                      backgroundColor: TAHAP_COLOR[u.tahap]?.bg,
                      color: TAHAP_COLOR[u.tahap]?.color,
                    }}
                  >
                    {u.tahap}
                  </div>

                  {/* Progress bar */}
                  <div style={styles.miniTrack}>
                    <div
                      style={{
                        ...styles.miniFill,
                        width: `${u.persen}%`,
                        backgroundColor: u.persen === 100 ? 'var(--accent)' : 'var(--accent)',
                      }}
                    />
                  </div>
                  <div style={styles.persenText}>{u.persen}%</div>

                  {/* Foto indicator */}
                  {u.foto_url && <div style={styles.fotoIndicator}>📷</div>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal Detail & Update */}
      {showModal && selected && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Unit {selected.kode}</h2>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--muted)',
                    marginTop: '2px',
                  }}
                >
                  {selected.blok} · {selected.tipe || '-'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={styles.btnClose}>
                ✕
              </button>
            </div>

            {/* Foto lapangan */}
            <div style={styles.fotoSection}>
              {detail?.progress?.foto_url ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={detail.progress.foto_url}
                    alt="Foto lapangan"
                    style={styles.fotoLapangan}
                    onClick={() => setPreviewFoto(detail.progress.foto_url)}
                  />
                  <span style={styles.fotoLabel}>Foto Lapangan Terkini</span>
                </div>
              ) : (
                <div style={styles.fotoEmpty}>
                  <span style={{ fontSize: '32px' }}>📷</span>
                  <p
                    style={{
                      color: 'var(--muted)',
                      fontSize: '12px',
                      marginTop: '6px',
                    }}
                  >
                    Belum ada foto
                  </p>
                </div>
              )}

              {bisaEdit && (
                <label style={styles.uploadFotoBtn}>
                  {uploadingFoto ? '⏳ Mengupload...' : '📎 Upload Foto'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={uploadingFoto}
                    onChange={(e) => handleUploadFoto(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            {/* Tahap visual */}
            <div style={styles.tahapTrack}>
              {TAHAP_LIST.map((t, i) => {
                const aktif = TAHAP_LIST.indexOf(form.tahap) >= i;
                return (
                  <div key={t} style={styles.tahapStep}>
                    <div
                      style={{
                        ...styles.tahapDot,
                        backgroundColor: aktif ? 'var(--accent)' : 'var(--surface-soft)',
                        border: form.tahap === t ? '3px solid var(--accent)' : 'none',
                      }}
                    />
                    <div
                      style={{
                        ...styles.tahapLabel,
                        color: aktif ? 'var(--text)' : 'var(--muted)',
                        fontWeight: form.tahap === t ? '700' : '400',
                      }}
                    >
                      {t}
                    </div>
                    {i < TAHAP_LIST.length - 1 && (
                      <div
                        style={{
                          ...styles.tahapLine,
                          backgroundColor:
                            aktif && TAHAP_LIST.indexOf(form.tahap) > i
                              ? 'var(--accent)'
                              : 'var(--border)',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form update */}
            {bisaEdit && (
              <form
                onSubmit={handleSimpan}
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Tahap Saat Ini</label>
                    <select
                      value={form.tahap}
                      onChange={(e) => handleTahapChange(e.target.value)}
                      style={styles.input}
                    >
                      {TAHAP_LIST.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Persentase (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.persen}
                      onChange={(e) => setForm({ ...form, persen: e.target.value })}
                      style={styles.input}
                      placeholder="0-100"
                    />
                  </div>
                </div>
                <div>
                  <label style={styles.label}>Catatan Lapangan</label>
                  <textarea
                    value={form.catatan_lapangan}
                    onChange={(e) => setForm({ ...form, catatan_lapangan: e.target.value })}
                    rows={3}
                    placeholder="Contoh: Cor pondasi selesai, lanjut pemasangan bata..."
                    style={{ ...styles.input, resize: 'vertical' }}
                  />
                </div>

                {/* Info update terakhir */}
                {detail?.progress?.updated_by && (
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Terakhir diupdate oleh <strong>{detail.progress.updated_by}</strong> ·{' '}
                    {new Date(detail.progress.updated_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={styles.btnSecondary}
                  >
                    Tutup
                  </button>
                  <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                    {submitting ? 'Menyimpan...' : 'Simpan Progress'}
                  </button>
                </div>
              </form>
            )}

            {/* Info kalau bukan admin */}
            {!bisaEdit && detail?.progress && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '14px',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text)',
                    fontWeight: '700',
                  }}
                >
                  Tahap: {detail.progress.tahap} ({detail.progress.persen}%)
                </p>
                {detail.progress.catatan_lapangan && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      marginTop: '6px',
                    }}
                  >
                    {detail.progress.catatan_lapangan}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview foto fullscreen */}
      {previewFoto && (
        <div style={styles.previewOverlay} onClick={() => setPreviewFoto(null)}>
          <img src={previewFoto} style={styles.previewImg} alt="preview" />
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
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    margin: '0 0 12px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
  },
  summaryBlok: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '8px',
  },
  summaryTrack: {
    height: '6px',
    backgroundColor: 'var(--surface-soft)',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  summaryFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.4s',
  },
  summaryInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterLabel: { fontSize: '13px', color: 'var(--muted)', fontWeight: '600' },
  filterBtn: {
    padding: '8px 16px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  blokTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text)',
    marginBottom: '10px',
    paddingLeft: '4px',
  },
  unitGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '10px',
  },
  unitCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '14px',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    transition: 'transform 0.15s ease',
    position: 'relative',
  },
  unitKode: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text)',
    marginBottom: '2px',
  },
  unitTipe: { fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' },
  tahapBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '999px',
    marginBottom: '8px',
  },
  miniTrack: {
    height: '4px',
    backgroundColor: 'var(--surface-soft)',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '4px',
  },
  miniFill: { height: '100%', borderRadius: '999px', transition: 'width 0.4s' },
  persenText: { fontSize: '11px', color: 'var(--muted)', fontWeight: '700' },
  fotoIndicator: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '12px',
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
    maxWidth: '580px',
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
  fotoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
  },
  fotoLapangan: {
    width: '100px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '1px solid var(--border)',
  },
  fotoLabel: {
    display: 'block',
    fontSize: '10px',
    color: 'var(--muted)',
    marginTop: '4px',
    fontWeight: '600',
  },
  fotoEmpty: {
    width: '100px',
    height: '80px',
    border: '2px dashed var(--border)',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadFotoBtn: {
    padding: '8px 16px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  tahapTrack: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '8px',
  },
  tahapStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  tahapDot: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    marginBottom: '6px',
    transition: 'background 0.2s',
    zIndex: 1,
  },
  tahapLabel: {
    fontSize: '10px',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    fontWeight: '600',
  },
  tahapLine: {
    position: 'absolute',
    top: '7px',
    left: '50%',
    width: '100%',
    height: '2px',
    zIndex: 0,
    transition: 'background 0.2s',
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
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
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    cursor: 'zoom-out',
  },
  previewImg: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: '16px',
    objectFit: 'contain',
  },
};
