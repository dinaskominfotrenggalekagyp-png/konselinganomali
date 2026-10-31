import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, ExternalLink } from "lucide-react";
import { requireSuperadmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ArticleForm } from "@/components/article-form";

export const dynamic = "force-dynamic";

export default async function AdminArtikelEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const { error, ok } = await searchParams;

  const article = await db.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/artikel"
            className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted transition hover:text-brand-dark"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke daftar artikel
          </Link>
          <h1 className="mt-2 line-clamp-1 font-serif text-[28px] font-medium text-brand-deep">
            Edit artikel
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[10.5px] text-muted">
            <span>Dibuat {formatDate(article.createdAt)}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {article.views.toLocaleString("id-ID")} dibaca
            </span>
            <span>{article.published ? "Terbit" : "Draf"}</span>
          </p>
        </div>
        <Link
          href={`/edukasi/${article.slug}`}
          target="_blank"
          className="btn-outline btn-sm w-fit"
        >
          Lihat di situs <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {ok && (
        <p className="rounded-xl bg-brand-mint px-4 py-3 text-[11px] font-medium text-brand-dark">
          ✓ {ok}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          {error}
        </p>
      )}

      <ArticleForm article={article} />
    </div>
  );
}
