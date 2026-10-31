"use client";

import { Check, Copy, Linkedin, MessageCircle } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard tidak tersedia
    }
  }

  const url = typeof window !== "undefined" ? window.location.href : path;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">
        Bagikan
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Salin tautan"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition hover:border-brand/40 hover:text-brand"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Bagikan ke WhatsApp"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition hover:border-brand/40 hover:text-brand"
      >
        <MessageCircle className="h-3.5 w-3.5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Bagikan ke LinkedIn"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition hover:border-brand/40 hover:text-brand"
      >
        <Linkedin className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
