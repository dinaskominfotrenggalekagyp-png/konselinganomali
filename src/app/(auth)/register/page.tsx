import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";
import { getCurrentUser } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Daftar Akun" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(isStaffRole(user.role) ? "/admin" : "/portal");

  return (
    <AuthShell
      title="Mulai perjalanan Anda."
      subtitle="Buat akun gratis untuk menyimpan hasil asesmen, memesan sesi, dan memantau progres wellness."
      footer="Butuh bantuan mendaftar? Hubungi admin di WhatsApp."
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
