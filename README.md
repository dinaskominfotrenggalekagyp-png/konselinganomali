# Konseling Trenggalek — Platform Psikologi & Kesehatan Mental

Aplikasi fullstack untuk **Konseling Trenggalek**: situs publik yang hangat dan editorial, Portal Klien untuk booking/asesmen/tagihan, serta Admin Console dengan notifikasi real-time. Semua data tersimpan di database dan integrasi email, pembayaran, WhatsApp, dan kalender sudah terhubung (dengan mode simulasi tanpa kredensial).

> 💡 Semua UI berbahasa Indonesia dengan palet **biru langit** (`#0369a1`, `#0ea5e9`, `#e0f2fe`, `#7dd3fc`) dan tipografi Noto Serif Display + Inter.

---

## ✨ Fitur utama

### Situs publik
- **Beranda** — hero dengan kartu gradient, kartu floating “Portal Klien”, statistik animasi, layanan, alur proses, fitur, testimoni carousel, harga bertab, artikel, form kontak, FAQ, dan footer gelap.
- **Klinik** — daftar layanan + halaman detail tiap layanan dengan profil psikolog dan form booking.
- **Psikolog** — halaman profil publik per psikolog.
- **Edukasi** — artikel dengan pencarian/filter kategori, halaman baca, share, related articles.
- **Psikotes** — daftar asesmen mandiri, runner interaktif, dan halaman hasil dengan rekomendasi.
- **Kontak** — form pesan yang masuk ke Admin Console, WhatsApp, peta.
- **Legal** — Syarat & Ketentuan dan Kebijakan Privasi.
- **404 kustom** dengan navigasi pemulihan.

### Autentikasi
- Registrasi & login dengan validasi Zod.
- Password di-hash **bcrypt**, sesi **JWT httpOnly** (`jose`) dalam cookie `wc_session`.
- Empat jenis akun: **Super Admin**, **Admin**, **Psikolog**, dan **Klien**.
- Proteksi server-side melalui `requireUser()`, `requireStaff()`, `requireAdmin()`, dan `requireSuperadmin()`.

### Portal Klien (`/portal`)
- Dashboard ringkasan sesi, mood, dan tagihan.
- Jadwal sesi: detail, unduh `.ics`, batalkan booking, link meeting.
- Riwayat asesmen dan hasilnya.
- Mood check-in harian + grafik 14 hari.
- Tagihan: daftar invoice, pembayaran (mock/Midtrans), invoice siap cetak.
- Profil & logout.

### Admin Console (`/admin`)
- Dashboard: pendapatan 7 hari, booking terbaru, layanan terpopuler, pesan, aktivitas.
- **Notifikasi real-time** — badge live, toast, suara, dan notifikasi browser saat ada booking/pesan baru (SSE, cek tiap 5 detik, halaman otomatis refresh).
- **Notifikasi admin otomatis** — setiap booking, pesan kontak, dan pembayaran baru dikirim ke WhatsApp admin `085335268258` dan inbox `rproselegends@gmail.com`.
- Booking: filter status, pencarian, pagination, ubah status & pembayaran, **export Excel**.
- Psikolog: daftar, aktif/nonaktif, tambah psikolog.
- Akun: Super Admin dapat membuat, mengedit (termasuk email & password), dan menghapus semua akun; Admin dapat membuat akun klien; akun psikolog hanya dibuat Super Admin.
- Artikel: daftar, filter terbit/draf, editor markdown ringan, unggah gambar cover, hapus (khusus Super Admin).
- Asesmen: statistik partisipasi, distribusi kategori, tren mood, tabel hasil terbaru, dan **pembuat soal psikotes** (khusus Super Admin).
- Pesan masuk: filter status, tandai dibaca/dibalas, balas via email/WhatsApp.
- Pengaturan: identitas situs, kontak, status integrasi, ringkasan data, akun demo, log email & WhatsApp.

### API
| Endpoint | Metode | Fungsi |
| --- | --- | --- |
| `/api/auth/register` | POST | Registrasi akun |
| `/api/auth/login` | POST | Login & set cookie |
| `/api/auth/logout` | POST | Hapus sesi |
| `/api/bookings` | POST/GET | Buat / ambil booking |
| `/api/bookings/[id]/cancel` | POST | Batalkan booking |
| `/api/admin/bookings/[id]` | PATCH | Ubah status booking (admin) |
| `/api/admin/bookings/export` | GET | Export booking ke Excel |
| `/api/admin/upload` | POST | Unggah gambar cover artikel (Super Admin) |
| `/api/assessments/[slug]/submit` | POST | Simpan hasil asesmen |
| `/api/mood` | POST | Simpan mood harian |
| `/api/payments/[id]/pay` | POST | Buat intent & tandai lunas |
| `/api/appointments/[id]/ics` | GET | Unduh kalender `.ics` |
| `/api/contact` | POST | Kirim pesan kontak + notifikasi admin |
| `/api/newsletter` | POST | Langganan newsletter |
| `/api/admin/live` | GET (SSE) | Stream notifikasi real-time admin |
| `/api/health` | GET | Health check database |

