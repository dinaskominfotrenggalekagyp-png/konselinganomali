import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [users, bookings, articles, assessments, results] = await Promise.all([
      db.user.count(),
      db.booking.count(),
      db.article.count(),
      db.assessment.count(),
      db.assessmentResult.count(),
    ]);

    return NextResponse.json({
      status: "ok",
      app: "warna-citta",
      time: new Date().toISOString(),
      database: "mysql/mariadb (prisma)",
      counts: { users, bookings, articles, assessments, results },
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
