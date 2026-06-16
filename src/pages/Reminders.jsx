import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSelesai, setFilterSelesai] = useState('0'); // "0" = belum, "1" = selesai, "" = semua
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    lead_id: '',
    tgl_reminder: '',
    catatan: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterSelesai !== '' ? `?selesai=${filterSelesai}` : '';
      const res = await api.get(`/reminders${params}`);
      setReminders(res.data);
    } catch {
      console.error('Gagal fetch reminders');
    } finally {
      setLoading(false);
    }
  }, [filterSelesai]);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data);
    } catch {
      console.error('Gagal fetch leads');
    }
  }, []);

  useEffect(() => {
    fetchReminders();
    fetchLeads();
  }, [fetchReminders, fetchLeads]);

  async function handleTandaiSelesai(id, selesai) {
    try {
      await api.patch(`/reminders/${id}/selesai`, { selesai: !selesai });
      fetchReminders();
    } catch {
      alert('Gagal update reminder');
    }
  }

  async function handleHapus(id) {
    if (!window.confirm('Hapus reminder ini?')) return;
    try {
      await api.delete(`/reminders/${id}`);
      fetchReminders();
    } catch {
      alert('Gagal hapus reminder');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reminders', form);
      setForm({ lead_id: '', tgl_reminder: '', catatan: '' });
      setShowForm(false);
      fetchReminders();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan reminder');
    } finally {
      setSubmitting(false);
    }
  }

  function isLewat(tgl) {
    return new Date(tgl) < new Date(new Date().toDateString());
  }

  function isHariIni(tgl) {
    return new Date(tgl).toDateString() === new Date().toDateString();
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Reminder Follow-up</h1>
          <p style={styles.pageSubtitle}>{reminders.length} reminder ditemukan</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.btnPrimary}>
          {showForm ? '✕ Tutup' : '+ Tambah Reminder'}
        </button>
      </div>

      {/* Form Tambah */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Tambah Reminder Baru</h3>
          <form onSubmit={handleSubmit} style={styles.formInline}>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Pilih Lead *</label>
              <select
                value={form.lead_id}
                onChange={(e) => setForm({ ...form, lead_id: e.target.value })}
                required
                style={styles.input}
              >
                <option value="">-- Pilih lead --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama} ({l.status})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Tanggal Reminder *</label>
              <input
                type="date"
                value={form.tgl_reminder}
                onChange={(e) => setForm({ ...form, tgl_reminder: e.target.value })}
                required
                style={styles.input}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Catatan</label>
              <input
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                placeholder="Contoh: Tanyakan KPR sudah proses?"
                style={styles.input}
              />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button type="submit" disabled={submitting} style={styles.btnPrimary}>
                {submitting ? '...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={styles.filterBar}>
        {[
          { val: '0', label: '⏳ Belum Selesai' },
          { val: '1', label: '✅ Sudah Selesai' },
          { val: '', label: 'Semua' },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilterSelesai(f.val)}
            style={{
              ...styles.filterBtn,
              backgroundColor: filterSelesai === f.val ? 'var(--accent)' : 'var(--surface)',
              color: filterSelesai === f.val ? 'white' : 'var(--text)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List Reminder */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : reminders.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Tidak ada reminder.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reminders.map((r) => {
            const lewat = isLewat(r.tgl_reminder) && !r.selesai;
            const hariIni = isHariIni(r.tgl_reminder);
            return (
              <div
                key={r.id}
                style={{
                  ...styles.reminderCard,
                  borderLeft: `4px solid ${r.selesai ? 'var(--accent)' : lewat ? '#ef4444' : hariIni ? '#f59e0b' : 'var(--border)'}`,
                  opacity: r.selesai ? 0.6 : 1,
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Tanggal & label */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={styles.tglText}>
                      {new Date(r.tgl_reminder).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {r.selesai && <span style={styles.tagSelesai}>✅ Selesai</span>}
                    {!r.selesai && hariIni && <span style={styles.tagHariIni}>⚡ Hari ini</span>}
                    {!r.selesai && lewat && <span style={styles.tagLewat}>⚠ Terlewat</span>}
                  </div>

                  {/* Lead info */}
                  <div style={styles.leadName}>{r.lead_nama}</div>
                  {r.lead_hp && (
                    <div style={styles.leadSub}>
                      📱 {r.lead_hp} · Status: {r.lead_status}
                    </div>
                  )}
                  {r.catatan && <div style={styles.catatanText}>💬 {r.catatan}</div>}
                  <div style={styles.createdBy}>Dibuat oleh: {r.created_by}</div>
                </div>

                {/* Aksi */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignItems: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => handleTandaiSelesai(r.id, r.selesai)}
                    style={r.selesai ? styles.btnBatal : styles.btnSelesai}
                  >
                    {r.selesai ? 'Batalkan' : '✓ Selesai'}
                  </button>
                  <button onClick={() => handleHapus(r.id)} style={styles.btnHapus}>
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
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
    padding: '20px',
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
  formInline: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
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
  filterBar: { display: 'flex', gap: '8px', marginBottom: '20px' },
  filterBtn: {
    padding: '8px 16px',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  reminderCard: {
    backgroundColor: 'var(--surface)',
    borderRadius: '12px',
    padding: '16px 20px',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--border)',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  tglText: { fontSize: '13px', fontWeight: '700', color: 'var(--text)' },
  tagSelesai: {
    fontSize: '11px',
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent)',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '700',
  },
  tagHariIni: {
    fontSize: '11px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '700',
  },
  tagLewat: {
    fontSize: '11px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: '700',
  },
  leadName: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '2px',
  },
  leadSub: { fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' },
  catatanText: { fontSize: '13px', color: 'var(--text)', marginTop: '4px' },
  createdBy: { fontSize: '11px', color: 'var(--muted)', marginTop: '6px' },
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
  btnSelesai: {
    padding: '6px 14px',
    backgroundColor: 'var(--accent-soft)',
    color: 'var(--accent)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  btnBatal: {
    padding: '6px 14px',
    backgroundColor: 'var(--surface-soft)',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  btnHapus: {
    padding: '6px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
  },
};
