import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { db } from "@/lib/db";
import { formatDate, formatIDR, STATUS_LABEL, STATUS_TONE } from "@/lib/utils";
import { PayInvoiceButton } from "@/components/pay-invoice-button";
import { PrintButton } from "@/components/print-button";
import { BrandLogo } from "@/components/brand-logo";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      booking: {
        include: { service: true, psychologist: true },
      },
    },
  });

  if (!invoice) notFound();
  if (invoice.booking.userId !== user.id && !isAdminRole(user.role)) {
    redirect("/portal/tagihan");
  }

  const booking = invoice.booking;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between print:hidden">
        <Link
          href="/portal/tagihan"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted transition hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke tagihan
        </Link>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-10">
        <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandLogo withTagline={false} />
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              Konseling Trenggalek
              <br />
              Jl. Raya Trenggalek No. 123, Trenggalek, Jawa Timur 66311
              <br />
              rproselegends@gmail.com · +62 853-3526-8258
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-serif text-2xl font-semibold text-brand-deep">INVOICE</p>
            <p className="mt-1 font-mono text-[11px] text-ink">{invoice.number}</p>
            <p className="mt-1 text-[10.5px] text-muted">
              Diterbitkan {formatDate(invoice.createdAt)}
            </p>
            <span className={`chip mt-2 ring-1 ${STATUS_TONE[invoice.status]}`}>
              {STATUS_LABEL[invoice.status]}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
              Ditagihkan kepada
            </p>
            <p className="mt-1.5 text-[12.5px] font-semibold text-ink">{booking.guestName}</p>
            <p className="text-[10.5px] text-muted">{booking.guestEmail}</p>
            <p className="text-[10.5px] text-muted">{booking.guestPhone}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
              Detail sesi
            </p>
            <p className="mt-1.5 text-[12.5px] font-semibold text-ink">
              {booking.service.name}
            </p>
            <p className="text-[10.5px] text-muted">
              {formatDate(booking.date)} · {booking.time} WIB
            </p>
            <p className="text-[10.5px] text-muted">
              {booking.psychologist?.name ?? "Psikolog rekomendasi tim"}
            </p>
            <p className="text-[10.5px] text-muted">
              Mode: {booking.mode === "ONLINE" ? "Online" : "Tatap muka"}
            </p>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left">
            <thead className="bg-surface/80">
              <tr className="text-[9px] uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-semibold">Deskripsi</th>
                <th className="px-4 py-3 text-center font-semibold">Durasi</th>
                <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line text-[11.5px]">
                <td className="px-4 py-4">
                  <p className="font-medium text-ink">{booking.service.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    Kode booking {booking.code} · {booking.psychologist?.name ?? "Tim Konseling Trenggalek"}
                  </p>
                </td>
                <td className="px-4 py-4 text-center text-muted">
                  {booking.service.duration} mnt
                </td>
                <td className="px-4 py-4 text-right font-medium text-ink">
                  {formatIDR(invoice.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-[260px] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>Subtotal</span>
              <span>{formatIDR(invoice.amount)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>Biaya layanan</span>
              <span>Termasuk</span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-2.5 text-[13px] font-semibold text-brand-deep">
              <span>Total</span>
              <span>{formatIDR(invoice.amount)}</span>
            </div>
            {invoice.status === "PAID" && (
              <p className="flex items-center gap-1.5 text-right text-[10px] text-brand">
                <CheckCircle2 className="h-3.5 w-3.5" /> Lunas{" "}
                {invoice.paidAt ? `pada ${formatDate(invoice.paidAt)}` : ""}
              </p>
            )}
          </div>
        </div>

        {invoice.status === "UNPAID" && (
          <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl bg-brand-mint/60 p-4 sm:flex-row sm:items-center print:hidden">
            <div>
              <p className="text-[11px] font-semibold text-brand-deep">
                Selesaikan pembayaran
              </p>
              <p className="text-[10px] text-muted">
                Konfirmasi otomatis setelah gateway merespons.
              </p>
            </div>
            <PayInvoiceButton
              invoiceId={invoice.id}
              amount={invoice.amount}
              number={invoice.number}
            />
          </div>
        )}

        <div className="mt-7 border-t border-line pt-4 text-[9.5px] leading-relaxed text-muted">
          <p>
            Pembayaran diproses melalui payment gateway. Invoice ini sah dan diterbitkan
            secara elektronik oleh sistem Konseling Trenggalek. Untuk pertanyaan, hubungi
            rproselegends@gmail.com dengan menyertakan nomor invoice.
          </p>
          <p className="mt-1.5">
            Pembatalan &amp; reschedule mengikuti kebijakan layanan yang berlaku.
          </p>
        </div>
      </div>
    </div>
  );
}
