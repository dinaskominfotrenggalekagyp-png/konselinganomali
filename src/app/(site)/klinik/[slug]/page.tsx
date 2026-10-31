import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { BookingForm } from "@/components/booking-form";
import { Reveal } from "@/components/reveal";
import { formatIDR, safeJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await db.service.findUnique({ where: { slug } });
  if (!service) return { title: "Layanan tidak ditemukan" };
  return {
    title: service.name,
    description: service.description.slice(0, 160),
  };
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ psikolog?: string }>;
}) {
  const { slug } = await params;
  const { psikolog } = await searchParams;

  const service = await db.service.findUnique({ where: { slug } });
  if (!service || !service.isActive) notFound();

  const [psychologists, user, related] = await Promise.all([
    db.psychologist.findMany({ where: { isActive: true }, orderBy: { reviews: "desc" } }),
    getCurrentUser(),
    db.service.findMany({
      where: { isActive: true, id: { not: service.id }, category: service.category },
      take: 3,
    }),
  ]);

  const highlights = safeJson<string[]>(service.highlights, []);
  const preselected = psychologists.find((p) => p.slug === psikolog);

  return (
    <>
      <section className="bg-brand-mint/50 pb-8 pt-8">
        <div className="shell">
          <nav className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-brand">Beranda</Link>
            <span>/</span>
            <Link href="/klinik" className="hover:text-brand">Klinik</Link>
            <span>/</span>
            <span className="text-brand-dark">{service.name}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="chip bg-white text-brand shadow-sm">
              <Sparkles className="h-3 w-3" /> {service.category.toUpperCase()}
            </span>
            <span className="chip bg-brand-accent/90 text-brand-deep">
              {service.tagline}
            </span>
            <span className="chip bg-white/70 text-muted">
              <Star className="h-3 w-3 fill-[#e0a92e] text-[#e0a92e]" /> 4.9 · 700+ sesi
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl text-[34px] font-medium leading-[1.1] tracking-[-0.02em] text-brand-deep sm:text-[46px]">
            {service.name}
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">
            {service.description}
          </p>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
          <div className="space-y-8">
            <Reveal>
              <div className="relative aspect-[16/9] overflow-hidden rounded-[26px] shadow-soft">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/40 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
                  <span className="chip bg-white/95 text-brand-dark backdrop-blur">
                    <Clock className="h-3 w-3" /> {service.duration} menit
                  </span>
                  <span className="chip bg-white/95 text-brand-dark backdrop-blur">
                    {service.category === "Klinik" ? (
                      <>
                        <Video className="h-3 w-3" /> Online / tatap muka
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3" /> Fleksibel
                      </>
                    )}
                  </span>
                  <span className="chip bg-white/95 text-brand-dark backdrop-blur">
                    <ShieldCheck className="h-3 w-3" /> Rahasia terjamin
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="grid gap-3 sm:grid-cols-2">
                {highlights.map((h) => (
                  <div
                    key={h}
                    className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface/50 p-4"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-mint text-brand">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-[12.5px] leading-relaxed text-ink/80">{h}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-7">
                <h2 className="font-serif text-2xl font-semibold text-brand-deep">
                  Apa yang terjadi di sesi?
                </h2>
                <div className="mt-5 space-y-4">
                  {[
                    {
                      title: "Pembukaan & penjajakan",
                      desc: "Psikolog membangun rasa aman, menjelaskan kerahasiaan, dan memahami tujuan Anda.",
                      time: "10 menit",
                    },
                    {
                      title: "Eksplorasi terarah",
                      desc: "Anda diajak memetakan pola pikir, emosi, dan kebutuhan dengan teknik yang sesuai.",
                      time: "35 menit",
                    },
                    {
                      title: "Rencana tindak lanjut",
                      desc: "Anda pulang dengan satu atau dua langkah konkret, serta rekomendasi sesi berikutnya.",
                      time: "15 menit",
                    },
                  ].map((step, i) => (
                    <div key={step.title} className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-mint text-[11px] font-semibold text-brand-dark">
                          {i + 1}
                        </span>
                        {i < 2 && <span className="mt-1 h-full w-px bg-line" />}
                      </div>
                      <div className="pb-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[13.5px] font-semibold text-ink">
                            {step.title}
                          </h3>
                          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted">
                            {step.time}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-brand-deep">
                    Psikolog yang tersedia
                  </h2>
                  <Link
                    href="/klinik"
                    className="text-[11.5px] font-semibold text-brand hover:underline"
                  >
                    Lihat semua
                  </Link>
                </div>
                <div className="mt-4 divide-y divide-line">
                  {psychologists.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-3">
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                        <Image src={p.photo} alt={p.name} fill sizes="44px" className="object-cover" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-ink">
                          {p.name}
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          {p.title} · {p.experience} tahun
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center justify-end gap-1 text-[11px] font-semibold text-ink">
                          <Star className="h-3 w-3 fill-[#e0a92e] text-[#e0a92e]" />
                          {p.rating}
                        </p>
                        <Link
                          href={`/klinik/${service.slug}?psikolog=${p.slug}`}
                          className="text-[10.5px] font-semibold text-brand hover:underline"
                        >
                          Pilih
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: BadgeCheck, title: "Psikolog berlisensi", desc: "Terverifikasi oleh HIMPSI" },
                  { icon: ShieldCheck, title: "Kerahasiaan", desc: "Kode etik & data terenkripsi" },
                  { icon: HeartHandshake, title: "Tanpa penghakiman", desc: "Ruang aman untuk Anda" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-surface p-4">
                    <item.icon className="h-5 w-5 text-brand" />
                    <p className="mt-2 text-[12px] font-semibold text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[10.5px] text-muted">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div>
            <div className="lg:sticky lg:top-[92px]">
              <BookingForm
                service={{
                  id: service.id,
                  name: service.name,
                  price: service.price,
                  duration: service.duration,
                  category: service.category,
                }}
                psychologists={psychologists.map((p) => ({
                  id: p.id,
                  name: p.name,
                  title: p.title,
                  specialties: p.specialties,
                  photo: p.photo,
                  rating: p.rating,
                  price: p.price,
                  experience: p.experience,
                }))}
                defaults={{
                  name: user?.name ?? "",
                  email: user?.email ?? "",
                  phone: user?.phone ?? "",
                }}
                isLoggedIn={Boolean(user)}
                defaultPsychologistId={preselected?.id ?? ""}
              />

              <div className="mt-4 rounded-2xl border border-line bg-surface/60 p-4 text-[11px] leading-relaxed text-muted">
                <p className="font-semibold text-ink">Butuh bantuan memesan?</p>
                <p className="mt-1">
                  Hubungi admin di{" "}
                  <a
                    href="https://wa.me/6285335268258"
                    className="font-semibold text-brand hover:underline"
                  >
                    WhatsApp
                  </a>{" "}
                  atau telepon{" "}
                  <a href="tel:+6285335268258" className="font-semibold text-brand hover:underline">
                    +62 853-3526-8258
                  </a>
                  . Tersedia Senin–Sabtu 08.00–21.00 WIB.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-surface/70 py-14">
          <div className="shell">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <span className="eyebrow">Layanan Terkait</span>
                <h2 className="mt-3 font-serif text-[28px] font-semibold text-brand-deep">
                  Mungkin juga relevan untuk Anda
                </h2>
              </div>
              <Link
                href="/klinik"
                className="hidden items-center gap-2 text-[12px] font-semibold text-brand-dark hover:gap-3 sm:flex"
              >
                Semua layanan <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/klinik/${item.slug}`}
                  className="group flex gap-3 rounded-2xl border border-line bg-white p-3 transition hover:border-brand/25 hover:shadow-soft"
                >
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </span>
                  <span className="flex min-w-0 flex-col justify-center">
                    <span className="text-[12.5px] font-semibold text-brand-deep">
                      {item.name}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-muted">
                      {item.tagline}
                    </span>
                    <span className="mt-1 text-[10.5px] font-semibold text-brand">
                      {formatIDR(item.price)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
