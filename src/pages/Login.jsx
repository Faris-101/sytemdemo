import {
  ArrowRight,
  Building2,
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
      // Bypass untuk demo jika menggunakan admin/admin123
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
      className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-6 lg:px-10 lg:py-8"
    >
      <div
        className="glow-orb -left-32 -top-24 h-[420px] w-[420px] opacity-50"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow), transparent 70%)",
        }}
      />
      <div
        className="glow-orb -right-24 bottom-0 h-[380px] w-[380px] opacity-40"
        style={{
          background:
            "radial-gradient(circle, var(--accent-2-soft), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1480px] gap-6 lg:grid-cols-[minmax(430px,0.82fr)_minmax(560px,1.18fr)]">
        <section className="relative flex min-h-[auto] flex-col rounded-[42px] bg-[var(--surface)] p-5 shadow-[var(--shadow-float)] sm:p-8 lg:rounded-[54px] lg:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PropSuiteLogo />
              <div>
                <div className="font-display text-[22px] font-semibold leading-6">
                  Prop<span className="text-[var(--accent)]">Suite</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                  Smart Property System
                </p>
              </div>
            </div>
            <div className="hidden rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-bold text-[var(--muted)] sm:block">
              CRM
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[390px]">
              <div className="mb-8 text-center">
                <div className="chip mx-auto mb-4 border border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
                  Secure Access
                </div>
                <h1 className="font-display text-[34px] font-semibold leading-tight text-[var(--text)]">
                  Selamat datang
                </h1>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Masuk untuk mengelola properti, leads, customer, dan aktivitas
                  bisnis PropSuite.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--muted)]">
                    Username
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                      <UserRound className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Masukkan username"
                      required
                      className="h-[56px] w-full rounded-[26px] border border-[var(--border)] bg-[var(--surface-soft)] pl-14 pr-5 text-[15px] font-semibold text-[var(--text)] shadow-[0_16px_36px_rgba(15,23,42,0.06)] outline-none transition placeholder:font-medium placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[var(--muted)]">
                    Password
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                      <LockKeyhole className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Masukkan password"
                      required
                      className="h-[56px] w-full rounded-[26px] border border-[var(--border)] bg-[var(--surface-soft)] pl-14 pr-5 text-[15px] font-semibold text-[var(--text)] shadow-[0_16px_36px_rgba(15,23,42,0.06)] outline-none transition placeholder:font-medium placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
                    />
                  </div>
                </label>

                {error && (
                  <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-500">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary group flex h-[56px] w-full text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Memproses..." : "Masuk"}
                  {!loading && (
                    <ArrowRight
                      className="h-4 w-4 transition group-hover:translate-x-0.5"
                      strokeWidth={2.4}
                    />
                  )}
                </button>
              </form>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[var(--accent-soft)] bg-[var(--surface-soft)]/60 px-4 py-3 text-sm text-[var(--muted)]">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                    Username
                  </p>
                  <p className="mt-1 font-extrabold text-[var(--text)]">
                    admin
                  </p>
                </div>
                <div className="rounded-[22px] border border-[var(--accent-soft)] bg-[var(--surface-soft)]/60 px-4 py-3 text-sm text-[var(--muted)]">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                    Password
                  </p>
                  <p className="mt-1 font-extrabold text-[var(--text)]">
                    admin123
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 lg:hidden">
                <div className="rounded-[28px] bg-[var(--accent-soft)] p-4 text-sm font-semibold text-[var(--accent)] shadow-sm shadow-[var(--accent)]/10">
                  PropSuite sekarang terasa lebih nyaman di layar kecil — form
                  yang lega, tombol besar, dan warna yang seimbang.
                </div>
                <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--text)]">
                  <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Fitur mobile
                  </div>
                  <div className="space-y-2">
                    {[
                      "Navigasi sentuh yang mudah",
                      "Tombol dan input lebih besar",
                      "Tampilan bersih dan ringkas",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-[14px]"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-2xl bg-[var(--accent)] text-white">
                          ✓
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-xs font-semibold text-[var(--muted)]">
            <span>PropSuite CRM</span>
            <span>Developer Perumahan</span>
          </div>
        </section>

        <section className="relative hidden min-h-[720px] overflow-hidden rounded-[34px] lg:block">
          <img
            alt="Rumah modern premium"
            className="absolute inset-0 h-full w-full object-cover"
            src={HERO_IMAGE}
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(10,9,20,0.55)_0%,rgba(10,9,20,0.18)_45%,rgba(10,9,20,0.6)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0914]/80 via-[#0a0914]/15 to-transparent" />
          <div
            className="glow-orb -right-16 -top-16 h-72 w-72 opacity-50"
            style={{
              background:
                "radial-gradient(circle, var(--accent-glow), transparent 70%)",
            }}
          />

          <div className="glass absolute left-12 top-9 flex items-center gap-3 rounded-[22px] px-4 py-3 shadow-[var(--shadow-card)]">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] text-white shadow-lg shadow-[var(--accent-glow)]">
              <Sparkles className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text)]">
                Premium Property CRM
              </p>
              <p className="text-xs font-semibold text-[var(--muted)]">
                Kelola prospek, unit, dan closing
              </p>
            </div>
          </div>

          <div className="glass absolute bottom-16 left-16 rounded-[24px] p-5 shadow-[var(--shadow-card)]">
            <p className="text-sm font-bold text-[var(--text)]">
              Aktivitas Hari Ini
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              09:30 - 10:00 WIB
            </p>
            <div className="mt-4 flex items-center gap-2">
              {["L", "C", "U", "K"].map((item) => (
                <span
                  className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] text-xs font-extrabold text-white ring-2 ring-[var(--surface)]"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="glass absolute bottom-16 right-16 max-w-[360px] rounded-[30px] p-6 text-white shadow-[var(--shadow-card)]">
            <p className="chip border border-white/10 bg-white/5 text-[var(--accent-2)]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
              PropSuite Workspace
            </p>
            <h2 className="font-display mt-4 text-[28px] font-semibold leading-tight">
              Satu pintu untuk bisnis properti yang lebih rapi.
            </h2>
          </div>
        </section>
      </div>
    </main>
  );
}

function PropSuiteLogo() {
  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-lg shadow-[var(--accent-glow)] overflow-hidden p-1.5 border border-[var(--border)]">
      <img src="/assets/logo.svg" alt="PropSuite Logo" className="h-full w-full object-contain" />
    </div>
  );
}
