import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan layanan Konseling Trenggalek, termasuk aturan booking, pembayaran, dan batasan layanan.",
};

const SECTIONS = [
  {
    title: "1. Penerimaan syarat",
    body: "Dengan mengakses situs, membuat akun, atau memesan layanan Konseling Trenggalek, Anda menyatakan telah membaca, memahami, dan menyetujui syarat dan ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.",
  },
  {
    title: "2. Layanan yang disediakan",
    body: "Konseling Trenggalek menyediakan layanan konseling psikologi, asesmen psikologis, dan edukasi kesehatan mental. Seluruh layanan diberikan oleh psikolog berlisensi atau fasilitator yang kompeten di bidangnya. Asesmen mandiri di situs ini bersifat skrining awal dan bukan diagnosis klinis.",
  },
  {
    title: "3. Akun pengguna",
    body: "Anda bertanggung jawab menjaga kerahasiaan kredensial akun dan seluruh aktivitas yang terjadi di dalamnya. Data yang Anda berikan harus akurat dan terkini. Kami berhak menangguhkan akun yang terindikasi digunakan untuk aktivitas yang melanggar hukum atau merugikan pihak lain.",
  },
  {
    title: "4. Booking dan jadwal",
    body: "Permintaan booking akan dikonfirmasi oleh tim kami maksimal 1x24 jam pada hari kerja. Jadwal dianggap final setelah Anda menerima konfirmasi. Mohon hadir atau bergabung ke sesi online 5–10 menit sebelum waktu yang disepakati.",
  },
  {
    title: "5. Pembayaran",
    body: "Pembayaran dilakukan melalui invoice yang diterbitkan pada Portal Klien. Layanan diproses setelah pembayaran terverifikasi. Harga yang tertera dalam Rupiah dan dapat berubah sewaktu-waktu, namun perubahan tidak berlaku pada booking yang telah dikonfirmasi.",
  },
  {
    title: "6. Pembatalan dan reschedule",
    body: "Reschedule gratis dapat dilakukan hingga 24 jam sebelum sesi. Pembatalan kurang dari 24 jam dikenakan biaya administrasi sebesar 25% dari harga layanan. Sesi yang tidak dihadiri tanpa pemberitahuan dianggap selesai dan tidak dapat dikembalikan pembayarannya.",
  },
  {
    title: "7. Batasan layanan",
    body: "Konseling Trenggalek tidak menyediakan layanan gawat darurat. Jika Anda atau orang di sekitar Anda berada dalam bahaya, segera hubungi layanan darurat 119 atau datang ke fasilitas kesehatan terdekat. Untuk situasi krisis, hubungi Into The Light Indonesia di 119 ext. 8.",
  },
  {
    title: "8. Kekayaan intelektual",
    body: "Seluruh konten di situs ini, termasuk artikel, materi asesmen, logo, dan desain, dilindungi hak cipta dan tidak boleh diperbanyak atau didistribusikan tanpa izin tertulis dari Konseling Trenggalek.",
  },
  {
    title: "9. Perubahan ketentuan",
    body: "Kami dapat memperbarui syarat dan ketentuan ini dari waktu ke waktu. Versi terbaru akan selalu tersedia di halaman ini dan berlaku efektif sejak dipublikasikan.",
  },
  {
    title: "10. Kontak",
    body: "Pertanyaan mengenai syarat dan ketentuan dapat dikirim ke rproselegends@gmail.com atau melalui halaman kontak. Kami akan merespons dalam 2 hari kerja.",
  },
];

export default function SyaratKetentuanPage() {
  return (
    <>
      <section className="border-b border-line bg-brand-mint/50 pb-12 pt-12">
        <div className="shell">
          <nav className="flex items-center gap-2 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-brand">Beranda</Link>
            <span>/</span>
            <span className="text-brand-dark">Syarat &amp; Ketentuan</span>
          </nav>

          <div className="mt-8 max-w-3xl">
            <span className="eyebrow">
              <FileText className="h-3.5 w-3.5" /> Legal
            </span>
            <h1 className="mt-4 text-[34px] font-medium leading-[1.1] tracking-[-0.02em] text-brand-deep sm:text-[46px]">
              Syarat &amp; Ketentuan
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              Aturan yang mengatur penggunaan situs, portal klien, dan layanan
              psikologi Konseling Trenggalek.
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
              <div className="sticky top-[100px] rounded-2xl border border-line p-4">
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
            </aside>

            <article className="prose-wc max-w-none">
              <p className="text-[13.5px] leading-[1.9] text-ink/75">
                Selamat datang di Konseling Trenggalek. Kami berkomitmen menyediakan layanan
                kesehatan mental yang aman, profesional, dan menghormati martabat
                setiap individu. Ketentuan berikut menjelaskan hak dan kewajiban
                Anda maupun kami.
              </p>

              {SECTIONS.map((section) => (
                <section key={section.title} id={section.title.toLowerCase().replace(/\s+/g, "-")}>
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
                  Dengan menggunakan layanan kami, Anda memahami bahwa konseling
                  bukan pengganti layanan medis darurat dan hasilnya bergantung pada
                  keterlibatan aktif Anda dalam proses terapi.
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
