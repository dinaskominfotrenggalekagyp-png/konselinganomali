import {
  CheckCircle2,
  CreditCard,
  Database,
  Mail,
  MessageCircle,
  Radio,
  Send,
  Server,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { requireSuperadmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { ADMIN_EMAIL, ADMIN_WHATSAPP } from "@/lib/integrations";
import { getBranding } from "@/lib/settings";
import { sendTestNotificationAction } from "@/app/admin/actions";
import { BrandingSettingsForm } from "@/components/branding-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminPengaturanPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  await requireSuperadmin();
  const { ok } = await searchParams;

  const [branding, userCount, bookingCount, resultsCount, emails, whatsappLogs] =
    await Promise.all([
      getBranding(),
      db.user.count(),
      db.booking.count(),
      db.assessmentResult.count(),
      db.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      db.activityLog.findMany({
        where: { action: "WHATSAPP_NOTIFICATION" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const dbTarget = (() => {
    const url = process.env.DATABASE_URL ?? "";
    const match = url.match(/^postgres(?:ql)?:\/\/[^@]*@([^/]+)\/([^?]+)/);
    if (match) {
      const host = match[1].replace(/:.*$/, "");
      return `${match[2]} @ ${host}`;
    }
    const mysqlMatch = url.match(/^mysql:\/\/[^@]*@([^/]+)\/([^?]+)/);
    return mysqlMatch
      ? `${mysqlMatch[2]} @ ${mysqlMatch[1]}`
      : "PostgreSQL (Supabase)";
  })();

  const emailReady = Boolean(
    process.env.RESEND_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS)
  );
  const emailProvider = process.env.RESEND_API_KEY
    ? "Resend"
    : process.env.SMTP_USER && process.env.SMTP_PASS
      ? `SMTP (${process.env.SMTP_HOST ?? "smtp.gmail.com"})`
      : "Outbox lokal (mock)";

  const waProvider = process.env.FONNTE_TOKEN
    ? "Fonnte"
    : process.env.WHATSAPP_CLOUD_TOKEN &&
        (process.env.WHATSAPP_CLOUD_PHONE_ID ?? process.env.WHATSAPP_PHONE_ID)
      ? "WhatsApp Cloud API"
      : process.env.CALLMEBOT_API_KEY
        ? "CallMeBot"
        : "Deep link wa.me (mock)";

  const integrations = [
    {
      name: "Autentikasi JWT",
      description: "Cookie httpOnly · bcrypt password hashing",
      ready: Boolean(process.env.AUTH_SECRET),
      icon: ShieldCheck,
      detail: "Aktif",
    },
    {
      name: "Email transaksional",
      description: "Resend / SMTP Gmail, fallback outbox database",
      ready: emailReady,
      icon: Mail,
      detail: emailProvider,
    },
    {
      name: "Notifikasi WhatsApp",
      description: "Fonnte / WhatsApp Cloud API / CallMeBot",
      ready: waProvider !== "Deep link wa.me (mock)",
      icon: MessageCircle,
      detail: waProvider,
    },
    {
      name: "Notifikasi real-time",
      description: "Server-Sent Events untuk inbox admin",
      ready: true,
      icon: Radio,
      detail: "SSE · cek 5 detik",
    },
    {
      name: "Payment gateway",
      description: "Midtrans Snap atau simulasi lokal",
      ready: Boolean(process.env.MIDTRANS_SERVER_KEY),
      icon: CreditCard,
      detail:
        process.env.MIDTRANS_SERVER_KEY && process.env.PAYMENT_PROVIDER === "midtrans"
          ? "Midtrans"
          : "Mode simulasi",
    },
    {
      name: "Database",
      description: "MySQL / MariaDB via Prisma ORM",
      ready: true,
      icon: Database,
      detail: dbTarget,
    },
    {
      name: "Kalender",
      description: "Ekspor .ics ke Google / Apple Calendar",
      ready: true,
      icon: Server,
      detail: "/api/appointments/[id]/ics",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          Sistem
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
          Pengaturan platform
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          Identitas situs, kontak publik, dan status integrasi.
        </p>
      </div>

      {ok && (
        <p className="rounded-xl bg-brand-mint px-4 py-3 text-[11px] font-medium text-brand-dark">
          ✓ {ok}
        </p>
      )}

      <BrandingSettingsForm values={branding} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-line bg-white p-5">
          <h2 className="font-serif text-lg font-semibold text-brand-deep">
            Status integrasi
          </h2>
          <p className="text-[10px] text-muted">
            Konfigurasi dibaca dari environment variables.
          </p>

          <div className="mt-3 divide-y divide-line">
            {integrations.map((item) => (
              <div key={item.name} className="flex items-start gap-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-brand-dark">
                  <item.icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-ink">{item.name}</p>
                  <p className="text-[9px] text-muted">{item.description}</p>
                </div>
                <div className="text-right">
                  {item.ready ? (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-sky-500" />
                  ) : (
                    <XCircle className="ml-auto h-3.5 w-3.5 text-amber-500" />
                  )}
                  <p className="mt-0.5 text-[8.5px] text-muted">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 rounded-xl bg-surface/70 p-3 text-[9px] leading-relaxed text-muted">
            Untuk mengaktifkan Resend / Midtrans, isi variabel pada file{" "}
            <code className="font-mono text-ink/70">.env</code> lalu restart server.
            Tanpa kredensial, sistem tetap berjalan dalam mode simulasi.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-brand-deep p-5 text-white">
            <p className="flex items-center gap-2 text-[11px] font-semibold">
              <Database className="h-3.5 w-3.5 text-brand-accent" /> Ringkasan data
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Pengguna", value: userCount },
                { label: "Booking", value: bookingCount },
                { label: "Hasil asesmen", value: resultsCount },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/5 p-2.5 text-center">
                  <p className="font-serif text-xl font-semibold">{item.value}</p>
                  <p className="text-[8.5px] text-white/50">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-brand-deep">
                Log email terakhir
              </h2>
              <p className="text-[10px] text-muted">
                Semua email tercatat di database, termasuk mode mock.
              </p>
            </div>
            <Mail className="h-4 w-4 text-brand/50" />
          </div>

          <div className="mt-3 divide-y divide-line">
            {emails.map((email) => (
              <div key={email.id} className="py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[10.5px] font-medium text-ink">
                    {email.subject}
                  </p>
                  <span
                    className={`chip shrink-0 text-[8px] ring-1 ${
                      email.status === "SENT"
                        ? "bg-sky-50 text-sky-700 ring-sky-200"
                        : email.status === "QUEUED"
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : "bg-rose-50 text-rose-700 ring-rose-200"
                    }`}
                  >
                    {email.status}
                  </span>
                </div>
                <p className="truncate text-[9px] text-muted">
                  {email.to} · {email.provider} · {formatDateTime(email.createdAt)}
                </p>
              </div>
            ))}
            {emails.length === 0 && (
              <p className="py-6 text-center text-[10.5px] text-muted">
                Belum ada email terkirim. Buat booking untuk menguji alur email.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-brand-deep">
              Notifikasi admin
            </h2>
            <p className="text-[10px] text-muted">
              Setiap booking, pesan kontak, dan pembayaran baru dikirim otomatis ke
              WhatsApp dan email admin. Inbox admin juga diperbarui real-time.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[9px] font-semibold text-sky-700 ring-1 ring-sky-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
              </span>
              Live
            </span>
            <form action={sendTestNotificationAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1.5 text-[9px] font-semibold text-brand-dark transition hover:border-brand/40 hover:bg-brand-mint"
              >
                <Send className="h-3 w-3" /> Kirim tes
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-line p-3.5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-muted">
                <MessageCircle className="h-3 w-3" /> WhatsApp admin
              </p>
              <span className="chip bg-sky-50 text-[8px] text-sky-700 ring-1 ring-sky-200">
                {waProvider}
              </span>
            </div>
            <p className="mt-1.5 font-mono text-[12px] font-semibold text-ink">
              +{ADMIN_WHATSAPP}
            </p>
            <p className="mt-0.5 text-[9px] text-muted">
              {waProvider === "Deep link wa.me (mock)"
                ? "Isi FONNTE_TOKEN / CALLMEBOT_API_KEY untuk pengiriman nyata."
                : "Pengiriman otomatis aktif."}
            </p>
          </div>

          <div className="rounded-2xl border border-line p-3.5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-muted">
                <Mail className="h-3 w-3" /> Email admin
              </p>
              <span className="chip bg-sky-50 text-[8px] text-sky-700 ring-1 ring-sky-200">
                {emailProvider}
              </span>
            </div>
            <p className="mt-1.5 truncate font-mono text-[12px] font-semibold text-ink">
              {ADMIN_EMAIL}
            </p>
            <p className="mt-0.5 text-[9px] text-muted">
              {emailReady
                ? "Pengiriman otomatis aktif."
                : "Isi RESEND_API_KEY atau SMTP_USER + SMTP_PASS untuk pengiriman nyata."}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[9.5px] font-semibold uppercase tracking-wide text-muted">
            Log WhatsApp terakhir
          </p>
          <div className="mt-2 divide-y divide-line">
            {whatsappLogs.map((log) => {
              const status = log.meta?.split(" · ")[0] ?? "QUEUED";
              return (
                <div key={log.id} className="flex items-start justify-between gap-3 py-2">
                  <p className="min-w-0 flex-1 truncate text-[10px] text-ink/75">
                    {log.meta}
                  </p>
                  <span
                    className={`chip shrink-0 text-[8px] ring-1 ${
                      status === "SENT"
                        ? "bg-sky-50 text-sky-700 ring-sky-200"
                        : status === "FAILED"
                          ? "bg-rose-50 text-rose-700 ring-rose-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
            {whatsappLogs.length === 0 && (
              <p className="py-4 text-center text-[10px] text-muted">
                Belum ada notifikasi WhatsApp. Notifikasi pertama muncul saat ada
                booking atau pesan baru.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
