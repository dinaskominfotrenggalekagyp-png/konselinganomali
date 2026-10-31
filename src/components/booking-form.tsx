"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { cn, formatIDR, todayISO } from "@/lib/utils";

type ServiceLite = {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
};

type PsychologistLite = {
  id: string;
  name: string;
  title: string;
  specialties: string;
  photo: string;
  rating: number;
  price: number;
  experience: number;
};

const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export function BookingForm({
  service,
  psychologists,
  defaults,
  isLoggedIn,
  defaultPsychologistId = "",
}: {
  service: ServiceLite;
  psychologists: PsychologistLite[];
  defaults: { name: string; email: string; phone: string };
  isLoggedIn: boolean;
  defaultPsychologistId?: string;
}) {
  const [psychologistId, setPsychologistId] = useState<string>(defaultPsychologistId);
  const [date, setDate] = useState(todayISO(1));
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [name, setName] = useState(defaults.name);
  const [email, setEmail] = useState(defaults.email);
  const [phone, setPhone] = useState(defaults.phone);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    code: string;
    invoiceNumber: string;
  } | null>(null);

  const selected = useMemo(
    () => psychologists.find((p) => p.id === psychologistId),
    [psychologists, psychologistId]
  );

  const price = service.price;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!time) {
      setError("Silakan pilih jam sesi terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          psychologistId: psychologistId || undefined,
          name,
          email,
          phone,
          date,
          time,
          mode,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat booking");

      setSuccess({ code: data.code, invoiceNumber: data.invoiceNumber });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-brand/15 bg-white p-7 text-center shadow-soft">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-mint text-brand">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-4 font-serif text-2xl font-semibold text-brand-deep">
          Permintaan sesi terkirim!
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
          Tim kami akan mengonfirmasi jadwal maksimal 1x24 jam. Detail sesi juga
          dikirim ke email <strong className="text-ink">{email}</strong>.
        </p>

        <div className="mt-5 rounded-2xl bg-surface p-4 text-left">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted">Kode booking</span>
            <span className="font-mono font-semibold text-brand-dark">{success.code}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-muted">Tagihan</span>
            <span className="font-mono text-ink">{success.invoiceNumber}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-muted">Jadwal</span>
            <span className="font-medium text-ink">
              {date} · {time} WIB
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-muted">Total</span>
            <span className="font-semibold text-brand-dark">{formatIDR(price)}</span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Link
            href={
              isLoggedIn
                ? "/portal/tagihan"
                : `/login?next=${encodeURIComponent("/portal/tagihan")}`
            }
            className="btn-primary w-full"
          >
            {isLoggedIn ? "Lanjut ke pembayaran" : "Masuk untuk membayar"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://wa.me/6285335268258"
            target="_blank"
            rel="noreferrer"
            className="btn-outline w-full"
          >
            Konfirmasi via WhatsApp
          </a>
        </div>
        <p className="mt-3 text-[10.5px] text-muted">
          Simpan kode booking Anda. Pembayaran dikonfirmasi otomatis oleh sistem.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-5 shadow-soft sm:p-7">
      <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
            Reservasi Sesi
          </p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-brand-deep">
            {service.name}
          </h3>
        </div>
        <div className="text-right">
          <p className="font-serif text-lg font-semibold text-brand-dark">
            {formatIDR(price)}
          </p>
          <p className="text-[10.5px] text-muted">{service.duration} menit</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="label">1 · Pilih psikolog</p>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setPsychologistId("")}
            className={cn(
              "flex min-w-[140px] flex-col items-start gap-1 rounded-2xl border p-3 text-left transition",
              psychologistId === ""
                ? "border-brand bg-brand-mint/70"
                : "border-line hover:border-brand/30"
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11.5px] font-semibold text-brand-deep">
              Rekomendasi tim
            </span>
            <span className="text-[10px] text-muted">Dicocokkan oleh admin</span>
          </button>

          {psychologists.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPsychologistId(p.id)}
              className={cn(
                "flex min-w-[170px] items-center gap-2.5 rounded-2xl border p-3 text-left transition",
                psychologistId === p.id
                  ? "border-brand bg-brand-mint/70"
                  : "border-line hover:border-brand/30"
              )}
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <Image src={p.photo} alt={p.name} fill sizes="36px" className="object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[11.5px] font-semibold text-ink">
                  {p.name.split(",")[0]}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted">
                  <Star className="h-2.5 w-2.5 fill-[#e0a92e] text-[#e0a92e]" />
                  {p.rating} · {p.experience} th
                </span>
              </span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-2 rounded-xl bg-surface px-3 py-2 text-[10.5px] text-muted">
            {selected.name} — {selected.title}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-date" className="label">
            2 · Tanggal
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="booking-date"
              type="date"
              required
              min={todayISO()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field pl-10"
            />
          </div>
        </div>
        <div>
          <span className="label">Mode sesi</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "ONLINE" as const, label: "Online", icon: Video },
              { id: "OFFLINE" as const, label: "Tatap muka", icon: MapPin },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-[11.5px] font-medium transition",
                  mode === m.id
                    ? "border-brand bg-brand-mint/70 text-brand-deep"
                    : "border-line text-muted hover:border-brand/30"
                )}
              >
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="label">3 · Jam sesi (WIB)</span>
        <div className="grid grid-cols-5 gap-1.5">
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTime(t)}
              className={cn(
                "rounded-xl border py-2 text-[11.5px] font-medium transition",
                time === t
                  ? "border-brand bg-brand-dark text-white"
                  : "border-line text-ink/70 hover:border-brand/40"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1 text-[10px] text-muted">
          <Clock className="h-3 w-3" /> Durasi {service.duration} menit · zona waktu Asia/Jakarta
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="b-name" className="label">Nama lengkap</label>
          <input
            id="b-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Anda"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="b-phone" className="label">WhatsApp</label>
          <input
            id="b-phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xx xxxx xxxx"
            className="field"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="b-email" className="label">Email</label>
          <input
            id="b-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="field"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="b-notes" className="label">
            Catatan untuk psikolog <span className="normal-case text-muted">(opsional)</span>
          </label>
          <textarea
            id="b-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Hal yang ingin Anda fokuskan pada sesi..."
            className="field resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3.5 py-2.5 text-[11.5px] font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-5 rounded-2xl bg-surface p-3.5">
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="text-muted">Total pembayaran</span>
          <span className="font-semibold text-brand-dark">{formatIDR(price)}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
          <ShieldCheck className="h-3 w-3" /> Pembayaran aman · reschedule gratis 24 jam
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary mt-4 w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
          </>
        ) : (
          <>
            Konfirmasi Reservasi <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-2 text-center text-[10px] leading-relaxed text-muted">
        Dengan melanjutkan, Anda menyetujui syarat layanan dan kebijakan privasi.
      </p>
    </form>
  );
}
