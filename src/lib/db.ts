import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Koneksi database untuk runtime (Vercel/serverless).
 *
 * Supabase menyediakan dua pooler:
 *
 *  - Transaction Pooler (port 6543) — banyak instance serverless berbagi
 *    sedikit koneksi server. Ini yang wajib dipakai di serverless supaya
 *    tidak kehabisan slot koneksi (session pooler dibatasi ~15 klien).
 *  - Session Pooler (port 5432) — cepat, tetapi setiap instance menahan satu
 *    koneksi; dengan auto-scaling Vercel batas 15 klien cepat habis dan
 *    aplikasi gagal dengan EMAXCONNSESSION.
 *
 * Mesin query bawaan Prisma ternyata sangat lambat di port 6543 (±1,4 detik
 * per query, terukur). Karena itu Prisma dihubungkan lewat driver `pg`
 * (driver adapter) yang mengukur ±0,35 detik pada koneksi yang sama.
 *
 * `max: 5` = maksimal 5 koneksi per instance function; sisanya dimultipleks
 * oleh Transaction Pooler. `prisma migrate` tetap memakai `directUrl`
 * (DIRECT_URL) dari schema.prisma dan tidak terpengaruh file ini.
 */
function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

const log: ("warn" | "error")[] =
  process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"];

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const url = databaseUrl();
  if (!url) {
    // Biarkan Prisma melempar error yang jelas saat DATABASE_URL belum diisi.
    return new PrismaClient({ log });
  }

  const adapter = new PrismaPg({ connectionString: url, max: 5 });
  return new PrismaClient({ adapter, log });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
