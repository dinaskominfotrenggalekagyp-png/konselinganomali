"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setError("Anda perlu menyetujui syarat layanan & kebijakan privasi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mendaftar");
      router.replace(next || data.redirect || "/portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="reg-name" className="label">Nama lengkap</label>
        <input
          id="reg-name"
          required
          minLength={2}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Nama sesuai identitas"
          className="field"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reg-email" className="label">Email</label>
          <input
            id="reg-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="nama@email.com"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="reg-phone" className="label">WhatsApp</label>
          <input
            id="reg-phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="08xx xxxx xxxx"
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="reg-password" className="label">Password</label>
        <div className="relative">
          <input
            id="reg-password"
            type={show ? "text" : "password"}
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Minimal 6 karakter"
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

      <label className="flex items-start gap-2.5 text-[11px] leading-relaxed text-muted">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand"
        />
        <span>
          Saya menyetujui{" "}
          <Link href="/syarat-ketentuan" className="text-brand underline underline-offset-2">
            syarat layanan
          </Link>{" "}
          dan{" "}
          <Link href="/kebijakan-privasi" className="text-brand underline underline-offset-2">
            kebijakan privasi
          </Link>
          .
        </span>
      </label>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-[11.5px] font-medium text-rose-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Membuat akun...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" /> Buat akun gratis
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-muted">
        Sudah punya akun?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-brand hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
