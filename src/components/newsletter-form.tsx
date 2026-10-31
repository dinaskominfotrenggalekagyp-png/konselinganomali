"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mendaftar");
      setState("done");
      setMessage(data.message ?? "Terima kasih! Cek inbox Anda.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1.5 backdrop-blur">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@anda.com"
          className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent text-brand-deep transition hover:bg-white disabled:opacity-60"
          aria-label="Berlangganan"
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 px-2 text-xs ${
            state === "error" ? "text-rose-300" : "text-brand-accent"
          }`}
        >
          {message}
        </p>
      )}
      <p className="mt-2 px-2 text-[11px] text-white/40">
        Insight kesehatan mental tiap dua minggu. Tanpa spam.
      </p>
    </form>
  );
}
