import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const TABS = [
  { label: 'Dokumen', icon: '▤' },
  { label: 'Sertifikat', icon: '◈' },
  { label: 'Perizinan', icon: '⊙' },
  { label: 'PPJB & AJB', icon: '◉' },
  { label: 'E-Sign', icon: '✦' },
  { label: 'Arsip', icon: '⬡' },
  { label: 'KPR', icon: '⌂' },
];

const STATUS_COLOR = {
  // Dokumen
  Lengkap: { bg: 'var(--success-soft)', color: 'var(--success)' },
  Kurang: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  Ditolak: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  'Belum Ada': { bg: 'var(--surface-soft)', color: 'var(--muted)' },
  'Dalam Proses': { bg: 'var(--info-soft)', color: 'var(--blue)' },
  // Sertifikat
  Proses: { bg: 'var(--info-soft)', color: 'var(--blue)' },
  Terbit: { bg: 'var(--success-soft)', color: 'var(--success)' },
  Diserahkan: { bg: 'var(--purple-soft)', color: 'var(--purple)' },
  Bermasalah: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  // Perizinan
  Draft: { bg: 'var(--surface-soft)', color: 'var(--muted)' },
  Diajukan: { bg: 'var(--info-soft)', color: 'var(--blue)' },
  Diproses: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  Kadaluarsa: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  // Akad
  Dijadwalkan: { bg: 'var(--info-soft)', color: 'var(--blue)' },
  Selesai: { bg: 'var(--success-soft)', color: 'var(--success)' },
  Batal: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  // KPR
  Persiapan: { bg: 'var(--surface-soft)', color: 'var(--muted)' },
  OTS: { bg: 'var(--info-soft)', color: 'var(--blue)' },
  SP3K: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  Akad: { bg: 'var(--purple-soft)', color: 'var(--purple)' },
  Cair: { bg: 'var(--success-soft)', color: 'var(--success)' },
  // E-Sign
  Menunggu: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  Ditandatangani: { bg: 'var(--success-soft)', color: 'var(--success)' },
};

const JENIS_DOKUMEN = ['KTP', 'KK', 'NPWP', 'Slip Gaji', 'Rekening Bank', 'Akad', 'Lainnya'];

