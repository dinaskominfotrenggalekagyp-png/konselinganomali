"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Munculkan detail di console browser + log Vercel (Runtime Logs).
    console.error("App error:", error, "digest:", error.digest);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mint/40 px-4">
      <div className="w-full max-w-md rounded-[24px] border border-white bg-white/90 p-8 text-center shadow-soft">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
          Terjadi kesalahan
        </p>
        <h1 className="mt-3 font-serif text-2xl font-medium text-brand-deep">
          Halaman ini gagal dimuat
        </h1>
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
          Silakan coba lagi. Kalau masih gagal, hubungi tim kami dan sebutkan kode
          di bawah ini.
        </p>

        {error.digest && (
          <p className="mt-4 rounded-xl bg-surface px-3 py-2 font-mono text-[10.5px] text-muted">
            Digest: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={reset} className="btn-primary btn-sm">
            Coba lagi
          </button>
          <Link href="/" className="btn-outline btn-sm">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
