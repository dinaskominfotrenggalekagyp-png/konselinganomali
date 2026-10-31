import "server-only";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { formatDate, formatIDR, whatsappLink } from "@/lib/utils";

export const BRAND_NAME = "Konseling Trenggalek";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "rproselegends@gmail.com";

/** Normalisasi nomor Indonesia: 08xx / +62xx / 62xx -> 62xx */
export function normalizePhone(number: string) {
  const digits = number.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export const ADMIN_WHATSAPP = normalizePhone(
  process.env.ADMIN_WHATSAPP ?? "085335268258"
);

/* ------------------------------------------------------------------ */
/* Email — Resend / SMTP Gmail, fallback ke outbox database (dev)     */
/* ------------------------------------------------------------------ */
type MailInput = { to: string; subject: string; body: string; replyTo?: string };

function smtpConfig() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return null;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 465);
  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  };
}

export async function sendEmail({ to, subject, body, replyTo }: MailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const smtp = smtpConfig();
  const provider = apiKey ? "resend" : smtp ? "smtp" : "console";
  let status = "SENT";
  let error: string | null = null;

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? `${BRAND_NAME} <${ADMIN_EMAIL}>`,
          to: [to],
          subject,
          text: body,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      if (!res.ok) {
        status = "FAILED";
        error = `Resend ${res.status}`;
      }
    } catch (e) {
      status = "FAILED";
      error = e instanceof Error ? e.message : "unknown error";
    }
  } else if (smtp) {
    try {
      const transporter = nodemailer.createTransport(smtp);
      await transporter.sendMail({
        from: process.env.EMAIL_FROM ?? `${BRAND_NAME} <${smtp.auth.user}>`,
        to,
        subject,
        text: body,
        ...(replyTo ? { replyTo } : {}),
      });
    } catch (e) {
      status = "FAILED";
      error = e instanceof Error ? e.message : "unknown error";
    }
  } else {
    status = "QUEUED";
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n📧 [email:${to}] ${subject}\n${body}\n`);
    }
  }

  try {
    await db.emailLog.create({
      data: { to, subject, body, provider, status, error },
    });
  } catch {
    // outbox tidak boleh menggagalkan alur utama
  }

  return { provider, status, error };
}

/* ------------------------------------------------------------------ */
/* WhatsApp — Fonnte / WhatsApp Cloud API / CallMeBot                 */
/* ------------------------------------------------------------------ */
async function sendViaFonnte(token: string, target: string, message: string) {
  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: { Authorization: token },
    body: new URLSearchParams({ target, message }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    reason?: string;
  };
  if (!res.ok || data.status === false) {
    throw new Error(data.reason ?? `Fonnte ${res.status}`);
  }
}

async function sendViaCloudApi(token: string, phoneId: string, target: string, message: string) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: target,
      type: "text",
      text: { body: message },
    }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(data.error?.message ?? `WhatsApp Cloud API ${res.status}`);
  }
}

async function sendViaCallMeBot(apiKey: string, target: string, message: string) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=%2B${target}&text=${encodeURIComponent(
    message
  )}&apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CallMeBot ${res.status}`);
}

export async function sendWhatsApp(input: { to: string; message: string }) {
  const target = normalizePhone(input.to);
  const fonnteToken = process.env.FONNTE_TOKEN?.trim();
  const cloudToken = process.env.WHATSAPP_CLOUD_TOKEN?.trim();
  const phoneId =
    process.env.WHATSAPP_CLOUD_PHONE_ID?.trim() ||
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ||
    process.env.WHATSAPP_PHONE_ID?.trim();
  const callMeBotKey = process.env.CALLMEBOT_API_KEY?.trim();

  const provider = fonnteToken
    ? "fonnte"
    : cloudToken && phoneId
      ? "whatsapp-cloud"
      : callMeBotKey
        ? "callmebot"
        : "console";

  let status = "SENT";
  let error: string | null = null;

  try {
    if (fonnteToken) {
      await sendViaFonnte(fonnteToken, target, input.message);
    } else if (cloudToken && phoneId) {
      await sendViaCloudApi(cloudToken, phoneId, target, input.message);
    } else if (callMeBotKey) {
      await sendViaCallMeBot(callMeBotKey, target, input.message);
    } else {
      status = "QUEUED";
      if (process.env.NODE_ENV !== "production") {
        console.log(`\n💬 [whatsapp:${target}]\n${input.message}\n`);
      }
    }
  } catch (e) {
    status = "FAILED";
    error = e instanceof Error ? e.message : "unknown error";
    console.error("whatsapp error", error);
  }

  try {
    await db.activityLog.create({
      data: {
        action: "WHATSAPP_NOTIFICATION",
        meta: `${status} · ${provider} · ${target} · ${input.message
          .replace(/\s+/g, " ")
          .slice(0, 180)}${error ? ` · ${error}` : ""}`,
      },
    });
  } catch {
    // log tidak boleh menggagalkan alur utama
  }

  return { provider, status, error, to: target };
}

