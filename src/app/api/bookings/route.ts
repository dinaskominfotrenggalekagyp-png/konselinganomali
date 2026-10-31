import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { bookingSchema, fieldErrors } from "@/lib/validators";
import {
  createPaymentIntent,
  logActivity,
  notifyBookingCreated,
} from "@/lib/integrations";
import { bookingCode, invoiceNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data booking belum lengkap", fields: fieldErrors(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const service = await db.service.findUnique({ where: { id: data.serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: "Layanan tidak tersedia" }, { status: 404 });
    }

    // Cegah booking di masa lalu
    const slot = new Date(`${data.date}T${data.time}:00`);
    if (Number.isNaN(slot.getTime()) || slot.getTime() < Date.now() - 60_000) {
      return NextResponse.json(
        { error: "Jadwal yang dipilih sudah lewat" },
        { status: 400 }
      );
    }

    if (data.psychologistId) {
      const psychologist = await db.psychologist.findUnique({
        where: { id: data.psychologistId },
      });
      if (!psychologist || !psychologist.isActive) {
        return NextResponse.json({ error: "Psikolog tidak tersedia" }, { status: 404 });
      }

      const clash = await db.booking.findFirst({
        where: {
          psychologistId: data.psychologistId,
          date: data.date,
          time: data.time,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });
      if (clash) {
        return NextResponse.json(
          { error: "Jadwal tersebut sudah terisi. Silakan pilih jam lain." },
          { status: 409 }
        );
      }
    }

    const session = await getSession();
    const code = bookingCode();
    const amount = service.price;

    const booking = await db.booking.create({
      data: {
        code,
        userId: session?.sub ?? null,
        guestName: data.name,
        guestEmail: data.email.toLowerCase(),
        guestPhone: data.phone,
        serviceId: service.id,
        psychologistId: data.psychologistId || null,
        date: data.date,
        time: data.time,
        mode: data.mode,
        notes: data.notes || null,
        status: "PENDING",
        paymentStatus: "UNPAID",
        amount,
      },
      include: { psychologist: true },
    });

    const invoice = await db.invoice.create({
      data: {
        number: invoiceNumber(),
        bookingId: booking.id,
        amount,
        status: "UNPAID",
        provider: process.env.PAYMENT_PROVIDER ?? "mock",
      },
    });

    const intent = await createPaymentIntent({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount,
    });

    await db.invoice.update({
      where: { id: invoice.id },
      data: { providerRef: intent.providerRef, provider: intent.provider },
    });

    await notifyBookingCreated({
      name: booking.guestName,
      email: booking.guestEmail,
      phone: booking.guestPhone,
      code: booking.code,
      serviceName: service.name,
      psychologist: booking.psychologist?.name,
      date: booking.date,
      time: booking.time,
      mode: booking.mode,
      amount,
    });

    await logActivity(session?.sub ?? null, "BOOKING_CREATED", booking.code);

    return NextResponse.json({
      ok: true,
      id: booking.id,
      code: booking.code,
      invoiceNumber: invoice.number,
      simulatedPayment: intent.simulated,
      paymentUrl: intent.redirectUrl,
    });
  } catch (error) {
    console.error("booking error", error);
    return NextResponse.json({ error: "Gagal membuat booking" }, { status: 500 });
  }
}

export async function GET() {
  const slots = await db.booking.groupBy({
    by: ["date", "time"],
    where: {
      date: { gte: new Date().toISOString().slice(0, 10) },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    _count: { _all: true },
  });

  return NextResponse.json({ slots });
}
