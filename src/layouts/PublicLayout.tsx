import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Globe, MessageCircle, Send, Share2, Mail, ArrowUp } from 'lucide-react';

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Fitur', to: '/features' },
    { label: 'Solusi', href: '/#solusi' },
    { label: 'Showcase', href: '/#showcase' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)]">
      {/* ───────────────── NAVIGATION ───────────────── */}
      <nav className="fixed inset-x-0 top-0 z-[100] px-4 pt-6 sm:px-6 lg:px-8">
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[32px] border px-6 py-3 transition-all duration-500 sm:px-8 ${
            isScrolled
              ? 'glass border-[var(--nav-border)] shadow-[var(--shadow-float)] py-3'
              : 'border-transparent bg-transparent py-5'
          }`}
        >
          <Link to="/" className="group flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-lg shadow-[var(--accent-glow)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 overflow-hidden p-1.5 border border-[var(--border)]">
              <img src="/assets/logo.svg" alt="PropSuite Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-2xl font-black tracking-tighter text-[var(--text)]">
              Prop<span className="text-[var(--accent)]">Suite</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-10 lg:flex">
            {navLinks.map((item) => (
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted)] transition-all hover:text-[var(--accent)] hover:tracking-[0.25em]"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted)] transition-all hover:text-[var(--accent)] hover:tracking-[0.25em]"
                >
                  {item.label}
                </a>
              )
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              to="/login"
              className="rounded-full px-6 py-3 text-[13px] font-black uppercase tracking-widest text-[var(--text)] transition-colors hover:text-[var(--accent)]"
            >
              Sign In
            </Link>
            <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-[13px] font-black uppercase tracking-widest">
              Get Started
              <ArrowUpRight className="h-4 w-4" strokeWidth={3} />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text)] shadow-sm transition-transform active:scale-90"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[-1] bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setIsMenuOpen(false)} />
        )}

        {/* Mobile Menu Card */}
        <div 
          className={`absolute left-4 right-4 top-24 z-[110] transition-all duration-500 lg:hidden ${
            isMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="glass flex flex-col gap-6 rounded-[40px] border border-[var(--nav-border)] p-8 shadow-2xl">
            <div className="flex flex-col gap-4">
              {navLinks.map((item) => (
                item.to ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-black uppercase tracking-widest text-[var(--text)] transition-colors hover:text-[var(--accent)]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-black uppercase tracking-widest text-[var(--text)] transition-colors hover:text-[var(--accent)]"
                  >
                    {item.label}
                  </a>
                )
              ))}
            </div>
            <div className="h-px w-full bg-[var(--border)]" />
            <div className="flex flex-col gap-4">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-black uppercase tracking-widest text-[var(--muted)]"
              >
                Sign In
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="btn-primary px-8 py-5 text-center text-[14px] font-black uppercase tracking-widest"
              >
                Buka Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ───────────────── CONTENT ───────────────── */}
      <main className="relative">
        <Outlet />
      </main>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--surface)] pb-12 pt-24">
        <div
          className="glow-orb left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 opacity-20"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}
        />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-16 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <Link to="/" className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-lg overflow-hidden p-2">
                  <img src="/assets/logo.svg" alt="PropSuite Logo" className="h-full w-full object-contain" />
                </div>
                <span className="font-display text-2xl font-black tracking-tighter">
                  Prop<span className="text-[var(--accent)]">Suite</span>
                </span>
              </Link>
              <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-[var(--muted)]">
                Solusi workspace digital terintegrasi untuk pengembang properti modern. 
                Satu dashboard untuk seluruh perjalanan operasional Anda.
              </p>
              <div className="mt-10 flex items-center gap-4">
                {[MessageCircle, Send, Share2, Mail, Globe].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)]/50 text-[var(--muted)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white hover:-translate-y-1"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--text)]">
                Solutions
              </h4>
              <ul className="mt-8 space-y-4">
                {['CRM & Sales', 'Inventory', 'Accounting', 'Legal Docs'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[14px] font-bold text-[var(--muted)] transition-colors hover:text-[var(--accent)]">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--text)]">
                Company
              </h4>
              <ul className="mt-8 space-y-4">
                {['About Us', 'Success Stories', 'Privacy Policy', 'Terms'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[14px] font-bold text-[var(--muted)] transition-colors hover:text-[var(--accent)]">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--text)]">
                Support
              </h4>
              <ul className="mt-8 space-y-4">
                {['Documentation', 'Help Center', 'API Status', 'Contact'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[14px] font-bold text-[var(--muted)] transition-colors hover:text-[var(--accent)]">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-24 flex flex-col items-center justify-between gap-8 border-t border-[var(--border)] pt-12 sm:flex-row">
            <p className="text-[13px] font-black uppercase tracking-widest text-[var(--muted)]">
              © 2026 PropSuite OS. Crafted with Precision.
            </p>
            <div className="flex items-center gap-3 rounded-full bg-[var(--surface-soft)] px-5 py-2 text-[11px] font-black text-[var(--muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
              SYSTEM STATUS: ALL SYSTEMS OPERATIONAL
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top */}
      {isScrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-10 right-10 z-[120] grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent)] text-white shadow-2xl transition-all hover:scale-110 hover:shadow-[var(--shadow-glow)] active:scale-95 animate-in fade-in zoom-in duration-500"
        >
          <ArrowUp className="h-7 w-7" strokeWidth={3} />
        </button>
      )}
    </div>
  );
};

export default PublicLayout;
