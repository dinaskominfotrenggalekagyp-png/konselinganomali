import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema, fieldErrors } from "@/lib/validators";
import { sendEmail, notifyAdmin, BRAND_NAME } from "@/lib/integrations";
import { bookingCode } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data belum lengkap", fields: fieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, phone, service, message } = parsed.data;

    const contact = await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        service: service || null,
        message,
        status: "NEW",
      },
    });

    const reference = `MSG-${bookingCode().replace("KT-", "")}`;

    const label = "Kontak";

    await notifyAdmin({
      title: `Pesan ${label} Baru — ${reference}`,
      replyTo: email,
      emailLines: [
        `Pesan ${label.toLowerCase()} baru masuk melalui situs.`,
        "",
        `Nama     : ${name}`,
        `Email    : ${email}`,
        `Telepon  : ${phone || "-"}`,
        `Layanan  : ${service || "-"}`,
        "",
        message,
      ],
      whatsappMessage: [
        `*${BRAND_NAME}* — Pesan ${label} Baru`,
        "",
        `Nama: ${name}`,
        `Email: ${email}`,
        `WA: ${phone || "-"}`,
        `Layanan: ${service || "-"}`,
        "",
        message.slice(0, 600),
      ].join("\n"),
    });

    await sendEmail({
      to: email,
      subject: `Kami telah menerima pesan Anda — ${BRAND_NAME}`,
      body: `Halo ${name},\n\nTerima kasih telah menghubungi ${BRAND_NAME}. Tim kami akan merespons dalam 1x24 jam kerja.\n\nNomor referensi: ${reference}\n\nSalam hangat,\n${BRAND_NAME}`,
    });

    await db.activityLog.create({
      data: { action: "CONTACT_SUBMITTED", meta: `${reference} • ${contact.email}` },
    });

    return NextResponse.json({ ok: true, reference, id: contact.id });
  } catch (error) {
    console.error("contact error", error);
    return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
  }
}
