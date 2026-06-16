import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const KONDISI_OPTIONS = ['Baik', 'Kurang Baik', 'Perlu Perbaikan'];
const KONDISI_COLOR = {
  Baik: { color: 'var(--success)', icon: '✓' },
  'Kurang Baik': { color: 'var(--warning)', icon: '△' },
  'Perlu Perbaikan': { color: 'var(--danger)', icon: '✗' },
};

const CHECKLIST_ITEMS = [
  { key: 'kondisi_kunci', label: 'Kunci & Gembok' },
  { key: 'kondisi_listrik', label: 'Instalasi Listrik' },
  { key: 'kondisi_air', label: 'Instalasi Air' },
  { key: 'kondisi_cat', label: 'Cat & Dinding' },
  { key: 'kondisi_lantai', label: 'Lantai & Keramik' },
  { key: 'kondisi_pintu', label: 'Pintu & Kusen' },
  { key: 'kondisi_jendela', label: 'Jendela & Ventilasi' },
];

const FORM_AWAL = {
  customer_id: '',
  unit_id: '',
  tgl_serah_terima: '',
  kondisi_kunci: 'Baik',
  kondisi_listrik: 'Baik',
  kondisi_air: 'Baik',
  kondisi_cat: 'Baik',
  kondisi_lantai: 'Baik',
  kondisi_pintu: 'Baik',
  kondisi_jendela: 'Baik',
  catatan_temuan: '',
  penerima_nama: '',
  penerima_jabatan: 'Pembeli',
  penyerah_nama: '',
  penyerah_jabatan: 'Direktur',
};

