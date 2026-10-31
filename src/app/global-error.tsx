"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error, "digest:", error.digest);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#f2f9f7",
          color: "#0f3d33",
          padding: "16px",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            background: "#fff",
            borderRadius: 24,
            padding: 32,
            textAlign: "center",
            boxShadow: "0 18px 40px rgba(15,61,51,0.08)",
          }}
        >
          <h1 style={{ fontSize: 20, margin: 0 }}>Aplikasi gagal dimuat</h1>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "#4b6b63" }}>
            Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: 11,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                background: "#f4f7f6",
                borderRadius: 10,
                padding: "8px 10px",
                color: "#4b6b63",
              }}
            >
              Digest: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              border: 0,
              borderRadius: 999,
              padding: "10px 22px",
              fontWeight: 600,
              fontSize: 13,
              color: "#fff",
              background: "#127a5f",
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
