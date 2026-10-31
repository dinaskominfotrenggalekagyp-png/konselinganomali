"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { formatIDR } from "@/lib/utils";

export function PayInvoiceButton({
  invoiceId,
  amount,
  number,
}: {
  invoiceId: string;
  amount: number;
  number: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    const ok = window.confirm(
      `Bayar tagihan ${number} sebesar ${formatIDR(amount)}?\n\nMode demo: pembayaran disimulasikan dan langsung ditandai lunas.`
    );
    if (!ok) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/payments/${invoiceId}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membayar");
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
        onClick={pay}
        disabled={loading}
        className="btn-primary btn-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memproses...
          </>
        ) : (
          <>
            <CreditCard className="h-3.5 w-3.5" /> Bayar sekarang
          </>
        )}
      </button>
      {error && <p className="mt-1.5 text-[10px] text-rose-600">{error}</p>}
    </div>
  );
}
