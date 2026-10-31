"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Globe,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn, getInitials } from "@/lib/utils";
import { ROLE_LABEL, type Role } from "@/lib/roles";
import type { Branding } from "@/lib/branding";

const NAV: {
  label: string;
  href: string;
  icon: typeof BarChart3;
  roles: Role[];
}[] = [
  { label: "Dashboard", href: "/admin", icon: BarChart3, roles: ["SUPERADMIN", "ADMIN"] },
  { label: "Booking", href: "/admin/booking", icon: CalendarDays, roles: ["SUPERADMIN", "ADMIN", "PSYCHOLOGIST"] },
  { label: "Psikolog", href: "/admin/psikolog", icon: Users, roles: ["SUPERADMIN", "ADMIN"] },
  { label: "Akun", href: "/admin/akun", icon: UserCog, roles: ["SUPERADMIN", "ADMIN"] },
  { label: "Artikel", href: "/admin/artikel", icon: BookOpen, roles: ["SUPERADMIN"] },
  { label: "Pesan Masuk", href: "/admin/pesan", icon: Mail, roles: ["SUPERADMIN", "ADMIN"] },
  { label: "Pesan Sesi", href: "/admin/pesan-sesi", icon: MessageSquare, roles: ["SUPERADMIN", "ADMIN", "PSYCHOLOGIST"] },
  { label: "Asesmen", href: "/admin/asesmen", icon: ClipboardList, roles: ["SUPERADMIN", "ADMIN", "PSYCHOLOGIST"] },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings, roles: ["SUPERADMIN"] },
];

export function AdminNav({
  user,
  branding,
}: {
  user: { name: string; email: string; role: Role };
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

  const items = NAV.filter((item) => item.roles.includes(user.role));

  const content = (
    <div className="flex h-full flex-col bg-brand-deep text-white">
      <div className="px-5 py-5">
        <BrandLogo
          variant="light"
          withTagline={false}
          logo={branding.logo}
          siteName={branding.siteName}
          tagline={branding.tagline}
        />
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-brand-accent">
          <ShieldCheck className="h-3 w-3" /> {ROLE_LABEL[user.role]}
        </span>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12.5px] font-medium transition",
                active
                  ? "bg-brand-accent text-brand-deep"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-[11px] text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" /> Lihat situs
          </span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-brand-deep">
            {getInitials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-semibold">{user.name}</p>
            <p className="truncate text-[9.5px] text-white/40">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Keluar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] lg:block">
        {content}
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-brand-deep px-4 text-white lg:hidden">
        <BrandLogo
          variant="light"
          withTagline={false}
          logo={branding.logo}
          siteName={branding.siteName}
          tagline={branding.tagline}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20"
          aria-label="Buka menu admin"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-[270px] shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
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
