"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCheck,
  Mail,
  Radio,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LiveCounts = { bookings: number; messages: number };

type LiveBooking = {
  id: string;
  code: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  createdAt: string;
};

type LiveMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  excerpt: string;
  createdAt: string;
};

type LiveItem = {
  id: string;
  kind: "booking" | "message";
  title: string;
  body: string;
  href: string;
  at: string;
};

type LiveUpdate = {
  counts?: LiveCounts;
  bookings?: LiveBooking[];
  messages?: LiveMessage[];
  at?: string;
};

const POLL_LABEL = "5 detik";

function formatClock(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function playChime() {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.46);
    osc.onended = () => ctx.close().catch(() => undefined);
  } catch {
    // audio opsional; abaikan bila browser memblokir
  }
}

export function AdminLive({
  initialCounts,
  showMessages = true,
}: {
  initialCounts: LiveCounts;
  showMessages?: boolean;
}) {
  const router = useRouter();
  const [counts, setCounts] = useState<LiveCounts>(() =>
    showMessages ? initialCounts : { ...initialCounts, messages: 0 }
  );
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<LiveItem[]>([]);
  const [toasts, setToasts] = useState<LiveItem[]>([]);
  const [lastSync, setLastSync] = useState<string>("");
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const toastTimers = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
    return () => {
      toastTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const pushItems = useCallback(
    (incoming: LiveItem[]) => {
      if (incoming.length === 0) return;

      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...incoming.filter((item) => !seen.has(item.id)), ...prev].slice(0, 20);
      });

      setToasts((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...incoming.filter((item) => !seen.has(item.id)), ...prev].slice(0, 4);
      });

      incoming.forEach((item) => {
        const timer = window.setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== item.id));
        }, 12_000);
        toastTimers.current.push(timer);
      });

      playChime();

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        incoming.forEach((item) => {
          try {
            new Notification(item.title, { body: item.body, tag: item.id });
          } catch {
            // notifikasi browser opsional
          }
        });
      }
    },
    []
  );

  const applyCounts = useCallback(
    (next?: LiveCounts) => {
      if (!next) return;
      setCounts({
        bookings: next.bookings,
        messages: showMessages ? next.messages : 0,
      });
    },
    [showMessages]
  );

  useEffect(() => {
    let source: EventSource | null = null;
    let closed = false;

    const parse = (event: MessageEvent): LiveUpdate => {
      try {
        return JSON.parse(event.data) as LiveUpdate;
      } catch {
        return {};
      }
    };

    const handleReady = (event: MessageEvent) => {
      const data = parse(event);
      applyCounts(data.counts);
      setConnected(true);
      if (data.at) setLastSync(data.at);
    };

    const handlePing = (event: MessageEvent) => {
      const data = parse(event);
      applyCounts(data.counts);
      if (data.at) setLastSync(data.at);
      setConnected(true);
    };

    const handleUpdate = (event: MessageEvent) => {
      const data = parse(event);
      applyCounts(data.counts);
      if (data.at) setLastSync(data.at);
      setConnected(true);

      const incoming: LiveItem[] = [
        ...(data.bookings ?? []).map((booking) => ({
          id: `booking-${booking.id}`,
          kind: "booking" as const,
          title: `Booking baru · ${booking.code}`,
          body: `${booking.name} — ${booking.service} · ${booking.date} ${booking.time} WIB`,
          href: "/admin/booking",
          at: booking.createdAt,
        })),
        ...(showMessages
          ? (data.messages ?? []).map((message) => ({
              id: `message-${message.id}`,
              kind: "message" as const,
              title: `Pesan baru · ${message.name}`,
              body: message.excerpt,
              href: "/admin/pesan",
              at: message.createdAt,
            }))
          : []),
      ];

      pushItems(incoming);
      router.refresh();
    };

    const connect = () => {
      if (closed) return;
      source = new EventSource("/api/admin/live");
      source.addEventListener("open", () => setConnected(true));
      source.addEventListener("ready", handleReady as EventListener);
      source.addEventListener("ping", handlePing as EventListener);
      source.addEventListener("update", handleUpdate as EventListener);
      source.addEventListener("error", () => setConnected(false));
    };

    connect();

    return () => {
      closed = true;
      source?.close();
    };
  }, [applyCounts, pushItems, router]);

  const total = counts.bookings + counts.messages;

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  }

  return (
    <>
      {/* Toast real-time */}
      <div className="pointer-events-none fixed bottom-24 right-4 z-[80] flex w-[min(340px,calc(100vw-2rem))] flex-col gap-2 sm:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-fade-up rounded-2xl border border-brand/20 bg-white p-3.5 shadow-lift"
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  toast.kind === "booking"
                    ? "bg-brand-mint text-brand-dark"
                    : "bg-cyan-50 text-cyan-700"
                )}
              >
                {toast.kind === "booking" ? (
                  <CalendarDays className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold text-ink">{toast.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-muted">
                  {toast.body}
                </p>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <Link
                    href={toast.href}
                    className="text-[10px] font-semibold text-brand-dark hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    Lihat detail →
                  </Link>
                  <span className="text-[9px] text-muted/70">
                    {formatClock(toast.at)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() =>
                  setToasts((prev) => prev.filter((item) => item.id !== toast.id))
                }
                className="rounded-md p-1 text-muted/50 transition hover:bg-surface hover:text-ink"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Panel notifikasi */}
      {open && (
        <div className="fixed bottom-[5.5rem] right-4 z-[80] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white shadow-lift sm:right-6">
          <div className="flex items-center justify-between border-b border-line bg-surface/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Radio
                className={cn(
                  "h-3.5 w-3.5",
                  connected ? "animate-pulse text-sky-500" : "text-muted"
                )}
              />
              <div>
                <p className="text-[11px] font-semibold text-ink">Notifikasi real-time</p>
                <p className="text-[9px] text-muted">
                  {connected ? "Terhubung" : "Menyambung ulang"} · cek {POLL_LABEL}
                  {lastSync ? ` · ${formatClock(lastSync)}` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Tutup panel"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-muted transition hover:bg-white hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-5 w-5 text-muted/40" />
                <p className="mt-2 text-[10.5px] text-muted">
                  {showMessages
                    ? "Belum ada aktivitas baru. Notifikasi booking & pesan akan muncul di sini secara otomatis."
                    : "Belum ada aktivitas baru. Notifikasi booking akan muncul di sini secara otomatis."}
                </p>
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 border-b border-line/70 px-4 py-3 transition last:border-b-0 hover:bg-surface/60"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      item.kind === "booking"
                        ? "bg-brand-mint text-brand-dark"
                        : "bg-cyan-50 text-cyan-700"
                    )}
                  >
                    {item.kind === "booking" ? (
                      <CalendarDays className="h-3.5 w-3.5" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[10.5px] font-semibold text-ink">
                        {item.title}
                      </span>
                      <span className="shrink-0 text-[8.5px] text-muted">
                        {formatClock(item.at)}
                      </span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[9.5px] leading-relaxed text-muted">
                      {item.body}
                    </span>
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-line bg-surface/40 px-4 py-2.5">
            {notificationPermission === "granted" ? (
              <p className="flex items-center gap-1.5 text-[9px] text-muted">
                <CheckCheck className="h-3 w-3 text-sky-500" /> Notifikasi browser aktif
              </p>
            ) : notificationPermission === "unsupported" ? (
              <p className="text-[9px] text-muted">
                Browser ini tidak mendukung notifikasi desktop.
              </p>
            ) : (
              <button
                type="button"
                onClick={enableBrowserNotifications}
                className="flex items-center gap-1.5 text-[9.5px] font-semibold text-brand-dark hover:underline"
              >
                <BellRing className="h-3 w-3" /> Aktifkan notifikasi browser
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tombol live */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Buka notifikasi real-time"
        className="fixed bottom-5 right-4 z-[80] flex items-center gap-2 rounded-full bg-brand-deep py-3 pl-3.5 pr-4 text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-brand-dark sm:right-6"
      >
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
          <Bell className="h-3.5 w-3.5" />
          {connected && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
            </span>
          )}
        </span>
        <span className="text-[10.5px] font-semibold">Live</span>
        {total > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1.5 text-[9px] font-bold text-brand-deep">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>
    </>
  );
}