---

## 🧱 Stack

- **Next.js 15** (App Router, Server Components, Server Actions) + TypeScript
- **Tailwind CSS 3.4** dengan design token khusus
- **Prisma 6** + **MySQL / MariaDB** (database `koseling_tgx` di XAMPP)
- **Auth**: `jose` (JWT) + `bcryptjs`
- **Validasi**: `zod`
- **Ikon**: `lucide-react`
- **Integrasi**: Resend (email), Midtrans Snap (pembayaran), WhatsApp deep link, ekspor `.ics`

---

## 🚀 Menjalankan

Prasyarat: **Node.js 20+**, npm, dan **MySQL/MariaDB XAMPP** yang sedang berjalan (port 3306).

```bash
# 1. Install dependency
npm install

# 2. Buat database di MySQL (sekali saja, lewat phpMyAdmin atau CLI)
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE koseling_tgx CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Siapkan tabel + seed data demo
npm run setup

# 4. Jalankan development server
npm run dev
```

Buka <http://localhost:3000>.

> Sudah punya data di SQLite lama (`prisma/dev.db`)? Set `DATABASE_URL` ke MySQL, jalankan `npm run db:push`, lalu `npm run db:migrate:sqlite` untuk memindahkan seluruh isi database (skrip mencocokkan jumlah baris setiap tabel).

### Build produksi

```bash
npm run build
npm start
```

> Build membutuhkan akses internet karena `next/font/google` mengunduh font saat kompilasi.

### Script database

| Perintah | Fungsi |
| --- | --- |
| `npm run db:push` | Sinkronkan schema ke MySQL |
| `npm run db:seed` | Isi ulang data demo |
| `npm run db:reset` | Reset total + seed |
| `npm run db:migrate:sqlite` | Salin data dari `prisma/dev.db` (SQLite) ke MySQL |
| `npm run db:rebrand` | Perbarui data lama ke brand/warna baru tanpa menghapus data |
| `npm run setup` | generate + push + seed |

---

## 👤 Akun demo

| Peran | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@konselingtrenggalek.id` | `superadmin123` |
| Admin | `admin@konselingtrenggalek.id` | `admin123` |
| Psikolog | `psikolog@konselingtrenggalek.id` | `psikolog123` |
| Klien | `siti@example.com` | `client123` |

Super Admin, Admin, dan Psikolog diarahkan ke `/admin`, klien ke `/portal` setelah login.
Jalankan `npm run db:accounts` untuk memastikan akun staf di atas tersedia tanpa menghapus data.

---

## ⚙️ Environment variables

Salin contoh berikut ke `.env` (sudah tersedia untuk development):

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/koseling_tgx"
AUTH_SECRET="ganti-dengan-string-acak-panjang"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Pembayaran: mock | midtrans
PAYMENT_PROVIDER="mock"
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""

# Email admin & transaksional
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="rproselegends@gmail.com"
SMTP_PASS=""                     # Gmail App Password (16 karakter)
RESEND_API_KEY=""                # alternatif selain SMTP
EMAIL_FROM="Konseling Trenggalek <rproselegends@gmail.com>"

# Tujuan notifikasi admin
ADMIN_EMAIL="rproselegends@gmail.com"
ADMIN_WHATSAPP="085335268258"

# WhatsApp publik + gateway notifikasi
WHATSAPP_NUMBER="6285335268258"
FONNTE_TOKEN=""                  # opsi 1 (Fonnte)
WHATSAPP_CLOUD_TOKEN=""          # opsi 2 (Meta Cloud API)
WHATSAPP_CLOUD_PHONE_ID=""
CALLMEBOT_API_KEY=""             # opsi 3 (CallMeBot)

GOOGLE_MAPS_EMBED=""
```

### Perilaku integrasi

