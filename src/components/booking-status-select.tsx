"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { STATUS_LABEL } from "@/lib/utils";

const OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "ONGOING",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
];

export function BookingStatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [loading, setLoading] = useState(false);

  async function update(next: string) {
    setValue(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("gagal");
      router.refresh();
    } catch {
      setValue(status);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => update(e.target.value)}
        disabled={loading}
        className="appearance-none rounded-lg border border-line bg-white py-1.5 pl-2.5 pr-7 text-[10.5px] font-medium text-ink outline-none transition focus:border-brand/50 disabled:opacity-60"
      >
        {OPTIONS.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABEL[option]}
          </option>
        ))}
      </select>
      {loading ? (
        <Loader2 className="pointer-events-none absolute right-2 h-3 w-3 animate-spin text-brand" />
      ) : (
        <span className="pointer-events-none absolute right-2 text-[8px] text-muted">▼</span>
      )}
    </div>
  );
}
