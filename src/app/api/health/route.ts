import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type CountRow = {
  users: bigint;
  bookings: bigint;
  articles: bigint;
  assessments: bigint;
  results: bigint;
};

export async function GET() {
  try {
    // Satu round trip untuk semua hitungan; sebelumnya 5 query terpisah.
    const [row] = await db.$queryRaw<CountRow[]>`
      SELECT
        (SELECT COUNT(*) FROM "User")             AS "users",
        (SELECT COUNT(*) FROM "Booking")          AS "bookings",
        (SELECT COUNT(*) FROM "Article")          AS "articles",
        (SELECT COUNT(*) FROM "Assessment")       AS "assessments",
        (SELECT COUNT(*) FROM "AssessmentResult") AS "results"
    `;

    return NextResponse.json({
      status: "ok",
      app: "warna-citta",
      time: new Date().toISOString(),
      database: "postgresql (supabase + prisma)",
      counts: {
        users: Number(row?.users ?? 0),
        bookings: Number(row?.bookings ?? 0),
        articles: Number(row?.articles ?? 0),
        assessments: Number(row?.assessments ?? 0),
        results: Number(row?.results ?? 0),
      },
      integrations: {
        email: process.env.RESEND_API_KEY ? "resend" : "outbox (dev)",
        payment: process.env.MIDTRANS_SERVER_KEY ? "midtrans" : "mock",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "unknown" },
      { status: 500 }
    );
  }
}
