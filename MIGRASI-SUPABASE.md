# Migrasi MySQL → Supabase (PostgreSQL)

Panduan ini memindahkan **struktur database + seluruh data** dari MySQL/MariaDB
(XAMPP) ke Supabase, lalu menyiapkan deploy ke Vercel.

Project Supabase: `xbuorqobmmojqraqqosw` — region **eu-north-1 (Stockholm)**

---

## 0. Ringkasan keputusan

| Hal | Keputusan |
| --- | --- |
| ORM | **Tetap Prisma**. Hanya `provider` yang berubah `mysql` → `postgresql`. |
| Auth | Tetap JWT + bcrypt milik aplikasi (tidak pindah ke Supabase Auth). |
| Pooling | `DATABASE_URL` = Transaction Pooler (port 6543), `DIRECT_URL` = Session/Direct (port 5432). |
| Migration history | Pakai `prisma migrate` supaya Vercel bisa `prisma migrate deploy`. |

### Apakah butuh Prisma?

Butuh, kalau tidak mau menulis ulang seluruh aplikasi. Kode kamu memakai Prisma
di ±50 file. Supabase pada dasarnya adalah PostgreSQL + PostgREST + Auth + Storage;
Prisma berbicara langsung ke PostgreSQL, jadi **Prisma tetap bekerja penuh di
Supabase**. Yang berubah hanya connection string dan provider.

Alternatif `supabase-js` hanya masuk akal jika kamu ingin memakai Supabase Auth,
Realtime, dan Storage sekaligus — itu berarti refactor besar dan tidak perlu
dilakukan sekarang. Keduanya juga bisa dipakai bersamaan nanti (Prisma untuk
query, `@supabase/supabase-js` untuk upload file ke Storage).

---

## 1. Ambil connection string dari Supabase

Supabase Dashboard → **Project Settings** → **Database** → **Connection string**.

Untuk project ini region-nya **eu-north-1**, jadi host pooler-nya:

```
aws-0-eu-north-1.pooler.supabase.com
```

### Transaction pooler (port 6543) → untuk `DATABASE_URL`

Dipakai runtime aplikasi & Vercel (serverless). Wajib `pgbouncer=true`.

```
postgresql://postgres.xbuorqobmmojqraqqosw:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Session pooler (port 5432) → untuk `DIRECT_URL`

Dipakai `prisma migrate`, `prisma db push`, dan seed.

```
postgresql://postgres.xbuorqobmmojqraqqosw:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
```

### Reset password

Kalau lupa password: **Project Settings → Database → Reset database password**.

---

## 2. Isi `.env`

```env
DATABASE_URL="postgresql://postgres.xbuorqobmmojqraqqosw:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xbuorqobmmojqraqqosw:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"

# Sumber data lama (hanya untuk skrip migrasi)
MYSQL_SOURCE_URL="mysql://root:@127.0.0.1:3306/koseling_tgx"
```

Pastikan MySQL XAMPP sedang jalan saat menjalankan migrasi data.

---

## 3. Buat struktur tabel di Supabase

```bash
npx prisma generate
npx prisma migrate dev --name init
```

`migrate dev` akan membuat folder `prisma/migrations/` (komit ke git) dan
menerapkan skema ke Supabase.

> Kalau ingin cepat tanpa migration history: `npx prisma db push`.
> Tapi untuk Vercel sebaiknya pakai `migrate`, karena build produksi tidak boleh
> mengubah skema.

---

## 4. Pindahkan data

```bash
# Uji dulu tanpa menulis apa pun
node prisma/migrate-mysql-to-supabase.mjs --dry-run

