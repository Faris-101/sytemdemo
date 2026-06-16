import { useEffect, useState } from 'react';
import api from '../api/axios';

const STATUS_OPTIONS = ['Ada', 'Dalam Proses', 'Tidak Ada'];

const STATUS_STYLE = {
  Ada: { bg: 'var(--success-soft)', color: 'var(--success)', icon: '✓' },
  'Dalam Proses': { bg: 'var(--warning-soft)', color: 'var(--warning)', icon: '◑' },
  'Tidak Ada': { bg: 'var(--danger-soft)', color: 'var(--danger)', icon: '✗' },
};

function hitungStatus(dokumen) {
  if (!dokumen.length) return 'Kurang';
  const ada = dokumen.filter((d) => d.status === 'Ada').length;
  if (ada === dokumen.length) return 'Lengkap';
  if (ada === 0) return 'Kurang';
  return 'Dalam Proses';
}

export default function DokumenCustomer() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dokumen, setDokumen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCust, setLoadingCust] = useState(true);
  const [showTambah, setShowTambah] = useState(false);
  const [namaBaru, setNamaBaru] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null); // { url, nama }

  async function fetchCustomers() {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch {
      console.error('Gagal fetch customers');
    } finally {
      setLoadingCust(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(fetchCustomers);
  }, []);

  async function pilihCustomer(customer) {
    setSelected(customer);
    setLoading(true);
    try {
      const res = await api.get(`/dokumen/${customer.id}`);
      setDokumen(res.data.dokumen);
    } catch {
      console.error('Gagal fetch dokumen');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setDokumen((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    try {
      await api.patch(`/dokumen/${id}`, { status });
    } catch {
      alert('Gagal update status');
      pilihCustomer(selected);
    }
  }

  async function handleUploadFoto(id, file) {
    if (!file) return;
    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append('foto', file);

      const res = await api.post(`/dokumen/${id}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update foto_url langsung di state
      setDokumen((prev) =>
        prev.map((d) => (d.id === id ? { ...d, foto_url: res.data.foto_url, status: 'Ada' } : d))
      );
    } catch {
      alert('Gagal upload foto');
    } finally {
      setUploadingId(null);
    }
  }

  async function hapusFoto(id) {
    if (!window.confirm('Hapus foto dokumen ini?')) return;
    try {
      await api.delete(`/dokumen/${id}/foto`);
      setDokumen((prev) => prev.map((d) => (d.id === id ? { ...d, foto_url: null } : d)));
    } catch {
      alert('Gagal hapus foto');
    }
  }

  async function tambahDokumen(e) {
    e.preventDefault();
    if (!namaBaru.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/dokumen', {
        customer_id: selected.id,
        nama_dokumen: namaBaru,
        status: 'Tidak Ada',
      });
      setNamaBaru('');
      setShowTambah(false);
      pilihCustomer(selected);
    } catch {
      alert('Gagal tambah dokumen');
    } finally {
      setSubmitting(false);
    }
  }

  async function hapusDokumen(id) {
    if (!window.confirm('Hapus dokumen ini?')) return;
    try {
      await api.delete(`/dokumen/${id}`);
      setDokumen((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert('Gagal hapus dokumen');
    }
  }

  const statusKeseluruhan = hitungStatus(dokumen);
  const jumlahAda = dokumen.filter((d) => d.status === 'Ada').length;

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 96px)' }}>
      {/* Panel Kiri */}
      <div style={styles.panelKiri}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Pilih Customer</h2>
        </div>
        {loadingCust ? (
          <p style={{ padding: '16px', color: 'var(--muted)', fontSize: '13px' }}>Memuat...</p>
        ) : customers.length === 0 ? (
          <p style={{ padding: '16px', color: 'var(--muted)', fontSize: '13px' }}>
            Belum ada customer.
          </p>
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
                  {c.unit_kode || '-'} · {c.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel Kanan */}
      <div style={styles.panelKanan}>
        {!selected ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '48px' }}>📋</div>
            <p style={{ color: 'var(--muted)', marginTop: '12px' }}>
              Pilih customer di kiri untuk melihat dokumennya
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={styles.dokHeader}>
              <div>
                <h2 style={styles.dokTitle}>{selected.nama}</h2>
                <p style={styles.dokSub}>
                  Unit: {selected.unit_kode || '-'} · {selected.metode_bayar || '-'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    ...styles.statusBadge,
                    background:
                      statusKeseluruhan === 'Lengkap'
                        ? 'var(--success-soft)'
                        : statusKeseluruhan === 'Dalam Proses'
                          ? 'var(--warning-soft)'
                          : 'var(--danger-soft)',
                    color:
                      statusKeseluruhan === 'Lengkap'
                        ? 'var(--success)'
                        : statusKeseluruhan === 'Dalam Proses'
                          ? 'var(--warning)'
                          : 'var(--danger)',
                  }}
                >
                  {statusKeseluruhan === 'Lengkap'
                    ? '✅ Lengkap'
                    : statusKeseluruhan === 'Dalam Proses'
                      ? '🔄 Dalam Proses'
                      : '❌ Kurang'}
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    marginTop: '4px',
                  }}
                >
                  {jumlahAda} / {dokumen.length} dokumen ada
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: dokumen.length ? `${(jumlahAda / dokumen.length) * 100}%` : '0%',
                  background:
                    statusKeseluruhan === 'Lengkap'
                      ? '#27ae60'
                      : statusKeseluruhan === 'Dalam Proses'
                        ? '#f39c12'
                        : '#e74c3c',
                }}
              />
            </div>

            {/* Checklist */}
            {loading ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Memuat dokumen...</p>
            ) : (
              <div style={styles.checkList}>
                {dokumen.map((d) => (
                  <div key={d.id} style={styles.checkItem}>
                    {/* Foto thumbnail / upload area */}
                    <div style={styles.fotoArea}>
                      {d.foto_url ? (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={d.foto_url}
                            alt={d.nama_dokumen}
                            style={styles.fotoThumb}
                            onClick={() =>
                              setPreviewFoto({
                                url: d.foto_url,
                                nama: d.nama_dokumen,
                              })
                            }
                            title="Klik untuk perbesar"
                          />
                          <button
                            onClick={() => hapusFoto(d.id)}
                            style={styles.fotoHapusBtn}
                            title="Hapus foto"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label style={styles.uploadLabel} title="Upload foto dokumen">
                          {uploadingId === d.id ? (
                            <span
                              style={{
                                fontSize: '10px',
                                color: 'var(--muted)',
                              }}
                            >
                              ⏳
                            </span>
                          ) : (
                            <span style={{ fontSize: '18px' }}>📎</span>
                          )}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            style={{ display: 'none' }}
                            disabled={uploadingId === d.id}
                            onChange={(e) => handleUploadFoto(d.id, e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>

                    {/* Info dokumen */}
                    <div style={{ flex: 1 }}>
                      <span style={styles.dokNama}>{d.nama_dokumen}</span>
                      {d.catatan && <span style={styles.dokCatatan}> — {d.catatan}</span>}
                      {d.updated_by && (
                        <div style={styles.dokUpdated}>diupdate oleh {d.updated_by}</div>
                      )}
                    </div>

                    {/* Toggle status */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '5px',
                        alignItems: 'center',
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(d.id, s)}
                          style={{
                            ...styles.statusBtn,
                            background: d.status === s ? STATUS_STYLE[s].bg : '#f5f5f5',
                            color: d.status === s ? STATUS_STYLE[s].color : '#aaa',
                            fontWeight: d.status === s ? '700' : '400',
                            border:
                              d.status === s
                                ? `1.5px solid ${STATUS_STYLE[s].color}`
                                : '1.5px solid transparent',
                          }}
                        >
                          {STATUS_STYLE[s].icon} {s}
                        </button>
                      ))}
                      <button
                        onClick={() => hapusDokumen(d.id)}
                        style={styles.btnHapusKecil}
                        title="Hapus dokumen"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {/* Tambah dokumen custom */}
                {showTambah ? (
                  <form onSubmit={tambahDokumen} style={styles.tambahForm}>
                    <input
                      value={namaBaru}
                      onChange={(e) => setNamaBaru(e.target.value)}
                      placeholder="Nama dokumen baru..."
                      style={styles.inputKecil}
                      autoFocus
                    />
                    <button type="submit" disabled={submitting} style={styles.btnSimpan}>
                      {submitting ? '...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTambah(false)}
                      style={styles.btnBatal}
                    >
                      Batal
                    </button>
                  </form>
                ) : (
                  <button onClick={() => setShowTambah(true)} style={styles.btnTambahDok}>
                    + Tambah Dokumen Lain
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Preview Foto */}
      {previewFoto && (
        <div style={styles.previewOverlay} onClick={() => setPreviewFoto(null)}>
          <div style={styles.previewBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.previewHeader}>
              <span style={styles.previewNama}>{previewFoto.nama}</span>
              <button onClick={() => setPreviewFoto(null)} style={styles.previewClose}>
                ✕
              </button>
            </div>
            <img src={previewFoto.url} alt={previewFoto.nama} style={styles.previewImg} />
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <a href={previewFoto.url} target="_blank" rel="noreferrer" style={styles.btnBukaTab}>
                🔗 Buka di tab baru
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  panelKiri: {
    width: '240px',
    flexShrink: 0,
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '16px 18px',
    borderBottom: '1px solid var(--border)',
  },
  panelTitle: { fontSize: '14px', fontWeight: '700', color: 'var(--text)' },
  custList: { overflowY: 'auto', flex: 1 },
  custItem: {
    padding: '12px 18px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  custName: { fontSize: '13px', fontWeight: '600', color: 'var(--text)' },
  custSub: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' },
  panelKanan: {
    flex: 1,
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    padding: '24px',
    overflowY: 'auto',
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
    marginBottom: '12px',
  },
  dokTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  dokSub: { fontSize: '13px', color: 'var(--muted)', marginTop: '3px' },
  statusBadge: {
    display: 'inline-block',
    padding: '5px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'var(--bg)',
    borderRadius: '999px',
    marginBottom: '20px',
    overflow: 'hidden',
    border: '1px solid var(--border)',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.4s ease',
  },
  checkList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    backgroundColor: 'var(--surface-soft)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  // Foto
  fotoArea: { flexShrink: 0 },
  fotoThumb: {
    width: '52px',
    height: '52px',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid var(--border)',
    display: 'block',
  },
  fotoHapusBtn: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '9px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  uploadLabel: {
    width: '52px',
    height: '52px',
    border: '2px dashed var(--border)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'var(--bg)',
  },
  // Dok info
  dokNama: { fontSize: '13px', fontWeight: '700', color: 'var(--text)' },
  dokCatatan: { fontSize: '12px', color: 'var(--muted)' },
  dokUpdated: { fontSize: '10px', color: 'var(--muted)', marginTop: '2px' },
  statusBtn: {
    padding: '5px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'var(--sans)',
    whiteSpace: 'nowrap',
  },
  btnHapusKecil: {
    padding: '5px 8px',
    background: 'transparent',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    fontSize: '12px',
  },
  tambahForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '4px',
  },
  inputKecil: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--text)',
    fontFamily: 'var(--sans)',
  },
  btnSimpan: {
    padding: '8px 16px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: 'var(--sans)',
  },
  btnBatal: {
    padding: '8px 14px',
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'var(--sans)',
    fontWeight: '600',
  },
  btnTambahDok: {
    padding: '10px 14px',
    background: 'transparent',
    border: '2px dashed var(--border)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--muted)',
    fontFamily: 'var(--sans)',
    marginTop: '4px',
    fontWeight: '600',
  },
  // Preview modal
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  previewBox: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-soft)',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  previewNama: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text)',
    letterSpacing: '-0.01em',
  },
  previewClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'var(--muted)',
  },
  previewImg: {
    width: '100%',
    borderRadius: '12px',
    objectFit: 'contain',
    maxHeight: '500px',
    border: '1px solid var(--border)',
  },
  btnBukaTab: {
    display: 'inline-block',
    padding: '10px 24px',
    background: 'var(--accent)',
    color: 'white',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px var(--accent-soft)',
  },
};
