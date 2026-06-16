import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
const HERO_IMAGE = "/assets/hero-bg.jpg";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (form.username === "admin" && form.password === "admin123") {
        const dummyUser = {
          id: 1,
          nama: "Administrator",
          username: "admin",
          role: "admin",
        };
        login(dummyUser, "dummy-token");
        navigate("/dashboard");
        return;
      }

      const res = await api.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      data-theme="dark"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-4 py-8 text-[var(--text)]"
    >
      {/* Background Orbs */}
      <div
        className="glow-orb -left-32 -top-24 h-[420px] w-[420px] opacity-30"
        style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 70%)" }}
      />
      <div
        className="glow-orb -right-24 bottom-0 h-[380px] w-[380px] opacity-20"
        style={{ background: "radial-gradient(circle, var(--accent-2-soft), transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-[440px]">
        <section className="overflow-hidden rounded-[40px] bg-[var(--surface)] shadow-[var(--shadow-float)] border border-[var(--border)] animate-in fade-in zoom-in duration-700">
          {/* Header Visual */}
          <div className="relative h-32 overflow-hidden">
             <img src={HERO_IMAGE} alt="Header" className="h-full w-full object-cover opacity-50 grayscale" />
             <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent" />
             <div className="absolute inset-0 flex items-center justify-center pt-8">
               <div className="h-16 w-16 rounded-3xl bg-white shadow-2xl p-2 border border-white/50">
                 <img src="/assets/logo.svg" alt="Logo" className="h-full w-full object-contain" />
               </div>
             </div>
          </div>

          <div className="p-8 pt-4">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-4">
                <ShieldCheck className="h-3 w-3" strokeWidth={3} />
                Secure Portal
              </div>
              <h1 className="font-display text-2xl font-black tracking-tight text-[var(--text)]">
                Prop<span className="text-[var(--accent)]">Suite</span> Login
              </h1>
              <p className="mt-2 text-xs font-bold text-[var(--muted)] uppercase tracking-widest leading-relaxed">
                Management System Access
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">Username</label>
                <div className="relative group">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="admin"
                    required
                    className="h-12 w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-soft)] pl-12 pr-4 text-sm font-bold text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">Password</label>
                <div className="relative group">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="h-12 w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--surface-soft)] pl-12 pr-4 text-sm font-bold text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-center text-xs font-bold text-rose-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 text-sm font-black uppercase tracking-widest mt-4 shadow-lg shadow-[var(--accent-glow)] active:scale-[0.98] transition-all"
              >
                {loading ? "Authenticating..." : "Access Dashboard"}
                {!loading && <ArrowRight className="h-4 w-4 ml-2" strokeWidth={3} />}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--border)]">
               <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)]">
                   <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">User</p>
                   <p className="text-[11px] font-bold text-[var(--text)]">admin</p>
                 </div>
                 <div className="p-3 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)]">
                   <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">Pass</p>
                   <p className="text-[11px] font-bold text-[var(--text)]">admin123</p>
                 </div>
               </div>
            </div>
            
            <div className="mt-6 text-center">
               <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-[0.3em]">
                 PropSuite Intelligence © 2026
               </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
