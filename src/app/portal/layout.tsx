import { requireUser } from "@/lib/auth";
import { PortalNav } from "@/components/portal-nav";
import { getBranding } from "@/lib/settings";
import { brandingCssVars } from "@/lib/branding";

/** Portal berisi query per pengguna; jalankan dekat database (Stockholm). */
export const preferredRegion = "arn1";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, branding] = await Promise.all([requireUser(), getBranding()]);

  return (
    <div className="min-h-screen bg-surface/60">
      <style dangerouslySetInnerHTML={{ __html: brandingCssVars(branding) }} />
      <PortalNav
        user={{ name: user.name, email: user.email }}
        branding={branding}
      />
      <div className="lg:pl-[250px]">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
