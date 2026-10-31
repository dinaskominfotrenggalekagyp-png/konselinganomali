"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type ContactFormProps = {
  services?: string[];
  defaultService?: string;
  compact?: boolean;
  className?: string;
};

const FALLBACK_SERVICES = [
  "Konseling Individu",
  "Konseling Premium",
  "Asesmen Edukasi",
  "Psikotes",
  "Mediasi Relasi",
];

export function ContactForm({
  services = FALLBACK_SERVICES,
  defaultService,
  compact = false,
  className,
}: ContactFormProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          service: fd.get("service"),
          message: fd.get("message"),
          type: "contact",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim pesan");
      setReference(data.reference ?? "");
      setState("done");
      form.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  if (state === "done") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-3xl border border-brand/15 bg-brand-mint/60 p-10 text-center",
          className
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="font-serif text-2xl text-brand-deep">Terima kasih!</h3>
        <p className="max-w-sm text-sm text-muted">
          Pesan Anda sudah kami terima. Tim akan menghubungi Anda maksimal 1x24 jam
          pada hari kerja.
        </p>
        {reference && (
          <p className="rounded-full bg-white px-3 py-1 font-mono text-[11px] text-brand-dark">
            Ref: {reference}
          </p>
        )}
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-2 text-xs font-semibold text-brand underline underline-offset-4"
        >
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      <div className={cn("grid gap-4", compact ? "sm:grid-cols-1" : "sm:grid-cols-2")}>
        <div>
          <label htmlFor="cf-name" className="label">
            Nama Lengkap
          </label>
          <input
            id="cf-name"
            name="name"
            required
            minLength={2}
            placeholder="Nama Anda"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="label">
            Alamat Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            placeholder="nama@email.com"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="cf-phone" className="label">
            Nomor WhatsApp
          </label>
          <input
            id="cf-phone"
            name="phone"
            placeholder="08xx xxxx xxxx"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="cf-service" className="label">
            Pilihan Layanan
          </label>
          <select
            id="cf-service"
            name="service"
            defaultValue={defaultService ?? services[0]}
            className="field appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%235f6b64%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m4%206%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[right_1rem_center] bg-no-repeat pr-10"
          >
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="cf-message" className="label">
          Apa yang bisa kami bantu?
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          minLength={10}
          rows={compact ? 3 : 4}
          placeholder="Ceritakan singkat kondisi atau pertanyaan Anda..."
          className="field resize-none"
        />
      </div>

      {state === "error" && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="btn-primary w-full sm:w-auto"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Mengirim...
          </>
        ) : (
          <>
            Kirim Permintaan <Send className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-[11px] leading-relaxed text-muted">
        Dengan mengirim formulir, Anda menyetujui{" "}
        <a href="/kebijakan-privasi" className="underline underline-offset-2">
          kebijakan privasi
        </a>{" "}
        kami. Data Anda dienkripsi dan tidak dibagikan ke pihak ketiga.
      </p>
    </form>
  );
}
