"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeDollarSign, Loader2, Trash2 } from "lucide-react";

export function MarkPaidButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markPaid() {
    if (!window.confirm("Tandai pembayaran booking ini sebagai LUNAS?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "PAID" }),
      });
      if (!res.ok) throw new Error("gagal");
      router.refresh();
    } catch {
      window.alert("Gagal menandai pembayaran sebagai lunas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={markPaid}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2 py-1.5 text-[9px] font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <BadgeDollarSign className="h-3 w-3" />
      )}
      Lunas
    </button>
  );
}

export function DeleteBookingButton({
  bookingId,
  code,
}: {
  bookingId: string;
  code: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (
      !window.confirm(
        `Hapus booking ${code}? Invoice dan pesan sesi terkait juga akan dihapus.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("gagal");
      router.refresh();
    } catch {
      window.alert("Gagal menghapus booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1.5 text-[9px] font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
      Hapus
    </button>
  );
}
