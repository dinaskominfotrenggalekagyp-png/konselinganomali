"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { label: string; value: number };
type Question = { id: string; text: string; options: Option[] };

export function AssessmentRunner({
  slug,
  title,
  questions,
  duration,
}: {
  slug: string;
  title: string;
  questions: Question[];
  duration: number;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const current = questions[index];
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / questions.length) * 100);
  const isLast = index === questions.length - 1;

  const selected = current ? answers[current.id] : undefined;
  const allAnswered = useMemo(
    () => questions.every((q) => typeof answers[q.id] === "number"),
    [answers, questions]
  );

  function choose(value: number) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
    if (!isLast) {
      setTimeout(() => setIndex((i) => Math.min(i + 1, questions.length - 1)), 180);
    }
  }

  async function submit() {
    if (!allAnswered) {
      setError("Masih ada pertanyaan yang belum dijawab.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/assessments/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan hasil");
      router.push(`/psikotes/hasil/${data.resultId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setSubmitting(false);
    }
  }

  if (!current) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:gap-8">
      <div>
        <div className="rounded-3xl border border-line bg-white p-5 shadow-soft sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                {title}
              </p>
              <p className="mt-1 text-[11.5px] text-muted">
                Pertanyaan {index + 1} dari {questions.length}
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[10.5px] text-muted">
              <Clock className="h-3 w-3" /> ± {duration} menit
            </span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div key={current.id} className="mt-7 animate-fade-up">
            <span className="font-serif text-[40px] font-semibold leading-none text-brand/15">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-2 font-serif text-[24px] font-medium leading-snug text-brand-deep sm:text-[28px]">
              {current.text}
            </h2>

            <div className="mt-6 space-y-2.5">
              {current.options.map((option) => {
                const active = selected === option.value;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => choose(option.value)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[13px] transition",
                      active
                        ? "border-brand bg-brand-mint/70 font-medium text-brand-deep"
                        : "border-line text-ink/75 hover:border-brand/30 hover:bg-surface/60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        active ? "border-brand bg-brand text-white" : "border-line"
                      )}
                    >
                      {active && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-[11.5px] font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted transition hover:text-ink disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Sebelumnya
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !allAnswered}
                className="btn-primary btn-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menghitung...
                  </>
                ) : (
                  <>
                    Lihat hasil <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-dark transition hover:gap-2.5"
              >
                Berikutnya <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 hidden items-center gap-2 px-2 text-[10.5px] text-muted sm:flex">
          <Info className="h-3.5 w-3.5" />
          Jawab sejujur mungkin berdasarkan dua minggu terakhir. Tidak ada jawaban
          benar atau salah.
        </div>
      </div>

      <aside>
        <div className="sticky top-[92px] space-y-3">
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              Progres
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold text-brand-deep">
              {progress}%
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ke pertanyaan ${i + 1}`}
                  className={cn(
                    "h-6 w-6 rounded-md text-[9.5px] font-semibold transition",
                    i === index
                      ? "bg-brand-dark text-white"
                      : answers[q.id] !== undefined
                        ? "bg-brand-mint text-brand-dark"
                        : "bg-surface text-muted hover:bg-line"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface/60 p-4">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-brand" />
              <p className="text-[11px] font-semibold text-ink">Privasi terjaga</p>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
              Jawaban Anda hanya digunakan untuk menghitung hasil dan tidak dibagikan
              ke pihak ketiga.
            </p>
          </div>

          <div className="rounded-2xl border border-brand/15 bg-brand-mint/50 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" />
              <p className="text-[11px] font-semibold text-brand-deep">Bukan diagnosis</p>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
              Hasil bersifat skrining awal. Konsultasikan dengan psikolog untuk
              penilaian menyeluruh.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
