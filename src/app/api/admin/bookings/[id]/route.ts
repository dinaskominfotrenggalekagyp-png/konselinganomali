import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isAdminRole, isStaffRole } from "@/lib/roles";
import { logActivity, markInvoicePaid } from "@/lib/integrations";

const ALLOWED = [
  "PENDING",
  "CONFIRMED",
  "ONGOING",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
];

async function canManageBooking(
  session: { sub: string; role: string },
  psychologistId: string | null
) {
  if (isAdminRole(session.role)) return true;
  if (session.role !== "PSYCHOLOGIST") return false;

  const psychologist = await db.psychologist.findUnique({
    where: { userId: session.sub },
    select: { id: true },
  });

  return Boolean(psychologist && psychologistId === psychologist.id);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isStaffRole(session.role)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const status = body.status ? String(body.status) : "";
    const paymentStatus = body.paymentStatus ? String(body.paymentStatus) : "";

    if (status && !ALLOWED.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }
    if (paymentStatus && paymentStatus !== "PAID") {
      return NextResponse.json(
        { error: "Status pembayaran tidak valid" },
        { status: 400 }
      );
    }
    if (!status && !paymentStatus) {
      return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id },
      include: { invoice: true },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    if (!(await canManageBooking(session, booking.psychologistId))) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    if (paymentStatus === "PAID" && !isAdminRole(session.role)) {
      return NextResponse.json(
        { error: "Hanya Admin atau Super Admin yang dapat menandai lunas" },
        { status: 403 }
      );
    }

    if (status) {
      await db.booking.update({ where: { id }, data: { status } });
      await logActivity(
        session.sub,
        "ADMIN_BOOKING_STATUS",
        `${booking.code} → ${status}`
      );
    }

    if (paymentStatus === "PAID") {
      if (booking.invoice) {
        await markInvoicePaid(booking.invoice.id, "manual");
      } else {
        await db.booking.update({
          where: { id },
          data: { paymentStatus: "PAID" },
        });
        await logActivity(
          session.sub,
          "PAYMENT_PAID",
          `${booking.code} · ${booking.amount} (tanpa invoice)`
        );
      }
    }

    const updated = await db.booking.findUnique({ where: { id } });
    return NextResponse.json({
      ok: true,
      status: updated?.status,
      paymentStatus: updated?.paymentStatus,
    });
  } catch (error) {
    console.error("admin booking patch", error);
    return NextResponse.json(
      { error: "Gagal memperbarui booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    await db.$transaction([
      db.invoice.deleteMany({ where: { bookingId: id } }),
      db.booking.delete({ where: { id } }),
    ]);

    await logActivity(
      session.sub,
      "ADMIN_BOOKING_DELETED",
      `${booking.code} · ${booking.guestName}`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("admin booking delete", error);
    return NextResponse.json({ error: "Gagal menghapus booking" }, { status: 500 });
  }
}
