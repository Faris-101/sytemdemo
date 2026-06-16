import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const JENIS_OPTIONS = ['Diskon', 'Booking Manual', 'Pengeluaran', 'Lainnya'];

const STATUS_STYLE = {
  Pending: { bg: 'var(--warning-soft)', color: 'var(--warning)', icon: '⏳' },
  Disetujui: { bg: 'var(--success-soft)', color: 'var(--success)', icon: '✅' },
  Ditolak: { bg: 'var(--danger-soft)', color: 'var(--danger)', icon: '❌' },
};

const FORM_AWAL = {
  jenis: 'Diskon',
  judul: '',
  deskripsi: '',
  nominal: '',
  unit_kode: '',
  customer_nama: '',
};

export default function Approvals() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_AWAL);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(null);
  const [catatanReview, setCatatanReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const bisaApprove = ['admin', 'direktur'].includes(user?.role);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await api.get(`/approvals${params}`);
      setApprovals(res.data);
    } catch {
      console.error('Gagal fetch approvals');
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
        const res = await api.get(`/approvals${params}`);
        if (!ignore) setApprovals(res.data);
      } catch {
        console.error('Gagal fetch approvals');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [filterStatus]);

  async function handleSubmitPengajuan(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/approvals', form);
      setForm(FORM_AWAL);
      setShowForm(false);
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengajukan');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReview(id, status) {
    setSubmittingReview(true);
    try {
      await api.patch(`/approvals/${id}`, {
        status,
        catatan_approval: catatanReview,
      });
      setShowReview(null);
      setCatatanReview('');
      fetchApprovals();
    } catch {
      alert('Gagal proses review');
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleHapus(id) {
    if (!window.confirm('Hapus pengajuan ini?')) return;
    try {
      await api.delete(`/approvals/${id}`);
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal hapus');
    }
  }

  const jumlahPending = approvals.filter((a) => a.status === 'Pending').length;

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Approval Internal</h1>
          <p style={styles.pageSubtitle}>
            {filterStatus === 'Pending'
              ? `${jumlahPending} pengajuan menunggu persetujuan`
              : `${approvals.length} pengajuan ditemukan`}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
          {showForm ? '✕ Tutup' : '+ Ajukan Persetujuan'}
        </button>
      </div>

      {/* Form Pengajuan */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Pengajuan Baru</h3>
          <form onSubmit={handleSubmitPengajuan}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Jenis Pengajuan *</label>
                <select
                  value={form.jenis}
                  onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                  style={styles.input}
                >
                  {JENIS_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>Nominal (jika ada)</label>
                <input
                  type="number"
                  value={form.nominal}
                  onChange={(e) => setForm({ ...form, nominal: e.target.value })}
                  placeholder="Contoh: 5000000"
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Kode Unit</label>
                <input
                  value={form.unit_kode}
                  onChange={(e) => setForm({ ...form, unit_kode: e.target.value })}
                  placeholder="Contoh: A-01"
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Nama Customer</label>
                <input
                  value={form.customer_nama}
                  onChange={(e) => setForm({ ...form, customer_nama: e.target.value })}
                  placeholder="Nama customer terkait"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={styles.label}>Judul Pengajuan *</label>
              <input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                required
                placeholder="Contoh: Diskon 5% untuk customer Budi unit A-01"
                style={styles.input}
              />
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={styles.label}>Alasan / Deskripsi</label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={3}
                placeholder="Jelaskan alasan pengajuan..."
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
              <button type="button" onClick={() => setShowForm(false)} style={styles.btnSecondary}>
                Batal
              </button>
              <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                {submitting ? 'Mengajukan...' : 'Kirim Pengajuan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tab */}
      <div style={styles.tabBar}>
        {[
          { val: 'Pending', label: '⏳ Pending' },
          { val: 'Disetujui', label: '✅ Disetujui' },
          { val: 'Ditolak', label: '❌ Ditolak' },
          { val: '', label: 'Semua' },
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

      {/* List Pengajuan */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : approvals.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '40px' }}>📋</div>
          <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
            Tidak ada pengajuan {filterStatus.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {approvals.map((a) => (
            <div
              key={a.id}
              style={{
                ...styles.card,
                borderLeft: `4px solid ${STATUS_STYLE[a.status]?.color}`,
              }}
            >
              <div style={styles.cardTop}>
                {/* Kiri — info pengajuan */}
                <div style={{ flex: 1 }}>
                  <div style={styles.cardHeader}>
                    <span
                      style={{
                        ...styles.jenisBadge,
                        background:
                          a.jenis === 'Diskon'
                            ? 'var(--warning-soft)'
                            : a.jenis === 'Pengeluaran'
                              ? 'var(--danger-soft)'
                              : a.jenis === 'Booking Manual'
                                ? 'var(--info-soft)'
                                : 'var(--purple-soft)',
                        color:
                          a.jenis === 'Diskon'
                            ? '#f39c12'
                            : a.jenis === 'Pengeluaran'
                              ? '#e74c3c'
                              : a.jenis === 'Booking Manual'
                                ? '#2980b9'
                                : '#8e44ad',
                      }}
                    >
                      {a.jenis}
                    </span>
                    <span style={styles.cardJudul}>{a.judul}</span>
                  </div>

                  {a.deskripsi && <p style={styles.cardDeskripsi}>{a.deskripsi}</p>}

                  <div style={styles.cardMeta}>
                    {a.nominal && <span>💰 {formatRp(a.nominal)}</span>}
                    {a.unit_kode && <span>🏠 {a.unit_kode}</span>}
                    {a.customer_nama && <span>👤 {a.customer_nama}</span>}
                  </div>

                  <div style={styles.cardFooter}>
                    <span>
                      Diajukan oleh <strong>{a.diajukan_oleh}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(a.diajukan_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Catatan approval */}
                  {a.catatan_approval && (
                    <div style={styles.catatanBox}>
                      <span style={{ fontWeight: '600' }}>{a.disetujui_oleh}:</span>{' '}
                      {a.catatan_approval}
                    </div>
                  )}
                </div>

                {/* Kanan — status & aksi */}
                <div style={styles.cardRight}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      background: STATUS_STYLE[a.status]?.bg,
                      color: STATUS_STYLE[a.status]?.color,
                    }}
                  >
                    {STATUS_STYLE[a.status]?.icon} {a.status}
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginTop: '10px',
                    }}
                  >
                    {/* Tombol approve/reject — hanya untuk pending & direktur/admin */}
                    {bisaApprove && a.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setShowReview(a);
                          setCatatanReview('');
                        }}
                        style={styles.btnReview}
                      >
                        Review
                      </button>
                    )}

                    {/* Hapus — hanya pengaju sendiri & masih pending */}
                    {a.status === 'Pending' &&
                      (a.diajukan_oleh === user?.nama || user?.role === 'admin') && (
                        <button onClick={() => handleHapus(a.id)} style={styles.btnHapus}>
                          Hapus
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Review */}
      {showReview && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Review Pengajuan</h2>
              <button onClick={() => setShowReview(null)} style={styles.btnClose}>
                ✕
              </button>
            </div>

            {/* Detail pengajuan */}
            <div style={styles.reviewDetail}>
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>Jenis</span>
                <span>{showReview.jenis}</span>
              </div>
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>Judul</span>
                <span style={{ fontWeight: '600' }}>{showReview.judul}</span>
              </div>
              {showReview.deskripsi && (
                <div style={styles.reviewRow}>
                  <span style={styles.reviewKey}>Alasan</span>
                  <span>{showReview.deskripsi}</span>
                </div>
              )}
              {showReview.nominal && (
                <div style={styles.reviewRow}>
                  <span style={styles.reviewKey}>Nominal</span>
                  <span style={{ fontWeight: '600', color: '#e74c3c' }}>
                    {formatRp(showReview.nominal)}
                  </span>
                </div>
              )}
              {showReview.unit_kode && (
                <div style={styles.reviewRow}>
                  <span style={styles.reviewKey}>Unit</span>
                  <span>{showReview.unit_kode}</span>
                </div>
              )}
              {showReview.customer_nama && (
                <div style={styles.reviewRow}>
                  <span style={styles.reviewKey}>Customer</span>
                  <span>{showReview.customer_nama}</span>
                </div>
              )}
              <div style={styles.reviewRow}>
                <span style={styles.reviewKey}>Diajukan oleh</span>
                <span>{showReview.diajukan_oleh}</span>
              </div>
            </div>

            {/* Catatan */}
            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>Catatan (opsional)</label>
              <textarea
                value={catatanReview}
                onChange={(e) => setCatatanReview(e.target.value)}
                rows={3}
                placeholder="Tambahkan catatan untuk pengaju..."
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            {/* Tombol approve / reject */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleReview(showReview.id, 'Ditolak')}
                disabled={submittingReview}
                style={styles.btnTolak}
              >
                ❌ Tolak
              </button>
              <button
                onClick={() => handleReview(showReview.id, 'Disetujui')}
                disabled={submittingReview}
                style={styles.btnSetujui}
              >
                ✅ Setujui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRp(angka) {
  if (!angka) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
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
  card: {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px',
    padding: '18px 20px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
  },
  cardTop: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
    flexWrap: 'wrap',
  },
  jenisBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
  },
  cardJudul: { fontSize: '15px', fontWeight: '700', color: 'var(--text)' },
  cardDeskripsi: {
    fontSize: '13px',
    color: 'var(--text)',
    marginBottom: '8px',
    lineHeight: 1.5,
    opacity: 0.9,
  },
  cardMeta: {
    display: 'flex',
    gap: '14px',
    fontSize: '12px',
    color: 'var(--muted)',
    marginBottom: '6px',
    flexWrap: 'wrap',
  },
  cardFooter: {
    display: 'flex',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--muted)',
  },
  catatanBox: {
    marginTop: '10px',
    padding: '10px 12px',
    background: 'var(--surface-soft)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  statusBadge: {
    padding: '5px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  btnReview: {
    padding: '7px 16px',
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'var(--sans)',
    boxShadow: '0 4px 12px var(--accent-soft)',
  },
  btnHapus: {
    padding: '7px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
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
    maxWidth: '520px',
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
  reviewDetail: {
    background: 'var(--surface-soft)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    border: '1px solid var(--border)',
  },
  reviewRow: { display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text)' },
  reviewKey: { color: 'var(--muted)', width: '100px', flexShrink: 0, fontWeight: '600' },
  btnSetujui: {
    flex: 1,
    padding: '12px',
    background: 'rgba(39, 174, 96, 0.1)',
    color: '#27ae60',
    border: '2px solid #27ae60',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'var(--sans)',
  },
  btnTolak: {
    flex: 1,
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#e74c3c',
    border: '2px solid #e74c3c',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'var(--sans)',
  },
};
