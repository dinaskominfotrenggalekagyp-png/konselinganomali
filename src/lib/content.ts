import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

/**
 * Query baca-saja untuk halaman publik.
 *
 * Semua fungsi di sini di-cache lintas request (bukan hanya per request).
 * Tanpa ini, setiap perpindahan menu memicu 2–6 round trip ke database dan
 * terasa lambat. Data publik jarang berubah, jadi TTL 5 menit + invalidasi
 * lewat tag sudah memadai.
 *
 * Invalidate dengan `revalidateTag("services")` dsb. dari server action.
 * Catatan: nilai Date akan terserialisasi menjadi string ISO oleh cache,
 * karena itu `formatDate()` dibuat menerima string maupun Date.
 */

const TTL = 300;

export const getServices = unstable_cache(
  async () =>
    db.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ["content:services"],
  { revalidate: TTL, tags: ["services"] }
);

export const getPsychologists = unstable_cache(
  async () =>
    db.psychologist.findMany({
      where: { isActive: true },
      orderBy: { reviews: "desc" },
    }),
  ["content:psychologists"],
  { revalidate: TTL, tags: ["psychologists"] }
);

export const getPublishedArticles = unstable_cache(
  async () =>
    db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    }),
  ["content:articles"],
  { revalidate: TTL, tags: ["articles"] }
);

export const getLatestArticles = unstable_cache(
  async (take: number) =>
    db.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take,
    }),
  ["content:articles-latest"],
  { revalidate: TTL, tags: ["articles"] }
);

export const getActiveAssessments = unstable_cache(
  async () =>
    db.assessment.findMany({
      where: { isActive: true },
      orderBy: { title: "asc" },
    }),
  ["content:assessments"],
  { revalidate: TTL, tags: ["assessments"] }
);

export const getTestimonials = unstable_cache(
  async () =>
    db.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { id: "asc" },
    }),
  ["content:testimonials"],
  { revalidate: TTL, tags: ["testimonials"] }
);

export const getFaqs = unstable_cache(
  async () => db.faq.findMany({ orderBy: { sort: "asc" } }),
  ["content:faqs"],
  { revalidate: TTL, tags: ["faqs"] }
);

export const getServiceBySlug = unstable_cache(
  async (slug: string) => db.service.findUnique({ where: { slug } }),
  ["content:service-by-slug"],
  { revalidate: TTL, tags: ["services"] }
);

export const getPsychologistBySlug = unstable_cache(
  async (slug: string) => db.psychologist.findUnique({ where: { slug } }),
  ["content:psychologist-by-slug"],
  { revalidate: TTL, tags: ["psychologists"] }
);

export const getAssessmentBySlug = unstable_cache(
  async (slug: string) => db.assessment.findUnique({ where: { slug } }),
  ["content:assessment-by-slug"],
  { revalidate: TTL, tags: ["assessments"] }
);

export const getArticleBySlug = unstable_cache(
  async (slug: string) => db.article.findUnique({ where: { slug } }),
  ["content:article-by-slug"],
  { revalidate: TTL, tags: ["articles"] }
);
