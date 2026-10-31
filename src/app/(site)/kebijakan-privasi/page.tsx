import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Bagaimana Konseling Trenggalek mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi serta data kesehatan mental Anda.",
};

const SECTIONS = [
  {
    title: "1. Data yang kami kumpulkan",
    body: "Kami mengumpulkan data identitas (nama, email, nomor telepon), data booking dan pembayaran, jawaban asesmen, catatan mood, serta pesan yang Anda kirim melalui formulir kontak. Kami tidak meminta data sensitif yang tidak relevan dengan layanan.",
  },
  {
    title: "2. Dasar dan tujuan pemrosesan",
    body: "Data diproses untuk menyelenggarakan layanan yang Anda minta, mengonfirmasi jadwal, menerbitkan invoice, mengirim notifikasi, meningkatkan kualitas layanan, dan memenuhi kewajiban hukum. Data kesehatan hanya digunakan oleh psikolog yang menangani Anda.",
  },
  {
    title: "3. Kerahasiaan sesi",
    body: "Seluruh isi sesi konseling bersifat rahasia. Informasi hanya dapat diungkapkan dengan persetujuan tertulis Anda, atau bila diwajibkan hukum, terdapat risiko serius terhadap keselamatan Anda/orang lain, atau menyangkut kekerasan terhadap anak.",
  },
  {
    title: "4. Penyimpanan dan keamanan",
    body: "Password disimpan dalam bentuk hash bcrypt dan tidak pernah dalam bentuk teks asli. Sesi autentikasi menggunakan cookie httpOnly bertanda tangan JWT. Akses ke database dibatasi pada personel yang membutuhkan, dan data disimpan pada infrastruktur yang dikelola dengan kontrol akses.",
  },
  {
    title: "5. Berbagi data dengan pihak ketiga",
    body: "Kami dapat menggunakan penyedia layanan tepercaya untuk pengiriman email (Resend), pembayaran (Midtrans), dan hosting. Mereka hanya menerima data yang diperlukan untuk menjalankan fungsinya dan terikat kewajiban kerahasiaan. Kami tidak menjual data Anda.",
  },
  {
    title: "6. Cookie dan analitik",
    body: "Kami menggunakan cookie yang diperlukan untuk menjaga sesi login dan preferensi portal. Kami tidak menggunakan cookie iklan pihak ketiga. Anda dapat menghapus cookie melalui pengaturan peramban, namun beberapa fitur portal mungkin tidak berfungsi.",
  },
  {
    title: "7. Hak Anda",
    body: "Anda berhak mengakses, memperbaiki, atau meminta penghapusan data pribadi Anda, serta menarik persetujuan pemrosesan. Permintaan dapat dikirim ke rproselegends@gmail.com dan akan diproses dalam 14 hari kerja, dengan catatan kewajiban retensi tertentu tetap berlaku.",
  },
  {
    title: "8. Retensi data",
    body: "Data akun dan riwayat layanan disimpan selama akun aktif atau selama diperlukan untuk keperluan hukum dan akuntansi. Data asesmen anonim dapat disimpan untuk keperluan statistik agregat tanpa mengidentifikasi individu.",
  },
  {
    title: "9. Anak dan remaja",
    body: "Untuk pengguna di bawah 18 tahun, layanan memerlukan persetujuan orang tua atau wali. Kami berupaya menyesuaikan komunikasi dan proses terapi dengan kebutuhan perkembangan remaja.",
  },
  {
    title: "10. Perubahan kebijakan",
    body: "Kebijakan ini dapat diperbarui seiring perubahan layanan atau regulasi. Perubahan material akan diinformasikan melalui email atau pemberitahuan di portal. Versi terbaru selalu tersedia di halaman ini.",
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <>
      <section className="border-b border-line bg-brand-mint/50 pb-12 pt-12">
        <div className="shell">
          <nav className="flex items-center gap-2 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-brand">Beranda</Link>
            <span>/</span>
            <span className="text-brand-dark">Kebijakan Privasi</span>
          </nav>

          <div className="mt-8 max-w-3xl">
            <span className="eyebrow">
              <Lock className="h-3.5 w-3.5" /> Privasi
            </span>
            <h1 className="mt-4 text-[34px] font-medium leading-[1.1] tracking-[-0.02em] text-brand-deep sm:text-[46px]">
              Kebijakan Privasi
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              Kami memperlakukan data kesehatan mental Anda sebagai informasi paling
              sensitif. Halaman ini menjelaskan bagaimana data tersebut dijaga.
            </p>
            <p className="mt-3 text-[11px] text-muted">
              Terakhir diperbarui: 1 Oktober 2026
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="shell">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-[100px] space-y-4">
                <div className="rounded-2xl border border-line p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Daftar isi
                  </p>
                  <ul className="mt-3 space-y-2">
                    {SECTIONS.map((section) => (
                      <li key={section.title} className="text-[11px] leading-snug text-ink/65">
                        {section.title}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-brand-deep p-4 text-white">
                  <ShieldCheck className="h-5 w-5 text-brand-accent" />
                  <p className="mt-2 font-serif text-[16px] leading-snug">
                    Data Anda, kendali Anda
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-white/60">
                    Ajukan akses atau penghapusan data kapan pun melalui tim kami.
                  </p>
                </div>
              </div>
            </aside>

            <article className="prose-wc max-w-none">
              <p className="text-[13.5px] leading-[1.9] text-ink/75">
                Konseling Trenggalek berkomitmen melindungi privasi setiap pengguna. Kebijakan
                ini berlaku untuk situs, Portal Klien, formulir asesmen, dan seluruh
                kanal komunikasi resmi kami.
              </p>

              {SECTIONS.map((section) => (
                <section key={section.title}>
                  <h2 className="mt-8 font-serif text-[23px] font-semibold text-brand-deep">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-[13.5px] leading-[1.9] text-ink/75">
                    {section.body}
                  </p>
                </section>
              ))}

              <div className="mt-10 rounded-2xl bg-brand-mint/60 p-5">
                <p className="text-[12.5px] leading-relaxed text-ink/75">
                  Pertanyaan tentang privasi dapat dikirim ke{" "}
                  <a href="mailto:rproselegends@gmail.com" className="font-semibold text-brand-dark underline">
                    rproselegends@gmail.com
                  </a>
                  . Kami akan membantu Anda memahami atau mengelola data pribadi Anda.
                </p>
              </div>

              <Link
                href="/"
                className="mt-8 inline-flex items-center gap-2 text-[12px] font-semibold text-brand-dark hover:gap-3"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
              </Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
