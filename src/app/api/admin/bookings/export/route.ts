import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import { effectiveBookingStatus, formatDate, formatMonth } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu konfirmasi",
  CONFIRMED: "Terkonfirmasi",
  REJECTED: "Ditolak",
  ONGOING: "Berlangsung",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const PAYMENT_LABEL: Record<string, string> = {
  UNPAID: "Belum dibayar",
  PAID: "Lunas",
  REFUNDED: "Dikembalikan",
};

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cell(value: string | number) {
  const type = typeof value === "number" ? "Number" : "String";
  return `<Cell><Data ss:Type="${type}">${esc(value)}</Data></Cell>`;
}

function row(values: (string | number)[]) {
  return `<Row>${values.map(cell).join("")}</Row>`;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !isStaffRole(session.role)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "ALL";
  const q = (searchParams.get("q") ?? "").trim();
  const month = (searchParams.get("month") ?? "").trim();

  const psychologist =
    session.role === "PSYCHOLOGIST"
      ? await db.psychologist.findUnique({
          where: { userId: session.sub },
          select: { id: true },
        })
      : null;

  const where = {
    ...(status !== "ALL" ? { status } : {}),
    ...(month ? { date: { startsWith: month } } : {}),
    ...(session.role === "PSYCHOLOGIST"
      ? { psychologistId: psychologist?.id ?? "__none__" }
      : {}),
    ...(q
      ? {
          OR: [
            { guestName: { contains: q } },
            { guestEmail: { contains: q } },
            { guestPhone: { contains: q } },
            { code: { contains: q } },
          ],
        }
      : {}),
  };

  const bookings = await db.booking.findMany({
    where,
    include: { service: true, psychologist: true, invoice: true },
    orderBy: [{ date: "desc" }, { time: "desc" }],
    take: 5000,
  });

  const header = [
    "Kode Booking",
    "Tanggal Dibuat",
    "Nama Klien",
    "Email",
    "Telepon",
    "Layanan",
    "Psikolog",
    "Tanggal Sesi",
    "Jam",
    "Mode",
    "Status Booking",
    "Status Pembayaran",
    "Nominal (Rp)",
    "No. Invoice",
    "Status Invoice",
  ];

  const rows = bookings.map((booking) =>
    row([
      booking.code,
      formatDate(booking.createdAt, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      booking.guestName,
      booking.guestEmail,
      booking.guestPhone,
      booking.service.name,
      booking.psychologist?.name ?? "Rekomendasi tim",
      booking.date,
      booking.time,
      booking.mode === "ONLINE" ? "Online" : "Tatap muka",
      STATUS_LABEL[
        effectiveBookingStatus(
          booking.status,
          booking.date,
          booking.time,
          booking.service.duration
        )
      ] ?? booking.status,
      PAYMENT_LABEL[booking.paymentStatus] ?? booking.paymentStatus,
      booking.amount,
      booking.invoice?.number ?? "-",
      booking.invoice?.status ?? "-",
    ])
  );

  const generatedAt = new Date().toLocaleString("id-ID");
  const monthLabel = month ? formatMonth(month) : "Semua bulan";
  const filename = `booking-konseling-trenggalek-${
    month || new Date().toISOString().slice(0, 10)
  }.xls`;

  const xml = `\ufeff<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="title">
   <Font ss:Bold="1" ss:Size="14" ss:Color="#0369A1"/>
  </Style>
  <Style ss:ID="header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0369A1" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="money">
   <NumberFormat ss:Format="#,##0"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Booking">
  <Table>
   <Column ss:Width="95"/>
   <Column ss:Width="85"/>
   <Column ss:Width="145"/>
   <Column ss:Width="180"/>
   <Column ss:Width="105"/>
   <Column ss:Width="150"/>
   <Column ss:Width="170"/>
   <Column ss:Width="80"/>
   <Column ss:Width="55"/>
   <Column ss:Width="75"/>
   <Column ss:Width="120"/>
   <Column ss:Width="105"/>
   <Column ss:Width="95"/>
   <Column ss:Width="105"/>
   <Column ss:Width="90"/>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="14" ss:StyleID="title">
     <Data ss:Type="String">Laporan Booking — ${esc(
       month ? monthLabel : "Konseling Trenggalek"
     )}</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:MergeAcross="14"><Data ss:Type="String">Dibuat: ${esc(
      generatedAt
    )} · Periode: ${esc(monthLabel)} · Filter status: ${esc(
      status
    )}${q ? ` · Pencarian: ${esc(q)}` : ""} · Total: ${bookings.length} booking</Data></Cell>
   </Row>
   <Row/>
   ${row(header).replace(/<Row>/, '<Row ss:StyleID="header">')}
   ${rows.join("\n   ")}
  </Table>
 </Worksheet>
</Workbook>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
