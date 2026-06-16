import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  MoreVertical, 
  Phone, 
  Mail, 
  Tag, 
  CircleDollarSign,
  User,
  X,
  Filter,
  ArrowRight
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const STATUS_OPTIONS = [
  'Baru',
  'Dihubungi',
  'Tertarik',
  'Survey',
  'Booking',
  'KPR',
  'Closing',
  'Dead',
];

const SUMBER_OPTIONS = [
  'Instagram',
  'Facebook',
  'TikTok',
  'Website',
  'Referral',
  'Pameran',
  'Lainnya',
];

const STATUS_COLOR = {
  Baru: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Dihubungi: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Tertarik: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Survey: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  Booking: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  KPR: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  Closing: 'bg-emerald-600/20 text-emerald-600 border-emerald-600/30',
  Dead: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const FORM_AWAL = {
  nama: '',
  hp: '',
  email: '',
  sumber: 'Instagram',
  status: 'Baru',
  minat: '',
  budget: '',
  catatan: '',
};

export default function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tabel'); // "tabel" | "kanban"
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(FORM_AWAL);
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Drag state
  const dragId = useRef(null);
  const bisaHapus = ['admin', 'direktur'].includes(user?.role);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await api.get(`/leads${params}`);
      setLeads(res.data);
    } catch {
      setError('Gagal memuat data leads');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter(l => 
    l.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.hp?.includes(searchQuery) ||
    l.minat?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Drag & Drop handlers
  function onDragStart(leadId) {
    dragId.current = leadId;
  }

  async function onDrop(newStatus) {
    if (!dragId.current) return;
    const lead = leads.find((l) => l.id === dragId.current);
    if (!lead || lead.status === newStatus) return;

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === dragId.current ? { ...l, status: newStatus } : l))
    );

    try {
      await api.patch(`/leads/${dragId.current}/status`, { status: newStatus });
    } catch {
      setLeads((prev) =>
        prev.map((l) => (l.id === dragId.current ? { ...l, status: lead.status } : l))
      );
      alert('Gagal update status');
    }
    dragId.current = null;
  }

  function bukaTambah() {
    setForm(FORM_AWAL);
    setEditId(null);
    setShowModal(true);
  }

  function bukaEdit(lead) {
    setForm({
      nama: lead.nama,
      hp: lead.hp || '',
      email: lead.email || '',
      sumber: lead.sumber || 'Lainnya',
      status: lead.status,
      minat: lead.minat || '',
      budget: lead.budget || '',
      catatan: lead.catatan || '',
    });
    setEditId(lead.id);
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
        await api.put(`/leads/${editId}`, form);
      } else {
        await api.post('/leads', form);
      }
      tutupModal();
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapus(lead) {
    if (!window.confirm(`Hapus lead ${lead.nama}?`)) return;
    try {
      await api.delete(`/leads/${lead.id}`);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus lead');
    }
  }

  const leadsByStatus = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = filteredLeads.filter((l) => l.status === s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* ── HEADER ── */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
            <Users className="h-3 w-3" />
            CRM & Marketing
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Leads / <span className="text-[var(--accent)]">Prospek</span>
          </h1>
          <p className="text-sm font-medium text-[var(--muted)]">
            {leads.length} lead tercatat dalam sistem operasional Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-[var(--surface-soft)] rounded-2xl border border-[var(--border)]">
            <button 
              onClick={() => setTab('tabel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'tabel' ? 'bg-white text-[var(--accent)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Tabel
            </button>
            <button 
              onClick={() => setTab('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'kanban' ? 'bg-white text-[var(--accent)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Kanban
            </button>
          </div>
          <button 
            onClick={bukaTambah}
            className="btn-primary px-6 py-3.5 text-sm font-bold shadow-lg shadow-[var(--accent-glow)]"
          >
            <Plus className="h-5 w-5" strokeWidth={3} />
            Tambah Lead
          </button>
        </div>
      </header>

      {/* ── FILTERS & SEARCH ── */}
      <section className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama, nomor HP, atau minat unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] transition-all text-[var(--text)] font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
            <Filter className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Status</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterStatus('')}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${filterStatus === '' ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'}`}
            >
              Semua
            </button>
            {['Baru', 'Dihubungi', 'Survey', 'Closing'].map(s => (
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
            <span className="text-sm font-bold text-[var(--muted)]">Sinkronisasi data...</span>
          </div>
        </div>
      ) : tab === 'tabel' ? (
        <Panel title="Data Leads" subtitle="Daftar seluruh calon pembeli potensial">
          <div className="table-container -mx-6 -mb-6 border-none shadow-none bg-transparent overflow-x-auto">
            <table className="table-modern w-full">
              <thead>
                <tr>
                  <th>Lead Information</th>
                  <th>Contact</th>
                  <th>Source & Interest</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Users className="h-16 w-16" strokeWidth={1} />
                        <p className="font-bold">Tidak ada data lead ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => (
                    <tr key={l.id} className="group">
                      <td>
                        <div className="flex items-center gap-4">
                          <Avatar name={l.nama} />
                          <div className="min-w-0">
                            <div className="font-black text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                              {l.nama}
                            </div>
                            <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                              <Tag className="h-3 w-3" />
                              ID: {String(l.id).padStart(4, '0')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                            <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                              <Phone className="h-3.5 w-3.5" />
                            </div>
                            {l.hp || '-'}
                          </div>
                          {l.email && (
                            <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--muted)]">
                              <div className="h-6 w-6 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500">
                                <Mail className="h-3.5 w-3.5" />
                              </div>
                              {l.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="text-xs font-black text-[var(--text)] uppercase tracking-tight">{l.sumber}</div>
                          <div className="text-[11px] font-bold text-[var(--muted)] bg-[var(--surface-soft)] px-2 py-0.5 rounded-md inline-block">
                            {l.minat || 'Belum spesifik'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm font-black text-[var(--text)]">
                          <CircleDollarSign className="h-4 w-4 text-emerald-500" />
                          {l.budget ? formatRupiah(l.budget) : 'Rp 0'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge border ${STATUS_COLOR[l.status]}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => bukaEdit(l)} className="h-10 w-10 grid place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-all">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          {bisaHapus && (
                            <button onClick={() => handleHapus(l)} className="h-10 w-10 grid place-items-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x scroll-smooth app-scrollbar">
          {STATUS_OPTIONS.map((status) => (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(status)}
              className="flex flex-col gap-5 min-w-[320px] max-w-[320px] snap-start"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[status]?.split(' ')[1].replace('text-', 'bg-')}`} />
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text)]">{status}</span>
                </div>
                <span className="h-6 px-2.5 flex items-center justify-center rounded-full bg-[var(--surface-soft)] text-[10px] font-black text-[var(--muted)] border border-[var(--border)]">
                  {leadsByStatus[status]?.length || 0}
                </span>
              </div>

              <div className="flex flex-col gap-4 min-h-[500px]">
                {leadsByStatus[status]?.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[var(--border)] rounded-[32px] opacity-30">
                    <Users className="h-8 w-8" strokeWidth={1} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Kosong</span>
                  </div>
                ) : (
                  leadsByStatus[status]?.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => onDragStart(lead.id)}
                      className="surface-card group cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={lead.nama} />
                            <div>
                              <div className="font-bold text-[var(--text)] text-sm group-hover:text-[var(--accent)] transition-colors line-clamp-1">{lead.nama}</div>
                              <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{lead.sumber}</div>
                            </div>
                          </div>
                          <button onClick={() => bukaEdit(lead)} className="h-8 w-8 grid place-items-center rounded-lg bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-all">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--muted)]">
                             <Phone className="h-3.5 w-3.5" />
                             {lead.hp || '-'}
                           </div>
                           <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text)] bg-[var(--surface-soft)] px-2.5 py-1 rounded-lg w-fit">
                             <Tag className="h-3.5 w-3.5 text-[var(--accent)]" />
                             {lead.minat || 'Belum spesifik'}
                           </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Budget</div>
                          <div className="text-[13px] font-black text-[var(--text)]">{lead.budget ? formatRupiah(lead.budget) : 'Rp 0'}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
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
                     {editId ? 'Edit Information' : 'New Lead Registration'}
                   </h2>
                   <p className="text-sm font-bold text-[var(--muted)] mt-1 uppercase tracking-widest">
                     Lengkapi detail prospek Anda
                   </p>
                 </div>
                 <button onClick={tutupModal} className="h-12 w-12 grid place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                   <X className="h-6 w-6" strokeWidth={3} />
                 </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="grid sm:grid-cols-2 gap-6">
                   <InputField label="Nama Lengkap *" name="nama" value={form.nama} onChange={handleChange} required placeholder="Contoh: Budi Santoso" />
                   <InputField label="Nomor WhatsApp" name="hp" value={form.hp} onChange={handleChange} placeholder="08xxxxxxxxxx" />
                   <InputField label="Alamat Email" name="email" value={form.email} onChange={handleChange} type="email" placeholder="email@contoh.com" />
                   
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">Sumber Lead</label>
                     <select name="sumber" value={form.sumber} onChange={handleChange} className="w-full h-14 px-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold text-sm text-[var(--text)] appearance-none">
                       {SUMBER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">Status Saat Ini</label>
                     <select name="status" value={form.status} onChange={handleChange} className="w-full h-14 px-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold text-sm text-[var(--text)] appearance-none">
                       {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                   </div>

                   <InputField label="Budget (Rp)" name="budget" value={form.budget} onChange={handleChange} type="number" placeholder="Contoh: 500000000" />
                   <div className="sm:col-span-2">
                     <InputField label="Minat Properti / Unit" name="minat" value={form.minat} onChange={handleChange} placeholder="Contoh: Cluster Sakura Tipe 36" />
                   </div>
                   <div className="sm:col-span-2 space-y-2">
                     <label className="text-xs font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">Catatan Tambahan</label>
                     <textarea name="catatan" value={form.catatan} onChange={handleChange} rows={3} className="w-full p-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-[28px] outline-none focus:border-[var(--accent)] transition-all font-medium text-sm text-[var(--text)] resize-none" placeholder="Tuliskan catatan survey atau kebutuhan khusus lead..." />
                   </div>
                 </div>

                 {error && <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">{error}</div>}

                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                   <button type="button" onClick={tutupModal} className="flex-1 btn-ghost h-14">Batal</button>
                   <button type="submit" disabled={submitting} className="flex-[2] btn-primary h-14 text-[15px]">
                     {submitting ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Daftarkan Lead Baru')}
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

function Avatar({ name }) {
  const initials = (name || '?').trim()[0].toUpperCase();
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500'
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];

  // Randomly pick one of the available people images for some visual variety if name starts with A or B
  const useImage = name?.toLowerCase().startsWith('a') || name?.toLowerCase().startsWith('b');
  const imgSrc = name?.toLowerCase().startsWith('a') ? '/bahan acak/poeple01.jpg' : '/bahan acak/poeple02.jpg';

  return (
    <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-inner overflow-hidden ${useImage ? 'bg-slate-200' : color}`}>
      {useImage ? (
        <img src={imgSrc} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
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
