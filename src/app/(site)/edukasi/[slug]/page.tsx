import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  Eye,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { ArticleBody } from "@/components/article-body";
import { ArticleCard } from "@/components/article-card";
import { ShareButtons } from "@/components/share-buttons";
import { formatDate, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({ where: { slug } });
  if (!article) return { title: "Artikel tidak ditemukan" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.cover],
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await db.article.findUnique({ where: { slug } });
  if (!article || !article.published) notFound();

  await db.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  const related = await db.article.findMany({
    where: { published: true, id: { not: article.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const headings = article.content
    .split("\n")
    .filter((line) => line.trim().startsWith("## "))
    .map((line) => line.replace("## ", "").trim());

  return (
    <>
      <section className="bg-brand-mint/50 pb-10 pt-8">
        <div className="shell">
          <nav className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-brand">Beranda</Link>
            <span>/</span>
            <Link href="/edukasi" className="hover:text-brand">Edukasi</Link>
            <span>/</span>
            <span className="line-clamp-1 text-brand-dark">{article.title}</span>
          </nav>

          <div className="mx-auto mt-8 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-dark shadow-sm">
              <Sparkles className="h-3 w-3" /> {article.category}
            </span>
            <h1 className="mt-4 text-[32px] font-medium leading-[1.12] tracking-[-0.02em] text-brand-deep sm:text-[44px]">
              {article.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-muted">
              {article.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-dark text-[9px] font-bold text-white">
                  {getInitials(article.author)}
                </span>
                <strong className="font-semibold text-ink">{article.author}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {article.readMinutes} menit baca
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> {article.views.toLocaleString("id-ID")} dibaca
              </span>
            </div>
          </div>
        </div>
      </section>

      <article className="bg-white pb-16 pt-8">
        <div className="shell">
          <div className="mx-auto max-w-4xl">
            <div className="relative aspect-[16/8] overflow-hidden rounded-[26px] shadow-soft">
              <Image
                src={article.cover}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-[1fr_260px]">
            <div>
              <ArticleBody content={article.content} />

              <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-mint font-serif text-sm font-semibold text-brand-dark">
                    {getInitials(article.author)}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-ink">{article.author}</p>
                    <p className="text-[10.5px] text-muted">Psikolog Konseling Trenggalek</p>
                  </div>
                </div>
                <ShareButtons title={article.title} path={`/edukasi/${article.slug}`} />
              </div>

              <div className="mt-10 rounded-3xl bg-brand-mint/60 p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand">
                    <HeartHandshake className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-brand-deep">
                      Butuh ruang untuk membicarakannya?
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                      Artikel ini bersifat edukatif dan bukan pengganti diagnosis
                      profesional. Jika Anda merasa perlu pendampingan, psikolog kami
                      siap membantu.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href="/klinik" className="btn-primary btn-sm">
                        Cari psikolog <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link href="/psikotes" className="btn-outline btn-sm">
                        Ikuti asesmen gratis
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/edukasi"
                className="mt-8 inline-flex items-center gap-2 text-[12px] font-semibold text-brand-dark hover:gap-3"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali ke semua artikel
              </Link>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-[92px] space-y-4">
                {headings.length > 0 && (
                  <div className="rounded-2xl border border-line p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      Dalam artikel ini
                    </p>
                    <ul className="mt-3 space-y-2">
                      {headings.map((h) => (
                        <li key={h} className="flex gap-2 text-[11.5px] leading-snug text-ink/70">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-2xl bg-brand-deep p-4 text-white">
                  <p className="font-serif text-[17px] leading-snug">
                    Mulai perjalanan wellness Anda
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-white/60">
                    Asesmen mandiri 3 menit untuk memetakan kondisi Anda saat ini.
                  </p>
                  <Link href="/psikotes" className="btn-accent btn-sm mt-3 w-full">
                    Coba sekarang
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <section className="bg-surface/70 py-14">
        <div className="shell">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-serif text-[26px] font-semibold text-brand-deep">
              Artikel lainnya
            </h2>
            <Link
              href="/edukasi"
              className="text-[12px] font-semibold text-brand-dark hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
