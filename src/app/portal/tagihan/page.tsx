import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatIDR, STATUS_LABEL, STATUS_TONE } from "@/lib/utils";
import { PayInvoiceButton } from "@/components/pay-invoice-button";

export const dynamic = "force-dynamic";

export default async function PortalTagihanPage() {
  const user = await requireUser();

  const invoices = await db.invoice.findMany({
    where: { booking: { userId: user.id } },
    include: { booking: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });

  const unpaid = invoices.filter((i) => i.status === "UNPAID");
  const totalUnpaid = unpaid.reduce((acc, i) => acc + i.amount, 0);
  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          Tagihan
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep sm:text-[32px]">
          Pembayaran &amp; invoice
        </h1>
        <p className="mt-1 text-[12.5px] text-muted">
          Semua transaksi tercatat otomatis dan dapat diunduh sebagai invoice.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted">Belum dibayar</p>
            <Wallet className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 font-serif text-xl font-semibold text-brand-deep">
            {formatIDR(totalUnpaid)}
          </p>
          <p className="text-[9.5px] text-muted">{unpaid.length} invoice</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted">Total dibayar</p>
            <CheckCircle2 className="h-4 w-4 text-brand" />
          </div>
          <p className="mt-1 font-serif text-xl font-semibold text-brand-deep">
            {formatIDR(totalPaid)}
          </p>
          <p className="text-[9.5px] text-muted">
            {invoices.filter((i) => i.status === "PAID").length} transaksi
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted">Metode</p>
            <CreditCard className="h-4 w-4 text-brand" />
          </div>
          <p className="mt-1 font-serif text-xl font-semibold text-brand-deep">
            Mock Gateway
          </p>
          <p className="text-[9.5px] text-muted">siap integrasi Midtrans</p>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-brand-deep">
            Daftar invoice
          </h2>
          <ReceiptText className="h-4 w-4 text-brand/50" />
        </div>

        {invoices.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center">
            <ReceiptText className="mx-auto h-7 w-7 text-brand/40" />
            <p className="mt-2 text-[12px] font-medium text-ink">Belum ada invoice</p>
            <p className="mt-0.5 text-[10.5px] text-muted">
              Invoice dibuat otomatis setelah Anda memesan sesi.
            </p>
            <Link href="/klinik" className="btn-primary btn-sm mt-3">
              Pesan sesi <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-2.5">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col gap-3 rounded-2xl border border-line/80 p-4 sm:flex-row sm:items-center"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    invoice.status === "PAID"
                      ? "bg-brand-mint text-brand"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {invoice.status === "PAID" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <CreditCard className="h-5 w-5" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-[11px] font-semibold text-ink">
                      {invoice.number}
                    </p>
                    <span className={`chip ring-1 ${STATUS_TONE[invoice.status]}`}>
                      {STATUS_LABEL[invoice.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {invoice.booking.service.name} ·{" "}
                    {formatDate(invoice.booking.date, { day: "numeric", month: "long" })} ·{" "}
                    {invoice.booking.code}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="text-[12px] font-semibold text-brand-dark">
                      {formatIDR(invoice.amount)}
                    </p>
                    <p className="text-[9px] text-muted">
                      {invoice.status === "PAID" && invoice.paidAt
                        ? `Dibayar ${formatDate(invoice.paidAt, { day: "numeric", month: "short" })}`
                        : "Menunggu pembayaran"}
                    </p>
                  </div>
                  {invoice.status === "UNPAID" ? (
                    <PayInvoiceButton
                      invoiceId={invoice.id}
                      amount={invoice.amount}
                      number={invoice.number}
                    />
                  ) : (
                    <Link
                      href={`/portal/tagihan/${invoice.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-medium text-ink/70 transition hover:border-brand/30 hover:text-brand"
                    >
                      <Download className="h-3 w-3" /> Invoice
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 text-[10.5px] leading-relaxed text-muted">
        <p className="font-semibold text-ink">Integrasi pembayaran</p>
        <p className="mt-1">
          Aplikasi ini berjalan dengan payment gateway mode simulasi. Untuk produksi,
          isi <code className="rounded bg-surface px-1">MIDTRANS_SERVER_KEY</code> dan
          ubah <code className="rounded bg-surface px-1">PAYMENT_PROVIDER=midtrans</code>{" "}
          pada file <code className="rounded bg-surface px-1">.env</code>. Alur checkout
          Snap akan aktif otomatis tanpa mengubah kode.
        </p>
      </div>
    </div>
  );
}
