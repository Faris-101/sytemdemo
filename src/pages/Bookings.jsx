import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import PromoInput from "../components/PromoInput";

const STATUS_STYLE = {
  Aktif: { bg: "var(--accent-soft)", color: "var(--accent)" },
  Converted: { bg: "var(--success-soft)", color: "var(--success)" },
  Batal: { bg: "var(--danger-soft)", color: "var(--danger)" },
  Expired: { bg: "var(--surface-soft)", color: "var(--muted)" },
};

const FORM_AWAL = {
  unit_id: "",
  lead_id: "",
  nama_calon: "",
  hp: "",
  nominal_booking: "",
  tgl_booking: "",
  tgl_expired: "",
  catatan: "",
};

const CONVERT_AWAL = {
  total: "",
  terbayar: "",
  metode_bayar: "KPR",
  tgl_akad: "",
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [units, setUnits] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Aktif");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_AWAL);
  const [submitting, setSubmitting] = useState(false);
  const [showConvert, setShowConvert] = useState(null);
  const [convertForm, setConvertForm] = useState(CONVERT_AWAL);

  // State promo
  const [promoResult, setPromoResult] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const [bookRes, unitRes, leadRes] = await Promise.all([
        api.get(`/bookings${params}`),
        api.get("/units?status=Tersedia"),
        api.get("/leads"),
      ]);
      setBookings(bookRes.data);
      setUnits(unitRes.data);
      setLeads(
        leadRes.data.filter((l) => !["Closing", "Dead"].includes(l.status)),
      );
    } catch {
      console.error("Gagal fetch data");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Set tanggal expired otomatis 14 hari dari booking
  function handleTglBookingChange(tgl) {
    const expired = new Date(tgl);
    expired.setDate(expired.getDate() + 14);
    setForm({
      ...form,
      tgl_booking: tgl,
      tgl_expired: expired.toISOString().split("T")[0],
    });
  }

  // Hitung sisa hari expired
  function sisaHari(tgl_expired) {
    const diff = new Date(tgl_expired) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/bookings", form);
      setForm(FORM_AWAL);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal buat booking");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConvert(id) {
    if (!convertForm.total) return;
    setSubmitting(true);
    try {
      await api.patch(`/bookings/${id}/convert`, {
        ...convertForm,
        // Sertakan data promo kalau ada
        promo_id: promoResult?.promo?.id || null,
        diskon_rp: promoResult?.diskon_rp || 0,
        harga_asal: promoResult?.harga_asal || convertForm.total,
        harga_akhir: promoResult?.harga_akhir || convertForm.total,
        unit_kode: showConvert?.unit_kode || "",
      });
      setShowConvert(null);
      setConvertForm(CONVERT_AWAL);
      setPromoResult(null);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal convert");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBatal(id, nama) {
    if (!window.confirm(`Batalkan booking ${nama}?`)) return;
    try {
      await api.patch(`/bookings/${id}/batal`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal batalkan");
    }
  }

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Booking & Reservasi</h1>
          <p style={styles.pageSubtitle}>{bookings.length} booking ditemukan</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.btnPrimary}
        >
          {showForm ? "✕ Tutup" : "+ Buat Booking"}
        </button>
      </div>

      {/* ── Form Booking Baru ─────────────────────────────── */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Buat Booking Baru</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              {/* Pilih Unit */}
              <div>
                <label style={styles.label}>Pilih Unit * (Tersedia)</label>
                <select
                  value={form.unit_id}
                  onChange={(e) =>
                    setForm({ ...form, unit_id: e.target.value })
                  }
                  required
                  style={styles.input}
                >
                  <option value="">-- Pilih unit --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.kode} — {u.tipe || "-"} ({formatRp(u.harga)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Link ke Lead */}
              <div>
                <label style={styles.label}>Link ke Lead (opsional)</label>
                <select
                  value={form.lead_id}
                  onChange={(e) =>
                    setForm({ ...form, lead_id: e.target.value })
                  }
                  style={styles.input}
                >
                  <option value="">-- Tidak ada --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nama} ({l.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Calon */}
              <div>
                <label style={styles.label}>Nama Calon Pembeli *</label>
                <input
                  value={form.nama_calon}
                  onChange={(e) =>
                    setForm({ ...form, nama_calon: e.target.value })
                  }
                  required
                  placeholder="Nama lengkap"
                  style={styles.input}
                />
              </div>

              {/* HP */}
              <div>
                <label style={styles.label}>No. HP</label>
                <input
                  value={form.hp}
                  onChange={(e) => setForm({ ...form, hp: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  style={styles.input}
                />
              </div>

              {/* Nominal Booking */}
              <div>
                <label style={styles.label}>Nominal Booking (Rp)</label>
                <input
                  type="number"
                  value={form.nominal_booking}
                  onChange={(e) =>
                    setForm({ ...form, nominal_booking: e.target.value })
                  }
                  placeholder="Tanda jadi / booking fee"
                  style={styles.input}
                />
              </div>

              {/* Tanggal Booking */}
              <div>
                <label style={styles.label}>Tanggal Booking *</label>
                <input
                  type="date"
                  value={form.tgl_booking}
                  onChange={(e) => handleTglBookingChange(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              {/* Tanggal Expired */}
              <div>
                <label style={styles.label}>Tanggal Expired *</label>
                <input
                  type="date"
                  value={form.tgl_expired}
                  onChange={(e) =>
                    setForm({ ...form, tgl_expired: e.target.value })
                  }
                  required
                  style={styles.input}
                />
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Default 14 hari dari tgl booking
                </span>
              </div>
            </div>

            {/* Catatan */}
            <div style={{ marginTop: "12px" }}>
              <label style={styles.label}>Catatan</label>
              <textarea
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                rows={2}
                style={{ ...styles.input, resize: "vertical" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "14px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={styles.btnSecondary}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={styles.btnPrimary}
              >
                {submitting ? "Menyimpan..." : "Buat Booking"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filter Status ─────────────────────────────────── */}
      <div style={styles.tabBar}>
        {[
          { val: "Aktif", label: "🔵 Aktif" },
          { val: "Converted", label: "✅ Converted" },
          { val: "Batal", label: "❌ Batal" },
          { val: "Expired", label: "⏰ Expired" },
          { val: "", label: "Semua" },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setFilterStatus(f.val)}
            style={{
              ...styles.tabBtn,
              background:
                filterStatus === f.val ? "var(--g1)" : "var(--surface)",
              color: filterStatus === f.val ? "var(--gold2)" : "var(--muted)",
              fontWeight: filterStatus === f.val ? "700" : "400",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── List Booking ──────────────────────────────────── */}
      {loading ? (
        <p style={{ color: "var(--muted)" }}>Memuat...</p>
      ) : bookings.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "40px" }}>📋</div>
          <p style={{ color: "var(--muted)", marginTop: "10px" }}>
            Tidak ada booking {filterStatus.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "Nama Calon",
                  "HP",
                  "Unit",
                  "Tipe",
                  "Nominal Booking",
                  "Tgl Booking",
                  "Expired",
                  "Status",
                  "Aksi",
                ].map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const sisa = sisaHari(b.tgl_expired);
                return (
                  <tr key={b.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{b.nama_calon}</strong>
                      {b.catatan && (
                        <div style={styles.subText}>{b.catatan}</div>
                      )}
                    </td>
                    <td style={styles.td}>{b.hp || "-"}</td>
                    <td style={styles.td}>
                      <strong>{b.unit_kode}</strong>
                    </td>
                    <td style={styles.td}>{b.tipe || "-"}</td>
                    <td style={styles.td}>{formatRp(b.nominal_booking)}</td>
                    <td style={styles.td}>
                      {new Date(b.tgl_booking).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={styles.td}>
                      {new Date(b.tgl_expired).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                      {b.status === "Aktif" && (
                        <div
                          style={{
                            fontSize: "11px",
                            color:
                              sisa <= 3
                                ? "var(--danger)"
                                : sisa <= 7
                                  ? "var(--warning)"
                                  : "var(--muted)",
                            fontWeight: sisa <= 3 ? "700" : "400",
                          }}
                        >
                          {sisa > 0 ? `${sisa} hari lagi` : "Hari ini!"}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: STATUS_STYLE[b.status]?.bg,
                          color: STATUS_STYLE[b.status]?.color,
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {b.status === "Aktif" && (
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            onClick={() => {
                              setShowConvert(b);
                              setConvertForm({
                                ...CONVERT_AWAL,
                                total: b.harga || "",
                              });
                              setPromoResult(null);
                            }}
                            style={styles.btnConvert}
                          >
                            ✓ Convert
                          </button>
                          <button
                            onClick={() => handleBatal(b.id, b.nama_calon)}
                            style={styles.btnBatal}
                          >
                            Batal
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal Convert ke Customer ─────────────────────── */}
      {showConvert && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Convert ke Customer</h2>
              <button
                onClick={() => {
                  setShowConvert(null);
                  setPromoResult(null);
                }}
                style={styles.btnClose}
              >
                ✕
              </button>
            </div>

            {/* Info Booking */}
            <div style={styles.convertInfo}>
              <div>
                <strong>{showConvert.nama_calon}</strong> · {showConvert.hp}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Unit {showConvert.unit_kode} · {showConvert.tipe}
              </div>
              {showConvert.nominal_booking > 0 && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--success)",
                    marginTop: "4px",
                  }}
                >
                  ✓ Booking fee {formatRp(showConvert.nominal_booking)} akan
                  dihitung sebagai pembayaran
                </div>
              )}
            </div>

            {/* Form Convert */}
            <div style={styles.formGrid}>
              {/* Total Harga Deal */}
              <div>
                <label style={styles.label}>Total Harga Deal (Rp) *</label>
                <input
                  type="number"
                  value={convertForm.total}
                  onChange={(e) => {
                    setConvertForm({ ...convertForm, total: e.target.value });
                    // Reset promo kalau harga berubah
                    setPromoResult(null);
                  }}
                  required
                  placeholder="Harga final yang disepakati"
                  style={styles.input}
                />
              </div>

              {/* Pembayaran Tambahan */}
              <div>
                <label style={styles.label}>Pembayaran Tambahan (Rp)</label>
                <input
                  type="number"
                  value={convertForm.terbayar}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, terbayar: e.target.value })
                  }
                  placeholder="DP tambahan selain booking fee"
                  style={styles.input}
                />
              </div>

              {/* Metode Bayar */}
              <div>
                <label style={styles.label}>Metode Bayar</label>
                <select
                  value={convertForm.metode_bayar}
                  onChange={(e) =>
                    setConvertForm({
                      ...convertForm,
                      metode_bayar: e.target.value,
                    })
                  }
                  style={styles.input}
                >
                  {["KPR", "Cash Keras", "Cash Bertahap", "Lainnya"].map(
                    (m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Tanggal Akad */}
              <div>
                <label style={styles.label}>Tanggal Akad</label>
                <input
                  type="date"
                  value={convertForm.tgl_akad}
                  onChange={(e) =>
                    setConvertForm({ ...convertForm, tgl_akad: e.target.value })
                  }
                  style={styles.input}
                />
              </div>
            </div>

            {/* PromoInput — muncul hanya kalau sudah isi total harga */}
            {convertForm.total && (
              <div style={{ marginTop: "14px" }}>
                <PromoInput
                  harga={Number(convertForm.total)}
                  onApply={(result) => setPromoResult(result)}
                />
              </div>
            )}

            {/* Ringkasan Harga Akhir */}
            {promoResult && (
              <div style={styles.ringkasanHarga}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Harga asal</span>
                  <span>{formatRp(promoResult.harga_asal)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "var(--success)",
                  }}
                >
                  <span>Diskon ({promoResult.promo.kode})</span>
                  <span>- {formatRp(promoResult.diskon_rp)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "700",
                    fontSize: "15px",
                    borderTop: "1px solid var(--border)",
                    paddingTop: "8px",
                    marginTop: "4px",
                    color: "var(--g1)",
                  }}
                >
                  <span>Harga Akhir</span>
                  <span>{formatRp(promoResult.harga_akhir)}</span>
                </div>
              </div>
            )}

            {/* Tombol Aksi */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowConvert(null);
                  setPromoResult(null);
                }}
                style={{ ...styles.btnSecondary, flex: 1 }}
              >
                Batal
              </button>
              <button
                onClick={() => handleConvert(showConvert.id)}
                disabled={submitting || !convertForm.total}
                style={{ ...styles.btnPrimary, flex: 2 }}
              >
                {submitting ? "Memproses..." : "✓ Jadikan Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────
function formatRp(angka) {
  if (!angka && angka !== 0) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--text)",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  pageSubtitle: { fontSize: "14px", color: "var(--muted)", marginTop: "4px" },
  formCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "var(--shadow-soft)",
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "var(--text)",
    marginBottom: "20px",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  },
  input: {
    padding: "10px 14px",
    backgroundColor: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    fontSize: "14px",
    color: "var(--text)",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "var(--sans)",
    outline: "none",
  },
  tabBar: {
    display: "flex",
    gap: "6px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  tabBtn: {
    padding: "8px 18px",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "var(--sans)",
    transition: "all 0.2s ease",
  },
  emptyState: { textAlign: "center", padding: "60px 0" },
  tableWrapper: {
    background: "var(--surface)",
    borderRadius: "12px",
    overflow: "auto",
    boxShadow: "var(--shadow-soft)",
    border: "1px solid var(--border)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--muted)",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap",
    background: "var(--surface-soft)",
  },
  tr: { borderBottom: "1px solid var(--border)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "var(--text)" },
  subText: { fontSize: "12px", color: "var(--muted)", marginTop: "2px" },
  badge: {
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },
  btnConvert: {
    padding: "6px 14px",
    background: "var(--accent-soft)",
    color: "var(--accent)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "var(--sans)",
    transition: "all 0.2s ease",
  },
  btnBatal: {
    padding: "6px 14px",
    background: "var(--danger-soft)",
    color: "var(--red)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "var(--sans)",
    transition: "all 0.2s ease",
  },
  btnPrimary: {
    padding: "10px 24px",
    background: "var(--accent)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    fontFamily: "var(--sans)",
    transition: "all 0.2s ease",
  },
  btnSecondary: {
    padding: "10px 24px",
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "var(--surface)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "540px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "32px",
    boxShadow: "var(--shadow-card)",
    border: "1px solid var(--border)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text)",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  btnClose: {
    background: "var(--surface-soft)",
    border: "none",
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    display: "grid",
    placeItems: "center",
    fontSize: "14px",
    cursor: "pointer",
    color: "var(--muted)",
  },
  convertInfo: {
    background: "var(--surface-soft)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "var(--text)",
    lineHeight: 1.6,
    border: "1px solid var(--border)",
  },
  ringkasanHarga: {
    background: "var(--surface-soft)",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "16px",
    fontSize: "13px",
    color: "var(--text)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    border: "1px solid var(--border)",
  },
};