/* ------------------------------------------------------------------ */
/* Notifikasi admin terpusat (email + WhatsApp)                       */
/* ------------------------------------------------------------------ */
export async function notifyAdmin(input: {
  title: string;
  emailLines: string[];
  whatsappMessage?: string;
  replyTo?: string;
}) {
  const body = input.emailLines.filter(Boolean).join("\n");
  const subject = `[${BRAND_NAME}] ${input.title}`;
  const message =
    input.whatsappMessage ??
    [`*${BRAND_NAME}*`, `*${input.title}*`, "", body].join("\n");

  const [email, whatsapp] = await Promise.allSettled([
    sendEmail({ to: ADMIN_EMAIL, subject, body, replyTo: input.replyTo }),
    sendWhatsApp({ to: ADMIN_WHATSAPP, message }),
  ]);

  return {
    email: email.status === "fulfilled" ? email.value : { status: "FAILED" },
    whatsapp: whatsapp.status === "fulfilled" ? whatsapp.value : { status: "FAILED" },
  };
}

/* ------------------------------------------------------------------ */
/* Notifikasi booking                                                 */
/* ------------------------------------------------------------------ */
export async function notifyBookingCreated(input: {
  name: string;
  email: string;
  phone: string;
  code: string;
  serviceName: string;
  psychologist?: string | null;
  date: string;
  time: string;
  mode: string;
  amount: number;
}) {
  const body = [
    `Halo ${input.name},`,
    "",
    `Permintaan sesi Anda telah kami terima dengan detail berikut:`,
    `• Kode booking : ${input.code}`,
    `• Layanan      : ${input.serviceName}`,
    input.psychologist ? `• Psikolog     : ${input.psychologist}` : "",
    `• Jadwal       : ${formatDate(input.date)} pukul ${input.time} WIB`,
    `• Mode         : ${input.mode === "ONLINE" ? "Online (video call)" : "Tatap muka"}`,
    `• Biaya        : ${formatIDR(input.amount)}`,
    "",
    "Tim kami akan mengonfirmasi jadwal Anda maksimal 1x24 jam.",
    "Kelola jadwal dan tagihan Anda melalui Portal Klien.",
    "",
    "Salam hangat,",
    BRAND_NAME,
  ]
    .filter(Boolean)
    .join("\n");

  await sendEmail({
    to: input.email,
    subject: `Permintaan sesi diterima — ${input.code}`,
    body,
  });

  await notifyAdmin({
    title: `Booking Baru — ${input.code}`,
    replyTo: input.email,
    emailLines: [
      "Booking baru masuk melalui situs.",
      "",
      `Nama        : ${input.name}`,
      `Email       : ${input.email}`,
      `WhatsApp    : ${input.phone}`,
      `Layanan     : ${input.serviceName}`,
      input.psychologist ? `Psikolog    : ${input.psychologist}` : "",
      `Jadwal      : ${formatDate(input.date)} pukul ${input.time} WIB`,
      `Mode        : ${input.mode === "ONLINE" ? "Online" : "Tatap muka"}`,
      `Biaya       : ${formatIDR(input.amount)}`,
      "",
      "Buka Admin Console → Booking untuk konfirmasi.",
    ],
    whatsappMessage: [
      `*${BRAND_NAME}* — Booking Baru`,
      "",
      `Kode: ${input.code}`,
      `Nama: ${input.name}`,
      `WA: ${input.phone}`,
      `Layanan: ${input.serviceName}`,
      `Jadwal: ${formatDate(input.date)} ${input.time} WIB`,
      `Biaya: ${formatIDR(input.amount)}`,
    ].join("\n"),
  });
}

