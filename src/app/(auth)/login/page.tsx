import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Masuk Portal" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(isStaffRole(user.role) ? "/admin" : "/portal");

  return (
    <AuthShell
      title="Selamat datang kembali."
      subtitle="Masuk untuk mengelola jadwal, hasil asesmen, dan tagihan Anda dalam satu tempat."
      footer={
        <>
          Dengan masuk, Anda menyetujui{" "}
          <Link href="/syarat-ketentuan" className="underline underline-offset-2">
            syarat layanan
          </Link>{" "}
          kami.
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
