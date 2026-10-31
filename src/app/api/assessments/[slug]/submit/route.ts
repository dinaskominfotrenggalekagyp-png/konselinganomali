import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { safeJson, scoreAssessment, type ScoringConfig } from "@/lib/utils";

const schema = z.object({
  answers: z.record(z.string(), z.coerce.number()),
  guestName: z.string().max(120).optional(),
  guestEmail: z.string().email().optional().or(z.literal("")),
});

type Question = {
  id: string;
  text: string;
  options: { label: string; value: number }[];
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Jawaban tidak valid" }, { status: 400 });
    }

    const assessment = await db.assessment.findUnique({ where: { slug } });
    if (!assessment || !assessment.isActive) {
      return NextResponse.json({ error: "Asesmen tidak ditemukan" }, { status: 404 });
    }

    const questions = safeJson<Question[]>(assessment.questions, []);
    const config = safeJson<ScoringConfig>(assessment.scoring, {
      maxScore: 0,
      categories: [],
    });

    let total = 0;
    for (const question of questions) {
      const answer = parsed.data.answers[question.id];
      if (typeof answer !== "number") {
        return NextResponse.json(
          { error: "Semua pertanyaan harus dijawab" },
          { status: 400 }
        );
      }
      const option = question.options.find((o) => o.value === answer);
      if (!option) {
        return NextResponse.json({ error: "Nilai jawaban tidak valid" }, { status: 400 });
      }
      total += option.value;
    }

    const category = scoreAssessment(total, config);
    const session = await getSession();

    const result = await db.assessmentResult.create({
      data: {
        assessmentId: assessment.id,
        userId: session?.sub ?? null,
        guestName: parsed.data.guestName || session?.name || null,
        guestEmail: parsed.data.guestEmail || session?.email || null,
        answers: JSON.stringify(parsed.data.answers),
        score: total,
        category: category.label,
        summary: category.summary,
      },
    });

    if (session) {
      await db.activityLog.create({
        data: {
          userId: session.sub,
          action: "ASSESSMENT_COMPLETED",
          meta: `${assessment.title} • ${total}`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      resultId: result.id,
      score: total,
      category: category.label,
      summary: category.summary,
      color: category.color,
      maxScore: config.maxScore,
    });
  } catch (error) {
    console.error("assessment submit error", error);
    return NextResponse.json({ error: "Gagal menyimpan hasil" }, { status: 500 });
  }
}
