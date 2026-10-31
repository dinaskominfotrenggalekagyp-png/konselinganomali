"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { saveArticleAction } from "@/app/admin/actions";
import { errorMessage, isNextRedirectError } from "@/lib/action-errors";
import { fileSizeKb, prepareImageForUpload } from "@/lib/image-client";
import { slugify } from "@/lib/utils";

type ArticleFormProps = {
  article?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    cover: string;
    author: string;
    readMinutes: number;
    published: boolean;
  };
};

const CATEGORIES = [
  "Mental Health",
  "Kecemasan",
  "Relasi",
  "Parenting",
  "Karier",
  "Self Care",
];

export function ArticleForm({ article }: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [content, setContent] = useState(article?.content ?? "");
  const [cover, setCover] = useState(article?.cover ?? "");
  const [pendingCover, setPendingCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<
    { tone: "info" | "ok" | "error"; text: string } | null
  >(null);

  // Bersihkan object URL preview saat diganti / komponen dilepas.
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  /** Pilih gambar → kompres di browser. Belum diunggah sampai tombol Simpan. */
  async function chooseCover(file: File) {
    setCompressing(true);
    setStatus({ tone: "info", text: "Mengompres gambar..." });
    try {
      const prepared = await prepareImageForUpload(file);
      setPendingCover(prepared);
      setCoverPreview(URL.createObjectURL(prepared));
      setStatus({
        tone: "ok",
        text: `Gambar siap (${fileSizeKb(prepared)} KB). Belum diunggah — klik Simpan untuk menyimpan.`,
      });
    } catch (error) {
      setPendingCover(null);
      setCoverPreview(null);
      setStatus({
        tone: "error",
        text: errorMessage(error, "Gagal menyiapkan gambar."),
      });
    } finally {
      setCompressing(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || compressing) return;

    const form = event.currentTarget;
    setSaving(true);
    setStatus({
      tone: "info",
      text: pendingCover
        ? "Mengunggah gambar lalu menyimpan artikel..."
        : "Menyimpan artikel...",
    });

    try {
      let coverUrl = cover;

      if (pendingCover) {
        const body = new FormData();
        body.append("file", pendingCover);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error ?? "Gagal mengunggah gambar");
        }
        coverUrl = data.url;
        setCover(coverUrl);
        setPendingCover(null);
        setCoverPreview(null);
      }

      const formData = new FormData(form);
      formData.set("cover", coverUrl);

      await saveArticleAction(formData);
      // Sukses: server action melakukan redirect ke halaman dengan notifikasi.
    } catch (error) {
      if (isNextRedirectError(error)) throw error;
      setSaving(false);
      setStatus({
        tone: "error",
        text: errorMessage(error, "Gagal menyimpan artikel. Coba lagi."),
      });
    }
  }

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const autoMinutes = Math.max(1, Math.round(words / 200));
  const headings = content
    .split("\n")
    .filter((line) => line.trim().startsWith("## "))
    .map((line) => line.replace("## ", "").trim());

  return (
    <form
      action={saveArticleAction}
      onSubmit={handleSubmit}
      className="grid gap-4 lg:grid-cols-[1.55fr_1fr]"
    >
      {article && <input type="hidden" name="id" value={article.id} />}

      <div className="space-y-4">
        <div className="rounded-3xl border border-line bg-white p-5">
          <label htmlFor="article-title" className="label">
            Judul artikel
          </label>
          <input
            id="article-title"
            name="title"
            required
            minLength={4}
            value={title}
            onChange={(event) => {
              const value = event.target.value;
              setTitle(value);
              if (!slugTouched) setSlug(slugify(value));
            }}
            placeholder="Mengenal kecemasan dan cara mengelolanya"
            className="field font-serif text-lg"
          />

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="article-slug" className="label">
                Slug URL
              </label>
              <input
                id="article-slug"
                name="slug"
                required
                minLength={3}
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                placeholder="mengenal-kecemasan"
                className="field font-mono text-xs"
              />
              <p className="mt-1 text-[9.5px] text-muted">
                /edukasi/{slug || "slug-artikel"}
              </p>
            </div>
            <div>
              <label htmlFor="article-category" className="label">
                Kategori
              </label>
              <select
                id="article-category"
                name="category"
                defaultValue={article?.category ?? "Mental Health"}
                className="field"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor="article-excerpt" className="label">
              Ringkasan (meta description)
            </label>
            <textarea
              id="article-excerpt"
              name="excerpt"
              required
              minLength={10}
              rows={2}
              defaultValue={article?.excerpt ?? ""}
              placeholder="Ringkasan 1–2 kalimat yang muncul di kartu artikel dan hasil pencarian."
              className="field resize-none"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-end justify-between">
            <div>
              <label htmlFor="article-content" className="label mb-0">
                Isi artikel
              </label>
              <p className="mt-1 text-[9.5px] text-muted">
                Markdown ringan: <code>## Sub-judul</code>, <code>**tebal**</code>,
                <code> - poin</code>
              </p>
            </div>
            <span className="chip bg-brand-mint text-brand-dark">
              {words} kata · ±{autoMinutes} menit
            </span>
          </div>

          <textarea
            id="article-content"
            name="content"
            required
            minLength={20}
            rows={22}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={`## Apa itu kecemasan?\n\nKecemasan adalah respons alami tubuh terhadap tekanan...\n\n## Tanda yang perlu diperhatikan\n\n- Jantung berdebar\n- Sulit berkonsentrasi`}
            className="field mt-3 resize-y font-mono text-[12px] leading-relaxed"
          />

          {headings.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {headings.map((heading) => (
                <span key={heading} className="chip bg-surface text-ink/60">
                  {heading}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-line bg-white p-5">
          <p className="flex items-center gap-2 text-[12px] font-semibold text-brand-deep">
            <Sparkles className="h-3.5 w-3.5 text-brand" /> Publikasi
          </p>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface/50 p-3">
            <input
              type="checkbox"
              name="published"
              defaultChecked={article?.published ?? true}
              className="mt-0.5 h-4 w-4 rounded border-line accent-[#0369a1]"
            />
            <span>
              <span className="block text-[11.5px] font-medium text-ink">
                Terbitkan sekarang
              </span>
              <span className="block text-[9.5px] text-muted">
                Jika tidak dicentang, artikel disimpan sebagai draf.
              </span>
            </span>
          </label>

          <div className="mt-3">
            <label htmlFor="article-author" className="label">
              Penulis
            </label>
            <input
              id="article-author"
              name="author"
              required
              defaultValue={article?.author ?? "Tim Konseling Trenggalek"}
              className="field"
            />
          </div>

          <div className="mt-3">
            <label htmlFor="article-minutes" className="label">
              Estimasi waktu baca (menit)
            </label>
            <input
              id="article-minutes"
              name="readMinutes"
              type="number"
              min={1}
              max={60}
              defaultValue={article?.readMinutes ?? autoMinutes}
              className="field"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-5">
          <label htmlFor="article-cover" className="label">
            Gambar cover
          </label>
          <input
            id="article-cover"
            name="cover"
            type="text"
            value={cover}
            onChange={(event) => {
              setCover(event.target.value);
              // Mengetik URL manual membatalkan gambar yang menunggu diunggah.
              setPendingCover(null);
              setCoverPreview(null);
              setStatus(null);
            }}
            placeholder="https://images.unsplash.com/... atau /uploads/..."
            className="field text-[11px]"
          />

          <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand/30 bg-brand-mint/30 px-3 py-2.5 text-[10.5px] font-medium text-brand-dark transition hover:bg-brand-mint">
            {compressing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {compressing ? "Mengompres gambar..." : "Pilih gambar dari perangkat"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              disabled={compressing || saving}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void chooseCover(file);
                event.target.value = "";
              }}
            />
          </label>

          {status && (
            <p
              role="status"
              className={`mt-2 flex items-start gap-1.5 rounded-lg px-2.5 py-2 text-[9.5px] font-medium ${
                status.tone === "ok"
                  ? "bg-emerald-50 text-emerald-700"
                  : status.tone === "error"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-surface text-muted"
              }`}
            >
              {status.tone === "ok" ? (
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
              ) : status.tone === "error" ? (
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
              ) : (
                <Loader2 className="mt-0.5 h-3 w-3 shrink-0 animate-spin" />
              )}
              {status.text}
            </p>
          )}

          {pendingCover && (
            <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-wide text-amber-600">
              Gambar belum diunggah — klik Simpan
            </p>
          )}

          {(coverPreview || cover) && (
            <div className="relative mt-2 h-28 overflow-hidden rounded-xl border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreview ?? cover}
                alt="Pratinjau cover"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <p className="mt-1.5 flex items-start gap-1 text-[9.5px] leading-relaxed text-muted">
            <ImageIcon className="mt-0.5 h-3 w-3 shrink-0" />
            JPG/PNG/WebP/GIF. Gambar otomatis dikompres ke ±100 KB dan baru
            diunggah saat kamu klik Simpan. Gunakan gambar landscape minimal
            1200×675 px.
          </p>
        </div>

        <button type="submit" className="btn-primary btn-sm w-full" disabled={saving || compressing}>
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saving
            ? "Menyimpan..."
            : article
              ? "Simpan perubahan"
              : "Simpan artikel"}
        </button>
      </div>
    </form>
  );
}