export default function Legal() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'direktur'].includes(user?.role);
  const isCustomer = user?.role === 'customer';

  const [tab, setTab] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data per tab
  const [dokRingkasan, setDokRingkasan] = useState([]);
  const [dokList, setDokList] = useState([]);
  const [sertList, setSertList] = useState([]);
  const [izinList, setIzinList] = useState([]);
  const [akadList, setAkadList] = useState([]);
  const [esignList, setEsignList] = useState([]);
  const [arsipList, setArsipList] = useState([]);
  const [kprList, setKprList] = useState([]);

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [arsipQ, setArsipQ] = useState('');

  // Forms
  const [fDok, setFDok] = useState({
    customer_id: '',
    jenis: 'KTP',
    catatan: '',
  });
  const [fileDok, setFileDok] = useState(null);
  const [fSert, setFSert] = useState({
    unit_id: '',
    tipe: 'SHM',
    nomor: '',
    atas_nama: '',
    luas_tertera: '',
    tgl_terbit: '',
    tgl_akhir: '',
    lokasi_simpan: '',
    catatan: '',
  });
  const [fileSert, setFileSert] = useState(null);
  const [fIzin, setFIzin] = useState({
    nama_izin: '',
    tipe: 'IMB',
    nomor: '',
    instansi: '',
    tgl_pengajuan: '',
    proyek: '',
    catatan: '',
  });
  const [fileIzin, setFileIzin] = useState(null);
  const [fAkad, setFAkad] = useState({
    customer_id: '',
    unit_id: '',
    tipe: 'PPJB',
    nomor_akta: '',
    notaris: '',
    ppat: '',
    tgl_akad: '',
    nilai_transaksi: '',
    catatan: '',
  });
  const [fEsign, setFEsign] = useState({
    customer_id: '',
    akad_id: '',
    judul: '',
    deskripsi: '',
  });
  const [fArsip, setFArsip] = useState({
    nama: '',
    kategori: 'Lainnya',
    customer_id: '',
    unit_id: '',
    tags: '',
    deskripsi: '',
  });
  const [fileArsip, setFileArsip] = useState(null);
  const [fKpr, setFKpr] = useState({
    customer_id: '',
    unit_id: '',
    bank: '',
    no_pengajuan: '',
    nominal_kpr: '',
    tenor_tahun: '',
    bunga_persen: '',
    tgl_pengajuan: '',
    nama_ao: '',
    hp_ao: '',
    catatan: '',
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const promises = [
        api.get('/legal/sertifikat'),
        api.get('/legal/perizinan'),
        api.get('/legal/akad'),
        api.get('/legal/esign'),
        api.get('/legal/arsip'),
        api.get('/legal/kpr'),
      ];
      if (!isCustomer)
        promises.push(
          api.get('/legal/dokumen/ringkasan'),
          api.get('/customers'),
          api.get('/units')
        );
      const results = await Promise.allSettled(promises);
      setSertList(results[0].status === 'fulfilled' ? results[0].value.data : []);
      setIzinList(results[1].status === 'fulfilled' ? results[1].value.data : []);
      setAkadList(results[2].status === 'fulfilled' ? results[2].value.data : []);
      setEsignList(results[3].status === 'fulfilled' ? results[3].value.data : []);
      setArsipList(results[4].status === 'fulfilled' ? results[4].value.data : []);
      setKprList(results[5].status === 'fulfilled' ? results[5].value.data : []);
      if (!isCustomer) {
        setDokRingkasan(results[6].status === 'fulfilled' ? results[6].value.data : []);
        setCustomers(results[7].status === 'fulfilled' ? results[7].value.data : []);
        setUnits(results[8].status === 'fulfilled' ? results[8].value.data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  const fetchDokByCustomer = useCallback(async (custId) => {
    const res = await api.get(`/legal/dokumen?customer_id=${custId}`);
    setDokList(res.data);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (tab === 0 && selectedCust) fetchDokByCustomer(selectedCust);
  }, [tab, selectedCust, fetchDokByCustomer]);

  function getCustUnitId(custId) {
    return customers.find((c) => c.id == custId)?.unit_id || '';
  }

  // ── Submit helpers ────────────────────────────────────────
  async function submit(url, formData, isMultipart = false) {
    setSubmitting(true);
    try {
      const opts = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      await api.post(url, formData, opts);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePatchStatus(url, body) {
    try {
      await api.patch(url, body);
      fetchAll();
    } catch {
      alert('Gagal update');
    }
  }

  // ── Search arsip ──────────────────────────────────────────
  async function searchArsip() {
    const res = await api.get(`/legal/arsip?q=${arsipQ}`);
    setArsipList(res.data);
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div>
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>Legal & Dokumen</h1>
          <p style={S.pageSubtitle}>Kelola sertifikat, perizinan, akad, dan arsip digital</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={S.btnPrimary}>
          {showForm ? '✕ Tutup' : '+ Tambah'}
        </button>
      </div>

      {/* Tab Bar */}
      <div style={S.tabBar}>
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => {
              setTab(i);
              setShowForm(false);
            }}
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

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : (
        <>
          {/* ══════ TAB 0: DOKUMEN CUSTOMER ══════ */}
          {tab === 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: selectedCust ? '280px 1fr' : '1fr',
                gap: '20px',
              }}
            >
              {/* Kiri: List customer */}
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--muted)',
                    marginBottom: '10px',
                  }}
                >
                  PILIH CUSTOMER
                </div>
                {dokRingkasan.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCust(c.id);
                      fetchDokByCustomer(c.id);
                    }}
                    style={{
                      ...S.custCard,
                      border:
                        selectedCust === c.id ? '2px solid var(--g1)' : '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <strong style={{ fontSize: '13px' }}>{c.nama}</strong>
                      <span
                        style={{
                          ...S.badge,
                          ...STATUS_COLOR[c.status_keseluruhan],
                        }}
                      >
                        {c.status_keseluruhan}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--muted)',
                        marginTop: '3px',
                      }}
                    >
                      Unit {c.unit_kode} · {c.lengkap}/{c.total_dok} dok lengkap
                    </div>
                  </div>
                ))}
              </div>

              {/* Kanan: Dokumen per customer */}
              {selectedCust && (
                <div>
                  {showForm && (
                    <div style={{ ...S.formCard, marginBottom: '16px' }}>
                      <h3 style={S.formTitle}>Upload Dokumen</h3>
                      <div style={S.formGrid}>
                        <div>
                          <label style={S.label}>Jenis Dokumen</label>
                          <select
                            value={fDok.jenis}
                            onChange={(e) => setFDok({ ...fDok, jenis: e.target.value })}
                            style={S.input}
                          >
                            {JENIS_DOKUMEN.map((j) => (
                              <option key={j} value={j}>
                                {j}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={S.label}>File</label>
                          <input
                            type="file"
                            onChange={(e) => setFileDok(e.target.files[0])}
                            style={S.input}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: '10px' }}>
                        <label style={S.label}>Catatan</label>
                        <input
                          value={fDok.catatan}
                          onChange={(e) => setFDok({ ...fDok, catatan: e.target.value })}
                          style={S.input}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '8px',
                          marginTop: '12px',
                        }}
                      >
                        <button onClick={() => setShowForm(false)} style={S.btnSecondary}>
                          Batal
                        </button>
                        <button
                          disabled={submitting}
                          style={S.btnPrimary}
                          onClick={() => {
                            const fd = new FormData();
                            fd.append('customer_id', selectedCust);
                            fd.append('jenis', fDok.jenis);
                            fd.append('catatan', fDok.catatan);
                            if (fileDok) fd.append('file', fileDok);
                            submit('/legal/dokumen', fd, true);
                          }}
                        >
                          {submitting ? 'Menyimpan...' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={S.tableWrapper}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          {['Jenis', 'File', 'Status', 'Catatan', 'Aksi'].map((h) => (
                            <th key={h} style={S.th}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {JENIS_DOKUMEN.filter((j) => j !== 'Lainnya').map((jenis) => {
                          const dok = dokList.find((d) => d.jenis === jenis);
                          return (
                            <tr key={jenis} style={S.tr}>
                              <td style={S.td}>
                                <strong>{jenis}</strong>
                              </td>
                              <td style={S.td}>
                                {dok?.file_url ? (
                                  <a
                                    href={`${import.meta.env.VITE_API_URL}${dok.file_url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      color: 'var(--g1)',
                                      fontWeight: '600',
                                    }}
                                  >
                                    📄 Lihat
                                  </a>
                                ) : (
                                  <span style={{ color: 'var(--muted)' }}>Belum upload</span>
                                )}
                              </td>
                              <td style={S.td}>
                                {dok ? (
                                  <span
                                    style={{
                                      ...S.badge,
                                      ...STATUS_COLOR[dok.status],
                                    }}
                                  >
                                    {dok.status}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      ...S.badge,
                                      ...STATUS_COLOR['Belum Ada'],
                                    }}
                                  >
                                    Belum Ada
                                  </span>
                                )}
                              </td>
                              <td style={S.td}>{dok?.catatan || '-'}</td>
                              <td style={S.td}>
                                {isAdmin && dok && dok.status !== 'Lengkap' && (
                                  <button
                                    onClick={() =>
                                      handlePatchStatus(`/legal/dokumen/${dok.id}/verifikasi`, {
                                        status: 'Lengkap',
                                      })
                                    }
                                    style={S.btnSuccess}
                                  >
                                    ✓ Verifikasi
                                  </button>
                                )}
                                {isAdmin && dok && dok.status === 'Lengkap' && (
                                  <button
                                    onClick={() =>
                                      handlePatchStatus(`/legal/dokumen/${dok.id}/verifikasi`, {
                                        status: 'Ditolak',
                                      })
                                    }
                                    style={S.btnDanger}
                                  >
                                    Tolak
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════ TAB 1: SERTIFIKAT ══════ */}
          {tab === 1 && (
            <div>
              {showForm && isAdmin && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Tambah Sertifikat</h3>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Unit *</label>
                      <select
                        value={fSert.unit_id}
                        onChange={(e) => setFSert({ ...fSert, unit_id: e.target.value })}
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
                      <label style={S.label}>Tipe Sertifikat *</label>
                      <select
                        value={fSert.tipe}
                        onChange={(e) => setFSert({ ...fSert, tipe: e.target.value })}
                        style={S.input}
                      >
                        {['SHM', 'HGB', 'SHGB', 'AJB', 'GIRIK', 'Lainnya'].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Nomor Sertifikat</label>
                      <input
                        value={fSert.nomor}
                        onChange={(e) => setFSert({ ...fSert, nomor: e.target.value })}
                        style={S.input}
                        placeholder="No. sertifikat"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Atas Nama</label>
                      <input
                        value={fSert.atas_nama}
                        onChange={(e) => setFSert({ ...fSert, atas_nama: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Luas Tertera (m²)</label>
                      <input
                        type="number"
                        value={fSert.luas_tertera}
                        onChange={(e) => setFSert({ ...fSert, luas_tertera: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Tanggal Terbit</label>
                      <input
                        type="date"
                        value={fSert.tgl_terbit}
                        onChange={(e) => setFSert({ ...fSert, tgl_terbit: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Berlaku s/d (HGB)</label>
                      <input
                        type="date"
                        value={fSert.tgl_akhir}
                        onChange={(e) => setFSert({ ...fSert, tgl_akhir: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Lokasi Simpan</label>
                      <input
                        value={fSert.lokasi_simpan}
                        onChange={(e) => setFSert({ ...fSert, lokasi_simpan: e.target.value })}
                        style={S.input}
                        placeholder="Lemari/brankas/notaris"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Upload File</label>
                      <input
                        type="file"
                        onChange={(e) => setFileSert(e.target.files[0])}
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
                    <button onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => {
                        const fd = new FormData();
                        Object.entries(fSert).forEach(([k, v]) => fd.append(k, v));
                        if (fileSert) fd.append('file', fileSert);
                        submit('/legal/sertifikat', fd, true);
                      }}
                    >
                      {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </div>
              )}
              <DataTable
                cols={[
                  'Unit',
                  'Tipe',
                  'Nomor',
                  'Atas Nama',
                  'Luas',
                  'Tgl Terbit',
                  'Berlaku s/d',
                  'Lokasi',
                  'Status',
                  'Aksi',
                ]}
                rows={sertList}
                renderRow={(s) => {
                  const sisaHari = s.tgl_akhir
                    ? Math.ceil((new Date(s.tgl_akhir) - new Date()) / 86400000)
                    : null;
                  return (
                    <tr key={s.id} style={S.tr}>
                      <td style={S.td}>
                        <strong>{s.unit_kode}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Blok {s.blok}</div>
                      </td>
                      <td style={S.td}>
                        <span
                          style={{
                            ...S.badge,
                            background: '#e3f2fd',
                            color: '#1565c0',
                          }}
                        >
                          {s.tipe}
                        </span>
                      </td>
                      <td style={S.td}>{s.nomor || '-'}</td>
                      <td style={S.td}>{s.atas_nama || '-'}</td>
                      <td style={S.td}>{s.luas_tertera ? `${s.luas_tertera} m²` : '-'}</td>
                      <td style={S.td}>{s.tgl_terbit ? formatTgl(s.tgl_terbit) : '-'}</td>
                      <td style={S.td}>
                        {s.tgl_akhir ? (
                          <>
                            {formatTgl(s.tgl_akhir)}
                            {sisaHari !== null && sisaHari <= 365 && (
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: sisaHari <= 90 ? '#e74c3c' : '#f39c12',
                                  fontWeight: '700',
                                }}
                              >
                                {sisaHari > 0 ? `${sisaHari} hari lagi` : 'KADALUARSA'}
                              </div>
                            )}
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={S.td}>{s.lokasi_simpan || '-'}</td>
                      <td style={S.td}>
                        <StatusBadge status={s.status} />
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {s.file_url && <FileLink url={s.file_url} />}
                          {isAdmin && (
                            <select
                              defaultValue={s.status}
                              onChange={(e) =>
                                handlePatchStatus(`/legal/sertifikat/${s.id}`, {
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
                              {['Proses', 'Terbit', 'Diserahkan', 'Bermasalah'].map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }}
              />
            </div>
          )}

          {/* ══════ TAB 2: PERIZINAN ══════ */}
          {tab === 2 && (
            <div>
              {showForm && isAdmin && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Tambah Perizinan</h3>
                  <div style={S.formGrid}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={S.label}>Nama Izin *</label>
                      <input
                        value={fIzin.nama_izin}
                        onChange={(e) => setFIzin({ ...fIzin, nama_izin: e.target.value })}
                        style={S.input}
                        placeholder="IMB Cluster A"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Tipe *</label>
                      <select
                        value={fIzin.tipe}
                        onChange={(e) => setFIzin({ ...fIzin, tipe: e.target.value })}
                        style={S.input}
                      >
                        {['IMB', 'PBG', 'SLF', 'AMDAL', 'FLPP', 'HO', 'Lainnya'].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Proyek / Cluster</label>
                      <input
                        value={fIzin.proyek}
                        onChange={(e) => setFIzin({ ...fIzin, proyek: e.target.value })}
                        style={S.input}
                        placeholder="Cluster Melati"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Instansi</label>
                      <input
                        value={fIzin.instansi}
                        onChange={(e) => setFIzin({ ...fIzin, instansi: e.target.value })}
                        style={S.input}
                        placeholder="DPMPTSP Kab. ..."
                      />
                    </div>
                    <div>
                      <label style={S.label}>Nomor</label>
                      <input
                        value={fIzin.nomor}
                        onChange={(e) => setFIzin({ ...fIzin, nomor: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Tgl Pengajuan</label>
                      <input
                        type="date"
                        value={fIzin.tgl_pengajuan}
                        onChange={(e) => setFIzin({ ...fIzin, tgl_pengajuan: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Upload Dokumen</label>
                      <input
                        type="file"
                        onChange={(e) => setFileIzin(e.target.files[0])}
                        style={S.input}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={S.label}>Catatan</label>
                      <textarea
                        value={fIzin.catatan}
                        onChange={(e) => setFIzin({ ...fIzin, catatan: e.target.value })}
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
                    <button onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => {
                        const fd = new FormData();
                        Object.entries(fIzin).forEach(([k, v]) => fd.append(k, v));
                        if (fileIzin) fd.append('file', fileIzin);
                        submit('/legal/perizinan', fd, true);
                      }}
                    >
                      {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </div>
              )}
              <DataTable
                cols={[
                  'Nama Izin',
                  'Tipe',
                  'Nomor',
                  'Proyek',
                  'Instansi',
                  'Tgl Pengajuan',
                  'Tgl Terbit',
                  'Status',
                  'Aksi',
                ]}
                rows={izinList}
                renderRow={(iz) => (
                  <tr key={iz.id} style={S.tr}>
                    <td style={S.td}>
                      <strong>{iz.nama_izin}</strong>
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          ...S.badge,
                          background: '#e3f2fd',
                          color: '#1565c0',
                        }}
                      >
                        {iz.tipe}
                      </span>
                    </td>
                    <td style={S.td}>{iz.nomor || '-'}</td>
                    <td style={S.td}>{iz.proyek || '-'}</td>
                    <td style={S.td}>{iz.instansi || '-'}</td>
                    <td style={S.td}>{iz.tgl_pengajuan ? formatTgl(iz.tgl_pengajuan) : '-'}</td>
                    <td style={S.td}>{iz.tgl_terbit ? formatTgl(iz.tgl_terbit) : '-'}</td>
                    <td style={S.td}>
                      <StatusBadge status={iz.status} />
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {iz.file_url && <FileLink url={iz.file_url} />}
                        {isAdmin && (
                          <select
                            defaultValue={iz.status}
                            onChange={(e) =>
                              handlePatchStatus(`/legal/perizinan/${iz.id}`, {
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
                            {[
                              'Draft',
                              'Diajukan',
                              'Diproses',
                              'Terbit',
                              'Ditolak',
                              'Kadaluarsa',
                            ].map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {/* ══════ TAB 3: PPJB & AJB ══════ */}
          {tab === 3 && (
            <div>
              {showForm && isAdmin && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Buat Akad Baru</h3>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Customer *</label>
                      <select
                        value={fAkad.customer_id}
                        onChange={(e) =>
                          setFAkad({
                            ...fAkad,
                            customer_id: e.target.value,
                            unit_id: getCustUnitId(e.target.value),
                          })
                        }
                        style={S.input}
                      >
                        <option value="">-- Pilih customer --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nama} — {c.unit_kode}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Tipe *</label>
                      <select
                        value={fAkad.tipe}
                        onChange={(e) => setFAkad({ ...fAkad, tipe: e.target.value })}
                        style={S.input}
                      >
                        {['PPJB', 'AJB', 'SPK', 'Addendum'].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Nomor Akta</label>
                      <input
                        value={fAkad.nomor_akta}
                        onChange={(e) => setFAkad({ ...fAkad, nomor_akta: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Notaris</label>
                      <input
                        value={fAkad.notaris}
                        onChange={(e) => setFAkad({ ...fAkad, notaris: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>PPAT</label>
                      <input
                        value={fAkad.ppat}
                        onChange={(e) => setFAkad({ ...fAkad, ppat: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Tanggal Akad</label>
                      <input
                        type="date"
                        value={fAkad.tgl_akad}
                        onChange={(e) => setFAkad({ ...fAkad, tgl_akad: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Nilai Transaksi (Rp)</label>
                      <input
                        type="number"
                        value={fAkad.nilai_transaksi}
                        onChange={(e) =>
                          setFAkad({
                            ...fAkad,
                            nilai_transaksi: e.target.value,
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
                    <button onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => {
                        const fd = new FormData();
                        Object.entries(fAkad).forEach(([k, v]) => fd.append(k, v));
                        submit('/legal/akad', fd, true);
                      }}
                    >
                      {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </div>
              )}
              <DataTable
                cols={[
                  'Customer',
                  'Unit',
                  'Tipe',
                  'Nomor Akta',
                  'Notaris',
                  'PPAT',
                  'Tgl Akad',
                  'Nilai',
                  'TTD',
                  'Status',
                  'Aksi',
                ]}
                rows={akadList}
                renderRow={(a) => (
                  <tr key={a.id} style={S.tr}>
                    <td style={S.td}>
                      <strong>{a.nama_customer}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{a.hp}</div>
                    </td>
                    <td style={S.td}>
                      <strong>{a.unit_kode}</strong>
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          ...S.badge,
                          background: 'var(--purple-soft)',
                          color: 'var(--purple)',
                        }}
                      >
                        {a.tipe}
                      </span>
                    </td>
                    <td style={S.td}>{a.nomor_akta || '-'}</td>
                    <td style={S.td}>{a.notaris || '-'}</td>
                    <td style={S.td}>{a.ppat || '-'}</td>
                    <td style={S.td}>{a.tgl_akad ? formatTgl(a.tgl_akad) : '-'}</td>
                    <td style={S.td}>{a.nilai_transaksi ? formatRp(a.nilai_transaksi) : '-'}</td>
                    <td style={S.td}>
                      <div style={{ fontSize: '11px' }}>
                        <div
                          style={{
                            color: a.signed_buyer ? '#27ae60' : '#e74c3c',
                          }}
                        >
                          {a.signed_buyer ? '✓' : '✗'} Pembeli
                        </div>
                        <div
                          style={{
                            color: a.signed_seller ? '#27ae60' : '#e74c3c',
                          }}
                        >
                          {a.signed_seller ? '✓' : '✗'} Penjual
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={S.td}>
                      {isAdmin && (
                        <select
                          defaultValue={a.status}
                          onChange={(e) =>
                            handlePatchStatus(`/legal/akad/${a.id}`, {
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
                          {['Draft', 'Dijadwalkan', 'Selesai', 'Batal'].map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {/* ══════ TAB 4: E-SIGN ══════ */}
          {tab === 4 && (
            <div>
              {showForm && isAdmin && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Kirim Request E-Sign</h3>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Customer *</label>
                      <select
                        value={fEsign.customer_id}
                        onChange={(e) => setFEsign({ ...fEsign, customer_id: e.target.value })}
                        style={S.input}
                      >
                        <option value="">-- Pilih customer --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Link ke Akad (opsional)</label>
                      <select
                        value={fEsign.akad_id}
                        onChange={(e) => setFEsign({ ...fEsign, akad_id: e.target.value })}
                        style={S.input}
                      >
                        <option value="">-- Tidak ada --</option>
                        {akadList.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.tipe} — {a.nama_customer}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={S.label}>Judul Dokumen *</label>
                      <input
                        value={fEsign.judul}
                        onChange={(e) => setFEsign({ ...fEsign, judul: e.target.value })}
                        style={S.input}
                        placeholder="PPJB Unit A1 — Budi Santoso"
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={S.label}>Deskripsi</label>
                      <textarea
                        value={fEsign.deskripsi}
                        onChange={(e) => setFEsign({ ...fEsign, deskripsi: e.target.value })}
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
                    <button onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => submit('/legal/esign', fEsign)}
                    >
                      {submitting ? 'Mengirim...' : 'Kirim Request'}
                    </button>
                  </div>
                </div>
              )}

              {esignList.length === 0 ? (
                <div style={S.emptyState}>
                  <div style={{ fontSize: '40px' }}>✦</div>
                  <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
                    Belum ada request e-sign.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {esignList.map((e) => (
                    <div key={e.id} style={S.formCard}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: '700',
                              fontSize: '14px',
                              color: 'var(--g1)',
                            }}
                          >
                            {e.judul}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--muted)',
                              marginTop: '3px',
                            }}
                          >
                            {e.nama_customer} · Dibuat {formatTgl(e.created_at)} · Exp.{' '}
                            {formatTgl(e.expired_at)}
                          </div>
                          {e.deskripsi && (
                            <div
                              style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '4px',
                              }}
                            >
                              {e.deskripsi}
                            </div>
                          )}
                          {e.status === 'Ditandatangani' && (
                            <div
                              style={{
                                fontSize: '12px',
                                color: '#27ae60',
                                marginTop: '4px',
                              }}
                            >
                              ✓ Ditandatangani pada {formatTgl(e.signed_at)}
                            </div>
                          )}
                        </div>
                        <StatusBadge status={e.status} />
                      </div>
                      {e.status === 'Menunggu' && (
                        <div
                          style={{
                            marginTop: '10px',
                            background: 'var(--cream)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '12px',
                          }}
                        >
                          <strong>Link TTD:</strong>{' '}
                          <code
                            style={{
                              background: 'var(--bg)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              border: '1px solid var(--border)',
                            }}
                          >
                            {window.location.origin}/esign/{e.token}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/esign/${e.token}`
                              );
                              alert('Link disalin!');
                            }}
                            style={{
                              ...S.btnInfo,
                              marginLeft: '8px',
                              padding: '3px 10px',
                              fontSize: '11px',
                            }}
                          >
                            Salin
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════ TAB 5: ARSIP ══════ */}
          {tab === 5 && (
            <div>
              {showForm && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Upload ke Arsip</h3>
                  <div style={S.formGrid}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={S.label}>Nama File *</label>
                      <input
                        value={fArsip.nama}
                        onChange={(e) => setFArsip({ ...fArsip, nama: e.target.value })}
                        style={S.input}
                        placeholder="Nama deskriptif file"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Kategori</label>
                      <select
                        value={fArsip.kategori}
                        onChange={(e) => setFArsip({ ...fArsip, kategori: e.target.value })}
                        style={S.input}
                      >
                        {['Customer', 'Unit', 'Proyek', 'Legal', 'Keuangan', 'Lainnya'].map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Customer (opsional)</label>
                      <select
                        value={fArsip.customer_id}
                        onChange={(e) => setFArsip({ ...fArsip, customer_id: e.target.value })}
                        style={S.input}
                      >
                        <option value="">--</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Unit (opsional)</label>
                      <select
                        value={fArsip.unit_id}
                        onChange={(e) => setFArsip({ ...fArsip, unit_id: e.target.value })}
                        style={S.input}
                      >
                        <option value="">--</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.kode}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Tags</label>
                      <input
                        value={fArsip.tags}
                        onChange={(e) => setFArsip({ ...fArsip, tags: e.target.value })}
                        style={S.input}
                        placeholder="kpr, ajb, 2025"
                      />
                    </div>
                    <div>
                      <label style={S.label}>File *</label>
                      <input
                        type="file"
                        onChange={(e) => setFileArsip(e.target.files[0])}
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
                    <button onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => {
                        const fd = new FormData();
                        Object.entries(fArsip).forEach(([k, v]) => fd.append(k, v));
                        if (fileArsip) fd.append('file', fileArsip);
                        submit('/legal/arsip', fd, true);
                      }}
                    >
                      {submitting ? 'Mengupload...' : 'Upload'}
                    </button>
                  </div>
                </div>
              )}

              {/* Search bar */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  value={arsipQ}
                  onChange={(e) => setArsipQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchArsip()}
                  placeholder="Cari nama, tags, deskripsi..."
                  style={{ ...S.input, flex: 1 }}
                />
                <button onClick={searchArsip} style={S.btnPrimary}>
                  🔍 Cari
                </button>
                {arsipQ && (
                  <button
                    onClick={() => {
                      setArsipQ('');
                      fetchAll();
                    }}
                    style={S.btnSecondary}
                  >
                    Reset
                  </button>
                )}
              </div>

              <DataTable
                cols={[
                  'Nama File',
                  'Kategori',
                  'Customer',
                  'Unit',
                  'Ukuran',
                  'Tags',
                  'Tanggal',
                  'Aksi',
                ]}
                rows={arsipList}
                renderRow={(a) => (
                  <tr key={a.id} style={S.tr}>
                    <td style={S.td}>
                      <strong>{a.nama}</strong>
                      {a.deskripsi && (
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{a.deskripsi}</div>
                      )}
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          ...S.badge,
                          background: '#e3f2fd',
                          color: '#1565c0',
                        }}
                      >
                        {a.kategori}
                      </span>
                    </td>
                    <td style={S.td}>{a.nama_customer || '-'}</td>
                    <td style={S.td}>{a.unit_kode || '-'}</td>
                    <td style={S.td}>{a.ukuran_kb ? `${a.ukuran_kb} KB` : '-'}</td>
                    <td style={S.td}>
                      {a.tags
                        ? a.tags.split(',').map((t) => (
                            <span
                              key={t}
                              style={{
                                ...S.badge,
                                background: '#f5f5f5',
                                color: '#666',
                                marginRight: '4px',
                              }}
                            >
                              {t.trim()}
                            </span>
                          ))
                        : '-'}
                    </td>
                    <td style={S.td}>{formatTgl(a.created_at)}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <FileLink url={a.file_url} />
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm('Hapus file ini?'))
                                handlePatchStatus(`/legal/arsip/${a.id}`, null);
                            }}
                            style={S.btnDanger}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              />
            </div>
          )}

          {/* ══════ TAB 6: KPR ══════ */}
          {tab === 6 && (
            <div>
              {showForm && isAdmin && (
                <div style={S.formCard}>
                  <h3 style={S.formTitle}>Buat Pengajuan KPR</h3>
                  <div style={S.formGrid}>
                    <div>
                      <label style={S.label}>Customer *</label>
                      <select
                        value={fKpr.customer_id}
                        onChange={(e) =>
                          setFKpr({
                            ...fKpr,
                            customer_id: e.target.value,
                            unit_id: getCustUnitId(e.target.value),
                          })
                        }
                        style={S.input}
                      >
                        <option value="">-- Pilih customer --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nama} — {c.unit_kode}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={S.label}>Bank *</label>
                      <input
                        value={fKpr.bank}
                        onChange={(e) => setFKpr({ ...fKpr, bank: e.target.value })}
                        style={S.input}
                        placeholder="BTN / BRI / Mandiri / BNI"
                      />
                    </div>
                    <div>
                      <label style={S.label}>No. Pengajuan</label>
                      <input
                        value={fKpr.no_pengajuan}
                        onChange={(e) => setFKpr({ ...fKpr, no_pengajuan: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Nominal KPR (Rp)</label>
                      <input
                        type="number"
                        value={fKpr.nominal_kpr}
                        onChange={(e) => setFKpr({ ...fKpr, nominal_kpr: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Tenor (tahun)</label>
                      <input
                        type="number"
                        value={fKpr.tenor_tahun}
                        onChange={(e) => setFKpr({ ...fKpr, tenor_tahun: e.target.value })}
                        style={S.input}
                        placeholder="10 / 15 / 20"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Bunga (%/tahun)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={fKpr.bunga_persen}
                        onChange={(e) => setFKpr({ ...fKpr, bunga_persen: e.target.value })}
                        style={S.input}
                        placeholder="5.5"
                      />
                    </div>
                    <div>
                      <label style={S.label}>Nama AO Bank</label>
                      <input
                        value={fKpr.nama_ao}
                        onChange={(e) => setFKpr({ ...fKpr, nama_ao: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>HP AO</label>
                      <input
                        value={fKpr.hp_ao}
                        onChange={(e) => setFKpr({ ...fKpr, hp_ao: e.target.value })}
                        style={S.input}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Tgl Pengajuan</label>
                      <input
                        type="date"
                        value={fKpr.tgl_pengajuan}
                        onChange={(e) => setFKpr({ ...fKpr, tgl_pengajuan: e.target.value })}
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
                    <button onClick={() => setShowForm(false)} style={S.btnSecondary}>
                      Batal
                    </button>
                    <button
                      disabled={submitting}
                      style={S.btnPrimary}
                      onClick={() => submit('/legal/kpr', fKpr)}
                    >
                      {submitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </div>
              )}

              {/* Pipeline KPR */}
              <div style={S.kprPipeline}>
                {['Persiapan', 'Diajukan', 'OTS', 'SP3K', 'Akad', 'Cair', 'Ditolak'].map((st) => {
                  const count = kprList.filter((k) => k.status === st).length;
                  return (
                    <div
                      key={st}
                      style={{
                        ...S.pipelineStep,
                        opacity: count > 0 ? 1 : 0.4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: '800',
                          color: 'var(--g1)',
                        }}
                      >
                        {count}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--muted)',
                          marginTop: '2px',
                        }}
                      >
                        {st}
                      </div>
                    </div>
                  );
                })}
              </div>

              <DataTable
                cols={[
                  'Customer',
                  'Unit',
                  'Bank',
                  'No. Pengajuan',
                  'Nominal KPR',
                  'Tenor',
                  'Angsuran/Bln',
                  'AO',
                  'Status',
                  'Aksi',
                ]}
                rows={kprList}
                renderRow={(k) => (
                  <tr key={k.id} style={S.tr}>
                    <td style={S.td}>
                      <strong>{k.nama_customer}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{k.hp}</div>
                    </td>
                    <td style={S.td}>
                      <strong>{k.unit_kode}</strong>
                    </td>
                    <td style={S.td}>
                      <strong>{k.bank}</strong>
                    </td>
                    <td style={S.td}>{k.no_pengajuan || '-'}</td>
                    <td style={S.td}>{k.nominal_kpr ? formatRp(k.nominal_kpr) : '-'}</td>
                    <td style={S.td}>{k.tenor_tahun ? `${k.tenor_tahun} thn` : '-'}</td>
                    <td style={S.td}>
                      {k.angsuran_per_bulan ? formatRp(k.angsuran_per_bulan) : '-'}
                    </td>
                    <td style={S.td}>
                      {k.nama_ao && <div>{k.nama_ao}</div>}
                      {k.hp_ao && (
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{k.hp_ao}</div>
                      )}
                    </td>
                    <td style={S.td}>
                      <StatusBadge status={k.status} />
                    </td>
                    <td style={S.td}>
                      {isAdmin && k.status !== 'Cair' && k.status !== 'Ditolak' && (
                        <select
                          defaultValue={k.status}
                          onChange={(e) =>
                            handlePatchStatus(`/legal/kpr/${k.id}/status`, {
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
                          {['Persiapan', 'Diajukan', 'OTS', 'SP3K', 'Akad', 'Cair', 'Ditolak'].map(
                            (v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            )
                          )}
                        </select>
                      )}
                    </td>
                  </tr>
                )}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────
function DataTable({ cols, rows, renderRow }) {
  if (!rows.length)
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '36px' }}>📂</div>
        <p style={{ color: 'var(--muted)', marginTop: '10px' }}>Belum ada data.</p>
      </div>
    );
  return (
    <div style={S.tableWrapper}>
      <table style={S.table}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={S.th}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const style = STATUS_COLOR[status] || { bg: '#f5f5f5', color: '#999' };
  return <span style={{ ...S.badge, background: style.bg, color: style.color }}>{status}</span>;
}

function FileLink({ url }) {
  if (!url) return null;
  return (
    <a
      href={`${import.meta.env.VITE_API_URL}${url}`}
      target="_blank"
      rel="noreferrer"
      style={{
        ...S.btnInfo,
        textDecoration: 'none',
        padding: '4px 10px',
        fontSize: '11px',
      }}
    >
      📄 File
    </a>
  );
}

function formatRp(n) {
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
  tabBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '10px 18px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'var(--sans)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  formCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
  },
  formTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '14px',
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
    fontFamily: 'var(--sans)',
    outline: 'none',
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
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: 'var(--text)',
    verticalAlign: 'top',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
  },
  custCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '12px 16px',
    marginBottom: '8px',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    transition: 'all 0.2s ease',
  },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  kprPipeline: {
    display: 'flex',
    gap: '1px',
    backgroundColor: 'var(--border)',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '20px',
    border: '1px solid var(--border)',
  },
  pipelineStep: {
    flex: 1,
    backgroundColor: 'var(--surface)',
    padding: '14px',
    textAlign: 'center',
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
  btnInfo: {
    padding: '5px 12px',
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  btnSuccess: {
    padding: '5px 12px',
    background: 'rgba(39, 174, 96, 0.1)',
    color: '#27ae60',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  btnDanger: {
    padding: '5px 12px',
    background: 'rgba(231, 76, 60, 0.1)',
    color: '#e74c3c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
};
