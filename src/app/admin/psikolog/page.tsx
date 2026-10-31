import Image from "next/image";
import {
  BadgeCheck,
  KeyRound,
  Mail,
  Plus,
  Save,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatIDR } from "@/lib/utils";
import { isSuperadminRole } from "@/lib/roles";
import {
  createPsychologistAction,
  togglePsychologistAction,
  updatePsychologistAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminPsikologPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const actor = await requireAdmin();
  const isSuperadmin = isSuperadminRole(actor.role);
  const { ok, error } = await searchParams;

  const psychologists = await db.psychologist.findMany({
    include: {
      user: { select: { email: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            Tim Klinis
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-brand-deep">
            Manajemen psikolog
          </h1>
          <p className="mt-1 text-[12px] text-muted">
            {psychologists.length} psikolog terdaftar ·{" "}
            {psychologists.filter((p) => p.isActive).length} aktif ·{" "}
            {psychologists.filter((p) => p.user).length} memiliki akun login
          </p>
        </div>
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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {psychologists.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface">
                <Image src={p.photo} alt={p.name} fill sizes="56px" className="object-cover" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[12px] font-semibold text-ink">{p.name}</p>
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-brand" />
                </div>
                <p className="truncate text-[10px] text-brand">{p.title}</p>
                <p className="mt-0.5 flex items-center gap-2 text-[9.5px] text-muted">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-[#e0a92e] text-[#e0a92e]" />
                    {p.rating}
                  </span>
                  <span>·</span>
                  <span>{p.experience} th</span>
                  <span>·</span>
                  <span>{p._count.bookings} booking</span>
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {p.specialties.split(",").slice(0, 3).map((s) => (
                <span key={s} className="chip bg-brand-mint/70 text-brand-dark">
                  {s.trim()}
                </span>
              ))}
            </div>

            <div className="mt-3 rounded-xl bg-surface/60 px-2.5 py-2 text-[9.5px] text-muted">
              {p.user ? (
                <span className="flex items-center gap-1.5">
                  <UserCheck className="h-3 w-3 text-brand" />
                  <span className="truncate">Akun: {p.user.email}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  Belum memiliki akun login
                </span>
              )}
            </div>

            <div className="mt-3 border-t border-line pt-3">
              {isSuperadmin ? (
                <form
                  action={updatePsychologistAction}
                  className="flex items-end gap-2"
                >
                  <input type="hidden" name="id" value={p.id} />
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`price-${p.id}`}
                      className="text-[9px] font-semibold uppercase tracking-wide text-muted"
                    >
                      Harga per sesi
                    </label>
                    <input
                      id={`price-${p.id}`}
                      name="price"
                      type="number"
                      min={0}
                      step={25000}
                      required
                      defaultValue={p.price}
                      className="field mt-1 py-1.5 text-[11px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex h-[34px] items-center gap-1 rounded-lg bg-brand-mint px-2.5 text-[9.5px] font-semibold text-brand-dark transition hover:bg-brand hover:text-white"
                  >
                    <Save className="h-3 w-3" /> Simpan
                  </button>
                </form>
              ) : (
                <p className="text-[10.5px] font-semibold text-brand-dark">
                  {formatIDR(p.price)}
                </p>
              )}

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[9.5px] text-muted">
                  {isSuperadmin ? formatIDR(p.price) : "Harga aktif"}
                </span>
                <form action={togglePsychologistAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ring-1 transition ${
                      p.isActive
                        ? "bg-brand-mint text-brand ring-brand/20 hover:bg-brand hover:text-white"
                        : "bg-surface text-muted ring-line hover:text-ink"
                    }`}
                  >
                    {p.isActive ? "Aktif" : "Nonaktif"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isSuperadmin ? (
        <details className="group rounded-2xl border border-line bg-white">
          <summary className="flex cursor-pointer items-center justify-between p-5 text-[12px] font-semibold text-brand-deep">
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Tambah psikolog baru + akun login
            </span>
            <span className="text-[10px] text-muted group-open:hidden">
              klik untuk membuka
            </span>
          </summary>

          <form action={createPsychologistAction} className="border-t border-line p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="psy-name" className="label">Nama lengkap &amp; gelar</label>
                <input id="psy-name" name="name" required placeholder="Nama, M.Psi" className="field" />
              </div>
              <div>
                <label htmlFor="psy-title" className="label">Spesialisasi jabatan</label>
                <input id="psy-title" name="title" required placeholder="Psikolog Klinis Dewasa" className="field" />
              </div>
              <div>
                <label htmlFor="psy-specialties" className="label">Bidang (pisahkan koma)</label>
                <input id="psy-specialties" name="specialties" required placeholder="Kecemasan,Depresi" className="field" />
              </div>
              <div>
                <label htmlFor="psy-education" className="label">Pendidikan</label>
                <input id="psy-education" name="education" placeholder="Universitas Indonesia" className="field" />
              </div>
              <div>
                <label htmlFor="psy-price" className="label">Harga per sesi (Rp)</label>
                <input id="psy-price" name="price" type="number" min={50000} step={25000} required defaultValue={450000} className="field" />
              </div>
              <div>
                <label htmlFor="psy-exp" className="label">Pengalaman (tahun)</label>
                <input id="psy-exp" name="experience" type="number" min={1} max={50} defaultValue={5} className="field" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="psy-photo" className="label">URL foto (opsional)</label>
                <input id="psy-photo" name="photo" placeholder="https://..." className="field" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="psy-bio" className="label">Bio singkat</label>
                <textarea id="psy-bio" name="bio" required rows={3} placeholder="Pendekatan dan pengalaman..." className="field resize-none" />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-brand/15 bg-brand-mint/40 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-deep">
                <KeyRound className="h-3.5 w-3.5" /> Akun login psikolog
              </p>
              <p className="mt-0.5 text-[9.5px] text-muted">
                Akun ini otomatis dibuat dan hanya dapat melihat data miliknya
                sendiri.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="psy-email" className="label">Email login</label>
                  <input id="psy-email" name="email" type="email" required placeholder="psikolog@konselingtrenggalek.id" className="field" />
                </div>
                <div>
                  <label htmlFor="psy-password" className="label">Password awal</label>
                  <input id="psy-password" name="password" type="text" minLength={6} required placeholder="Minimal 6 karakter" className="field font-mono text-[11px]" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="psy-phone" className="label">Nomor WhatsApp akun (opsional)</label>
                  <input id="psy-phone" name="phone" placeholder="08xx xxxx xxxx" className="field" />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary btn-sm mt-4">
              <Plus className="h-3.5 w-3.5" /> Simpan psikolog &amp; buat akun
            </button>
          </form>
        </details>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-4 text-[10.5px] leading-relaxed text-muted">
          Penambahan psikolog dan perubahan harga hanya dapat dilakukan oleh Super
          Admin.
        </div>
      )}

      <div className="rounded-2xl border border-line bg-white p-4 text-[10.5px] leading-relaxed text-muted">
        <p className="flex items-center gap-1.5 font-semibold text-ink">
          <Users className="h-3.5 w-3.5 text-brand" /> Catatan
        </p>
        <p className="mt-1">
          Psikolog nonaktif tidak akan muncul pada halaman publik maupun pilihan
          booking. Setiap akun psikolog hanya melihat booking, pesan sesi, dan hasil
          asesmen klien yang terhubung dengan dirinya. Data booking lama tetap
          tersimpan.
        </p>
      </div>
    </div>
  );
}
