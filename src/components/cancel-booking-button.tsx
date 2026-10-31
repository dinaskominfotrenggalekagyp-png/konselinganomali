"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    const ok = window.confirm(
      "Batalkan jadwal sesi ini? Pembatalan gratis hanya berlaku minimal 24 jam sebelum sesi."
    );
    if (!ok) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membatalkan");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={cancel}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition hover:text-rose-600"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        Batalkan
      </button>
      {error && <p className="mt-1 text-[10px] text-rose-600">{error}</p>}
    </div>
  );
}
