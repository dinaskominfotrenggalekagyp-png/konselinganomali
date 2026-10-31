"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn, MOOD_LABEL, moodEmoji } from "@/lib/utils";

export function MoodCheckin({
  current,
}: {
  current?: { mood: number; note: string | null } | null;
}) {
  const router = useRouter();
  const [mood, setMood] = useState(current?.mood ?? 0);
  const [note, setNote] = useState(current?.note ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!mood) {
      setError("Pilih satu emosi yang paling menggambarkan hari ini.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMood(value);
              setSaved(false);
            }}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl border py-2.5 transition",
              mood === value
                ? "border-brand bg-brand-mint/70 shadow-sm"
                : "border-line/70 hover:border-brand/30 hover:bg-surface"
            )}
            aria-label={MOOD_LABEL[value - 1]}
          >
            <span className="text-xl leading-none">{moodEmoji(value)}</span>
            <span
              className={cn(
                "text-[8.5px] font-medium",
                mood === value ? "text-brand-dark" : "text-muted"
              )}
            >
              {MOOD_LABEL[value - 1]}
            </span>
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Ada yang ingin Anda catat hari ini? (opsional)"
        className="field mt-3 resize-none text-[12px]"
      />

      {error && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[10.5px] text-rose-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="btn-primary btn-sm mt-3 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
          </>
        ) : saved ? (
          <>
            <Check className="h-3.5 w-3.5" /> Tersimpan
          </>
        ) : (
          "Simpan check-in"
        )}
      </button>
    </div>
  );
}
