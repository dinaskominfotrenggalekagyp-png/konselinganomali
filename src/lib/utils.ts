import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Status efektif: sesi otomatis berstatus "Berlangsung" saat jam sesi
 * memasuki waktu sekarang (termasuk selama durasi layanan).
 */
export function effectiveBookingStatus(
  status: string,
  date: string,
  time: string,
  durationMinutes = 60
) {
  if (status === "ONGOING") return status;
  if (!["PENDING", "CONFIRMED"].includes(status)) return status;

  // Pakai offset WIB agar status tetap tepat meski server berjalan di UTC.
  const start = new Date(`${date}T${time}:00+07:00`);
  if (Number.isNaN(start.getTime())) return status;

  const end = new Date(start.getTime() + Math.max(durationMinutes, 1) * 60_000);
  const now = Date.now();

  return now >= start.getTime() && now < end.getTime() ? "ONGOING" : status;
}

export function formatMonth(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}-01T00:00:00`));
}

export function getInitials(name: string) {
  return name
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function bookingCode() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `KT-${stamp}${rand}`;
}

export function invoiceNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.random().toString().slice(2, 7);
  return `INV-${stamp}-${rand}`;
}

export function whatsappLink(number: string, message: string) {
  const clean = number.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export type ScoringConfig = {
  maxScore: number;
  categories: { max: number; label: string; summary: string; color: string }[];
};

export function scoreAssessment(total: number, config: ScoringConfig) {
  const sorted = [...config.categories].sort((a, b) => a.max - b.max);
  return (
    sorted.find((c) => total <= c.max) ?? sorted[sorted.length - 1] ?? {
      max: config.maxScore,
      label: "Selesai",
      summary: "Terima kasih telah menyelesaikan asesmen.",
      color: "#0ea5e9",
    }
  );
}

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu konfirmasi",
  CONFIRMED: "Terkonfirmasi",
  REJECTED: "Ditolak",
  ONGOING: "Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  UNPAID: "Belum dibayar",
  PAID: "Lunas",
  REFUNDED: "Dikembalikan",
  EXPIRED: "Kedaluwarsa",
  NEW: "Baru",
  READ: "Dibaca",
  REPLIED: "Dibalas",
};

export const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  ONGOING: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  UNPAID: "bg-amber-50 text-amber-700 ring-amber-200",
  PAID: "bg-sky-50 text-sky-700 ring-sky-200",
  REFUNDED: "bg-slate-100 text-slate-600 ring-slate-200",
  EXPIRED: "bg-slate-100 text-slate-500 ring-slate-200",
  NEW: "bg-sky-50 text-sky-700 ring-sky-200",
  READ: "bg-slate-100 text-slate-600 ring-slate-200",
  REPLIED: "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

export function moodEmoji(mood: number) {
  return ["😖", "😕", "😐", "🙂", "😄"][mood - 1] ?? "🙂";
}

export const MOOD_LABEL = ["Sangat berat", "Berat", "Biasa", "Baik", "Sangat baik"];

export function truncate(text: string, max = 140) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
