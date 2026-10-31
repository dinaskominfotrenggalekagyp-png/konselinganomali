"use client";

import { useRouter } from "next/navigation";
import { CalendarRange, RotateCcw } from "lucide-react";

function monthOptions(current: string) {
  const now = new Date();
  const options: { value: string; label: string }[] = [];

  for (let index = 0; index < 24; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    options.push({
      value,
      label: new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(date),
    });
  }

  if (current && !options.some((option) => option.value === current)) {
    options.unshift({
      value: current,
      label: new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(new Date(`${current}-01T00:00:00`)),
    });
  }

  return options;
}

export function BookingMonthFilter({
  value,
  status,
  q,
}: {
  value: string;
  status: string;
  q: string;
}) {
  const router = useRouter();
  const options = monthOptions(value);

  function applyMonth(next: string) {
    const params = new URLSearchParams();
    if (status && status !== "ALL") params.set("status", status);
    if (q) params.set("q", q);
    if (next) params.set("month", next);

    const query = params.toString();
    router.push(`/admin/booking${query ? `?${query}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        htmlFor="booking-month"
        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted"
      >
        <CalendarRange className="h-3 w-3" /> Filter bulan
      </label>
      <select
        id="booking-month"
        value={value}
        onChange={(event) => applyMonth(event.target.value)}
        className="field w-auto min-w-[170px] py-1.5 text-[11px]"
      >
        <option value="">Semua bulan</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {value && (
        <button
          type="button"
          onClick={() => applyMonth("")}
          className="inline-flex items-center gap-1 text-[10px] font-medium text-muted underline-offset-2 hover:text-brand hover:underline"
        >
          <RotateCcw className="h-2.5 w-2.5" /> Reset
        </button>
      )}
    </div>
  );
}
