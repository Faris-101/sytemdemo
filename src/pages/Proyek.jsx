import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const TABS = [
  { label: 'Proyek', icon: '⬡' },
  { label: 'Milestone', icon: '▷' },
  { label: 'Kontraktor', icon: '◫' },
  { label: 'Material', icon: '▣' },
  { label: 'Foto', icon: '◎' },
  { label: 'Pekerja', icon: '◉' },
  { label: 'Inspeksi QC', icon: '✦' },
];

const STATUS_COLOR = {
  Perencanaan: { bg: 'var(--info-soft)', color: 'var(--blue)' },
  Berjalan: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  Selesai: { bg: 'var(--success-soft)', color: 'var(--success)' },
  Ditunda: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  Belum: { bg: 'var(--surface-soft)', color: 'var(--muted)' },
  Terlambat: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  Aktif: { bg: 'var(--success-soft)', color: 'var(--success)' },
  Blacklist: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  'Tidak Aktif': { bg: 'var(--surface-soft)', color: 'var(--muted)' },
  Lulus: { bg: 'var(--success-soft)', color: 'var(--success)' },
  'Tidak Lulus': { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  'Perlu Perbaikan': { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  Draft: { bg: 'var(--surface-soft)', color: 'var(--muted)' },
  Putus: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
};

export default function Proyek() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'direktur'].includes(user?.role);

  const [tab, setTab] = useState(0);
  const [proyekList, setProyekList] = useState([]);
  const [selectedProyek, setSelectedProyek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tab data
  const [milestones, setMilestones] = useState([]);
  const [kontraktorList, setKontraktorList] = useState([]);
  const [kontrakList, setKontrakList] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [fotoList, setFotoList] = useState([]);
  const [pekerjaList, setPekerjaList] = useState([]);
  const [inspeksiList, setInspeksiList] = useState([]);
  const [units, setUnits] = useState([]);

  // Forms
  const [fProyek, setFProyek] = useState({
    kode: '',
    nama: '',
    lokasi: '',
    tipe: 'Perumahan',
    total_unit: '',
    luas_lahan: '',
    tgl_mulai: '',
    tgl_target: '',
    nilai_proyek: '',
    deskripsi: '',
  });
  const [fMilestone, setFMilestone] = useState({
    nama: '',
    urutan: '',
    tgl_target: '',
    persen_bobot: '',
    catatan: '',
  });
  const [fKontrak, setFKontrak] = useState({
    kontraktor_id: '',
    no_kontrak: '',
    pekerjaan: '',
    nilai_kontrak: '',
    tgl_mulai: '',
    tgl_akhir: '',
    termin_bayar: 'Per Milestone',
  });
  const [fMaterial, setFMaterial] = useState({
    nama: '',
    satuan: '',
    harga_satuan: '',
    supplier: '',
  });
  const [fotoFiles, setFotoFiles] = useState(null);
  const [fFoto, setFFoto] = useState({
    judul: '',
    keterangan: '',
    milestone_id: '',
  });
  const [fPekerja, setFPekerja] = useState({
    nama: '',
    jabatan: 'Tukang',
    hp: '',
    upah_harian: '',
    tgl_masuk: '',
  });
  const [fInspeksi, setFInspeksi] = useState({
    unit_id: '',
    tipe: 'Finishing',
    inspektor: '',
    tgl_inspeksi: '',
    catatan: '',
  });

  // Detail inspeksi
  const [detailInspeksi, setDetailInspeksi] = useState(null);
  const [editItems, setEditItems] = useState([]);

  // Absensi
  const [showAbsensi, setShowAbsensi] = useState(null);
  const [absensiList, setAbsensiList] = useState([]);
  const [fAbsensi, setFAbsensi] = useState({
    tgl: new Date().toISOString().split('T')[0],
    status: 'Hadir',
  });

  // Material log
  const [showMatLog, setShowMatLog] = useState(null);
  const [fMatLog, setFMatLog] = useState({
    tipe: 'Masuk',
    jumlah: '',
    keterangan: '',
    tgl: new Date().toISOString().split('T')[0],
  });

  const fetchProyek = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/proyek');
      setProyekList(res.data);
      if (res.data.length && !selectedProyek) setSelectedProyek(res.data[0]);
    } finally {
      setLoading(false);
    }
  }, [selectedProyek]);

  const fetchKontraktor = useCallback(async () => {
    const res = await api.get('/proyek/kontraktor/list');
    setKontraktorList(res.data);
  }, []);

  const fetchUnits = useCallback(async () => {
    const res = await api.get('/units');
    setUnits(res.data);
  }, []);

  const fetchTabData = useCallback(async () => {
    if (!selectedProyek) return;
    const id = selectedProyek.id;
    try {
      switch (tab) {
        case 1: {
          const r = await api.get(`/proyek/${id}/milestones`);
          setMilestones(r.data);
          break;
        }
        case 2: {
          const r = await api.get(`/proyek/${id}/kontrak`);
          setKontrakList(r.data);
          break;
        }
        case 3: {
          const r = await api.get(`/proyek/${id}/material`);
          setMaterialList(r.data);
          break;
        }
        case 4: {
          const r = await api.get(`/proyek/${id}/foto`);
          setFotoList(r.data);
          break;
        }
        case 5: {
          const r = await api.get(`/proyek/${id}/pekerja`);
          setPekerjaList(r.data);
          break;
        }
        case 6: {
          const r = await api.get(`/proyek/${id}/inspeksi`);
          setInspeksiList(r.data);
          break;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedProyek, tab]);

  useEffect(() => {
    fetchProyek();
    fetchKontraktor();
    fetchUnits();
  }, [fetchProyek, fetchKontraktor, fetchUnits]);

  useEffect(() => {
    if (!selectedProyek) return;
    fetchTabData();
  }, [selectedProyek, fetchTabData]);

  async function handleSubmitProyek(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/proyek', fProyek);
      setShowForm(false);
      setFProyek({
        kode: '',
        nama: '',
        lokasi: '',
        tipe: 'Perumahan',
        total_unit: '',
        luas_lahan: '',
        tgl_mulai: '',
        tgl_target: '',
        nilai_proyek: '',
        deskripsi: '',
      });
      fetchProyek();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal');
    } finally {
      setSubmitting(false);
    }
  }

  async function post(url, data, isMultipart = false) {
    setSubmitting(true);
    try {
      const opts = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      await api.post(url, data, opts);
      setShowForm(false);
      fetchTabData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  }

  async function patch(url, data) {
    try {
      await api.patch(url, data);
      fetchTabData();
    } catch {
      alert('Gagal update');
    }
  }

  async function fetchAbsensi(pekerjaId) {
    const res = await api.get(
      `/proyek/pekerja/${pekerjaId}/absensi?bulan=${new Date().getMonth() + 1}&tahun=${new Date().getFullYear()}`
    );
    setAbsensiList(res.data);
  }

  async function fetchDetailInspeksi(id) {
    const res = await api.get(`/proyek/inspeksi/${id}`);
    setDetailInspeksi(res.data);
    setEditItems(res.data.items.map((i) => ({ ...i })));
  }

  // Hitung total upah bulan ini
  function totalUpahBulan() {
    return absensiList.reduce((s, a) => s + Number(a.upah_dibayar), 0);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 style={S.pageTitle}>Proyek & Konstruksi</h1>
          <p style={S.pageSubtitle}>Kelola proyek, kontraktor, material, dan QC</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={S.btnPrimary}>
          {showForm ? '✕ Tutup' : '+ Tambah'}
        </button>
      </div>

      {/* Proyek Selector */}
      {proyekList.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          {proyekList.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProyek(p);
                setTab(0);
              }}
              style={{
                ...S.proyekBtn,
                background: selectedProyek?.id === p.id ? 'var(--g1)' : 'var(--surface)',
                color: selectedProyek?.id === p.id ? 'var(--gold2)' : 'var(--text)',
                border: `1px solid ${selectedProyek?.id === p.id ? 'var(--g1)' : 'var(--border)'}`,
              }}
            >
              <span style={{ fontWeight: '700' }}>{p.kode}</span>
              <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '4px' }}>{p.nama}</span>
              <span
                style={{
                  ...S.badge,
                  ...STATUS_COLOR[p.status],
                  marginLeft: '6px',
                }}
              >
                {p.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Form Buat Proyek */}
      {showForm && isAdmin && tab === 0 && (
        <div style={S.formCard}>
          <h3 style={S.formTitle}>Buat Proyek Baru</h3>
          <form onSubmit={handleSubmitProyek}>
            <div style={S.formGrid}>
              <div>
                <label style={S.label}>Kode *</label>
                <input
                  value={fProyek.kode}
                  onChange={(e) =>
                    setFProyek({
                      ...fProyek,
                      kode: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  style={S.input}
                  placeholder="PRY-001"
                />
              </div>
              <div>
                <label style={S.label}>Nama Proyek *</label>
                <input
                  value={fProyek.nama}
                  onChange={(e) => setFProyek({ ...fProyek, nama: e.target.value })}
                  required
                  style={S.input}
                  placeholder="Cluster Melati"
                />
              </div>
              <div>
                <label style={S.label}>Tipe</label>
                <select
                  value={fProyek.tipe}
                  onChange={(e) => setFProyek({ ...fProyek, tipe: e.target.value })}
                  style={S.input}
                >
                  {['Perumahan', 'Ruko', 'Apartemen', 'Kavling', 'Campuran'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Total Unit</label>
                <input
                  type="number"
                  value={fProyek.total_unit}
                  onChange={(e) => setFProyek({ ...fProyek, total_unit: e.target.value })}
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Luas Lahan (m²)</label>
                <input
                  type="number"
                  value={fProyek.luas_lahan}
                  onChange={(e) => setFProyek({ ...fProyek, luas_lahan: e.target.value })}
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Nilai Proyek (Rp)</label>
                <input
                  type="number"
                  value={fProyek.nilai_proyek}
                  onChange={(e) => setFProyek({ ...fProyek, nilai_proyek: e.target.value })}
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Tgl Mulai</label>
                <input
                  type="date"
                  value={fProyek.tgl_mulai}
                  onChange={(e) => setFProyek({ ...fProyek, tgl_mulai: e.target.value })}
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Target Selesai</label>
                <input
                  type="date"
                  value={fProyek.tgl_target}
                  onChange={(e) => setFProyek({ ...fProyek, tgl_target: e.target.value })}
                  style={S.input}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Lokasi</label>
                <input
                  value={fProyek.lokasi}
                  onChange={(e) => setFProyek({ ...fProyek, lokasi: e.target.value })}
                  style={S.input}
                  placeholder="Alamat proyek"
                />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '14px',
              }}
            >
              <button type="button" onClick={() => setShowForm(false)} style={S.btnSecondary}>
                Batal
              </button>
              <button type="submit" disabled={submitting} style={S.btnPrimary}>
                {submitting ? 'Menyimpan...' : 'Buat Proyek'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : !selectedProyek ? (
        <div style={S.emptyState}>
          <div style={{ fontSize: '40px' }}>⬡</div>
          <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
            Belum ada proyek. Klik + Tambah untuk mulai.
          </p>
        </div>
      ) : (
        <>
          {/* Info bar proyek */}
          <div style={S.infoBar}>
            <div>
              <span style={S.infoLbl}>Proyek</span>
              <strong>{selectedProyek.nama}</strong>
            </div>
            <div>
              <span style={S.infoLbl}>Tipe</span>
              {selectedProyek.tipe}
            </div>
            <div>
              <span style={S.infoLbl}>Total Unit</span>
              {selectedProyek.total_unit}
            </div>
            <div>
              <span style={S.infoLbl}>Nilai</span>
              {selectedProyek.nilai_proyek ? formatRp(selectedProyek.nilai_proyek) : '-'}
            </div>
            <div>
              <span style={S.infoLbl}>Target</span>
              {selectedProyek.tgl_target ? formatTgl(selectedProyek.tgl_target) : '-'}
            </div>
            <div>
              <span style={S.infoLbl}>Progress</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '80px',
                    background: '#f0f0f0',
                    borderRadius: '999px',
                    height: '6px',
                  }}
                >
                  <div
                    style={{
                      width: `${selectedProyek.avg_progress || 0}%`,
                      height: '6px',
                      background: 'var(--g1)',
                      borderRadius: '999px',
                    }}
                  />
                </div>
                <strong>{selectedProyek.avg_progress || 0}%</strong>
              </div>
            </div>
            {isAdmin && (
              <select
                defaultValue={selectedProyek.status}
                onChange={(e) =>
                  api
                    .patch(`/proyek/${selectedProyek.id}`, {
                      status: e.target.value,
                    })
                    .then(fetchProyek)
                }
                style={{
                  ...S.input,
                  padding: '5px 10px',
                  fontSize: '12px',
                  width: 'auto',
                }}
              >
                {['Perencanaan', 'Berjalan', 'Selesai', 'Ditunda'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tab Bar */}
          <div style={S.tabBar}>
            {TABS.map((t, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                style={{
                  ...S.tabBtn,
                  background: tab === i ? 'var(--g1)' : 'var(--surface)',
                  color: tab === i ? 'var(--gold2)' : 'var(--muted)',
                  fontWeight: tab === i ? '700' : '400',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ══ TAB 0: OVERVIEW PROYEK ══ */}
          {tab === 0 && (
            <div style={S.formGrid}>
              <div style={S.formCard}>
                <h3 style={S.formTitle}>Informasi Proyek</h3>
                <div
                  style={{
                    fontSize: '13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {[
                    ['Kode', selectedProyek.kode],
                    ['Nama', selectedProyek.nama],
                    ['Lokasi', selectedProyek.lokasi || '-'],
                    ['Tipe', selectedProyek.tipe],
                    ['Total Unit', selectedProyek.total_unit],
                    [
                      'Luas Lahan',
                      selectedProyek.luas_lahan ? `${selectedProyek.luas_lahan} m²` : '-',
                    ],
                    [
                      'Nilai Proyek',
                      selectedProyek.nilai_proyek ? formatRp(selectedProyek.nilai_proyek) : '-',
                    ],
                    [
                      'Tgl Mulai',
                      selectedProyek.tgl_mulai ? formatTgl(selectedProyek.tgl_mulai) : '-',
                    ],
                    [
                      'Target Selesai',
                      selectedProyek.tgl_target ? formatTgl(selectedProyek.tgl_target) : '-',
                    ],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: '8px' }}>
                      <span
                        style={{
                          width: '130px',
                          color: 'var(--muted)',
                          flexShrink: 0,
                        }}
                      >
                        {k}
                      </span>
                      <span style={{ fontWeight: '600' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={S.formCard}>
                <h3 style={S.formTitle}>Statistik</h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                  }}
                >
                  {[
                    {
                      label: 'Milestone',
                      val: selectedProyek.total_milestone || 0,
                      icon: '▷',
                    },
                    {
                      label: 'Kontrak Aktif',
                      val: selectedProyek.total_kontrak || 0,
                      icon: '◫',
                    },
                    {
                      label: 'Avg Progress',
                      val: `${selectedProyek.avg_progress || 0}%`,
                      icon: '◉',
                    },
                    {
                      label: 'Nilai Kontrak',
                      val: formatRp(selectedProyek.total_nilai_kontrak || 0),
                      icon: '◇',
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: 'var(--cream)',
                        borderRadius: '10px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: '800',
                          color: 'var(--g1)',
                        }}
                      >
                        {s.val}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB 1: MILESTONE ══ */}
          {tab === 1 && (
            <div>
              {showForm && isAdmin && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Tambah Milestone</h3>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Nama Milestone *</label>
                      <input
                        value={fMilestone.nama}
                        onChange={(e) => setFMilestone({ ...fMilestone, nama: e.target.value })}
                        required
                        style={S.input}
                        placeholder="Pondasi, Struktur, Finishing..."
                      />
                    </div>
                    <div>
                      <label style={S.label}>Urutan</label>
                      <input
                        type="number"
                        value={fMilestone.urutan}
                        onChange={(e) =>
                          setFMilestone({
                            ...fMilestone,
                            urutan: e.target.value,
                          })
                        }
                        style={S.input}
                        placeholder="1, 2, 3..."
                      />
                    </div>
                    <div>
                      <label style={S.label}>Target Selesai</label>
                      <input
                        type="date"
                        value={fMilestone.tgl_target}
                        onChange={(e) =>
                          setFMilestone({
                            ...fMilestone,
                            tgl_target: e.target.value,
                          })
                        }
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Bobot (%)</label>
                      <input
                        type="number"
                        value={fMilestone.persen_bobot}
                        onChange={(e) =>
                          setFMilestone({
                            ...fMilestone,
                            persen_bobot: e.target.value,
                          })
                        }
                        style={S.input}
                        placeholder="Bobot dari total proyek"
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      marginTop: '14px',
                    }}
                  >
                    <button type="button" onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => post(`/proyek/${selectedProyek.id}/milestones`, fMilestone)}
                    >
                      {submitting ? 'Menyimpan...' : 'Tambah'}
                    </button>
                  </div>
                </div>
              )}

              {milestones.length === 0 ? (
                <EmptyState icon="▷" text="Belum ada milestone." />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {milestones.map((m) => (
                    <div key={m.id} style={S.formCard}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                          >
                            <span
                              style={{
                                background: 'var(--g1)',
                                color: 'var(--gold2)',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: '11px',
                                fontWeight: '800',
                                flexShrink: 0,
                              }}
                            >
                              {m.urutan}
                            </span>
                            <strong style={{ fontSize: '14px', color: 'var(--g1)' }}>
                              {m.nama}
                            </strong>
                            <span style={{ ...S.badge, ...STATUS_COLOR[m.status] }}>
                              {m.status}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--muted)',
                              marginTop: '6px',
                              marginLeft: '34px',
                            }}
                          >
                            Target: {m.tgl_target ? formatTgl(m.tgl_target) : '-'}
                            {m.persen_bobot > 0 && ` · Bobot ${m.persen_bobot}%`}
                          </div>
                          {/* Progress slider */}
                          <div style={{ marginTop: '10px', marginLeft: '34px' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '12px',
                                marginBottom: '4px',
                              }}
                            >
                              <span style={{ color: 'var(--muted)' }}>Progress</span>
                              <strong>{m.persen_progress}%</strong>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  background: '#f0f0f0',
                                  borderRadius: '999px',
                                  height: '8px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${m.persen_progress}%`,
                                    height: '8px',
                                    background: m.persen_progress >= 100 ? '#27ae60' : 'var(--g1)',
                                    borderRadius: '999px',
                                    transition: 'width 0.4s',
                                  }}
                                />
                              </div>
                              {isAdmin && (
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  defaultValue={m.persen_progress}
                                  onMouseUp={(e) =>
                                    patch(`/proyek/milestones/${m.id}`, {
                                      persen_progress: e.target.value,
                                    })
                                  }
                                  style={{ width: '100px' }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB 2: KONTRAKTOR & KONTRAK ══ */}
          {tab === 2 && (
            <div>
              {showForm && isAdmin && (
                <div style={S.formCard}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <h3 style={{ ...S.formTitle, margin: 0 }}>Tambah Kontrak</h3>
                  </div>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Kontraktor *</label>
                      <select
                        value={fKontrak.kontraktor_id}
                        onChange={(e) =>
                          setFKontrak({
                            ...fKontrak,
                            kontraktor_id: e.target.value,
                          })
                        }
                        style={S.input}
                      >
                        <option value="">-- Pilih kontraktor --</option>
                        {kontraktorList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.nama} ({k.bidang})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>No. Kontrak</label>
                      <input
                        value={fKontrak.no_kontrak}
                        onChange={(e) =>
                          setFKontrak({
                            ...fKontrak,
                            no_kontrak: e.target.value,
                          })
                        }
                        style={S.input}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={S.label}>Lingkup Pekerjaan *</label>
                      <input
                        value={fKontrak.pekerjaan}
                        onChange={(e) =>
                          setFKontrak({
                            ...fKontrak,
                            pekerjaan: e.target.value,
                          })
                        }
                        style={S.input}
                        required
                        placeholder="Pekerjaan struktur Cluster A unit 01-20"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Nilai Kontrak (Rp) *</label>
                      <input
                        type="number"
                        value={fKontrak.nilai_kontrak}
                        onChange={(e) =>
                          setFKontrak({
                            ...fKontrak,
                            nilai_kontrak: e.target.value,
                          })
                        }
                        style={S.input}
                        required
                      />
                    </div>
                    <div>
                      <label style={S.label}>Termin Bayar</label>
                      <select
                        value={fKontrak.termin_bayar}
                        onChange={(e) =>
                          setFKontrak({
                            ...fKontrak,
                            termin_bayar: e.target.value,
                          })
                        }
                        style={S.input}
                      >
                        {['Bulanan', 'Per Milestone', 'Selesai'].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Tgl Mulai</label>
                      <input
                        type="date"
                        value={fKontrak.tgl_mulai}
                        onChange={(e) =>
                          setFKontrak({
                            ...fKontrak,
                            tgl_mulai: e.target.value,
                          })
                        }
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Tgl Akhir</label>
                      <input
                        type="date"
                        value={fKontrak.tgl_akhir}
                        onChange={(e) =>
                          setFKontrak({
                            ...fKontrak,
                            tgl_akhir: e.target.value,
                          })
                        }
                        style={S.input}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      marginTop: '14px',
                    }}
                  >
                    <button type="button" onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => post(`/proyek/${selectedProyek.id}/kontrak`, fKontrak)}
                    >
                      {submitting ? 'Menyimpan...' : 'Simpan Kontrak'}
                    </button>
                  </div>
                </div>
              )}

              {/* Daftar kontraktor global */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '20px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--muted)',
                      marginBottom: '10px',
                    }}
                  >
                    DATABASE KONTRAKTOR
                  </div>
                  {kontraktorList.map((k) => (
                    <div
                      key={k.id}
                      style={{
                        ...S.formCard,
                        padding: '12px 14px',
                        marginBottom: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <strong style={{ fontSize: '13px' }}>{k.nama}</strong>
                        <span style={{ ...S.badge, ...STATUS_COLOR[k.status] }}>{k.status}</span>
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--muted)',
                          marginTop: '3px',
                        }}
                      >
                        {k.bidang} · {k.total_proyek} proyek · {formatRp(k.total_nilai)}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '4px',
                          marginTop: '4px',
                        }}
                      >
                        {'⭐'.repeat(k.rating || 0)}
                      </div>
                      {k.hp && (
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>📱 {k.hp}</div>
                      )}
                    </div>
                  ))}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        const nama = window.prompt('Nama kontraktor:');
                        const bidang = window.prompt(
                          'Bidang (Struktur/Finishing/MEP/Landscape/Umum):',
                          'Umum'
                        );
                        const hp = window.prompt('No. HP:');
                        if (nama)
                          api
                            .post('/proyek/kontraktor', { nama, bidang, hp })
                            .then(() => fetchKontraktor());
                      }}
                      style={{ ...S.btnInfo, width: '100%', marginTop: '8px' }}
                    >
                      + Tambah Kontraktor
                    </button>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--muted)',
                      marginBottom: '10px',
                    }}
                  >
                    KONTRAK PROYEK INI
                  </div>
                  {kontrakList.length === 0 ? (
                    <EmptyState icon="◫" text="Belum ada kontrak." />
                  ) : (
                    <div style={S.tableWrapper}>
                      <table style={S.table}>
                        <thead>
                          <tr>
                            {[
                              'Kontraktor',
                              'Pekerjaan',
                              'Nilai',
                              'Terbayar',
                              'Sisa',
                              'Status',
                              'Aksi',
                            ].map((h) => (
                              <th key={h} style={S.th}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {kontrakList.map((k) => {
                            const sisa = k.nilai_kontrak - k.terbayar;
                            return (
                              <tr key={k.id} style={S.tr}>
                                <td style={S.td}>
                                  <strong>{k.nama_kontraktor}</strong>
                                  <div
                                    style={{
                                      fontSize: '11px',
                                      color: 'var(--muted)',
                                    }}
                                  >
                                    {k.bidang}
                                  </div>
                                </td>
                                <td style={S.td}>{k.pekerjaan}</td>
                                <td style={S.td}>{formatRp(k.nilai_kontrak)}</td>
                                <td style={{ ...S.td, color: '#27ae60' }}>
                                  {formatRp(k.terbayar)}
                                </td>
                                <td
                                  style={{
                                    ...S.td,
                                    color: sisa > 0 ? '#e74c3c' : '#27ae60',
                                  }}
                                >
                                  {formatRp(sisa)}
                                </td>
                                <td style={S.td}>
                                  <span
                                    style={{
                                      ...S.badge,
                                      ...STATUS_COLOR[k.status],
                                    }}
                                  >
                                    {k.status}
                                  </span>
                                </td>
                                <td style={S.td}>
                                  {isAdmin && (
                                    <select
                                      defaultValue={k.status}
                                      onChange={(e) =>
                                        patch(`/proyek/kontrak/${k.id}`, {
                                          status: e.target.value,
                                        })
                                      }
                                      style={{
                                        ...S.input,
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        width: 'auto',
                                      }}
                                    >
                                      {['Draft', 'Aktif', 'Selesai', 'Putus'].map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB 3: MATERIAL ══ */}
          {tab === 3 && (
            <div>
              {showForm && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Tambah Material</h3>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Nama Material *</label>
                      <input
                        value={fMaterial.nama}
                        onChange={(e) => setFMaterial({ ...fMaterial, nama: e.target.value })}
                        required
                        style={S.input}
                        placeholder="Semen, Besi, Bata..."
                      />
                    </div>
                    <div>
                      <label style={S.label}>Satuan</label>
                      <input
                        value={fMaterial.satuan}
                        onChange={(e) => setFMaterial({ ...fMaterial, satuan: e.target.value })}
                        style={S.input}
                        placeholder="Sak, Batang, M3..."
                      />
                    </div>
                    <div>
                      <label style={S.label}>Harga Satuan (Rp)</label>
                      <input
                        type="number"
                        value={fMaterial.harga_satuan}
                        onChange={(e) =>
                          setFMaterial({
                            ...fMaterial,
                            harga_satuan: e.target.value,
                          })
                        }
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Supplier</label>
                      <input
                        value={fMaterial.supplier}
                        onChange={(e) =>
                          setFMaterial({
                            ...fMaterial,
                            supplier: e.target.value,
                          })
                        }
                        style={S.input}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      marginTop: '14px',
                    }}
                  >
                    <button type="button" onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => post(`/proyek/${selectedProyek.id}/material`, fMaterial)}
                    >
                      {submitting ? 'Menyimpan...' : 'Tambah'}
                    </button>
                  </div>
                </div>
              )}

              {materialList.length === 0 ? (
                <EmptyState icon="▣" text="Belum ada material." />
              ) : (
                <div style={S.tableWrapper}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {[
                          'Material',
                          'Satuan',
                          'Harga/Satuan',
                          'Masuk',
                          'Keluar',
                          'Sisa',
                          'Supplier',
                          'Aksi',
                        ].map((h) => (
                          <th key={h} style={S.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {materialList.map((m) => (
                        <tr key={m.id} style={S.tr}>
                          <td style={S.td}>
                            <strong>{m.nama}</strong>
                          </td>
                          <td style={S.td}>{m.satuan || '-'}</td>
                          <td style={S.td}>{m.harga_satuan ? formatRp(m.harga_satuan) : '-'}</td>
                          <td style={{ ...S.td, color: '#27ae60' }}>
                            {m.stok_masuk} {m.satuan}
                          </td>
                          <td style={{ ...S.td, color: '#e74c3c' }}>
                            {m.stok_keluar} {m.satuan}
                          </td>
                          <td
                            style={{
                              ...S.td,
                              fontWeight: '700',
                              color: m.stok_sisa <= 0 ? '#e74c3c' : 'var(--g1)',
                            }}
                          >
                            {m.stok_sisa} {m.satuan}
                            {m.stok_sisa <= 0 && (
                              <div style={{ fontSize: '10px', color: '#e74c3c' }}>HABIS!</div>
                            )}
                          </td>
                          <td style={S.td}>{m.supplier || '-'}</td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button onClick={() => setShowMatLog(m)} style={S.btnInfo}>
                                + Stok
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ TAB 4: FOTO LAPANGAN ══ */}
          {tab === 4 && (
            <div>
              {showForm && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Upload Foto Lapangan</h3>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Judul</label>
                      <input
                        value={fFoto.judul}
                        onChange={(e) => setFFoto({ ...fFoto, judul: e.target.value })}
                        style={S.input}
                        placeholder="Progress pondasi unit A1"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Milestone (opsional)</label>
                      <select
                        value={fFoto.milestone_id}
                        onChange={(e) => setFFoto({ ...fFoto, milestone_id: e.target.value })}
                        style={S.input}
                      >
                        <option value="">--</option>
                        {milestones.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={S.label}>Foto (bisa multiple) *</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setFotoFiles(e.target.files)}
                        style={S.input}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={S.label}>Keterangan</label>
                      <textarea
                        value={fFoto.keterangan}
                        onChange={(e) => setFFoto({ ...fFoto, keterangan: e.target.value })}
                        rows={2}
                        style={{ ...S.input, resize: 'vertical' }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      marginTop: '14px',
                    }}
                  >
                    <button type="button" onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => {
                        if (!fotoFiles?.length) return alert('Pilih foto dulu');
                        const fd = new FormData();
                        Object.entries(fFoto).forEach(([k, v]) => fd.append(k, v));
                        Array.from(fotoFiles).forEach((f) => fd.append('foto', f));
                        post(`/proyek/${selectedProyek.id}/foto`, fd, true);
                      }}
                    >
                      {submitting ? 'Mengupload...' : 'Upload Foto'}
                    </button>
                  </div>
                </div>
              )}

              {fotoList.length === 0 ? (
                <EmptyState icon="◎" text="Belum ada foto lapangan." />
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {fotoList.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        background: 'var(--surface)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-soft)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}${f.foto_url}`}
                        alt={f.judul}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div style={{ padding: '10px 12px' }}>
                        {f.judul && (
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: 'var(--g1)',
                            }}
                          >
                            {f.judul}
                          </div>
                        )}
                        {f.keterangan && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--muted)',
                              marginTop: '3px',
                            }}
                          >
                            {f.keterangan}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: '10px',
                            color: 'var(--muted)',
                            marginTop: '4px',
                          }}
                        >
                          {formatTgl(f.created_at)} · {f.uploaded_by}
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => api.delete(`/proyek/foto/${f.id}`).then(fetchTabData)}
                            style={{
                              ...S.btnDanger,
                              marginTop: '6px',
                              padding: '3px 8px',
                              fontSize: '10px',
                            }}
                          >
                            🗑️ Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB 5: PEKERJA & ABSENSI ══ */}
          {tab === 5 && (
            <div>
              {showForm && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Tambah Pekerja</h3>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Nama *</label>
                      <input
                        value={fPekerja.nama}
                        onChange={(e) => setFPekerja({ ...fPekerja, nama: e.target.value })}
                        required
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Jabatan</label>
                      <select
                        value={fPekerja.jabatan}
                        onChange={(e) => setFPekerja({ ...fPekerja, jabatan: e.target.value })}
                        style={S.input}
                      >
                        {['Mandor', 'Tukang', 'Laden', 'Spesialis'].map((j) => (
                          <option key={j} value={j}>
                            {j}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>No. HP</label>
                      <input
                        value={fPekerja.hp}
                        onChange={(e) => setFPekerja({ ...fPekerja, hp: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Upah Harian (Rp)</label>
                      <input
                        type="number"
                        value={fPekerja.upah_harian}
                        onChange={(e) =>
                          setFPekerja({
                            ...fPekerja,
                            upah_harian: e.target.value,
                          })
                        }
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Tgl Masuk</label>
                      <input
                        type="date"
                        value={fPekerja.tgl_masuk}
                        onChange={(e) =>
                          setFPekerja({
                            ...fPekerja,
                            tgl_masuk: e.target.value,
                          })
                        }
                        style={S.input}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      marginTop: '14px',
                    }}
                  >
                    <button type="button" onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => post(`/proyek/${selectedProyek.id}/pekerja`, fPekerja)}
                    >
                      {submitting ? 'Menyimpan...' : 'Tambah'}
                    </button>
                  </div>
                </div>
              )}

              {pekerjaList.length === 0 ? (
                <EmptyState icon="◉" text="Belum ada pekerja." />
              ) : (
                <div style={S.tableWrapper}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {['Nama', 'Jabatan', 'HP', 'Upah/Hari', 'Tgl Masuk', 'Status', 'Aksi'].map(
                          (h) => (
                            <th key={h} style={S.th}>
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {pekerjaList.map((p) => (
                        <tr key={p.id} style={S.tr}>
                          <td style={S.td}>
                            <strong>{p.nama}</strong>
                          </td>
                          <td style={S.td}>{p.jabatan}</td>
                          <td style={S.td}>{p.hp || '-'}</td>
                          <td style={S.td}>{formatRp(p.upah_harian)}</td>
                          <td style={S.td}>{p.tgl_masuk ? formatTgl(p.tgl_masuk) : '-'}</td>
                          <td style={S.td}>
                            <span style={{ ...S.badge, ...STATUS_COLOR[p.status] }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={S.td}>
                            <button
                              onClick={() => {
                                setShowAbsensi(p);
                                fetchAbsensi(p.id);
                              }}
                              style={S.btnInfo}
                            >
                              📋 Absensi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ TAB 6: INSPEKSI QC ══ */}
          {tab === 6 && (
            <div>
              {showForm && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Buat Inspeksi Baru</h3>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Unit *</label>
                      <select
                        value={fInspeksi.unit_id}
                        onChange={(e) =>
                          setFInspeksi({
                            ...fInspeksi,
                            unit_id: e.target.value,
                          })
                        }
                        style={S.input}
                      >
                        <option value="">-- Pilih unit --</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.kode} — Blok {u.blok}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Tipe Inspeksi</label>
                      <select
                        value={fInspeksi.tipe}
                        onChange={(e) => setFInspeksi({ ...fInspeksi, tipe: e.target.value })}
                        style={S.input}
                      >
                        {['Struktur', 'Finishing', 'MEP', 'Final'].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Inspektor</label>
                      <input
                        value={fInspeksi.inspektor}
                        onChange={(e) =>
                          setFInspeksi({
                            ...fInspeksi,
                            inspektor: e.target.value,
                          })
                        }
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Tanggal Inspeksi *</label>
                      <input
                        type="date"
                        value={fInspeksi.tgl_inspeksi}
                        onChange={(e) =>
                          setFInspeksi({
                            ...fInspeksi,
                            tgl_inspeksi: e.target.value,
                          })
                        }
                        style={S.input}
                        required
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'var(--cream)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '12px',
                      fontSize: '12px',
                      color: 'var(--muted)',
                    }}
                  >
                    ℹ️ Checklist item akan otomatis dibuat sesuai tipe inspeksi yang dipilih
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '8px',
                      marginTop: '14px',
                    }}
                  >
                    <button type="button" onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => post(`/proyek/${selectedProyek.id}/inspeksi`, fInspeksi)}
                    >
                      {submitting ? 'Menyimpan...' : 'Buat Inspeksi'}
                    </button>
                  </div>
                </div>
              )}

              {inspeksiList.length === 0 ? (
                <EmptyState icon="✦" text="Belum ada inspeksi." />
              ) : (
                <div style={S.tableWrapper}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {['Unit', 'Tipe', 'Inspektor', 'Tgl Inspeksi', 'Status', 'Aksi'].map(
                          (h) => (
                            <th key={h} style={S.th}>
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {inspeksiList.map((ins) => (
                        <tr key={ins.id} style={S.tr}>
                          <td style={S.td}>
                            <strong>{ins.unit_kode}</strong>
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                ...S.badge,
                                background: 'var(--info-soft)',
                                color: 'var(--blue)',
                              }}
                            >
                              {ins.tipe}
                            </span>
                          </td>
                          <td style={S.td}>{ins.inspektor || '-'}</td>
                          <td style={S.td}>{formatTgl(ins.tgl_inspeksi)}</td>
                          <td style={S.td}>
                            <span
                              style={{
                                ...S.badge,
                                ...STATUS_COLOR[ins.status],
                              }}
                            >
                              {ins.status}
                            </span>
                          </td>
                          <td style={S.td}>
                            <button onClick={() => fetchDetailInspeksi(ins.id)} style={S.btnInfo}>
                              {ins.status === 'Perlu Perbaikan' && isAdmin ? '✏️ Isi' : '👁️ Lihat'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Modal Absensi ─────────────────────────────── */}
      {showAbsensi && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <div>
                <h2 style={S.modalTitle}>Absensi — {showAbsensi.nama}</h2>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {showAbsensi.jabatan} · Upah {formatRp(showAbsensi.upah_harian)}/hari
                </div>
              </div>
              <button onClick={() => setShowAbsensi(null)} style={S.btnClose}>
                ✕
              </button>
            </div>

            {/* Form absensi */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ flex: 1 }}>
                <label style={S.label}>Tanggal</label>
                <input
                  type="date"
                  value={fAbsensi.tgl}
                  onChange={(e) => setFAbsensi({ ...fAbsensi, tgl: e.target.value })}
                  style={S.input}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Status</label>
                <select
                  value={fAbsensi.status}
                  onChange={(e) => setFAbsensi({ ...fAbsensi, status: e.target.value })}
                  style={S.input}
                >
                  {['Hadir', 'Tidak Hadir', 'Izin', 'Setengah Hari'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                style={S.btnPrimary}
                onClick={async () => {
                  await api.post(`/proyek/pekerja/${showAbsensi.id}/absensi`, fAbsensi);
                  fetchAbsensi(showAbsensi.id);
                }}
              >
                Catat
              </button>
            </div>

            {/* Ringkasan bulan ini */}
            {absensiList.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                {[
                  {
                    label: 'Hadir',
                    val: absensiList.filter((a) => a.status === 'Hadir').length,
                    color: '#27ae60',
                  },
                  {
                    label: 'Tidak Hadir',
                    val: absensiList.filter((a) => a.status === 'Tidak Hadir').length,
                    color: '#e74c3c',
                  },
                  {
                    label: 'Total Upah',
                    val: formatRp(totalUpahBulan()),
                    color: 'var(--g1)',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: 'var(--cream)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      flex: 1,
                    }}
                  >
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.label}</div>
                    <div style={{ fontWeight: '700', color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* List absensi */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {absensiList.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f5f5f5',
                    fontSize: '13px',
                  }}
                >
                  <span>{formatTgl(a.tgl)}</span>
                  <span
                    style={{
                      color:
                        a.status === 'Hadir'
                          ? '#27ae60'
                          : a.status === 'Tidak Hadir'
                            ? '#e74c3c'
                            : '#f39c12',
                    }}
                  >
                    {a.status}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>
                    {a.upah_dibayar > 0 ? formatRp(a.upah_dibayar) : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Stok Material ───────────────────────── */}
      {showMatLog && (
        <div style={S.overlay}>
          <div style={{ ...S.modal, maxWidth: '400px' }}>
            <div style={S.modalHeader}>
              <h2 style={S.modalTitle}>Stok — {showMatLog.nama}</h2>
              <button onClick={() => setShowMatLog(null)} style={S.btnClose}>
                ✕
              </button>
            </div>
            <div
              style={{
                background: 'var(--cream)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                textAlign: 'center',
                fontSize: '13px',
              }}
            >
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Masuk</div>
                <strong style={{ color: '#27ae60' }}>
                  {showMatLog.stok_masuk} {showMatLog.satuan}
                </strong>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Keluar</div>
                <strong style={{ color: '#e74c3c' }}>
                  {showMatLog.stok_keluar} {showMatLog.satuan}
                </strong>
              </div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Sisa</div>
                <strong style={{ color: 'var(--g1)' }}>
                  {showMatLog.stok_sisa} {showMatLog.satuan}
                </strong>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={S.label}>Tipe *</label>
                <select
                  value={fMatLog.tipe}
                  onChange={(e) => setFMatLog({ ...fMatLog, tipe: e.target.value })}
                  style={S.input}
                >
                  <option value="Masuk">Masuk</option>
                  <option value="Keluar">Keluar</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Jumlah ({showMatLog.satuan}) *</label>
                <input
                  type="number"
                  value={fMatLog.jumlah}
                  onChange={(e) => setFMatLog({ ...fMatLog, jumlah: e.target.value })}
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Tanggal</label>
                <input
                  type="date"
                  value={fMatLog.tgl}
                  onChange={(e) => setFMatLog({ ...fMatLog, tgl: e.target.value })}
                  style={S.input}
                />
              </div>
              <div>
                <label style={S.label}>Keterangan</label>
                <input
                  value={fMatLog.keterangan}
                  onChange={(e) => setFMatLog({ ...fMatLog, keterangan: e.target.value })}
                  style={S.input}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button onClick={() => setShowMatLog(null)} style={{ ...S.btnSecondary, flex: 1 }}>
                Batal
              </button>
              <button
                disabled={submitting}
                style={{ ...S.btnPrimary, flex: 2 }}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await api.post(`/proyek/material/${showMatLog.id}/log`, fMatLog);
                    setShowMatLog(null);
                    fetchTabData();
                  } catch (err) {
                    alert(err.response?.data?.message || 'Gagal');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? 'Menyimpan...' : 'Catat Stok'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Inspeksi Detail ─────────────────────── */}
      {detailInspeksi && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <div>
                <h2 style={S.modalTitle}>Inspeksi {detailInspeksi.tipe}</h2>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Unit {detailInspeksi.unit_kode} · {formatTgl(detailInspeksi.tgl_inspeksi)}
                </div>
              </div>
              <button onClick={() => setDetailInspeksi(null)} style={S.btnClose}>
                ✕
              </button>
            </div>

            <table style={{ ...S.table, marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th style={S.th}>Item</th>
                  <th style={S.th}>Hasil</th>
                  <th style={S.th}>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {editItems.map((it, i) => (
                  <tr key={it.id} style={S.tr}>
                    <td style={S.td}>{it.item}</td>
                    <td style={S.td}>
                      {isAdmin && detailInspeksi.status === 'Perlu Perbaikan' ? (
                        <select
                          value={editItems[i].hasil}
                          onChange={(e) => {
                            const u = [...editItems];
                            u[i] = { ...u[i], hasil: e.target.value };
                            setEditItems(u);
                          }}
                          style={{ ...S.input, padding: '4px 8px' }}
                        >
                          {['OK', 'Tidak OK', 'N/A'].map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          style={{
                            ...S.badge,
                            background:
                              it.hasil === 'OK'
                                ? 'var(--success-soft)'
                                : it.hasil === 'Tidak OK'
                                  ? 'var(--danger-soft)'
                                  : 'var(--surface-soft)',
                            color:
                              it.hasil === 'OK'
                                ? '#27ae60'
                                : it.hasil === 'Tidak OK'
                                  ? '#e74c3c'
                                  : '#999',
                          }}
                        >
                          {it.hasil}
                        </span>
                      )}
                    </td>
                    <td style={S.td}>
                      {isAdmin && detailInspeksi.status === 'Perlu Perbaikan' ? (
                        <input
                          value={editItems[i].catatan || ''}
                          onChange={(e) => {
                            const u = [...editItems];
                            u[i] = { ...u[i], catatan: e.target.value };
                            setEditItems(u);
                          }}
                          style={{ ...S.input, padding: '4px 8px' }}
                        />
                      ) : (
                        it.catatan || '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {isAdmin && detailInspeksi.status === 'Perlu Perbaikan' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setDetailInspeksi(null)}
                  style={{ ...S.btnSecondary, flex: 1 }}
                >
                  Batal
                </button>
                <button
                  style={{ ...S.btnDanger, flex: 1 }}
                  onClick={() => {
                    patch(`/proyek/inspeksi/${detailInspeksi.id}/finalisasi`, {
                      items: editItems,
                      status: 'Tidak Lulus',
                    });
                    setDetailInspeksi(null);
                  }}
                >
                  ✕ Tidak Lulus
                </button>
                <button
                  style={{ ...S.btnSuccess, flex: 1 }}
                  onClick={() => {
                    patch(`/proyek/inspeksi/${detailInspeksi.id}/finalisasi`, {
                      items: editItems,
                      status: 'Lulus',
                    });
                    setDetailInspeksi(null);
                  }}
                >
                  ✓ Lulus
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────
function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ fontSize: '40px' }}>{icon}</div>
      <p style={{ color: 'var(--muted)', marginTop: '10px' }}>{text}</p>
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
  if (!tgl) return '-';
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const S = {
  pageTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text)',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: { fontSize: '14px', color: 'var(--muted)', marginTop: '4px' },
  proyekBtn: {
    padding: '8px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'var(--sans)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  infoBar: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '16px 20px',
    marginBottom: '20px',
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    flexWrap: 'wrap',
    boxShadow: 'var(--shadow-soft)',
    fontSize: '13px',
  },
  infoLbl: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '2px',
  },
  tabBar: {
    display: 'flex',
    gap: '6px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '8px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'var(--sans)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  },
  formCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: 'var(--shadow-soft)',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text)',
    marginBottom: '16px',
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
    fontFamily: 'var(--sans)',
    outline: 'none',
  },
  tableWrapper: {
    background: 'var(--surface)',
    borderRadius: '16px',
    overflow: 'auto',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    background: 'var(--surface-soft)',
    textTransform: 'uppercase',
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: 'var(--text)',
    verticalAlign: 'top',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
  },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--surface)',
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
    fontFamily: 'var(--sans)',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px var(--accent-soft)',
  },
  btnSecondary: {
    padding: '10px 24px',
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  btnInfo: {
    padding: '6px 14px',
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--blue)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnSuccess: {
    padding: '6px 14px',
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
  btnDanger: {
    padding: '6px 14px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--red)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
};
