import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient({
  datasourceUrl:
    process.env.DATABASE_URL ?? "mysql://root:@127.0.0.1:3306/koseling_tgx",
});

const ACCOUNTS = [
  {
    name: "Super Admin Konseling Trenggalek",
    email: "superadmin@konselingtrenggalek.id",
    password: "superadmin123",
    phone: "081200000001",
    role: "SUPERADMIN",
  },
  {
    name: "Admin Konseling Trenggalek",
    email: "admin@konselingtrenggalek.id",
    password: "admin123",
    phone: "081234567890",
    role: "ADMIN",
  },
  {
    name: "Dr. Anindya Prameswari, M.Psi",
    email: "psikolog@konselingtrenggalek.id",
    password: "psikolog123",
    phone: "081200000002",
    role: "PSYCHOLOGIST",
  },
];

async function main() {
  for (const account of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await db.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        phone: account.phone,
        role: account.role,
        passwordHash,
      },
      create: {
        name: account.name,
        email: account.email,
        phone: account.phone,
        role: account.role,
        passwordHash,
      },
    });
    console.log(`✓ ${account.role.padEnd(12)} ${account.email} / ${account.password}`);
  }

  // Bersihkan seluruh data layanan korporat lama.
  const corporate = await db.service.findFirst({
    where: { slug: "solusi-korporat" },
    select: { id: true, name: true },
  });

  if (corporate) {
    const bookings = await db.booking.findMany({
      where: { serviceId: corporate.id },
      select: { id: true },
    });
    if (bookings.length > 0) {
      await db.invoice.deleteMany({
        where: { bookingId: { in: bookings.map((booking) => booking.id) } },
      });
      await db.booking.deleteMany({ where: { serviceId: corporate.id } });
    }
    await db.service.delete({ where: { id: corporate.id } });
    console.log(`✓ Layanan korporat dihapus: ${corporate.name}`);
  }

  await db.article.updateMany({
    where: { category: "Korporat" },
    data: { category: "Karier" },
  });
  await db.contactMessage.updateMany({
    where: { service: "EAP Korporat" },
    data: { service: "Psikotes" },
  });

  console.log("✓ Akun & data korporat selesai diperbarui.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
