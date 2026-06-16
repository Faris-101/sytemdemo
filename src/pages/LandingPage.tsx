import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Globe,
  Zap,
  Gauge,
  LayoutGrid,
  Users2,
  Wallet,
  FileSignature,
  HardHat,
  Receipt,
  ChevronDown,
  Sparkles,
  Calendar,
  Layers,
  Shield,
} from "lucide-react";

const villaNight = "/assets/hero-premium.jpg";
const livingRoomLuxe = "/assets/interior-premium.jpg";
const villaPoolDay = "/assets/exterior-premium.jpg";

const STATS = [
  { icon: LayoutGrid, value: "24+", label: "Modul Operasional" },
  { icon: Building2, value: "12", label: "Proyek Aktif" },
  { icon: Gauge, value: "99.9%", label: "Uptime Cloud" },
  { icon: Zap, value: "Real-time", label: "Sinkronisasi Data" },
];

const MODULE_CATEGORIES = ["Penjualan", "Proyek", "Keuangan", "Legal"];

const ALL_MODULES = [
  // Penjualan
  { icon: Users2, label: "Leads & CRM", cat: "Penjualan" },
  { icon: Building2, label: "Unit Inventori", cat: "Penjualan" },
  { icon: BarChart3, label: "Price List", cat: "Penjualan" },
  { icon: Calendar, label: "Booking System", cat: "Penjualan" },
  { icon: Receipt, label: "Komisi Sales", cat: "Penjualan" },
  { icon: Users2, label: "Tim Marketing", cat: "Penjualan" },
  // Proyek
  { icon: HardHat, label: "Konstruksi", cat: "Proyek" },
  { icon: Layers, label: "Siteplan", cat: "Proyek" },
  { icon: Zap, label: "Bahan Baku", cat: "Proyek" },
  { icon: Gauge, label: "Progress Unit", cat: "Proyek" },
  { icon: FileSignature, label: "SPK Kontraktor", cat: "Proyek" },
  { icon: Globe, label: "Logistik", cat: "Proyek" },
  // Keuangan
  { icon: Wallet, label: "Penerimaan", cat: "Keuangan" },
  { icon: Receipt, label: "Invoice & Billing", cat: "Keuangan" },
  { icon: BarChart3, label: "Laba Rugi", cat: "Keuangan" },
  { icon: Layers, label: "Jurnal Akuntansi", cat: "Keuangan" },
  { icon: ShieldCheck, label: "Approval Dana", cat: "Keuangan" },
  { icon: Wallet, label: "Hutang Piutang", cat: "Keuangan" },
  // Legal
  { icon: FileSignature, label: "PPJB / Akad", cat: "Legal" },
  { icon: Shield, label: "Sertifikasi", cat: "Legal" },
  { icon: LayoutGrid, label: "Arsip Digital", cat: "Legal" },
  { icon: FileSignature, label: "E-Signature", cat: "Legal" },
  { icon: Receipt, label: "Pajak Properti", cat: "Legal" },
  { icon: ShieldCheck, label: "Kepatuhan", cat: "Legal" },
];

const FEATURES = [
  {
    icon: Globe,
    title: "Manajemen Terpusat",
    desc: "Pantau seluruh proyek, unit, dan cabang dari satu dashboard real-time—di mana pun timmu berada.",
    tone: "accent",
    slug: "manajemen",
  },
  {
    icon: BarChart3,
    title: "Insight Berbasis Data",
    desc: "Laporan penjualan, keuangan, dan progres konstruksi otomatis tersaji rapi, siap untuk keputusan cepat.",
    tone: "accent",
    slug: "insight",
  },
  {
    icon: Zap,
    title: "Otomasi Tanpa Ribet",
    desc: "Invoice, reminder pembayaran, hingga dokumen legal berjalan otomatis di latar belakang.",
    tone: "gold",
    slug: "otomasi",
  },
];

