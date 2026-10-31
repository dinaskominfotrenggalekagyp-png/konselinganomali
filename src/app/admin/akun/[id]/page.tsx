import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { requireSuperadmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  normalizeRole,
  ROLE_DESCRIPTION,
  ROLE_LABEL,
  ROLES,
} from "@/lib/roles";
import { updateAccountAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditAccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireSuperadmin();

  const { id } = await params;
  const { ok, error } = await searchParams;

  const [user, superadminCount] = await Promise.all([
    db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { bookings: true, results: true } },
      },
    }),
    db.user.count({ where: { role: "SUPERADMIN" } }),
  ]);

  if (!user) notFound();

  const role = normalizeRole(user.role);
  const isLastSuperadmin = role === "SUPERADMIN" && superadminCount <= 1;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/akun"
        className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-muted transition hover:text-brand-dark"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke daftar akun
      </Link>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          Manajemen Akses
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
          Edit akun
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          Perbarui nama, email, nomor WhatsApp, password, atau role akun ini.
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

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-3xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-deep">
            <UserCog className="h-4 w-4 text-brand" /> Data akun
          </h2>
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            Perubahan email dan password langsung berlaku untuk akun ini.
          </p>

          <form action={updateAccountAction} className="mt-5 space-y-4">
            <input type="hidden" name="id" value={user.id} />

            <div>
              <label htmlFor="edit-name" className="label">
                Nama lengkap
              </label>
              <input
                id="edit-name"
                name="name"
                required
                minLength={2}
                defaultValue={user.name}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="edit-email" className="label">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  required
                  defaultValue={user.email}
                  className="field pl-9"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-phone" className="label">
                Nomor WhatsApp (opsional)
              </label>
              <input
                id="edit-phone"
                name="phone"
                defaultValue={user.phone ?? ""}
                placeholder="08xx xxxx xxxx"
                className="field"
              />
            </div>

            <div>
              <label htmlFor="edit-password" className="label">
                Password baru
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  id="edit-password"
                  name="password"
                  type="text"
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  className="field pl-9 font-mono text-[11.5px]"
                />
              </div>
              <p className="mt-1 text-[9px] text-muted">
                Minimal 6 karakter. Biarkan kosong untuk mempertahankan password lama.
              </p>
            </div>

            <div>
              <label htmlFor="edit-role" className="label">
                Jenis akun
              </label>
              <select
                id="edit-role"
                name="role"
                defaultValue={role}
                className="field"
              >
                {ROLES.map((item) => (
                  <option key={item} value={item}>
                    {ROLE_LABEL[item]}
                  </option>
                ))}
              </select>
              {isLastSuperadmin && (
                <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[9.5px] leading-relaxed text-amber-700">
                  Ini satu-satunya Super Admin. Role tidak dapat diubah sampai ada
                  Super Admin lain.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <button type="submit" className="btn-primary btn-sm">
                <Save className="h-3.5 w-3.5" /> Simpan perubahan
              </button>
              <Link href="/admin/akun" className="btn-outline btn-sm">
                Batal
              </Link>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-deep">
              <ShieldCheck className="h-4 w-4 text-brand" /> Ringkasan
            </h2>

            <dl className="mt-4 space-y-3 text-[10.5px]">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Role saat ini</dt>
                <dd className="text-right font-semibold text-ink">{ROLE_LABEL[role]}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Email</dt>
                <dd className="break-all text-right font-medium text-ink">{user.email}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1 text-muted">
                  <CalendarDays className="h-3 w-3" /> Dibuat
                </dt>
                <dd className="text-right text-ink">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1 text-muted">
                  <ClipboardList className="h-3 w-3" /> Aktivitas
                </dt>
                <dd className="text-right text-ink">
                  {user._count.bookings} booking · {user._count.results} hasil
                </dd>
              </div>
            </dl>

            <p className="mt-4 rounded-xl bg-surface/70 p-3 text-[9.5px] leading-relaxed text-muted">
              {ROLE_DESCRIPTION[role]}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4 text-[10px] leading-relaxed text-muted">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Catatan keamanan
            </p>
            <p className="mt-2">
              Gunakan password yang kuat dan unik. Setelah email atau password diubah,
              pemilik akun harus memakai kredensial baru pada login berikutnya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