/* ------------------------------------------------------------------ */
/* Payment gateway — Midtrans Snap, fallback mock                     */
/* ------------------------------------------------------------------ */
export async function createPaymentIntent(invoice: {
  number: string;
  amount: number;
  id: string;
}) {
  const provider = process.env.PAYMENT_PROVIDER ?? "mock";
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (provider === "midtrans" && serverKey) {
    const res = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: invoice.number,
          gross_amount: invoice.amount,
        },
      }),
    });

    if (!res.ok) throw new Error(`Midtrans error ${res.status}`);
    const data = (await res.json()) as { token?: string; redirect_url?: string };
    return {
      provider: "midtrans",
      providerRef: data.token ?? invoice.number,
      redirectUrl: data.redirect_url ?? null,
      simulated: false,
    };
  }

  // Mode simulasi: QR/redirect lokal untuk demo tanpa kredensial
  return {
    provider: "mock",
    providerRef: `MOCK-${invoice.id.slice(-8).toUpperCase()}`,
    redirectUrl: null,
    simulated: true,
  };
}

export async function markInvoicePaid(invoiceId: string, provider = "mock") {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { booking: true },
  });
  if (!invoice) throw new Error("Invoice tidak ditemukan");
  if (invoice.status === "PAID") return invoice;

  const [updated] = await db.$transaction([
    db.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date(), provider },
    }),
    db.booking.update({
      where: { id: invoice.bookingId },
      data: { paymentStatus: "PAID" },
    }),
    db.activityLog.create({
      data: {
        userId: invoice.booking.userId,
        action: "PAYMENT_PAID",
        meta: `${invoice.number} • ${formatIDR(invoice.amount)}`,
      },
    }),
    db.emailLog.create({
      data: {
        to: invoice.booking.guestEmail,
        subject: `Pembayaran diterima — ${invoice.number}`,
        body: `Terima kasih, pembayaran ${formatIDR(invoice.amount)} untuk ${invoice.number} telah kami terima.`,
        provider: "system",
        status: "SENT",
      },
    }),
  ]);

  await notifyAdmin({
    title: `Pembayaran Diterima — ${invoice.number}`,
    emailLines: [
      "Pembayaran invoice telah diterima.",
      "",
      `Invoice     : ${invoice.number}`,
      `Booking     : ${invoice.booking.code}`,
      `Klien       : ${invoice.booking.guestName}`,
      `Nominal     : ${formatIDR(invoice.amount)}`,
      `Provider    : ${provider}`,
      `Waktu       : ${new Date().toLocaleString("id-ID")}`,
    ],
    whatsappMessage: [
      `*${BRAND_NAME}* — Pembayaran Diterima`,
      "",
      `Invoice: ${invoice.number}`,
      `Klien: ${invoice.booking.guestName}`,
      `Nominal: ${formatIDR(invoice.amount)}`,
      `Status: LUNAS`,
    ].join("\n"),
  });

  return updated;
}

/* ------------------------------------------------------------------ */
/* Kalender (.ics) — integrasi Google Calendar / Apple Calendar       */
/* ------------------------------------------------------------------ */
export function buildICS(input: {
  code: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes?: number;
  location?: string;
}) {
  const [year, month, day] = input.date.split("-").map(Number);
  const [hour, minute] = input.time.split(":").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const end = new Date(start.getTime() + (input.durationMinutes ?? 60) * 60000);

  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
      d.getUTCDate()
    ).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(
      d.getUTCMinutes()
    ).padStart(2, "0")}00Z`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Konseling Trenggalek//Booking//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.code}@konselingtrenggalek.id`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${input.title}`,
    `DESCRIPTION:${input.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${input.location ?? "Online — Konseling Trenggalek"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/* ------------------------------------------------------------------ */
/* Util                                                                 */
/* ------------------------------------------------------------------ */
export async function logActivity(userId: string | null, action: string, meta?: string) {
  try {
    await db.activityLog.create({ data: { userId, action, meta } });
  } catch {
    // logging tidak boleh menggagalkan alur utama
  }
}

export function adminWhatsApp(message: string) {
  return whatsappLink(ADMIN_WHATSAPP, message);
}
