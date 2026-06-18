import { useEffect, useState, useCallback, cloneElement } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  X,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { useView } from '../context/ViewContext';

const STATUS_OPTIONS = ['Tersedia', 'Dipesan', 'Terjual', 'Blokir'];

const FORM_AWAL = {
  kode: '',
  blok: '',
  tipe: '',
  luas_tanah: '',
  luas_bangunan: '',
  harga: '',
  status: 'Tersedia',
  fasilitas: '',
  catatan: '',
};

export default function Units() {
  const { user } = useAuth();
  const { viewMode } = useView();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(FORM_AWAL);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isMobile = viewMode === "mobile";
  const isTablet = viewMode === "tablet";
  const isDesktop = viewMode === "desktop";

  const bisaEdit = ['admin', 'direktur'].includes(user?.role);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/units');
      setUnits(res.data);
    } catch {
      setError('Gagal memuat data unit');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const filteredUnits = units.filter(u => 
    u.kode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.blok?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.tipe?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: units.length,
    tersedia: units.filter(u => u.status === 'Tersedia').length,
    terjual: units.filter(u => u.status === 'Terjual').length,
    booking: units.filter(u => u.status === 'Dipesan').length,
  };

  function bukaTambah() {
    setForm(FORM_AWAL);
    setEditId(null);
    setShowModal(true);
  }

  function bukaEdit(unit) {
    setForm({
      kode: unit.kode,
      blok: unit.blok || '',
      tipe: unit.tipe || '',
      luas_tanah: unit.luas_tanah || '',
      luas_bangunan: unit.luas_bangunan || '',
      harga: unit.harga || '',
      status: unit.status,
      fasilitas: unit.fasilitas || '',
      catatan: unit.catatan || '',
    });
    setEditId(unit.id);
    setShowModal(true);
  }

  function tutupModal() {
    setShowModal(false);
    setForm(FORM_AWAL);
    setEditId(null);
    setError('');
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editId) {
        await api.put(`/units/${editId}`, form);
      } else {
        await api.post('/units', form);
      }
      tutupModal();
      fetchUnits();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapus(unit) {
    if (!window.confirm(`Hapus unit ${unit.kode}?`)) return;
    try {
      await api.delete(`/units/${unit.id}`);
      fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus unit');
    }
  }

  return (
    <div className={`mx-auto ${isDesktop ? "space-y-6" : "space-y-4"}`}>
      {/* ── TOP HEADER ── */}
      <div className={`flex flex-col gap-4 ${isDesktop ? "sm:flex-row sm:items-center sm:justify-between p-6" : "p-4"} bg-[#1c1730] rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
        <h1 className={`${isMobile ? "text-base" : "text-xl"} font-black text-white uppercase tracking-wider flex items-center gap-3 pl-2`}>
          MASTER DATA UNIT
        </h1>
        <div className="flex items-center gap-3">
          <div className={`relative ${isMobile ? "flex-1" : ""}`}>
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
             <input 
               type="text" 
               placeholder="Cari Unit..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className={`${isMobile ? "h-10 text-xs w-full" : "h-10 text-sm w-64"} pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[var(--accent)] outline-none transition-all focus:ring-4 focus:ring-[var(--accent-glow)]`}
             />
          </div>
          {bisaEdit && (
            <button onClick={bukaTambah} className={`${isMobile ? "h-10 w-10 p-0" : "h-10 px-4"} bg-[var(--accent)] text-black rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-glow)]`}>
              <Plus className="h-4 w-4" strokeWidth={3} />
              {!isMobile && "Tambah Unit"}
            </button>
          )}
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className={`grid gap-4 ${
        isMobile ? "grid-cols-2" : isTablet ? "grid-cols-2" : isDesktop && !isTablet ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-4"
      }`}>
        <StatCard label="Total Unit" value={stats.total} icon={<Building2 />} color="bg-blue-500" isCompact={isDesktop || isMobile} />
        <StatCard label="Tersedia" value={stats.tersedia} icon={<CheckCircle2 />} color="bg-emerald-500" isCompact={isDesktop || isMobile} />
        <StatCard label="Terjual" value={stats.terjual} icon={<X />} color="bg-rose-500" isCompact={isDesktop || isMobile} />
        <StatCard label="Booking" value={stats.booking} icon={<Clock />} color="bg-amber-500" isCompact={isDesktop || isMobile} />
      </div>

      {/* ── TABLE ── */}
      <div className="bg-[#1c1730] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto app-scrollbar">
          <table className="table-modern w-full border-collapse">
            <thead>
              <tr className={isDesktop ? "h-14" : "h-12"}>
                <th className="w-12 text-center text-[10px] bg-[#2a2438] text-white/40 uppercase tracking-widest font-black">#</th>
                <th className={`${isDesktop ? "px-6" : "px-4"} text-[10px] bg-[#2a2438] text-white/40 uppercase tracking-widest font-black text-left`}>Blok / Unit</th>
                {!isMobile && <th className="px-6 text-[10px] bg-[#2a2438] text-white/40 uppercase tracking-widest font-black text-left">Tipe & Luas</th>}
                <th className={`${isDesktop ? "px-6" : "px-4"} text-[10px] bg-[#2a2438] text-white/40 uppercase tracking-widest font-black text-left`}>Harga Jual</th>
                <th className={`${isDesktop ? "px-6" : "px-4"} text-[10px] bg-[#2a2438] text-white/40 uppercase tracking-widest font-black text-left`}>Status</th>
                <th className="w-20 text-center text-[10px] bg-[#2a2438] text-white/40 uppercase tracking-widest font-black">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Memuat Data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-white/20 font-black uppercase tracking-widest">Data Kosong</td>
                </tr>
              ) : (
                filteredUnits.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0 group">
                    <td className="text-center text-white/30 font-mono text-[10px]">{idx + 1}</td>
                    <td className={isDesktop ? "px-6 py-5" : "px-4 py-3"}>
                      <div className={`font-black text-white uppercase group-hover:text-[var(--accent)] transition-colors ${isDesktop ? "text-sm" : "text-xs"}`}>{u.kode}</div>
                      <div className="text-[9px] font-bold text-white/30 mt-0.5 uppercase tracking-wider">Blok: {u.blok}</div>
                    </td>
                    {!isMobile && (
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-white/70">{u.tipe}</div>
                        <div className="text-[9px] font-bold text-white/30 mt-0.5 uppercase tracking-wider">{u.luas_tanah}m² / {u.luas_bangunan}m²</div>
                      </td>
                    )}
                    <td className={isDesktop ? "px-6 py-5" : "px-4 py-3"}>
                      <div className={`font-black text-[var(--accent)] ${isDesktop ? "text-base" : "text-sm"}`}>
                        {formatRupiah(u.harga)}
                      </div>
                    </td>
                    <td className={isDesktop ? "px-6 py-5" : "px-4 py-3"}>
                       <StatusLabel status={u.status} isCompact={!isDesktop} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => bukaEdit(u)} className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all grid place-items-center border border-blue-500/20">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleHapus(u)} className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all grid place-items-center border border-rose-500/20">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={tutupModal} />
          <div className="relative w-full max-w-lg bg-[#1c1730] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl animate-in zoom-in duration-300">
             <h2 className="text-lg font-black text-white mb-6 uppercase tracking-wider">{editId ? 'Edit Unit' : 'Tambah Unit'}</h2>
             <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <InputField label="Kode Unit" name="kode" value={form.kode} onChange={handleChange} required disabled={!!editId} />
                <InputField label="Blok" name="blok" value={form.blok} onChange={handleChange} />
                <InputField label="Tipe" name="tipe" value={form.tipe} onChange={handleChange} />
                <div className="flex flex-col gap-1.5">
                   <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Status</label>
                   <select name="status" value={form.status} onChange={handleChange} className="h-10 px-3 bg-[#14121f] border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[var(--accent)]">
                     {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <InputField label="Luas Tanah" name="luas_tanah" value={form.luas_tanah} onChange={handleChange} type="number" />
                <InputField label="Luas Bangunan" name="luas_bangunan" value={form.luas_bangunan} onChange={handleChange} type="number" />
                <div className="col-span-2">
                   <InputField label="Harga" name="harga" value={form.harga} onChange={handleChange} type="number" required />
                </div>
                {error && <div className="col-span-2 p-3 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest">{error}</div>}
                <div className="col-span-2 flex gap-3 mt-4">
                   <button type="button" onClick={tutupModal} className="flex-1 h-12 rounded-lg bg-white/5 text-white text-xs font-black uppercase tracking-widest">Batal</button>
                   <button type="submit" className="flex-1 h-12 rounded-lg bg-[var(--accent)] text-black text-xs font-black uppercase tracking-widest">{submitting ? '...' : 'Simpan'}</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, isCompact }) {
  return (
    <div className={`bg-[#1c1730] ${isCompact ? "p-3 sm:p-4" : "p-6"} rounded-xl border border-white/5 flex items-center justify-between shadow-lg`}>
      <div>
        <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{label}</div>
        <div className={`${isCompact ? "text-xl sm:text-2xl" : "text-3xl"} font-black text-white`}>{value}</div>
      </div>
      <div className={`${isCompact ? "h-8 w-8 rounded-lg" : "h-12 w-12 rounded-lg"} ${color} flex items-center justify-center text-white shadow-lg`}>
        {cloneElement(icon, { size: isCompact ? 18 : 24, strokeWidth: 2.5 })}
      </div>
    </div>
  );
}

function StatusLabel({ status, isCompact }) {
  const colors = {
    Tersedia: 'bg-emerald-500 text-white',
    Terjual: 'bg-rose-500 text-white',
    Dipesan: 'bg-amber-500 text-white',
    Blokir: 'bg-slate-500 text-white',
  };
  return (
    <span className={`${isCompact ? "px-1.5 py-0.5 text-[8px]" : "px-3 py-1 text-[10px]"} rounded font-black uppercase tracking-wider ${colors[status] || 'bg-slate-500'}`}>
      {status}
    </span>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{label}</label>
      <input 
        {...props}
        className="h-10 px-3 bg-[#14121f] border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[var(--accent)] transition-all placeholder:text-white/20"
      />
    </div>
  );
}

function formatRupiah(angka) {
  if (!angka) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}
