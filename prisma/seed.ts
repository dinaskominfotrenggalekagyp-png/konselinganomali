import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = {
  hero: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2000&auto=format&fit=crop",
  clinic: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=1400&auto=format&fit=crop",
  therapy:
    "https://images.unsplash.com/photo-1746513930405-005d20013dd6?w=900&h=1100&auto=format&fit=crop&q=80",
  education:
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
  psychTest:
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop",
  family:
    "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=1200&auto=format&fit=crop",
  teen: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
};

const scale = [
  { label: "Tidak pernah", value: 0 },
  { label: "Jarang", value: 1 },
  { label: "Kadang-kadang", value: 2 },
  { label: "Sering", value: 3 },
  { label: "Hampir selalu", value: 4 },
];

const stressQuestions = [
  "Saya merasa tegang dan sulit rileks meski sedang tidak bekerja.",
  "Saya sulit memulai tidur atau terbangun di malam hari karena pikiran yang berputar.",
  "Saya mudah tersinggung terhadap hal-hal kecil.",
  "Saya merasa kelelahan meskipun sudah cukup istirahat.",
  "Saya kesulitan berkonsentrasi saat membaca atau bekerja.",
  "Saya merasa beban hidup saya di luar kendali.",
  "Saya menghindari interaksi sosial karena merasa tidak punya energi.",
  "Saya mengalami keluhan fisik seperti sakit kepala, nyeri otot, atau gangguan pencernaan.",
  "Saya merasa cemas tentang hal-hal yang belum tentu terjadi.",
  "Saya sulit menemukan hal yang membuat saya merasa bersemangat.",
].map((text, i) => ({ id: `s${i + 1}`, text, options: scale }));

const anxietyQuestions = [
  "Saya merasa gugup, cemas, atau gelisah.",
  "Saya tidak mampu menghentikan atau mengendalikan rasa khawatir.",
  "Saya terlalu banyak mengkhawatirkan berbagai hal.",
  "Saya sulit untuk rileks.",
  "Saya sangat gelisah sehingga sulit duduk diam.",
  "Saya mudah menjadi kesal atau jengkel.",
  "Saya merasa takut seolah-olah akan terjadi sesuatu yang buruk.",
].map((text, i) => ({ id: `a${i + 1}`, text, options: scale.slice(0, 4) }));

const talentQuestions = [
  "Kegiatan apa yang paling membuat Anda lupa waktu?",
  "Saat menghadapi masalah, Anda cenderung...",
  "Lingkungan kerja seperti apa yang membuat Anda berkembang?",
  "Anda lebih menikmati pekerjaan yang...",
  "Ketika belajar hal baru, Anda paling cepat memahami lewat...",
  "Peran dalam tim yang paling natural untuk Anda adalah...",
  "Sumber energi Anda sebagian besar berasal dari...",
  "Pencapaian yang paling memuaskan bagi Anda adalah...",
].map((text, i) => ({
  id: `t${i + 1}`,
  text,
  options: [
    { label: "Menganalisis data & menemukan pola", value: 3 },
    { label: "Berinteraksi dan membantu orang lain", value: 2 },
    { label: "Menciptakan ide, karya, atau desain baru", value: 4 },
    { label: "Mengatur, memimpin, dan mengeksekusi rencana", value: 1 },
  ],
}));

