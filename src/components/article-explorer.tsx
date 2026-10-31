"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ArticleCard, type ArticleCardData } from "@/components/article-card";
import { cn } from "@/lib/utils";

export function ArticleExplorer({ articles }: { articles: ArticleCardData[] }) {
  const categories = ["Semua", ...Array.from(new Set(articles.map((a) => a.category)))];
  const [active, setActive] = useState("Semua");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return articles.filter((a) => {
      const matchCategory = active === "Semua" || a.category === active;
      const matchQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [articles, active, query]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[12px] font-medium transition",
                active === category
                  ? "border-brand bg-brand-dark text-white"
                  : "border-line bg-white text-ink/65 hover:border-brand/30 hover:text-brand-dark"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel..."
            className="field py-2.5 pl-10 pr-9 text-[12.5px]"
            aria-label="Cari artikel"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
          <p className="font-serif text-xl text-brand-deep">Belum ada artikel yang cocok</p>
          <p className="mt-1 text-[12.5px] text-muted">
            Coba kata kunci lain atau pilih kategori berbeda.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
