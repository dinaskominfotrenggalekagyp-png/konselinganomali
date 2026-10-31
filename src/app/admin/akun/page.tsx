import Link from "next/link";
import {
  CalendarDays,
  Mail,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  isSuperadminRole,
  ROLE_DESCRIPTION,
  ROLE_LABEL,
  ROLES,
  type Role,
} from "@/lib/roles";
import { createAccountAction, deleteAccountAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const ROLE_TONE: Record<Role, string> = {
  SUPERADMIN: "bg-violet-50 text-violet-700 ring-violet-200",
  ADMIN: "bg-sky-50 text-sky-700 ring-sky-200",
  PSYCHOLOGIST: "bg-brand-mint text-brand-dark ring-brand/20",
  CLIENT: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default async function AdminAkunPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const actor = await requireAdmin();
  const { ok, error } = await searchParams;

  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { bookings: true, results: true } },
    },
  });

  const counts = ROLES.reduce<Record<Role, number>>(
    (acc, role) => {
      acc[role] = users.filter((user) => user.role === role).length;
      return acc;
    },
    { SUPERADMIN: 0, ADMIN: 0, PSYCHOLOGIST: 0, CLIENT: 0 }
  );

  const creatableRoles = isSuperadminRole(actor.role) ? ROLES : (["CLIENT"] as Role[]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          Manajemen Akses
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
          Akun pengguna
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          {isSuperadminRole(actor.role)
            ? "Super Admin dapat membuat, mengedit, dan menghapus semua jenis akun."
            : "Admin dapat membuat akun klien. Akun psikolog hanya dapat dibuat oleh Super Admin."}
        </p>
      </div>

      {ok && (
        <p className="rounded-xl bg-brand-mint px-4 py-3 text-[11px] font-medium text-brand-dark">
          ✓ {ok}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLES.map((role) => (
          <div key={role} className="rounded-2xl border border-line bg-white p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mint text-brand-dark">
              <Users className="h-3.5 w-3.5" />
            </span>
            <p className="mt-2.5 font-serif text-xl font-semibold text-brand-deep">
              {counts[role]}
            </p>
            <p className="text-[10px] font-medium text-ink/70">{ROLE_LABEL[role]}</p>
            <p className="text-[9px] leading-snug text-muted">{ROLE_DESCRIPTION[role]}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <div className="rounded-3xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line p-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-brand-deep">
                Daftar akun
              </h2>
              <p className="text-[10px] text-muted">{users.length} akun terdaftar</p>
            </div>
            <UserCog className="h-4 w-4 text-brand/50" />
          </div>

          <div className="divide-y divide-line">
            {users.map((user) => {
              const role = user.role as Role;
              const canDelete = isSuperadminRole(actor.role) && user.id !== actor.id;
              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 p-4 transition hover:bg-surface/40 sm:flex-row sm:items-center"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-[11px] font-bold text-brand-dark">
                    {user.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[12px] font-semibold text-ink">
                        {user.name}
                      </p>
                      <span className={`chip ring-1 ${ROLE_TONE[role] ?? ROLE_TONE.CLIENT}`}>
                        {ROLE_LABEL[role] ?? user.role}
                      </span>
                      {user.id === actor.id && (
                        <span className="chip bg-amber-50 text-[8px] text-amber-700 ring-1 ring-amber-200">
                          akun Anda
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9.5px] text-muted">
                      <span className="flex items-center gap-1">
                        <Mail className="h-2.5 w-2.5" /> {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" /> {user.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-2.5 w-2.5" /> {formatDate(user.createdAt)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[9px] text-muted">
                      {user._count.bookings} booking · {user._count.results} hasil asesmen
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isSuperadminRole(actor.role) && (
                      <Link
                        href={`/admin/akun/${user.id}`}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[9.5px] font-semibold text-ink/70 transition hover:border-brand/30 hover:text-brand-dark"
                        aria-label={`Edit ${user.name}`}
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Link>
                    )}
                    {canDelete && (
                      <form action={deleteAccountAction}>
                        <input type="hidden" name="id" value={user.id} />
                        <button
                          type="submit"
                          className="flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 text-[9.5px] font-semibold text-rose-600 transition hover:bg-rose-50"
                          aria-label={`Hapus ${user.name}`}
                        >
                          <Trash2 className="h-3 w-3" /> Hapus
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <p className="p-8 text-center text-[11px] text-muted">
                Belum ada akun. Buat akun pertama di formulir samping.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-deep">
              <Plus className="h-4 w-4 text-brand" /> Buat akun baru
            </h2>
            <p className="mt-1 text-[10px] leading-relaxed text-muted">
              {isSuperadminRole(actor.role)
                ? "Pilih jenis akun. Akun psikolog hanya bisa dibuat oleh Super Admin."
                : "Admin dapat membuat akun klien. Hubungi Super Admin untuk akun psikolog."}
            </p>

            <form action={createAccountAction} className="mt-4 space-y-3">
              <div>
                <label htmlFor="account-name" className="label">
                  Nama lengkap
                </label>
                <input
                  id="account-name"
                  name="name"
                  required
                  minLength={2}
                  placeholder="Nama pengguna"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="account-email" className="label">
                  Email
                </label>
                <input
                  id="account-email"
                  name="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="account-phone" className="label">
                  Nomor WhatsApp (opsional)
                </label>
                <input
                  id="account-phone"
                  name="phone"
                  placeholder="08xx xxxx xxxx"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="account-password" className="label">
                  Password awal
                </label>
                <input
                  id="account-password"
                  name="password"
                  type="text"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="field font-mono text-[11.5px]"
                />
              </div>
              <div>
                <label htmlFor="account-role" className="label">
                  Jenis akun
                </label>
                <select id="account-role" name="role" className="field" defaultValue="CLIENT">
                  {creatableRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABEL[role]}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary btn-sm w-full">
                <Plus className="h-3.5 w-3.5" /> Simpan akun
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4 text-[10px] leading-relaxed text-muted">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Hak akses
            </p>
            <ul className="mt-2 space-y-1.5">
              <li>
                <strong className="text-ink/80">Super Admin</strong> — semua fitur,
                termasuk membuat, mengedit, dan menghapus akun, artikel, gambar, serta
                soal asesmen.
              </li>
              <li>
                <strong className="text-ink/80">Admin</strong> — mengelola data psikolog
                dan membuat akun klien.
              </li>
              <li>
                <strong className="text-ink/80">Psikolog</strong> — hanya bisa dibuat
                Super Admin, akses admin console terbatas.
              </li>
              <li>
                <strong className="text-ink/80">Klien</strong> — portal klien untuk
                booking, tagihan, asesmen, dan mood.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
