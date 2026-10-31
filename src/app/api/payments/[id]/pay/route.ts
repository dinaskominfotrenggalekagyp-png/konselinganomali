import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { markInvoicePaid } from "@/lib/integrations";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    const { id } = await params;
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }

    if (invoice.booking.userId !== session.sub && !isAdminRole(session.role)) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    const updated = await markInvoicePaid(invoice.id, invoice.provider);

    return NextResponse.json({
      ok: true,
      status: updated.status,
      paidAt: updated.paidAt,
    });
  } catch (error) {
    console.error("payment error", error);
    return NextResponse.json({ error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}
