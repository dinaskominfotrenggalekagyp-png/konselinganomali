/**
 * Server action yang memanggil `redirect()` melempar error khusus milik Next.js.
 * Error itu tidak boleh "ditelan" oleh try/catch di komponen klien, karena
 * navigasinya justru dijalankan oleh framework.
 */
export function isNextRedirectError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

export function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
