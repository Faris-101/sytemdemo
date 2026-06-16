import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const TABS = ['Tiket Komplain', 'Garansi', 'Survei NPS', 'Referral'];

const PRIORITAS_STYLE = {
  Rendah: { bg: 'var(--surface-soft)', color: 'var(--muted)' },
  Sedang: { bg: 'var(--info-soft)', color: 'var(--blue)' },
  Tinggi: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  Urgent: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
};

const STATUS_TIKET_STYLE = {
  Baru: { bg: 'var(--info-soft)', color: 'var(--blue)' },
  Diproses: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  'Menunggu Bahan': { bg: 'var(--purple-soft)', color: 'var(--purple)' },
  Selesai: { bg: 'var(--success-soft)', color: 'var(--success)' },
  Ditutup: { bg: 'var(--surface-soft)', color: 'var(--muted)' },
};

const STATUS_GARANSI_STYLE = {
  Aktif: { bg: 'var(--success-soft)', color: 'var(--success)' },
  Diklaim: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
  'Dalam Perbaikan': { bg: 'var(--purple-soft)', color: 'var(--purple)' },
  Selesai: { bg: 'var(--info-soft)', color: 'var(--blue)' },
  Kadaluarsa: { bg: 'var(--surface-soft)', color: 'var(--muted)' },
};

