import { requireStaff } from "@/lib/auth";
import { isAdminRole, normalizeRole } from "@/lib/roles";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin-nav";
import { AdminLive } from "@/components/admin-live";
import { getBranding } from "@/lib/settings";
import { brandingCssVars } from "@/lib/branding";

/**
 * Admin console berisi banyak query langsung (tanpa cache). Supabase berada di
 * Stockholm, jadi khusus area admin/portal function dijalankan di region yang
 * sama (`arn1`) agar setiap query hanya ~beberapa ms, bukan ~200 ms.
 * Halaman publik tetap di `sin1` (lihat vercel.json) agar dekat pengunjung.
 */
export const preferredRegion = "arn1";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();
  const canViewMessages = isAdminRole(user.role);

  const psychologist =
    user.role === "PSYCHOLOGIST"
      ? await db.psychologist.findUnique({
          where: { userId: user.id },
          select: { id: true },
        })
      : null;

  const bookingScope =
    user.role === "PSYCHOLOGIST"
      ? { psychologistId: psychologist?.id ?? "__none__" }
      : {};

  const [pendingBookings, newMessages, branding] = await Promise.all([
    db.booking.count({ where: { status: "PENDING", ...bookingScope } }),
    canViewMessages
      ? db.contactMessage.count({ where: { status: "NEW" } })
      : Promise.resolve(0),
    getBranding(),
  ]);

  return (
    <div className="min-h-screen bg-surface/70">
      <style dangerouslySetInnerHTML={{ __html: brandingCssVars(branding) }} />
      <AdminNav
        user={{ name: user.name, email: user.email, role: normalizeRole(user.role) }}
        branding={branding}
      />
      <div className="lg:pl-[240px]">
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
      <AdminLive
        initialCounts={{ bookings: pendingBookings, messages: newMessages }}
        showMessages={canViewMessages}
      />
    </div>
  );
}
