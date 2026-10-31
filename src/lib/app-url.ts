/**
 * URL dasar aplikasi yang aman dipakai di `metadataBase`.
 *
 * `new URL()` melempar TypeError bila nilainya tidak valid (mis. env var diisi
 * tanpa protokol: "domain.vercel.app"). Error itu terjadi di root layout dan
 * Next.js menampilkannya sebagai "server-side exception" + digest, yang sangat
 * sulit dilacak. Karena itu nilai selalu divalidasi dan diberi fallback.
 */
export function appBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const candidates = raw ? [raw, `https://${raw}`] : [];

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.origin;
      }
    } catch {
      // coba kandidat berikutnya
    }
  }

  // Vercel menyediakan ini otomatis untuk setiap deployment.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