- **Email**: prioritas `RESEND_API_KEY`, lalu Gmail SMTP (`SMTP_USER` + `SMTP_PASS` App Password), lalu outbox database. Semua percobaan tercatat di tabel `EmailLog` dan Admin → Pengaturan.
- **WhatsApp admin**: prioritas `FONNTE_TOKEN`, lalu WhatsApp Cloud API (`WHATSAPP_CLOUD_TOKEN` + `WHATSAPP_CLOUD_PHONE_ID`), lalu `CALLMEBOT_API_KEY`. Tanpa kredensial, pesan masuk ke log (mode simulasi) dan tetap tampil di Admin → Pengaturan. Untuk pengiriman kapan saja, Fonnte atau CallMeBot paling mudah; WhatsApp Cloud API teks bebas dibatasi jendela 24 jam.
- **Notifikasi real-time**: halaman admin terhubung ke `/api/admin/live` (SSE). Booking/pesan baru memicu badge, toast, suara, dan refresh otomatis tanpa reload.
- **Pembayaran**: `PAYMENT_PROVIDER=mock` menyimulasikan pembayaran sukses. Isi `MIDTRANS_SERVER_KEY` dan set provider `midtrans` untuk membuat transaksi Snap (sandbox).
- **WhatsApp publik**: tombol follow-up memakai `wa.me` ke `WHATSAPP_NUMBER` dengan pesan yang sudah dipersonalisasi.
- **Kalender**: setiap booking dapat diunduh sebagai file `.ics` untuk Google Calendar / Apple Calendar.

---

## 🗃️ Model data

| Model | Kegunaan |
| --- | --- |
| `User` | Akun klien/admin, hash password, relasi booking, hasil, mood |
| `Psychologist` | Profil, spesialisasi, tarif, status aktif |
| `Service` | Layanan klinik/edukasi/psikotes |
| `Booking` | Jadwal sesi, mode online/offline, status, nominal |
| `Invoice` | Tagihan, status, provider, waktu bayar |
| `Article` | Konten edukasi, status terbit, views |
| `Assessment` | Definisi instrumen & konfigurasi scoring (JSON) |
| `AssessmentResult` | Jawaban, skor, kategori, ringkasan |
| `MoodEntry` | Check-in mood harian (unik per user per tanggal) |
| `ContactMessage` | Pesan dari form kontak |
| `Newsletter` | Email subscriber |
| `Testimonial` | Testimoni publik |
| `Faq` | Pertanyaan umum |
| `EmailLog` | Outbox/log pengiriman email |
| `ActivityLog` | Jejak aktivitas sistem & admin |
| `Setting` | Key-value pengaturan situs |

Skema lengkap: [`prisma/schema.prisma`](prisma/schema.prisma).

---

## 📁 Struktur proyek

```
prisma/
  schema.prisma        # Model database (provider: mysql)
  seed.ts              # Data demo lengkap
  migrate-sqlite-to-mysql.mjs  # Skrip migrasi data SQLite → MySQL
  dev.db               # SQLite lama (cadangan, tidak dipakai lagi)
src/
  app/
    (site)/            # Halaman publik + header/footer
    (auth)/            # Login & register
    admin/             # Admin console + server actions
    portal/            # Portal klien
    api/               # Route handlers
    layout.tsx         # Root layout + font
    not-found.tsx      # 404 kustom
  components/          # UI komponen (form, nav, carousel, dll.)
  lib/
    auth.ts            # Sesi, guard, hashing
    db.ts              # Prisma singleton
    integrations.ts    # Email, payment, ICS, activity log
    utils.ts           # Format, status, scoring
    validators.ts      # Skema Zod
```

---

## 🔐 Catatan keamanan

- Jangan commit `.env` produksi atau `AUTH_SECRET` asli.
- Ganti `AUTH_SECRET` dan kredensial demo sebelum deploy.
- Untuk produksi, gunakan user MySQL khusus (jangan `root` tanpa password) dan pertimbangkan PostgreSQL bila butuh replikasi/HA.
- Aplikasi ini adalah demonstrasi produk; kepatuhan penuh terhadap UU PDP memerlukan audit, DPA dengan vendor, dan prosedur operasional tambahan.

---

## 🧪 Alur uji cepat

1. Buka beranda → pilih layanan → isi booking → cek email masuk di Admin → Pengaturan.
2. Login sebagai klien → lihat jadwal & tagihan → bayar invoice → status berubah menjadi **Lunas**.
3. Kerjakan psikotes → lihat hasil → hasil muncul di Portal dan Admin → Asesmen.
4. Login admin → ubah status booking → tulis artikel → terbitkan → cek halaman `/edukasi`.
5. Kirim pesan dari `/kontak` → notifikasi masuk ke WhatsApp/email admin → balas dari Admin → Pesan.
6. Login admin → Pengaturan → **Kirim tes** untuk memverifikasi pipeline email + WhatsApp. Tanpa kredensial, pesan tercatat di log (mode simulasi).

---

Dibuat sebagai demonstrasi produk digital kesehatan mental: desain hangat, alur nyata, dan data yang benar-benar tersimpan.