export default function BAST() {
  const { user } = useAuth();
  const [bastList, setBastList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_AWAL);
  const [submitting, setSubmitting] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [previewFoto, setPreviewFoto] = useState(null);
  const printRef = useRef();

  const bisaEdit = ['admin', 'direktur'].includes(user?.role);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const [bastRes, custRes] = await Promise.all([
        api.get(`/bast${params}`),
        api.get('/customers'),
      ]);
      setBastList(bastRes.data);
      setCustomers(custRes.data);
    } catch {
      console.error('Gagal fetch BAST');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = filterStatus ? `?status=${filterStatus}` : '';
        const [bastRes, custRes] = await Promise.all([
          api.get(`/bast${params}`),
          api.get('/customers'),
        ]);
        if (!ignore) {
          setBastList(bastRes.data);
          setCustomers(custRes.data);
        }
      } catch {
        console.error('Gagal fetch BAST');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [filterStatus]);

  async function bukaDetail(id) {
    try {
      const res = await api.get(`/bast/${id}`);
      setShowDetail(res.data);
      setForm({
        customer_id: res.data.customer_id,
        unit_id: res.data.unit_id,
        tgl_serah_terima: res.data.tgl_serah_terima?.split('T')[0] || '',
        kondisi_kunci: res.data.kondisi_kunci,
        kondisi_listrik: res.data.kondisi_listrik,
        kondisi_air: res.data.kondisi_air,
        kondisi_cat: res.data.kondisi_cat,
        kondisi_lantai: res.data.kondisi_lantai,
        kondisi_pintu: res.data.kondisi_pintu,
        kondisi_jendela: res.data.kondisi_jendela,
        catatan_temuan: res.data.catatan_temuan || '',
        penerima_nama: res.data.penerima_nama || '',
        penerima_jabatan: res.data.penerima_jabatan || 'Pembeli',
        penyerah_nama: res.data.penyerah_nama || '',
        penyerah_jabatan: res.data.penyerah_jabatan || 'Direktur',
      });
      setEditMode(false);
    } catch {
      alert('Gagal load detail BAST');
    }
  }

  // Auto-isi unit_id saat customer dipilih
  function handleCustomerChange(customer_id) {
    const cust = customers.find((c) => c.id === parseInt(customer_id));
    setForm({ ...form, customer_id, unit_id: cust?.unit_id || '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/bast', form);
      setShowForm(false);
      setForm(FORM_AWAL);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal buat BAST');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    setSubmitting(true);
    try {
      await api.put(`/bast/${showDetail.id}`, {
        ...form,
        status: showDetail.status,
      });
      await bukaDetail(showDetail.id);
      fetchAll();
      setEditMode(false);
    } catch {
      alert('Gagal update BAST');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSelesai() {
    if (!window.confirm('Tandai BAST ini sebagai Selesai?')) return;
    try {
      await api.put(`/bast/${showDetail.id}`, { ...form, status: 'Selesai' });
      await bukaDetail(showDetail.id);
      fetchAll();
    } catch {
      alert('Gagal update status');
    }
  }

  async function handleUploadFoto(file) {
    if (!file) return;
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const res = await api.post(`/bast/${showDetail.id}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowDetail((prev) => ({ ...prev, foto_url: res.data.foto_url }));
    } catch {
      alert('Gagal upload foto');
    } finally {
      setUploadingFoto(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Serah Terima Unit (BAST)</h1>
          <p style={styles.pageSubtitle}>{bastList.length} BAST ditemukan</p>
        </div>
        {bisaEdit && (
          <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
            {showForm ? '✕ Tutup' : '+ Buat BAST'}
          </button>
        )}
      </div>

      {/* Form Buat BAST */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Buat BAST Baru</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Customer *</label>
                <select
                  value={form.customer_id}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  required
                  style={styles.input}
                >
                  <option value="">-- Pilih customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama} — Unit {c.unit_kode}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>Tanggal Serah Terima</label>
                <input
                  type="date"
                  value={form.tgl_serah_terima}
                  onChange={(e) => setForm({ ...form, tgl_serah_terima: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Nama Penerima (Customer)</label>
                <input
                  value={form.penerima_nama}
                  onChange={(e) => setForm({ ...form, penerima_nama: e.target.value })}
                  placeholder="Nama yang menerima unit"
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Nama Penyerah (Dari Developer)</label>
                <input
                  value={form.penyerah_nama}
                  onChange={(e) => setForm({ ...form, penyerah_nama: e.target.value })}
                  placeholder="Nama perwakilan developer"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Checklist kondisi */}
            <h4 style={styles.checkTitle}>Checklist Kondisi Unit</h4>
            <div style={styles.checkGrid}>
              {CHECKLIST_ITEMS.map((item) => (
                <div key={item.key} style={styles.checkRow}>
                  <span style={styles.checkLabel}>{item.label}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {KONDISI_OPTIONS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setForm({ ...form, [item.key]: k })}
                        style={{
                          ...styles.kondisiBtn,
                          background:
                            form[item.key] === k ? KONDISI_COLOR[k].color : 'var(--surface-soft)',
                          color: form[item.key] === k ? 'var(--white)' : 'var(--muted)',
                        }}
                      >
                        {KONDISI_COLOR[k].icon} {k}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={styles.label}>Catatan Temuan / Punch List</label>
              <textarea
                value={form.catatan_temuan}
                onChange={(e) => setForm({ ...form, catatan_temuan: e.target.value })}
                rows={3}
                placeholder="Contoh: Cat tembok kamar mandi perlu disentuh, handle pintu belakang longgar..."
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '16px',
              }}
            >
              <button type="button" onClick={() => setShowForm(false)} style={styles.btnSecondary}>
                Batal
              </button>
              <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                {submitting ? 'Menyimpan...' : 'Buat BAST'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={styles.tabBar}>
        {[
          { val: '', label: 'Semua' },
          { val: 'Dijadwalkan', label: '📅 Dijadwalkan' },
          { val: 'Selesai', label: '✅ Selesai' },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilterStatus(f.val)}
            style={{
              ...styles.tabBtn,
              background: filterStatus === f.val ? 'var(--g1)' : 'var(--surface)',
              color: filterStatus === f.val ? 'var(--gold2)' : 'var(--muted)',
              fontWeight: filterStatus === f.val ? '700' : '400',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List BAST */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : bastList.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '40px' }}>🏠</div>
          <p style={{ color: 'var(--muted)', marginTop: '10px' }}>Belum ada BAST.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Customer', 'Unit', 'Tgl Serah Terima', 'Penerima', 'Status', 'Aksi'].map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bastList.map((b) => (
                <tr key={b.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{b.customer_nama}</strong>
                    <div style={styles.subText}>{b.customer_hp}</div>
                  </td>
                  <td style={styles.td}>
                    <strong>{b.unit_kode}</strong>
                    <div style={styles.subText}>
                      {b.tipe} · {b.blok}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {b.tgl_serah_terima ? (
                      new Date(b.tgl_serah_terima).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>Belum dijadwalkan</span>
                    )}
                  </td>
                  <td style={styles.td}>{b.penerima_nama || '-'}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          b.status === 'Selesai' ? 'var(--success-soft)' : 'var(--warning-soft)',
                        color: b.status === 'Selesai' ? 'var(--success)' : 'var(--warning)',
                      }}
                    >
                      {b.status === 'Selesai' ? '✅ Selesai' : '📅 Dijadwalkan'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => bukaDetail(b.id)} style={styles.btnDetail}>
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail BAST */}
      {showDetail && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {/* Header modal */}
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>BAST — {showDetail.customer_nama}</h2>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--muted)',
                    marginTop: '2px',
                  }}
                >
                  Unit {showDetail.unit_kode} · {showDetail.tipe} · {showDetail.blok}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handlePrint} style={styles.btnPrint}>
                  🖨 Print
                </button>
                <button onClick={() => setShowDetail(null)} style={styles.btnClose}>
                  ✕
                </button>
              </div>
            </div>

            {/* Konten yang bisa diprint */}
            <div ref={printRef}>
              {/* Info serah terima */}
              <div style={styles.infoGrid}>
                <div style={styles.infoBox}>
                  <p style={styles.infoLabel}>Penyerah</p>
                  <p style={styles.infoVal}>{showDetail.penyerah_nama || '-'}</p>
                  <p style={styles.infoSub}>{showDetail.penyerah_jabatan}</p>
                </div>
                <div style={{ textAlign: 'center', fontSize: '28px' }}>⇄</div>
                <div style={styles.infoBox}>
                  <p style={styles.infoLabel}>Penerima</p>
                  <p style={styles.infoVal}>{showDetail.penerima_nama || '-'}</p>
                  <p style={styles.infoSub}>{showDetail.penerima_jabatan}</p>
                </div>
                <div style={styles.infoBox}>
                  <p style={styles.infoLabel}>Tanggal</p>
                  <p style={styles.infoVal}>
                    {showDetail.tgl_serah_terima
                      ? new Date(showDetail.tgl_serah_terima).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Belum dijadwalkan'}
                  </p>
                </div>
              </div>

              {/* Checklist kondisi */}
              <h3 style={styles.sectionTitle}>Checklist Kondisi Unit</h3>
              <div style={styles.checkListDetail}>
                {CHECKLIST_ITEMS.map((item) => {
                  const kondisi = editMode ? form[item.key] : showDetail[item.key];
                  return (
                    <div key={item.key} style={styles.checkDetailRow}>
                      <span style={styles.checkDetailLabel}>{item.label}</span>
                      {editMode ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {KONDISI_OPTIONS.map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => setForm({ ...form, [item.key]: k })}
                              style={{
                                ...styles.kondisiBtn,
                                background:
                                  form[item.key] === k
                                    ? KONDISI_COLOR[k].color
                                    : 'var(--surface-soft)',
                                color: form[item.key] === k ? 'var(--white)' : 'var(--muted)',
                              }}
                            >
                              {KONDISI_COLOR[k].icon} {k}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span
                          style={{
                            fontWeight: '700',
                            color: KONDISI_COLOR[kondisi]?.color,
                          }}
                        >
                          {KONDISI_COLOR[kondisi]?.icon} {kondisi}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Catatan temuan */}
              {(showDetail.catatan_temuan || editMode) && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={styles.sectionTitle}>Catatan Temuan / Punch List</h3>
                  {editMode ? (
                    <textarea
                      value={form.catatan_temuan}
                      onChange={(e) => setForm({ ...form, catatan_temuan: e.target.value })}
                      rows={3}
                      style={{
                        ...styles.input,
                        resize: 'vertical',
                        width: '100%',
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--muted)',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {showDetail.catatan_temuan || '-'}
                    </p>
                  )}
                </div>
              )}

              {/* Foto */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={styles.sectionTitle}>Foto Dokumentasi</h3>
                {showDetail.foto_url ? (
                  <img
                    src={showDetail.foto_url}
                    alt="Foto BAST"
                    style={styles.fotoThumb}
                    onClick={() => setPreviewFoto(showDetail.foto_url)}
                  />
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Belum ada foto.</p>
                )}
                {bisaEdit && (
                  <label style={styles.uploadBtn}>
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
            </div>

            {/* Tombol aksi */}
            {bisaEdit && (
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '16px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '16px',
                }}
              >
                {editMode ? (
                  <>
                    <button onClick={() => setEditMode(false)} style={styles.btnSecondary}>
                      Batal
                    </button>
                    <button onClick={handleUpdate} disabled={submitting} style={styles.btnPrimary}>
                      {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditMode(true)} style={styles.btnSecondary}>
                      ✏ Edit
                    </button>
                    {showDetail.status === 'Dijadwalkan' && (
                      <button onClick={handleSelesai} style={styles.btnSelesai}>
                        ✅ Tandai Selesai
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview foto */}
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
  checkTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text)',
    margin: '18px 0 10px',
  },
  checkGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'var(--surface-soft)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
  },
  checkLabel: { fontSize: '13px', fontWeight: '600', color: 'var(--text)' },
  kondisiBtn: {
    padding: '5px 10px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'var(--sans)',
    whiteSpace: 'nowrap',
  },
  tabBar: { display: 'flex', gap: '8px', marginBottom: '20px' },
  tabBtn: {
    padding: '8px 16px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: 'var(--sans)',
  },
  emptyState: { textAlign: 'center', padding: '60px 0' },
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
  subText: { fontSize: '11px', color: 'var(--muted)', marginTop: '2px' },
  badge: {
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnDetail: {
    padding: '6px 14px',
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'var(--sans)',
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
    padding: '10px 20px',
    background: 'var(--success-soft)',
    color: 'var(--success)',
    border: '2px solid var(--success)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'var(--sans)',
  },
  btnPrint: {
    padding: '8px 14px',
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'var(--sans)',
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
    maxWidth: '680px',
    maxHeight: '92vh',
    overflowY: 'auto',
    padding: '28px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-soft)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
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
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr 1fr',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '20px',
  },
  infoBox: {
    backgroundColor: 'var(--surface-soft)',
    borderRadius: '12px',
    padding: '14px 16px',
    border: '1px solid var(--border)',
  },
  infoLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 4px',
    fontWeight: '700',
  },
  infoVal: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    margin: '0 0 2px',
  },
  infoSub: { fontSize: '11px', color: 'var(--muted)', margin: 0 },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: '0 0 10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  checkListDetail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '18px',
  },
  checkDetailRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    backgroundColor: 'var(--surface-soft)',
    borderRadius: '10px',
    border: '1px solid var(--border)',
  },
  checkDetailLabel: { fontSize: '13px', fontWeight: '600', color: 'var(--text)' },
  fotoThumb: {
    width: '140px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '12px',
    cursor: 'pointer',
    border: '2px solid var(--border)',
    display: 'block',
    marginBottom: '10px',
  },
  uploadBtn: {
    padding: '8px 16px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'var(--sans)',
    display: 'inline-block',
  },
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    cursor: 'zoom-out',
  },
  previewImg: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: '10px',
    objectFit: 'contain',
  },
};
