import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  Quote,
  ShieldCheck,
  Star,
  Users,
  Video,
} from "lucide-react";
import { getPsychologistBySlug, getServices } from "@/lib/content";
import { formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const psychologist = await getPsychologistBySlug(slug);
  if (!psychologist) return { title: "Psikolog tidak ditemukan" };
  return {
    title: psychologist.name,
    description: psychologist.bio.slice(0, 160),
  };
}

export default async function PsychologistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const psychologist = await getPsychologistBySlug(slug);
  if (!psychologist || !psychologist.isActive) notFound();

  const services = (await getServices())
    .filter((service) => service.category === "Klinik")
    .slice(0, 3);

  const specialties = psychologist.specialties.split(",").map((s) => s.trim());

  return (
    <>
      <section className="relative overflow-hidden bg-brand-deep pb-12 pt-10 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, #7dd3fc 0, transparent 38%), radial-gradient(circle at 15% 80%, #0ea5e9 0, transparent 42%)",
          }}
        />
        <div className="shell relative">
          <nav className="flex flex-wrap items-center gap-2 text-[11.5px] text-white/50">
            <Link href="/" className="hover:text-white">Beranda</Link>
            <span>/</span>
            <Link href="/klinik" className="hover:text-white">Klinik</Link>
            <span>/</span>
            <span className="text-white/80">{psychologist.name}</span>
          </nav>

          <div className="mt-7 grid items-center gap-8 lg:grid-cols-[1fr_360px] lg:gap-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
                <BadgeCheck className="h-3 w-3" /> Psikolog terverifikasi
              </span>
              <h1 className="mt-4 font-serif text-[34px] font-medium leading-[1.1] sm:text-[46px]">
                {psychologist.name}
              </h1>
              <p className="mt-1.5 text-[14px] text-brand-accent">{psychologist.title}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-[12px] text-white/60">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-brand-accent text-brand-accent" />
                  <strong className="text-white">{psychologist.rating}</strong>
                  ({psychologist.reviews} ulasan)
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {psychologist.experience} tahun pengalaman
                </span>
                {psychologist.education && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" /> {psychologist.education}
                  </span>
                )}
              </div>

              <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-white/70">
                {psychologist.bio}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/80"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/klinik/konseling-premium?psikolog=${psychologist.slug}`}
                  className="btn-accent"
                >
                  <CalendarDays className="h-4 w-4" /> Buat janji dengan {psychologist.name.split(" ")[0]}
                </Link>
                <Link
                  href="/klinik"
                  className="btn border border-white/20 text-white hover:bg-white/10"
                >
                  Lihat layanan lain
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[340px]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] border border-white/10">
                <Image
                  src={psychologist.photo}
                  alt={psychologist.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 340px"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 left-4 right-4 rounded-2xl bg-white p-3.5 text-ink shadow-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted">Mulai dari</p>
                    <p className="font-serif text-lg font-semibold text-brand-deep">
                      {formatIDR(psychologist.price)}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-brand-mint px-2.5 py-1 text-[10px] font-semibold text-brand">
                    <Video className="h-3 w-3" /> Online / offline
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-14">
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-brand-deep">
                Pendekatan &amp; keahlian
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                {psychologist.bio}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Award,
                    title: "Pendekatan terstruktur",
                    desc: "CBT, ACT, dan teknik berbasis bukti yang disesuaikan dengan kebutuhan Anda.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Ruang aman & rahasia",
                    desc: "Kerahasiaan penuh sesuai kode etik psikologi Indonesia.",
                  },
                  {
                    icon: Users,
                    title: "Kolaboratif",
                    desc: "Anda adalah mitra dalam menyusun tujuan dan langkah terapi.",
                  },
                  {
                    icon: BadgeCheck,
                    title: "Terverifikasi",
                    desc: "Lisensi praktik aktif dan supervisi berkala.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-line p-4">
                    <item.icon className="h-4 w-4 text-brand" />
                    <p className="mt-2 text-[12.5px] font-semibold text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-brand-mint/50 p-6">
              <Quote className="h-7 w-7 text-brand/40" />
              <p className="mt-3 font-serif text-[19px] leading-relaxed text-brand-deep">
                “Tujuan terapi bukan membuat Anda menjadi orang lain, melainkan
                membantu Anda mengenali dan merawat diri sendiri dengan lebih baik.”
              </p>
              <p className="mt-3 text-[11.5px] font-semibold text-brand">
                — {psychologist.name}
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold text-brand-deep">
                Layanan yang tersedia
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/klinik/${service.slug}?psikolog=${psychologist.slug}`}
                    className="group rounded-2xl border border-line p-4 transition hover:border-brand/30 hover:shadow-soft"
                  >
                    <p className="text-[12.5px] font-semibold text-brand-deep">
                      {service.name}
                    </p>
                    <p className="mt-1 text-[10.5px] text-muted">{service.duration} menit</p>
                    <p className="mt-2 flex items-center justify-between text-[10.5px] font-semibold text-brand">
                      {formatIDR(service.price)}
                      <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside>
            <div className="sticky top-[92px] rounded-3xl border border-line bg-white p-5 shadow-soft">
              <h3 className="font-serif text-lg font-semibold text-brand-deep">
                Jadwal praktik
              </h3>
              <div className="mt-3 divide-y divide-line text-[11.5px]">
                {[
                  ["Senin", "09.00 – 15.00"],
                  ["Rabu", "13.00 – 19.00"],
                  ["Jumat", "09.00 – 13.00"],
                  ["Sabtu", "10.00 – 14.00"],
                ].map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between py-2">
                    <span className="text-muted">{day}</span>
                    <span className="font-medium text-ink">{hours}</span>
                  </div>
                ))}
              </div>
              <Link
                href={`/klinik/konseling-premium?psikolog=${psychologist.slug}`}
                className="btn-primary mt-4 w-full"
              >
                Pilih jadwal <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-2 text-center text-[10px] text-muted">
                Jadwal aktual ditampilkan saat memilih sesi.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
