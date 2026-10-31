import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { requireSuperadmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { deleteArticleAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; ok?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { q = "", status = "ALL", ok, error } = await searchParams;

  const where = {
    ...(status === "PUBLISHED"
      ? { published: true }
      : status === "DRAFT"
        ? { published: false }
        : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { category: { contains: q } },
            { author: { contains: q } },
          ],
        }
      : {}),
  };

  const [articles, total, published, drafts, views] = await Promise.all([
    db.article.findMany({ where, orderBy: { createdAt: "desc" } }),
    db.article.count(),
    db.article.count({ where: { published: true } }),
    db.article.count({ where: { published: false } }),
    db.article.aggregate({ _sum: { views: true } }),
  ]);

  const stats = [
    { label: "Total artikel", value: total, icon: FileText },
    { label: "Terbit", value: published, icon: BookOpen },
    { label: "Draf", value: drafts, icon: Clock },
    { label: "Total dibaca", value: views._sum.views ?? 0, icon: Eye },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Konten Edukasi
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
            Manajemen artikel
          </h1>
          <p className="mt-1 text-[12px] text-muted">
            Kelola konten halaman edukasi dan kartu artikel di beranda.
          </p>
        </div>
        <Link href="/admin/artikel/baru" className="btn-primary btn-sm w-fit">
          <Plus className="h-3.5 w-3.5" /> Tulis artikel
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-white p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mint text-brand-dark">
              <stat.icon className="h-3.5 w-3.5" />
            </span>
            <p className="mt-2.5 font-serif text-xl font-semibold text-brand-deep">
              {stat.value.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <form className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-line bg-surface/50 px-3">
            <Search className="h-3.5 w-3.5 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari judul, kategori, penulis…"
              className="w-full bg-transparent py-2 text-[11.5px] outline-none placeholder:text-muted/70"
            />
            <input type="hidden" name="status" value={status} />
          </form>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["ALL", "Semua"],
                ["PUBLISHED", "Terbit"],
                ["DRAFT", "Draf"],
              ] as const
            ).map(([key, label]) => (
              <Link
                key={key}
                href={`/admin/artikel?status=${key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition ${
                  status === key
                    ? "bg-brand-dark text-white"
                    : "bg-surface text-ink/60 hover:text-brand-dark"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="divide-y divide-line">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex flex-col gap-3 p-4 transition hover:bg-surface/40 sm:flex-row sm:items-center"
            >
              <span className="relative h-[58px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-surface">
                <Image
                  src={article.cover}
                  alt={article.title}
                  fill
                  sizes="92px"
                  className="object-cover"
                />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip bg-brand-mint/70 text-brand-dark">
                    {article.category}
                  </span>
                  <span
                    className={`chip ring-1 ${
                      article.published
                        ? "bg-sky-50 text-sky-700 ring-sky-200"
                        : "bg-amber-50 text-amber-700 ring-amber-200"
                    }`}
                  >
                    {article.published ? "Terbit" : "Draf"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-[12.5px] font-semibold text-ink">
                  {article.title}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9.5px] text-muted">
                  <span>{article.author}</span>
                  <span>{formatDate(article.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-2.5 w-2.5" /> {article.views.toLocaleString("id-ID")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" /> {article.readMinutes} menit
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Link
                  href={`/edukasi/${article.slug}`}
                  target="_blank"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-brand-mint hover:text-brand-dark"
                  aria-label="Lihat artikel"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/admin/artikel/${article.id}`}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-[9.5px] font-medium text-ink/70 transition hover:border-brand/30 hover:text-brand"
                >
                  Edit
                </Link>
                <form action={deleteArticleAction}>
                  <input type="hidden" name="id" value={article.id} />
                  <button
                    type="submit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Hapus ${article.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))}

          {articles.length === 0 && (
            <div className="p-10 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-muted/40" />
              <p className="mt-2 text-[11.5px] text-muted">
                Tidak ada artikel yang cocok dengan filter ini.
              </p>
              <Link
                href="/admin/artikel/baru"
                className="mt-3 inline-flex text-[11px] font-semibold text-brand hover:underline"
              >
                Tulis artikel pertama
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
