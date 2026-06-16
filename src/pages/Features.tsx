import { motion } from "framer-motion";
import { 
  Globe, 
  BarChart3, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Layout, 
  Database, 
  ShieldCheck,
  PieChart,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";

const featureManagement = "/assets/feature-management.jpg";
const featureInsight = "/assets/feature-insight.jpg";
const featureAutomation = "/assets/feature-automation.jpg";

const FeatureDetail = () => {
  return (
    <div className="bg-[var(--bg)] text-[var(--text)]">
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-48 sm:pb-36">
        <div className="glow-orb -top-20 left-1/2 -translate-x-1/2 h-[700px] w-[700px] opacity-30" 
             style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }} />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="eyebrow justify-center mb-8">Product Deep Dive</div>
            <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl mb-10 leading-[1.05]">
              Arsitektur Bisnis <br />
              <span className="font-display-italic text-[var(--accent)]">Masa Depan</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg sm:text-xl text-[var(--muted)] leading-relaxed font-medium">
              Lihat bagaimana kami mentransformasi operasional properti yang rumit 
              menjadi simfoni data yang efisien, transparan, dan menguntungkan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───────────────── FEATURE 1: MANAJEMEN TERPUSAT ───────────────── */}
      <section id="manajemen" className="py-24 sm:py-36 border-t border-[var(--border)] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]">
                  <Globe className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--accent)] block">Pilar Strategis</span>
                  <span className="text-xl font-display font-semibold italic text-[var(--text)]">Command Center</span>
                </div>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold mb-8 leading-tight">Manajemen Terpusat: Kendali Tanpa Batas</h2>
              <p className="text-[var(--muted)] text-lg mb-10 leading-relaxed">
                Kelola ribuan unit di puluhan proyek lintas kota dari satu layar. 
                Sistem kami dirancang untuk skalabilitas enterprise tanpa mengorbankan 
                kemudahan navigasi.
              </p>
              
              <div className="space-y-5 mb-12">
                {[
                  "Multi-Project View: Pantau semua cabang sekaligus.",
                  "Siteplan Interaktif: Status unit (Sold/Booked) update seketika.",
                  "Global Search: Cari data unit atau customer dalam hitungan detik.",
                  "Audit Log: Lacak setiap perubahan data dengan akurasi tinggi."
                ].map((item) => {
                  const [title, desc] = item.split(": ");
                  return (
                    <div key={title} className="flex items-start gap-4">
                      <div className="mt-1 h-6 w-6 rounded-full bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                      </div>
                      <p className="text-[15px] font-medium leading-relaxed">
                        <span className="font-black text-[var(--text)]">{title}:</span> {desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="p-1 rounded-[40px] bg-gradient-to-r from-[var(--accent)]/20 to-transparent">
                <div className="bg-[var(--surface)] p-8 rounded-[38px] flex items-center gap-6">
                  <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[var(--accent-soft)]">
                    <Layout className="h-8 w-8 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest mb-1 text-[var(--text)]">Unified Experience</h4>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">Pengalaman kerja yang konsisten di desktop maupun mobile field.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-gradient-to-br from-[var(--accent)]/10 to-transparent blur-3xl rounded-full" />
              <div className="relative group">
                <div className="absolute inset-0 bg-[var(--accent)]/20 translate-x-6 translate-y-6 rounded-[56px] blur-sm -z-10 transition-transform group-hover:translate-x-4 group-hover:translate-y-4" />
                <img 
                  src={featureManagement} 
                  alt="Unified Management Interface" 
                  className="relative rounded-[56px] shadow-2xl border border-white/10 w-full object-cover aspect-[4/3]"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURE 2: INSIGHT BERBASIS DATA ───────────────── */}
      <section id="insight" className="py-24 sm:py-36 bg-[var(--surface-soft)]/20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="absolute -inset-10 bg-[var(--accent-2)]/5 blur-[100px] rounded-full" />
              <div className="relative overflow-hidden rounded-[64px] shadow-2xl border border-[var(--border)]">
                <img 
                  src={featureInsight} 
                  alt="Analytical Intelligence Dashboard" 
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/40 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 glass p-8 rounded-[40px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--accent-2)] mb-2">Growth Analysis</p>
                      <p className="text-2xl font-display font-semibold text-white">+28.5% Performance</p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-[var(--accent-2)] grid place-items-center text-white shadow-lg">
                      <BarChart3 className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent-2)] text-white shadow-lg shadow-[var(--accent-2-soft)]">
                  <PieChart className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--accent-2)] block">Intelijen Bisnis</span>
                  <span className="text-xl font-display font-semibold italic text-[var(--text)]">Growth Catalyst</span>
                </div>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold mb-8 leading-tight">Insight Berbasis Data: Keputusan Cerdas</h2>
              <p className="text-[var(--muted)] text-lg mb-10 leading-relaxed font-medium">
                Berhenti menebak-nebak masa depan bisnis Anda. Gunakan analitik prediktif 
                untuk memahami tren pasar, performa unit, dan efektivitas tim marketing 
                secara akurat.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-1 w-12 bg-[var(--accent-2)] rounded-full" />
                  <h4 className="font-black text-sm uppercase tracking-widest text-[var(--text)]">Visual Metrics</h4>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">Dashboard grafis yang mudah dipahami oleh pemilik bisnis dan manajer.</p>
                </div>
                <div className="space-y-4">
                  <div className="h-1 w-12 bg-[var(--accent-2)] rounded-full" />
                  <h4 className="font-black text-sm uppercase tracking-widest text-[var(--text)]">Real-time Reporting</h4>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">Export laporan keuangan, piutang, dan stok unit dalam hitungan detik.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURE 3: OTOMASI TANPA RIBET ───────────────── */}
      <section id="otomasi" className="py-24 sm:py-36 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--success)] text-white shadow-lg shadow-[var(--success-soft)]">
                  <Zap className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--success)] block">Otomasi Alur Kerja</span>
                  <span className="text-xl font-display font-semibold italic text-[var(--text)]">Frictionless Ops</span>
                </div>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold mb-8 leading-tight">Otomasi Tanpa Ribet: Biarkan Sistem Bekerja</h2>
              <p className="text-[var(--muted)] text-lg mb-10 leading-relaxed font-medium">
                Hilangkan tugas administratif yang berulang. Dari reminder tagihan via 
                WhatsApp hingga update progres pembangunan, semua berjalan otomatis 
                di latar belakang.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { title: "Smart Billing", desc: "Tagihan & kuitansi terkirim otomatis ke email/WA.", icon: FileText },
                  { title: "Auto-Journal", desc: "Setiap transaksi langsung masuk ke buku besar.", icon: Database },
                  { title: "Digital Signing", desc: "Proses PPJB & Akad tanpa perlu tatap muka.", icon: ShieldCheck },
                  { title: "Notification Hub", desc: "Alert real-time untuk setiap approval penting.", icon: ArrowRight },
                ].map((item) => (
                  <div key={item.title} className="p-7 rounded-[40px] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--accent-soft)]/30 transition-all duration-500 hover:border-[var(--accent)] group">
                    <item.icon className="h-8 w-8 text-[var(--accent)] mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                    <h4 className="font-black text-[13px] uppercase tracking-widest mb-2 text-[var(--text)]">{item.title}</h4>
                    <p className="text-[13px] text-[var(--muted)] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-16 bg-[var(--success)]/10 blur-[120px] rounded-full" />
              <div className="relative group">
                <img 
                  src={featureAutomation} 
                  alt="Automated Workflow Engine" 
                  className="rounded-[64px] shadow-[var(--shadow-float)] border-4 border-white/50 w-full aspect-square object-cover"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-white/30 backdrop-blur-xl border border-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 cursor-pointer">
                  <Zap className="h-10 w-10 text-white fill-white animate-pulse" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────── FINAL CTA ───────────────── */}
      <section className="py-24 sm:py-40 bg-[var(--navy)] text-white relative overflow-hidden">
        <div className="glow-orb top-0 right-0 h-96 w-96 opacity-40" 
             style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }} />
        
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-5xl sm:text-6xl font-semibold mb-10 leading-tight">Masa Depan Properti <br /> Dimulai dari Sini.</h2>
          <p className="text-lg sm:text-xl text-white/70 mb-14 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan pengembang properti terkemuka yang telah mendigitalkan 
            seluruh alur kerja mereka dengan PropSuite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link to="/dashboard" className="btn-primary px-12 py-6 text-[16px] font-black uppercase tracking-[0.2em] w-full sm:w-auto shadow-2xl hover:scale-105 transition-transform active:scale-95">
              Start Free Trial
              <ArrowRight className="ml-3 h-6 w-6" strokeWidth={3} />
            </Link>
            <Link to="/" className="btn-ghost border-2 border-white/80 bg-white/5 text-white hover:bg-white hover:text-[var(--navy)] px-12 py-6 text-[16px] font-black uppercase tracking-[0.2em] w-full sm:w-auto transition-all duration-300">
              Beranda
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeatureDetail;
