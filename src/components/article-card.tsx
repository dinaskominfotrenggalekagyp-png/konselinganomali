import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export type ArticleCardData = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  cover: string;
  author: string;
  readMinutes: number;
  publishedAt: Date;
  views?: number;
};

export function ArticleCard({
  article,
  featured = false,
}: {
  article: ArticleCardData;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/edukasi/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-card"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={article.cover}
          alt={article.title}
          fill
          sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 100vw, 33vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-dark backdrop-blur">
          {article.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-[11px] text-muted">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="h-1 w-1 rounded-full bg-line" />
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readMinutes} menit baca
          </span>
        </div>
        <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-brand-deep transition-colors group-hover:text-brand">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted">
          {article.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-line/70 pt-4">
          <span className="text-[11.5px] font-medium text-ink/60">{article.author}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-brand-dark transition group-hover:bg-brand group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
