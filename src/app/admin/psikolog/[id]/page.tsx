import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  UserCog,
} from "lucide-react";
import { requireSuperadmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatIDR } from "@/lib/utils";
import {
  deletePsychologistAction,
  updatePsychologistDetailsAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditPsychologistPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireSuperadmin();

  const { id } = await params;
  const { ok, error } = await searchParams;

  const psychologist = await db.psychologist.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, phone: true } },
      _count: { select: { bookings: true } },
    },
  });

  if (!psychologist) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/psikolog"
        className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-muted transition hover:text-brand-dark"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke daftar psikolog
      </Link>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
          Tim Klinis
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
          Edit psikolog
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          Perbarui profil, harga, spesialisasi, dan akun login psikolog ini.
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
            <UserCog className="h-4 w-4 text-brand" /> Data psikolog
          </h2>
          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            Perubahan pada halaman publik psikolog berlaku langsung setelah
            disimpan.
          </p>

          <form action={updatePsychologistDetailsAction} className="mt-5 space-y-4">
            <input type="hidden" name="id" value={psychologist.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="psy-name" className="label">
                  Nama lengkap &amp; gelar
                </label>
                <input
                  id="psy-name"
                  name="name"
                  required
                  defaultValue={psychologist.name}
                  placeholder="Nama, M.Psi"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="psy-title" className="label">
                  Spesialisasi jabatan
                </label>
                <input
                  id="psy-title"
                  name="title"
                  required
                  defaultValue={psychologist.title}
                  placeholder="Psikolog Klinis Dewasa"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="psy-specialties" className="label">
                  Bidang (pisahkan koma)
                </label>
                <input
                  id="psy-specialties"
                  name="specialties"
                  required
                  defaultValue={psychologist.specialties}
                  placeholder="Kecemasan,Depresi"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="psy-education" className="label">
                  Pendidikan
                </label>
                <input
                  id="psy-education"
                  name="education"
                  defaultValue={psychologist.education ?? ""}
                  placeholder="Universitas Indonesia"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="psy-price" className="label">
                  Harga per sesi (Rp)
                </label>
                <input
                  id="psy-price"
                  name="price"
                  type="number"
                  min={0}
                  step={25000}
                  required
                  defaultValue={psychologist.price}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="psy-exp" className="label">
                  Pengalaman (tahun)
                </label>
                <input
                  id="psy-exp"
                  name="experience"
                  type="number"
                  min={0}
                  max={80}
                  required
                  defaultValue={psychologist.experience}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="psy-rating" className="label">
                  Rating (0—5)
                </label>
                <input
                  id="psy-rating"
                  name="rating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  required
                  defaultValue={psychologist.rating}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="psy-photo" className="label">
                  URL foto
                </label>
                <input
                  id="psy-photo"
                  name="photo"
                  defaultValue={psychologist.photo}
                  placeholder="https://..."
                  className="field"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="psy-bio" className="label">
                  Bio singkat
                </label>
                <textarea
                  id="psy-bio"
                  name="bio"
                  required
                  rows={4}
                  defaultValue={psychologist.bio}
                  placeholder="Pendekatan dan pengalaman..."
                  className="field resize-none"
                />
              </div>
            </div>

            <label
              htmlFor="psy-active"
              className="flex items-center gap-2 text-[11px] font-medium text-ink"
            >
              <input
                id="psy-active"
                name="isActive"
                type="checkbox"
                defaultChecked={psychologist.isActive}
                className="h-4 w-4 rounded border-line text-brand focus:ring-brand/30"
              />
              Psikolog aktif (tampil di halaman publik dan pilihan booking)
            </label>

            <div className="rounded-2xl border border-brand/15 bg-brand-mint/40 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-deep">
                <KeyRound className="h-3.5 w-3.5" /> Akun login psikolog
              </p>
              <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted">
                {psychologist.user
                  ? "Ubah email, nomor WhatsApp, atau password akun ini. Biarkan password kosong untuk mempertahankan password lama."
                  : "Psikolog ini belum memiliki akun login. Isi email dan password untuk membuatkan akun baru."}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="psy-email" className="label">
                    Email login
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                    <input
                      id="psy-email"
                      name="email"
                      type="email"
                      defaultValue={psychologist.user?.email ?? ""}
                      placeholder="psikolog@konselingtrenggalek.id"
                      className="field pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="psy-password" className="label">
                    Password baru
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                    <input
                      id="psy-password"
                      name="password"
                      type="text"
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Kosongkan jika tidak diubah"
                      className="field pl-9 font-mono text-[11.5px]"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="psy-phone" className="label">
                    Nomor WhatsApp akun (opsional)
                  </label>
                  <input
                    id="psy-phone"
                    name="phone"
                    defaultValue={psychologist.user?.phone ?? ""}
                    placeholder="08xx xxxx xxxx"
                    className="field"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <button type="submit" className="btn-primary btn-sm">
                <Save className="h-3.5 w-3.5" /> Simpan perubahan
              </button>
              <Link href="/admin/psikolog" className="btn-outline btn-sm">
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

            <div className="mt-4 flex items-center gap-3">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                <Image
                  src={psychologist.photo}
                  alt={psychologist.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">
                  {psychologist.name}
                </p>
                <p className="truncate text-[10px] text-brand">{psychologist.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-muted">
                  <Star className="h-2.5 w-2.5 fill-[#e0a92e] text-[#e0a92e]" />
                  {psychologist.rating} · {psychologist.experience} th ·{" "}
                  {psychologist._count.bookings} booking
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-[10.5px]">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Harga per sesi</dt>
                <dd className="text-right font-semibold text-ink">
                  {formatIDR(psychologist.price)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Status</dt>
                <dd className="text-right font-semibold text-ink">
                  {psychologist.isActive ? "Aktif" : "Nonaktif"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Akun login</dt>
                <dd className="break-all text-right font-medium text-ink">
                  {psychologist.user ? psychologist.user.email : "Belum ada"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Slug publik</dt>
                <dd className="text-right font-mono text-[9.5px] text-ink">
                  /klinik/psikolog/{psychologist.slug}
                </dd>
              </div>
            </dl>

            <div className="mt-5 space-y-2 border-t border-line pt-4">
              <p className="text-[10px] font-semibold text-ink">
                Hapus psikolog
              </p>
              <p className="text-[9.5px] leading-relaxed text-muted">
                Booking lama tetap tersimpan, hanya dilepas dari psikolog ini.
                {psychologist.user
                  ? " Akun login terkait juga akan dihapus."
                  : ""}
              </p>
              <form action={deletePsychologistAction}>
                <input type="hidden" name="id" value={psychologist.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[9.5px] font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-3 w-3" /> Hapus psikolog
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4 text-[10px] leading-relaxed text-muted">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Catatan
            </p>
            <p className="mt-1">
              Setiap akun psikolog hanya melihat booking, pesan sesi, dan hasil
              asesmen klien yang terhubung dengan dirinya sendiri.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
