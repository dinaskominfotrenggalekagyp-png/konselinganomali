"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn, getInitials } from "@/lib/utils";
import type { Branding } from "@/lib/branding";

const NAV = [
  { label: "Ringkasan", href: "/portal", icon: LayoutDashboard },
  { label: "Jadwal Sesi", href: "/portal/jadwal", icon: CalendarDays },
  { label: "Pesan Sesi", href: "/portal/pesan", icon: MessageCircle },
  { label: "Hasil Asesmen", href: "/portal/asesmen", icon: ClipboardList },
  { label: "Mood Tracker", href: "/portal/mood", icon: HeartPulse },
  { label: "Tagihan", href: "/portal/tagihan", icon: CreditCard },
];

export function PortalNav({
  user,
  branding,
}: {
  user: { name: string; email: string };
  branding: Branding;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <BrandLogo
          withTagline={false}
          logo={branding.logo}
          siteName={branding.siteName}
          tagline={branding.tagline}
        />
      </div>

      <div className="px-5">
        <span className="rounded-full bg-brand-mint px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-brand-dark">
          Portal Klien
        </span>
      </div>

      <nav className="mt-5 flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12.5px] font-medium transition",
                active
                  ? "bg-brand-dark text-white shadow-sm"
                  : "text-ink/65 hover:bg-brand-mint/60 hover:text-brand-dark"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <div className="rounded-2xl bg-brand-mint/60 p-4">
          <div className="flex items-center gap-2 text-brand-dark">
            <MessageCircle className="h-4 w-4" />
            <p className="text-[11px] font-semibold">Butuh bantuan?</p>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            Admin kami siap membantu setiap hari kerja.
          </p>
          <a
            href={`https://wa.me/${branding.contactPhone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 inline-flex w-full items-center justify-center rounded-full bg-white py-2 text-[10px] font-semibold text-brand-dark transition hover:bg-brand hover:text-white"
          >
            Chat WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-line p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-[10px] font-bold text-white">
            {getInitials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-semibold text-ink">{user.name}</p>
            <p className="truncate text-[10px] text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Keluar"
            title="Keluar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] border-r border-line bg-white lg:block print:hidden">
        {content}
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden print:hidden">
        <BrandLogo
          withTagline={false}
          logo={branding.logo}
          siteName={branding.siteName}
          tagline={branding.tagline}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line"
          aria-label="Buka menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-deep/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
