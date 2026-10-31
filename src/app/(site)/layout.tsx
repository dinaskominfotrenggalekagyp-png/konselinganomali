import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSession } from "@/lib/auth";
import { getBranding } from "@/lib/settings";
import { brandingCssVars } from "@/lib/branding";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, branding] = await Promise.all([getSession(), getBranding()]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: brandingCssVars(branding) }} />
      <SiteHeader
        user={session ? { name: session.name, role: session.role } : null}
        branding={branding}
      />
      <main className="min-h-screen pt-[74px]">{children}</main>
      <SiteFooter branding={branding} />
    </>
  );
}
