import { useEffect, useState, useCallback } from 'react';
import { 
  UserRound, 
  Plus, 
  Search, 
  Table as TableIcon, 
  MoreVertical, 
  Phone, 
  Mail, 
  Building2, 
  CircleDollarSign,
  Wallet,
  X,
  Filter,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';

const STATUS_COLOR = {
  Aktif: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Lunas: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Menunggak: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const METODE_OPTIONS = ['KPR', 'Cash Keras', 'Cash Bertahap', 'Lainnya'];

const FORM_AWAL = {
  nama: '',
  hp: '',
  email: '',
  unit_id: '',
  unit_kode: '',
  total: '',
  terbayar: '',
  metode_bayar: 'KPR',
  sumber: 'Lainnya',
  marketing: '',
  tgl_akad: '',
  catatan: '',
};

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [units, setUnits] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...FORM_AWAL, lead_id: '' });
  const [editId, setEditId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const bisaHapus = user?.role === 'admin';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const [custRes, unitRes, leadRes] = await Promise.all([
        api.get(`/customers${params}`),
        api.get('/units'),
        api.get('/leads'),
      ]);
      setCustomers(custRes.data);
      setUnits(
        unitRes.data.filter(
          (u) => u.status === 'Tersedia' || u.status === 'Terjual' || u.status === 'Dipesan'
        )
      );
      setLeads(leadRes.data.filter((l) => l.status !== 'Dead'));
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredCustomers = customers.filter(c => 
    c.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.hp?.includes(searchQuery) ||
    c.unit_kode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function bukaTambah() {
    setForm({ ...FORM_AWAL, lead_id: '' });
    setEditId(null);
    setShowModal(true);
  }

  function bukaEdit(c) {
    setForm({
      nama: c.nama,
      hp: c.hp || '',
      email: c.email || '',
      unit_id: c.unit_id || '',
      unit_kode: c.unit_kode || '',
      total: c.total || '',
      terbayar: c.terbayar || '',
      metode_bayar: c.metode_bayar || 'KPR',
      sumber: c.sumber || 'Lainnya',
      marketing: c.marketing || '',
      tgl_akad: c.tgl_akad ? c.tgl_akad.split('T')[0] : '',
      catatan: c.catatan || '',
      lead_id: c.lead_id || '',
    });
    setEditId(c.id);
    setShowModal(true);
  }

  function tutupModal() {
    setShowModal(false);
    setForm({ ...FORM_AWAL, lead_id: '' });
    setEditId(null);
    setError('');
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === 'lead_id' && value) {
      const leadDipilih = leads.find((l) => l.id === parseInt(value));
      if (leadDipilih) {
        setForm({
          ...form,
          lead_id: value,
          nama: leadDipilih.nama,
          hp: leadDipilih.hp || '',
          email: leadDipilih.email || '',
          unit_id: leadDipilih.unit_id || '',
          unit_kode: leadDipilih.unit_kode || '',
          total: leadDipilih.budget || '',
          terbayar: leadDipilih.nominal_booking || '',
          sumber: leadDipilih.sumber || 'Lainnya',
          marketing: leadDipilih.marketing || '',
          catatan: leadDipilih.catatan || '',
        });
        return;
      }
    }

    if (name === 'unit_id') {
      const unitDipilih = units.find((u) => u.id === parseInt(value));
      setForm({
        ...form,
        unit_id: value,
        unit_kode: unitDipilih ? unitDipilih.kode : '',
        total: unitDipilih ? unitDipilih.harga : form.total,
      });
      return;
    }

    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        unit_id: form.unit_id ? parseInt(form.unit_id) : null,
        lead_id: form.lead_id ? parseInt(form.lead_id) : null,
        total: parseInt(form.total) || 0,
        terbayar: parseInt(form.terbayar) || 0,
        telepon: form.hp,
      };
      if (editId) {
        await api.put(`/customers/${editId}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      tutupModal();
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapus(c) {
    if (!window.confirm(`Hapus customer ${c.nama}? Status unit akan dikembalikan ke Tersedia.`))
      return;
    try {
      await api.delete(`/customers/${c.id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus customer');
    }
  }

  function sisaPiutang(c) {
    return (c.total || 0) - (c.terbayar || 0);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* ── HEADER ── */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
            <UserRound className="h-3 w-3" />
            Post-Sales & Relationship
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-[var(--text)] sm:text-5xl">
            Our <span className="text-[var(--accent)]">Customers</span>
          </h1>
          <p className="text-sm font-medium text-[var(--muted)]">
            {customers.length} nasabah terverifikasi dalam portofolio Anda.
          </p>
        </div>

        <button 
          onClick={bukaTambah}
          className="btn-primary px-6 py-3.5 text-sm font-bold shadow-lg shadow-[var(--accent-glow)]"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
          Registrasi Nasabah
        </button>
      </header>

      {/* ── FILTERS & SEARCH ── */}
      <section className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama nasabah, nomor HP, atau unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] transition-all text-[var(--text)] font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
            <Filter className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Payment Status</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterStatus('')}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${filterStatus === '' ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'}`}
            >
              Semua
            </button>
            {['Aktif', 'Lunas', 'Menunggak'].map(s => (
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
            <span className="text-sm font-bold text-[var(--muted)]">Syncing data...</span>
          </div>
        </div>
      ) : (
        <Panel title="Customer Ledger" subtitle="Daftar lengkap kepemilikan unit dan status pembayaran">
          <div className="table-container -mx-6 -mb-6 border-none shadow-none bg-transparent overflow-x-auto">
            <table className="table-modern w-full">
              <thead>
                <tr>
                  <th>Nasabah</th>
                  <th>Unit Detail</th>
                  <th>Investment</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <UserRound className="h-16 w-16" strokeWidth={1} />
                        <p className="font-bold uppercase tracking-widest text-xs">Belum ada nasabah terdaftar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="group">
                      <td>
                        <div className="flex items-center gap-4">
                          <Avatar name={c.nama} id={c.id} />
                          <div>
                            <div className="font-black text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{c.nama}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-[var(--muted)] flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {c.hp || '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-[var(--text)] uppercase tracking-tight">{c.unit_kode || '-'}</span>
                          <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                            {c.blok} · {c.tipe || 'No Specs'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm font-black text-[var(--text)]">
                          <CircleDollarSign className="h-4 w-4 text-emerald-500" />
                          {formatRupiah(c.total)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm font-bold text-[var(--success)]">
                          <Wallet className="h-4 w-4" />
                          {formatRupiah(c.terbayar)}
                        </div>
                      </td>
                      <td>
                         <div className={`text-sm font-black ${sisaPiutang(c) > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {formatRupiah(sisaPiutang(c))}
                         </div>
                      </td>
                      <td>
                        <span className={`status-badge border ${STATUS_COLOR[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => bukaEdit(c)} className="h-10 w-10 grid place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-all">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          {bisaHapus && (
                            <button onClick={() => handleHapus(c)} className="h-10 w-10 grid place-items-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
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
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={tutupModal} />
          
          <div className="relative w-full max-w-3xl bg-[var(--surface)] rounded-[40px] shadow-2xl border border-[var(--border)] overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
             <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-deep)]" />
             
             <div className="p-8 sm:p-10">
               <div className="flex items-center justify-between mb-8">
                 <div>
                   <h2 className="text-2xl font-black tracking-tight text-[var(--text)]">
                     {editId ? 'Update Customer Profile' : 'New Customer Onboarding'}
                   </h2>
                   <p className="text-sm font-bold text-[var(--muted)] mt-1 uppercase tracking-widest">
                     Lengkapi detail akad dan pembayaran
                   </p>
                 </div>
                 <button onClick={tutupModal} className="h-12 w-12 grid place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                   <X className="h-6 w-6" strokeWidth={3} />
                 </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                 {!editId && (
                   <div className="p-6 bg-[var(--accent-soft)]/30 rounded-3xl border border-[var(--accent-soft)]">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-3 block">Impor data dari database Lead (Prospek)</label>
                     <select 
                       name="lead_id" 
                       value={form.lead_id} 
                       onChange={handleChange} 
                       className="w-full h-12 px-4 bg-white border-2 border-[var(--accent-soft)] rounded-xl outline-none focus:border-[var(--accent)] transition-all font-bold text-sm"
                     >
                       <option value="">-- Pilih Lead --</option>
                       {leads.map((l) => (
                         <option key={l.id} value={l.id}>{l.nama} {l.unit_kode ? `(Unit ${l.unit_kode})` : `(${l.status})`}</option>
                       ))}
                     </select>
                   </div>
                 )}

                 <div className="grid sm:grid-cols-2 gap-5">
                   <InputField label="Nama Lengkap *" name="nama" value={form.nama} onChange={handleChange} required placeholder="Sesuai KTP" />
                   <InputField label="WhatsApp Contact" name="hp" value={form.hp} onChange={handleChange} placeholder="08xxxxxxxxxx" />
                   <InputField label="Email Address" name="email" value={form.email} onChange={handleChange} type="email" placeholder="email@contoh.com" />
                   
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">Metode Pembayaran</label>
                     <select name="metode_bayar" value={form.metode_bayar} onChange={handleChange} className="w-full h-14 px-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold text-sm text-[var(--text)] appearance-none">
                       {METODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">Pilih Unit Inventory</label>
                     <select name="unit_id" value={form.unit_id} onChange={handleChange} className="w-full h-14 px-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold text-sm text-[var(--text)] appearance-none">
                       <option value="">-- Pilih Unit --</option>
                       {units.map((u) => <option key={u.id} value={u.id}>{u.kode} · {u.tipe} · {u.blok}</option>)}
                     </select>
                   </div>

                   <InputField label="Unit Code (Fixed)" name="unit_kode" value={form.unit_kode} onChange={handleChange} placeholder="Otomatis" />
                   <InputField label="Total Kontrak (Rp) *" name="total" value={form.total} onChange={handleChange} required type="number" />
                   <InputField label="Total Terbayar (Rp)" name="terbayar" value={form.terbayar} onChange={handleChange} type="number" />
                   <InputField label="Tanggal Akad / SPJB" name="tgl_akad" value={form.tgl_akad} onChange={handleChange} type="date" />
                   <InputField label="Marketing In-Charge" name="marketing" value={form.marketing} onChange={handleChange} />
                 </div>

                 {form.total && (
                   <div className="flex items-center justify-between p-5 bg-[var(--surface-soft)] rounded-[24px] border border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Sisa Piutang Nasabah</span>
                      </div>
                      <span className="text-xl font-black text-rose-500">
                        {formatRupiah((parseInt(form.total) || 0) - (parseInt(form.terbayar) || 0))}
                      </span>
                   </div>
                 )}

                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">Catatan Akad</label>
                   <textarea name="catatan" value={form.catatan} onChange={handleChange} rows={2} className="w-full p-4 bg-[var(--bg)] border-2 border-[var(--border)] rounded-[24px] outline-none focus:border-[var(--accent)] transition-all font-medium text-sm text-[var(--text)] resize-none" placeholder="Detail termin, diskon, atau catatan khusus lainnya..." />
                 </div>

                 {error && <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">{error}</div>}

                 <div className="flex flex-col sm:flex-row gap-4 pt-2">
                   <button type="button" onClick={tutupModal} className="flex-1 btn-ghost h-14">Batal</button>
                   <button type="submit" disabled={submitting} className="flex-[2] btn-primary h-14 text-[15px]">
                     {submitting ? 'Processing...' : (editId ? 'Simpan Perubahan' : 'Finalisasi Registrasi')}
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
          <h2 className="m-0 text-xl font-black tracking-tight text-[var(--text)] uppercase">
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
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text)] ml-2">{label}</label>
      <input 
        {...props}
        className="w-full h-14 px-5 bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] transition-all font-bold text-sm text-[var(--text)] placeholder:text-[var(--muted)]/50"
      />
    </div>
  );
}

function Avatar({ name, id }) {
  const images = ['/bahan acak/poeple01.jpg', '/bahan acak/poeple02.jpg'];
  const idNum = typeof id === 'number' ? id : (id?.length || 0);
  const imgSrc = images[idNum % images.length];

  return (
    <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-200 shadow-inner overflow-hidden border-2 border-white/50">
      <img src={imgSrc} alt={name} className="h-full w-full object-cover" />
    </div>
  );
}

function formatRupiah(angka) {
  if (!angka && angka !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}