export default function AfterSales() {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';
  const isAdmin = ['admin', 'direktur'].includes(user?.role);

  const [tab, setTab] = useState(0);
  const [tikets, setTikets] = useState([]);
  const [garansis, setGaransis] = useState([]);
  const [surveis, setSurveis] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [npsRingkasan, setNpsRingkasan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailTiket, setDetailTiket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [formTiket, setFormTiket] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'Lainnya',
    prioritas: 'Sedang',
    customer_id: '',
    unit_id: '',
  });
  const [fotoTiket, setFotoTiket] = useState(null);
  const [showFormTiket, setShowFormTiket] = useState(false);

  const [formUpdateTiket, setFormUpdateTiket] = useState({
    status: '',
    catatan_admin: '',
    assigned_to: '',
    tgl_target: '',
  });

  const [formGaransi, setFormGaransi] = useState({
    customer_id: '',
    unit_id: '',
    item_garansi: '',
    tipe_garansi: '1 Tahun',
    tgl_mulai: '',
  });
  const [showFormGaransi, setShowFormGaransi] = useState(false);

  const [formSurvei, setFormSurvei] = useState({
    customer_id: '',
    tipe: 'Pasca BAST',
  });
  const [showFormSurvei, setShowFormSurvei] = useState(false);
  const [isiSurvei, setIsiSurvei] = useState(null);
  const [formIsi, setFormIsi] = useState({
    skor_nps: 8,
    skor_kualitas: 4,
    skor_pelayanan: 4,
    komentar: '',
  });

  const [formReferral, setFormReferral] = useState({
    referrer_id: '',
    nama_referral: '',
    hp_referral: '',
    catatan: '',
  });
  const [showFormReferral, setShowFormReferral] = useState(false);

  const fetchAll = useCallback(async (init = false) => {
    if (!init) setLoading(true);
    try {
      const [t, g, s, r] = await Promise.all([
        api.get('/tiket'),
        api.get('/garansi'),
        api.get('/survei'),
        api.get('/referral'),
      ]);
      setTikets(t.data);
      setGaransis(g.data);
      setSurveis(s.data);
      setReferrals(r.data);

      if (isAdmin) {
        const [custRes, npsRes] = await Promise.all([
          api.get('/customers'),
          api.get('/survei/ringkasan'),
        ]);
        setCustomers(custRes.data);
        setNpsRingkasan(npsRes.data);
      }
    } catch {
      console.error('Gagal fetch after sales data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const [t, g, s, r] = await Promise.all([
          api.get('/tiket'),
          api.get('/garansi'),
          api.get('/survei'),
          api.get('/referral'),
        ]);
        if (ignore) return;
        setTikets(t.data);
        setGaransis(g.data);
        setSurveis(s.data);
        setReferrals(r.data);

        if (isAdmin) {
          const [custRes, npsRes] = await Promise.all([
            api.get('/customers'),
            api.get('/survei/ringkasan'),
          ]);
          if (ignore) return;
          setCustomers(custRes.data);
          setNpsRingkasan(npsRes.data);
        }
      } catch {
        console.error('Gagal fetch after sales data');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  function getCustUnitId(custId) {
    return customers.find((c) => c.id == custId)?.unit_id || '';
  }

  // ── Submit Tiket ──────────────────────────────────────────
  async function handleSubmitTiket(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formTiket).forEach(([k, v]) => fd.append(k, v));
      if (fotoTiket) fd.append('foto', fotoTiket);
      await api.post('/tiket', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowFormTiket(false);
      setFormTiket({
        judul: '',
        deskripsi: '',
        kategori: 'Lainnya',
        prioritas: 'Sedang',
        customer_id: '',
        unit_id: '',
      });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal buat tiket');
    } finally {
      setSubmitting(false);
    }
  }

  async function fetchDetailTiket(id) {
    const res = await api.get(`/tiket/${id}`);
    setDetailTiket(res.data);
    setFormUpdateTiket({
      status: res.data.status,
      catatan_admin: res.data.catatan_admin || '',
      assigned_to: res.data.assigned_to || '',
      tgl_target: res.data.tgl_target?.split('T')[0] || '',
    });
  }

  async function handleUpdateTiket() {
    setSubmitting(true);
    try {
      await api.patch(`/tiket/${detailTiket.id}/status`, formUpdateTiket);
      await fetchDetailTiket(detailTiket.id);
      fetchAll();
    } catch {
      alert('Gagal update tiket');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Garansi ───────────────────────────────────────────────
  async function handleSubmitGaransi(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/garansi', formGaransi);
      setShowFormGaransi(false);
      setFormGaransi({
        customer_id: '',
        unit_id: '',
        item_garansi: '',
        tipe_garansi: '1 Tahun',
        tgl_mulai: '',
      });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal tambah garansi');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleKlaimGaransi(id) {
    const deskripsi = window.prompt('Jelaskan masalah yang ingin diklaim:');
    if (!deskripsi) return;
    try {
      await api.patch(`/garansi/${id}/klaim`, { deskripsi_klaim: deskripsi });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal klaim');
    }
  }

  async function handleUpdateGaransi(id, status) {
    try {
      await api.patch(`/garansi/${id}/status`, { status });
      fetchAll();
    } catch {
      alert('Gagal update garansi');
    }
  }

  // ── Survei ────────────────────────────────────────────────
  async function handleKirimSurvei(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/survei/kirim', formSurvei);
      setShowFormSurvei(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal kirim survei');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleIsiSurvei(id) {
    setSubmitting(true);
    try {
      await api.patch(`/survei/${id}/isi`, formIsi);
      setIsiSurvei(null);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal isi survei');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Referral ──────────────────────────────────────────────
  async function handleSubmitReferral(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/referral', formReferral);
      setShowFormReferral(false);
      setFormReferral({
        referrer_id: '',
        nama_referral: '',
        hp_referral: '',
        catatan: '',
      });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal daftarkan referral');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateReferral(id, status, bonus_nominal) {
    try {
      await api.patch(`/referral/${id}/status`, { status, bonus_nominal });
      fetchAll();
    } catch {
      alert('Gagal update referral');
    }
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>After Sales & Customer</h1>
          <p style={styles.pageSubtitle}>Kelola komplain, garansi, survei & referral</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              ...styles.tabBtn,
              background: tab === i ? 'var(--g1)' : 'var(--surface)',
              color: tab === i ? 'var(--gold2)' : 'var(--muted)',
              fontWeight: tab === i ? '700' : '400',
            }}
          >
            {['🎫', '🛡️', '⭐', '👥'][i]} {t}
            <span
              style={{
                marginLeft: '6px',
                background: tab === i ? 'rgba(255,255,255,0.2)' : 'var(--cream)',
                color: tab === i ? 'var(--gold2)' : 'var(--muted)',
                borderRadius: '999px',
                padding: '1px 7px',
                fontSize: '11px',
              }}
            >
              {[tikets, garansis, surveis, referrals][i].length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : (
        <>
          {/* ── TAB 0: Tiket Komplain ─────────────────────── */}
          {tab === 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '16px',
                }}
              >
                <button onClick={() => setShowFormTiket(!showFormTiket)} style={styles.btnPrimary}>
                  {showFormTiket ? '✕ Tutup' : '+ Buat Tiket'}
                </button>
              </div>

              {showFormTiket && (
                <div style={styles.formCard}>
                  <h3 style={styles.formTitle}>Buat Tiket Komplain</h3>
                  <form onSubmit={handleSubmitTiket}>
                    {isAdmin && (
                      <div style={{ marginBottom: '12px' }}>
                        <label style={styles.label}>Customer</label>
                        <select
                          value={formTiket.customer_id}
                          onChange={(e) =>
                            setFormTiket({
                              ...formTiket,
                              customer_id: e.target.value,
                              unit_id: getCustUnitId(e.target.value),
                            })
                          }
                          required
                          style={styles.input}
                        >
                          <option value="">-- Pilih customer --</option>
                          {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nama} — {c.unit_kode}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div style={styles.formGrid}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={styles.label}>Judul Komplain *</label>
                        <input
                          value={formTiket.judul}
                          onChange={(e) =>
                            setFormTiket({
                              ...formTiket,
                              judul: e.target.value,
                            })
                          }
                          required
                          style={styles.input}
                          placeholder="Ringkasan masalah"
                        />
                      </div>
                      <div>
                        <label style={styles.label}>Kategori</label>
                        <select
                          value={formTiket.kategori}
                          onChange={(e) =>
                            setFormTiket({
                              ...formTiket,
                              kategori: e.target.value,
                            })
                          }
                          style={styles.input}
                        >
                          {[
                            'Struktural',
                            'Instalasi Listrik',
                            'Instalasi Air',
                            'Finishing',
                            'Lainnya',
                          ].map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={styles.label}>Prioritas</label>
                        <select
                          value={formTiket.prioritas}
                          onChange={(e) =>
                            setFormTiket({
                              ...formTiket,
                              prioritas: e.target.value,
                            })
                          }
                          style={styles.input}
                        >
                          {['Rendah', 'Sedang', 'Tinggi', 'Urgent'].map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <label style={styles.label}>Deskripsi Masalah *</label>
                      <textarea
                        value={formTiket.deskripsi}
                        onChange={(e) =>
                          setFormTiket({
                            ...formTiket,
                            deskripsi: e.target.value,
                          })
                        }
                        required
                        rows={3}
                        style={{ ...styles.input, resize: 'vertical' }}
                        placeholder="Jelaskan masalah secara detail..."
                      />
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <label style={styles.label}>Foto (opsional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFotoTiket(e.target.files[0])}
                        style={styles.input}
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
                        onClick={() => setShowFormTiket(false)}
                        style={styles.btnSecondary}
                      >
                        Batal
                      </button>
                      <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                        {submitting ? 'Mengirim...' : 'Kirim Tiket'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* List Tiket */}
              {tikets.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: '40px' }}>🎫</div>
                  <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
                    Belum ada tiket komplain.
                  </p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {[
                          '#',
                          'Judul',
                          'Customer',
                          'Unit',
                          'Kategori',
                          'Prioritas',
                          'Status',
                          'Assigned',
                          'Aksi',
                        ].map((h) => (
                          <th key={h} style={styles.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tikets.map((t) => (
                        <tr key={t.id} style={styles.tr}>
                          <td style={styles.td}>
                            <strong>#{t.id.toString().padStart(3, '0')}</strong>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '600', maxWidth: '180px' }}>{t.judul}</div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: 'var(--muted)',
                              }}
                            >
                              {t.kategori}
                            </div>
                          </td>
                          <td style={styles.td}>{t.nama_customer}</td>
                          <td style={styles.td}>
                            <strong>{t.unit_kode}</strong>
                          </td>
                          <td style={styles.td}>{t.kategori}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                background: PRIORITAS_STYLE[t.prioritas]?.bg,
                                color: PRIORITAS_STYLE[t.prioritas]?.color,
                              }}
                            >
                              {t.prioritas}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                background: STATUS_TIKET_STYLE[t.status]?.bg,
                                color: STATUS_TIKET_STYLE[t.status]?.color,
                              }}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td style={styles.td}>{t.assigned_to || '-'}</td>
                          <td style={styles.td}>
                            <button onClick={() => fetchDetailTiket(t.id)} style={styles.btnInfo}>
                              {isAdmin ? '✏️ Kelola' : '👁️ Lihat'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Modal Detail Tiket */}
              {detailTiket && (
                <div style={styles.overlay}>
                  <div style={{ ...styles.modal, maxWidth: '600px' }}>
                    <div style={styles.modalHeader}>
                      <div>
                        <h2 style={styles.modalTitle}>
                          Tiket #{detailTiket.id.toString().padStart(3, '0')}
                        </h2>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {detailTiket.nama_customer} · Unit {detailTiket.unit_kode}
                        </div>
                      </div>
                      <button onClick={() => setDetailTiket(null)} style={styles.btnClose}>
                        ✕
                      </button>
                    </div>

                    <div
                      style={{
                        background: 'var(--cream)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{detailTiket.judul}</div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: 'var(--muted)',
                          marginTop: '6px',
                        }}
                      >
                        {detailTiket.deskripsi}
                      </div>
                      {detailTiket.foto_url && (
                        <a
                          href={`${import.meta.env.VITE_API_URL}${detailTiket.foto_url}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '12px',
                            color: 'var(--g1)',
                            marginTop: '8px',
                            display: 'block',
                          }}
                        >
                          📷 Lihat foto
                        </a>
                      )}
                    </div>

                    {/* Log */}
                    <div style={{ marginBottom: '16px' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: 'var(--muted)',
                          marginBottom: '8px',
                        }}
                      >
                        RIWAYAT
                      </div>
                      {detailTiket.logs?.map((l) => (
                        <div
                          key={l.id}
                          style={{
                            fontSize: '12px',
                            display: 'flex',
                            gap: '10px',
                            padding: '6px 0',
                            borderBottom: '1px solid #f5f5f5',
                          }}
                        >
                          <span
                            style={{
                              color: 'var(--muted)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {new Date(l.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>
                            <strong>{l.aksi}</strong>
                            {l.catatan ? ` — ${l.catatan}` : ''}
                          </span>
                          <span
                            style={{
                              color: 'var(--muted)',
                              marginLeft: 'auto',
                            }}
                          >
                            {l.oleh}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Form Update (admin only) */}
                    {isAdmin && detailTiket.status !== 'Ditutup' && (
                      <div>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: 'var(--muted)',
                            marginBottom: '10px',
                          }}
                        >
                          UPDATE TIKET
                        </div>
                        <div style={styles.formGrid}>
                          <div>
                            <label style={styles.label}>Status</label>
                            <select
                              value={formUpdateTiket.status}
                              onChange={(e) =>
                                setFormUpdateTiket({
                                  ...formUpdateTiket,
                                  status: e.target.value,
                                })
                              }
                              style={styles.input}
                            >
                              {['Baru', 'Diproses', 'Menunggu Bahan', 'Selesai', 'Ditutup'].map(
                                (s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div>
                            <label style={styles.label}>Assign ke</label>
                            <input
                              value={formUpdateTiket.assigned_to}
                              onChange={(e) =>
                                setFormUpdateTiket({
                                  ...formUpdateTiket,
                                  assigned_to: e.target.value,
                                })
                              }
                              style={styles.input}
                              placeholder="Nama teknisi"
                            />
                          </div>
                          <div>
                            <label style={styles.label}>Target Selesai</label>
                            <input
                              type="date"
                              value={formUpdateTiket.tgl_target}
                              onChange={(e) =>
                                setFormUpdateTiket({
                                  ...formUpdateTiket,
                                  tgl_target: e.target.value,
                                })
                              }
                              style={styles.input}
                            />
                          </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                          <label style={styles.label}>Catatan</label>
                          <textarea
                            value={formUpdateTiket.catatan_admin}
                            onChange={(e) =>
                              setFormUpdateTiket({
                                ...formUpdateTiket,
                                catatan_admin: e.target.value,
                              })
                            }
                            rows={2}
                            style={{ ...styles.input, resize: 'vertical' }}
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '12px',
                          }}
                        >
                          <button
                            onClick={handleUpdateTiket}
                            disabled={submitting}
                            style={styles.btnPrimary}
                          >
                            {submitting ? 'Menyimpan...' : 'Simpan Update'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 1: Garansi ───────────────────────────── */}
          {tab === 1 && (
            <div>
              {isAdmin && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '16px',
                  }}
                >
                  <button
                    onClick={() => setShowFormGaransi(!showFormGaransi)}
                    style={styles.btnPrimary}
                  >
                    {showFormGaransi ? '✕ Tutup' : '+ Tambah Garansi'}
                  </button>
                </div>
              )}

              {showFormGaransi && isAdmin && (
                <div style={styles.formCard}>
                  <h3 style={styles.formTitle}>Tambah Item Garansi</h3>
                  <form onSubmit={handleSubmitGaransi}>
                    <div style={styles.formGrid}>
                      <div>
                        <label style={styles.label}>Customer</label>
                        <select
                          value={formGaransi.customer_id}
                          onChange={(e) =>
                            setFormGaransi({
                              ...formGaransi,
                              customer_id: e.target.value,
                              unit_id: getCustUnitId(e.target.value),
                            })
                          }
                          required
                          style={styles.input}
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
                        <label style={styles.label}>Item Garansi *</label>
                        <input
                          value={formGaransi.item_garansi}
                          onChange={(e) =>
                            setFormGaransi({
                              ...formGaransi,
                              item_garansi: e.target.value,
                            })
                          }
                          required
                          style={styles.input}
                          placeholder="Misal: Atap, Pondasi, Cat Dinding"
                        />
                      </div>
                      <div>
                        <label style={styles.label}>Tipe Garansi</label>
                        <select
                          value={formGaransi.tipe_garansi}
                          onChange={(e) =>
                            setFormGaransi({
                              ...formGaransi,
                              tipe_garansi: e.target.value,
                            })
                          }
                          style={styles.input}
                        >
                          {['1 Tahun', '3 Tahun', '5 Tahun'].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={styles.label}>Tanggal Mulai</label>
                        <input
                          type="date"
                          value={formGaransi.tgl_mulai}
                          onChange={(e) =>
                            setFormGaransi({
                              ...formGaransi,
                              tgl_mulai: e.target.value,
                            })
                          }
                          required
                          style={styles.input}
                        />
                      </div>
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
                        onClick={() => setShowFormGaransi(false)}
                        style={styles.btnSecondary}
                      >
                        Batal
                      </button>
                      <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                        {submitting ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {garansis.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: '40px' }}>🛡️</div>
                  <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
                    Belum ada data garansi.
                  </p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {[
                          'Customer',
                          'Unit',
                          'Item Garansi',
                          'Tipe',
                          'Berlaku s/d',
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
                      {garansis.map((g) => {
                        const sisaHari = Math.ceil(
                          (new Date(g.tgl_akhir) - new Date()) / (1000 * 60 * 60 * 24)
                        );
                        return (
                          <tr key={g.id} style={styles.tr}>
                            <td style={styles.td}>{g.nama_customer}</td>
                            <td style={styles.td}>
                              <strong>{g.unit_kode}</strong>
                            </td>
                            <td style={styles.td}>{g.item_garansi}</td>
                            <td style={styles.td}>{g.tipe_garansi}</td>
                            <td style={styles.td}>
                              {formatTgl(g.tgl_akhir)}
                              {g.status === 'Aktif' && sisaHari <= 30 && (
                                <div
                                  style={{
                                    fontSize: '11px',
                                    color: '#e74c3c',
                                    fontWeight: '700',
                                  }}
                                >
                                  {sisaHari > 0 ? `${sisaHari} hari lagi!` : 'Hari ini habis!'}
                                </div>
                              )}
                            </td>
                            <td style={styles.td}>
                              <span
                                style={{
                                  ...styles.badge,
                                  background: STATUS_GARANSI_STYLE[g.status]?.bg,
                                  color: STATUS_GARANSI_STYLE[g.status]?.color,
                                }}
                              >
                                {g.status}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', gap: '5px' }}>
                                {isCustomer && g.status === 'Aktif' && (
                                  <button
                                    onClick={() => handleKlaimGaransi(g.id)}
                                    style={styles.btnWarning}
                                  >
                                    Klaim
                                  </button>
                                )}
                                {isAdmin && g.status === 'Diklaim' && (
                                  <button
                                    onClick={() => handleUpdateGaransi(g.id, 'Dalam Perbaikan')}
                                    style={styles.btnInfo}
                                  >
                                    Proses
                                  </button>
                                )}
                                {isAdmin && g.status === 'Dalam Perbaikan' && (
                                  <button
                                    onClick={() => handleUpdateGaransi(g.id, 'Selesai')}
                                    style={styles.btnSuccess}
                                  >
                                    Selesai
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: Survei NPS ────────────────────────── */}
          {tab === 2 && (
            <div>
              {/* NPS Ringkasan (admin) */}
              {isAdmin && npsRingkasan && (
                <div style={styles.npsCard}>
                  <div style={styles.npsScore}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--muted)',
                        marginBottom: '4px',
                      }}
                    >
                      NPS Score
                    </div>
                    <div
                      style={{
                        fontSize: '48px',
                        fontWeight: '900',
                        color: 'var(--g1)',
                        fontFamily: 'var(--serif)',
                      }}
                    >
                      {npsRingkasan.nps_score}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>dari 100</div>
                  </div>
                  <div style={styles.npsStats}>
                    {[
                      {
                        label: '😍 Promoter (9-10)',
                        val: npsRingkasan.promoter,
                        color: '#27ae60',
                      },
                      {
                        label: '😐 Passive (7-8)',
                        val: npsRingkasan.passive,
                        color: '#f39c12',
                      },
                      {
                        label: '😠 Detractor (0-6)',
                        val: npsRingkasan.detractor,
                        color: '#e74c3c',
                      },
                    ].map((s) => (
                      <div key={s.label} style={styles.npsStat}>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.label}</div>
                        <div
                          style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: s.color,
                          }}
                        >
                          {s.val}
                        </div>
                      </div>
                    ))}
                    <div style={styles.npsStat}>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>⭐ Avg Kualitas</div>
                      <div
                        style={{
                          fontSize: '22px',
                          fontWeight: '700',
                          color: 'var(--g1)',
                        }}
                      >
                        {npsRingkasan.avg_kualitas || '-'}
                      </div>
                    </div>
                    <div style={styles.npsStat}>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        🤝 Avg Pelayanan
                      </div>
                      <div
                        style={{
                          fontSize: '22px',
                          fontWeight: '700',
                          color: 'var(--g1)',
                        }}
                      >
                        {npsRingkasan.avg_pelayanan || '-'}
                      </div>
                    </div>
                    <div style={styles.npsStat}>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        📋 Response Rate
                      </div>
                      <div
                        style={{
                          fontSize: '22px',
                          fontWeight: '700',
                          color: 'var(--g1)',
                        }}
                      >
                        {npsRingkasan.total_survei > 0
                          ? `${Math.round((npsRingkasan.total_diisi / npsRingkasan.total_survei) * 100)}%`
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isAdmin && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '16px',
                  }}
                >
                  <button
                    onClick={() => setShowFormSurvei(!showFormSurvei)}
                    style={styles.btnPrimary}
                  >
                    {showFormSurvei ? '✕ Tutup' : '+ Kirim Survei'}
                  </button>
                </div>
              )}

              {showFormSurvei && isAdmin && (
                <div style={styles.formCard}>
                  <h3 style={styles.formTitle}>Kirim Survei ke Customer</h3>
                  <form onSubmit={handleKirimSurvei}>
                    <div style={styles.formGrid}>
                      <div>
                        <label style={styles.label}>Customer</label>
                        <select
                          value={formSurvei.customer_id}
                          onChange={(e) =>
                            setFormSurvei({
                              ...formSurvei,
                              customer_id: e.target.value,
                            })
                          }
                          required
                          style={styles.input}
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
                        <label style={styles.label}>Tipe Survei</label>
                        <select
                          value={formSurvei.tipe}
                          onChange={(e) =>
                            setFormSurvei({
                              ...formSurvei,
                              tipe: e.target.value,
                            })
                          }
                          style={styles.input}
                        >
                          {['Pasca Closing', 'Pasca BAST', 'Bulanan'].map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
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
                        onClick={() => setShowFormSurvei(false)}
                        style={styles.btnSecondary}
                      >
                        Batal
                      </button>
                      <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                        {submitting ? 'Mengirim...' : 'Kirim Survei'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* List Survei */}
              {surveis.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: '40px' }}>⭐</div>
                  <p style={{ color: 'var(--muted)', marginTop: '10px' }}>Belum ada survei.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {surveis.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        ...styles.formCard,
                        margin: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--g1)' }}>
                          {s.nama_customer}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {s.tipe} · {formatTgl(s.created_at)}
                        </div>
                        {s.status === 'Diisi' && (
                          <div
                            style={{
                              fontSize: '12px',
                              marginTop: '4px',
                              display: 'flex',
                              gap: '12px',
                            }}
                          >
                            <span>
                              NPS: <strong style={{ color: 'var(--g1)' }}>{s.skor_nps}/10</strong>
                            </span>
                            <span>
                              Kualitas: <strong>{s.skor_kualitas}/5</strong>
                            </span>
                            <span>
                              Pelayanan: <strong>{s.skor_pelayanan}/5</strong>
                            </span>
                          </div>
                        )}
                        {s.komentar && (
                          <div
                            style={{
                              fontSize: '12px',
                              fontStyle: 'italic',
                              color: '#666',
                              marginTop: '4px',
                            }}
                          >
                            "{s.komentar}"
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            ...styles.badge,
                            background: s.status === 'Diisi' ? '#e8f5e9' : '#fff8e1',
                            color: s.status === 'Diisi' ? '#27ae60' : '#f39c12',
                          }}
                        >
                          {s.status}
                        </span>
                        {isCustomer && s.status === 'Terkirim' && (
                          <button
                            onClick={() => {
                              setIsiSurvei(s);
                              setFormIsi({
                                skor_nps: 8,
                                skor_kualitas: 4,
                                skor_pelayanan: 4,
                                komentar: '',
                              });
                            }}
                            style={styles.btnPrimary}
                          >
                            Isi Sekarang
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Isi Survei */}
              {isiSurvei && (
                <div style={styles.overlay}>
                  <div style={{ ...styles.modal, maxWidth: '480px' }}>
                    <div style={styles.modalHeader}>
                      <h2 style={styles.modalTitle}>Survei {isiSurvei.tipe}</h2>
                      <button onClick={() => setIsiSurvei(null)} style={styles.btnClose}>
                        ✕
                      </button>
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--muted)',
                        marginBottom: '20px',
                      }}
                    >
                      Penilaian Anda sangat berarti untuk kami berkembang 🙏
                    </p>

                    {[
                      {
                        key: 'skor_nps',
                        label: 'Seberapa besar kemungkinan Anda merekomendasikan kami?',
                        max: 10,
                        desc: '0 = Sangat tidak mungkin · 10 = Sangat mungkin',
                      },
                      {
                        key: 'skor_kualitas',
                        label: 'Penilaian kualitas bangunan',
                        max: 5,
                        desc: '1 = Sangat buruk · 5 = Sangat baik',
                      },
                      {
                        key: 'skor_pelayanan',
                        label: 'Penilaian pelayanan tim kami',
                        max: 5,
                        desc: '1 = Sangat buruk · 5 = Sangat baik',
                      },
                    ].map((q) => (
                      <div key={q.key} style={{ marginBottom: '20px' }}>
                        <label
                          style={{
                            ...styles.label,
                            textTransform: 'none',
                            fontSize: '13px',
                            letterSpacing: 0,
                            fontWeight: '600',
                            color: 'var(--text)',
                          }}
                        >
                          {q.label}
                        </label>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--muted)',
                            marginBottom: '10px',
                          }}
                        >
                          {q.desc}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '6px',
                            flexWrap: 'wrap',
                          }}
                        >
                          {Array.from(
                            { length: q.max + 1 },
                            (_, i) => i + (q.max === 10 ? 0 : 1)
                          ).map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setFormIsi({ ...formIsi, [q.key]: n })}
                              style={{
                                width: '36px',
                                height: '36px',
                                border: '2px solid',
                                borderColor: formIsi[q.key] === n ? 'var(--g1)' : 'var(--border)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: formIsi[q.key] === n ? '700' : '400',
                                background: formIsi[q.key] === n ? 'var(--g1)' : 'var(--surface)',
                                color: formIsi[q.key] === n ? 'var(--gold2)' : 'var(--text)',
                              }}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div style={{ marginBottom: '20px' }}>
                      <label style={styles.label}>Komentar & Saran</label>
                      <textarea
                        value={formIsi.komentar}
                        onChange={(e) => setFormIsi({ ...formIsi, komentar: e.target.value })}
                        rows={3}
                        style={{ ...styles.input, resize: 'vertical' }}
                        placeholder="Ceritakan pengalaman Anda..."
                      />
                    </div>

                    <button
                      onClick={() => handleIsiSurvei(isiSurvei.id)}
                      disabled={submitting}
                      style={{
                        ...styles.btnPrimary,
                        width: '100%',
                        textAlign: 'center',
                      }}
                    >
                      {submitting ? 'Mengirim...' : 'Kirim Penilaian 🙏'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: Referral ──────────────────────────── */}
          {tab === 3 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '16px',
                }}
              >
                <button
                  onClick={() => setShowFormReferral(!showFormReferral)}
                  style={styles.btnPrimary}
                >
                  {showFormReferral ? '✕ Tutup' : '+ Daftarkan Referral'}
                </button>
              </div>

              {showFormReferral && (
                <div style={styles.formCard}>
                  <h3 style={styles.formTitle}>Daftarkan Referral</h3>
                  {isAdmin && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={styles.label}>Customer (yang merujuk)</label>
                      <select
                        value={formReferral.referrer_id}
                        onChange={(e) =>
                          setFormReferral({
                            ...formReferral,
                            referrer_id: e.target.value,
                          })
                        }
                        required
                        style={styles.input}
                      >
                        <option value="">-- Pilih customer --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <form onSubmit={handleSubmitReferral}>
                    <div style={styles.formGrid}>
                      <div>
                        <label style={styles.label}>Nama Teman yang Dirujuk *</label>
                        <input
                          value={formReferral.nama_referral}
                          onChange={(e) =>
                            setFormReferral({
                              ...formReferral,
                              nama_referral: e.target.value,
                            })
                          }
                          required
                          style={styles.input}
                          placeholder="Nama lengkap"
                        />
                      </div>
                      <div>
                        <label style={styles.label}>No. HP</label>
                        <input
                          value={formReferral.hp_referral}
                          onChange={(e) =>
                            setFormReferral({
                              ...formReferral,
                              hp_referral: e.target.value,
                            })
                          }
                          style={styles.input}
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <label style={styles.label}>Catatan</label>
                      <textarea
                        value={formReferral.catatan}
                        onChange={(e) =>
                          setFormReferral({
                            ...formReferral,
                            catatan: e.target.value,
                          })
                        }
                        rows={2}
                        style={{ ...styles.input, resize: 'vertical' }}
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
                        onClick={() => setShowFormReferral(false)}
                        style={styles.btnSecondary}
                      >
                        Batal
                      </button>
                      <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                        {submitting ? 'Menyimpan...' : 'Daftarkan'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {referrals.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{ fontSize: '40px' }}>👥</div>
                  <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
                    Belum ada program referral.
                  </p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {['Dirujuk oleh', 'Nama Referral', 'HP', 'Status', 'Bonus', 'Aksi'].map(
                          (h) => (
                            <th key={h} style={styles.th}>
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((r) => (
                        <tr key={r.id} style={styles.tr}>
                          <td style={styles.td}>{r.nama_referrer}</td>
                          <td style={styles.td}>
                            <strong>{r.nama_referral}</strong>
                          </td>
                          <td style={styles.td}>{r.hp_referral || '-'}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                background: {
                                  Terdaftar: 'var(--surface-soft)',
                                  'Jadi Lead': 'var(--info-soft)',
                                  Closing: 'var(--success-soft)',
                                  'Bonus Dibayar': 'var(--purple-soft)',
                                }[r.status],
                                color: {
                                  Terdaftar: '#999',
                                  'Jadi Lead': '#1565c0',
                                  Closing: '#27ae60',
                                  'Bonus Dibayar': '#6a1b9a',
                                }[r.status],
                              }}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {r.bonus_nominal > 0 ? formatRp(r.bonus_nominal) : '-'}
                          </td>
                          <td style={styles.td}>
                            {isAdmin && r.status !== 'Bonus Dibayar' && (
                              <div style={{ display: 'flex', gap: '5px' }}>
                                {r.status === 'Terdaftar' && (
                                  <button
                                    onClick={() => handleUpdateReferral(r.id, 'Jadi Lead')}
                                    style={styles.btnInfo}
                                  >
                                    Jadi Lead
                                  </button>
                                )}
                                {r.status === 'Jadi Lead' && (
                                  <button
                                    onClick={() => handleUpdateReferral(r.id, 'Closing')}
                                    style={styles.btnSuccess}
                                  >
                                    Closing
                                  </button>
                                )}
                                {r.status === 'Closing' && (
                                  <button
                                    onClick={() => {
                                      const bonus = window.prompt('Nominal bonus referral (Rp):');
                                      if (bonus) handleUpdateReferral(r.id, 'Bonus Dibayar', bonus);
                                    }}
                                    style={styles.btnPrimary}
                                  >
                                    Bayar Bonus
                                  </button>
                                )}
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
        </>
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
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'var(--sans)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
    padding: '9px 12px',
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--sans)',
  },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  tableWrapper: {
    backgroundColor: 'var(--surface)',
    borderRadius: '12px',
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
  npsCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },
  npsScore: { textAlign: 'center', minWidth: '100px' },
  npsStats: { display: 'flex', gap: '24px', flexWrap: 'wrap', flex: 1 },
  npsStat: { textAlign: 'center' },
  btnPrimary: {
    padding: '10px 20px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px var(--accent-soft)',
  },
  btnSecondary: {
    padding: '10px 18px',
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
  btnWarning: {
    padding: '5px 12px',
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
    alignItems: 'flex-start',
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
