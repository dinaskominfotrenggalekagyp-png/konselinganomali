"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal masuk");
      router.replace(next || data.redirect || "/portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  function fillDemo(role: "superadmin" | "admin" | "psychologist" | "client") {
    const accounts = {
      superadmin: { email: "superadmin@konselingtrenggalek.id", password: "superadmin123" },
      admin: { email: "admin@konselingtrenggalek.id", password: "admin123" },
      psychologist: { email: "psikolog@konselingtrenggalek.id", password: "psikolog123" },
      client: { email: "siti@example.com", password: "client123" },
    } as const;
    setEmail(accounts[role].email);
    setPassword(accounts[role].password);
    setError("");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="label">Email</label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          className="field"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="label">Password</label>
          <span className="mb-1.5 cursor-help text-[10.5px] text-brand" title="Demo: gunakan akun contoh di bawah">
            Lupa password?
          </span>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="field pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-[11.5px] font-medium text-rose-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" /> Masuk ke portal
          </>
        )}
      </button>

      <div className="rounded-2xl border border-dashed border-brand/25 bg-brand-mint/40 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-dark">
          Akun demo
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              ["superadmin", "Super Admin"],
              ["admin", "Admin"],
              ["psychologist", "Psikolog"],
              ["client", "Klien"],
            ] as const
          ).map(([role, label]) => (
            <button
              key={role}
              type="button"
              onClick={() => fillDemo(role)}
              className="rounded-xl bg-white px-2.5 py-2 text-[10.5px] font-medium text-brand-dark shadow-sm transition hover:bg-brand hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[9.5px] leading-relaxed text-muted">
          Klik salah satu untuk mengisi otomatis, lalu tekan Masuk.
        </p>
      </div>

      <p className="text-center text-[11px] text-muted">
        Belum punya akun?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-semibold text-brand hover:underline">
          Daftar gratis
        </Link>
      </p>
    </form>
  );
}
