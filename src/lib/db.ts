import { PrismaClient } from "@prisma/client";

/**
 * Supabase menyediakan dua pooler:
 *
 *  - Transaction Pooler  (port 6543) — direkomendasikan untuk serverless,
 *    tapi pada project ini terukur ~6x lebih lambat per query
 *    (≈1.700 ms vs ≈300 ms) sehingga halaman terasa berat.
 *  - Session Pooler      (port 5432) — jauh lebih cepat untuk beban aplikasi
 *    ini dan tetap kompatibel dengan Prisma.
 *
 * Karena itu URL runtime dinormalisasi ke Session Pooler. Kalau suatu saat
 * butuh Transaction Pooler lagi (mis. trafik tinggi dan koneksi menipis),
 * set env `PRISMA_USE_TRANSACTION_POOLER=1` untuk mematikannya.
 *
 * Catatan: ini HANYA menyentuh koneksi runtime. `prisma migrate` tetap memakai
 * `directUrl` (DIRECT_URL) dari schema.prisma.
 */
function runtimeDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  if (process.env.PRISMA_USE_TRANSACTION_POOLER === "1") return raw;

  try {
    const url = new URL(raw);
    if (url.port === "6543") {
      url.port = "5432";
      // Parameter khusus PgBouncer transaction mode tidak diperlukan (dan
      // bisa memperlambat) pada session mode.
      url.searchParams.delete("pgbouncer");
      url.searchParams.delete("connection_limit");
      return url.toString();
    }
  } catch {
    // URL tidak standar — biarkan apa adanya.
  }

  return raw;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: runtimeDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