async function main() {
  console.log("🌱 Seeding database Konseling Trenggalek...");

  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.moodEntry.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.psychologist.deleteMany();
  await prisma.service.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  const superadminPass = await bcrypt.hash("superadmin123", 10);
  const adminPass = await bcrypt.hash("admin123", 10);
  const psychologistPass = await bcrypt.hash("psikolog123", 10);
  const clientPass = await bcrypt.hash("client123", 10);

  const superadmin = await prisma.user.create({
    data: {
      name: "Super Admin Konseling Trenggalek",
      email: "superadmin@konselingtrenggalek.id",
      passwordHash: superadminPass,
      phone: "081200000001",
      role: "SUPERADMIN",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin Konseling Trenggalek",
      email: "admin@konselingtrenggalek.id",
      passwordHash: adminPass,
      phone: "081234567890",
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      name: "Dr. Anindya Prameswari, M.Psi",
      email: "psikolog@konselingtrenggalek.id",
      passwordHash: psychologistPass,
      phone: "081200000002",
      role: "PSYCHOLOGIST",
    },
  });

  const client = await prisma.user.create({
    data: {
      name: "Siti Rahmawati",
      email: "siti@example.com",
      passwordHash: clientPass,
      phone: "081298765432",
      role: "CLIENT",
    },
  });

  const psychologists = await Promise.all(
    [
      {
        name: "Dr. Anindya Prameswari, M.Psi",
        slug: "anindya-prameswari",
        title: "Psikolog Klinis Dewasa",
        specialties: "Kecemasan,Depresi,Manajemen Stres",
        bio: "Psikolog klinis dengan 12 tahun pengalaman mendampingi dewasa muda menghadapi kecemasan, burnout, dan transisi hidup. Pendekatan CBT dan ACT yang hangat serta terstruktur.",
        photo:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
        price: 450000,
        rating: 4.9,
        reviews: 214,
        experience: 12,
        education: "Universitas Indonesia",
      },
      {
        name: "Bagas Nurwidodo, M.Psi",
        slug: "bagas-nurwidodo",
        title: "Psikolog Klinis & Konselor Keluarga",
        specialties: "Relasi,Keluarga,Mediasi Konflik",
        bio: "Berfokus pada dinamika relasi, komunikasi pasangan, dan mediasi konflik keluarga. Percaya bahwa setiap konflik menyimpan peluang untuk tumbuh bersama.",
        photo:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop",
        price: 500000,
        rating: 4.8,
        reviews: 168,
        experience: 9,
        education: "Universitas Gadjah Mada",
      },
      {
        name: "Raras Ayu Kirana, M.Psi",
        slug: "raras-ayu-kirana",
        title: "Psikolog Anak & Remaja",
        specialties: "Anak,Remaja,Gaya Belajar",
        bio: "Mendampingi anak dan remaja menemukan kekuatan dirinya melalui asesmen minat bakat dan terapi bermain. Kolaboratif bersama orang tua dan sekolah.",
        photo:
          "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=800&auto=format&fit=crop",
        price: 425000,
        rating: 5.0,
        reviews: 189,
        experience: 8,
        education: "Universitas Airlangga",
      },
      {
        name: "Yudha Saputra, M.Psi",
        slug: "yudha-saputra",
        title: "Psikolog Industri & Organisasi",
        specialties: "Karier,Burnout,Asesmen Karier",
        bio: "Praktisi psikologi industri yang membantu individu dan organisasi membangun lingkungan kerja sehat, produktif, dan berkelanjutan.",
        photo:
          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
        price: 550000,
        rating: 4.9,
        reviews: 143,
        experience: 11,
        education: "Universitas Padjadjaran",
      },
    ].map((data) => prisma.psychologist.create({ data }))
  );

  const [klinik, premium, edukasi, psikotes, keluarga] = await Promise.all(
    [
      {
        name: "Konseling Individu",
        slug: "konseling-individu",
        category: "Klinik",
        tagline: "Ruang aman untuk dirimu",
        description:
          "Sesi 60 menit bersama psikolog klinis berlisensi untuk memahami emosi, mengurai beban, dan menyusun langkah konkret menuju kondisi yang lebih baik. Tersedia online maupun tatap muka.",
        price: 350000,
        duration: 60,
        image: IMG.clinic,
        icon: "heart",
        highlights: JSON.stringify([
          "Psikolog klinis berlisensi",
          "Sesi online / tatap muka",
          "Catatan sesi & rencana tindak lanjut",
          "Reschedule gratis 24 jam sebelumnya",
        ]),
        isFeatured: false,
      },
      {
        name: "Konseling Premium",
        slug: "konseling-premium",
        category: "Klinik",
        tagline: "Pendampingan psikologi profesional",
        description:
          "Sesi terapi tatap muka atau online dengan psikolog klinis senior. Nikmati layanan prioritas dengan waktu respons instan dan pendampingan intensif untuk kesehatan mental yang lebih baik.",
        price: 750000,
        duration: 90,
        image: IMG.therapy,
        icon: "sparkles",
        highlights: JSON.stringify([
          "Psikolog senior pilihan",
          "Respons prioritas < 2 jam",
          "Laporan perkembangan bulanan",
          "Akses jurnal wellness eksklusif",
        ]),
        isFeatured: true,
      },
      {
        name: "Edukasi & Workshop",
        slug: "edukasi-workshop",
        category: "Edukasi",
        tagline: "Tumbuh bersama komunitas",
        description:
          "Workshop dan webinar interaktif bersama komunitas yang suportif. Topik mulai dari manajemen stres, mindful parenting, hingga keterampilan komunikasi di tempat kerja.",
        price: 150000,
        duration: 120,
        image: IMG.education,
        icon: "book",
        highlights: JSON.stringify([
          "Kelas live interaktif",
          "Rekaman & modul digital",
          "Sertifikat kehadiran",
          "Grup diskusi komunitas",
        ]),
        isFeatured: false,
      },
      {
        name: "Layanan Psikotes",
        slug: "layanan-psikotes",
        category: "Psikotes",
        tagline: "Kenali potensi dirimu",
        description:
          "Asesmen formal untuk kebutuhan klinis, minat bakat, dan pemetaan potensi diri. Hasil dianalisis oleh psikolog dan disampaikan dalam laporan yang mudah dipahami.",
        price: 250000,
        duration: 45,
        image: IMG.psychTest,
        icon: "clipboard",
        highlights: JSON.stringify([
          "Instrumen terstandar",
          "Laporan interpretasi psikolog",
          "Sesi feedback 30 menit",
          "Rahasia & aman",
        ]),
        isFeatured: false,
      },
      {
        name: "Mediasi Relasi & Keluarga",
        slug: "mediasi-relasi",
        category: "Klinik",
        tagline: "Memulihkan komunikasi",
        description:
          "Pendampingan netral untuk pasangan, keluarga, atau rekan kerja yang ingin menyelesaikan konflik secara konstruktif dan menemukan kesepakatan bersama.",
        price: 600000,
        duration: 90,
        image: IMG.family,
        icon: "users",
        highlights: JSON.stringify([
          "Mediator bersertifikat",
          "Sesi bersama & individual",
          "Kesepakatan tertulis",
          "Follow-up 2 minggu",
        ]),
        isFeatured: false,
      },
    ].map((data) => prisma.service.create({ data }))
  );

  await prisma.article.createMany({
    data: [
      {
        title: "Mengenali Burnout Sebelum Ia Menguasai Hidup Anda",
        slug: "mengenali-burnout",
        category: "Mental Health",
        excerpt:
          "Burnout bukan sekadar lelah biasa. Kenali tiga dimensinya dan langkah kecil yang bisa Anda ambil minggu ini.",
        cover:
          "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1400&auto=format&fit=crop",
        author: "Dr. Anindya Prameswari",
        readMinutes: 6,
        views: 1284,
        content:
          "## Burnout bukan sekadar kelelahan\n\nBanyak orang menganggap burnout sebagai rasa lelah yang bisa disembuhkan dengan tidur panjang. Padahal, Organisasi Kesehatan Dunia mengategorikannya sebagai fenomena akibat stres kronis di tempat kerja yang belum berhasil dikelola.\n\n## Tiga dimensi yang perlu dikenali\n\n- **Kehabisan energi** — merasa kosong bahkan sebelum hari dimulai.\n- **Sikap sinis dan menjauh** — kehilangan antusiasme, mudah marah pada rekan kerja.\n- **Penurunan efikasi** — merasa tidak kompeten meski hasil kerja masih baik.\n\n## Langkah kecil yang bisa dimulai\n\n1. Catat pola energi Anda selama tujuh hari. Kapan energi paling rendah?\n2. Tetapkan satu batas yang jelas, misalnya tidak membuka email setelah pukul 20.00.\n3. Ceritakan pada satu orang yang aman dipercaya.\n4. Jika gejala berlangsung lebih dari dua minggu dan mengganggu fungsi, pertimbangkan pendampingan profesional.\n\nKesehatan mental bukan kemewahan. Ia fondasi dari kerja yang berkelanjutan.",
      },
      {
        title: "Teknik Pernapasan 4-7-8 untuk Meredakan Cemas",
        slug: "teknik-pernapasan-4-7-8",
        category: "Mindfulness",
        excerpt:
          "Latihan sederhana yang bisa dilakukan di mana saja ketika kecemasan datang tiba-tiba.",
        cover:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1400&auto=format&fit=crop",
        author: "Raras Ayu Kirana",
        readMinutes: 4,
        views: 942,
        content:
          "## Mengapa napas?\n\nNapas adalah satu-satunya fungsi otonom yang bisa kita kendalikan secara sadar. Saat cemas, napas menjadi pendek dan cepat. Dengan memperpanjang fase pengeluaran napas, sistem saraf parasimpatis aktif dan detak jantung melambat.\n\n## Cara melakukannya\n\n1. Duduk tegak, letakkan tangan di perut.\n2. Tarik napas melalui hidung selama 4 hitungan.\n3. Tahan napas 7 hitungan.\n4. Buang napas perlahan melalui mulut selama 8 hitungan.\n5. Ulangi 4 siklus.\n\nJika terasa pusing, kembalilah ke napas normal. Latihan ini bukan pengganti terapi, tetapi alat bantu regulasi yang praktis.",
      },
      {
        title: "Anak Tidak Mau Belajar? Mulai dari Gaya Belajarnya",
        slug: "gaya-belajar-anak",
        category: "Parenting",
        excerpt:
          "Setiap anak memiliki jalur masuk informasi yang berbeda. Memetakannya bisa mengubah cara belajar sepenuhnya.",
        cover:
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1400&auto=format&fit=crop",
        author: "Raras Ayu Kirana",
        readMinutes: 5,
        views: 761,
        content:
          "## Visual, auditori, kinestetik\n\nAnak visual belajar paling baik lewat gambar, diagram, dan warna. Anak auditori menyerap informasi melalui cerita, diskusi, dan irama. Anak kinestetik perlu bergerak dan menyentuh untuk memahami konsep.\n\n## Tiga langkah praktis\n\n- Amati tanpa menghakimi: aktivitas apa yang membuat anak bertahan lebih lama?\n- Kombinasikan, jangan kotakkan. Kebanyakan anak adalah campuran.\n- Ubah lingkungan, bukan anak. Sediakan alat bantu yang sesuai.\n\nAsesmen minat bakat dapat memberi peta awal, tetapi observasi harian tetap guru terbaik.",
      },
      {
        title: "Cara Membangun Budaya Kerja yang Aman Secara Psikologis",
        slug: "budaya-kerja-psikologis-aman",
        category: "Karier",
        excerpt:
          "Psychological safety adalah prediktor terkuat kinerja tim. Ini cara memulainya dari rapat terkecil.",
        cover:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop",
        author: "Yudha Saputra",
        readMinutes: 7,
        views: 1105,
        content:
          "## Bukan soal bebas konflik\n\nTim dengan psychological safety tinggi tetap berdebat. Bedanya, orang berani menyampaikan risiko tanpa takut dipermalukan.\n\n## Kebiasaan kecil yang berdampak\n\n- Mulai rapat dengan pertanyaan: apa yang menghambat pekerjaanmu minggu ini?\n- Akui kesalahan pemimpin lebih dulu.\n- Hargai pertanyaan bodoh, karena di situ inovasi dimulai.\n- Ukur secara berkala, jangan menebak.\n\nInvestasi pada kesehatan mental tim kembali dalam bentuk retensi, inovasi, dan kualitas keputusan.",
      },
      {
        title: "Mengelola Konflik Pasangan Tanpa Saling Melukai",
        slug: "mengelola-konflik-pasangan",
        category: "Relasi",
        excerpt:
          "Konflik tidak menghancurkan hubungan; cara kita menanganinya yang menentukan arah.",
        cover:
          "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1400&auto=format&fit=crop",
        author: "Bagas Nurwidodo",
        readMinutes: 5,
        views: 838,
        content:
          "## Empat penunggang kuda yang perlu diwaspadai\n\nKritik terhadap karakter, sikap defensif, penghindaran, dan stonewalling adalah pola yang paling merusak percakapan.\n\n## Ganti dengan ini\n\n- **Keluhan spesifik** alih-alih kritik: \"Saya butuh bantuan cucian\" bukan \"kamu tidak peduli\".\n- **Tanggung jawab sebagian** alih-alih defensif.\n- **Jeda 20 menit** saat emosi memuncak, lalu kembali.\n- **Validasi** sebelum menyelesaikan masalah.\n\nJika pola ini berulang dan menyakitkan, mediasi profesional dapat membantu membuka jalan.",
      },
    ],
  });

  await prisma.assessment.createMany({
    data: [
      {
        title: "Cek Tingkat Stres Anda",
        slug: "tingkat-stres",
        description:
          "Skrining mandiri 10 pertanyaan untuk melihat seberapa besar tekanan yang Anda rasakan dalam dua minggu terakhir. Bukan diagnosis klinis.",
        duration: 5,
        questions: JSON.stringify(stressQuestions),
        scoring: JSON.stringify({
          maxScore: 40,
          categories: [
            {
              max: 9,
              label: "Rendah",
              color: "#0ea5e9",
              summary:
                "Tingkat stres Anda relatif terkelola. Pertahankan rutinitas tidur, gerak tubuh, dan koneksi sosial yang saat ini membantu.",
            },
            {
              max: 19,
              label: "Sedang",
              color: "#b7791f",
              summary:
                "Ada tekanan yang mulai terasa. Coba jeda terstruktur, batasi paparan berita, dan pertimbangkan sesi konseling untuk strategi coping yang lebih personal.",
            },
            {
              max: 29,
              label: "Tinggi",
              color: "#c05621",
              summary:
                "Stres Anda cukup besar dan berpotensi mengganggu fungsi harian. Kami menyarankan bicara dengan psikolog dalam waktu dekat.",
            },
            {
              max: 40,
              label: "Sangat Tinggi",
              color: "#9b2c2c",
              summary:
                "Beban yang Anda rasakan sangat berat. Jangan menanggungnya sendiri—jadwalkan konseling secepatnya atau hubungi dukungan krisis bila muncul pikiran menyakiti diri.",
            },
          ],
        }),
      },
      {
        title: "Skrining Kecemasan",
        slug: "skrining-kecemasan",
        description:
          "Tujuh pertanyaan singkat untuk memetakan kecenderungan kecemasan dalam dua minggu terakhir.",
        duration: 3,
        questions: JSON.stringify(anxietyQuestions),
        scoring: JSON.stringify({
          maxScore: 21,
          categories: [
            {
              max: 4,
              label: "Minimal",
              color: "#0ea5e9",
              summary:
                "Kecenderungan kecemasan Anda rendah. Latihan kesadaran diri sederhana cukup untuk menjaga keseimbangan.",
            },
            {
              max: 9,
              label: "Ringan",
              color: "#b7791f",
              summary:
                "Kecemasan ringan terdeteksi. Teknik pernapasan, journaling, dan pembatasan konsumsi kafein bisa membantu.",
            },
            {
              max: 14,
              label: "Sedang",
              color: "#c05621",
              summary:
                "Kecemasan mulai memengaruhi keseharian. Pendampingan psikolog akan membantu Anda memutus siklus kekhawatiran.",
            },
            {
              max: 21,
              label: "Tinggi",
              color: "#9b2c2c",
              summary:
                "Skor Anda menunjukkan kecemasan yang cukup intens. Kami menyarankan asesmen lanjutan bersama psikolog klinis.",
            },
          ],
        }),
      },
      {
        title: "Pemetaan Minat Bakat",
        slug: "minat-bakat",
        description:
          "Delapan pertanyaan untuk memetakan kecenderungan peran dan lingkungan kerja yang paling mengembangkan Anda.",
        duration: 6,
        questions: JSON.stringify(talentQuestions),
        scoring: JSON.stringify({
          maxScore: 32,
          categories: [
            {
              max: 12,
              label: "Analitis & Terstruktur",
              color: "#0369a1",
              summary:
                "Anda berkembang dalam peran yang menuntut struktur, ketelitian, dan pengambilan keputusan berbasis data.",
            },
            {
              max: 20,
              label: "Kolaboratif & Empatik",
              color: "#0ea5e9",
              summary:
                "Anda bersinar saat bekerja dengan orang: mendampingi, mengajar, membangun relasi, dan menyelesaikan konflik.",
            },
            {
              max: 26,
              label: "Kreatif & Eksploratif",
              color: "#b7791f",
              summary:
                "Ide dan eksplorasi adalah bahan bakar Anda. Beri ruang untuk bereksperimen dan menciptakan hal baru.",
            },
            {
              max: 32,
              label: "Visioner & Memimpin",
              color: "#7b341e",
              summary:
                "Anda cenderung melihat gambaran besar dan menggerakkan orang. Kembangkan keterampilan delegasi dan empati.",
            },
          ],
        }),
      },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      {
        name: "Siti Rahmawati",
        age: 24,
        city: "Bandung",
        quote:
          "Awalnya saya ragu mencoba konseling online, tapi prosesnya sangat mudah dan nyaman. Psikolognya empatik dan memberi solusi praktis.",
        rating: 5,
      },
      {
        name: "Adit Pratama",
        age: 31,
        city: "Trenggalek",
        quote:
          "Konselingnya membantu saya memahami batasan kerja dan cara menjaga energi. Tim adminnya responsif dan prosesnya nyaman.",
        rating: 5,
      },
      {
        name: "Maya Kusuma",
        age: 38,
        city: "Surabaya",
        quote:
          "Asesmen minat bakat anak saya membuka mata. Sekarang kami tahu cara mendampingi belajar tanpa memaksa.",
        rating: 5,
      },
      {
        name: "Rizky Hidayat",
        age: 27,
        city: "Yogyakarta",
        quote:
          "Portalnya rapi. Jadwal, catatan sesi, dan tagihan ada di satu tempat. Terasa seperti layanan premium yang benar-benar terintegrasi.",
        rating: 4,
      },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        question: "Layanan kesehatan mental apa saja yang disediakan?",
        answer:
          "Kami menyediakan konseling individu, terapi pasangan, bimbingan keluarga, asesmen psikologi, hingga mediasi konflik. Semua layanan dirancang presisi dan berbasis data.",
        sort: 1,
      },
      {
        question: "Bagaimana saya tahu jika saya butuh konseling?",
        answer:
          "Jika Anda merasa kewalahan, produktivitas menurun, sulit tidur, atau ada ketegangan hubungan yang tak kunjung selesai, berdiskusi dengan profesional dapat sangat membantu. Tidak perlu menunggu sampai krisis.",
        sort: 2,
      },
      {
        question: "Apakah semua yang saya bagikan rahasia?",
        answer:
          "Ya, 100%. Kami mematuhi kode etik psikologi yang ketat. Data dan cerita Anda tersimpan terenkripsi dan hanya dapat diakses psikolog yang menangani Anda.",
        sort: 3,
      },
      {
        question: "Bagaimana cara memulai layanan?",
        answer:
          "Pilih layanan di halaman Klinik, tentukan psikolog dan jadwal, lalu selesaikan pembayaran. Admin kami akan mengonfirmasi sesi Anda melalui email dan WhatsApp.",
        sort: 4,
      },
      {
        question: "Apakah layanan tersedia online dan offline?",
        answer:
          "Keduanya tersedia. Sesi online melalui video call terenkripsi, atau tatap muka di klinik kami di Trenggalek.",
        sort: 5,
      },
      {
        question: "Bagaimana kebijakan pembatalan dan reschedule?",
        answer:
          "Anda dapat reschedule gratis hingga 24 jam sebelum sesi. Pembatalan kurang dari 24 jam dikenakan biaya administrasi 25% dari harga layanan.",
        sort: 6,
      },
    ],
  });

  await prisma.setting.createMany({
    data: [
      { key: "site.name", value: "Konseling Trenggalek" },
      { key: "site.tagline", value: "Kesehatan Mental di Ujung Jari" },
      { key: "contact.email", value: "rproselegends@gmail.com" },
      { key: "contact.phone", value: "+62 853-3526-8258" },
      { key: "contact.address", value: "Jl. Raya Trenggalek No. 123, Trenggalek, Jawa Timur 66311" },
    ],
  });

  const today = new Date();
  const iso = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };

  const bookingSeeds = [
    {
      code: "KT-24001",
      userId: client.id,
      guestName: client.name,
      guestEmail: client.email,
      guestPhone: client.phone!,
      serviceId: premium.id,
      psychologistId: psychologists[0].id,
      date: iso(2),
      time: "10:00",
      mode: "ONLINE",
      status: "CONFIRMED",
      paymentStatus: "PAID",
      amount: premium.price,
      invoiceStatus: "PAID",
    },
    {
      code: "KT-24002",
      userId: client.id,
      guestName: client.name,
      guestEmail: client.email,
      guestPhone: client.phone!,
      serviceId: klinik.id,
      psychologistId: psychologists[2].id,
      date: iso(-12),
      time: "15:30",
      mode: "OFFLINE",
      status: "COMPLETED",
      paymentStatus: "PAID",
      amount: klinik.price,
      invoiceStatus: "PAID",
    },
    {
      code: "KT-24003",
      guestName: "Dimas Aryo",
      guestEmail: "dimas@example.com",
      guestPhone: "081311223344",
      serviceId: psikotes.id,
      psychologistId: psychologists[3].id,
      date: iso(4),
      time: "09:00",
      mode: "OFFLINE",
      status: "PENDING",
      paymentStatus: "UNPAID",
      amount: psikotes.price,
      invoiceStatus: "UNPAID",
    },
    {
      code: "KT-24004",
      guestName: "Nadia Puspita",
      guestEmail: "nadia@example.com",
      guestPhone: "081355667788",
      serviceId: edukasi.id,
      psychologistId: psychologists[2].id,
      date: iso(7),
      time: "13:00",
      mode: "ONLINE",
      status: "CONFIRMED",
      paymentStatus: "PAID",
      amount: edukasi.price,
      invoiceStatus: "PAID",
    },
  ];

  let invoiceNo = 24001;
  // Sebar tanggal pembayaran agar grafik pendapatan 7 hari terisi variatif.
  const paidAtOffset: Record<string, number> = {
    "KT-24001": -2,
    "KT-24002": -5,
    "KT-24004": -1,
  };

  for (const seed of bookingSeeds) {
    const { invoiceStatus, ...bookingData } = seed;
    const booking = await prisma.booking.create({ data: bookingData });
    await prisma.invoice.create({
      data: {
        number: `INV-${invoiceNo++}`,
        bookingId: booking.id,
        amount: booking.amount,
        status: invoiceStatus,
        paidAt:
          invoiceStatus === "PAID"
            ? new Date(Date.now() + (paidAtOffset[seed.code] ?? 0) * 864e5)
            : null,
        provider: "mock",
      },
    });
  }

  const assessments = await prisma.assessment.findMany();
  const stress = assessments.find((a) => a.slug === "tingkat-stres")!;
  const anxiety = assessments.find((a) => a.slug === "skrining-kecemasan")!;

  await prisma.assessmentResult.createMany({
    data: [
      {
        assessmentId: stress.id,
        userId: client.id,
        answers: JSON.stringify({ s1: 2, s2: 3, s3: 2, s4: 3, s5: 2, s6: 1, s7: 2, s8: 1, s9: 3, s10: 2 }),
        score: 21,
        category: "Tinggi",
        summary:
          "Stres Anda cukup besar dan berpotensi mengganggu fungsi harian. Kami menyarankan bicara dengan psikolog dalam waktu dekat.",
        createdAt: new Date(Date.now() - 6 * 864e5),
      },
      {
        assessmentId: anxiety.id,
        userId: client.id,
        answers: JSON.stringify({ a1: 2, a2: 1, a3: 2, a4: 2, a5: 1, a6: 2, a7: 1 }),
        score: 11,
        category: "Sedang",
        summary:
          "Kecemasan mulai memengaruhi keseharian. Pendampingan psikolog akan membantu Anda memutus siklus kekhawatiran.",
        createdAt: new Date(Date.now() - 3 * 864e5),
      },
    ],
  });

  const moods = [
    { offset: -6, mood: 2, note: "Banyak pikiran, sulit tidur." },
    { offset: -5, mood: 3, note: "Jalan pagi, lumayan lebih ringan." },
    { offset: -4, mood: 3, note: "Deadline, tapi masih terkendali." },
    { offset: -3, mood: 4, note: "Sesi konseling membantu." },
    { offset: -2, mood: 4, note: "Makan siang bareng teman." },
    { offset: -1, mood: 5, note: "Hari yang tenang." },
  ];
  for (const m of moods) {
    await prisma.moodEntry.create({
      data: { userId: client.id, date: iso(m.offset), mood: m.mood, note: m.note },
    });
  }

  await prisma.contactMessage.createMany({
    data: [
      {
        name: "Fajar Nugroho",
        email: "fajar@example.com",
        phone: "081200011122",
        service: "Psikotes",
        message:
          "Saya ingin bertanya tentang jadwal psikotes dan hasil laporan yang diberikan setelah asesmen.",
        status: "NEW",
      },
      {
        name: "Larasati",
        email: "laras@example.com",
        phone: "081233344455",
        service: "Konseling Individu",
        message: "Apakah tersedia sesi malam setelah pukul 19.00 untuk konseling online?",
        status: "READ",
      },
    ],
  });

  await prisma.newsletter.createMany({
    data: [{ email: "siti@example.com" }, { email: "dimas@example.com" }],
  });

  await prisma.activityLog.createMany({
    data: [
      { userId: superadmin.id, action: "SEED_DATABASE", meta: "Inisialisasi data demo" },
      { userId: client.id, action: "BOOKING_CREATED", meta: "KT-24001" },
    ],
  });

  console.log("✅ Seed selesai.");
  console.log("   Super Admin : superadmin@konselingtrenggalek.id / superadmin123");
  console.log("   Admin       : admin@konselingtrenggalek.id / admin123");
  console.log("   Psikolog    : psikolog@konselingtrenggalek.id / psikolog123");
  console.log("   Klien       : siti@example.com / client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
