import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { AssessmentRunner } from "@/components/assessment-runner";
import { safeJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Question = {
  id: string;
  text: string;
  options: { label: string; value: number }[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const assessment = await db.assessment.findUnique({ where: { slug } });
  return { title: assessment?.title ?? "Asesmen" };
}

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const assessment = await db.assessment.findUnique({ where: { slug } });
  if (!assessment || !assessment.isActive) notFound();

  const questions = safeJson<Question[]>(assessment.questions, []);

  return (
    <section className="bg-surface/60 py-10">
      <div className="shell">
        <nav className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
          <Link href="/" className="hover:text-brand">Beranda</Link>
          <span>/</span>
          <Link href="/psikotes" className="hover:text-brand">Psikotes</Link>
          <span>/</span>
          <span className="text-brand-dark">{assessment.title}</span>
        </nav>

        <div className="mt-5 flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[30px] font-medium leading-tight text-brand-deep sm:text-[38px]">
              {assessment.title}
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
              {assessment.description}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/15 bg-white px-3 py-1.5 text-[10.5px] font-medium text-brand-dark">
            <ShieldCheck className="h-3.5 w-3.5" /> Anonim &amp; rahasia
          </span>
        </div>

        <div className="mt-7">
          <AssessmentRunner
            slug={assessment.slug}
            title={assessment.title}
            questions={questions}
            duration={assessment.duration}
          />
        </div>
      </div>
    </section>
  );
}