# Eksekusi
node prisma/migrate-mysql-to-supabase.mjs
```

Skrip akan:

1. Membaca semua tabel MySQL (read-only).
2. Mengosongkan tabel tujuan (aman diulang; lewati dengan `--no-reset`).
3. Menulis per tabel sesuai urutan dependensi FK.
4. Membandingkan jumlah baris MySQL vs Supabase dan menandai selisih.

Tabel yang dimigrasi: `User`, `Psychologist`, `Service`, `Booking`,
`SessionMessage`, `Invoice`, `Article`, `Assessment`, `AssessmentResult`,
`MoodEntry`, `ContactMessage`, `Newsletter`, `Testimonial`, `Faq`, `EmailLog`,
`ActivityLog`, `Setting`.

Password user **tidak perlu di-hash ulang** — `passwordHash` disalin apa adanya,
jadi login lama tetap bisa dipakai.

---

## 5. Amankan tabel dari akses publik (RLS)

Supabase otomatis mengekspos tabel `public` lewat REST API untuk role `anon`.
Karena auth aplikasi memakai JWT sendiri, tutup akses tersebut:

```bash
npm run db:rls
```

Ini mengaktifkan RLS di semua tabel dan mencabut privilege `anon` /
`authenticated`. Prisma tetap bisa menulis karena memakai role `postgres`
(owner tabel).

---

## 6. Deploy ke Vercel

### Environment Variables di Vercel

**Cara cepat:** di Vercel → **Project → Settings → Environment Variables → Import .env**,
lalu tempel isi file `vercel-env.txt` di root project (file ini sudah gitignored).

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Transaction pooler (6543) + `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Session pooler (5432) |
| `AUTH_SECRET` | string acak panjang (beda dari lokal) |
| `NEXT_PUBLIC_APP_URL` | `https://domain-kamu.vercel.app` |
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` (secret) |
| `SUPABASE_STORAGE_BUCKET` | `uploads` |
| sisanya | SMTP, WhatsApp, Midtrans, dsb. |

`DIRECT_URL` wajib ada karena `schema.prisma` memakai `directUrl`. Tanpa itu
`prisma migrate` gagal (walau `prisma generate` tetap jalan).

**Jangan** menambahkan `MYSQL_SOURCE_URL` di Vercel — itu hanya untuk migrasi lokal.

### Kenapa build bisa error "Environment variable not found: DATABASE_URL"

`.env` masuk `.gitignore`, jadi tidak ikut terkirim ke Vercel. Saat `next build`
mencoba prerender halaman yang membaca database, Prisma mencetak error tersebut.
Solusi: isi environment variables di atas. Sejak revisi ini, seluruh halaman yang
membaca DB sudah `force-dynamic` dan `getBranding()` punya fallback, jadi build
tidak lagi bergantung pada koneksi DB.

### Build

`package.json` sudah menjalankan `prisma generate && next build`, jadi tidak
perlu konfigurasi tambahan. `generator client` juga sudah memakai
`binaryTargets = ["native", "rhel-openssl-3.0.x"]` agar query engine tersedia di
runtime Amazon Linux milik Vercel.

### Terapkan migration ke production

Jalankan sekali dari lokal (dengan `DIRECT_URL` mengarah ke Supabase):

```bash
npx prisma migrate deploy
```

Jangan jalankan `prisma migrate deploy` di build command Vercel — beberapa build
paralel bisa saling bertabrakan. Jalankan manual atau lewat CI.

### Supabase Storage (upload gambar)

Buat bucket **`uploads`** dan set **Public** di
**Storage → New bucket**, lalu isi `SUPABASE_SERVICE_ROLE_KEY` di Vercel.
`src/app/api/admin/upload/route.ts` otomatis memakai Storage bila kedua env var
tersedia, dan hanya menulis ke `public/uploads` saat development lokal.

---

## 7. Catatan penting untuk Vercel

1. **Upload file** — sudah ditangani: `src/app/api/admin/upload/route.ts` memakai
   Supabase Storage (`uploads` bucket). Tanpa `SUPABASE_SERVICE_ROLE_KEY`, upload
   akan error 500 di produksi (fallback disk hanya aktif saat development).
2. **Pooler wajib Transaction (6543)** — serverless Vercel menyalakan banyak
   instance. Session Pooler dibatasi ~15 klien, sehingga pernah memicu
   `EMAXCONNSESSION: max clients reached` dan seluruh query gagal. Karena itu
   runtime memakai Transaction Pooler yang memultipleks banyak klien.
3. **Driver adapter `pg`** — mesin query bawaan Prisma terukur ±1,4 detik per
   query di port 6543. Setelah `db.ts` memakai `@prisma/adapter-pg`, latensi
   turun ke ±0,35 detik pada koneksi yang sama. Batas koneksi per instance
   diatur lewat `max: 5`.
4. **Build tanpa database** — semua halaman yang membaca DB sudah
   `force-dynamic`, jadi build tidak butuh koneksi DB. Env var tetap wajib untuk
   runtime.
5. **Region** — project Supabase ada di `eu-north-1` (Stockholm), sedangkan
   pengunjung dan admin berada di Indonesia. Karena itu `vercel.json` mengunci
   region function ke **`sin1` (Singapura)**: jarak ke pengunjung sangat dekat,
   dan query database yang tersisa sudah ditekan oleh cache. Kalau suatu saat
   data menjadi sangat sering berubah (cache jarang dipakai), region `arn1`
   (Stockholm) bisa dipertimbangkan agar query langsung ke database ~0 ms.
6. **`prisma generate`** — sudah ada di build script, tidak perlu `postinstall`.

### 7.1 Optimasi performa yang sudah diterapkan

| Optimasi | Lokasi | Efek |
|---|---|---|
| Transaction Pooler + driver adapter `pg` | `src/lib/db.ts` | Stabil di serverless; ±1,4 s → ±0,35 s per query |
| Cache data publik (TTL 15 menit + tag) | `src/lib/content.ts` | Perpindahan menu tidak lagi menunggu database |
| Cache pengaturan situs | `src/lib/settings.ts` | Layout tidak query `Setting` tiap request |
| Dedupe user per request | `src/lib/auth.ts` (`cache()`) | Layout + page cukup 1 query user |
| `after()` untuk hitungan views | `edukasi/[slug]/page.tsx` | Write tidak menahan response |
| Index filter/urutan | `prisma/migrations/*_add_query_indexes` | Filter `isActive`, `published`, dll. lebih murah |
| Health check 1 round trip | `api/health/route.ts` | 5 query → 1 query |

Invalidasi cache dilakukan otomatis lewat `revalidateTag()` di
`src/app/admin/actions.ts` (tag: `settings`, `psychologists`, `articles`,
`assessments`). Jadi setelah admin menyimpan perubahan, halaman publik langsung
memakai data baru tanpa menunggu TTL.


---

## 8. Rollback

Backup MySQL sudah tersimpan di `backup/koseling_tgx_<timestamp>.sql`.

```bash
# Kembalikan database MySQL lokal
C:\xampp\mysql\bin\mysql.exe -u root < backup\koseling_tgx_YYYYMMDD_HHMMSS.sql
```

Untuk kembali ke MySQL: ubah `provider` di `prisma/schema.prisma` menjadi
`mysql`, hapus `directUrl`, lalu `npx prisma generate`.

---

## 9. Checklist

- [ ] `.env` berisi `DATABASE_URL`, `DIRECT_URL`, `MYSQL_SOURCE_URL`
- [ ] `npx prisma migrate dev --name init` sukses
- [ ] `node prisma/migrate-mysql-to-supabase.mjs --dry-run` sesuai
- [ ] `node prisma/migrate-mysql-to-supabase.mjs` → semua tabel `OK`
- [ ] `npm run db:rls` sukses
- [ ] `npm run build` sukses
- [ ] Login akun lama berhasil
- [ ] Environment variables Vercel lengkap
- [ ] `npx prisma migrate deploy` diarahkan ke Supabase
