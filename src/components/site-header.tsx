"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, LogIn, Menu, X, LayoutDashboard, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn, getInitials } from "@/lib/utils";
import { isStaffRole, ROLE_LABEL, type Role } from "@/lib/roles";
import type { Branding } from "@/lib/branding";

type HeaderUser = { name: string; role: Role } | null;

const NAV = [
  { label: "Beranda", href: "/" },
  { label: "Klinik", href: "/klinik" },
  { label: "Edukasi", href: "/edukasi" },
  { label: "Psikotes", href: "/psikotes" },
];

export function SiteHeader({
  user,
  branding,
}: {
  user: HeaderUser;
  branding: Branding;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const portalHref = user && isStaffRole(user.role) ? "/admin" : "/portal";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] border-b transition-all duration-300",
        scrolled
          ? "border-line/70 bg-white/90 shadow-[0_10px_30px_rgba(3,105,161,0.08)] backdrop-blur-xl"
          : "border-transparent bg-white/70 backdrop-blur-md"
      )}
    >
      <div className="shell-wide flex h-[74px] items-center justify-between gap-4">
        <BrandLogo
          withTagline={false}
          className="shrink-0"
          logo={branding.logo}
          siteName={branding.siteName}
          tagline={branding.tagline}
        />

        <nav className="hidden items-center gap-1 rounded-full bg-surface/90 p-1.5 ring-1 ring-line/70 lg:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-white text-brand-deep shadow-sm"
                    : "text-ink/70 hover:text-brand-dark"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold">
            <span className="text-brand-dark">ID</span>
            <span className="text-line">|</span>
            <span className="cursor-not-allowed text-muted/60" title="English version coming soon">
              EN
            </span>
          </div>
          <Link
            href="/kontak"
            className="text-[13.5px] font-medium text-ink/70 transition-colors hover:text-brand-dark"
          >
            Kontak Kami
          </Link>

          {user ? (
            <Link
              href={portalHref}
              className="flex items-center gap-2 rounded-full bg-brand-dark py-1.5 pl-1.5 pr-4 text-[13px] font-medium text-white transition hover:bg-brand"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold">
                {getInitials(user.name)}
              </span>
              {isStaffRole(user.role) ? ROLE_LABEL[user.role] : "Portal Saya"}
              <LayoutDashboard className="h-3.5 w-3.5 opacity-70" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-brand-dark px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-brand"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login Portal
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-white/98 px-5 pb-6 pt-4 shadow-lg backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-3 text-[15px] font-medium",
                    active ? "bg-brand-mint text-brand-deep" : "text-ink/75"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/kontak" className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink/75">
              Kontak Kami
            </Link>
          </nav>

          <div className="mt-4 flex flex-col gap-2">
            <Link href={user ? portalHref : "/login"} className="btn-primary w-full">
              {user ? "Buka Dashboard" : "Login Portal"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${branding.contactPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline w-full"
            >
              <Phone className="h-4 w-4" />
              Hubungi Admin
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