const FAQS = [
  {
    q: "Apakah PropSuite cocok untuk pengembang skala kecil maupun besar?",
    a: "Ya. Struktur modul PropSuite fleksibel—mulai dari satu proyek perumahan hingga puluhan proyek lintas cabang, semua tetap tertata dalam satu workspace.",
  },
  {
    q: "Bagaimana keamanan data perusahaan kami?",
    a: "Setiap akun memiliki peran & hak akses terpisah, data dienkripsi, dan seluruh aktivitas penting tercatat dalam log audit yang dapat ditelusuri.",
  },
  {
    q: "Apakah bisa diakses dari perangkat mobile?",
    a: "Tentu. Tampilan PropSuite dioptimalkan untuk desktop maupun mobile, sehingga tim lapangan tetap terhubung saat berada di lokasi proyek.",
  },
  {
    q: "Apakah data dari sistem lama bisa dipindahkan?",
    a: "Bisa. Tim kami membantu proses migrasi data unit, customer, dan transaksi agar histori bisnis Anda tetap utuh saat berpindah ke PropSuite.",
  },
];

const CLIENTS = [
  "Global Land",
  "Nusantara Property",
  "Cibubur Group",
  "Modern Dev",
  "Puncak Jaya",
  "Urban Living",
];

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTab, setActiveTab] = useState("Penjualan");

  const filteredModules = ALL_MODULES.filter((m) => m.cat === activeTab);

  return (
    <div className="relative flex flex-col overflow-hidden">
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden pb-20 pt-32 sm:pb-32 sm:pt-48">
        <div
          className="glow-orb -left-32 -top-40 h-[500px] w-[500px] opacity-40"
          style={{
            background:
              "radial-gradient(circle, var(--accent), transparent 70%)",
          }}
        />
        <div
          className="glow-orb -right-24 top-1/4 h-[400px] w-[400px] opacity-30"
          style={{
            background:
              "radial-gradient(circle, var(--accent-2), transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="eyebrow justify-center lg:justify-start">
                  PropSuite OS — Next-Gen Property Workspace
                </div>

                <h1 className="font-display mt-8 text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--text)] sm:text-6xl lg:text-7.5xl">
                  Satu Dashboard.
                  <br />
                  <span className="font-display-italic text-[var(--accent)]">
                    Tak Terbatas
                  </span>
                  <br />
                  Masa Depan.
                </h1>

                <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-[var(--muted)] lg:mx-0 lg:text-lg">
                  Satukan penjualan, unit, keuangan, dan tim lapangan dalam satu
                  workspace elegan. Dirancang untuk pengembang yang menghargai
                  kecepatan dan estetika.
                </p>

                <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <Link
                    to="/dashboard"
                    className="btn-primary w-full px-8 py-4.5 text-[15px] sm:w-auto"
                  >
                    Masuk ke Dashboard
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </Link>
                  <a
                    href="#fitur"
                    className="btn-ghost w-full px-8 py-4.5 text-[15px] sm:w-auto border-2 border-[var(--accent)]/50 bg-[var(--accent-soft)]/20 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all duration-300"
                  >
                    Eksplorasi Fitur
                  </a>
                </div>

                <div className="mt-14 flex items-center justify-center gap-5 lg:justify-start">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="grid h-11 w-11 place-items-center rounded-full border-4 border-[var(--bg)] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] text-[12px] font-black text-white shadow-lg"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="text-left text-sm font-bold leading-tight text-[var(--muted)]">
                    Dipercaya oleh{" "}
                    <span className="text-[var(--text)]">50+ Pengembang</span>
                    <br /> ternama di seluruh Indonesia
                  </p>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative mx-auto max-w-xl animate-in fade-in slide-in-from-right-10 duration-1000 lg:max-w-none">
              <div className="group relative overflow-hidden rounded-[48px] shadow-[var(--shadow-float)]">
                <img
                  src={villaNight}
                  alt="Properti modern PropSuite"
                  className="h-[450px] w-full object-cover transition-transform duration-1000 group-hover:scale-105 sm:h-[520px] lg:h-[600px]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 via-transparent to-transparent" />

                <div className="absolute left-6 top-6 flex items-center gap-2.5 rounded-full bg-black/40 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white backdrop-blur-xl">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                  Live System Active
                </div>
              </div>

              {/* Floating card — occupancy */}
              <div className="glass absolute -left-10 top-16 hidden w-52 rounded-[32px] p-5 shadow-[var(--shadow-card)] sm:block">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                  Okupansi Proyek
                  <ArrowUpRight className="h-4 w-4 text-[var(--accent)]" />
                </div>
                <div className="mt-3 text-3xl font-black text-[var(--text)]">
                  96.4%
                </div>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-soft)]">
                  <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]" />
                </div>
              </div>

              {/* Floating card — sales growth */}
              <div className="glass absolute -bottom-10 -right-4 w-56 rounded-[32px] p-5 shadow-[var(--shadow-card)] sm:-right-10">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                  Growth Penjualan
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                    <TrendingUp className="h-4 w-4" strokeWidth={3} />
                  </span>
                </div>
                <div className="mt-3 text-3xl font-black text-[var(--text)]">
                  +32.8%
                </div>
                <p className="mt-2 text-[11px] font-bold text-[var(--muted)]">
                  Optimasi sistem bulan ini
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── TRUSTED BY ───────────────── */}
      <section className="relative z-10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-60">
              Trusted by Forward-Thinking Developers
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10 opacity-30 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
              {CLIENTS.map((client) => (
                <span
                  key={client}
                  className="font-display text-2xl font-black tracking-tighter text-[var(--text)]"
                >
                  {client.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── STATS STRIP ───────────────── */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="glass mx-auto grid max-w-6xl grid-cols-2 gap-8 rounded-[40px] border-[var(--nav-border)] p-10 shadow-[var(--shadow-card)] sm:grid-cols-4 sm:gap-6">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="group flex flex-col items-center gap-4 text-center sm:items-start sm:text-left"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform group-hover:scale-110">
                <s.icon className="h-6 w-6" strokeWidth={2.4} />
              </span>
              <div>
                <div className="font-display text-3xl font-semibold text-[var(--text)]">
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── COMMAND CENTER (INTERACTIVE) ───────────────── */}
      <section
        id="solusi"
        className="relative px-4 py-28 sm:px-6 sm:py-36 lg:px-8"
      >
        <div className="mx-auto max-w-5xl text-center">
          <div className="eyebrow justify-center">Digital Ecosystem</div>
          <h2 className="font-display mt-6 text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
            Modul Lengkap. Alur Terjaga.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            PropSuite mengintegrasikan setiap titik sentuh bisnis Anda, dari
            prospek pertama hingga serah terima kunci yang sempurna.
          </p>
        </div>

        <div className="surface-card relative z-10 mx-auto mt-16 max-w-6xl rounded-[48px] p-4 shadow-2xl shadow-[var(--accent-glow)]/10">
          <div className="flex flex-wrap items-center justify-center gap-3 border-b border-[var(--border)] p-6 sm:justify-start">
            {MODULE_CATEGORIES.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-8 py-3 text-[13px] font-black uppercase tracking-widest transition-all duration-500 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-deep)] text-white shadow-[0_12px_24px_var(--accent-glow)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 p-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredModules.map((m, idx) => (
              <div
                key={`${m.label}-${idx}`}
                className="animate-in fade-in zoom-in group flex flex-col items-center gap-5 rounded-[36px] bg-[var(--surface-soft)]/40 px-4 py-10 text-center transition-all duration-500 hover:-translate-y-2 hover:bg-[var(--accent-soft)] hover:shadow-xl"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--accent)] shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-white">
                  <m.icon className="h-7 w-7" strokeWidth={2.2} />
                </span>
                <span className="text-[13px] font-black leading-tight text-[var(--text)] uppercase tracking-tight">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section id="fitur" className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="eyebrow justify-center">Platform Core</div>
            <h2 className="font-display mt-6 text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
              Dibuat untuk Efisiensi Tanpa Batas
            </h2>
          </div>

          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`surface-card group flex flex-col gap-8 rounded-[48px] p-12 transition-all duration-500 hover:shadow-glow ${
                  f.tone === "gold"
                    ? "bg-gradient-to-br from-[var(--accent-2-soft)]/20 to-transparent"
                    : ""
                }`}
              >
                <span
                  className={`grid h-16 w-16 place-items-center rounded-[22px] transition-transform duration-700 group-hover:rotate-[10deg] group-hover:scale-110 ${
                    f.tone === "gold"
                      ? "bg-[var(--accent-2)] text-white"
                      : "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] text-white"
                  } shadow-lg shadow-[var(--accent-glow)]`}
                >
                  <f.icon className="h-8 w-8" strokeWidth={2.2} />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[var(--text)]">
                    {f.title}
                  </h3>
                  <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">
                    {f.desc}
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="h-px w-full bg-[var(--border)] mb-6" />
                  <Link
                    to={`/features#${f.slug}`}
                    className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[var(--accent)] transition-transform hover:translate-x-1"
                  >
                    Learn More
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SHOWCASE ───────────────── */}
      <section
        id="showcase"
        className="relative px-4 py-28 sm:px-6 sm:py-40 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-2">
          <div className="relative group">
            <div className="absolute -inset-4 rounded-[64px] bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 blur-3xl opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />
            <div className="relative overflow-hidden rounded-[56px] shadow-[var(--shadow-float)]">
              <img
                src={livingRoomLuxe}
                alt="Interior properti premium"
                className="h-[450px] w-full object-cover transition-transform duration-1000 group-hover:scale-110 sm:h-[550px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/70 via-transparent to-transparent" />
              <div className="glass absolute bottom-8 left-8 right-8 flex items-center justify-between rounded-[32px] px-8 py-6 sm:right-auto sm:w-80">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                    User Satisfaction
                  </div>
                  <div className="font-display mt-1 text-3xl font-semibold text-[var(--text)]">
                    4.9 / 5.0
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((i) => (
                    <Sparkles
                      key={i}
                      className="h-7 w-7 text-[var(--accent-2)]"
                      strokeWidth={2}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="eyebrow">Experience Focused</div>
            <h2 className="font-display mt-6 text-4xl font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              Detail yang Memanjakan Produktivitas Tim Anda
            </h2>
            <p className="mt-8 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Kami percaya alat kerja yang indah akan menghasilkan kualitas
              kerja yang lebih tinggi. Antarmuka PropSuite dirancang for
              kenyamanan visual jangka panjang.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-8">
              <div className="group rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 transition-all hover:border-[var(--accent)] hover:shadow-xl">
                <div className="font-display text-5xl font-semibold text-[var(--accent)] group-hover:scale-105 transition-transform">
                  99.9%
                </div>
                <p className="mt-3 text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
                  Uptime Cloud
                </p>
              </div>
              <div className="group rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 transition-all hover:border-[var(--accent)] hover:shadow-xl">
                <div className="font-display text-5xl font-semibold text-[var(--accent)] group-hover:scale-105 transition-transform">
                  24/7
                </div>
                <p className="mt-3 text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
                  Fast Support
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              {[
                "Smooth Animation",
                "Mobile Native Feel",
                "Dark Mode Ready",
              ].map((t) => (
                <span
                  key={t}
                  className="chip border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-[var(--text)] transition-colors hover:border-[var(--accent)]"
                >
                  <ShieldCheck
                    className="h-4.5 w-4.5 text-[var(--accent)]"
                    strokeWidth={2.5}
                  />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── SOLUTION / CTA PANEL ───────────────── */}
      <section
        id="solusi-bisnis"
        className="relative px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[64px] bg-gradient-to-br from-[#1c1730] via-[var(--accent-deep)] to-[var(--accent)] px-8 py-20 text-white sm:px-20 sm:py-28">
          <div
            className="glow-orb -right-20 -top-20 h-96 w-96 opacity-40"
            style={{
              background:
                "radial-gradient(circle, var(--accent-2), transparent 70%)",
            }}
          />
          <div
            className="glow-orb -left-20 -bottom-20 h-96 w-96 opacity-30"
            style={{
              background: "radial-gradient(circle, white, transparent 70%)",
            }}
          />

          <div className="relative z-10 grid items-center gap-20 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-6 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-white/90 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-[var(--accent-2)]" />
                Scalable Enterprise
              </div>
              <h2 className="font-display mt-10 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6.5xl">
                Tumbuh Lebih Cepat <br /> Dengan PropSuite OS.
              </h2>
              <p className="mt-10 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
                Dari satu klaster hingga puluhan proyek strategis—PropSuite
                beradaptasi sempurna dengan ambisi bisnis Anda.
              </p>
              <Link
                to="/dashboard"
                className="btn-onyx mt-12 inline-flex items-center px-10 py-5 text-[16px] font-black uppercase tracking-widest"
              >
                Get Started Now
                <ArrowRight className="ml-3 h-5 w-5" strokeWidth={3} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {[
                { val: "500+", label: "Projects Managed" },
                { val: "20K+", label: "Units Tracked" },
                { val: "12", label: "Module Groups" },
                { val: "A+", label: "Security Level", highlight: true },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-[40px] p-10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 ${
                    s.highlight
                      ? "bg-[var(--accent-2)]/20 ring-1 ring-[var(--accent-2)]/50"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <div
                    className={`font-display text-4xl font-semibold sm:text-5xl ${
                      s.highlight ? "text-[var(--accent-2)]" : "text-white"
                    }`}
                  >
                    {s.val}
                  </div>
                  <p className="mt-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ ───────────────── */}
      <section
        id="faq"
        className="relative px-4 py-28 sm:px-6 sm:py-36 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="eyebrow justify-center">Knowledge Base</div>
            <h2 className="font-display mt-6 text-4xl font-semibold tracking-tight text-[var(--text)] sm:text-5xl">
              Pertanyaan Umum
            </h2>
          </div>

          <div className="mt-20 space-y-5">
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={item.q}
                  className={`surface-card overflow-hidden rounded-[36px] transition-all duration-500 ${
                    isOpen
                      ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                      : "hover:border-[var(--accent)]/30"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-6 px-10 py-8 text-left"
                  >
                    <span className="text-lg font-bold text-[var(--text)] leading-snug">
                      {item.q}
                    </span>
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--surface-soft)] text-[var(--accent)] transition-all duration-500 ${
                        isOpen
                          ? "rotate-180 bg-[var(--accent)] text-white shadow-lg"
                          : ""
                      }`}
                    >
                      <ChevronDown className="h-6 w-6" strokeWidth={2.5} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-10 pb-10 text-[16px] leading-relaxed text-[var(--muted)] animate-in fade-in slide-in-from-top-4">
                      <div className="h-px w-full bg-[var(--border)] mb-8" />
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── FINAL CTA ───────────────── */}
      <section className="relative px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[64px] bg-[#0a0914] shadow-2xl">
          <img
            src={villaPoolDay}
            alt="Properti hunian premium"
            className="h-[500px] w-full object-cover opacity-40 transition-transform duration-[2000ms] hover:scale-110 sm:h-[600px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0914] via-[#0a0914]/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-white">
            <div className="eyebrow justify-center text-white/60 mb-8">
              Take the Lead
            </div>
            <h2 className="font-display max-w-4xl text-5xl font-semibold leading-[1.1] tracking-tight sm:text-7xl">
              Ubah Cara Anda Mengelola Properti Selamanya.
            </h2>
            <p className="mt-10 max-w-xl text-base leading-relaxed text-white/60 sm:text-xl">
              Bergabunglah dengan pengembang modern yang telah beralih ke
              workspace masa depan.
            </p>
            <div className="mt-14 flex flex-col items-center gap-6 sm:flex-row">
              <Link
                to="/dashboard"
                className="btn-primary w-full px-12 py-5.5 text-[16px] font-black uppercase tracking-widest sm:w-auto"
              >
                Buka Dashboard
                <ArrowRight className="ml-3 h-6 w-6" strokeWidth={3} />
              </Link>
              <button className="btn-ghost border-2 border-white/80 px-12 py-5.5 text-[16px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-[var(--navy)] hover:border-white sm:w-auto transition-all duration-300">
                Hubungi Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
