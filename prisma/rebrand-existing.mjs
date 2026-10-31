/**
 * Rebrand data lama (non-destruktif):
 * - Warna Citta -> Konseling Trenggalek
 * - palet hijau -> biru langit
 * - kontak & alamat Trenggalek
 *
 * Jalankan: npm run db:rebrand
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COLOR_MAP = {
  "#0c732a": "#0ea5e9",
  "#0b5c32": "#0369a1",
  "#084324": "#0c4a6e",
  "#e8f5ed": "#e0f2fe",
  "#6fe193": "#7dd3fc",
  "#128c3b": "#38bdf8",
};

const TEXT_REPLACEMENTS = [
  ["Warna Citta", "Konseling Trenggalek"],
  ["warna citta", "konseling trenggalek"],
  ["warnacitta.id", "konselingtrenggalek.id"],
  ["halo@konselingtrenggalek.id", "rproselegends@gmail.com"],
  ["Jl. Sudirman No. 123, Jakarta Selatan 12190", "Jl. Raya Trenggalek No. 123, Trenggalek, Jawa Timur 66311"],
  ["Jl. Sudirman No. 123, Jakarta Selatan", "Jl. Raya Trenggalek No. 123, Trenggalek"],
  ["Jl. Sudirman No. 123", "Jl. Raya Trenggalek No. 123"],
  ["Jakarta Selatan", "Trenggalek"],
  ["+62 21 5000 1234", "+62 853-3526-8258"],
  ["+62 812 3456 7890", "+62 853-3526-8258"],
  ["PT Solusi Mental Indonesia", "Konseling Trenggalek"],
];

function rebrandText(value) {
  if (typeof value !== "string") return value;
  return TEXT_REPLACEMENTS.reduce((acc, [from, to]) => acc.split(from).join(to), value);
}

async function main() {
  console.log("🔄 Rebranding data Konseling Trenggalek...");

  const settings = [
    { key: "site.name", value: "Konseling Trenggalek" },
    { key: "site.tagline", value: "Kesehatan Mental di Ujung Jari" },
    { key: "contact.email", value: "rproselegends@gmail.com" },
    { key: "contact.phone", value: "+62 853-3526-8258" },
    {
      key: "contact.address",
      value: "Jl. Raya Trenggalek No. 123, Trenggalek, Jawa Timur 66311",
    },
  ];
  for (const item of settings) {
    await prisma.setting.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: item,
    });
  }
  console.log(`✓ ${settings.length} pengaturan situs diperbarui`);

  // Akun admin lama -> email baru (tanpa menghapus data / password)
  const oldEmail = "admin@warnacitta.id";
  const newEmail = "admin@konselingtrenggalek.id";
  const oldAdmin = await prisma.user.findUnique({ where: { email: oldEmail } });
  const newAdmin = await prisma.user.findUnique({ where: { email: newEmail } });
  if (oldAdmin && !newAdmin) {
    await prisma.user.update({
      where: { id: oldAdmin.id },
      data: { email: newEmail, name: rebrandText(oldAdmin.name) },
    });
    console.log(`✓ Akun admin dipindahkan: ${oldEmail} -> ${newEmail}`);
  } else if (oldAdmin) {
    console.log(`• Akun ${newEmail} sudah ada, email admin lama dibiarkan`);
  }

  // Kode booking lama WC- -> KT-
  try {
    const renamed = await prisma.$executeRawUnsafe(
      "UPDATE `Booking` SET `code` = REPLACE(`code`, 'WC-', 'KT-') WHERE `code` LIKE 'WC-%'"
    );
    if (renamed > 0) console.log(`✓ ${renamed} kode booking diperbarui: WC- -> KT-`);
  } catch (error) {
    console.log("• Kode booking lama tidak diubah:", error.message);
  }

  // Warna kategori asesmen
  const assessments = await prisma.assessment.findMany();
  let assessmentUpdates = 0;
  for (const assessment of assessments) {
    try {
      const scoring = JSON.parse(assessment.scoring);
      let changed = false;
      if (Array.isArray(scoring.categories)) {
        scoring.categories = scoring.categories.map((category) => {
          const next = COLOR_MAP[category.color];
          if (next) {
            changed = true;
            return { ...category, color: next };
          }
          return category;
        });
      }
      if (changed) {
        await prisma.assessment.update({
          where: { id: assessment.id },
          data: { scoring: JSON.stringify(scoring) },
        });
        assessmentUpdates += 1;
      }
    } catch {
      // scoring bukan JSON valid, lewati
    }
  }
  console.log(`✓ ${assessmentUpdates} konfigurasi warna asesmen diperbarui`);

  // Teks yang masih menyebut merek/alamat lama
  const faqs = await prisma.faq.findMany();
  for (const faq of faqs) {
    const question = rebrandText(faq.question);
    const answer = rebrandText(faq.answer);
    if (question !== faq.question || answer !== faq.answer) {
      await prisma.faq.update({ where: { id: faq.id }, data: { question, answer } });
    }
  }

  const articles = await prisma.article.findMany();
  for (const article of articles) {
    const title = rebrandText(article.title);
    const excerpt = rebrandText(article.excerpt);
    const content = rebrandText(article.content);
    const author = rebrandText(article.author);
    if (
      title !== article.title ||
      excerpt !== article.excerpt ||
      content !== article.content ||
      author !== article.author
    ) {
      await prisma.article.update({
        where: { id: article.id },
        data: { title, excerpt, content, author },
      });
    }
  }

  const services = await prisma.service.findMany();
  for (const service of services) {
    const tagline = rebrandText(service.tagline);
    const description = rebrandText(service.description);
    if (tagline !== service.tagline || description !== service.description) {
      await prisma.service.update({
        where: { id: service.id },
        data: { tagline, description },
      });
    }
  }

  const psychologists = await prisma.psychologist.findMany();
  for (const psychologist of psychologists) {
    const bio = rebrandText(psychologist.bio);
    if (bio !== psychologist.bio) {
      await prisma.psychologist.update({ where: { id: psychologist.id }, data: { bio } });
    }
  }

  const testimonials = await prisma.testimonial.findMany();
  for (const testimonial of testimonials) {
    const quote = rebrandText(testimonial.quote);
    const city = testimonial.city === "Jakarta" ? "Trenggalek" : testimonial.city;
    if (quote !== testimonial.quote || city !== testimonial.city) {
      await prisma.testimonial.update({
        where: { id: testimonial.id },
        data: { quote, city },
      });
    }
  }

  console.log("✅ Rebranding selesai tanpa menghapus data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
