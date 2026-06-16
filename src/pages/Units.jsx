import { useEffect, useState, useCallback } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  MoreVertical, 
  Home, 
  Maximize2, 
  CheckCircle2, 
  Clock, 
  X,
  Filter,
  ArrowRight,
  MapPin,
  Layers,
  CircleDollarSign,
  BedDouble,
  Bath
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const STATUS_OPTIONS = ['Tersedia', 'Dipesan', 'Terjual', 'Blokir'];

const STATUS_COLOR = {
  Tersedia: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Dipesan: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Terjual: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Blokir: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

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
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState('cards'); // "tabel" | "cards"
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(FORM_AWAL);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const bisaEdit = ['admin', 'direktur'].includes(user?.role);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await api.get(`/units${params}`);
      setUnits(res.data);
    } catch {
      setError('Gagal memuat data unit');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const filteredUnits = units.filter(u => 
    u.kode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.blok?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.tipe?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="mx-auto max-w-[1600px] space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* ── HEADER ── */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
            <Building2 className="h-3 w-3" />
            Inventory & Asset Management
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Unit / <span className="text-[var(--accent)]">Kavling</span>
          </h1>
          <p className="text-sm font-medium text-[var(--muted)]">
            {units.length} unit properti terdaftar dalam database inventori.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-[var(--surface-soft)] rounded-2xl border border-[var(--border)]">
            <button 
              onClick={() => setViewTab('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewTab === 'cards' ? 'bg-white text-[var(--accent)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Gallery
            </button>
            <button 
              onClick={() => setViewTab('tabel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewTab === 'tabel' ? 'bg-white text-[var(--accent)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Spreadsheet
            </button>
          </div>
          {bisaEdit && (
            <button 
              onClick={bukaTambah}
              className="btn-primary px-6 py-3.5 text-sm font-bold shadow-lg shadow-[var(--accent-glow)]"
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
              Tambah Unit
            </button>
          )}
        </div>
      </header>

      {/* ── FILTERS & SEARCH ── */}
      <section className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
          <input 
            type="text" 
            placeholder="Cari kode unit, blok, atau tipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] transition-all text-[var(--text)] font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
            <Filter className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Availability</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterStatus('')}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${filterStatus === '' ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'}`}
            >
              Semua
            </button>
            {['Tersedia', 'Dipesan', 'Terjual'].map(s => (
              <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${filterStatus === s ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="grid h-64 place-items-center bg-[var(--surface)] rounded-[32px] border border-[var(--border)] border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-[var(--accent-soft)] border-t-[var(--accent)] rounded-full animate-spin" />
            <span className="text-sm font-bold text-[var(--muted)]">Syncing inventory...</span>
          </div>
        </div>
      ) : viewTab === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUnits.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-[var(--surface)] rounded-[32px] border-2 border-dashed border-[var(--border)]">
              <div className="flex flex-col items-center gap-4 opacity-40">
                <Home className="h-16 w-16" strokeWidth={1} />
                <p className="font-bold uppercase tracking-widest text-xs">Unit tidak ditemukan</p>
              </div>
            </div>
          ) : (
            filteredUnits.map((u) => (
              <UnitCard key={u.id} unit={u} onEdit={() => bukaEdit(u)} onHapus={() => handleHapus(u)} bisaEdit={bisaEdit} />
            ))
          )}
        </div>
      ) : (
        <Panel title="Inventory Ledger" subtitle="Detailed list of all property units and specifications">
          <div className="table-container -mx-6 -mb-6 border-none shadow-none bg-transparent overflow-x-auto">
            <table className="table-modern w-full">
              <thead>
                <tr>
                  <th>Unit Identity</th>
                  <th>Location / Block</th>
                  <th>Type & Specs</th>
                  <th>Pricing</th>
                  <th>Availability</th>
                  {bisaEdit && <th className="text-right">Management</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <p className="font-bold opacity-40">Tidak ada unit ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((u) => (
                    <tr key={u.id} className="group">
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-black text-xs shadow-inner">
                            {u.kode}
                          </div>
                          <div>
                            <div className="font-black text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{u.kode}</div>
                            <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mt-0.5">Asset Ref #{String(u.id).padStart(4, '0')}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                          <MapPin className="h-3.5 w-3.5 text-rose-500" />
                          {u.blok || 'Unspecified'}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1.5">
                          <div className="text-xs font-black text-[var(--text)]">{u.tipe}</div>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight">
                               <Maximize2 className="h-3 w-3" /> {u.luas_tanah} m²
                             </div>
                             <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight">
                               <Layers className="h-3 w-3" /> {u.luas_bangunan} m²
                             </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm font-black text-[var(--text)]">
                          <CircleDollarSign className="h-4 w-4 text-emerald-500" />
                          {formatRupiah(u.harga)}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge border ${STATUS_COLOR[u.status]}`}>
                          {u.status}
                        </span>
                      </td>
                      {bisaEdit && (
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => bukaEdit(u)} className="h-10 w-10 grid place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-all">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleHapus(u)} className="h-10 w-10 grid place-items-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={tutupModal} />
          
          <div className="relative w-full max-w-2xl bg-[var(--surface)] rounded-[40px] shadow-2xl border border-[var(--border)] overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
             <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-deep)]" />
             
             <div className="p-8 sm:p-10">
               <div className="flex items-center justify-between mb-10">
                 <div>
                   <h2 className="text-2xl font-black tracking-tight text-[var(--text)]">
                     {editId ? 'Modify Unit Specification' : 'Register New Property Unit'}
                   </h2>
                   <p className="text-sm font-bold text-[var(--muted)] mt-1 uppercase tracking-widest">
                     Perbarui informasi inventori aset Anda
                   </p>
                 </div>
                 <button onClick={tutupModal} className="h-12 w-12 grid place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                   <X className="h-6 w-6" strokeWidth={3} />
                 </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="grid sm:grid-cols-2 gap-6">
                   <InputField label="Kode Unit *" name="kode" value={form.kode} onChange={handleChange} required disabled={!!editId} placeholder="Contoh: A-01" />
                   <InputField label="Blok / Cluster" name="blok" value={form.blok} onChange={handleChange} placeholder="Contoh: Cluster Sakura" />
                   <InputField label="Tipe Unit" name="tipe" value={form.tipe} onChange={handleChange} placeholder="Contoh: Tipe 36/72" />
                   
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">Status Ketersediaan</label>
                     <select name="status" value={form.status} onChange={handleChange} className="w-full h-14 px-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold text-sm text-[var(--text)] appearance-none">
                       {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>

                   <InputField label="Luas Tanah (m²)" name="luas_tanah" value={form.luas_tanah} onChange={handleChange} type="number" />
                   <InputField label="Luas Bangunan (m²)" name="luas_bangunan" value={form.luas_bangunan} onChange={handleChange} type="number" />
                   
                   <div className="sm:col-span-2">
                     <InputField label="Harga Unit (Rp) *" name="harga" value={form.harga} onChange={handleChange} required type="number" placeholder="Contoh: 500000000" />
                   </div>

                   <InputField label="Fasilitas" name="fasilitas" value={form.fasilitas} onChange={handleChange} placeholder="Contoh: 2 KT, 1 KM, Carport" />
                   
                   <div className="sm:col-span-2 space-y-2">
                     <label className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">Catatan Inventori</label>
                     <textarea name="catatan" value={form.catatan} onChange={handleChange} rows={3} className="w-full p-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-[28px] outline-none focus:border-[var(--accent)] transition-all font-medium text-sm text-[var(--text)] resize-none" placeholder="Tuliskan spesifikasi detail atau catatan internal unit..." />
                   </div>
                 </div>

                 {error && <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">{error}</div>}

                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                   <button type="button" onClick={tutupModal} className="flex-1 btn-ghost h-14">Batal</button>
                   <button type="submit" disabled={submitting} className="flex-[2] btn-primary h-14 text-[15px]">
                     {submitting ? 'Processing...' : (editId ? 'Update Inventory' : 'Add to Catalog')}
                     <ArrowRight className="h-5 w-5" />
                   </button>
                 </div>
               </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UnitCard({ unit, onEdit, onHapus, bisaEdit }) {
  // Select a random property image from bahan acak for visual appeal
  const images = [
    '/bahan acak/house01.jpg',
    '/bahan acak/zac-gudakov-mw_mj-noYHM-unsplash.jpg',
    '/bahan acak/zac-gudakov-UPbYh3A5cdg-unsplash.jpg',
    '/bahan acak/kam-idris-_HqHX3LBN18-unsplash.jpg'
  ];
  const idNum = typeof unit.id === 'number' ? unit.id : (unit.id?.length || 0);
  const imgSrc = images[idNum % images.length];

  return (
    <article className="surface-card group hover:scale-[1.02] active:scale-[0.98]">
      <div className="relative h-56 overflow-hidden">
        <img src={imgSrc} alt={unit.kode} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-4 left-4">
          <span className={`status-badge !bg-white/90 !backdrop-blur-md !text-[var(--text)] border-none shadow-xl ${STATUS_COLOR[unit.status]?.split(' ')[1]}`}>
            {unit.status}
          </span>
        </div>

        {bisaEdit && (
          <div className="absolute top-4 right-4 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <button onClick={onEdit} className="h-9 w-9 grid place-items-center rounded-xl bg-white/90 backdrop-blur-md text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-all shadow-lg">
               <MoreVertical className="h-4.5 w-4.5" />
             </button>
             <button onClick={onHapus} className="h-9 w-9 grid place-items-center rounded-xl bg-rose-500/90 backdrop-blur-md text-white hover:bg-rose-600 transition-all shadow-lg">
               <X className="h-4.5 w-4.5" />
             </button>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Price Start From</div>
            <div className="text-xl font-black tracking-tight">{formatRupiah(unit.harga)}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
            <Home className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[var(--text)]">{unit.kode}</h3>
            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-rose-500" />
              Blok {unit.blok} • {unit.tipe}
            </p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[var(--accent-soft)] text-[10px] font-black text-[var(--accent)] uppercase tracking-wider">
            Premium
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Luas Tanah</p>
            <p className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-[var(--accent)]" />
              {unit.luas_tanah} m²
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Luas Bangunan</p>
            <p className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--accent)]" />
              {unit.luas_bangunan} m²
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 text-[var(--muted)]">
           <div className="flex items-center gap-1.5 text-xs font-bold">
             <BedDouble className="h-4 w-4" /> 3
           </div>
           <div className="flex items-center gap-1.5 text-xs font-bold">
             <Bath className="h-4 w-4" /> 2
           </div>
           <div className="flex-1" />
           <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 rounded-md">
             Details <ArrowRight className="h-3 w-3" />
           </div>
        </div>
      </div>
    </article>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="surface-card relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-deep)] opacity-20" />
      <div className="relative z-10 mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="m-0 text-xl font-black tracking-tight text-[var(--text)]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] opacity-70">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">{label}</label>
      <input 
        {...props}
        className="w-full h-14 px-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] transition-all font-bold text-sm text-[var(--text)] placeholder:text-[var(--muted)]/50"
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
